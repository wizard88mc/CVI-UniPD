package org.java_websocket;

import java.net.UnknownHostException;
import java.util.ArrayList;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.java_websocket.Messages.DoctorClientPacket;
import org.java_websocket.MessagesManagers.CatchMeMessagesManager;
import org.java_websocket.MessagesManagers.HelpMeMessagesManager;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 * 
 * 0.1 First specification of the class
 */
public class DoctorClientManager extends BaseManager {
    
    protected String patientID = null;
    protected ArrayList<String> messagesToSend = new ArrayList<String>();
    
    public DoctorClientManager(int port) throws UnknownHostException {
        super("DOCTOR_CLIENT", port);
    }
    
    @Override
    public void onError(WebSocket client, Exception exc) {
        System.out.println("Error in " + clientType + " Manager, " 
                + exc.toString());
        
        clientConnected = null;
    }
    
    @Override
    public boolean onMessage(WebSocket sender, String message) {
        
        JSONObject packet = (JSONObject)JSONValue.parse(message);
        
        if (packet.get("TYPE").equals("CHANGE_SPEED")) {
            serverManager.messageFromDoctorToClient(packet);
        }
        else if (packet.get("TYPE").equals("STOP_GAME")) {
            serverManager.stopGame(packet);
        }
        else if (packet.get("TYPE").equals("IDENTIFICATION")) {
            
            if (checkClientType((String)packet.get("RESPONSE"))) {
                System.out.println("Identification complete: " + clientType);
                clientConnected = sender;
                JSONObject packetToSend = new JSONObject();
                packetToSend.put("TYPE", "IDENTIFICATION_COMPLETE");
                clientConnected.send(packetToSend.toJSONString());
                
            }
            else {
                System.out.println("Wrong identification type for " + clientType
                        + " Manager");
            }
        }
        else if (packet.get("TYPE").equals("GAME")) {
            if (patientManager != null) {
                patientManager.sendPacket(packet);
                packet.put("RESULT", true);
            }
            else {
                packet.put("RESULT", false);
            }
            
            clientConnected.send(packet.toJSONString());
        }
        else if (packet.get("TYPE").equals("SCREEN_MEASURES")) {
            
            if (patientManager != null) {
                patientManager.sendPacket(packet);
            }
            else {
                packet.put("RESULT", false);
                packet.put("ERROR", "01");
                
                clientConnected.send(packet.toJSONString());
            }
        }
        else if (packet.get("TYPE").equals("GAME_SETTINGS")) {
            System.out.println("GAME_SETTINGS");
            patientManager.sendPacket(packet);
        }
        else if (packet.get("TYPE").equals("START_PRESENTATION") || 
                packet.get("TYPE").equals("GO_BACK")) {
            patientManager.sendPacket(packet);
        }
        else if (packet.get("TYPE").equals("START_TRAINING")) {
            eyeTrackerManager.sendPacket(packet);
        }
        else if (packet.get("TYPE").equals("SESSION_SPECS")) {
            
            // convertire in long e poi in stringhe
            patientID = (String)packet.get("PATIENT_ID");
            String gameIdentification = (String)packet.get("GAME_ID");
            int gameID = dbManager.getGameID(gameIdentification);
            int visitID = dbManager.insertNewVisit(new Integer(patientID), 
                    new Integer(gameID));
            
            System.out.println("Game identification: " + gameIdentification);
            
            if (gameIdentification.equals("CATCH_ME")) {
                messageManager = new CatchMeMessagesManager(patientID, visitID);
                String folder = messageManager.getFolderWhereArchive();
                dbManager.setFolder(visitID, folder);
            }
            else if (gameIdentification.equals("HELP_ME")) {
                messageManager = new HelpMeMessagesManager(patientID, visitID);
                String folder = messageManager.getFolderWhereArchive();
                dbManager.setFolder(visitID, folder);
            }
        }
        else if (packet.get("TYPE").equals("START_GAME")) {
            
            patientID = (String)packet.get("PATIENT_ID");
            String gameIdentification = (String)packet.get("GAME_ID");
            int gameID = dbManager.getGameID(gameIdentification);
            int visitID = dbManager.insertNewVisit(new Integer(patientID), 
                    new Integer(gameID));
            
            System.out.println("Game identification: " + gameIdentification);
            
            if (gameIdentification.equals("CATCH_ME")) {
                messageManager = new CatchMeMessagesManager(patientID, visitID);
                String folder = messageManager.getFolderWhereArchive();
                dbManager.setFolder(visitID, folder);
                patientManager.writeGameSpecs();
            }
            else if (gameIdentification.equals("HELP_ME")) {
                messageManager = new HelpMeMessagesManager(patientID, visitID);
                String folder = messageManager.getFolderWhereArchive();
                dbManager.setFolder(visitID, folder);
            }
            
            messageManager.start();
            serverManager.timeToStart();
        }
        /*else if (packet.get("TYPE").equals("WAITING_PATIENT")) {
            System.out.println("Ricevuta richiesta ID paziente");
            if (patientName != null) {
                System.out.println("Sto inviando Nome paziente");
                JSONObject packetToSend = new JSONObject();
                packetToSend.put("TYPE", "PATIENT_NAME");
                packetToSend.put("NAME", patientName);
                
                clientConnected.send(packetToSend.toJSONString());
                
                for (int i = 0; i < messagesToSend.size(); i++) {
                    try {
                        Thread.sleep(200);
                    }
                    catch(InterruptedException exc) {}
                    clientConnected.send(messagesToSend.get(i));
                }
                
                messagesToSend.clear();
                managerReady();
            }
            
        }*/
        return true;
    }
    
    @Override
    public void onClose(WebSocket client, int code, String reason, boolean remote) {
        System.out.println("Connection closed for " + clientType + " Manager");
        clientConnected = null;
    }
    
    public void sendMessageToDoctorClient(DoctorClientPacket packet) {
        
        if (clientConnected != null) {
            clientConnected.send(packet.toJSONString());
        }
        else {
            messagesToSend.add(packet.toJSONString());
        }
    }
    
    @Override
    public void sendPacket(JSONObject packet) {
        if (clientConnected != null) {
            clientConnected.send(packet.toJSONString());
        }
        else {
            messagesToSend.add(packet.toJSONString());
        }
        
    }
    
    /*public void setPatientID(String patientID) {
        
        System.out.println("DOCTOR_MANAGER: Settaggio ID paziente");
        patientName = dbManager.getPatientName(patientID);
        JSONObject packetToSend = new JSONObject();
        packetToSend.put("TYPE", "PATIENT_NAME");
        packetToSend.put("NAME", patientName);
        
        if (clientConnected != null) {
                
            clientConnected.send(packetToSend.toJSONString());
            
            managerReady();
        }
        else {
            System.out.println("Dottore non ancora connesso");
        }
    }*/
    
    /*@Override
    public long managerReady() {
        
        serverManager.doctorClientReady();
        return 0;
    }*/
}
