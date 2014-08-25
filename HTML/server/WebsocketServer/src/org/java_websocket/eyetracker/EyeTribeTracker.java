 /*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package org.java_websocket.eyetracker;

/**
 *
 * @author Matteo Ciman
 */
public class EyeTribeTracker extends Thread {
    
    private WebSocketClientTracker websocketClient = null;
    private String host = null;
    private long startTime = 0L;
    private long screenWidth = 0L, screenHeight = 0L;
    
    public EyeTribeTracker(String host, int port) {
        //host = "ciman.math.unipd.it";
        this.host = new String().concat("ws://")
                .concat(host).concat(":").concat(new Integer(port).toString());
        System.out.println("Creating EyeTracker Client"); 
    }
    
    public void connect() throws Exception {
        
        websocketClient = new WebSocketClientTracker(host, this);
        websocketClient.connect();
        
    }
    
    public void setScreenWidthAndHeight(long screenWidth, long screenHeight) {
        this.screenWidth = screenWidth; this.screenHeight = screenHeight;
    }
}
