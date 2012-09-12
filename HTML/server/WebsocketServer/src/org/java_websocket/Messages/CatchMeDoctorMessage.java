/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.java_websocket.Messages;

import java.util.HashMap;
import java.util.Map;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo Ciman
 */
public class CatchMeDoctorMessage extends DoctorClientPacket {
    
    protected Map<String, Long> imagePosition = new HashMap<String, Long>();
    protected Map<String, Long> touchPosition = new HashMap<String, Long>();
    protected Map<String, Long> eyesPosition = new HashMap<String, Long>();
    protected long imageY = -1;
    protected long deltaEye = -1;
    protected long deltaTouch = -1;
    protected String movement = "";
    
    public CatchMeDoctorMessage(CatchMeDataPacket catchMePacket, EyeTrackerDataPacket eyePacket) {
        super("GRAPH_DATA");
        
        if (catchMePacket != null && eyePacket != null) {
            time = (catchMePacket.getTime() + eyePacket.getTime()) / 2;
            
            
        }
        else {
            if (catchMePacket == null) {
                time = eyePacket.time;
            }
            else if (eyePacket == null) {
                time = catchMePacket.time;
            }
        }
        
        if (catchMePacket != null) {
            movement = catchMePacket.getMovement();
        }
        
        if (catchMePacket != null) {
            touchPosition.put("posLeft", catchMePacket.touch.x);
            touchPosition.put("posTop", catchMePacket.touch.y);
        }
        else {
            touchPosition.put("posLeft", -1L);
            touchPosition.put("posTop", -1L);
        }
        
        if (eyePacket != null) {
            eyesPosition.put("posLeft", eyePacket.eyes.x);
            eyesPosition.put("posTop", eyePacket.eyes.y);
        }
        else {
            eyesPosition.put("posLeft", -1L);
            eyesPosition.put("posTop", -1L);
        }
        
        imagePosition.put("posLeft", catchMePacket.image.x);
        imagePosition.put("posTop", catchMePacket.image.y);
        
        long imageCenterX = catchMePacket.image.x + 
                    (OnlyImageGameDataPacket.imageWidth / 2);
        long imageCenterY = catchMePacket.image.y + 
                    (OnlyImageGameDataPacket.imageHeight / 2);
        
        if (catchMePacket != null && catchMePacket.hasValidTouchCoordinates()) {
            deltaTouch = (long)Math.sqrt(
                    Math.pow(imageCenterX - catchMePacket.touch.x, 2) +
                    Math.pow(imageCenterY - catchMePacket.touch.y, 2));
        }
        
        if (eyePacket != null) {   
            deltaEye = (long)Math.sqrt(
                    Math.pow(imageCenterX - eyePacket.eyes.x, 2) +
                    Math.pow(imageCenterY - eyePacket.eyes.y, 2));
        }
    }
    
    @Override
    public String toString() {
        
        String string = "(" + time + "," + deltaTouch + "," + deltaEye + 
                "," + imagePosition.get("posLeft") + "," + imagePosition.get("posTop")
                 + "," + movement + ")";
        
        return string;
    }
    
    @Override
    public String toJSONString() {
        
        JSONObject packet = new JSONObject();
        packet.put("TYPE", type);
        packet.put("TIME", time);
        packet.put("IMAGE_SPECS", imagePosition);
        packet.put("TOUCH_SPECS", touchPosition);
        packet.put("EYES_SPECS", eyesPosition);
        packet.put("MOVEMENT", movement);
        if (deltaTouch != -1) {
            packet.put("DELTA_TOUCH", deltaTouch);
        }
        else {
            packet.put("DELTA_TOUCH", null);
        }
        if (deltaEye != -1) {
            packet.put("DELTA_EYE", deltaEye);
        }
        else {
            packet.put("DELTA_EYE", null);
        }
        
        return packet.toJSONString();  
    }
    
}
