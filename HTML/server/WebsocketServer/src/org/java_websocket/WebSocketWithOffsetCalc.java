package org.java_websocket;

import java.net.UnknownHostException;
import java.text.DecimalFormat;
import java.util.Date;
import org.java_websocket.MessagesManagers.BaseMessagesManager;
import org.java_websocket.util.TimeSyncCalculator;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 */
public abstract class WebSocketWithOffsetCalc extends BaseManager {
    
    protected double valuea12 = 0, valueb12 = 0;
    protected boolean offsetCalculated = false;
    protected boolean endGame = false;
    protected static DoctorClientManager doctorManager = null;
    protected static IPADClientManager patientManager = null;
    protected TimeSyncCalculator offsetCalculator = new TimeSyncCalculator();
    
    WebSocketWithOffsetCalc(String clientType, int port) throws UnknownHostException {
        super(clientType, port);
    }
    
    public static void setDoctorClientManager(DoctorClientManager manager) {
        doctorManager = manager;
        BaseMessagesManager.setDoctorClient(doctorManager);
    }
    
    @Override
    public boolean onMessage(WebSocket conn, String message) {
        
        long dateReception = System.currentTimeMillis();
        JSONObject packet = (JSONObject)JSONValue.parse(message);
        boolean managed = true;
        
        if (packet.get("TYPE").equals("CALCULATING")) {
            
            performOffsetCalculation(packet, dateReception);
        }
        else if (packet.get("TYPE").equals("STOP_GAME")) {
            endGame = true;
            serverManager.stopGame(packet);
        }
        else if (packet.get("TYPE").equals("IDENTIFICATION")) {
            
            // identificazione del client
            System.out.println("Verifica identità client");
            boolean correctClient = checkClientType((String)packet.get("response"));
            
            if (correctClient) {
                
                // Client che richiede connessione è corretto
                System.out.println("Client Corretto");
                clientConnected = conn;
                JSONObject packetToSend = new JSONObject();
                packetToSend.put("TYPE", "IDENTIFICATION_COMPLETE");
                clientConnected.send(packetToSend.toJSONString());
            }
            else {
                // Something wrong
                System.out.println("Not correct client");
            }
        }
        else if (packet.get("TYPE").equals("START_OFFSET_CALCULATION")) {
            
            System.out.println("Inizio calcolo offset");
            offsetCalculated = true;
            sendPacketOffsetCalculation();
            System.out.println("StartOffsetCalculation");
        }
        else {
            return false;
        }
        
        return true;
    }
    
    @Override
    public void onError(WebSocket conn, Exception exc) {
        System.out.println("Error by: " + clientType);
        System.out.println("Error in socket " + exc.getMessage() + exc.toString());
        exc.printStackTrace();
        clientConnected = null;
    }
    
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println(clientType + " disconnected");
        clientConnected = null;
    }
    
    private void sendPacketOffsetCalculation() {
        
        JSONObject packetToSend = new JSONObject();
        packetToSend.put("TYPE", "CALCULATING");
        packetToSend.put("START_SERVER_TIME", System.currentTimeMillis());
        clientConnected.send(packetToSend.toJSONString());
    }
    
    private void performOffsetCalculation(JSONObject packet, long millisecondsReception) {
        
        // eseguo operazione di calcolo, poi nel caso non vada bene
        // rispedisco pacchetto
        boolean operationComplete = offsetCalculator.newPacket(
                (Long)packet.get("START_SERVER_TIME"), 
                (Long)packet.get("CLIENT_TIME"), millisecondsReception);
        
        if (operationComplete) {
            
            DecimalFormat twoDigits = new DecimalFormat();
            twoDigits.setMaximumFractionDigits(1);
            try {
                valuea12 = Double.parseDouble(twoDigits.format(offsetCalculator.getFinalA12()).replace(",", "."));
                valueb12 = Double.parseDouble(twoDigits.format(offsetCalculator.getFinalB12()).replace(",", "."));
            }
            catch(NumberFormatException exc) {
                System.out.println("Errore format: " + exc.toString());
                valuea12 = offsetCalculator.getFinalA12();
                valueb12 = offsetCalculator.getFinalB12();
            }
            
            int machineID = dbManager.insertNewMachineOffset(valuea12 + "," + valueb12);

            JSONObject packetToSend = new JSONObject();
            packetToSend.put("TYPE", "OFFSET_CALCULATION_COMPLETE");
            packetToSend.put("MACHINE_ID", machineID);

            System.out.println("Invio pacchetto fine calcolo offset");
            clientConnected.send(packetToSend.toJSONString());
        }
        else {
            sendPacketOffsetCalculation();
        }
        
    }
    
    /***
     * Comunica al client connesso la data di inizio gioco oppure tracciamento
     * occhi
     * @param time: time to start the game
     */
    public void comunicateStartTime(long time) {
        
        JSONObject packetToSend = new JSONObject();
        packetToSend.put("TYPE", "START_WORKING");
        packetToSend.put("START_TIME", calculateTimeWithOffset(time));
        clientConnected.send(packetToSend.toJSONString());
        messageManager.startTime = time;
    }
    
    public long calculateTimeWithOffset(long baseTime) {
        
        System.out.println("Tempo ricevuto: " + baseTime);
        System.out.println("Value a12: " + valuea12);
        System.out.println("Value b12: " + valueb12);
        long time = (long)((baseTime - valueb12) / valuea12);
        System.out.println(time);
        System.out.println(new Date(time));
        return time;
    }
}
