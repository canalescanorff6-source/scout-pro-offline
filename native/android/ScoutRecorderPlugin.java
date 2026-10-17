package br.com.scoutpro.offline;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name="ScoutRecorder")
public class ScoutRecorderPlugin extends Plugin {
    @PluginMethod
    public void startRecording(PluginCall call) {
        if (Build.VERSION.SDK_INT < 29) {
            call.reject("Gravação interna exige Android 10 ou posterior.");
            return;
        }
        if (ScoutRecorderService.isRecording()) {
            call.reject("Já existe uma partida sendo gravada.");
            return;
        }
        try {
            android.media.projection.MediaProjectionManager manager =
                (android.media.projection.MediaProjectionManager) getContext().getSystemService(
                    android.content.Context.MEDIA_PROJECTION_SERVICE);
            if (manager == null) {
                call.reject("Sistema de gravação não disponível neste aparelho.");
                return;
            }
            // Android 14+: o token nunca pode ser reutilizado em sessões seguintes.
            startActivityForResult(call, manager.createScreenCaptureIntent(), "onProjectionGranted");
        } catch (Exception ex) {
            call.reject("Não foi possível solicitar a gravação: " + ex.getMessage());
        }
    }

    @ActivityCallback
    private void onProjectionGranted(PluginCall call, android.app.ActivityResult result) {
        if (call == null) return;
        if (result == null || result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("Captura cancelada. Nenhuma gravação foi iniciada.");
            return;
        }
        try {
            Intent intent = new Intent(getContext(), ScoutRecorderService.class);
            intent.setAction(ScoutRecorderService.START);
            intent.putExtra(ScoutRecorderService.PROJECTION_RESULT_CODE, result.getResultCode());
            intent.putExtra(ScoutRecorderService.PROJECTION_RESULT_INTENT, result.getData());
            androidx.core.content.ContextCompat.startForegroundService(getContext(), intent);
            JSObject ok = new JSObject();
            ok.put("status", "requested");
            ok.put("message", "Autorização concedida. O serviço vai iniciar a gravação. Escolha a tela inteira para incluir o eFootball.");
            call.resolve(ok);
        } catch (Exception ex) {
            call.reject("Falha ao iniciar serviço de gravação: " + ex.getMessage());
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("recording", ScoutRecorderService.isRecording());
        String value = getContext().getSharedPreferences(ScoutRecorderService.PREFS, 0)
            .getString(ScoutRecorderService.LAST_URI, "");
        result.put("hasVideo", !value.isEmpty());
        result.put("lastVideo", value);
        result.put("resolution", "1280x720");
        result.put("frameRate", 30);
        result.put("maxMinutes", 15);
        call.resolve(result);
    }

    @PluginMethod
    public void stopRecording(PluginCall call) {
        if (!ScoutRecorderService.isRecording()) {
            call.reject("Nenhuma captura ativa. Se ela acabou de iniciar, aguarde um segundo.");
            return;
        }
        try {
            Intent intent = new Intent(getContext(), ScoutRecorderService.class);
            intent.setAction(ScoutRecorderService.STOP);
            getContext().startService(intent);
            JSObject ok = new JSObject();
            ok.put("status", "stopping");
            ok.put("message", "Encerrando MP4. Aguarde a finalização antes de compartilhar.");
            call.resolve(ok);
        } catch (Exception ex) {
            call.reject("Não foi possível finalizar o vídeo: " + ex.getMessage());
        }
    }

    @PluginMethod
    public void shareRecording(PluginCall call) {
        if (ScoutRecorderService.isRecording()) {
            call.reject("Encerre a captura antes de compartilhar o arquivo.");
            return;
        }
        try {
            String value = getContext().getSharedPreferences(ScoutRecorderService.PREFS, 0)
                .getString(ScoutRecorderService.LAST_URI, "");
            if (value.isEmpty()) {
                call.reject("Não há vídeo pronto. Grave uma partida antes de compartilhar.");
                return;
            }
            Uri uri = Uri.parse(value);
            try (android.os.ParcelFileDescriptor fd = getContext().getContentResolver()
                    .openFileDescriptor(uri, "r")) {
                if (fd == null) throw new java.io.IOException("Arquivo MP4 não encontrado");
            }
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("video/mp4");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_TEXT,
                "Partida eFootball 2027 — analisar movimentação, tabela, decisões e erros; conferir escalação no Scout PRO.");
            send.setClipData(ClipData.newUri(getContext().getContentResolver(), "Partida Scout PRO", uri));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(send, "Compartilhar partida para análise"));
            JSObject result = new JSObject();
            result.put("status", "share_chooser_opened");
            result.put("message", "Escolha ChatGPT (quando disponível) e confirme o envio do MP4.");
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Não foi possível abrir o vídeo: " + ex.getMessage());
        }
    }
}
