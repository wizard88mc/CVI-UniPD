/**
 * @author Matteo
 */

var identificationType = "DOCTOR_CLIENT";


function manageWaitingName(message) {
	
	var dataReceived = JSON.parse(message.data);
	
	console.log(message.data);
	if (dataReceived.TYPE == "PATIENT_NAME") {
		
		console.log("Ricevuto ID paziente");
		
		var text = $('#divMainContent > h1').text();
		text += (' - ' + dataReceived.NAME);
		
		$('#divMainContent > h1').text(text);
		
	}
	else if (dataReceived.TYPE == "GAME_NAME") {
		
		if (dataReceived.GAME == "CATCH_ME") {
			
			console.log("Loading catchMe");
			
		}
		
		else if (dataReceived.GAME == "HELP_ME") {
			
			$.getScript('js/watchHelpMe.js')
				.done(function(data, textStatus) {
					websocket.onmessage = HelpMeNamespace.entryFunction;
				})
				.fail(function(jqxhr, settings, exception) {
					console.log("Error loading file helpMe");
					console.log(jqxhr);
					console.log(settings);
					console.log(exception);
				});
			
		}
		else {
			console.log("Game provided not correct");
		}
	}
	else {
		console.log("Bad message received: ");
		console.log(dataReceived);
	}
	
}

function presentationComplete() {
	// Metto in attesa client fino a quando non riceve messaggio
	// che gli dice nome e cognome del paziente che sta facendo la visita
	
	/*websocket.onmessage = manageWaitingName;
	
	var packetToSend = {'TYPE': 'WAITING_PATIENT'};
	websocket.send(JSON.stringify(packetToSend));*/
}

$('document').ready(function(e) {
	
	
	/*var port = 8002;
	openWebSocket(port);*/	
	
});
