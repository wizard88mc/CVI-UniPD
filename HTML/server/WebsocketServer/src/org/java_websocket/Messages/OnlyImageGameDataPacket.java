package org.java_websocket.Messages;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo Ciman
 */
public class OnlyImageGameDataPacket extends BaseDataPacket {
    
    protected Point image = null;
    public static long imageWidth;
    public static long imageHeight;
    
    public OnlyImageGameDataPacket(JSONObject packet) {
        super(packet);
        
        JSONArray arrayImage = (JSONArray)packet.get("IMAGE");
        image = new Point((Long)arrayImage.get(0),
                            (Long)arrayImage.get(1));
        
    }
    
    public String getImageString() {
        
        return buildString(image);
    }
    
    public static void setImageSpecification(long width, long height) {
        imageWidth = width; imageHeight = height;
    }
    
}
