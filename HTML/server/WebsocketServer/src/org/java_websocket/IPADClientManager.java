package org.java_websocket;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 * 
 * v 0.1 First Specification of the class
 */

import java.net.UnknownHostException;
import java.util.Date;
import static org.java_websocket.BaseManager.eyeTrackerManager;
import org.java_websocket.Messages.OnlyImageGameDataPacket;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class IPADClientManager extends WebSocketWithOffsetCalc {
    
    protected long imageWidth;
    protected long imageHeight;
    protected Long screenWidth;
    protected Long screenHeight;
    
    public IPADClientManager(int port) throws UnknownHostException {
        super("GAME_CLIENT", port);
    }
    
    public void changeSpeedValue(JSONObject packet) {
        
        clientConnected.send(packet.toJSONString());
    }
    
    @Override
    public boolean onMessage(WebSocket conn, String message) {
        
        boolean alreadyManaged = super.onMessage(conn, message);
        JSONObject packet = (JSONObject)JSONValue.parse(message);
        
        if (packet.get(BaseManager.MESSAGE_TYPE).equals(BaseManager.IDENTIFICATION) && clientConnected != null) {
            patientManager = this;
        }
        if (!alreadyManaged) {
            
            String packetType = (String)packet.get(BaseManager.MESSAGE_TYPE);
            if (packetType.equals("GAME_DATA")) {
            
                if (packet.get("SUBTYPE").equals("POSITIONS")) {
                    
                    synchronized(messageManager.bufferSynchronizer) {
                        messageManager.messagesGameBuffer.add(packet);
                        messageManager.bufferSynchronizer.notifyAll();
                    }
                }
                else {
                    messageManager.manageDifferentGameData(packet);
                }
            }
            else if (packetType.equals("SPEED_VALUE") || 
                    packetType.equals("PRESENTATION_COMPLETE") ||
                    packetType.equals(BaseManager.SCREEN_MEASURES) ||
                    packetType.equals("LEVEL_ENDED"))  {
                
                doctorManager.sendPacket(packet);
                
                /**
                 * If the eye-tracker software is already connected, 
                 * send it the screen dimension
                 */
                if (packetType.equals(BaseManager.SCREEN_MEASURES)) {
                    
                    if (eyeTrackerManager == null) {
                        EyeTrackerManager.packetWithScreenDimension = packet;
                    }
                    else {
                        eyeTrackerManager.sendPacket(packet);
                    }
                }
            }
            else if (packetType.equals("READY_TO_PLAY")) {                

                if (packet.containsKey(BaseManager.IMAGE_WIDTH)) {
                    
                    imageWidth = (Long)packet.get(BaseManager.IMAGE_WIDTH);                    
                    imageHeight = (Long)packet.get(BaseManager.IMAGE_HEIGHT);

                    screenWidth = (Long)packet.get(BaseManager.SCREEN_WIDTH);
                    screenHeight = (Long)packet.get(BaseManager.SCREEN_HEIGHT);

                    OnlyImageGameDataPacket.setImageSpecification(imageWidth, imageHeight);
                    
                    if (messageManager != null) {
                        messageManager.writeGameSpecs(imageWidth, imageHeight, 
                                screenWidth, screenHeight);
                    }
                    packet.remove(BaseManager.MESSAGE_TYPE);
                    packet.put(BaseManager.MESSAGE_TYPE, "IMAGE_SPECIFICATION");

                    doctorManager.sendPacket(packet);
                }
                
                if (eyeTrackerManager != null) {
                    JSONObject packetStartTraining = new JSONObject();
                    packetStartTraining.put(BaseManager.MESSAGE_TYPE, "TRAINING_SESSION");
                    packetStartTraining.put(BaseManager.PATIENT_ID, patientID);

                    eyeTrackerManager.sendPacket(packetStartTraining);
                }
                else {
                    
                    JSONObject packetEyeTrackerNotReady = new JSONObject();
                    packetEyeTrackerNotReady.put(BaseManager.MESSAGE_TYPE, "EYE_TRACKER_NOT_READY");
                    
                    doctorManager.sendPacket(packetEyeTrackerNotReady);
                }
                
            }
            else if (packetType.equals("START_TRAINING")) 
            {
                long timeToStart = new Date().getTime() + 1500; // Audio presentation lasts 12 seconds
                long timeForEyeTracker = eyeTrackerManager.calculateTimeWithOffset(timeToStart);
                long timeForPatient = patientManager.calculateTimeWithOffset(timeToStart);

                JSONObject packetEyeTracker = (JSONObject)packet.clone();
                packetEyeTracker.put(BaseManager.START_TIME, timeForEyeTracker);
                packet.put(BaseManager.START_TIME, timeForPatient);

                eyeTrackerManager.sendPacket(packetEyeTracker);
                patientManager.sendPacket(packet);
            }
        }

        return true; 
    }
    
    @Override
    public void onClose(WebSocket client, int code, String reason, boolean remote) {
        System.out.println("CHILD_MANAGER Closed");
        clientConnected = null;
        patientManager = null;
    }
    
    public void writeGameSpecs() {
        messageManager.writeGameSpecs(imageWidth, imageHeight, screenWidth, screenHeight);
    }
    
}
