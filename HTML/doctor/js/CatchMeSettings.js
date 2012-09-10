function GameSettings() {

	this.rightMovement = false;
	this.leftMovement = false;
	this.upMovement = false;
	this.downMovement = false;
	this.startFromCenter = false;
	this.mixMovements = false;
	this.speed = 0;
	this.backgroundColor = '';
	this.foregroundColor = '';
	this.imageID = -1;
	this.changeImageColor = true;
	this.percentualImageWidth = 0; // percentual of the image width, used for CSS
	this.imageFileName = "";
	
this.getBackgroundRGB = function() {
	return new Array(hexToR(this.backgroundColor),
					hexToG(this.backgroundColor),
					hexToB(this.backgroundColor));
}

this.getForegroundRGB = function() {
	return new Array(hexToR(this.foregroundColor),
					hexToG(this.foregroundColor),
					hexToB(this.foregroundColor));
}
	
};
var gameSettings = new GameSettings();

var aviableImages = new Array();
var patientID = null;
var canvasSettings = new Object();
var screenWidth = 0;
var screenHeight = 0;

var CatchMeSettingsNamespace = {

verifyColorContrast: function() {
		
	var goodColorContrast = checkColorContrast(gameSettings.getBackgroundRGB(), 
											gameSettings.getForegroundRGB());
	
	if (!goodColorContrast) {
		$('#divBadContrast').fadeIn();
	}
	else {
		$('#divBadContrast').fadeOut();
	}
	
	var canvas = $('#imageExample')[0];
	if (canvas != null) {
		var context = canvas.getContext('2d');
		context.fillStyle = gameSettings.foregroundColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	var divExampleDimensions = $('#exampleDimensions');
	if (divExampleDimensions != null) {
		divExampleDimensions.css('background-color', gameSettings.backgroundColor);
	}
},

updateLabelSpeed: function(speed) {
	
	gameSettings.speed = speed;
	$('#labelSpeed').text(speed);
},

updateCanvasPreview: function(value) {
	
	gameSettings.percentualImageWidth = value;
	$('#imageExample').width(gameSettings.percentualImageWidth + '%');
	
	var centerOfPreviewDiv = Math.round($('#exampleDimensions').height() / 2);
	var topOfImagePreview = centerOfPreviewDiv - Math.round($('#imageExample').height() / 2);
	
	$('#imageExample').css('margin-top', topOfImagePreview + 'px');
},

requestScreenClient: function() {
	
	var packetToSend = {
		"TYPE": "SCREEN_MEASURES"
	};
	
	websocket.onmessage = function(message) {
		
		var data = JSON.parse(message.data);
		if (data.TYPE == "SCREEN_MEASURES") {
			
			if (data.RESULT == true) {
				screenWidth = data.SCREEN_WIDTH;
				screenHeight = data.SCREEN_HEIGHT;
				
				CatchMeSettingsNamespace.requestGameSettings();
			}
			else {
				if (data.ERROR == "01") {
					console.log("Errore: nessun client connesso");
				}
			}
			
		}
	};
	websocket.send(JSON.stringify(packetToSend));
	
},
/**
 * Function per la personalizzazione delle 
 * impostazioni di gioco
 */
requestGameSettings: function() {
	
	$('#divMainContent div').remove();
	
	$('#imgGoBack').off('click');
	$('#imgGoBack').on('click', function() {
		
		console.log('click');
		NewVisitNamespace.initializePage();
		$(this).off('click');
		$(this).on('click', function() {
			location.replace('../index.html');
		});
		
	})
	
	$('<div id="divHeaderSettings"></div>').appendTo($('#divMainContent'));
	$('<h1>Impostazioni di gioco</h1>').appendTo($('#divHeaderSettings'));
	$('#divHeaderSettings').addClass('ui-widget-header ui-corner-all')
		.css({
			width: '50%',
			margin: 'auto'
		});
	
	$('<div id="waitingParameters" title="Recupero informazioni"><p>Sto recuperando le impostazioni di gioco...</p></div>').appendTo($('#divMainContent'));
	$('#waitingParameters').dialog({
		modal: true,
		draggable: false,
		closeOnEscape: false,
		resizable: false,
		open: function() {
			$('a.ui-dialog-titlebar-close').hide();
		}
	});
	
	$.ajax({
		url: '../server/GetGameSettingsCatchMe.php',
		type: 'POST',
		data: {gameID: gameID, patientID: patientID},
		success: function(message) {
			$('#waitingParameters').dialog("close");
			$('#waitingParameters').remove();
			
			try {
				CatchMeSettingsNamespace.setGameSettings(JSON.parse(message));
			}
			catch(error) {
				console.log(message);
			}
		}
	});
},

setGameSettings: function(data) {
	
	var divLeft = $('<div id="divLeft"></div>');
	divLeft.addClass('leftSide alignLeft');
	divLeft.appendTo($('#divMainContent'));
	var divColoreSfondo = $('<div id="divColoreSfondo"></div>');
	divColoreSfondo.addClass('ui-widget-content ui-corner-all alignLeft');
	
	var paragraph = $('<p>Colore di sfondo</p>');
	paragraph.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	$('<span class="ui-icon ui-icon-pencil"></span>').prependTo(paragraph);
	paragraph.appendTo(divColoreSfondo);
	
	divColoreSfondo.appendTo(divLeft);
	
	// inserire picker per colore di sfondo
	$('<div id="backgroundColor"></div>').appendTo(divColoreSfondo);
	var backgroundPicker = $.farbtastic('#backgroundColor');
	
	backgroundPicker.linkTo(function(color) {
		
		gameSettings.backgroundColor = color;
		$('#previewBackgroundColor').css('background-color', color);
		CatchMeSettingsNamespace.verifyColorContrast();
	});
		
	$('<div id="previewBackgroundColor"></div>').appendTo(divColoreSfondo);
	$('#previewBackgroundColor').height(divColoreSfondo.height() / 2);
					
	backgroundPicker.setColor(data.BACK_COLOR);
	
	var divColoreImmagine = $('<div id="divColoreImmagine"></div>');
	divColoreImmagine.addClass('ui-widget-content ui-corner-all');
	divColoreImmagine.appendTo(divLeft);
	
	paragraph = $('<p>Colore immagine</p>');
	paragraph.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	$('<span class="ui-icon ui-icon-pencil"></span>').prependTo(paragraph);
	paragraph.appendTo(divColoreImmagine);
	
	$('<input type="checkbox" id="changeForegroundColor" name="changeForegroundColor" checked="checked"><label for="changeForegroundColor">Cambia colore dell\'immagine</label>').appendTo(divColoreImmagine);
	$('#changeForegroundColor').change(function() {
		gameSettings.changeImageColor = !gameSettings.changeImageColor;
		
		if (gameSettings.changeImageColor) {
			$('#divColoreImmagine > .colorPickerContainer').fadeIn(500);
			CatchMeSettingsNamespace.verifyColorContrast();
		}
		else {
			$('#divColoreImmagine > .colorPickerContainer').fadeOut(500);
			$('#divBadContrast').fadeOut(500);
		}
	});
	
	$('<div class="colorPickerContainer"></div>').appendTo(divColoreImmagine);
	$('<div id="imageColor"></div>').appendTo($('#divColoreImmagine > .colorPickerContainer'));
	var imagePicker = $.farbtastic('#imageColor');
	imagePicker.linkTo(function(color) {
		gameSettings.foregroundColor = color;
		$('#previewImageColor').css('background-color', color);
		CatchMeSettingsNamespace.verifyColorContrast();
	});
		
	$('<div id="previewImageColor"></div>').appendTo($('#divColoreImmagine > .colorPickerContainer'));
	$('#previewImageColor').height(divColoreImmagine.height() / 2);
					
	imagePicker.setColor(data.IMG_COLOR);
	
	$('<div id="divBadContrast" class="ui-state-error ui-corner-all"></div>').appendTo(divLeft);
	$('<p><span class="ui-icon ui-icon-alert"></span>Attenzione: il contrasto tra colore di sfondo e dell\'immagine è troppo basso.</p>').appendTo($('#divBadContrast'));
	
	if (data.CHANGE_IMG_COLOR == '0') {
		gameSettings.changeImageColor = false;
		$('#changeForegroundColor').removeAttr('checked');
		$('#divColoreImmagine > .colorPickerContainer').fadeOut(500);
		$('#divBadContrast').fadeOut(500);
	}
	
	var divRight = $('<div id="divRight"></div>');
	divRight.addClass('rightSide alignLeft');
	divRight.appendTo($('#divMainContent'));
	
	var divMovimenti = $('<div id="divMovimenti"></div>');
	divMovimenti.addClass('ui-widget-content ui-corner-all');
	divMovimenti.appendTo(divRight);
	
	paragraph = $('<p>Gestione movimenti</p>');
	paragraph.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	$('<span class="ui-icon ui-icon-pencil"></span>').prependTo(paragraph);
	paragraph.appendTo(divMovimenti);
		
	$('<input type="checkbox" id="rightMovement" name="rightMovement" /><label for="rightMovement">Movimento verso destra</label><br />').appendTo(divMovimenti);
	$('#rightMovement').change(function() {
		gameSettings.rightMovement = !gameSettings.rightMovement;
	});
	$('<input type="checkbox" id="leftMovement" name="leftMovement" /><label for="leftMovement">Movimento verso sinistra</label><br />').appendTo(divMovimenti);
	$('#leftMovement').change(function() {
		gameSettings.leftMovement = !gameSettings.leftMovement;
	});
	$('<input type="checkbox" id="upMovement" name="upMovement" /><label for="upMovement">Movimento verso l\'alto</label><br />').appendTo(divMovimenti);
	$('#upMovement').change(function() {
		gameSettings.upMovement = !gameSettings.upMovement;
	});
	$('<input type="checkbox" id="downMovement" name="downMovement" /><label for="downMovement">Movimento verso il basso</label><br /><br />').appendTo(divMovimenti);
	$('#downMovement').change(function() {
		gameSettings.downMovement = !gameSettings.downMovement;
	});
	$('<input type="checkbox" id="startFromCenter" name="startFromCenter" /><label for="startFromCenter">Ricomincia sempre dal centro</label><br />').appendTo(divMovimenti);
	$('#startFromCenter').change(function() {
		gameSettings.startFromCenter = !gameSettings.startFromCenter;
	})
	$('<input type="checkbox" id="mixMovements" name="mixMovements" /><label for="mixMovements">Combina movimenti</label>').appendTo(divMovimenti);
	$('#mixMovements').change(function() {
		gameSettings.mixMovements = !gameSettings.mixMovements;
	})
	$('<div id="divNoMovements" class="ui-state-error ui-corner-all"></div>').appendTo(divMovimenti);
	$('<p><span class="ui-icon ui-icon-alert"></span>Attenzione: nessun movimento selezionato</p>').appendTo($('#divNoMovements'));
	
	if (data.RIGHT_MOV == "1") {
		$('#rightMovement').attr('checked', 'checked');
		gameSettings.rightMovement = true;
		$('#divNoMovements').hide();
	}
	if (data.LEFT_MOV == "1") {
		$('#leftMovement').attr('checked', 'checked');
		gameSettings.leftMovement = true;
		$('#divNoMovements').hide();
	}
	if (data.UP_MOV == "1") {
		$('#upMovement').attr('checked', 'checked');
		gameSettings.upMovement = true;
		$('#divNoMovements').hide();
	}
	if (data.DOWN_MOV == '1') {
		$('#downMovement').attr('checked', 'checked');
		gameSettings.downMovement = true;
		$('#divNoMovements').hide();
	}
	
	var divSpeed = $('<div id="divSpeed"></div>');
	divSpeed.addClass('ui-widget-content ui-corner-all');
	divSpeed.appendTo(divRight);
	
	paragraph = $('<p>Velocità spostamento</p>');
	paragraph.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	$('<span class="ui-icon ui-icon-pencil"></span>').prependTo(paragraph);
	paragraph.appendTo(divSpeed);
	
	gameSettings.speed = data.SPEED;
	
	$('<div class="divContainerSlider"><input id="sliderSpeed" type="slider" name="speed" /></div>').appendTo(divSpeed);
	$('<span id="labelSpeed"></span>').appendTo(divSpeed);
	$('#sliderSpeed').attr('value', gameSettings.speed)
	$('#sliderSpeed').slider({
		from: 1, to: 10, step: 1, format: {format: '#'},
		onstatechange: CatchMeSettingsNamespace.updateLabelSpeed
	});
	
	var divImage = $('<div id="divImage"></div>');
	divImage.appendTo(divRight);
	divImage.addClass('ui-widget-content ui-corner-all');
	
	paragraph = $('<p>Immagine in movimento</p>');
	paragraph.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	$('<span class="ui-icon ui-icon-pencil"></span>').prependTo(paragraph);
	paragraph.appendTo(divImage);
	
	$('<select name="selectImage" id="selectImage"></select>').appendTo(divImage);
	var stringOption = '<option value="' + data.IMG_SPECS.IMG_ID + '" selected="selected"">' + data.IMG_SPECS.IMG_NAME + 
						'</option>';
						
	$(stringOption).appendTo($('#selectImage'));
	
	gameSettings.imageID = data.IMG_SPECS.IMG_ID;
	
	$('#selectImage').change(function() {
		var newImageID = $(this).val();
		gameSettings.imageFileName = aviableImages[newImageID].FILENAME;
		
		$('#imgPreview').attr('src', '../images/'+gameSettings.imageFileName);
		gameSettings.imageID = newImageID;
		
		// Modifico anche il canvas di preview con le dimensioni del nuovo oggetto
		var image = aviableImages[newImageID];
		
		var dimensions = (image.DIMENSIONS).split('x');
		canvasSettings.width = dimensions[0];
		canvasSettings.height = dimensions[1];
		
		var canvas = $('#imageExample')[0];
		canvas.width = canvasSettings.width;
		canvas.height = canvasSettings.height;
		var canvasContext = canvas.getContext('2d');
		canvasContext.fillStyle = gameSettings.foregroundColor;
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);
		
		CatchMeSettingsNamespace.updateCanvasPreview($('#sliderDimensions').attr('value'));
	});
	
	aviableImages[data.IMG_SPECS.IMG_ID] = {
			'NAME': data.IMG_SPECS.IMG_NAME, 
			'FILENAME': data.IMG_SPECS.IMG_FILE, 
			'DIMENSIONS': data.CANVAS_DIMENSIONS};
	
	gameSettings.imageFileName = data.IMG_SPECS.IMG_FILE;
	$('<img id="imgPreview" src="../images/' +gameSettings.imageFileName + '" alt="Preview" />').appendTo(divImage);
	
	var otherImages = data.OTHER_IMG;
	
	for (var imageID in otherImages) {
		
		stringOption = '<option value="' + imageID + '">' + otherImages[imageID].IMG_NAME + 
						'</option>';
						
		aviableImages[imageID] = {
			'NAME': otherImages[imageID].IMG_NAME, 
			'FILENAME': otherImages[imageID].IMG_FILE,
			'DIMENSIONS': otherImages[imageID].IMG_DIMS};
		$(stringOption).appendTo($('#selectImage'))
	}
	
	if (checkColorContrast(gameSettings.backgroundColor, gameSettings.foregroundColor)) {
		$('#divBadContrast').hide();
	}
	
	var dimensions = (data.CANVAS_DIMENSIONS).split('x');
	canvasSettings.width = dimensions[0];
	canvasSettings.height = dimensions[1];
	
	var divDimensions = $('<div id="divDimensions"></div>');
	divDimensions.addClass('ui-widget-content ui-corner-all');
	divDimensions.appendTo(divLeft);
	
	paragraph = $('<p>Dimensione immagine</p>');
	paragraph.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	$('<span class="ui-icon ui-icon-pencil"></span>').prependTo(paragraph);
	paragraph.appendTo(divDimensions);
	
	$('<div class="divContainerSlider"><input type="slider" id="sliderDimensions" name="dimensions" /></div>').appendTo(divDimensions);
	
	$('<div id="exampleDimensions"></div>').appendTo(divDimensions);
	$('#exampleDimensions').css('border', '1px solid #000')
							.css('background-color', gameSettings.backgroundColor);
	var ratio = Math.ceil(screenWidth / $('#divDimensions').width());
	
	$('#exampleDimensions').width(Math.floor(screenWidth / ratio));
	$('#exampleDimensions').height(Math.floor(screenHeight / ratio));
	
	$('<canvas id="imageExample"></canvas>').appendTo($('#exampleDimensions'));
	var canvas = $('#imageExample')[0];
	canvas.width = canvasSettings.width;
	canvas.height = canvasSettings.height;
	var canvasContext = canvas.getContext('2d');
	canvasContext.fillStyle = gameSettings.foregroundColor;
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	gameSettings.percentualImageWidth = data.IMG_WIDTH;
	$('#imageExample').css('width', gameSettings.percentualImageWidth + '%');
	
	$('#sliderDimensions').attr('value', gameSettings.percentualImageWidth);
	$('#sliderDimensions').slider({
		from: 5, to: 80, step: 1,
		format: {format: '##'}, skin: 'plastic', 
		onstatechange: CatchMeSettingsNamespace.updateCanvasPreview
	});
	
	
	$('<div id="divButtons"></div>').appendTo($('#divMainContent'));
	$('#divButtons').addClass('ui-widget-content ui-corner-all');
	
	$('<button id="buttonStart">Comincia!</button>').appendTo($('#divButtons'));
	$('#buttonStart').button()
		.click(function(){
			gameSettings.rightMovement = $('#rightMovement').is(':checked');
			gameSettings.leftMovement = $('#leftMovement').is(':checked');
			gameSettings.downMovement = $('#downMovement').is(':checked');
			gameSettings.upMovement = $('#upMovement').is(':checked');
			gameSettings.startFromCenter = $('#startFromCenter').is(':checked');
			gameSettings.mixMovements = $('#mixMovements').is(':checked');
			
			var areThereErrors = false;
			var stringErrors = "";
			
			if (!gameSettings.rightMovement && !gameSettings.leftMovement &&
				!gameSettings.upMovement && !gameSettings.downMovement) {
				areThereErrors = true;
				stringErrors += "<li>Nessun movimento impostato</li>";
			}
			
			if (!checkColorContrast(gameSettings.getBackgroundRGB(), gameSettings.getForegroundRGB())) {
				areThereErrors = true;
				stringErrors += "<li>Basso contrasto tra colori</li>";
			}
			
			if (areThereErrors) {
				$('<div id="dialogErrorsSettings" title="Attenzione!"></div>').appendTo($('#divMainContent'));
				$('<p>Attenzione: </p>').appendTo($('#dialogErrorsSettings'));
				$('<ul></ul>').appendTo($('#dialogErrorsSettings'));
				$(stringErrors).appendTo($('#dialogErrorsSettings ul'));
				$('#dialogErrorsSettings ul').css('list-style-position', 'inside');
				
				$('#dialogErrorsSettings').dialog({
					modal: true,
					resizable: false,
					draggable: false,
					width: (getScreenWidth() * 0.5),
					buttons: {
						"Conferma": function() {
							$(this).dialog("close");
							CatchMeSettingsNamespace.personalizationComplete();
						},
						"Annulla": function() {
							$(this).dialog("close");
						}
					}
				})
			}
			else {
				CatchMeSettingsNamespace.personalizationComplete();
			}
			
		});
},

/**
 * Devo recuperare le istruzioni per disegnare correttamente canvas
 */
personalizationComplete: function() {
	
	console.log(gameSettings);
	
	gameSettings.canvasDimensions = aviableImages[gameSettings.imageID].DIMENSIONS;
	
	var settingsToSend = {
		rightMovement: gameSettings.rightMovement,
		leftMovement: gameSettings.leftMovement,
		upMovement: gameSettings.upMovement,
		downMovement: gameSettings.downMovement,
		startFromCenter: gameSettings.startFromCenter,
		mixMovements: gameSettings.mixMovements,
		speed: gameSettings.speed,
		backgroundColor: gameSettings.backgroundColor,
		foregroundColor: gameSettings.foregroundColor,
		imageID: gameSettings.imageID,
		changeImageColor: gameSettings.changeImageColor,
		percentualImageWidth: gameSettings.percentualImageWidth,
		imageFileName: gameSettings.imageFileName
	};
	
	$.ajax({
		url: '../server/SaveLevelsCatchMe.php',
		type: 'POST',
		data: {
			patientID: patientID,
			settings: JSON.stringify(settingsToSend)
		},
		success: function(message) {
			//messaggio ok se tutt ok
			console.log(message);
		}
	})
	
	/*var packetToSend = {
		"TYPE": "GAME_SETTINGS",
		"GAME_ID": gameIdentification,
		"SETTINGS": gameSettings
	};
	websocket.send(JSON.stringify(packetToSend));
	
	var packetSession = {
		'TYPE': 'SESSION_SPECS',
		'PATIENT_ID': patientID,
		'GAME_ID': gameIdentification
	};
			
	websocket.send(JSON.stringify(packetSession));
	
	$.getScript('js/watchCatchMe.js')
		.done(function(data, textStatus) {
			console.log("CatchMe loaded");
			websocket.onmessage = CatchMeNamespace.entryFunction;			
		})
		.fail(function(jqxhr, settings, exception) {
			console.log("Error loading file catchMe");
			console.log(jqxhr);
			console.log(settings);
			console.log(exception);
		});*/
}
}