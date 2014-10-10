package org.java_websocket;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 1.0
 */

import java.net.BindException;
import java.net.UnknownHostException;
import java.util.Date;
import javax.swing.JOptionPane;
import org.java_websocket.eyetracker.EyeTribeTracker;
import org.json.simple.JSONObject;

public class ServerManager {
    
    private EyeTrackerManager clientEyeTracker = null;
    private IPADClientManager clientChild = null;
    private DoctorClientManager clientDoctor = null;
    
    private boolean eyeTrackerReady = false;
    private boolean gameReady = false;
    private boolean doctorClientReady = false;
    
    protected void timeToStart() 
    {
        long minimumIncrement = 5000;
        
        long timeToStart = new Date().getTime() + minimumIncrement;
        clientEyeTracker.comunicateStartTime(timeToStart);
        clientChild.comunicateStartTime(timeToStart);
    }
    
    public void startManagers() {
        
        clientEyeTracker.start();
        clientChild.start();
        clientDoctor.start();
    }
    
    public void stopGame(JSONObject packet) 
    {
        clientEyeTracker.sendPacket(packet);
        clientChild.sendPacket(packet);
        clientDoctor.sendPacket(packet);
        WebSocketWithOffsetCalc.messageManager.gameIsEnded();
    }
    
    public void messageFromDoctorToClient(JSONObject packet) {
        
        clientChild.sendPacket(packet);
    }
    
    public ServerManager() throws UnknownHostException
    {
        int eyeTrackerPort = 8000;
        int ipadPort = 8001;
        int doctorPort = 8002;
        
        clientDoctor = new DoctorClientManager(doctorPort);
        clientEyeTracker = new EyeTrackerManager(eyeTrackerPort);
        clientChild = new IPADClientManager(ipadPort);
        
        WebSocketWithOffsetCalc.setDoctorClientManager(clientDoctor);
    }
    
    public void stopEverything()
    {
        try
        {
            clientDoctor.stop();
            clientEyeTracker.stop();
            clientChild.stop();
        }
        catch(Exception exc) 
        {
            exc.printStackTrace();
        }
        
    }
    
    /* Definire un metodo che permetta di chiudere applicazione
     * che deve però essere invocato da un utente esterno
     */
    public static void main(String args[]) {
        WebSocket.DEBUG = false;
        String host = "localhost";
        
        if (args.length != 0) {
            host = args[0];
        }
        System.out.println(host);
        
        ServerManager manager = null;
        
        try {
            
            manager = new ServerManager();
            BaseManager.setServerManager(manager);
            
            manager.startManagers();
            
            System.out.println("Server Started");
            
            Thread.sleep(3000);
            EyeTribeTracker eyeTracker = new EyeTribeTracker(host, 8000);
            eyeTracker.connect();
            
            //EyeTrackerSimulator simulator = new EyeTrackerSimulator(host, 8000);
            //simulator.connect();
        }
        catch(BindException exc) {
            JOptionPane.showMessageDialog(null, "Un'altra istanza del programma è già avviata.\n Chiuderla e riavviare.", 
                    "Errore", JOptionPane.ERROR_MESSAGE);
        }
        catch (Exception exc) {
            if (exc.getMessage().equals("EXCEPTION_NO_EYE_TRIBE_SERVER_RUNNING"))
            {
                JOptionPane.showMessageDialog(null, "Eye Tribe non partito. E' stato attivato il programma necessario?", 
                        "Tracker non avviato", JOptionPane.ERROR_MESSAGE);
            }
            //exc.printStackTrace();
            if (manager != null)
            {
                manager.stopEverything();
                System.exit(0);
            }
        }
    }
    
}
