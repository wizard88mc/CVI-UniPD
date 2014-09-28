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
        try{
            String[] elements = ((String)packet.get("DATA")).split(" ");
        
            eyes = new Point(new Long(elements[0]),
                        new Long(elements[1]));
        }
        catch(Exception exc) {
            System.out.println("Error in EyeTrackerDataPacket");
            System.out.println(exc.toString());
            System.out.println(packet.toString());
        }
    }
    
    @Override
    public String toString() {
        
        return buildString(eyes);
    }
    
    public boolean hasValidCoordinates() {
        return (eyes.x != -1 && eyes.y != -1);
    }
}
