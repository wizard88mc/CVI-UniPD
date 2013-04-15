/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

var websocket = null;

function handlePresentation(message) {
	
	console.log("Handle Presentation WebSocket");
	
	var packet = JSON.parse(message.data);
	
	if (packet.TYPE == 'IDENTIFICATION') {
		console.log("Sending back identification response");
		packet.DATA = identificationType;
		
		websocket.send(JSON.stringify(packet));
	}
	else if (packet.TYPE == 'IDENTIFICATION_COMPLETE') {
		
		console.log("Identification Complete");
		
		presentationComplete(); // deve essere implementata dalla pagina che attiva una connessione tramite websocket
	}
}

function openWebSocket(webPort) {
	
	console.log("Start WebSocket");
	
	webHost = getAddressForWebsocket();
	
	websocket = new WebSocket('ws://' + webHost + ':' + webPort);
	
	websocket.onopen = function(e) {
		console.log("Opening websocket");
	};
	
	websocket.onclose = manageOnCloseWebsocket;
	
	websocket.onerror = manageOnErrorWebsocket;
	
	websocket.onmessage = handlePresentation;
}

function manageOnCloseWebsocket(e) {
	
	console.log("ClosingWebsocket");
	console.log(e);
	websocket = null;
}

function manageOnErrorWebsocket(e) {
	console.log("Some error in websocket usage ");
	console.log(e);
	websocket = null;
}
