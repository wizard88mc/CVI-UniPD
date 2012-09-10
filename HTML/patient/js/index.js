var port = 8001;
var identificationType = "GAME_CLIENT";

function presentationComplete() {
	
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
		
	}
});