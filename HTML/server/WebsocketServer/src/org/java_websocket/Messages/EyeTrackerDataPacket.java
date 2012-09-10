package org.java_websocket.Messages;

import org.json.simple.JSONObject;

/**
 *
 * @author Matteo Ciman
 */
public class EyeTrackerDataPacket extends BaseDataPacket {
    
    protected Point eyes;
    
    public EyeTrackerDataPacket(JSONObject packet) {
        super(packet);
        
        eyes = new Point((Long)packet.get("POSX"),
                        (Long)packet.get("POSY"));
    }
    
    @Override
    public String toString() {
        
        return buildString(eyes);
    }
}
