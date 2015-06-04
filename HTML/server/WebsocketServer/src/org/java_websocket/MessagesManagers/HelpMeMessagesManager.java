package org.java_websocket.MessagesManagers;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import org.java_websocket.BaseManager;
import org.java_websocket.Messages.EyeTrackerDataPacket;
import org.java_websocket.Messages.HelpMeDataPacket;
import org.java_websocket.Messages.HelpMeDoctorMessage;
import org.java_websocket.WebSocketWithOffsetCalc;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */
public class HelpMeMessagesManager extends BaseMessagesManager {
    
    BufferedWriter resultsWriter = null;
    protected ArrayList<Long> firstResponseTimeValues = new ArrayList<Long>();
    protected ArrayList<Long> completionTimeValues = new ArrayList<Long>();
    protected int totalRightAnswers = 0;
    protected int totalBadAnswers = 0;
    
    //protected long lastTimeValidPacket = 0L;
    
    public HelpMeMessagesManager(String patientID, int visitID, boolean withTracker) {
        super(patientID, visitID, withTracker);
        
        String fileResults = folderWhereArchive.concat("Results.txt");
        try {
            resultsWriter = new BufferedWriter(new FileWriter(fileResults));
        }
        catch(IOException exc) {
            System.out.println("Cannot create Result file: " + exc.toString());
        } 
    }
    
    @Override
    public void run() {
        
        JSONArray stupidPositions = new JSONArray();
        stupidPositions.add(-1L);
        stupidPositions.add(-1L);
        
        while (!endGame) {
            
            if (this.withEyeTracker) {
                synchronized(bufferSynchronizer) {
                    while (messagesGameBuffer.isEmpty() && messagesEyeTrackerBuffer.isEmpty()) {
                        try {
                            bufferSynchronizer.wait();
                        }
                        catch(InterruptedException exc) {}
                    }
                }

                boolean removeMessageEyeTracker = false;
                boolean removeMessageGame = false;
                HelpMeDataPacket imageInformations = null;
                EyeTrackerDataPacket eyeTrackerInformations = null;

                if (!removeMessageEyeTracker && !removeMessageGame && 
                        !messagesGameBuffer.isEmpty() && !messagesEyeTrackerBuffer.isEmpty()) {

                    imageInformations = 
                            new HelpMeDataPacket(messagesGameBuffer.get(0));
                    eyeTrackerInformations = 
                            new EyeTrackerDataPacket(messagesEyeTrackerBuffer.get(0));

                    Long timeMessageGame = imageInformations.getTime();
                    Long timeEyeTrackerMessage = eyeTrackerInformations.getTime();

                    Long deltaTime = Math.abs(timeMessageGame - timeEyeTrackerMessage);

                    if (deltaTime <= MAX_DIFFERENCE) {
                        removeMessageEyeTracker = true;
                        removeMessageGame = true;

                        long time = (eyeTrackerInformations.getTime() + imageInformations.getTime())
                                / 2;

                        eyeTrackerInformations.setTime(time);
                        imageInformations.setTime(time);

                        writeEyeTrackerMessage(eyeTrackerInformations);
                        writeImageMessage(imageInformations);
                    }
                    else if (timeMessageGame < timeEyeTrackerMessage) {
                        // devo spedire solo pacchetto relativo all'immagine
                        removeMessageGame = true;
                        writeImageMessage(imageInformations);

                        JSONObject stupidEye = new JSONObject();
                        stupidEye.put("TIME", imageInformations.getTime());
                        stupidEye.put("DATA", "-1 -1");
                        
                        //System.out.println("timeMessageGame < timeEyeTrackerMessage");

                        writeEyeTrackerMessage(new EyeTrackerDataPacket(stupidEye));
                        
                        clearEyeTrackerData = true;
                    }
                    else if (timeEyeTrackerMessage < timeMessageGame) {
                        // devo spedire solo pacchetto relativo all'eye-tracker
                        removeMessageEyeTracker = true;
                        writeEyeTrackerMessage(eyeTrackerInformations);

                        JSONObject stupidImage = new JSONObject();
                        stupidImage.put("TIME", eyeTrackerInformations.getTime());
                        stupidImage.put("TOUCH", stupidPositions);
                        stupidImage.put("IMAGE", stupidPositions);
                        
                        //System.out.println("timeEyeTrackerMessage < timeMessageGame");

                        writeImageMessage(new HelpMeDataPacket(stupidImage));
                    }
                }
                else if (messagesGameBuffer.isEmpty()) {
                    // ho solo messaggi eye tracker, non delle immagini
                    eyeTrackerInformations = 
                            new EyeTrackerDataPacket(messagesEyeTrackerBuffer.get(0));

                    if (System.currentTimeMillis() - startTime - 
                            eyeTrackerInformations.getTime() > MAX_TIME_WAITING) {

                        removeMessageEyeTracker = true;
                        writeEyeTrackerMessage(eyeTrackerInformations);

                        JSONObject stupidImage = new JSONObject();
                        stupidImage.put("TIME", eyeTrackerInformations.getTime());
                        stupidImage.put("TOUCH", stupidPositions);
                        stupidImage.put("IMAGE", stupidPositions);

                        writeImageMessage(new HelpMeDataPacket(stupidImage));

                        //System.out.println("Immagini vuoto");
                    }
                }
                else if (messagesEyeTrackerBuffer.isEmpty()) {
                    imageInformations = new HelpMeDataPacket(messagesGameBuffer.get(0));

                    if (System.currentTimeMillis() - startTime - imageInformations.getTime() > MAX_TIME_WAITING) {
                        removeMessageGame = true;
                        writeImageMessage(imageInformations);

                        JSONObject stupidEye = new JSONObject();
                        stupidEye.put("TIME", imageInformations.getTime());
                        stupidEye.put("DATA", "-1 -1");

                        writeEyeTrackerMessage(new EyeTrackerDataPacket(stupidEye));

                        //System.out.println("Eye tracker vuoto");
                    }
                }

                if (removeMessageEyeTracker || removeMessageGame) {
                    if (removeMessageEyeTracker) {
                        
                        synchronized(bufferSynchronizer) {
                            messagesEyeTrackerBuffer.remove(0);
                        }
                    }
                    if (removeMessageGame) {

                        synchronized(bufferSynchronizer) {
                            messagesGameBuffer.remove(0);
                        }
                    }
                    
                    if (clearEyeTrackerData) {
                        synchronized(bufferSynchronizer) {
                            messagesEyeTrackerBuffer.clear();
                        }
                        clearEyeTrackerData = false;
                    }
                        //lastTimeValidPacket -= MAX_DIFFERENCE;
                    HelpMeDoctorMessage message = new HelpMeDoctorMessage(imageInformations, eyeTrackerInformations);
                    doctorManager.sendMessageToDoctorClient(message);
                }
            }
            else {
                synchronized(bufferSynchronizer) {
                    while (messagesGameBuffer.isEmpty()) {
                        try {
                            bufferSynchronizer.wait();
                        }
                        catch(InterruptedException exc) {}
                    }
                }
                
                if (!messagesGameBuffer.isEmpty()) {
                    
                    HelpMeDataPacket packet = new HelpMeDataPacket(messagesGameBuffer.get(0));
                    
                    writeImageMessage(packet);

                    JSONObject stupidEye = new JSONObject();
                    stupidEye.put("TIME", packet.getTime());
                    stupidEye.put("DATA", "-1 -1");

                    writeEyeTrackerMessage(new EyeTrackerDataPacket(stupidEye));
                    
                    synchronized(bufferSynchronizer) {
                        messagesGameBuffer.remove(0);
                    }
                    HelpMeDoctorMessage message = new HelpMeDoctorMessage(packet, null);
                    doctorManager.sendMessageToDoctorClient(message);
                }
            }
        }
    }
    
    public void writeImageMessage(HelpMeDataPacket packet) {
        
        try {
            touchWriter.write(packet.getTouchString());
            touchWriter.newLine();
            touchWriter.flush();
            imageWriter.write(packet.getImageString());
            imageWriter.newLine();
            imageWriter.flush();
        }
        catch(IOException exc) {}
    }
    
    public void writeResults(String string) {
        try {
            resultsWriter.write(string);
            resultsWriter.newLine();
            resultsWriter.flush();
        }
        catch(IOException exc) {
            System.out.println("Error in writing Results: " + exc.toString());
        }
    }
    
    @Override
    public void manageDifferentGameData(JSONObject packet) {
        
        if (packet.get("SUBTYPE").equals("SESSION_RESULTS")) {
            
            String targetFamily = (String)packet.get("TARGET_FAMILY");
            Boolean isTarget = ((Boolean)packet.get("IS_TARGET")).booleanValue();
            String objectName = (String)packet.get("OBJECT_NAME");
            Long firstResponseTime = (Long)packet.get("FIRST_RESPONSE_TIME");
            Long completionTime = (Long)packet.get("COMPLETION_TIME");
            Boolean rightAnswer = ((Boolean)packet.get("RIGHT_ANSWER")).booleanValue();

            String stringToWrite = new String();
            stringToWrite = stringToWrite.concat("(").concat(targetFamily).concat(",")
                    .concat(isTarget.toString()).concat(",").concat(objectName)
                    .concat(",").concat(firstResponseTime.toString()).concat(",")
                    .concat(completionTime.toString()).concat(",")
                    .concat(rightAnswer.toString()).concat(")");
            
            writeResults(stringToWrite);
            
            packet.remove("TYPE");
            packet.remove("SUBTYPE");
            packet.put("TYPE", "SESSION_RESULTS");
            
            doctorManager.sendPacket(packet);
            
            firstResponseTimeValues.add(firstResponseTime);
            completionTimeValues.add(completionTime);
            if (rightAnswer.booleanValue()) {
                totalRightAnswers++;
            }
            else {
                totalBadAnswers++;
            }
        }
    }
    
    @Override
    public void gameIsEnded() {
        // calcolo valori medi finali e li salvo come riepilogo nel DB
        long meanValueFRT = 0;
        long meanValueCT = 0;
        
        for (int i = 0; i < firstResponseTimeValues.size(); i++) {
            meanValueFRT += firstResponseTimeValues.get(i);
            meanValueCT += completionTimeValues.get(i);
        }
        
        meanValueFRT /= firstResponseTimeValues.size();
        meanValueCT /= completionTimeValues.size();
        
        BaseManager.dbManager.insertResultsHelpMeGame(visitID, meanValueFRT, meanValueCT, totalRightAnswers, totalBadAnswers);
        
        endGame = true;
    }
}
