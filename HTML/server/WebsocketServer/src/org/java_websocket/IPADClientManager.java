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
import java.util.ArrayList;
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
    
    /*@Override
    public long managerReady() {
        return serverManager.gameReady();
    }*/
    
    public void changeSpeedValue(JSONObject packet) {
        
        clientConnected.send(packet.toJSONString());
    }
    
    @Override
    public boolean onMessage(WebSocket conn, String message) {
        
        boolean alreadyManaged = super.onMessage(conn, message);
        JSONObject packet = (JSONObject)JSONValue.parse(message);
        
        if (packet.get("TYPE").equals("IDENTIFICATION") && clientConnected != null) {
            BaseManager.patientManager = this;
        }
        if (!alreadyManaged) {
            
            String packetType = (String)packet.get("TYPE");
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
                    packetType.equals("SCREEN_MEASURES") ||
                    packetType.equals("LEVEL_ENDED"))  {
                
                doctorManager.sendPacket(packet);
            }
            else if (packetType.equals("MACHINE_ID")) {
                
                String machineID = (String)packet.get("ID");
                
                ArrayList result = dbManager.getMachineOffset(machineID);
                
                if (result.isEmpty()) {
                    
                    JSONObject packetStartCalcultation = new JSONObject();
                    packetStartCalcultation.put("TYPE", "OFFSET_CALCULATION");
                    packetStartCalcultation.put("TODO", "true");
                    packetStartCalcultation.put("MANDATORY", "true");
                    
                    clientConnected.send(packetStartCalcultation.toJSONString());
                }
                else {
                    // creo data e verifico se va bene oppure no
                    JSONObject packetAlreadySync = new JSONObject();
                    packetAlreadySync.put("TYPE", "OFFSET_CALCULATION");
                    packetAlreadySync.put("TODO", "false");
                    
                    clientConnected.send(packetAlreadySync.toJSONString());
                }
            }
            else if (packetType.equals("READY_TO_PLAY")) {                     

                if (packet.containsKey("IMAGE_WIDTH")) {
                    imageWidth = (Long)packet.get("IMAGE_WIDTH");
                    System.out.println("Width: " + imageWidth);
                    imageHeight = (Long)packet.get("IMAGE_HEIGHT");
                    System.out.println("Height: " + imageWidth);
                    screenWidth = (Long)packet.get("SCREEN_WIDTH");
                    screenHeight = (Long)packet.get("SCREEN_HEIGHT");

                    OnlyImageGameDataPacket.setImageSpecification(imageWidth, imageHeight);
                    
                    if (messageManager != null) {
                        messageManager.writeGameSpecs(imageWidth, imageHeight, 
                                screenWidth, screenHeight);
                    }
                    packet.remove("TYPE");
                    packet.put("TYPE", "IMAGE_SPECIFICATION");

                    doctorManager.sendPacket(packet);
                }
                
                 // se non ho appena calcolato il valore di offset (offsetCalculated == false)
                // recupero il valore di offset dal mio DB
                if (!offsetCalculated)  {
                    int machineID = new Integer((String)packet.get("MACHINE_ID"));
                    // recupero valore dell'offset da DB 
                    String dbValue = dbManager.getMachineOffset(machineID);
                    if (!dbValue.equals("")) {
                        String[] components = dbValue.split(",");
                        valuea12 = Double.parseDouble(components[0]);
                        valueb12 = Double.parseDouble(components[1]);
                    }
                }
            }
        }

        return true; 
    }
    
    public void writeGameSpecs() {
        messageManager.writeGameSpecs(imageWidth, imageHeight, screenWidth, screenHeight);
    }
    
}
