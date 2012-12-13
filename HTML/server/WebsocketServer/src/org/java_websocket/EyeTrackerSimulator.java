package org.java_websocket;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

import java.net.URI;
import java.util.Date;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.java_websocket.handshake.ServerHandshake;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

public class EyeTrackerSimulator extends Thread {

    private WebSocketClient clientConnecter = null;
    private long startTime = 0;
    private String host = null;
    private boolean work = true;
    private long screenWidth = 0L;
    private long screenHeight = 0L;
    
    public EyeTrackerSimulator(String host, int port) throws Exception {
        
        //host = "ciman.math.unipd.it";
        this.host = new String().concat("ws://")
                .concat(host).concat(":").concat(new Integer(port).toString());
        System.out.println("Creating EyeTracker Client"); 
    }
    
    @Override
    public void run() {
        System.out.println("EYE_TRACKER PARTITO");
        int count = 0;
        long valuex = 0, valuey = 0;
        while (work) {
            try {
                
                Thread.sleep(1000 / 25);
            }
            catch(Exception exc) {
                System.out.println("Error in EyeTracker");
            }
            JSONObject message = new JSONObject();
            message.put("TYPE", "EYE_TRACKER_DATA");
            message.put("TIME", new Date().getTime() - startTime);
            if (count % 40 == 0) {
                valuex = (long)(Math.random() * 1360);
                valuey = (long)(Math.random() * 643);
                count = 0;
            }
            message.put("POSX", valuex);
            message.put("POSY", valuey);
            clientConnecter.send(message.toJSONString());
            count++;
        }
        System.out.println("*** EYE TRACKER STOPPED ***");
    }
    
    public void simulateTraining() {
        
        Thread simulator = new Thread() {
            @Override
            public void run() {
                
                long timeToWait = 10000;
                try {
                
                    Thread.sleep((long)(1000));
                }
                catch(Exception exc) {
                    System.out.println("Error in EyeTracker");
                }
                
                JSONObject firstMessage = new JSONObject();
                firstMessage.put("TYPE", "TRAINING_POSITIONS");
                firstMessage.put("POS_LEFT", Math.random() * screenWidth);
                firstMessage.put("POS_TOP", Math.random() * screenHeight);
                
                clientConnecter.send(firstMessage.toJSONString());
                
                try {
                
                    Thread.sleep((long)(timeToWait));
                }
                catch(Exception exc) {
                    System.out.println("Error in EyeTracker");
                }
                JSONObject secondMessage = new JSONObject();
                secondMessage.put("TYPE", "TRAINING_POSITIONS");
                secondMessage.put("POS_LEFT", Math.random() * screenWidth);
                secondMessage.put("POS_TOP", Math.random() * screenHeight);
                
                clientConnecter.send(secondMessage.toJSONString());
                
                try {
                
                    Thread.sleep((long)(timeToWait));
                }
                catch(Exception exc) {
                    System.out.println("Error in EyeTracker");
                }
                
                JSONObject thirdMessage = new JSONObject();
                thirdMessage.put("TYPE", "TRAINING_POSITIONS");
                thirdMessage.put("POS_LEFT", Math.random() * screenWidth);
                thirdMessage.put("POS_TOP", Math.random() * screenHeight);
                
                clientConnecter.send(thirdMessage.toJSONString());
                
                try {
                
                    Thread.sleep((long)(timeToWait));
                }
                catch(Exception exc) {
                    System.out.println("Error in EyeTracker");
                }
                
                JSONObject fourthMessage = new JSONObject();
                fourthMessage.put("TYPE", "TRAINING_POSITIONS");
                fourthMessage.put("POS_LEFT", Math.random() * screenWidth);
                fourthMessage.put("POS_TOP", Math.random() * screenHeight);
                
                clientConnecter.send(fourthMessage.toJSONString());
                
                try {
                
                    Thread.sleep((long)(timeToWait));
                }
                catch(Exception exc) {
                    System.out.println("Error in EyeTracker");
                }
                
                JSONObject finalMessage = new JSONObject();
                finalMessage.put("TYPE", "TRAINING_RESULT");
                finalMessage.put("DATA", 70);
                
                clientConnecter.send(finalMessage.toJSONString());
            }
        };
        
        simulator.start();
    }
    
    public void connect() throws Exception {
        clientConnecter = new WebSocketClient(new URI(host)) {
            
            @Override
            public void onOpen(ServerHandshake handshakedata) {
                System.out.println("OnOpen EyeTracker");
            }

            @Override
            public void onMessage(String message) {
                
                JSONObject packet = (JSONObject)JSONValue.parse(message);
                
                if (packet.get("TYPE").equals("CALCULATING")) {
                    
                    //try {
                        //Thread.sleep(200);
                        packet.put("DATA", System.currentTimeMillis());
                        //Thread.sleep(200);
                    //}
                    //catch(InterruptedException exc) {}
                    clientConnecter.send(packet.toJSONString());
                }
                else if (packet.get("TYPE").equals("START_WORKING")) {
                    
                    System.out.println("EYE_TRACKER: Start game");
                    startTime = (Long)packet.get("START_TIME");
                    long now = new Date().getTime();
                    
                    work = true;
                    //startTime = now + 5000;
                    
                    Executors.newSingleThreadScheduledExecutor()
                            .schedule(EyeTrackerSimulator.this, startTime - now, 
                                TimeUnit.MILLISECONDS);
                    /*Executors.newSingleThreadScheduledExecutor()
                            .schedule(EyeTrackerSimulator.this, 5000, TimeUnit.MILLISECONDS);*/
                }
                else if (packet.get("TYPE").equals("STOP_GAME")) {
                    work = false;
                }
                else if (packet.get("TYPE").equals("IDENTIFICATION")) {
                    System.out.println("EYE_TRACKER: Identification");
                    
                    packet.put("DATA", "EyeTrackerClient");
                    clientConnecter.send(packet.toJSONString());
                }
                else if (packet.get("TYPE").equals("IDENTIFICATION_COMPLETE")) {
                    System.out.println("EYE_TRACKER: Identification complete");
                    // Inizio sincronizzazione tempi se non ho salvato da 
                    // qualche parte ID della macchina 
                    
                    JSONObject packetToSend = new JSONObject();
                    packetToSend.put("TYPE", "MACHINE_ID");
                    packetToSend.put("DATA", "189");
                    
                    clientConnecter.send(packetToSend.toJSONString());
                }
                else if (packet.get("TYPE").equals("START_TRAINING")) {
                    EyeTrackerSimulator.this.simulateTraining();
                }
                else if (packet.get("TYPE").equals("TRAINING")) {
                    
                    packet.put("DATA", true);
                    clientConnecter.send(packet.toJSONString());
                }
                else if (packet.get("TYPE").equals("OFFSET_CALCULATION")) {
                    
                    if (packet.get("TODO").equals("true")) {
                        JSONObject packetToSend = new JSONObject();
                        packetToSend.put("TYPE", "START_OFFSET_CALCULATION");
                        
                        clientConnecter.send(packetToSend.toJSONString());
                    }
                    else {
                        JSONObject packetToSend = new JSONObject();
                        packetToSend.put("TYPE", "READY_TO_PLAY");
                        
                        clientConnecter.send(packetToSend.toJSONString());
                    }
                }
                else if (packet.get("TYPE").equals("OFFSET_CALCULATION_COMPLETE")) {
                    System.out.println("EYE: Fine calcolo offset");
                    // Calcolo dell'offset completato
                    int machineID = ((Long)packet.get("MACHINE_ID")).intValue();
                    // salvo machineID in quache posto
                    
                    JSONObject packetToSend = new JSONObject();
                    packetToSend.put("TYPE", "READY_TO_PLAY");
                    
                    clientConnecter.send(packetToSend.toJSONString());
                }
                else if (packet.get("TYPE").equals("SCREEN_MEASURES")) {
                    System.out.println("EYE TRACKER: Screen dimensions received");
                    
                    screenWidth = ((Long)packet.get(("SCREEN_WIDTH"))).longValue();
                    screenHeight = ((Long)packet.get("SCREEN_HEIGHT")).longValue();
                }
                else if (packet.get("TYPE").equals("TRAINING_SETTINGS")) {
                    EyeTrackerSimulator.this.simulateTraining();
                }
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                System.out.println("OnClose EyeTracker");
            }

            @Override
            public void onError(Exception ex) {
                System.out.println("OnError EyeTracker");
            }
        };
        
        clientConnecter.connect();
    }
    
}
