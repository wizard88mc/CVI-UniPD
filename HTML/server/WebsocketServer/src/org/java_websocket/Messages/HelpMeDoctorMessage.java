package org.java_websocket.Messages;

import java.util.HashMap;
import java.util.Map;
import org.java_websocket.Messages.DoctorClientPacket;
import org.java_websocket.Messages.EyeTrackerDataPacket;
import org.java_websocket.Messages.HelpMeDataPacket;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */
public class HelpMeDoctorMessage extends DoctorClientPacket {
    
    protected Map<String, Long> imagePosition = new HashMap<String, Long>();
    protected Map<String, Long> touchPosition = new HashMap<String, Long>();
    protected Map<String, Long> eyePosition = new HashMap<String, Long>();
    
    public HelpMeDoctorMessage(HelpMeDataPacket helpMePacket, EyeTrackerDataPacket eyePacket) {
        super("GAME_POSITIONS");
        
        if (helpMePacket != null && eyePacket != null) {
            time = helpMePacket.getTime() + eyePacket.getTime();
        }
        else if (eyePacket == null) {
            time = helpMePacket.getTime();
        }
        else  if (helpMePacket == null) {
            time = eyePacket.getTime();
        }
        
        if (helpMePacket != null) {
            imagePosition.put("TOP", helpMePacket.image.y);
            imagePosition.put("LEFT", helpMePacket.image.x);
            touchPosition.put("TOP", helpMePacket.touch.y);
            touchPosition.put("LEFT", helpMePacket.touch.x);
        }
        else {
            imagePosition.put("TOP", null);
            imagePosition.put("LEFT", null);
            touchPosition.put("TOP", null);
            touchPosition.put("LEFT", null);
        }
        if (eyePacket != null) {
            eyePosition.put("TOP", eyePacket.eyes.y);
            eyePosition.put("LEFT", eyePacket.eyes.x);
        }
        else {
            eyePosition.put("TOP", null);
            eyePosition.put("LEFT", null);
        }
    }
    
    @Override
    public String toJSONString() {
        
        JSONObject packet = new JSONObject();
        packet.put("TYPE", type);
        packet.put("TIME", time);
        packet.put("IMAGE_SPECS", imagePosition);
        packet.put("EYE_SPECS", eyePosition);
        packet.put("TOUCH_SPECS", touchPosition);
        
        return packet.toJSONString();
    }
}
