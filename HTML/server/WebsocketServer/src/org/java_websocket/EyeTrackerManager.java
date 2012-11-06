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
                
                System.out.println("Eye_Tracker_Manager READY TO START");
            }
        }
        return true;
    }
    
}
