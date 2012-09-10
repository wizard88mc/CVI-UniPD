package org.java_websocket.util;

import java.io.File;
import java.sql.*;
import java.util.Calendar;
import java.util.Properties;

/**
 *
 * @author Matteo
 */
public class DatabaseManager {
    
    private String DATABASE_NAME = "cvi_database";
    private String USERNAME = "mciman";
    private String PASSWORD = "0ofjH1bq";
    private String HOST = "localhost";
    private String PORT = "3306";
    private Connection connect = null;
    
    public DatabaseManager() {
        try {
            
            Class.forName("com.mysql.jdbc.Driver");
            Properties connectionProperties = new Properties();
            connectionProperties.put("user", USERNAME);
            connectionProperties.put("password", PASSWORD);

            connect = DriverManager.getConnection("jdbc:mysql://"
                    + HOST + ":" + PORT + "/" + DATABASE_NAME, connectionProperties);
            
        }
        catch(ClassNotFoundException exc) {
            System.out.println("No driver for MySQL connection: " + exc.toString());
        }
        catch(SQLException exc) {
            System.out.println("Unable to connect to DB, " + exc.toString());
        }
    }
    
    public String getTodayString() {
        Calendar now = Calendar.getInstance();
        String today = now.get(Calendar.YEAR) + "-" + 
                    (now.get(Calendar.MONTH) + 1) + "-" + 
                    now.get(Calendar.DATE);
        
        return today;
    }
    
    public String getPatientName(String patientID) {
        
        try {
            Statement querySelectPatientID = connect.createStatement(); 
            ResultSet resultQuerySelectPatientID = 
                    querySelectPatientID.executeQuery("SELECT Name, Surname " +
                    "FROM Patients " +
                    "WHERE ID = " + patientID);
            
            if (resultQuerySelectPatientID.first()) {
                String name = resultQuerySelectPatientID.getString("Name");
                String surname = resultQuerySelectPatientID.getString("Surname");
                
                return name + " " + surname;
            }
            else {
                System.out.println("No patient with the specified ID");
                System.out.println("ID Provided: " + patientID);
                return "";
            }
        }
        catch(SQLException exc) {
            System.out.println("Error in query getPatientName: " + exc.toString());
            return "";
        }
    }
    
    public String getMachineOffset(int machineID) {
        try {
            Statement selectMachineOffset = connect.createStatement(); 
            ResultSet resultQueryMachineOffset = 
                    selectMachineOffset.executeQuery("SELECT Offset " +
                    "FROM MachinesOffset " +
                    "WHERE ID = " + machineID);
            
            if (resultQueryMachineOffset.first()) {
                
                return resultQueryMachineOffset.getString("Offset");
            }
            else {
                System.out.println("No machine with the specified ID");
                System.out.println("ID Provided: " + machineID);
                return "";
            }
        }
        catch(SQLException exc) {
            System.out.println("Error in query getPatientName: " + exc.toString());
            return "";
        }
    }
    
    public int insertNewMachineOffset(String offset) {
        
        try {
            
            String today = getTodayString();
            
            
            Statement insertNewMachine = connect.createStatement();
            return 1;
            /*int rowAffected = insertNewMachine.executeUpdate(
                    "INSERT INTO MachinesOffset(Offset, DateOffsetCalculation) " + 
                    "VALUES ( '" + offset + "', '" + today + "')", 
                    Statement.RETURN_GENERATED_KEYS);
            
            if (rowAffected == 1) {
                ResultSet result = insertNewMachine.getGeneratedKeys();
                result.first();
                return result.getInt(1);
            }
            else {
                return -1;
            }*/
            
        }
        catch(SQLException exc) {
            System.out.println("Error in query insertNewMachineOffset: " + 
                    exc.toString());
            
            return -1;
        }
        
    }
    
    public int getGameID(String gameIdentificator) {
        
        try {
            Statement statement = connect.createStatement();
            ResultSet resultQueryGetGameID = statement.executeQuery("SELECT ID " + 
                    "FROM Games " + 
                    "WHERE Identification = \"" + gameIdentificator + "\"");
            
            if (resultQueryGetGameID.first()) {
                return resultQueryGetGameID.getInt("ID");
            }
            else {
                System.out.println("No game for specified Identification");
                return -1;
            }
            
        }
        catch(SQLException exc) {
            System.out.println("Error in getGameID: " + exc.toString());
            return -1;
        }
    }
    
    public String getGameIdentification(String gameID) {
        
        try {
            Statement statement = connect.createStatement();
            ResultSet resultQueryGetGameIdentification = statement.executeQuery(
                    "SELECT Identification FROM Games WHERE ID = " + gameID
                    );
            
            if (resultQueryGetGameIdentification.first()) {
                return resultQueryGetGameIdentification.getString("Identification");
            }
            else {
                System.out.println("No game found with this ID: " + gameID);
                return "";
            }
        }
        catch(SQLException exc) {
            System.out.println("Error in query getGameIdentification: " + exc.toString());
            return "";
        }
    }
    
    public int insertNewVisit(int patientID, int gameID) {
        
        try {
            String today = getTodayString();
            Statement statement = connect.createStatement();
            int rowAffected = statement.executeUpdate("INSERT INTO Visits (Date, IDPatient, IDGame) " + 
                    "VALUES ('" + today + "', " + patientID + ", " + gameID + ")",
                    Statement.RETURN_GENERATED_KEYS);
            
            if (rowAffected == 1) {
                ResultSet result = statement.getGeneratedKeys();
                result.first();
                return result.getInt(1);
            }
            else {
                return 0;
            }
        }
        catch(SQLException exc) {
            System.out.println("Error in insertNewVisit: " + exc.toString());
            return 0;
        }
    }
    
    public void setFolder(int visitID, String folder) {
        
        folder = folder.replace(File.separator, "/");
        try {
            Statement statement = connect.createStatement();
            statement.executeUpdate("UPDATE Visits SET Folder = \"" + folder + "\" "
                    + "WHERE ID = " + visitID);
        }
        catch(SQLException exc) {
            System.out.println("Error in setFolder: " + exc.toString());
        }
    }
    
    public boolean insertResultsCatchMeGame(int visitID, double touchEval, double eyeEval) {
        
        try {
            Statement statement = connect.createStatement();
            int rowAffected = statement.executeUpdate("INSERT INTO CatchMeEvaluation " +
                    "(IDVisit, TouchEvaluation, EyeEvaluation) VALUES " +
                    "(" + visitID + "," + touchEval + "," + eyeEval + ")");
            
            if (rowAffected == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        catch(SQLException exc) {
            System.out.println("Error in insertResultsCatchMe: " + exc.toString());
            return false;
        }
    }
    
    public boolean insertResultsHelpMeGame(int visitID, float meanFRT, float meanCT, int correct, int wrong) {
        
        try {
            Statement statement = connect.createStatement();
            int rowAffected = statement.executeUpdate("INSERT INTO HelpMeEvaluation " +
                    "(IDVisit, FirstResponseTime, CompletionTime, CorrectAnswers, WrongAnswers) " +
                    "VALUES (" + visitID + "," + meanFRT + "," + meanCT + 
                    "," + correct + "," + wrong + ")");
            
            if (rowAffected == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        catch(SQLException exc) {
            System.out.println("Error in insertResultsHelpMe: " + exc.toString());
            return false;
        }
    }
   
    public static void main(String args[]) {
        /*System.out.println(*/new DatabaseManager().insertNewMachineOffset("1.0208333333333335,-0.575")/*)*/;
    }
}
