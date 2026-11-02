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
import java.io.InputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
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

    // V226: snapshots redundantes no diretório privado; nunca em armazenamento público.
    private File backupFile(int index) {
        return new File(getContext().getFilesDir(), "craque-tatico-backup-" + index + ".json");
    }

    @PluginMethod
    public void storeBackup(PluginCall call) {
        String content = call.getString("content");
        if (content == null || content.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) {
            call.reject("Backup vazio ou maior que 8 MB."); return;
        }
        try {
            org.json.JSONObject obj = new org.json.JSONObject(content);
            if (!obj.has("items") || !obj.has("format")) throw new IllegalArgumentException("Backup inválido");
            File staged = new File(getContext().getFilesDir(), "craque-backup-pendente.tmp");
            try (FileOutputStream out = new FileOutputStream(staged)) {
                out.write(content.getBytes(StandardCharsets.UTF_8));
                out.getFD().sync();
            }
            // Um arquivo íntegro já está em disco antes de girar as cópias antigas.
            for (int i = 2; i > 0; i--) {
                File older = backupFile(i-1), next = backupFile(i);
                if (older.exists()) {
                    if (next.exists() && !next.delete()) throw new IllegalStateException("Não foi possível girar backup antigo");
                    if (!older.renameTo(next)) throw new IllegalStateException("Não foi possível guardar backup anterior");
                }
            }
            if (!staged.renameTo(backupFile(0))) throw new IllegalStateException("Não foi possível ativar backup");
            JSObject done = new JSObject();done.put("status","saved");done.put("bytes",content.length());call.resolve(done);
        } catch(Exception e) { call.reject("Backup local falhou: "+e.getMessage()); }
    }

    @PluginMethod
    public void backupInfo(PluginCall call) {
        JSObject result=new JSObject();
        File file=backupFile(0); result.put("status",file.exists()?"available":"empty");
        result.put("lastModified",file.exists()?file.lastModified():0);
        result.put("bytes",file.exists()?file.length():0);call.resolve(result);
    }

    @PluginMethod
    public void openJson(PluginCall call) {
        try {
            Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT);
            pick.addCategory(Intent.CATEGORY_OPENABLE);
            pick.setType("application/json");
            pick.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivityForResult(call,pick,"onBackupSelected");
        } catch(Exception e) {call.reject("Não foi possível selecionar o backup: "+e.getMessage());}
    }

    @ActivityCallback
    private void onBackupSelected(PluginCall call, ActivityResult result) {
        if(call==null)return;
        if(result==null||result.getResultCode()!=Activity.RESULT_OK||
           result.getData()==null||result.getData().getData()==null){
            JSObject cancelled=new JSObject();cancelled.put("status","cancelled");call.resolve(cancelled);return;
        }
        try(InputStream in=getContext().getContentResolver().openInputStream(result.getData().getData());
            ByteArrayOutputStream out=new ByteArrayOutputStream()){
            if(in==null)throw new IllegalStateException("Arquivo indisponível");
            byte[] buffer=new byte[8192];int read;
            while((read=in.read(buffer))!=-1){
                if(out.size()+read>MAX_BYTES)throw new IllegalArgumentException("Arquivo acima de 8 MB");
                out.write(buffer,0,read);
            }
            String content=out.toString("UTF-8");
            new org.json.JSONObject(content); // Rejeitar JSON malformado na origem.
            JSObject selected=new JSObject();selected.put("status","loaded");selected.put("content",content);
            call.resolve(selected);
        }catch(Exception e){call.reject("Falha na leitura do backup: "+e.getMessage());}
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
    // V384: somente o recurso conhecido do próprio APK, salvo pelo seletor SAF.
    @PluginMethod
    public void saveGuidePdf(PluginCall call) {
        try {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/pdf");
            intent.putExtra(Intent.EXTRA_TITLE, "Craque-Tatico-Manual-2027.pdf");
            startActivityForResult(call, intent, "onGuidePdfCreated");
        } catch (Exception e) { call.reject("Não foi possível escolher o destino do e-book: " + e.getMessage()); }
    }

    @ActivityCallback
    private void onGuidePdfCreated(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result == null || result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            JSObject cancelled = new JSObject(); cancelled.put("status", "cancelled"); call.resolve(cancelled); return;
        }
        try (InputStream input = getContext().getAssets().open("public/manual-2027/manual-2027.pdf");
             OutputStream output = getContext().getContentResolver().openOutputStream(result.getData().getData(), "w")) {
            if (output == null) throw new IllegalStateException("O destino não aceitou a gravação.");
            byte[] buffer = new byte[8192]; int count; int total = 0;
            while ((count = input.read(buffer)) != -1) {
                total += count; if (total > MAX_BYTES) throw new IllegalArgumentException("E-book acima de 8 MB");
                output.write(buffer, 0, count);
            }
            if (total == 0) throw new IllegalStateException("E-book vazio");
            output.flush(); JSObject saved = new JSObject(); saved.put("status", "saved"); saved.put("bytes", total); call.resolve(saved);
        } catch (Exception e) { call.reject("Não foi possível salvar o e-book: " + e.getMessage()); }
    }

}
