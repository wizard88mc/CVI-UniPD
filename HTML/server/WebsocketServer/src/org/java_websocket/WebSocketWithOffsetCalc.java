package org.java_websocket;

import java.net.UnknownHostException;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
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
    //protected static IPADClientManager patientManager = null;
    protected TimeSyncCalculator offsetCalculator = new TimeSyncCalculator();
    protected long timeStartPacket = 0L;
    
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
            boolean correctClient = checkClientType((String)packet.get("DATA"));
            
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
            
            System.out.println("StartOffsetCalculation");
            offsetCalculated = true;
            sendPacketOffsetCalculation();
        }
        else if (packet.get("TYPE").equals("MACHINE_ID")) {
                
            if (packet.get("DATA") != null && 
                    !packet.get("DATA").equals("")) {
                
                machineID = new Integer((String)packet.get("DATA"));
            }
                
            ArrayList result = dbManager.getMachineOffset(machineID);
                
            if (result.isEmpty()) {
                    
                JSONObject packetStartCalcultation = new JSONObject();
                packetStartCalcultation.put("TYPE", "OFFSET_CALCULATION");
                packetStartCalcultation.put("TODO", "true");
                packetStartCalcultation.put("MANDATORY", "true");

                clientConnected.send(packetStartCalcultation.toJSONString());
            }
            else {
                // creo data e verifico se va bene oppure no
                try {
                    DateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
                    Date dateCalculation = (Date)formatter.parse((String)result.get(1));
                    Date today = new Date();

                    long difference = today.getTime()
                            - dateCalculation.getTime();

                    long maxDifference = (long)1000 * 60 * 60 * 24 * 31;

                    if (difference > maxDifference) {

                        JSONObject packetMaybeCalculation = new JSONObject();
                        packetMaybeCalculation.put("TYPE", "OFFSET_CALCULATION");
                        packetMaybeCalculation.put("TODO", "true");
                        packetMaybeCalculation.put("MANDATORY", "false");

                        clientConnected.send(packetMaybeCalculation.toJSONString());
                    }
                    else {

                        JSONObject packetAlreadySync = new JSONObject();
                        packetAlreadySync.put("TYPE", "OFFSET_CALCULATION");
                        packetAlreadySync.put("TODO", "false");

                        clientConnected.send(packetAlreadySync.toJSONString());
                    }
                }
                catch(ParseException exc) {
                    System.out.println(exc.toString());
                }

                String[] components = ((String)result.get(0)).split(",");
                valuea12 = Double.parseDouble(components[0]);
                valueb12 = Double.parseDouble(components[1]);

            }
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
        machineID = 0;
    }
    
    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        System.out.println(clientType + " disconnected");
        clientConnected = null;
        machineID = 0;
    }
    
    private void sendPacketOffsetCalculation() {
        
        JSONObject packetToSend = new JSONObject();
        packetToSend.put("TYPE", "CALCULATING");
        timeStartPacket = System.currentTimeMillis();
        clientConnected.send(packetToSend.toJSONString());
    }
    
    private void performOffsetCalculation(JSONObject packet, long millisecondsReception) {
        
        // eseguo operazione di calcolo, poi nel caso non vada bene
        // rispedisco pacchetto
        boolean operationComplete = offsetCalculator.newPacket(
                timeStartPacket, (Long)packet.get("DATA"), millisecondsReception);
        
        if (operationComplete) {
            
            DecimalFormat twoDigits = new DecimalFormat("###.#");
            twoDigits.setMaximumFractionDigits(1);
            try {
                valuea12 = Double.parseDouble(twoDigits.format(offsetCalculator.getFinalA12()).replace(",", "."));
                valueb12 = Double.parseDouble(twoDigits.format(offsetCalculator.getFinalB12()).replace(",", "."));
            }
            catch(NumberFormatException exc) {
                System.out.println("Errore format: " + exc.toString());
            }
            
            int newMachineID = dbManager.insertNewMachineOffset(valuea12 + "," + valueb12,
                    machineID);

            JSONObject packetToSend = new JSONObject();
                packetToSend.put("TYPE", "OFFSET_CALCULATION_COMPLETE");
            
            if (machineID == 0) {
                
                packetToSend.put("MACHINE_ID", newMachineID);
            }
            else {
                packetToSend.put("MACHINE_ID", machineID);
            }
            
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
