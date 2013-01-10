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
	this.isSpaceGame = false;
	
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

var aviableImages = new Object();
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
					NewVisitNamespace.noClientConnected();
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
		
		NewVisitNamespace.initializePage();
		$(this).off('click');
		$(this).on('click', function() {
			location.replace('../index.html');
		});
		
	})
	
	$('<div>').attr('id', 'divHeaderSettings').appendTo('#divMainContent');
	$('<h1>').text('Impostazioni di gioco').appendTo('#divHeaderSettings');
	$('#divHeaderSettings').addClass('ui-widget-header ui-corner-all')
		.css({
			width: '50%',
			margin: 'auto'
		});
	
	$.ajax({
		url: SERVER_ADDRESS + '/server/GetGameSettingsCatchMe.php',
		type: 'POST',
		data: {gameID: gameID, patientID: patientID},
		success: function(message) {
			
			$('#waitingParameters').dialog("close");
			$('#waitingParameters').remove();
			
			//try {
				CatchMeSettingsNamespace.setGameSettings(JSON.parse(message));
			//}
			//catch(error) {
				//console.log(message);
			//}
		}
	});
},

setGameSettings: function(data) {
	
	var divChooseTypeOfGame = $('<div>').attr('id', 'divChooseTypeOfGame');
	$('<input>').attr('type', 'radio').attr('id', 'spaceGame')
		.attr('name', 'chooseGame').attr('value', 'spaceGame').appendTo(divChooseTypeOfGame);
	$('<label>').attr('for', 'spaceGame').text('Gioco spazio').appendTo(divChooseTypeOfGame);
	
	$('<input>').attr('type', 'radio').attr('id', 'freeGame')
		.attr('name', 'chooseGame').attr('value', 'freeGame').appendTo(divChooseTypeOfGame);
	$('<label>').attr('for', 'freeGame').text('Scelta libera').appendTo(divChooseTypeOfGame);
	
	divChooseTypeOfGame.appendTo('#divMainContent');
	
	$('#divChooseTypeOfGame input:radio').change(function() {
		
		var value = $('#divChooseTypeOfGame input:radio[name=chooseGame]:checked').val();
		
		if (value == "spaceGame") {
			$('div#divLeft div#divColoreSfondo').fadeOut('fast');
			
			$('div#divImage select option:selected').removeAttr('selected');
			
			var imageIDForSpaceGame = -1;
			
			for (imageID in aviableImages) {
				if (aviableImages[imageID].IS_FOR_SPACE_GAME == "false") {
					$('div#divImage select option[value=' + imageID + ']').attr('disabled', 'disabled');
				}
				else {
					if (imageIDForSpaceGame == -1) {
						imageIDForSpaceGame = imageID;
					}
				}
			}
			
			$('div#divImage select option[value=' + imageIDForSpaceGame + ']').attr('selected', 'selected');
			
			$('div#divImage select').change();
			
			gameSettings.isSpaceGame = true;
			
		}
		else if (value == "freeGame") {
			$('div#divLeft div#divColoreSfondo').fadeIn('fast');
			
			$('div#divImage select option:disabled').removeAttr('disabled');
			
			gameSettings.isSpaceGame = false;
		}
	});
	
	var divLeft = $('<div>').attr('id', 'divLeft')
		.addClass('leftSide alignLeft')
		.appendTo('#divMainContent');
	
	var divColoreSfondo = $('<div>').attr('id', 'divColoreSfondo')
		.addClass('ui-widget-content ui-corner-all alignLeft');
	
	var paragraph = $('<p>').text('Colore di sfondo')
		.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	
	$('<span>').addClass('ui-icon ui-icon-pencil').prependTo(paragraph);
	
	paragraph.appendTo(divColoreSfondo);
	
	divColoreSfondo.appendTo(divLeft);
	
	$('<div>').attr('id', 'backgroundColor').appendTo(divColoreSfondo);
	var backgroundPicker = $.farbtastic('#backgroundColor');
	
	backgroundPicker.linkTo(function(color) {
		
		gameSettings.backgroundColor = color;
		$('#previewBackgroundColor').css('background-color', color);
		CatchMeSettingsNamespace.verifyColorContrast();
	});
		
	$('<div>').attr('id', 'previewBackgroundColor').appendTo(divColoreSfondo);
	$('#previewBackgroundColor').height(divColoreSfondo.height() / 2);
					
	backgroundPicker.setColor(data.BACK_COLOR);
	
	var divColoreImmagine = $('<div>').attr('id', 'divColoreImmagine')
		.addClass('ui-widget-content ui-corner-all')
		.appendTo(divLeft);
	
	paragraph = $('<p>').text('Colore immagine')
		.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	
	$('<span>').addClass('ui-icon ui-icon-pencil').prependTo(paragraph);
	paragraph.appendTo(divColoreImmagine);
	
	$('<input>').attr('type', 'checkbox').attr('id', 'changeForegroundColor')
		.attr('name', 'changeForegroundColor').attr('checked', 'checked').appendTo(divColoreImmagine);
	
	$('<label>').attr('for', 'changeForegroundColor')
		.text("Cambia colore dell'immagine").appendTo(divColoreImmagine);

	//$('<input type="checkbox" id="changeForegroundColor" name="changeForegroundColor" checked="checked" /><label for="changeForegroundColor"></label>').appendTo(divColoreImmagine);
	
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
	
	$('<div>').addClass('colorPickerContainer').appendTo(divColoreImmagine);
	
	$('<div>').attr('id', 'imageColor').appendTo('#divColoreImmagine > .colorPickerContainer');
	var imagePicker = $.farbtastic('#imageColor');
	imagePicker.linkTo(function(color) {
		gameSettings.foregroundColor = color;
		$('#previewImageColor').css('background-color', color);
		CatchMeSettingsNamespace.verifyColorContrast();
	});
		
	$('<div>').attr('id', 'previewImageColor').appendTo('#divColoreImmagine > .colorPickerContainer');
	$('#previewImageColor').height(divColoreImmagine.height() / 2);
					
	imagePicker.setColor(data.IMG_COLOR);
	
	$('<div>').attr('id', 'divBadContrast').addClass('ui-state-error ui-corner-all').appendTo(divLeft);
	$('<p><span class="ui-icon ui-icon-alert"></span>Attenzione: il contrasto tra colore di sfondo e dell\'immagine è troppo basso.</p>').appendTo('#divBadContrast');
	
	if (data.CHANGE_IMG_COLOR == '0') {
		gameSettings.changeImageColor = false;
		$('#changeForegroundColor').removeAttr('checked');
		$('#divColoreImmagine > .colorPickerContainer').fadeOut(500);
		$('#divBadContrast').fadeOut(500);
	}
	
	var divRight = $('<div>').attr('id', 'divRight')
		.addClass('rightSide alignLeft')
		.appendTo('#divMainContent');
	
	var divMovimenti = $('<div>').attr('id', 'divMovimenti')
		.addClass('ui-widget-content ui-corner-all')
		.appendTo(divRight);
	
	paragraph = $('<p>').text('Gestione movimenti')
		.addClass('ui-state-default ui-corner-all ui-helper-clearfix')
		.appendTo(divMovimenti);
	
	$('<span>').addClass('ui-icon ui-icon-pencil').prependTo(paragraph);
		
	$('<input>').attr('type', 'checkbox').attr('id', 'rightMovement')
		.attr('name', 'rightMovement').appendTo(divMovimenti)
		.change(function() {
			gameSettings.rightMovement = !gameSettings.rightMovement;
		});
	
	$('<label>').attr('for', 'rightMovement').text('Movimento verso destra').appendTo(divMovimenti);
	$('<br />').appendTo(divMovimenti);
	
	$('<input>').attr('type', 'checkbox').attr('id', 'leftMovement')
		.attr('name', 'leftMovement').appendTo(divMovimenti)
		.change(function() {
			gameSettings.leftMovement = !gameSettings.leftMovement;
	});
	
	$('<label>').attr('for', 'leftMovement').text('Movimento verso sinistra').appendTo(divMovimenti);
	$('<br />').appendTo(divMovimenti);
	
	$('<input>').attr('type', 'checkbox').attr('id', 'upMovement')
		.attr('name', 'upMovement').appendTo(divMovimenti)
		.change(function() {
			gameSettings.upMovement = !gameSettings.upMovement;
	});
	
	$('<label>').attr('for', 'upMovement').text('Movimento verso l\'alto').appendTo(divMovimenti);
	$('<br />').appendTo(divMovimenti);
	
	$('<input>').attr('type', 'checkbox').attr('id', 'downMovement')
		.attr('name', 'downMovement').appendTo(divMovimenti)
		.change(function() {
			gameSettings.downMovement = !gameSettings.downMovement;
	});
	
	$('<label>').attr('for', 'downMovement').text('Movimento verso il basso').appendTo(divMovimenti);
	$('<br /><br />').appendTo(divMovimenti);
	
	$('<input>').attr('type', 'checkbox').attr('id', 'startFromCenter')
		.attr('name', 'startFromCenter').appendTo(divMovimenti)
		.change(function() {
			gameSettings.startFromCenter = !gameSettings.startFromCenter;
	});
	
	$('<label>').attr('for', 'startFromCenter').text('Ricomincia sempre dal centro').appendTo(divMovimenti);
	$('<br />').appendTo(divMovimenti);
	
	$('<input>').attr('type', 'checkbox').attr('id', 'mixMovements')
		.attr('name', 'mixMovements').appendTo(divMovimenti)
		.change(function() {
			gameSettings.mixMovements = !gameSettings.mixMovements;
	})
	
	$('<label>').attr('for', 'mixMovements').text('Combina movimenti').appendTo(divMovimenti);
	
	$('<div>').attr('id', 'divNoMovements').addClass('ui-state-error ui-corner-all').appendTo(divMovimenti);
	$('<p><span class="ui-icon ui-icon-alert"></span>Attenzione: nessun movimento selezionato</p>').appendTo('#divNoMovements');
	
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
	if (data.START_CENTER == "1") {
		$('#startFromCenter').attr('checked', 'checked');
		gameSettings.startFromCenter = true;
	}
	if (data.MIX_MOVEMENTS == "1") {
		$('#mixMovements').attr('checked', 'checked');
		gameSettings.mixMovements = true;
	}
	
	
	var divSpeed = $('<div>').attr('id', 'divSpeed')
		.addClass('ui-widget-content ui-corner-all')
		.appendTo(divRight);
	
	paragraph = $('<p>').text('Velocità spostamento')
		.addClass('ui-state-default ui-corner-all ui-helper-clearfix')
		.appendTo(divSpeed);
	$('<span>').addClass('ui-icon ui-icon-pencil').prependTo(paragraph);
	
	gameSettings.speed = data.SPEED;
	
	/*var divSliderContainer = $('<div>').addClass('divContainerSlider').appendTo(divSpeed);
	
	var slider = $('<input>').attr('id', 'sliderSpeed').attr('type', 'slider')
		.attr('name', 'speed')
		.slider({
			from: 1, to: 10, step: 1, format: {format: '#'},
			onstatechange: CatchMeSettingsNamespace.updateLabelSpeed
	});
	slider.attr('value', gameSettings.speed);
	slider.appendTo(divSliderContainer);
	
	$('<span>').attr('id', 'labelSpeed').appendTo(divSpeed);*/
	
	$('<input>').attr('id', 'sliderSpeed').attr('type', 'slider')
		.attr('name', 'speed')
		.appendTo($('<div>').addClass('divContainerSlider').appendTo(divSpeed));
	
	$('<span>').attr('id', 'labelSpeed').appendTo(divSpeed);
	$('#sliderSpeed').attr('value', gameSettings.speed)
	$('#sliderSpeed').slider({
		from: 1, to: 10, step: 1, format: {format: '#'},
		onstatechange: CatchMeSettingsNamespace.updateLabelSpeed
	});
	
	var divImage = $('<div>').attr('id', 'divImage')
		.addClass('ui-widget-content ui-corner-all')
		.appendTo(divRight);
	
	paragraph = $('<p>').text('Immagine in movimento')
		.addClass('ui-state-default ui-corner-all ui-helper-clearfix')
		paragraph.appendTo(divImage);
	
	$('<span>').addClass('ui-icon ui-icon-pencil').prependTo(paragraph);
	
	$('<select>').attr('name', 'selectImage').attr('id', 'selectImage').appendTo(divImage);
	
	$('<option>').val(data.IMG_SPECS.IMG_ID).attr('selected', 'selected')
		.text(data.IMG_SPECS.IMG_NAME).appendTo('#selectImage');
	
	gameSettings.imageID = data.IMG_SPECS.IMG_ID;
	
	$('#selectImage').change(function() {
		var newImageID = $(this).val();
		gameSettings.imageFileName = aviableImages[newImageID].FILENAME;
		
		$('#imgPreview').attr('src', '../catchMe/images/' + gameSettings.imageFileName);
		gameSettings.imageID = newImageID;
		
		// Modifico anche il canvas di preview con le dimensioni del nuovo oggetto
		var image = aviableImages[newImageID];
		
		var size = (image.SIZE).split('x');
		canvasSettings.width = size[0];
		canvasSettings.height = size[1];
		
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
			'SIZE': data.CANVAS_SIZE,
			'IS_FOR_SPACE_GAME': data.IMG_SPECS.IS_FOR_SPACE_GAME};
	
	gameSettings.imageFileName = data.IMG_SPECS.IMG_FILE;
	$('<img>').attr('id', 'imgPreview').attr('src', '../catchMe/images/' + gameSettings.imageFileName)
		.attr('alt', 'Preview').appendTo(divImage);
	
	var otherImages = data.OTHER_IMG;
	
	for (var imageID in otherImages) {
						
		aviableImages[imageID] = {
			'NAME': otherImages[imageID].IMG_NAME, 
			'FILENAME': otherImages[imageID].IMG_FILE,
			'SIZE': otherImages[imageID].IMG_SIZE,
			'IS_FOR_SPACE_GAME': otherImages[imageID].IS_FOR_SPACE_GAME};
		
		$('<option>').val(imageID).text(otherImages[imageID].IMG_NAME)
			.appendTo('#selectImage')
	}
	
	if (checkColorContrast(gameSettings.backgroundColor, gameSettings.foregroundColor)) {
		$('#divBadContrast').hide();
	}
	
	var size = (data.CANVAS_SIZE).split('x');
	canvasSettings.width = size[0];
	canvasSettings.height = size[1];
	
	var divDimensions = $('<div>').attr('id', 'divDimensions')
		.addClass('ui-widget-content ui-corner-all')
		.appendTo(divLeft);
	
	paragraph = $('<p>').text('Dimensione immagine')
		.addClass('ui-state-default ui-corner-all ui-helper-clearfix');
	
	$('<span>').addClass('ui-icon ui-icon-pencil').prependTo(paragraph);
	
	paragraph.appendTo(divDimensions);
	
	$('<input>').attr('type', 'slider').attr('id', 'sliderDimensions')
		.attr('name', 'dimensions').appendTo($('<div>').addClass('divContainerSlider').appendTo(divDimensions));
	
	$('<div>').attr('id', 'exampleDimensions').appendTo(divDimensions)
		.css({
			border: '1px solid #000',
			'background-color': gameSettings.backgroundColor
		});
	
	var ratio = Math.ceil(screenWidth / $('#divDimensions').width());
	
	$('#exampleDimensions').width(Math.floor(screenWidth / ratio));
	$('#exampleDimensions').height(Math.floor(screenHeight / ratio));
	
	$('<canvas>').attr('id', 'imageExample').appendTo('#exampleDimensions');
	var canvas = $('#imageExample')[0];
	canvas.width = canvasSettings.width;
	canvas.height = canvasSettings.height;
	var canvasContext = canvas.getContext('2d');
	canvasContext.fillStyle = gameSettings.foregroundColor;
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
	gameSettings.percentualImageWidth = data.IMG_WIDTH;
	$('#imageExample').css('width', gameSettings.percentualImageWidth + '%');
	
	$('#sliderDimensions').attr('value', gameSettings.percentualImageWidth)
		.slider({
			from: 5, to: 80, step: 1,
			format: {format: '##'}, skin: 'plastic', 
			onstatechange: CatchMeSettingsNamespace.updateCanvasPreview
	});
	
	
	$('<div>').attr('id', 'divButtons').appendTo('#divMainContent')
		.addClass('ui-widget-content ui-corner-all');
	
	$('<button>').attr('id', 'buttonStart').text('Comincia!')
		.appendTo('#divButtons').button()
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
			
			if (gameSettings.changeImageColor && 
					!checkColorContrast(gameSettings.getBackgroundRGB(), gameSettings.getForegroundRGB())) {
				areThereErrors = true;
				stringErrors += "<li>Basso contrasto tra colori</li>";
			}
			
			if (areThereErrors) {
				$('<div>').attr('id', 'dialogErrorsSettings').attr('title', 'Attenzione!').appendTo('#divMainContent');
				$('<p>').text('Attenzione: ').appendTo('#dialogErrorsSettings');
				$('<ul>').appendTo('#dialogErrorsSettings');
				$(stringErrors).appendTo('#dialogErrorsSettings ul');
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
		
		if (data.IS_SPACE_GAME == "1") {
			
			$('div#divChooseTypeOfGame input:radio[value=spaceGame]').attr('checked', 'checked');
			$('div#divChooseTypeOfGame input:radio').change();
		}
		else {
			$('div#divChooseTypeOfGame input:radio[value=freeGame]').attr('checked', 'checked');
			$('div#divChooseTypeOfGame input:radio').change();
		}
},

/**
 * Devo recuperare le istruzioni per disegnare correttamente canvas
 */
personalizationComplete: function() {
	
	console.log(gameSettings);
	
	gameSettings.canvasSize = aviableImages[gameSettings.imageID].SIZE;
	
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
		imageFileName: gameSettings.imageFileName,
		isSpaceGame: gameSettings.isSpaceGame
	};
	
	$.ajax({
		url: SERVER_ADDRESS + '/server/SaveLevelsCatchMe.php',
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
	
	var packetToSend = {
		TYPE: "GAME_SETTINGS",
		GAME_ID: gameID,
		SETTINGS: gameSettings,
		PATIENT_ID: patientID
	};
	websocket.send(JSON.stringify(packetToSend));
	
	/*var packetSession = {
		'TYPE': 'SESSION_SPECS',
		'PATIENT_ID': patientID,
		'GAME_ID': gameIdentification
	};
			
	websocket.send(JSON.stringify(packetSession));*/
	
	$('#divMainContent > h1').text('Prendimi!');
	
	websocket.onmessage = CatchMeNamespace.entryFunction;
	
	/*$.getScript('js/watchCatchMe.js')
		.done(function(data, textStatus) {
			console.log("CatchMe loaded");
						
		})
		.fail(function(jqxhr, settings, exception) {
			console.log("Error loading file catchMe");
			console.log(jqxhr);
			console.log(settings);
			console.log(exception);
		});*/
}
}