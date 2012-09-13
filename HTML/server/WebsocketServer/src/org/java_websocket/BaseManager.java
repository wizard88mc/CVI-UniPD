package org.java_websocket;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import org.java_websocket.MessagesManagers.BaseMessagesManager;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.util.DatabaseManager;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 * 
 * v 0.1 First specification of the class
 */
public abstract class BaseManager extends WebSocketServer {
    
    protected String clientType = null;
    protected static ServerManager serverManager;
    protected WebSocket clientConnected = null;
    public static DatabaseManager dbManager = null;
    protected static BaseMessagesManager messageManager;
    protected static IPADClientManager patientManager = null;
    protected static EyeTrackerManager eyeTrackerManager = null;
    
    public BaseManager(String clientType, int port) throws UnknownHostException {
        super(new InetSocketAddress(port));
        this.clientType = clientType;
        
        if (dbManager == null) {
            dbManager = new DatabaseManager();
        }
    }
    
    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        System.out.println("Opening connection in " + clientType + " Manager");
        JSONObject message = new JSONObject();
        message.put("TYPE", "IDENTIFICATION");
        System.out.println("Sending identification request");
        conn.send(message.toJSONString());
    }
    
    public boolean checkClientType(String answer) {
        return answer.equals(clientType);
    }
    
    public static void setServerManager(ServerManager serverManager) {
        BaseManager.serverManager = serverManager;
    }
    
    public void sendPacket(JSONObject packet) {
        clientConnected.send(packet.toJSONString());
    }
    
    //public abstract long managerReady();
}
