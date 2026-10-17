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
import java.io.File;
import java.io.FileOutputStream;
import android.util.AtomicFile;
import java.nio.charset.StandardCharsets;

/**
 * Scout PRO V225: exporta JSON mediante ACTION_CREATE_DOCUMENT.
 * O Android oferece o seletor de destino; o WebView nunca depende de blob: downloads.
 * O arquivo só é confirmado após gravação bem-sucedida.
 */
@CapacitorPlugin(name="ScoutFileExport")
public class ScoutFileExportPlugin extends Plugin {
    private static final int MAX_BYTES = 8 * 1024 * 1024;

    // Cópia local adicional das restrições para recuperá-las após limpeza do WebView.
    // Não é sincronização entre Android e Windows; depende da mesma instalação Android.
    private static final String ROSTER_PREFS = "scout_roster_protected_v225";
    private static final String ROSTER_KEY = "black_roster_record";

    @PluginMethod
    public void storeRoster(PluginCall call) {
        String record = call.getString("record");
        if (record == null || record.length() > 150000) {
            call.reject("Dados de restrição inválidos.");
            return;
        }
        try {
            org.json.JSONObject parsed = new org.json.JSONObject(record);
            if (!parsed.has("excluded") || !parsed.has("schema")) throw new IllegalArgumentException("Sem identificação");
            boolean persisted = getContext().getSharedPreferences(ROSTER_PREFS, 0).edit()
                .putString(ROSTER_KEY, record).commit();
            if (!persisted) throw new IllegalStateException("Armazenamento do Android recusou a gravação.");
            JSObject result = new JSObject();
            result.put("status", "saved");
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Falha ao guardar restrições no Android: " + ex.getMessage());
        }
    }

    @PluginMethod
    public void loadRoster(PluginCall call) {
        String record = getContext().getSharedPreferences(ROSTER_PREFS, 0).getString(ROSTER_KEY, "");
        JSObject result = new JSObject();
        result.put("record", record);
        call.resolve(result);
    }


    // Cópia automática privada e transacional; não substitui o JSON externo.
    private AtomicFile snapshotFile() {
        return new AtomicFile(new File(getContext().getFilesDir(), "craque-v226-backup.json"));
    }

    @PluginMethod
    public void storeSnapshot(PluginCall call) {
        String record=call.getString("record");
        if(record==null||record.length()<5||record.getBytes(StandardCharsets.UTF_8).length>MAX_BYTES) {
            call.reject("Snapshot vazio ou acima de 8 MB.");return;
        }
        try {
            org.json.JSONObject data=new org.json.JSONObject(record);
            if(!"craque-tatico-backup-v2".equals(data.optString("format"))||!data.has("digest")||!data.has("items"))
                throw new IllegalArgumentException("Estrutura de backup inválida");
            AtomicFile target=snapshotFile();
            FileOutputStream stream=target.startWrite();
            try{
                stream.write(record.getBytes(StandardCharsets.UTF_8));
                target.finishWrite(stream);
            }catch(Exception e){target.failWrite(stream);throw e;}
            JSObject out=new JSObject();out.put("status","saved");call.resolve(out);
        }catch(Exception ex){call.reject("Não foi possível salvar a cópia automática: "+ex.getMessage());}
    }

    @PluginMethod
    public void loadSnapshot(PluginCall call) {
        try {
            AtomicFile target=snapshotFile();String data="";
            if(target.getBaseFile().exists())
                data=new String(target.readFully(), StandardCharsets.UTF_8);
            JSObject result=new JSObject();result.put("record",data);call.resolve(result);
        }catch(Exception ex){call.reject("Falha ao recuperar a cópia automática: "+ex.getMessage());}
    }

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
