 /*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package org.java_websocket.eyetracker;

import java.awt.Point;
import java.util.ArrayList;
import java.util.Date;
import java.util.concurrent.Executors;

/**
 *
 * @author Matteo Ciman
 */
public class EyeTribeTracker extends Thread {
    
    private WebSocketClientTracker websocketClient = null;
    private EyeTribeClient eyeTribeClient = null;
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
        
        eyeTribeClient = new EyeTribeClient();
    }
    
    public ArrayList<Point> prepareCalibration(int pointsNumber, long pointDuration, 
            long transitionDuration, int pointDiameter) 
    {
        
        return eyeTribeClient.prepareCalibration(pointsNumber, pointDuration, 
                transitionDuration, pointDiameter);
    }
    
    public void startCalibration(long startTime) 
    {
        Executors.newSingleThreadScheduledExecutor()
                    .schedule(new Runnable() {

                        @Override
                        public void run() {
                            eyeTribeClient.startCalibration();
                        }
                        
                    }, startTime - new Date().getTime(), java.util.concurrent.TimeUnit.MILLISECONDS);
    }
}
