/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

var gameID = -1;
var patientID = -1;
var name = null;
var surname = null;
var gameReady = false;
var arrayOfDescriptionGames = Array();
var arrayOfFoldersGames = Array();
var identificationType = 'GAME_CLIENT';
var doctorID = getFromSessionStorage("doctorID");
var useEyeTracker = true;

var NewVisitNamespace = {

startNewGame: function() {
	
	patientID = $('#selectPatient').val();
	gameID = $('#selectGames').val();
	
	if (patientID == "" || gameID == "") {
		
		var errorsList = $('<ul>');
		errorsList.css('list-style-position', 'inside');
		if (patientID == "") {
			$('<li>').text('Nessun paziente scelto').appendTo(errorsList);
		}
		if (gameID == "") {
			$('<li>').text('Nessun gioco selezionato').appendTo(errorsList);
		}
		
		$('<div>').attr('id', 'errorStartGame').attr('title', 'Mancano informazioni')
			.css('padding', '0.3em').appendTo('#divMainContent');
		$('<p>').text('Non sono state fornite tutte le informazioni necessarie:').appendTo('#errorStartGame');
		errorsList.appendTo('#errorStartGame');
		
		var width = getScreenWidth() * 0.5;
		
		$('#errorStartGame').dialog({
			modal: true,
			resizable: false,
			draggable: false,
			width: width, 
			buttons: {
				Ok: function() {
					$(this).dialog("close");
					$(this).remove();
				}
			}
		});
	}
	else {
		// Ho tutto pronto per iniziare, 
		// devo collegarmi a pagina giusta
		// relativa al gioco scelto
		
		NewVisitNamespace.goToGame();
	}
},

getListOfPatients: function() {
	
	$.ajax({
		url: SERVER_ADDRESS + '/server/GetPatientsList.php',
		type: 'POST',
		data: {
			'doctorID': doctorID
		},
		success: function(message) {
			
			try {
				var arrayOfPatients = JSON.parse(message);
				
				$('<option>').val('').appendTo('#selectPatient');
				
				for (var i = 0; i < arrayOfPatients.length; i++) {
					var patient = arrayOfPatients[i];
								 
					$('<option>').val(patient.ID).text(patient.SURNAME + " " + patient.NAME);
				}
			}
			catch(error) {
				console.log(error);
				console.log(message);
			}
		}
	})
},

getListOfGames: function() {
	
	$.ajax({
		url: SERVER_ADDRESS + '/server/GetGamesList.php', 
		success: function(message) {
			
			var arrayOfGames = JSON.parse(message);
			
			$('<option>').val('').text('- - - - -').appendTo('#selectGames');
			
			 for (var i = 0; i < arrayOfGames.length; i++) {
				var game = arrayOfGames[i];
							
				$('<option>').val(game.ID).text(game.NAME).appendTo('#selectGames');
				
				arrayOfDescriptionGames[game.ID] = game.DESCRIPTION;
				arrayOfFoldersGames[game.ID] = game.FOLDER;
			}
			
			$(listOfOptions).appendTo('#selectGames');
		}
	})
},

goToGame: function() {
	
	$('<p>').text('Sto recuperando le impostazioni di gioco...')
		.appendTo($('<div>').attr('id', 'waitingParameters')
				.attr('title', 'Recupero informazioni').appendTo('#divMainContent'));

	$('#waitingParameters').dialog({
		modal: true,
		draggable: false,
		closeOnEscape: false,
		resizable: false,
		open: function() {
			$('a.ui-dialog-titlebar-close').hide();
		}
	});
	
	gameFolder = arrayOfFoldersGames[gameID];
	
	$.ajax({
		url: SERVER_ADDRESS + '/server/GetGameIdentification.php',
		type: 'POST',
		data: {
			gameID: gameID
		},
		success: function(message) {
			
			var data =JSON.parse(message);
			gameIdentification = data.IDENTIFICATION;
			
			if (websocket == null) {
				NewVisitNamespace.noServerWorking();
			}
			else {
				if (gameIdentification == "CATCH_ME") {
					// lavoro con settings di catchMe
					console.log("CatchMe to watch");
					var packetToSend = {
						TYPE: "GAME",
						GAME_ID: gameIdentification
					};
					websocket.send(JSON.stringify(packetToSend));
					
					websocket.onmessage = function(message) {
						
						try {
							var data = JSON.parse(message.data);
							console.log(data);
							if (data.TYPE == "GAME" && data.RESULT == true) {
								setTimeout(CatchMeSettingsNamespace.requestScreenClient, 3000);
							}
							else if (data.TYPE == "GAME" && data.RESULT == false) {
								console.log("No client connected");
								NewVisitNamespace.noClientConnected();
							}
						}
						catch(error) {
							console.log("Error in waiting response from game packet");
							console.log(error);
							console.log(message);
						}
					}
					
					
					
				}
				else if (gameIdentification == "HELP_ME") {
					// lavoro con settings helpMe
					// $('#divMainContent div').remove();
					var packetToSend = {
							TYPE: "GAME",
							GAME_ID: gameIdentification
						};
					websocket.send(JSON.stringify(packetToSend));
					
					websocket.onmessage = function(message) {
						try {
							var data = JSON.parse(message.data);
							if (data.TYPE == "GAME" && data.RESULT == true) {
								setTimeout(HelpMeSettingsNamespace.requestScreenClient, 3000);
							}
							else if (data.TYPE == "GAME" && data.RESULT == false) {
								NewVisitNamespace.noClientConnected();
							}
						}
						catch(error) {
							console.log("Error in waiting response from game packet");
							console.log(error);
							console.log(message);
						}
					}
					
					console.log("HelpMe to watch");
					
				}
			}
		}
	})
},

noServerWorking: function() {
	
	$('#waitingParameters').dialog("close").remove();
	
	$('<p>').text('Attenzione: Server non attivato o non funzionante. Verificare e riprovare')
		.appendTo($('<div>').attr('id', 'divDialogServerNotWorking').attr('title', 'Attenzione').appendTo('#divMainContent'));

	$('#divDialogServerNotWorking')
	.dialog({
		modal: true,
		resizable: false,
		draggable: false,
		width: (getScreenWidth() * 0.5),
		buttons: {
			"Chiudi": function() {
				$(this).dialog("close");
				$(this).remove();
				location.replace('../index.html');
			}
		}
	});
},

noClientConnected: function() {
	
	$('#waitingParameters').dialog("close").remove();
	
	$('<p>').text('Attenzione: nessun dispositivo per il paziente connesso. Collegarlo e riprovare')
		.appendTo($('<div>').attr('id', 'divDialogNoClientConnected').attr('title', 'Errore')
		.appendTo('#divMainContent'))
	
	$('#divDialogNoClientConnected').dialog({
		modal: true,
		resizable: false,
		draggable: false,
		width: (getScreenWidth() * 0.5),
		buttons : {
			"Chiudi": function() {
				$(this).dialog("close");
				$(this).remove();
			}
		}
	});
},

returnToIndex: function() {
	location.replace('../index.html');
},

presentationComplete: function() {
	
	console.log("Presentation Complete");
	//startSynchronization();
	initializePage();
},

/*timeSyncCompleted: function() {
	
	initializePage();

},*/

initializePage: function() {
	
	$('#divMainContent div').remove();
	
	$('#divMainContent > h1').text("Nuova visita");
	
	var divChooseOldPatient = $('<div>').attr('id', 'divChooseOldPatient')
		.addClass('ui-corner-all')
		.appendTo('#divMainContent');
	
	$('<h3>').text('Seleziona un bambino tra quelli già presenti').addClass('ui-widget-header').appendTo(divChooseOldPatient);
	
	$('<select>').attr('id', 'selectPatient').appendTo(divChooseOldPatient);
	
	NewVisitNamespace.getListOfPatients();
	
	var divNewPatient = $('<div>').attr('id', 'divNewPatient')
		.addClass('ui-corner-all')
		.appendTo($('#divMainContent'));
	
	$('<h3>').text('Oppure puoi inserirne uno nuovo').addClass('ui-widget-header').appendTo(divNewPatient);
	
	$('<button>').attr('id', 'btnStartInsert').text('Inserisci').button()
		.click(function() {
			$(this).hide();
			$('#divTableNewPatient').fadeIn();
		}).appendTo(divNewPatient);
	
	var divTableNewPatient = $('<div>').attr('id', 'divTableNewPatient')
		.appendTo(divNewPatient);
	var tableNewPatient = $('<table>').attr('id', 'tableNewPatient')
		.appendTo(divTableNewPatient);
	
	$('<tbody>').appendTo(tableNewPatient);
	
	var row = null;
	
	row = $('<tr>').attr('id', 'rowName').appendTo(tableNewPatient);
	$('<td>').addClass('label').text('Nome: ').appendTo(row);
	$('<input>').attr('type', 'text').attr('name', 'name').attr('id', 'name')
		.addClass('inputText').appendTo(('<td>').appendTo(row));
	
	row = $('<tr>').attr('id', 'rowSurname').appendTo(tableNewPatient);
	$('<td>').addClass('label').text('Cognome: ').appendTo(row);
	$('<input>').attr('type', 'text').attr('name', 'surname').attr('id', 'surname')
		.addClass('inputText').appendTo($('<td>').appendTo(row));
		
	row = $('<tr>').attr('id', 'rowSex').appendTo(tableNewPatient);
	var td = $('<td>').appendTo(row);
	
	$('<input>').attr('type', 'radio').attr('id', 'male')
		.attr('name', 'sex').val('M').attr('checked', 'checked').appendTo(td);
		
	$('<label>').attr('for', 'male').text('Maschio').appendTo(td);
	
	td = $('<td>').addClass('alignLeft').appendTo(row);
	$('<input>').attr('type', 'radio').attr('id', 'female')
		.attr('name', 'sex').val('F').appendTo(td);
	$('<label>').attr('for', 'female').text('Femmina').appendTo(td);
	
	row = $('<tr>').appendTo(tableNewPatient);
	td = $('<td>').addClass('label').text('Data Nascita: ').appendTo(row);
	$('<input>').attr('type', 'text').attr('name', 'dateOfBirth')
		.attr('id', 'dateOfBirth').addClass('inputText').appendTo($('<td>').appendTo(row));
	
	row = $('<tr>').attr('id', 'rowDisability').appendTo(tableNewPatient);
	$('<td>').addClass('label').text('Disabilità: ').appendTo(row);
	
	var select = $('<select>').attr('id', 'disabilita').appendTo($('<td>').appendTo(row));
	$('<option>').val('L').text('Bassa').appendTo(select);
	$('<option>').val('M').text('Media').attr('selected', 'selected').appendTo(select);
	$('<option>').val('H').text('Alta').appendTo(select);
	
	select.parent().css('text-align', 'left');
	$('#dateOfBirth').datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: 'yy-mm-dd',
		yearRange: "-20:+2"
	})
	
	$('<button>').text('Inserisci').button()
		.click(function() {
			
			var patientName = $('#name').val();
			var patientSurname = $('#surname').val();
			
			if (patientName == "" || patientSurname == "") {
				
				var listErrors = $('<ul>').css('list-style-position', 'inside');
				
				if (patientName == "") {
					$('<li>').text('Nome non inserito').appendTo(listErrors);
				}
				if (patientSurname == "") {
					$('<li>').text('Cognome non inserito').appendTo(listErrors);
				}
				
				$('<div>').attr('id', 'dialogErrorInput').attr('title', 'Informazioni mancanti')
					.css('padding',' 0.3em').appendTo('#divTableNewPatient');
				
				$('<p>').text('Non sono state inserite tutte le informazioni necessarie: ').appendTo('#dialogErrorInput');
				
				listErrors.appendTo('#dialogError');
				
				$('#dialogErrorInput').dialog({
					modal: true,
					resizable: false,
					draggable: false,
					width: getScreenWidth() * 0.5, 
					buttons: {
						Ok: function() {
							$(this).dialog('close');
							$(this).remove();
						}
					}
				}).parent().addClass('ui-state-error');
				
			}
			else {
				
				var dateOfBirth = $('#dateOfBirth').val();
				var disability = $('#disabilita').val();
				var sex = $('input:radio[name=sex]:checked').val();
				
				$.ajax({
					url: SERVER_ADDRESS + '/server/AddNewPatient.php',
					type: "POST",
					data: {
						name: patientName, surname: patientSurname, 
						dateOfBirth: dateOfBirth, disabilita: disability, 
						sex: sex, doctorID: doctorID },
					success: function(message) {
						
						console.log(message);
						var data = JSON.parse(message);
						
						if (data.OK == 'true') {
												
							$('<option>').val(data.ID).attr('selected', 'selected')
								.text(data.SURNAME + " " + data.NAME).appendTo('#selectPatient');
							
							var dialog = $('<div>').attr('id', 'dialogInsertOk').attr('title', 'Inserimento Avvenuto')
								.appendTo('#divNewPatient');
							
							$('<p>').text('Operazione completata').appendTo(dialog);
							$('<p>').text('Il nuovo bambino è già selezionato nell\'elenco a sinistra.').appendTo(dialog);
							
							dialog.dialog({
								modal: true, 
								draggable: false,
								resizable: false,
								width: getScreenWidth() * 0.4,
								buttons: {
									Ok: function() {
										$(this).dialog("destroy");
										$(this).remove();
									}
								}
							});
							
							$('#divNewPatient').fadeOut();
							
						}	
						else {
							$('<p>').text("Errore nell'inserimento").appendTo(
								$('<div>').attr('id', 'dialogError').attr('title', 'Errore!').appendTo('#divNewPatient'));

							$('<p>').text(data.ERROR).appendTo('#dialogError');
							
							$('#dialogError').dialog({
								modal: true,
								draggable: false,
								resizable: false,
								width: getScreenWidth() * 0.4, 
								buttons: {
									Ok: function() {
										$(this).dialog("close");
										$(this).remove();
									}
								}
							}).parent().addClass('ui-state-error');
						}
					}
				});
			}
			
			
		}).appendTo(divTableNewPatient);
	$('<button>').text('Annulla').button()
		.click(function() {
			
			$('#divTableNewPatient').hide();
			$('#btnStartInsert').fadeIn();			
		}).appendTo(divTableNewPatient);
	
	divTableNewPatient.hide();
	
	var divGames = $('<div>').attr('id', 'divGames').addClass('ui-widget-content ui-corner-all')
		.appendTo('#divMainContent');
	
	$('<label>').attr('for', 'selectGames').addClass('label').text('Seleziona il gioco: ').appendTo(divGames);
	$('<select>').attr('id', 'selectGames').attr('name', 'selectGames').appendTo(divGames);
	$('<p>').attr('id', 'gameDescription').appendTo(divGames);
	NewVisitNamespace.getListOfGames();
	
	$('#selectGames').change(function() {
		var gameID = $(this).val();
		
		if (gameID == "") {
			$('#gameDescription').text("");
		}
		else {
			$('#gameDescription').text(arrayOfDescriptionGames[gameID]);
		}
	})
	
	var divButtons = $('<div>').attr('id', 'divButtons')
		.addClass('alignCenter').appendTo('#divMainContent');
	
	$('<button>').attr('id', 'buttonStart').text('Comincia')
		.button().click(NewVisitNamespace.startNewGame).appendTo(divButtons);
	
}
}