/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.java_websocket;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Scanner;
import org.java_websocket.framing.CloseFrame;
import org.java_websocket.handshake.ClientHandshake;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

/**
 *
 * @author Matteo
 */
public class FakeServerTest extends WebSocketServer {
    
    public WebSocket client = null;
    
    public void printStringInstructions() {
     
        System.out.println("Digitare il codice del pacchetto che si vuole"
                        + " spedire all'eye-tracker");
        System.out.println("0 - Esci");
        System.out.println("1 - IDENTIFICATION_COMPLETE");
        System.out.println("2 - OFFSET_CALCULATION");
        System.out.println("3 - CALCULATING");
        System.out.println("4 - OFFSET_CALCULATION_COMPLETE");
        System.out.println("5 - TRAINING_SESSION");
        System.out.println("6 - SCREEN_MEASURES");
        System.out.println("7 - START_TRAINING");
        System.out.println("8 - VALIDATE_TRAINING");
        System.out.println("9 - START_WORKING");
        System.out.println("10 - STOP_GAME");
    }

    @Override
    public boolean onMessage(WebSocket conn, String message) {
        
        JSONObject object = (JSONObject)JSONValue.parse(message);
        
        System.out.println("MESSAGE RECEIVED");
        System.out.println(object);
        System.out.println("* * * * * * * * * * * * * ");
        System.out.println("");
        
        if (object.get("TYPE").equals("IDENTIFICATION")) {
            if (object.get("DATA").equals("EyeTrackerClient")) {
                client = conn;
            }
        }
        
        this.printStringInstructions();
        
        return true;
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        
        System.out.println("Apertura connessione");
        JSONObject message = new JSONObject();
        message.put("TYPE", "IDENTIFICATION");
        conn.send(message.toJSONString());
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        
        System.out.println("CLOSED CONNECTION");
        System.out.println(code);
        System.out.println(reason);
    }

    public FakeServerTest(int port) throws UnknownHostException {
        
        super(new InetSocketAddress(port));
    }
    
    public static void main(String args[]) {
        
        int eyeTrackerPort = 8000;
        String host = "ciman.math.unipd.it";
        host = "localhost";
        
        if (args.length != 0) {
            host = args[0];
        }
        
        try {
            FakeServerTest serverTest = new FakeServerTest(eyeTrackerPort);
            serverTest.start();
            
            boolean end = false;
            Scanner sc = new Scanner(System.in);
            
            while (!end) {
                
                serverTest.printStringInstructions();
                
               int result = sc.nextInt();
               
               switch(result) {
                   case 0: {
                       System.out.println("Closing");
                       end = true;
                       break;
                   }
                   case 1: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "IDENTIFICATION_COMPLETE");
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 2: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "OFFSET_CALCULATION");
                       packet.put("TODO", "true");
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 3: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "CALCULATING");
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 4: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "OFFSET_CALCULATION_COMPLETE");
                       packet.put("MACHINE_ID", 100);
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 5: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "TRAINING_SESSION");
                       packet.put("PATIENT_ID", 5);
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 6: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "SCREEN_MEASURES");
                       packet.put("SCREEN_WIDTH", 1280);
                       packet.put("SCREEN_HEIGHT", 1024);
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 7: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "START_TRAINING");
                       packet.put("POINTS", 5); // numero punti
                       packet.put("POINT_DURATION", 2000); // da verificare questo valore
                       packet.put("TRANSITION_DURATION", 2000);
                       packet.put("POINT_DIAMETER", 50);
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 8: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "TRAINING_VALIDATION");
                       packet.put("DATA", true);
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 9: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "START_WORKING");
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 10: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "STOP_GAME");
                       serverTest.client.send(packet.toJSONString());
                   }
               }
            }
            
            serverTest.client.close(CloseFrame.NORMAL);
            try {
                serverTest.stop();
            }
            catch(IOException exc) {System.out.println("Exception");}
        }
        catch(UnknownHostException exc) {
            System.out.println("Error in creating Fake Server");
            System.out.println(exc.toString());
        }
       
        
    }
    
}
