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
        
        String[] elements = ((String)packet.get("DATA")).split(" ");
        
        eyes = new Point(new Long(elements[0]),
                        new Long(elements[1]));
    }
    
    @Override
    public String toString() {
        
        return buildString(eyes);
    }
    
    public boolean hasValidCoordinates() {
        return (eyes.x != -1L && eyes.y != -1L);
    }
}
