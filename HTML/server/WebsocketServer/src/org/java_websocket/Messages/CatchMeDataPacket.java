package org.java_websocket.Messages;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo Ciman
 */
public class CatchMeDataPacket extends OnlyImageGameDataPacket {
    
    protected Point touch = null;
    protected String movement = "";
    
    public CatchMeDataPacket(JSONObject packet) {
        super(packet);
        
        JSONArray arrayTouch = (JSONArray)packet.get("TOUCH");
        touch = new Point((Long)arrayTouch.get(0), 
                          (Long)arrayTouch.get(1));
        
        movement = (String)packet.get("MOVEMENT");
    }
    
    public boolean hasValidTouchCoordinates() {
        return (touch.x != -1 || touch.y != -1);
    }
    
    public String getTouchString() {
        
        return buildString(touch);
    }
    
    public String getMovement() {
        return movement;
    }
}
