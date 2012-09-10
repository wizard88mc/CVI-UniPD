/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.java_websocket.Messages;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */
public class HelpMeDataPacket extends BaseDataPacket{
    
    protected Point touch = null;
    protected Point image = null;
    
    public HelpMeDataPacket(JSONObject packet) {
        
        super(packet);
        time = (Long)packet.get("TIME");
        
        JSONArray arrayTouch = (JSONArray)packet.get("TOUCH");
        touch = new Point((Long)arrayTouch.get(0), (Long)arrayTouch.get(1));
        
        JSONArray arrayImage = (JSONArray)packet.get("IMAGE");
        image = new Point((Long)arrayImage.get(0), (Long)arrayImage.get(1));
        
    }
    
    public String getImageString() {
        return buildString(image);
    }
    
    public String getTouchString() {
        return buildString(touch);
    }
}
