package br.com.scoutpro.offline;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ContentValues;
import android.content.Intent;
import android.content.Context;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.MediaRecorder;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.IBinder;
import android.os.ParcelFileDescriptor;
import android.provider.MediaStore;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * V219 — somente captura audiovisual LOCAL, por consentimento explícito do Android.
 * Vídeo H.264/MP4 1280x720, 30 fps, 2,5 Mbit/s, máx. 15 min (~282 MB).
 * Sem gravação de microfone, sem upload automático, sem reutilizar MediaProjection token.
 */
public final class ScoutRecorderService extends Service {
    public static final String START="br.com.scoutpro.offline.START_CAPTURE";
    public static final String STOP="br.com.scoutpro.offline.STOP_CAPTURE";
    public static final String PROJECTION_RESULT_CODE="scoutProjectionResultCode";
    public static final String PROJECTION_RESULT_INTENT="scoutProjectionResultIntent";
    public static final String PREFS="scout-recordings";
    public static final String LAST_URI="lastVideoUri";

    private static final int NOTIFICATION_ID=219;
    private static final String CHANNEL="scout-pro-recording";
    private static final AtomicBoolean ACTIVE=new AtomicBoolean(false);
    private static final int WIDTH=1280, HEIGHT=720, FPS=30;
    private static final int BITRATE=2_500_000, MAX_MS=15*60*1000;
    private static final long MAX_FILE=450L*1024L*1024L;

    private MediaProjection projection;
    private VirtualDisplay display;
    private MediaRecorder recorder;
    private ParcelFileDescriptor descriptor;
    private Uri output;
    private boolean stopping=false,started=false;

    public static boolean isRecording(){return ACTIVE.get();}

    @Override public IBinder onBind(Intent intent){return null;}

    private Notification notification(){
        NotificationManager manager=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        if(Build.VERSION.SDK_INT>=26){
            NotificationChannel channel=new NotificationChannel(CHANNEL,"Gravação de partida Scout PRO",
                NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Gravação local em andamento. Toque em Parar para finalizar o vídeo.");
            if(manager!=null)manager.createNotificationChannel(channel);
        }
        Intent stop=new Intent(this,ScoutRecorderService.class);
        stop.setAction(STOP);
        PendingIntent stopAction=PendingIntent.getService(this,219,stop,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder=Build.VERSION.SDK_INT>=26
            ?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);
        builder.setContentTitle("Scout PRO · Gravando eFootball")
            .setContentText("720p · 30 fps · MP4 local · Parar")
            .setSmallIcon(android.R.drawable.presence_video_online)
            .setOngoing(true)
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_pause,
                "Parar gravação",stopAction).build());
        return builder.build();
    }

    @Override public int onStartCommand(Intent intent,int flags,int startId){
        if(intent==null){stopSelf();return START_NOT_STICKY;}
        String action=intent.getAction();
        if(STOP.equals(action)){stopCapture();return START_NOT_STICKY;}
        if(!START.equals(action)){stopSelf();return START_NOT_STICKY;}
        if(!ACTIVE.compareAndSet(false,true)){stopSelfResult(startId);return START_NOT_STICKY;}
        stopping=false;
        try{
            // MediaProjection FGS precisa estar ativo antes de getMediaProjection (Android 14+).
            startForeground(NOTIFICATION_ID,notification());
            int resultCode=intent.getIntExtra(PROJECTION_RESULT_CODE,0);
            Intent token;
            if(Build.VERSION.SDK_INT>=33){
                token=intent.getParcelableExtra(PROJECTION_RESULT_INTENT,Intent.class);
            }else{
                token=intent.getParcelableExtra(PROJECTION_RESULT_INTENT);
            }
            if(token==null)throw new IllegalStateException("Autorização de captura ausente");
            startCapture(resultCode,token);
        }catch(Exception e){
            android.util.Log.e("ScoutRecorder","Não foi possível iniciar captura",e);
            stopCapture();
        }
        return START_NOT_STICKY;
    }

    private void startCapture(int resultCode,Intent token)throws IOException {
        if(Build.VERSION.SDK_INT<29)throw new IOException("Android anterior ao 10");
        ContentValues values=new ContentValues();
        values.put(MediaStore.Video.Media.DISPLAY_NAME,"ScoutPRO_eFootball_"+System.currentTimeMillis()+".mp4");
        values.put(MediaStore.Video.Media.MIME_TYPE,"video/mp4");
        values.put(MediaStore.Video.Media.RELATIVE_PATH,Environment.DIRECTORY_MOVIES+"/ScoutPRO");
        values.put(MediaStore.Video.Media.IS_PENDING,1);
        output=getContentResolver().insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI,values);
        if(output==null)throw new IOException("Não foi possível reservar o MP4 em Filmes/ScoutPRO");
        descriptor=getContentResolver().openFileDescriptor(output,"w");
        if(descriptor==null)throw new IOException("Não foi possível abrir o arquivo MP4");

        recorder=Build.VERSION.SDK_INT>=31?new MediaRecorder(this):new MediaRecorder();
        recorder.setVideoSource(MediaRecorder.VideoSource.SURFACE);
        recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
        recorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);
        recorder.setVideoSize(WIDTH,HEIGHT);
        recorder.setVideoFrameRate(FPS);
        recorder.setVideoEncodingBitRate(BITRATE);
        recorder.setMaxDuration(MAX_MS);
        recorder.setMaxFileSize(MAX_FILE);
        recorder.setOutputFile(descriptor.getFileDescriptor());
        recorder.setOnInfoListener((mr,what,extra)->{
            if(what==MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED
              ||what==MediaRecorder.MEDIA_RECORDER_INFO_MAX_FILESIZE_REACHED)stopCapture();
        });
        recorder.prepare();

        MediaProjectionManager manager=(MediaProjectionManager)getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        if(manager==null)throw new IOException("MediaProjectionManager indisponível");
        projection=manager.getMediaProjection(resultCode,token);
        if(projection==null)throw new IOException("Permissão de captura revogada");
        projection.registerCallback(new MediaProjection.Callback(){
            @Override public void onStop(){stopCapture();}
        },new android.os.Handler(getMainLooper()));

        int density=getResources().getDisplayMetrics().densityDpi;
        display=projection.createVirtualDisplay("ScoutPRO-eFootball-720p",WIDTH,HEIGHT,density,
            DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,recorder.getSurface(),null,null);
        if(display==null)throw new IOException("VirtualDisplay não disponível");
        recorder.start();
        started=true;
    }

    private synchronized void stopCapture(){
        if(stopping)return;
        stopping=true;
        ACTIVE.set(false);
        boolean videoValid=started;
        if(recorder!=null){
            if(started){
                try{recorder.stop();}catch(RuntimeException tooShort){
                    videoValid=false;
                    android.util.Log.w("ScoutRecorder","Vídeo muito curto ou indisponível",tooShort);
                }
            }
            try{recorder.reset();}catch(Exception ignore){}
            try{recorder.release();}catch(Exception ignore){}
            recorder=null;
        }
        if(display!=null){try{display.release();}catch(Exception ignore){}display=null;}
        MediaProjection activeProjection=projection;
        projection=null;
        if(activeProjection!=null){try{activeProjection.stop();}catch(Exception ignore){}}
        if(descriptor!=null){try{descriptor.close();}catch(Exception ignore){}descriptor=null;}
        if(output!=null){
            if(videoValid){
                try{
                    ContentValues done=new ContentValues();
                    done.put(MediaStore.Video.Media.IS_PENDING,0);
                    getContentResolver().update(output,done,null,null);
                    getSharedPreferences(PREFS,0).edit().putString(LAST_URI,output.toString()).apply();
                }catch(Exception error){
                    getContentResolver().delete(output,null,null);
                }
            }else{
                try{getContentResolver().delete(output,null,null);}catch(Exception ignore){}
            }
            output=null;
        }
        started=false;
        try{stopForeground(STOP_FOREGROUND_REMOVE);}catch(Exception ignore){}
        stopSelf();
    }
    @Override public void onDestroy(){stopCapture();super.onDestroy();}
}
