var port = 8001;
var identificationType = "GAME_CLIENT";

function presentationComplete() {
	
	if (checkAlreadySync() != null) {
		putInWaitingToStart();
	}
	else {
		var dialog = $('<div id="dialogAskSynch" title="Sincronizzazione"></div>').appendTo('#divMainContent');
		$('<p>Computer non ancora sincronizzato con il server. Eseguire sincronizzazione ora?</p>').appendTo(dialog);
		$('<p>Attenzione: se non si effettua sincronizzazione non sarà possibile giocare..</p>').appendTo(dialog);
		dialog.dialog({
			modal: true,
			resizable: false,
			draggable: false,
			closeOnEscape: false,
			width: (getScreenWidth() * 0.5),
			buttons: {
				"Esegui": function() {
					$(this).dialog("close");
					$(this).remove();
					startSynchronization();
					
					$('<div id="dialogWait" title="Attendere"><p>Sincronizzazione in corso. Attendere.</p></div>')
					.appendTo('#divMainContent')
					.dialog({
						modal: true,
						draggable: false,
						resizable: false,
						width: (getScreenWidth() * 0.4),
					})
				}, 
				"Indietro": function() {
					$(this).dialog("close");
					$(this).remove();
					location.replace("../index.html");
				}
			}
		});
	}
}

function timeSyncCompleted() {
	
	$('#dialogWait').dialog("close").remove();
	putInWaitingToStart();
}

function putInWaitingToStart() {
	
	websocket.onmessage = function(message) {
		
		var data = JSON.parse(message.data);
		console.log(data);
		
		if (data.TYPE == "GAME") {
			
			if (data.GAME_ID == "CATCH_ME") {
				location.replace('../catchMe/index.html');
			}
			else if (data.GAME_ID == "HELP_ME") {
				location.replace('../helpMe/index.html');
			}
		}
		else {
			console.log("Bad message received");
			console.log(data);
			console.log(message);
		}
	}
}

$('document').ready(function(e) {

	setSessionStorage("permission", "DOCTOR");
	
	if (getFromSessionStorage("permission") == "DOCTOR") {
		
		openWebSocket(port);
	}
	else if (getFromSessionStorage("permission") == "PATIENT") {
		var patientID = getFromSessionStorage("patientID");
	}
});