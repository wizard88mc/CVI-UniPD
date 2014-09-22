/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package org.java_websocket.eyetracker;

import com.theeyetribe.client.GazeManager;
import com.theeyetribe.client.ICalibrationProcessHandler;
import com.theeyetribe.client.ICalibrationResultListener;
import com.theeyetribe.client.IConnectionStateListener;
import com.theeyetribe.client.IGazeListener;
import com.theeyetribe.client.ITrackerStateListener;
import com.theeyetribe.client.data.CalibrationResult;
import com.theeyetribe.client.data.GazeData;
import java.awt.Point;
import java.util.ArrayList;
import org.json.simple.JSONObject;

/**
 *
 * @author Matteo
 */
public class EyeTribeClient {
    
    private static GazeManager gazeManagerSingleton = null;
    private GazeListener gazeListener = null;
    private CalibrationResultListener calibrationResultListener = null;
    private CalibrationManager calibrationManager = null;
    private TrackerStateListener trackerState = null;
    private ConnectionStateListener connectionListener = null;
    
    private EyeTribeTracker eyeTribeTracker = null;
    
    private boolean sendData = false;
    private boolean trackerReady = false;
    private long startTime;
    
    public EyeTribeClient(EyeTribeTracker eyeTribeTracker) {
        
        this.eyeTribeTracker = eyeTribeTracker;
        
        gazeManagerSingleton = GazeManager.getInstance();
        gazeManagerSingleton.activate(GazeManager.ApiVersion.VERSION_1_0, GazeManager.ClientMode.PUSH);
        
        gazeListener = new GazeListener();
        calibrationResultListener = new CalibrationResultListener();
        calibrationManager = new CalibrationManager();
        trackerState = new TrackerStateListener();
        connectionListener = new ConnectionStateListener();
        
        gazeManagerSingleton.addGazeListener(gazeListener);
        gazeManagerSingleton.addCalibrationResultListener(calibrationResultListener);
        gazeManagerSingleton.addTrackerStateListener(trackerState);
        gazeManagerSingleton.addConnectionStateListener(connectionListener);
    }
    
    public EyeTribeClient() 
    {
        this(null);
    }
    
    public void startCalibration() 
    {
        calibrationManager.startCalibration();
    }
    
    /**
     * Calibration has to be set up, it calls the method on th EyeTribeClient
     * @param pointsNumber: number of calibration points
     * @param pointDuration: duration of each point in milliseconds
     * @param transitionDuration: duration of the transition between each point
     * @param pointDiameter: diameter of each calibration point (image width) 
     * @return the list of calibration point
     */
    public ArrayList<Point> prepareCalibration(int pointsNumber, long pointDuration, 
            long transitionDuration, int pointDiameter) 
    {
        
        return calibrationManager.calculateCalibrationPoints(pointsNumber, pointDuration, 
                transitionDuration, pointDiameter);
    }
    
    public void setScreenHeightAndWidth(int screenWidth, int screenHeight)
    {
        //gazeManagerSingleton.switchScreen(0, screenWidth, screenHeight, 
                //screenWidth, screenHeight);
    }
    
    /**
     * Allows the eye tracker to send data to the server
     * @param startTime: the starting time, used to calculate offset of packets
     */
    public void startSendDataToServer(long startTime)
    {
        sendData = true;
        this.startTime = startTime;
    }
    
    /**
     * Stop send data to the server
     */
    public void stopSendDataToServer()
    {
        sendData = false;
    }
    
    private class GazeListener implements IGazeListener 
    {

        @Override
        public void onGazeUpdate(GazeData gazeData) 
        {
            /**
             * When GazeData comes from the EyeTribeServer this method is called
             * Sends data only if calibrated and the system has to track gaze
             * data
             */
            if (gazeManagerSingleton.isCalibrated() && sendData)
            {
                JSONObject packet = new JSONObject();
                packet.put("TIME", gazeData.timeStamp - startTime);
                packet.put("DATA", Math.round(gazeData.rawCoordinates.x) + " " + 
                        Math.round(gazeData.rawCoordinates.y));
                
                eyeTribeTracker.sendGazeData(packet);
            }
        }
    }

    private class CalibrationResultListener implements ICalibrationResultListener 
    {
        @Override
        public void onCalibrationChanged(boolean isCalibrated, CalibrationResult calibResult) 
        {
            /**
             * CalibrationResult != null only when isCalibrated = true
             */
            System.out.println("CalibrationChanged");
            if (isCalibrated) 
            {
                System.out.println(calibResult.toString());
            }
        }
    }
    
    private class CalibrationManager implements ICalibrationProcessHandler 
    {
        
        private ArrayList<Point> listPoint = new ArrayList<Point>();
        private Point centerScreen;
        private long pointDuration;
        private long transitionDuration;
        
        /**
         * Defines the calibration point for the training phase
         * @param pointsNumber: number if training points
         * @param pointDuration: duration of each point (milliseconds)
         * @param transitionDuration: duration of the transition between two points (milliseconds)
         * @param imageWidth: width of the image in pixels
         * @return the list of calibration points
         */
        public ArrayList<Point> calculateCalibrationPoints(int pointsNumber, long pointDuration, 
                long transitionDuration, int imageWidth) 
        {
            if (gazeManagerSingleton.getTrackerState() != 
                    GazeManager.TrackerState.TRACKER_CONNECTED) 
            {
                System.out.println("Tracker not connected");
                return null;
            }
            
            /**
             * If we are recalibrating, recalculate point deleting the oldest one
             */
            if (!listPoint.isEmpty())
            {
                listPoint.clear();
            }
            
            int screenWidth = gazeManagerSingleton.getScreenResolutionWidth();
            int screenHeight = gazeManagerSingleton.getScreenResolutionHeight();
            this.pointDuration = pointDuration;
            this.transitionDuration = transitionDuration;
            this.centerScreen = new Point(screenWidth / 2, screenHeight / 2);
            
            int defaultPixelOffset = 50;
            
            Point firstPoint = new Point(defaultPixelOffset + imageWidth / 2, 
                    defaultPixelOffset + imageWidth / 2);
            listPoint.add(firstPoint);
                
            Point secondPoint = new Point(screenWidth / 2 - imageWidth / 2, 
                    defaultPixelOffset + imageWidth / 2);
            listPoint.add(secondPoint);
                
            Point thirdPoint = new Point(screenWidth - defaultPixelOffset - imageWidth / 2, 
                    defaultPixelOffset + imageWidth / 2);
            listPoint.add(thirdPoint);
            
            if (pointsNumber == 7) 
            {
                listPoint.add(centerScreen);
            }
            else if (pointsNumber == 9) 
            {
                Point fourthPoint = new Point(defaultPixelOffset + imageWidth / 2, 
                        screenHeight / 2);
                listPoint.add(fourthPoint);
                
                listPoint.add(centerScreen);
                
                Point sixthPoint = new Point(screenWidth - defaultPixelOffset - imageWidth / 2, 
                        screenHeight / 2);
                listPoint.add(sixthPoint);
            }
            
            Point fifthPoint = new Point(defaultPixelOffset + imageWidth / 2, 
                    screenHeight - defaultPixelOffset - imageWidth / 2);
            listPoint.add(fifthPoint);
                
            Point sixthPoint = new Point(screenWidth / 2, 
                    screenHeight - defaultPixelOffset - imageWidth / 2);
            listPoint.add(sixthPoint);
                
            Point seventhPoint = new Point(screenWidth - defaultPixelOffset - imageWidth / 2, 
                    screenHeight - defaultPixelOffset - imageWidth / 2);
            listPoint.add(seventhPoint);
            
            if (!gazeManagerSingleton.isActivated()) 
            {
                System.out.println("Eye Tribe not activated");
                return null;
            }
            return listPoint;
        }
        
        public void startCalibration() 
        {
            System.out.println("Screen size: " + gazeManagerSingleton.getScreenResolutionWidth() + 
                    "," + gazeManagerSingleton.getScreenResolutionHeight());
            gazeManagerSingleton.calibrationStart(listPoint.size(), this);
            iterateOnPoints();
        }
        
        private void iterateOnPoints() 
        { 
            System.out.println("Iterate on points");
            for (int i = 0; i < listPoint.size(); i++) 
            {
                System.out.println("Processing point " + i);
                try {
                    Thread.sleep(transitionDuration);
                }
                catch(InterruptedException exc) {}
                System.out.println("Before calibration point start");
                gazeManagerSingleton.calibrationPointStart(listPoint.get(i).x, listPoint.get(i).y);
                try {
                    Thread.sleep(pointDuration);
                }
                catch(InterruptedException exc) {}
                System.out.println("Before calibration point end");
                gazeManagerSingleton.calibrationPointEnd();
            }
        }

        @Override
        public void onCalibrationStarted() 
        {
            /**
             * Called when calibration started
             */
            System.out.println("Calibration started");
        }

        @Override
        public void onCalibrationProgress(double progress) 
        {
            /**
             * Called every time a calibration point is completed
             */
            System.out.println("Progress: " + Double.toString(progress));
        }

        @Override
        public void onCalibrationProcessing() 
        {
            /**
             * Called when all calibration points submitted and calibration processing 
             * begins
             */
        }

        @Override
        public void onCalibrationResult(CalibrationResult calibResult) 
        {
            /**
             * Called when everything completed 
             */
            System.out.println("Calibration result: ");
            System.out.println("Result: " + calibResult.result);
            System.out.println("Average error degree: " + calibResult.averageErrorDegree);
            
            
            JSONObject packet = new JSONObject();
            ArrayList<String> calibrationPoints = new ArrayList<String>();

            for (int i = 0; i < calibResult.calibpoints.length; i++) {
                /*calibrationPoints.add(listPoint.get(i).x + "_" + listPoint.get(i).y + 
                        "_" + calibResult.calibpoints[i].state + "_" + 
                        calibResult.calibpoints[i].accuracy.accuracyDegrees + "_" + 
                        calibResult.calibpoints[i].meanError.meanErrorPixels);*/
                System.out.println("Point: " + i);
                System.out.println("X position: " + calibResult.calibpoints[i].coordinates.x+ ", Y Position: "
                    + calibResult.calibpoints[i].coordinates.y);
                System.out.println("X estimated: " + calibResult.calibpoints[i].meanEstimatedCoords.x + 
                        ", Y position: " + calibResult.calibpoints[i].meanEstimatedCoords.y);
            }
            
            packet.put("RESULT", calibResult.result);
            packet.put("AVERAGE_ERROR", calibResult.averageErrorDegree);
            packet.put("AVERAGE_ERROR_LEFT", calibResult.averageErrorDegreeLeft);
            packet.put("AVERAGE_ERROR_RIGHT", calibResult.averageErrorDegreeRight);
            int stars = 0; 
            if (calibResult.averageErrorDegree < 0.5) 
            {
                stars = 4;
            }
            else  if (calibResult.averageErrorDegree < 0.7)
            {
                stars = 3;
            }
            else if (calibResult.averageErrorDegree < 1)
            {
                stars = 2;
            }
            else if (calibResult.averageErrorDegree < 1.5)
            {
                stars = 1;
            }
            packet.put("STARS", stars);
            //packet.put("CALIBRATION_POINTS", calibrationPoints);
            
            eyeTribeTracker.sendCalibrationResult(packet);
        }
        
    }
    
    private class TrackerStateListener implements ITrackerStateListener 
    {

        @Override
        public void onTrackerStateChanged(int trackerState) 
        {
            /**
             * State of connected Tracker device has changed.
             */
            trackerReady = false;
            if (GazeManager.TrackerState.fromInt(trackerState) == 
                    GazeManager.TrackerState.TRACKER_CONNECTED) 
            {
                System.out.println("Tracker correctly connected");
                trackerReady = true;
            }
            else if (GazeManager.TrackerState.fromInt(trackerState) == 
                    GazeManager.TrackerState.TRACKER_CONNECTED_BADFW) 
            {
                System.out.println("Tracker bad forwarding");
            }
            else if (GazeManager.TrackerState.fromInt(trackerState) == 
                    GazeManager.TrackerState.TRACKER_CONNECTED_NOSTREAM) 
            {
                System.out.println("Tracker not streaming");
            }
            else if (GazeManager.TrackerState.fromInt(trackerState) == 
                    GazeManager.TrackerState.TRACKER_CONNECTED_NOUSB3) 
            {
                System.out.println("Tracker connected to USB3");
            }
            else if (GazeManager.TrackerState.fromInt(trackerState) == 
                    GazeManager.TrackerState.TRACKER_NOT_CONNECTED) 
            {
                System.out.println("Tracker not connected");
            }
        }

        @Override
        public void OnScreenStatesChanged(int screenIndex, int screenResolutionWidth, 
                int screenResolutionHeight, float screenPhysicalWidth, 
                float screenPhysicalHeight) 
        {
            /**
             * main screen index has changed. This is only relevant for multi-screen setups
             */
            System.out.println("Screen changed, new index: " + screenIndex);
            System.out.println("PX Width: " + screenResolutionWidth + ", PX Height: " + screenResolutionHeight);
        }
        
    }
    
    private class ConnectionStateListener implements IConnectionStateListener 
    {

        @Override
        public void onConnectionStateChanged(boolean isConnected) 
        {
            /**
             * Notification when connection to the EyeTribe Server changes
             */
            if (isConnected) 
            {
                System.out.println("Connected to EyeTribe Server");
            }
            else
            {
                System.out.println("Connection lost to EyeTribe Server");
            }
        }
    }
    
    public static void main(String args[]) 
    {
        
        final EyeTribeClient client = new EyeTribeClient();
        //client.startCalibration();
    }
}
