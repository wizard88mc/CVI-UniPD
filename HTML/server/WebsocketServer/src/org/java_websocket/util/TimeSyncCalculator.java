package org.java_websocket.util;

import java.text.DecimalFormat;

/**
 *
 * @author Matteo Ciman
 */

public class TimeSyncCalculator {
    
    protected long firstStartTime = 0, firstMiddleTime = 0, firstEndTime = 0;
    double RTT = 0, finala12 = 0, finalb12 = 0;
    int totalPackets = 0, MAX_TOTAL_PACKETS = 500, MAX_TOTAL_PACKETS_RTT = 500;
    boolean calculatingRTT = true;
    
    
    public TimeSyncCalculator() {}
    
    public boolean newPacket(Long startTime, Long middleTime, Long endTime) {
        
        if (calculatingRTT) {
            
            RTT += (endTime - startTime); 
            totalPackets++;
            if (totalPackets == MAX_TOTAL_PACKETS_RTT) {
               RTT = RTT / totalPackets;
               System.out.println(RTT);
               totalPackets = 0;
               calculatingRTT = false;
               return false;
            }
       }
        else {
            
            if (firstStartTime == 0) {
                firstMiddleTime = middleTime;
                firstStartTime = startTime - firstMiddleTime;
                firstEndTime = endTime - firstMiddleTime;
                return false;
            }
            else {
                
                startTime -= firstMiddleTime;
                middleTime -= firstMiddleTime;
                endTime -= firstMiddleTime;
                
                double a12Lower = (double)(startTime - firstStartTime - 
                    (RTT)) 
                     //(endTime - startTime))
                    / (double)(middleTime - 0);
                double a12Upper = (double)(startTime - firstStartTime + 
                    (RTT)) 
                    //(endTime - startTime))
                    / (double)(middleTime - 0);
            
                /*System.out.println("A12 lower: " + a12Lower);
                System.out.println("A12 upper: " + a12Upper);*/

                double b12Lower = firstStartTime - 0 * a12Upper;
                double b12Upper = firstStartTime + (RTT) - 
                       // (endTime - startTime) -
                        0 * a12Lower;

                /*System.out.println("B12 Lower: " + b12Lower);
                System.out.println("B12 Upper: " + b12Upper);*/

                double maxValueA12 = ((a12Upper + a12Lower) / 2) - 
                        (a12Upper - a12Lower) / 2;

                double minValueA12 = ((a12Upper + a12Lower) / 2) + 
                        (a12Upper - a12Lower) / 2;

                finala12 = (maxValueA12 + minValueA12) / 2;

                double maxValueB12 = (b12Upper + b12Lower) / 2 + 
                        (b12Upper - b12Lower) / 2;

                double minValueB12 = (b12Upper + b12Lower) / 2 - 
                        (b12Upper - b12Lower) / 2;

                //System.out.println(a12Lower);
                //System.out.println(a12Upper);

                finalb12 = (maxValueB12 + minValueB12) / 2;

                double deltaA12 = 2 * (double)(RTT) / (double)(middleTime - 0);
                //double deltaA12 = 2 * (double)(endTime - startTime) / (double)(middleTime - 0);
                double deltaB12 = (RTT) + 0 * deltaA12;
                //double deltaB12 = (endTime - startTime) + 0 * deltaA12;

                /*System.out.println("Valore a12: " + finala12);
                System.out.println("Valore b12: " + finalb12);*/
                //System.out.println("Delta A12: " + deltaA12);
                /*System.out.println("Delta B12: " + deltaB12);
                System.out.println("Delta B12: " + (b12Upper - b12Lower));*/

                //System.out.println("* * * * * * *");
            }
            
            totalPackets++;
            if (totalPackets == MAX_TOTAL_PACKETS) {
                System.out.println("Valore a12: " + finala12);
                System.out.println("Valore b12: " + finalb12);
                return true;
            }
            else {
                return false;
            }
        }
        return false;
    }
    
    public double getFinalA12() {
        return finala12;
    }
    
    public double getFinalB12() {
        return finalb12;
    }
    
    public void operationComplet() {
        totalPackets = 0;
    }
    
    public static void main(String[] args) {
        
        double finala12 = 0.9996216420734014;
        double finalb12 = 401311.864;
        
        DecimalFormat twoDigits = new DecimalFormat("###.#");
        try {
            double valuea12 = Double.parseDouble(twoDigits.format(finala12).replace(",", "."));
            double valueb12 = Double.parseDouble(twoDigits.format(finalb12).replace(",", "."));
            
            System.out.println(valuea12);
            System.out.println(valueb12);
        }
        catch(NumberFormatException exc) {
            System.out.println("Errore format: " + exc.toString());
            
        }
    }
}
