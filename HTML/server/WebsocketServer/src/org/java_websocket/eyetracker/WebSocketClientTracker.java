/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package org.java_websocket.eyetracker;

import java.net.URI;
import java.util.Date;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.java_websocket.EyeTrackerSimulator;
import org.java_websocket.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

/**
 *
 * @author Matteo
 */
public class WebSocketClientTracker extends WebSocketClient {
    
    private EyeTribeTracker eyeTribeTracker;
    private long startTime;
    
    public WebSocketClientTracker(String host, EyeTribeTracker eyeTribeTracker) 
            throws Exception {
        super(new URI(host));
        
        this.eyeTribeTracker = eyeTribeTracker;
    }

    @Override
    public void onOpen(ServerHandshake handshakedata) {
        System.out.println("OnOpen EyeTracker");
    }

    @Override
    public void onMessage(String message) {

        /**
         * Method to handle messages for the manager
         */
        JSONObject packet = (JSONObject)JSONValue.parse(message);

        if (packet.get("TYPE").equals("CALCULATING")) {

            //try {
                //Thread.sleep(200);
                packet.put("DATA", System.currentTimeMillis());
                //Thread.sleep(200);
            //}
            //catch(InterruptedException exc) {}
            this.send(packet.toJSONString());
        }
        else if (packet.get("TYPE").equals("START_WORKING")) {

            System.out.println("EYE_TRACKER: Start game");
            startTime = (Long)packet.get("START_TIME");
            long now = new Date().getTime();

            //work = true;
            //startTime = now + 5000;

            /*Executors.newSingleThreadScheduledExecutor()
                    .schedule(EyeTrackerSimulator.this, startTime - now, 
                        TimeUnit.MILLISECONDS);
            /*Executors.newSingleThreadScheduledExecutor()
                    .schedule(EyeTrackerSimulator.this, 5000, TimeUnit.MILLISECONDS);*/
        }
        else if (packet.get("TYPE").equals("STOP_GAME")) {
            //work = false;
        }
        else if (packet.get("TYPE").equals("IDENTIFICATION")) {
            System.out.println("EYE_TRACKER: Identification");

            packet.put("DATA", "EyeTrackerClient");
            this.send(packet.toJSONString());
        }
        else if (packet.get("TYPE").equals("IDENTIFICATION_COMPLETE")) {
            System.out.println("EYE_TRACKER: Identification complete");
            // Inizio sincronizzazione tempi se non ho salvato da 
            // qualche parte ID della macchina 

            JSONObject packetToSend = new JSONObject();
            packetToSend.put("TYPE", "MACHINE_ID");
            packetToSend.put("DATA", "194");

            this.send(packetToSend.toJSONString());
        }
        /**
         * Start Training
         */
        else if (packet.get("TYPE").equals("START_TRAINING")) {
            //EyeTrackerSimulator.this.simulateTraining(packet);
        }
        else if (packet.get("TYPE").equals("TRAINING_SESSION")) {

            packet.put("DATA", "true");
            this.send(packet.toJSONString());
        }
        else if (packet.get("TYPE").equals("OFFSET_CALCULATION")) {

            if (packet.get("TODO").equals("true")) {
                JSONObject packetToSend = new JSONObject();
                packetToSend.put("TYPE", "START_OFFSET_CALCULATION");

                this.send(packetToSend.toJSONString());
            }
            else {
                JSONObject packetToSend = new JSONObject();
                packetToSend.put("TYPE", "READY_TO_PLAY");

                this.send(packetToSend.toJSONString());
            }
        }
        else if (packet.get("TYPE").equals("OFFSET_CALCULATION_COMPLETE")) {
            System.out.println("EYE: Fine calcolo offset");
            // Calcolo dell'offset completato
            int machineID = ((Long)packet.get("MACHINE_ID")).intValue();
            // salvo machineID in quache posto

            JSONObject packetToSend = new JSONObject();
            packetToSend.put("TYPE", "READY_TO_PLAY");

            this.send(packetToSend.toJSONString());
        }
        else if (packet.get("TYPE").equals("SCREEN_MEASURES")) {
            System.out.println("EYE TRACKER: Screen dimensions received");

            eyeTribeTracker.setScreenWidthAndHeight((Long)packet.get("SCREEN_WIDTH"), 
                    (Long)packet.get("SCREEN_HEIGHT"));
        }
        else if (packet.get("TYPE").equals("TRAINING_SETTINGS")) {
            //EyeTrackerSimulator.this.simulateTraining(packet);
        }

    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("OnClose EyeTracker");
    }

    @Override
    public void onError(Exception ex) {
        System.out.println("onError EyeTracker");
        System.out.println(ex.toString());
    }
            
}