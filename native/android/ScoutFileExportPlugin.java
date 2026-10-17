package br.com.scoutpro.offline;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Scout PRO V225: exporta JSON mediante ACTION_CREATE_DOCUMENT.
 * O Android oferece o seletor de destino; o WebView nunca depende de blob: downloads.
 * O arquivo só é confirmado após gravação bem-sucedida.
 */
@CapacitorPlugin(name="ScoutFileExport")
public class ScoutFileExportPlugin extends Plugin {
    private static final int MAX_BYTES = 8 * 1024 * 1024;

    @PluginMethod
    public void saveJson(PluginCall call) {
        String content = call.getString("content");
        String requested = call.getString("fileName");
        if (content == null || requested == null) {
            call.reject("Faltam os dados ou o nome do arquivo JSON.");
            return;
        }
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        if (bytes.length == 0 || bytes.length > MAX_BYTES) {
            call.reject("Arquivo JSON vazio ou acima de 8 MB.");
            return;
        }
        try {
            // Não expor caminhos arbitrários nem permitir nomes com diretórios.
            String fileName = requested.replaceAll("[^a-zA-Z0-9._-]", "_");
            if (fileName.length() > 100) fileName = fileName.substring(0, 95) + ".json";
            if (!fileName.endsWith(".json")) fileName += ".json";
            if (fileName.equals(".json")) {
                call.reject("Nome de arquivo inválido.");
                return;
            }
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, fileName);
            startActivityForResult(call, intent, "onDocumentCreated");
        } catch (Exception ex) {
            call.reject("Não foi possível abrir o seletor de arquivos: " + ex.getMessage());
        }
    }

    @ActivityCallback
    private void onDocumentCreated(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result == null || result.getResultCode() != Activity.RESULT_OK ||
            result.getData() == null || result.getData().getData() == null) {
            JSObject cancelled = new JSObject();
            cancelled.put("status", "cancelled");
            call.resolve(cancelled);
            return;
        }
        Uri destination = result.getData().getData();
        String content = call.getString("content");
        if (content == null) {
            call.reject("Dados de exportação não disponíveis ao salvar.");
            return;
        }
        try (OutputStream output = getContext().getContentResolver().openOutputStream(destination, "w")) {
            if (output == null) throw new IllegalStateException("O destino não aceitou a gravação.");
            byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
            if (bytes.length == 0 || bytes.length > MAX_BYTES) throw new IllegalArgumentException("Tamanho JSON inválido.");
            output.write(bytes);
            output.flush();
            JSObject saved = new JSObject();
            saved.put("status", "saved");
            saved.put("bytes", bytes.length);
            call.resolve(saved);
        } catch (Exception ex) {
            call.reject("Não foi possível gravar o JSON no destino escolhido: " + ex.getMessage());
        }
    }
}
