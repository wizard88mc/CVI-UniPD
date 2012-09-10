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
		
		packet.CLIENT_TIME = new Date().getTime();
		websocket.send(JSON.stringify(packet));
	}
	else if (packet.TYPE == "OFFSET_CALCULATION_COMPLETE") {
		console.log("Calcolo offset completato");
		
		localStorage.setItem('machineID', packet.MACHINE_ID);
		
		websocket.close();
		
		timeSyncCompleted();
	}
}

function startSynchronization() {
	
	console.log("Start Synchronization");
	websocket.onmessage = handleOffsetCalculation;
	
	var packet = { "TYPE": "START_OFFSET_CALCULATION"};
	
	websocket.send(JSON.stringify(packet));
}

function askForSynchronization(mandatory) {
	
	var divDialog = $('<div id="dialog-confirm" title="Sincronizzazione"><p>Eseguire la sincronizzazione degli orari con il Server?</p></div>');
	
	if (mandatory) {
		
		$('<p>Se non accetti NON sarà possibile iniziare il gioco . . .</p>').appendTo(divDialog);
		
	}
	
	divDialog.appendTo('#divContentAll');
	
	$('#dialog-confirm > p').css('margin-bottom', '1.0em');
	
	var dialogWidth = $(window).width() * 0.4;
	
	divDialog.dialog({
		resizable: false,
		width: dialogWidth,
		modal: true,
		buttons: {
			"Esegui Sincronizzazione": function() {
				$(this).dialog("destroy");
				openWebSocket(port);
			},
			"Non Eseguire": function() {
				$(this).dialog("destroy");
				timeSyncCompleted();
			}
		}
	});
}
