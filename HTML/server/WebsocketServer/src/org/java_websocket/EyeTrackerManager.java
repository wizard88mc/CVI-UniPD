package org.java_websocket;

import java.net.UnknownHostException;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 * 
 * v 0.1 First specification of the class
 */
public class EyeTrackerManager extends WebSocketWithOffsetCalc {
    
    public EyeTrackerManager(int port) throws UnknownHostException {
        super("EyeTrackerClient", port);
    }
    
    /*@Override
    public long managerReady() {
        return serverManager.eyeTrackerReady();
    }*/
    
    @Override
    public boolean onMessage(WebSocket conn, String message) {
        
        boolean alreadyManaged = super.onMessage(conn, message);
        JSONObject packet = (JSONObject)JSONValue.parse(message);
        
        if (packet.get("TYPE").equals("IDENTIFICATION") && clientConnected != null) {
            BaseManager.eyeTrackerManager = this;
        }
        
        if (!alreadyManaged) {
            
            if (packet.get("TYPE").equals("EYE_TRACKER_DATA")) {
            
                synchronized(messageManager.bufferSynchronizer) {
                    messageManager.messagesEyeTrackerBuffer.add(packet);
                    messageManager.bufferSynchronizer.notifyAll();
                }
            }
            else if (packet.get("TYPE").equals("READY_TO_PLAY")) {
                
                if (!offsetCalculated)  {
                    int machineID = new Integer((String)packet.get("MACHINE_ID"));
                    // recupero valore dell'offset da DB 
                    String dbValue = dbManager.getMachineOffset(machineID);
                    String[] components = dbValue.split(",");
                    valuea12 = Double.parseDouble(components[0]);
                    valueb12 = Double.parseDouble(components[1]);

                }
                
                System.out.println("Eye_Tracker_Manager READY TO START");

                /*System.out.println("Richiesta calcolo tempo partenza");

                long timeToStart = managerReady();
                if (timeToStart != -1) {
                    System.out.println("Sto spedendo ora partenza");
                    comunicateStartTime(timeToStart);
                }*/
            }
        }
        return true;
    }
    
}
