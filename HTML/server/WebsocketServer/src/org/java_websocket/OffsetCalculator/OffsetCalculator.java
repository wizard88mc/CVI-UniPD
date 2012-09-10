package org.java_websocket.OffsetCalculator;

import java.util.ArrayList;

/**
 *
 * @author Matteo Ciman
 */
public class OffsetCalculator extends Thread {
    
    protected ArrayList<TimesPacket> packets = new ArrayList<TimesPacket>();
    protected Long startPacketsExchangeTime = 0L;
    protected Long offset = 0L;
    public final Object calculationComplete = new Object();
    public boolean endCalculation = false;
    
    @Override
    public void run() {
        
        System.out.println("Starting calculation");
        double ripartizione = 0.1;
        int ricalcoli = 1;
        
        while (!endCalculation) {
            System.out.println("Calcolo " + ricalcoli);
            System.out.println("Ripartizione: " + ripartizione);
            ArrayList<TimesPacket> training = new ArrayList<TimesPacket>(packets.size()),
                                test = new ArrayList<TimesPacket>(packets.size());

            for (int i = 0; i < packets.size(); i=i+2) {

                double prob = Math.random();
                if (prob < 0.5) {
                    training.add(packets.get(i));
                    test.add(packets.get(i+1));
                }
                else {
                    test.add(packets.get(i));
                    training.add(packets.get(i+1));
                }
            }

            long sumOfOffsets = 0;
            for (int i = 0; i < training.size(); i++) {

                TimesPacket packet = training.get(i);
                sumOfOffsets += packet.clientTime - packet.startTime - 
                            (packet.RTT * ripartizione);
            }
            
            long newOffset = sumOfOffsets / training.size();
            
            if (Math.abs(newOffset - offset) > 5) {
                offset = newOffset;
                long sumPositiveDeltas = 0, sumNegativeDeltas = 0;
                int countPositiveDeltas = 0, countNegativeDeltas = 0;

                for (int i = 0; i < test.size(); i++) {

                    TimesPacket packet = test.get(i);
                    long supposedTime = packet.startTime + offset + 
                            (long)(packet.RTT * ripartizione);

                    long delta = supposedTime - packet.clientTime;
                    if (delta > 0) {
                        countPositiveDeltas++;
                        sumPositiveDeltas += delta;
                    }
                    else  if (delta < 0) {
                        countNegativeDeltas++;
                        sumNegativeDeltas += delta;
                    }
                }

                long meanPositiveDeltas = 0, meanNegativeDeltas = 0;
                if (countPositiveDeltas > 0) {
                    meanPositiveDeltas = sumPositiveDeltas / countPositiveDeltas;
                }
                
                if (countNegativeDeltas > 0) {
                    meanNegativeDeltas = sumNegativeDeltas / countNegativeDeltas;
                }

                System.out.println(meanPositiveDeltas + meanNegativeDeltas);
                if (meanPositiveDeltas + meanNegativeDeltas > 0) {
                    // devo aumentare valore della ripartizione sulla base della differenza
                    // Se differenza maggiore di 40, aumento di 0.1 al ripartizione
                    double deltaRipartizione = (meanPositiveDeltas + meanNegativeDeltas) * 0.1 / 40;
                    ripartizione += deltaRipartizione;
                }
                else if (meanPositiveDeltas + meanNegativeDeltas < 0) {
                    // devo diminuire valore della ripartizione sulla base della differenza
                    // Se differenza > di 40, diminuisco ripartizione di 0.1
                    double deltaRipartizione = (meanPositiveDeltas + meanNegativeDeltas) * 0.1 / 40;
                    ripartizione += deltaRipartizione;
                }

            }
            else {
                endCalculation = true;
            }
            
            ricalcoli++;
        }
        
        System.out.println("Offset calcolato: " + offset);
        synchronized(calculationComplete) {
            calculationComplete.notifyAll();
        }
    }
    
    public int addTimesPacket(TimesPacket packet) {
        
        System.out.println("RTT: " + packet.RTT);
        packets.add(packet);
        return packets.size();
    }
    
    public void setStartTime(Long time) {
        this.startPacketsExchangeTime = time;
    }
    
    public Long getStartTime() {
        return startPacketsExchangeTime;
    }
    
    public int getPacketsSaved() {
        return packets.size();
    }
}
