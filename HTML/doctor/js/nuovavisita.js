/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

var gameID = null;
var patientID = null;
var name = null;
var surname = null;
var gameReady = false;
var arrayOfDescriptionGames = Array();
var arrayOfFoldersGames = Array();
var identificationType = 'GAME_CLIENT';
var doctorID = getFromSessionStorage("doctorID"); 

var NewVisitNamespace = {

startNewGame: function() {
	
	patientID = $('#selectPatient').val();
	gameID = $('#selectGames').val();
	
	if (patientID == "" || gameID == "") {
		
		var errorsList = $('<ul></ul>');
		errorsList.css('list-style-position', 'inside');
		if (patientID == "") {
			$('<li>Nessun paziente scelto</li>').appendTo(errorsList);
		}
		if (gameID == "") {
			$('<li>Nessun gioco selezionato</li>').appendTo(errorsList);
		}
		
		$('<div id="errorStartGame" title="Mancano informazioni"></div>').appendTo($('#divMainContent'));
		$('#errorStartGame').css('padding', '0.3em');
		$('<p>Non sono state fornite tutte le informazioni necessarie: </p>').appendTo($('#errorStartGame'));
		errorsList.appendTo($('#errorStartGame'));
		
		var width = getScreenWidth() * 0.4;
		
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
		url: '../server/GetPatientsList.php',
		type: 'POST',
		data: {
			'doctorID': doctorID
		},
		success: function(message) {
			
			try {
				var arrayOfPatients = JSON.parse(message);
				var listOfOption = '<option value=""></option>';
				for (var i = 0; i < arrayOfPatients.length; i++) {
					var patient = arrayOfPatients[i];
					
					listOfOption += '<option value="' + patient.ID + '">'
								+ patient.SURNAME + " " + patient.NAME  
								 + "</option>";
				}
				
				$(listOfOption).appendTo($('#selectPatient'));
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
		url: '../server/GetGamesList.php', 
		success: function(message) {
			
			var arrayOfGames = JSON.parse(message);
			var listOfOptions = '<option value="">- - - - -</option>';
			
			 for (var i = 0; i < arrayOfGames.length; i++) {
				var game = arrayOfGames[i];
				
				listOfOptions += '<option value="' + game.ID + '">'
							+ game.NAME + "</option>";
				
				arrayOfDescriptionGames[game.ID] = game.DESCRIPTION;
				arrayOfFoldersGames[game.ID] = game.FOLDER;
			}
			
			$(listOfOptions).appendTo($('#selectGames'));
		}
	})
},

goToGame: function() {
	
	gameFolder = arrayOfFoldersGames[gameID];
	
	$.ajax({
		url: '../server/GetGameIdentification.php',
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
						'TYPE': "GAME",
						'GAME_ID': gameIdentification
					};
					websocket.send(JSON.stringify(packetToSend));
					
					websocket.onmessage = function(message) {
						
						try {
							var data = JSON.parse(message.data);
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
							'TYPE': "GAME",
							'GAME_ID': gameIdentification
						};
					websocket.send(JSON.stringify(packetToSend));
					
					websocket.onmessage = function(message) {
						try {
							var data = JSON.parse(message.data);
							if (data.TYPE == "GAME" && data.RESULT == true) {
								HelpMeSettingsNamespace.getImagesFamilies();
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
	
	$('<div id="divDialogServerNotWorking" title="Attenzione"><p>Attenzione: Server non attivato o non funzionante. Verificare e riprovare</p></div>')
	.appendTo('#divMainContent')
	.dialog({
		modal: true,
		resizable: false,
		draggable: false,
		width: (getScreenWidth() * 0.4),
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
	
	$('<div id="divDialogNoClientConnected" title="Errore"><p>Attenzione: nessun dispositivo per il paziente connesso. Collegarlo e riprovare</p></div>')
	.appendTo('#divMainContent')
	.dialog({
		modal: true,
		resizable: false,
		draggable: false,
		width: (getScreenWidth() * 0.4),
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
	
	var divChooseOldPatient = $('<div id="divChooseOldPatient"></div>');
	divChooseOldPatient.addClass('ui-corner-all');
	divChooseOldPatient.appendTo('#divMainContent');
	$('<h3>Seleziona un bambino tra quelli già presenti</h3>').addClass('ui-widget-header').appendTo(divChooseOldPatient);
	$('<select id="selectPatient"></select>').appendTo(divChooseOldPatient);
	NewVisitNamespace.getListOfPatients();
	
	
	var divNewPatient = $('<div id="divNewPatient"></div>');
	divNewPatient.addClass('ui-corner-all');
	divNewPatient.appendTo($('#divMainContent'));
	$('<h3>Oppure puoi inserirne uno nuovo</h3>').addClass('ui-widget-header').appendTo(divNewPatient);
	
	$('<button id="btnStartInsert">Inserisci</button>').button()
		.click(function() {
			$(this).hide();
			$('#divTableNewPatient').fadeIn();
		}).appendTo(divNewPatient);
	
	var divTableNewPatient = $('<div id="divTableNewPatient"></div>');
	divTableNewPatient.appendTo(divNewPatient);
	var tableNewPatient = $('<table id="tableNewPatient"><tbody></tbody></table>');
	tableNewPatient.appendTo(divTableNewPatient);
	
	$('<tr id="rowName"><td class="label">Nome: </td><td><input type="text" class="inputText" name="name" id="name" /></td></tr>').appendTo(tableNewPatient);
	$('<tr id="rowSurname"><td class="label">Cognome: </td><td><input class="inputText" type="text" name="surname" id="surname" /></td></tr>').appendTo(tableNewPatient);
	$('<tr id="rowSex"><td><input type="radio" id="male" name="sex" value="M" checked="checked" /><label for="male">Maschio</label></td><td class="alignLeft"><input type="radio" id="female" name="sex" value="F" /><label for="female">Femmina</label></td></tr>').appendTo(tableNewPatient);
	$('<tr><td class="label">Data Nascita: </td><td><input type="text" class="inputText" name="dateOfBirth" id="dateOfBirth" /></td></tr>').appendTo(tableNewPatient);
	$('<tr id="rowDisability"><td class="label">Disabilità</td><td><select id="disabilita"><option value="L">Bassa</option><option value="M" selected="selected">Media</option><option value="H">Alta</option></select></td></tr>').appendTo(tableNewPatient);
	$('#disabilita').parent().css('text-align', 'left');
	$('#dateOfBirth').datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: 'yy-mm-dd',
		yearRange: "-20:+2"
	})
	
	$('<button>Inserisci</button>').button()
		.click(function() {
			
			var patientName = $('#name').val();
			var patientSurname = $('#surname').val();
			
			if (patientName == "" || patientSurname == "") {
				
				var listErrors = $('<ul></ul>');
				listErrors.css('list-style-position', 'inside');
				if (patientName == "") {
					$('<li>Nome non inserito</li>').appendTo(listErrors);
				}
				if (patientSurname == "") {
					$('<li>Cognome non inserito</li>').appendTo(listErrors);
				}
				
				$('<div id="dialogErrorInput" title="Informazioni mancanti"></div>').appendTo($('#divTableNewPatient'));
				$('#dialogError').css('padding',' 0.3em');
				$('<p>Non sono state inserite tutte le informazioni necessarie: </p>').appendTo($('#dialogError'));
				listErrors.appendTo($('#dialogError'));
				
				var width = getScreenWidth() * 0.4;
				
				$('#dialogErrorInput').dialog({
					modal: true,
					resizable: false,
					draggable: false,
					width: width, 
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
					url: '../server/AddNewPatient.php',
					type: "POST",
					data: {
						name: patientName, surname: patientSurname, 
						dateOfBirth: dateOfBirth, disabilita: disability, 
						sex: sex, doctorID: doctorID },
					success: function(message) {
						
						console.log(message);
						var data = JSON.parse(message);
						
						if (data.OK == 'true') {
							var optionToAdd = '<option value="' + data.ID 
												+ '" selected>' + data.SURNAME + " " + data.NAME
												+ "</option>";
												
							$(optionToAdd).appendTo('#selectPatient');
							
							$('<div id="dialogInsertOk" title="Inserimento Avvenuto"><p>Operazione completata</p><p>Il nuovo bambino è già selezionato nell\'elenco a sinistra.</p></div>')
								.appendTo('#divNewPatient');
							var width = getScreenHeight() * 0.6;
							$('#dialogInsertOk').dialog({
								modal: true, 
								draggable: false,
								resizable: false,
								width: width,
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
							$('<div id="dialogError" title="Errore!"></div>').appendTo($('#divNewPatient'));
							$('<p>Errore nell\'inserimento</p>').appendTo($('#dialogError'));
							var messageError = '<p>' + data.ERROR + '</p>';
							$(messageError).appendTo($('#dialogError'));
							
							var width = getScreenWidth() * 0.4;
							$('#dialogError').dialog({
								modal: true,
								draggable: false,
								resizable: false,
								width: width, 
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
	$('<button>Annulla</button>').button()
		.click(function() {
			
			$('#divTableNewPatient').hide();
			$('#btnStartInsert').fadeIn();			
		}).appendTo(divTableNewPatient);
	
	divTableNewPatient.hide();
	
	var divGames = $('<div id="divGames" class="ui-widget-content"></div>');
	divGames.addClass('ui-corner-all');
	divGames.appendTo($('#divMainContent'));
	$('<label for="selectGames" class="label">Seleziona il gioco: </label>').appendTo(divGames);
	$('<select id="selectGames" name="selectGames"></select>').appendTo(divGames);
	$('<p id="gameDescription"></p>').appendTo($('#divGames'));
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
	
	var divButtons = $('<div id="divButtons"></div>');
	var buttonStart = $('<button id="buttonStart">Comincia</button>').button();
	//var buttonReturn = $('<button id="buttonBack">Indietro</button>').button();
	buttonStart.click(NewVisitNamespace.startNewGame);
	//buttonReturn.click(NewVisitNamespace.returnToIndex);
	divButtons.addClass('alignCenter');
	buttonStart.appendTo(divButtons);
	//buttonReturn.appendTo(divButtons);
	
	divButtons.appendTo($('#divMainContent'));

}
}