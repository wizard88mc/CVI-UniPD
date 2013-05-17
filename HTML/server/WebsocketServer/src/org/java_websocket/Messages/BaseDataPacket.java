/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.java_websocket.Messages;

import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */

class Point {
    protected Long x;
    protected Long y;
    
    public Point() {
        x = 0L; y = 0L;
    }
    public Point(Long x, Long y) {
        this.x = x; 
        this.y = y;
    }
    
    public Long getX() {
        return x;
    }
    
    public Long getY() {
        return y;
    }
    
}
public class BaseDataPacket {

    protected String type = null;
    protected Long time = null;
    
    public BaseDataPacket(JSONObject packet) {
        try {
        if (!packet.containsKey("TYPE")) {
            this.type = "DEFAULT";
        }
        else {
            this.type = (String)packet.get("TYPE");
        }
        this.time = (Long)packet.get("TIME");
        }
        catch(Exception exc) {
            System.out.println("Error in BaseDataPacket");
            System.out.println(exc.toString());
            System.out.println(packet.toString());
        }
    }
    
    public BaseDataPacket(String type) {
        this.type = type;
    }
    
    public Long getTime() {
        return time;
    }
    
    public void setTime(long time) {
        this.time = time;
    }
    
    public String buildString(Point point) {
        
        return new String().concat("(")
                .concat(time.toString()).concat(",")
                .concat(point.x.toString()).concat(",")
                .concat(point.y.toString()).concat(")");
    }
}