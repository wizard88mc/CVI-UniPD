var port = 8001;
var identificationType = "GAME_CLIENT";

function presentationComplete() {

	var machineID = checkAlreadySync();
	
	var message = {
		TYPE: "MACHINE_ID",
		DATA: machineID
	};
	
	websocket.send(JSON.stringify(message));
	
	websocket.onmessage = function(message) {
		
		var data = JSON.parse(message.data);
		
		if (data.TYPE == "OFFSET_CALCULATION") {
			
			if (data.TODO == "true") {
				
				if (data.MANDATORY == "true") {
					
					var dialog = $('<div>').attr('id', 'dialogAskSynch').attr('title', 'Sincronizzazione').appendTo('#divMainContent');
					$('<p>').text('Computer non ancora sincronizzato con il server. Eseguire sincronizzazione ora?').appendTo(dialog);
					$('<p>').text('Attenzione: se non si effettua sincronizzazione non sarà possibile giocare..').appendTo(dialog);
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
								
								$('<p>').text('Sincronizzazione in corso. Attendere.')
								.appendTo($('<div>').attr('id', 'dialogWait')
										.attr('title', 'Attendere')
										.appendTo('#divMainContent'));
								$('#dialogWait').dialog({
										modal: true,
										draggable: false,
										resizable: false,
										width: (getScreenWidth() * 0.4),
									});
							},
							"Indietro": function() {
								$(this).dialog("close");
								$(this).remove();
								location.replace("../index.html");
							}
						}
					});
				}
				// The synchronization is not mandatory, the physician
				// can decide if sync another time or not
				else {
					
					var dialog = $('<div>').attr('id', 'dialogAskSynch').attr('title', 'Sincronizzazione').appendTo('#divMainContent');
					$('<p>').text('Il computer non è stato sincronizzato recentemente e sarebbe opportuno effettuarla per avere dati più precisi.').appendTo(dialog);
					$('<p>').text('Sincronizzare nuovamente?').appendTo(dialog);
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
								
								$('<p>').text('Sincronizzazione in corso. Attendere.')
								.appendTo($('<div>').attr('id', 'dialogWait')
										.attr('title', 'Attendere')
										.appendTo('#divMainContent'));
								$('#dialogWait').dialog({
										modal: true,
										draggable: false,
										resizable: false,
										width: (getScreenWidth() * 0.4),
									});
							},
							"Non sincronizzare": function() {
								$(this).dialog("close");
								$(this).remove();
								putInWaitingToStart();
							}
						}
					});
					
				}
			}
			else {
				putInWaitingToStart();
			}
		}
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

	//setSessionStorage("permission", "DOCTOR");
/*var appCache = window.applicationCache;
	
	$('<img>').attr('src', '../images/preloader.gif')
	.attr('id', 'preloaderWaitingCache').prependTo('body');
	
	appCache.addEventListener('updateready', cacheUpdateReady, false);
	appCache.addEventListener('cached', operationsCacheFinished, false);
	appCache.addEventListener('noupdate', operationsCacheFinished, false);
	appCache.addEventListener('error', operationsCacheFinished, false);
	appCache.addEventListener('obsolete', operationsCacheFinished, false);
	appCache.addEventListener('progress', progressFunctionCache, false);
	
	try {
		appCache.update();
	}
	catch(e) {
		operationsCacheFinished(e);
	}*/
                    
    initPage();
	
});

function initPage() {
	
	$('#preloaderWaitingCache').remove();
	
	if (getFromSessionStorage("permission") == "DOCTOR") {
		
		$('#divMainContent').css('padding', '0em');
		openWebSocket(port);
	}
	else if (getFromSessionStorage("permission") == "PATIENT") {
		var patientID = getFromSessionStorage("patientID");
		
		var patientName = getFromSessionStorage("patientName");
		var patientSurname = getFromSessionStorage("patientSurname");
		
		$('#body').css({
			height: getScreenHeight()
		});
		
		$('#divMainContent').css('height', getScreenHeight());
		
		$('<h1>').text('Ciao ' + patientName).addClass("title").appendTo('#divMainContent');
		$('<h1>').text('A cosa giochiamo oggi???').appendTo('#divMainContent');
		
		var divContainer = $('<div>').attr('id', 'divButtonsGames').appendTo('#divMainContent');
		
		var divCatchMe = $('<div>').attr('id', 'buttonCatchMe').text('Prendimi!')
			.addClass('buttonForGame').appendTo(divContainer);
		var divHelpMe = $('<div>').attr('id', 'buttonHelpMe').text('Aiutami!')
			.addClass('buttonForGame').appendTo(divContainer);
		
		//divCatchMe.button();
		//divHelpMe.button();
		
		divCatchMe.on('click', function() {
			location.replace('../catchMe/index.html');
		});
		divHelpMe.on('click', function() {
			location.replace('../helpMe/index.html')
		});
		
		var logout = $('<div>').attr('id', 'buttonExit')
			.appendTo('#divMainContent');
		
		logout.on('click', function() {
			
			removeFromSessionStorage("logged");
			removeFromSessionStorage("patientName");
			removeFromSessionStorage("patientSurname");
			removeFromSessionStorage("patientID");
			removeFromSessionStorage("permission")
			removeFromSessionStorage("patientSex");
			location.replace('../index.html');
		});
		
	}
};