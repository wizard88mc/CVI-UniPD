var folderGame = null;
var patientID = "4"; 
var gameID = "1";
var gameIdentification = "HELP_ME";

var port = 8002;
var identificationType = 'DOCTOR_CLIENT';

function presentationComplete() {

	//console.log("presentation complete");
	/*var packetToSend = {
			'TYPE': "GAME",
			'GAME_ID': gameIdentification
		};
		websocket.send(JSON.stringify(packetToSend));
		
		websocket.onmessage = function(message) {
			
			try {
				var data = JSON.parse(message.data);
				if (data.TYPE == "GAME" && data.RESULT == true) {
					setTimeout(CatchMeSettingsNamespace.requestScreenClient, 2000);
				}
				else if (data.TYPE == "GAME" && data.RESULT == false) {
					console.log("No client connected");
				}
			}
			catch(error) {
				console.log("Error in waiting response from game packet");
				console.log(error);
				console.log(message);
			}
		}*/
	// CatchMeSettingsNamespace.requestScreenClient();
	//NewVisitNamespace.initializePage();
}

$('document').ready(function(e) {
	
	$('h1').css({
		padding: '0.3em',
		'margin-bottom': '0.5em'
	});
	
	var paragraph = $('<p>').appendTo('#divMainContent');
	paragraph.css({
		width: '20%',
		'text-align': 'left',
		'margin-left': '2%'
	});
    var image = $('<img>').attr('id', 'imgGoBack').attr('src', '../images/tasto_indietro.png')
                    .attr('alt', 'Torna Indietro').appendTo('#divMainContent p')
                    .css({
                         cursor: 'pointer',
                         width: '50%',
                         'min-width': '5em'
                    });
    
	image.off('click');
	image.on('click', function() {
		location.replace('../index.html');
	})
	
	openWebSocket(port);
	NewVisitNamespace.initializePage();
});
