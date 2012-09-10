package org.java_websocket.OffsetCalculator;

/**
 *
 * @author Matteo
 */
public class TimesPacket {

    protected Long startTime;
    protected Long clientTime;
    protected Long arrivalTime;
    protected Long RTT;
    
    public TimesPacket(Long startTime, Long clientTime, Long arrivalTime) {
        this.startTime = startTime; this.clientTime = clientTime;
        this.arrivalTime = arrivalTime;
        RTT = arrivalTime - startTime;
    }
}
