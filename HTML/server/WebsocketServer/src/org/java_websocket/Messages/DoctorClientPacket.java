package org.java_websocket.Messages;

import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */
public abstract class DoctorClientPacket extends BaseDataPacket{
    
    public DoctorClientPacket(JSONObject packet) {
        super(packet);
    }
    
    public DoctorClientPacket(String type) {
        super(type);
    }
    public abstract String toJSONString();
}
