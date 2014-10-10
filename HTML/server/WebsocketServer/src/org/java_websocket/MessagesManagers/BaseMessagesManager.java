package org.java_websocket.MessagesManagers;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import org.json.simple.JSONObject;

import org.java_websocket.DoctorClientManager;
import org.java_websocket.Messages.EyeTrackerDataPacket;

/**
 *
 * @author Matteo Ciman
 */
public abstract class BaseMessagesManager extends Thread {
        
    protected String folderWhereArchive = "archivio_visite";
    protected String relativeFolder = null;
    protected String separator = File.separator;
    protected BufferedWriter touchWriter = null;
    protected BufferedWriter imageWriter = null;
    protected BufferedWriter eyeTrackerWriter = null;
    protected BufferedWriter deltaWriter = null;
    protected Boolean endGame = false;
    protected String fileTouch = null;
    protected String fileImage = null;
    protected String fileEyeTracking = null;
    protected String fileSpecs = null;
    protected int visitID = 0;
    protected boolean withEyeTracker = false;

    public ArrayList<JSONObject> messagesGameBuffer = new ArrayList<JSONObject>();
    public ArrayList<JSONObject> messagesEyeTrackerBuffer = new ArrayList<JSONObject>();
    public long startTime = 0;

    public final Object bufferSynchronizer = new Object();
    
    protected int maxFPS = 25;
    protected Long MAX_DIFFERENCE = Long.valueOf(1000 / maxFPS + (1000 / maxFPS) / 2);
    protected Long MAX_TIME_WAITING = Long.valueOf((1000 / maxFPS) * 2);

    protected static DoctorClientManager doctorManager = null;

    public BaseMessagesManager(String patientID, int visitID, boolean withEyeTracker) {

        this.visitID = visitID; this.withEyeTracker = withEyeTracker;
        
        if (!this.withEyeTracker) {
            messagesEyeTrackerBuffer = null;
        }
        // devo creare cartella dove salverò i file
        Calendar giornoVisita = Calendar.getInstance();
        String anno = String.valueOf(giornoVisita.get(Calendar.YEAR));
        String mese = String.valueOf(giornoVisita.get(Calendar.MONTH) + 1);
        String giorno = String.valueOf(giornoVisita.get(Calendar.DAY_OF_MONTH));
        String ora = String.valueOf(giornoVisita.get(Calendar.HOUR_OF_DAY));
        String minuti = String.valueOf(giornoVisita.get(Calendar.MINUTE));

        String subfolder = anno + "-" + mese + "-" + giorno + "-"
                + ora + "-" + minuti + "-" + String.valueOf(visitID);

        relativeFolder = folderWhereArchive.concat(separator)
                .concat(patientID).concat(separator).concat(subfolder)
                .concat(separator);

        folderWhereArchive = System.getProperty("user.dir")
                .concat(separator).concat(relativeFolder).concat(separator);

        File folder = new File(folderWhereArchive);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        fileTouch = folderWhereArchive.concat("InputTouch.txt");
        fileImage = folderWhereArchive.concat("InputImage.txt");
        fileEyeTracking = folderWhereArchive.concat("InputEyeTracking.txt");
        String fileDelta = folderWhereArchive.concat("DeltaValues.txt");

        while (touchWriter == null || imageWriter == null || 
                eyeTrackerWriter == null || deltaWriter == null ) {
            try {
                if (touchWriter == null) {
                    touchWriter = new BufferedWriter(new FileWriter(fileTouch));
                }
                if (imageWriter == null) {
                    imageWriter = new BufferedWriter(new FileWriter(fileImage));
                }
                if (eyeTrackerWriter == null) {
                    eyeTrackerWriter = new BufferedWriter(new FileWriter(fileEyeTracking));
                }
                if (deltaWriter == null) {
                    deltaWriter = new BufferedWriter(new FileWriter(fileDelta));
                }
            }
            catch(IOException exc) {
                exc.printStackTrace();
            }
        }
    }

    @Override
    public abstract void run();

    void endGame() {
        endGame = true;
    }

    public static void setDoctorClient(DoctorClientManager doctorManager) {
        BaseMessagesManager.doctorManager = doctorManager;
    }

    public String getFolderWhereArchive() {
        return relativeFolder;
    }

    public void writeDirectionInfo(String direction) {
        try {
            String toWrite = "----- " + direction + " -----";
            touchWriter.write(toWrite);
            touchWriter.newLine();
            touchWriter.flush();

            eyeTrackerWriter.write(toWrite);
            eyeTrackerWriter.newLine();
            eyeTrackerWriter.flush();

            imageWriter.write(toWrite);
            imageWriter.newLine();
            imageWriter.flush();
        }
        catch(IOException exc) {

        }
    }

    public void writeGameSpecs(Long imgWidth, Long imgHeight, Long screenWidth, 
            Long screenHeight) {

        fileSpecs = folderWhereArchive.concat("GameSpecs.ini");

        try {
            BufferedWriter specsWriter = new BufferedWriter(new FileWriter(fileSpecs, true));
            specsWriter.write(screenWidth.toString() + 'x' + screenHeight.toString());
            specsWriter.newLine();
            specsWriter.write(imgWidth.toString() + 'x' + imgHeight.toString());
            specsWriter.flush();
            specsWriter.close();
        }
        catch(IOException exc) {
            System.out.println("Cannot create specs file: " + exc.toString());
        } 
    }

    void writeEyeTrackerMessage(EyeTrackerDataPacket packet) {

        try {
            eyeTrackerWriter.write(packet.toString());
            eyeTrackerWriter.newLine();
            eyeTrackerWriter.flush();
        }
        catch(IOException exc) {} 
    }
    
    public void manageDifferentGameData(JSONObject packet) {}
    
    public void gameIsEnded() {}
    
    public void withoutTracker() {
        this.withEyeTracker = false;
        messagesEyeTrackerBuffer = null;
    }
}
