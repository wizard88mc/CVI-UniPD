package org.java_websocket.MessagesManagers;

import java.io.IOException;
import org.java_websocket.BaseManager;
import org.java_websocket.Messages.CatchMeDataPacket;
import org.java_websocket.Messages.CatchMeDoctorMessage;
import org.java_websocket.Messages.EyeTrackerDataPacket;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */
public class CatchMeMessagesManager extends BaseMessagesManager {
    
    public CatchMeMessagesManager(String patientID, int visitID, boolean withTracker) {
        super(patientID, visitID, withTracker);
    }
    
    @Override
    public void run() {
        
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

                CatchMeDataPacket messageGame = null;
                EyeTrackerDataPacket messageEyeTracker = null;

                boolean removeMessageGame = false;
                boolean removeMessageEyeTracker = false;

                // Situazione in cui tutti e due i buffer hanno dei pacchetti 
                // al loro interno
                // Se Delta tempi dentro un certo massimo, li metto insieme
                // con tempo spedito che sarà il tempo medio, altrimenti 
                // invio quello con tempo più basso
                if (!messagesEyeTrackerBuffer.isEmpty() && !messagesGameBuffer.isEmpty()) {

                    messageGame = new CatchMeDataPacket(messagesGameBuffer.get(0));
                    messageEyeTracker = new EyeTrackerDataPacket(messagesEyeTrackerBuffer.get(0));

                    Long timeMessageGame = messageGame.getTime();
                    Long timeEyeTrackerMessage = messageEyeTracker.getTime();

                    Long deltaTime = Math.abs(timeMessageGame - timeEyeTrackerMessage);

                    /**
                    * Costruisco pacchetto con tutti e due i dati
                    * Devo prima scriverlo però
                    */
                    if (deltaTime <= MAX_DIFFERENCE) {

                        removeMessageGame = true;
                        removeMessageEyeTracker = true;

                        long time = (messageEyeTracker.getTime() + messageGame.getTime())
                                / 2;

                        messageEyeTracker.setTime(time);
                        messageGame.setTime(time);

                        writeEyeTrackerMessage(messageEyeTracker);
                        writeGameMessage(messageGame);
                    }
                    /**
                    * Pacchetto conterrà solo informazioni riguardanti il 
                    * gioco, non ho ricevuto nulla di eye tracker oppure 
                    * ho ricevuto qualcosa relativo ad un tempo successivo
                    * 
                    */
                    else if (timeMessageGame < timeEyeTrackerMessage) {

                        removeMessageGame = true;
                        writeGameMessage(messageGame);

                        JSONObject stupidEye = new JSONObject();
                        stupidEye.put("TIME", messageGame.getTime());
                        stupidEye.put("DATA", "-1 -1");

                        messageEyeTracker = new EyeTrackerDataPacket(stupidEye);
                        writeEyeTrackerMessage(messageEyeTracker);
                        
                        clearEyeTrackerData = true;
                        //System.out.println("timeMessageGame < timeEyeTrackerMessage");
                    }
                    /**
                    * Ho solo informazioni riguardanti l'eye-tracker
                    * oppure informazioni riguardanti gioco relative ad 
                    * istante successivo (CASO MOLTO RARO)
                    */
                    else if (timeEyeTrackerMessage < timeMessageGame) {

                        removeMessageEyeTracker = true;
                    }
                }
                else if (messagesGameBuffer.isEmpty()) {
                    
                    messageEyeTracker = 
                            new EyeTrackerDataPacket(messagesEyeTrackerBuffer.get(0));

                    if (System.currentTimeMillis() - startTime - messageEyeTracker.getTime() > MAX_TIME_WAITING) {

                        removeMessageEyeTracker = true;
                    }
                }
                else if (messagesEyeTrackerBuffer.isEmpty()) {
                    messageGame = new CatchMeDataPacket(messagesGameBuffer.get(0));

                    if (System.currentTimeMillis() - startTime - messageGame.getTime() > MAX_TIME_WAITING) {
                        removeMessageGame = true;
                        writeGameMessage(messageGame);

                        JSONObject stupidEye = new JSONObject();
                        stupidEye.put("TIME", messageGame.getTime());
                        stupidEye.put("DATA", "-1 -1");

                        messageEyeTracker = new EyeTrackerDataPacket(stupidEye);
                        writeEyeTrackerMessage(messageEyeTracker);
                        
                        //System.out.println("Eye tracker vuoto");
                    }
                }
                if (removeMessageEyeTracker || removeMessageGame) {

                    synchronized(bufferSynchronizer) {
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
                                clearEyeTrackerData = false;
                            }
                        }
                    }
                    /**
                        * Devo spedire pacchetto al client con le info
                        */

                    if (messageGame != null) {
                        CatchMeDoctorMessage message = new CatchMeDoctorMessage(messageGame, messageEyeTracker);
                        writeDeltaMessage(message.toString());
                        doctorManager.sendMessageToDoctorClient(message);
                    }
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
                    CatchMeDataPacket packet = new CatchMeDataPacket(messagesGameBuffer.get(0));
                    
                    writeGameMessage(packet);
                    JSONObject stupidEye = new JSONObject();
                    stupidEye.put("TIME", packet.getTime());
                    stupidEye.put("DATA", "-1 -1");

                    EyeTrackerDataPacket messageEyeTracker = new EyeTrackerDataPacket(stupidEye);
                    writeEyeTrackerMessage(messageEyeTracker);
                    
                    synchronized(bufferSynchronizer) {
                        messagesGameBuffer.remove(0);
                    }
                    
                    CatchMeDoctorMessage message = new CatchMeDoctorMessage(packet, messageEyeTracker);
                    writeDeltaMessage(message.toString());
                    doctorManager.sendMessageToDoctorClient(message);
                }
                
            }
        }
        
        System.out.println("MessageManager has ended");
    }
        
    void writeGameMessage(CatchMeDataPacket packet) {

        try {
            touchWriter.write(packet.getTouchString());
            touchWriter.newLine();
            touchWriter.flush();
            imageWriter.write(packet.getImageString());
            imageWriter.newLine();
            imageWriter.flush();
        }
        catch(IOException exc) {

        }
    }

    void writeDeltaMessage(String message) {
        try {
            deltaWriter.write(message);
            deltaWriter.newLine();
            deltaWriter.flush();
        }
        catch(IOException exc) {}
    }
    
    @Override
    public void gameIsEnded() {
        
        endGame = true;
        
        try {
            touchWriter.close();
            deltaWriter.close();
            imageWriter.close();
            eyeTrackerWriter.close();
        }
        catch(IOException exc) {
            System.out.println("Error in closing file in gameIsEnded");
            System.out.println(exc.toString());
        }
        CatchMePerformanceAnalyzer.dbManager = BaseManager.dbManager;
        new CatchMePerformanceAnalyzer(fileImage, fileEyeTracking, fileTouch, 
                fileSpecs, visitID).start();
    }
}
