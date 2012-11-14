/**
 *
 * @author Matteo Ciman
 * 
 * @version 0.1
 *  
 */

function handleOffsetCalculation(message) {
	
	var packet = JSON.parse(message.data);
	
	if (packet.TYPE == "CALCULATING") {
		
		packet.DATA = new Date().getTime();
		websocket.send(JSON.stringify(packet));
	}
	else if (packet.TYPE == "OFFSET_CALCULATION_COMPLETE") {
		console.log("Calcolo offset completato");
		
		saveInLocalStorage('machineID', packet.MACHINE_ID);
		
		console.log("Sync completed");
		timeSyncCompleted();
	}
}

function startSynchronization() {
	
	console.log("Start Synchronization");
	websocket.onmessage = handleOffsetCalculation;
	
	var packet = { "TYPE": "START_OFFSET_CALCULATION"};
	
	websocket.send(JSON.stringify(packet));
}
