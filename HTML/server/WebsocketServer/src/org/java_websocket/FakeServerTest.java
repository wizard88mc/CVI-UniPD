/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.java_websocket;

import com.sun.xml.internal.ws.transport.http.server.ServerAdapter;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.Scanner;
import org.java_websocket.handshake.ClientHandshake;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

/**
 *
 * @author Matteo
 */
public class FakeServerTest extends WebSocketServer {
    
    public WebSocket client = null;

    @Override
    public boolean onMessage(WebSocket conn, String message) {
        
        JSONObject object = (JSONObject)JSONValue.parse(message);
        
        if (object.get("TYPE").equals("IDENTIFICATION")) {
            client = conn;
            
            JSONObject packetToSend = new JSONObject();
            packetToSend.put("TYPE", "IDENTIFICATION_COMPLETE");
            client.send(packetToSend.toJSONString());
        }
        else if (object.get("TYPE").equals("MACHINE_ID")) {
            
            String machineID = "";
            
            if (object.get("DATA") != null && object.get("DATA") != "") {
                machineID = (String)object.get("DATA");
            }
            Scanner sc = new Scanner(System.in);
            System.out.println("L'eye tracker ha appena spedito il suo ID: " + 
                    machineID);
            System.out.println("Che operazione si vuole eseguire?");
            System.out.println("5 - Nessuna sincronizzazione");
            System.out.println("6 - Sincronizza");
            
            int answer = sc.nextInt();
            
            switch(answer) {
                case 5: {
                    JSONObject packetAlreadySync = new JSONObject();
                    packetAlreadySync.put("TYPE", "OFFSET_CALCULATION");
                    packetAlreadySync.put("TODO", "false");
                    
                    client.send(packetAlreadySync.toJSONString());
                    break;
                }
                case 6: {
                    JSONObject packetStartCalcultation = new JSONObject();
                    packetStartCalcultation.put("TYPE", "OFFSET_CALCULATION");
                    packetStartCalcultation.put("TODO", "true");
                    packetStartCalcultation.put("MANDATORY", "true");
                    
                    client.send(packetStartCalcultation.toJSONString());
                    break;
                }
            }
        }
        else if (object.get("TYPE").equals("START_OFFSET_CALCULATION")) {
            
            
        }
        
        System.out.println("MESSAGE RECEIVED");
        System.out.println(message);
        System.out.println("* * * * * * * * * * * * * ");
        System.out.println("");
        
        return true;
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        
        JSONObject message = new JSONObject();
        message.put("TYPE", "IDENTIFICATION");
        conn.send(message.toJSONString());
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        
        System.out.println("CLOSED CONNECTION");
        System.out.println(reason);
    }

    public FakeServerTest(int port) throws UnknownHostException {
        
        super(new InetSocketAddress(port));
    }
    
    public static void main(String args[]) {
        
        int eyeTrackerPort = 8000;
        String host = "localhost";
        
        if (args.length != 0) {
            host = args[0];
        }
        
        try {
            FakeServerTest serverTest = new FakeServerTest(eyeTrackerPort);
            
            boolean end = false;
            Scanner sc = new Scanner(System.in);
            
            while (!end) {
                
                System.out.println("Digitare il codice del pacchetto che si vuole"
                        + " spedire all'eye-tracker");
                System.out.println("1 - Spedisci misure schermo");
                System.out.println("2 - Spedisci impostazioni training");
                System.out.println("3 - Esci");
                
               int result = sc.nextInt();
               
               switch(result) {
                   
                   case 1: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "SCREEN_MEASURES");
                       packet.put("SCREEN_WIDTH", 800);
                       packet.put("SCREEN_HEIGHT", 600);
                       serverTest.client.send(packet.toJSONString());
                       break;
                       
                   }
                   case 2: {
                       JSONObject packet = new JSONObject();
                       packet.put("TYPE", "TRAINING_SETTINGS");
                       serverTest.client.send(packet.toJSONString());
                       break;
                   }
                   case 3: {
                       end = true;
                       break;
                   }
               }
                
            }
            
            if (serverTest.client != null) {
                serverTest.client.close(0);
            }
            
            serverTest = null;
        }
        catch(UnknownHostException exc) {
            System.out.println("Error in creating Fake Server");
            System.out.println(exc.toString());
        }
       
        
    }
    
}
