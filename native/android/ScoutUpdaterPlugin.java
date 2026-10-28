package br.com.scoutpro.offline;

import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.os.ParcelFileDescriptor;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CapacitorPlugin(name="ScoutUpdater")
public class ScoutUpdaterPlugin extends Plugin {
    private static final String RELEASE_PREFIX =
        "https://github.com/canalescanorff6-source/scout-pro-offline/releases/download/";
    private static final String APK_NAME = "ScoutPRO-Android.apk";
    private static final long MAX_APK = 200L * 1024L * 1024L;
    private static final Pattern RELEASE = Pattern.compile(
        "^https://github\\.com/canalescanorff6-source/scout-pro-offline/releases/download/v[0-9]+\\.[0-9]+\\.[0-9]+/ScoutPRO-Android\\.apk$");
    private static final Set<String> REDIRECT_HOSTS = new HashSet<>(Arrays.asList(
        "github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"));
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy = new AtomicBoolean(false);
    private File apkFile() {return new File(new File(getContext().getCacheDir(),"scout-updates"),APK_NAME);}
    private static String fingerprint(Signature sig) throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(sig.toByteArray());
        StringBuilder s = new StringBuilder();for(byte b:hash)s.append(String.format(Locale.ROOT,"%02x",b&0xff));
        return s.toString();
    }
    @SuppressWarnings("deprecation")
    private static PackageInfo info(PackageManager pm,String packageName) throws Exception {
        int flag=Build.VERSION.SDK_INT>=28?PackageManager.GET_SIGNING_CERTIFICATES:PackageManager.GET_SIGNATURES;
        return pm.getPackageInfo(packageName,flag);
    }
    @SuppressWarnings("deprecation")
    private PackageInfo archive(File file) {
        int flag=Build.VERSION.SDK_INT>=28?PackageManager.GET_SIGNING_CERTIFICATES:PackageManager.GET_SIGNATURES;
        return getContext().getPackageManager().getPackageArchiveInfo(file.getAbsolutePath(),flag);
    }
    @SuppressWarnings("deprecation")
    private static Signature[] sigs(PackageInfo p){
        if(p==null)return new Signature[0];
        if(Build.VERSION.SDK_INT>=28 && p.signingInfo!=null)return p.signingInfo.getApkContentsSigners();
        return p.signatures==null?new Signature[0]:p.signatures;
    }
    private static long code(PackageInfo p){
        if(Build.VERSION.SDK_INT>=28)return p.getLongVersionCode();
        return p.versionCode;
    }
    @PluginMethod
    public void getInstalledInfo(PluginCall call){
        try {
            PackageInfo installed=info(getContext().getPackageManager(),getContext().getPackageName());
            JSObject result=new JSObject();
            result.put("packageName",installed.packageName);
            result.put("versionName",installed.versionName);
            result.put("versionCode",code(installed));
            Signature[] signatures=sigs(installed);
            result.put("signatureSha256",signatures.length>0?fingerprint(signatures[0]):"unavailable");
            call.resolve(result);
        } catch(Exception e){call.reject("Não foi possível identificar o APK instalado: "+e.getMessage());}
    }
    private HttpURLConnection connect(String raw)throws Exception{
        URL url=new URL(raw);
        for(int i=0;i<7;i++){
            if(!"https".equalsIgnoreCase(url.getProtocol())||!REDIRECT_HOSTS.contains(url.getHost().toLowerCase(Locale.ROOT)))
                throw new IOException("Redirecionamento fora do GitHub bloqueado");
            HttpURLConnection conn=(HttpURLConnection)url.openConnection();
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(15000);conn.setReadTimeout(35000);
            conn.setRequestProperty("User-Agent","ScoutPRO-Android-Updater/102");
            conn.connect();int status=conn.getResponseCode();
            if(status==301||status==302||status==303||status==307||status==308){
                String target=conn.getHeaderField("Location");conn.disconnect();
                if(target==null)throw new IOException("Redirecionamento sem endereço");
                url=new URL(url,target);continue;
            }
            if(status!=200){conn.disconnect();throw new IOException("GitHub HTTP "+status);}
            return conn;
        }
        throw new IOException("Redirecionamentos excessivos");
    }
    private String expectedChecksum(String apkUrl)throws Exception{
        HttpURLConnection conn=connect(apkUrl+".sha256");
        try(InputStream input=new BufferedInputStream(conn.getInputStream())){
            if(conn.getContentLengthLong()>4096)throw new IOException("Checksum inválido");
            byte[] buf=new byte[4096];int n,total=0;StringBuilder sb=new StringBuilder();
            while((n=input.read(buf))!=-1){total+=n;if(total>4096)throw new IOException("Checksum excede limite");sb.append(new String(buf,0,n,StandardCharsets.US_ASCII));}
            Matcher matcher=Pattern.compile("(?im)^([a-f0-9]{64})\\s+\\*?ScoutPRO-Android\\.apk\\s*$").matcher(sb.toString().trim());
            if(!matcher.find())throw new IOException("Assinatura SHA256 da release ausente");
            return matcher.group(1).toLowerCase(Locale.ROOT);
        }finally{conn.disconnect();}
    }
    private static String hex(byte[] hash){
        StringBuilder sb=new StringBuilder();for(byte b:hash)sb.append(String.format(Locale.ROOT,"%02x",b&0xff));return sb.toString();
    }
    @PluginMethod
    public void download(PluginCall call){
        String url=call.getString("url");
        if(url==null||!RELEASE.matcher(url).matches()){call.reject("URL de APK oficial não autorizada");return;}
        if(!busy.compareAndSet(false,true)){call.reject("Uma atualização já está sendo baixada");return;}
        worker.execute(()->{
            File file=apkFile(),temp=new File(file.getParentFile(),APK_NAME+".part");
            try{
                if(!file.getParentFile().exists()&&!file.getParentFile().mkdirs())
                    throw new IOException("Não foi possível criar pasta privada de atualização");
                String expected=expectedChecksum(url);
                HttpURLConnection conn=connect(url);
                try{
                    long total=conn.getContentLengthLong();
                    if(total>MAX_APK)throw new IOException("APK excede limite permitido");
                    MessageDigest sha=MessageDigest.getInstance("SHA-256");
                    long current=0;int lastPercent=-1;
                    try(InputStream input=new BufferedInputStream(conn.getInputStream());
                        BufferedOutputStream out=new BufferedOutputStream(new FileOutputStream(temp))){
                        byte[] buf=new byte[32768];int n;
                        while((n=input.read(buf))!=-1){
                            current+=n;if(current>MAX_APK)throw new IOException("APK excede limite permitido");
                            out.write(buf,0,n);sha.update(buf,0,n);
                            int percent=total>0?(int)Math.min(100,(current*100)/total):-1;
                            if(percent!=lastPercent){lastPercent=percent;
                                JSObject progress=new JSObject();progress.put("percent",percent);progress.put("receivedBytes",current);progress.put("totalBytes",total);
                                notifyListeners("downloadProgress",progress);
                            }
                        }
                    }
                    if(current<1024*1024)throw new IOException("Arquivo recebido não parece um APK");
                    String digest=hex(sha.digest());
                    if(!digest.equals(expected))throw new IOException("Checksum SHA256 incompatível. Atualização descartada.");
                    if(file.exists()&&!file.delete())throw new IOException("Falha ao substituir arquivo temporário");
                    if(!temp.renameTo(file))throw new IOException("Falha ao concluir download privado");
                    getContext().getSharedPreferences("scout-updater",0).edit()
                        .putString("verifiedSha256",digest).putString("releaseUrl",url).apply();
                    JSObject ok=new JSObject();ok.put("status","verified");ok.put("sha256",digest);ok.put("receivedBytes",current);
                    call.resolve(ok);
                }finally{conn.disconnect();}
            }catch(Exception e){temp.delete();call.reject("Download interno não concluído: "+e.getMessage());}
            finally{busy.set(false);}
        });
    }
    @PluginMethod
    public void installDownloaded(PluginCall call){
        try{
            File apk=apkFile();
            if(!apk.isFile()){call.reject("Nenhum APK baixado e verificado neste aplicativo");return;}
            String expected=getContext().getSharedPreferences("scout-updater",0).getString("verifiedSha256","");
            if(!expected.matches("[a-f0-9]{64}")){call.reject("Checksum de download ausente");return;}
            MessageDigest sha=MessageDigest.getInstance("SHA-256");
            try(InputStream input=new FileInputStream(apk)){byte[] buf=new byte[32768];int n;while((n=input.read(buf))!=-1)sha.update(buf,0,n);}
            if(!expected.equals(hex(sha.digest()))){apk.delete();call.reject("Arquivo foi alterado após download");return;}
            PackageManager pm=getContext().getPackageManager();
            PackageInfo installed=info(pm,getContext().getPackageName()),candidate=archive(apk);
            if(candidate==null||!getContext().getPackageName().equals(candidate.packageName)){call.reject("Pacote APK inválido ou identificador diferente");return;}
            JSObject output=new JSObject();output.put("installedVersion",installed.versionName);output.put("downloadVersion",candidate.versionName);
            if(code(candidate)<=code(installed)){output.put("status","version_not_newer");call.resolve(output);return;}
            Signature[] s1=sigs(installed),s2=sigs(candidate);
            if(s1.length==0||s2.length==0||!fingerprint(s1[0]).equals(fingerprint(s2[0]))){
                output.put("status","signature_mismatch");
                output.put("installedFingerprint",s1.length>0?fingerprint(s1[0]):"indisponível");
                output.put("newFingerprint",s2.length>0?fingerprint(s2[0]):"indisponível");
                call.resolve(output);return;
            }
            if(Build.VERSION.SDK_INT>=26&&!pm.canRequestPackageInstalls()){
                Intent settings=new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:"+getContext().getPackageName()));
                settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);getContext().startActivity(settings);
                output.put("status","permission_required");call.resolve(output);return;
            }
            // V166: o hash e as assinaturas foram verificados; confirmar também que
            // o FileProvider consegue abrir os mesmos bytes que o instalador receberá.
            Uri uri=FileProvider.getUriForFile(getContext(),getContext().getPackageName()+".scoutupdate.files",apk);
            try(ParcelFileDescriptor fd=getContext().getContentResolver().openFileDescriptor(uri,"r")){
                if(fd==null)throw new IOException("URI privada indisponível para o instalador");
                long readable=fd.getStatSize();
                if(readable>=0&&readable!=apk.length())
                    throw new IOException("Tamanho da URI diferente do APK verificado");
            }
            // ACTION_VIEW puro com URI privada pode exibir "Problema ao analisar pacote"
            // em instaladores que não propagam o grant até o parser de APK.
            // ClipData + ACTION_INSTALL_PACKAGE transferem explicitamente a leitura.
            Intent install=new Intent(Intent.ACTION_INSTALL_PACKAGE);
            install.setData(uri);
            install.setClipData(ClipData.newUri(getContext().getContentResolver(),APK_NAME,uri));
            install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_GRANT_READ_URI_PERMISSION);
            // Alguns instaladores OEM abrem um componente secundário. Se ele estiver
            // visível ao PackageManager, conceder a permissão também ao pacote alvo.
            for(ResolveInfo handler:pm.queryIntentActivities(install,PackageManager.MATCH_DEFAULT_ONLY)){
                if(handler.activityInfo!=null&&handler.activityInfo.packageName!=null)
                    getContext().grantUriPermission(handler.activityInfo.packageName,uri,Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }
            try{
                getContext().startActivity(install);
            }catch(android.content.ActivityNotFoundException noInstaller){
                // Compatibilidade com ROMs que só anunciam VIEW de application/vnd.android.package-archive.
                Intent fallback=new Intent(Intent.ACTION_VIEW);
                fallback.setDataAndType(uri,"application/vnd.android.package-archive");
                fallback.setClipData(ClipData.newUri(getContext().getContentResolver(),APK_NAME,uri));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getContext().startActivity(fallback);
            }
            output.put("status","installer_opened");
            output.put("delivery","content_uri_with_read_grant");
            call.resolve(output);
        }catch(Exception e){call.reject("Não foi possível iniciar a instalação: "+e.getMessage());}
    }
}
