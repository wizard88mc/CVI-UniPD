/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

var port = 8001;
var identificationType = "GAME_CLIENT";
var gameIdentification = "CATCH_ME";
var patientID = "";
var stringForOfflineFile = "";
var packetsIntoOfflineString = 0;
var timerWriter = null;
var folderNameLocalStorage = "";

function presentationComplete() {
	
	websocket.onmessage = function(message) {
		
		var data = JSON.parse(message.data);
		
		if (data.TYPE == "SCREEN_MEASURES") {
			data.RESULT = true;
			data.SCREEN_WIDTH = getScreenWidth();
			data.SCREEN_HEIGHT = getScreenHeight();
			
			websocket.send(JSON.stringify(data));
		}
		else if (data.TYPE == "GAME_SETTINGS") {

			console.log("CatchMeGame Settings");
				
			CatchMeNamespace.defineGame(data.SETTINGS);
		}
		else if (data.TYPE == 'GO_BACK') {
			websocket.close();
			
			location.replace('../patient/index.html');
		}
		else {
			console.log("Bad packet received");
			console.log(message)
		}
	}
}

var centerImage = new Point();
var topCenterScreen = new Point();
var bottomCenterScreen = new Point();
var leftMiddleScreen = new Point();
var rightMiddleScreen = new Point();

function Animation(startP, endP, finalA, mov) {
	
	this.startPoint = startP;
	this.endPoint = endP;
	this.finalAnimation = finalA;
	this.movement = mov;
	this.distance = Math.sqrt(Math.pow(this.startPoint.left - this.endPoint.left, 2) + 
					Math.pow(this.startPoint.top - this.endPoint.top, 2));
					
this.calculateAnimationTime = function() {
					
	return Math.round(this.distance / (gameSettings.speed * 5));
}
}

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
	this.changeImageColor = true;
	this.isSpaceGame = false;
	this.percentualImageWidth = 0; // percentual of the image width, used for CSS
	this.effectiveImageWidth = 0; // image width in pixels, useful for calculations
	this.effectiveImageHeight = 0; // image height in pixels, used for calculation	
	
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
var gameSettings = null;

var aviableImages = new Array();
var timeCloseIconShowed = 0;
var patientID = null;

function CanvasSettings() {

	this.finalPoint = new Point();
	this.actualPoint = new Point();
	this.rules = "";
	this.width = -1;
	this.height = -1;
	this.fileName = "";
	
this.isArrivedToDestination = function() {
	return (this.actual.left == this.finalPoint.left && 
			this.actual.top == this.finalPoint.top)
}
}
var canvasSettings = null;

function GameManager() {
	this.gameInAction = true;
	this.sensibility = 1000 / 25;
	this.repetitionBasicMovements = 2;
	this.idImageChoosed = -1;
	this.timing;
	this.timeToStart = null;
	this.lastMessageSent = 0;
	this.sequenceOfAnimations = [];
	this.animationsIterator = 0;
	this.currentAnimation = null;
	this.lastTimePlayedGoodSound = 0;
}
var gameManager = null;

var CatchMeNamespace = {

defineGame: function(settings) {
	canvasSettings = new CanvasSettings();
	gameManager = new GameManager();
	gameSettings = new GameSettings();
	
	gameSettings.rightMovement = settings.rightMovement || settings.RIGHT_MOV;
	gameSettings.downMovement = settings.downMovement || settings.DOWN_MOV;
	gameSettings.upMovement = settings.upMovement || settings.UP_MOV;
	gameSettings.leftMovement = settings.leftMovement || settings.LEFT_MOV;
	gameSettings.startFromCenter = Boolean(settings.startFromCenter || settings.START_CENTER);
	gameSettings.mixMovements = Boolean(settings.mixMovements || settings.MIX_MOVEMENTS);
	gameSettings.backgroundColor = settings.backgroundColor || settings.BACK_COLOR;
	gameSettings.foregroundColor = settings.foregroundColor || settings.IMG_COLOR;
	gameSettings.speed = Number(settings.speed || settings.SPEED);
	gameSettings.changeImageColor = Boolean(settings.changeImageColor || settings.CHANGE_IMG_COLOR);
	gameSettings.percentualImageWidth = Number(settings.percentualImageWidth || settings.IMG_WIDTH);
	gameSettings.isSpaceGame = Boolean(settings.IS_SPACE_GAME || settings.isSpaceGame);
	
	var dimensions = (settings.canvasSize || settings.CANVAS_SIZE).split("x");
	canvasSettings.width = Number(dimensions[0]);
	canvasSettings.height = Number(dimensions[1]);
	canvasSettings.fileName = settings.imageFileName || settings.IMG_SPECS.IMG_FILE;
	
	var divSounds = $('<div>').attr('id', 'divSounds').appendTo('body');
	
	var arraySounds = ['bene', 'molto_bene', 'continua_cosi'];
	
	for (index in arraySounds) {
		
		addSoundSource($('<audio>').addClass('soundGreetings').appendTo(divSounds), arraySounds[index]);
	}
	
	CatchMeNamespace.buildAnimations();
},

createTransitionCSS: function(time, endPosition) {
	
	var stringTransition = 'left ' + time + 's, top ' + time + 's'; 
	
	addTransitionSpecifications($('#image'), stringTransition);
	
	$('#image').css({
		left: endPosition.left + 'px',
		top: endPosition.top + 'px'
	});
},

timingFunction: function() {
	
	var timeNow = new Date().getTime();
	var position = $('#image').position();
	canvasSettings.actual = new Point(Math.round(position.top), Math.round(position.left));
		
	var packet = {
		TYPE: "GAME_DATA",
		SUBTYPE: "POSITIONS",
		TIME: timeNow - gameManager.timeToStart,
		IMAGE: [canvasSettings.actual.left, canvasSettings.actual.top],
		TOUCH: [touchManager.posX, touchManager.posY],
		MOVEMENT: gameManager.currentAnimation.movement
	}
	
	resetTouch();
	
	websocket.send(JSON.stringify(packet));

	gameManager.lastMessageSent = timeNow - gameManager.timeToStart;
		
	if (canvasSettings.isArrivedToDestination()) {
		
		if (gameManager.currentAnimation.finalAnimation == true) {
			// funzione di arrivo a destinazione
			CatchMeNamespace.animationEndMovement();
		}
		else {
			CatchMeNamespace.defineAnimationFunction(false, 0);
		}
	}

	if (!gameManager.gameInAction) {
		
		websocket.close();
		websocket = null;
		
		CatchMeNamespace.createTransitionCSS(0, canvasSettings.actual);
		clearInterval(gameManager.timing);
		CatchMeNamespace.animationEndGame(); 
	}
	if ((timeNow - timeCloseIconShowed) > 5000) {
		
		$('#divCloseGame img').css('visibility', 'hidden');
		$('#divCloseGame img').unbind('click');
	}
	
},

putInWaiting: function() {
	
	$('#divMainContent').remove();
	
	var machineID = checkAlreadySync();
	
	websocket.onmessage = CatchMeNamespace.waitingToStart;
	
	var packetToSend = {
		"TYPE": "READY_TO_PLAY", 
		"MACHINE_ID": machineID,
		"IMAGE_WIDTH": gameSettings.effectiveImageWidth,
		"IMAGE_HEIGHT": gameSettings.effectiveImageHeight,
		"SCREEN_WIDTH": getScreenWidth(),
		"SCREEN_HEIGHT": getScreenHeight()
	}
	
	websocket.send(JSON.stringify(packetToSend));
},

trainingComplete: function() {
	
	websocket.onmessage = CatchMeNamespace.waitingToStart;
},

waitingToStart: function(message) {
	
	var packet = JSON.parse(message.data || message);

	if (packet.TYPE == "START_WORKING") {
		
		gameManager.timeToStart = packet.START_TIME;
		
		$()
		
		websocket.onmessage = function(message) { 
			try {
				var packet = JSON.parse(message.data);
				// se ricevo messaggio che mi dice di 
				// interrompere simulazione, stoppo gioco
				if (packet.TYPE == "CHANGE_SPEED") {
					gameSettings.speed = packet.NEW_SPEED;	
				}
				else if (packet.TYPE == "STOP_GAME") {
					gameManager.gameInAction = false;
					
				}
				else {
					throw "Bad packet in waitingToStart";
				}
			}
			catch(error) {
				console.log("Bad packet received: " + error);
				console.log(message);
				console.log(message.data);
			}
		};
		// devo recuperare istruzioni per disegnare
		CatchMeNamespace.startGame();
	}
	else if (packet.TYPE == "START_TRAINING") {
		
		TrainingExamplesNamespace.startTraining();
	}
	else if (packet.TYPE == "TRAINING_POSITION") {
		
		TrainingExamplesNamespace.messageManager(packet);
	}
	else {
		console.log("Bad message received during game");
		console.log(packet);
	}
},

drawCanvas: function() {
	
	var canvas = $('<canvas>').attr('id', 'image')
		.appendTo('body').css('z-index', '10');
	
	canvas[0].width = canvasSettings.width;
	canvas[0].height = canvasSettings.height;
	var context = canvas[0].getContext('2d');
	var image = new Image();
	image.src = 'images/' + canvasSettings.fileName;
	$(image).load(function() {
		context.drawImage(image, 0, 0, canvasSettings.width, canvasSettings.height);
	})
	
	
	canvas.css('width', gameSettings.percentualImageWidth + '%');
	canvas.css('position', 'absolute');
	
	gameSettings.effectiveImageWidth = canvas.width();
	gameSettings.effectiveImageHeight = canvas.height();
	
	if (gameSettings.changeImageColor) {
		
		var arrayForeground = gameSettings.getForegroundRGB();
		setSpecificColor('image', arrayForeground[0],
						arrayForeground[1], arrayForeground[2]);
	}
},

buildAnimations: function() {
	
	$('body').css({
		margin: '0em',
		padding: '0em'
	});
	CatchMeNamespace.drawCanvas();
	$('#image').css('visibility', 'hidden');
	
	//canvas è definito in tutte le sue forme / misure, 
	// posso iniziare a costruire animazioni
	
	centerImage.top = Math.floor(getScreenHeight() / 2 - (gameSettings.effectiveImageHeight / 2));
	centerImage.left = Math.floor(getScreenWidth() / 2 - (gameSettings.effectiveImageWidth / 2)); 
	
	topCenterScreen.top = 0;
	topCenterScreen.left = centerImage.left;
	bottomCenterScreen.top = getScreenHeight() - gameSettings.effectiveImageHeight;
	bottomCenterScreen.left = centerImage.left;
	leftMiddleScreen.top = centerImage.top;
	leftMiddleScreen.left = 0;
	rightMiddleScreen.left = getScreenWidth() - gameSettings.effectiveImageWidth;
	rightMiddleScreen.top = centerImage.top; 
	
	for (var i = 0; i < 100; i++) {
		var animations = CatchMeNamespace.defineSingleAnimation();
		
		gameManager.sequenceOfAnimations = gameManager.sequenceOfAnimations.concat(animations);	
	}
	// ho definito tutte le animazioni, sono pronto con tutto
	CatchMeNamespace.putInWaiting();
},

startGame: function() {
	
	var packetSpeed = {'TYPE': 'SPEED_VALUE', 'SPEED': gameSettings.speed};
	websocket.send(JSON.stringify(packetSpeed));
	
	$('body').css({
		background: 'none',
		width: getScreenWidth(),
		height: getScreenHeight()
	});
	
	$('#imageTraining').remove();
	
	if (!gameSettings.isSpaceGame) {
		$('body').css({
			'background-color': gameSettings.backgroundColor
		});
	}
	else {
		$('body').css({
			'background-color': '#000064',
			'background-image': 'url("../images/background_training.png")',
			'background-size': '100%',
			'background-position': 'left bottom',
			'background-repeat': 'no-repeat'
		})
	}
	
	/**
	 * Registro gli eventi per la gestione del tocco
	 */
	$('body').on('touchstart touchmove', function(e) {
		e.preventDefault();
	});
	$('body').on('mousedown touchstart', touchTouch)
			.on('mousemove touchmove', touchMove)
			.on('mouseup touchend', touchUp);
	
	$('#image').on('mousemove touchmove touchstart mousedown', function(e) {

		e.preventDefault();
		var time = new Date().getTime();
		if (time - gameManager.lastTimePlayedGoodSound > 5000) {
			
			var number = $('#divSounds audio').length;
			
			var index = Math.floor(Math.random() * number);
			$('#divSounds audio').get(index).play();
			
			gameManager.lastTimePlayedGoodSound = time;
		}
	});
	
	$('<div>').attr('id', 'divCloseGame').appendTo('body')
		.css({
			position :'absolute',
			width: '10%',
			left: '90%',
			top: '0',
			height: '3em',
			'background-color': 'inherit',
			'text-align': 'center',
			'z-index': '3'
		});
						
	$('<img>').attr('src', '../images/close.png').attr('alt', 'Chiudi').appendTo('#divCloseGame');
	$('#divCloseGame img').css('width', '40%').css('visibility', 'hidden');
	
	$('#divCloseGame').on('click touchstart', function(event) {
		
		$('#divCloseGame img').css('visibility', 'visible');
		timeCloseIconShowed = new Date().getTime();
		$('#divCloseGame img').on('click touchstart', function(event) {
			
			gameManager.gameInAction = false;
			var packetToSend = { TYPE: 'STOP_GAME'};
			
			websocket.send(JSON.stringify(packetToSend));
		});
	});			
	
	$('#image').css('visibility', 'visible');
	
	CatchMeNamespace.defineAnimationFunction(true);
},

/**
 * 
 * @param {bool} firstTime specifies if the function is called for the first time
 */
defineAnimationFunction: function(firstTime, timeToWait) {
	
	if (firstTime) {
		// Rimuovere questa riga una volta a posto con sincronizzazione
		// gameManager.timeToStart = new Date().getTime() + 5000;
		timeToWait = gameManager.timeToStart - new Date().getTime();
	}
	
	if (gameManager.animationsIterator >= gameManager.sequenceOfAnimations.length) {
		gameManager.animationsIterator = 0;
	}
	var animationToPerform = gameManager.sequenceOfAnimations[gameManager.animationsIterator];
	gameManager.animationsIterator++;
	gameManager.currentAnimation = animationToPerform;
	var startPoint = animationToPerform.startPoint;
	var endPoint = animationToPerform.endPoint;
	
	canvasSettings.finalPoint = new Point(endPoint.top, endPoint.left);
	
	$('#image').css({
		left: startPoint.left,
		top: startPoint.top
	});

	var timeForAnimation = animationToPerform.calculateAnimationTime();
	
	setTimeout(function() {
		
		CatchMeNamespace.createTransitionCSS(timeForAnimation, canvasSettings.finalPoint);
		
		if (firstTime) {
			gameManager.timing = setInterval(CatchMeNamespace.timingFunction, gameManager.sensibility);	
		}
		
	}, timeToWait);
	
},

defineSingleAnimation: function() {
	
	var animations = [];
	var startPoint = null, endPoint = null;
							
	if (gameSettings.startFromCenter) {
		startPoint = new Point(centerImage.top, centerImage.left);
	}
	if (gameSettings.upMovement) {
		
		for (var i = 0; i < gameManager.repetitionBasicMovements; i++) { 
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
			}
			
			endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'T'));
		}
	}
	if (gameSettings.downMovement) {
		
		for (var i = 0; i < gameManager.repetitionBasicMovements; i++) {
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(topCenterScreen.top, topCenterScreen.left);
			}
			
			endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'B'));
		}
	}
	if (gameSettings.leftMovement /*&& !gameSettings.rightMovement && 
		!gameSettings.upMovement && !gameSettings.downMovement*/) {
			
		for (var i = 0; i < gameManager.repetitionBasicMovements; i++) {
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			}
			
			endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'L'));
		}
	}
	if (gameSettings.rightMovement /*&& !gameSettings.leftMovement && 
		!gameSettings.upMovement && !gameSettings.downMovement*/) {
		
		for (var i = 0; i < gameManager.repetitionBasicMovements; i++) {
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);	
			}
	
			endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'R'));
		}
	}
	
	if (gameSettings.upMovement && gameSettings.downMovement && gameSettings.mixMovements
		/* && !gameSettings.leftMovement && !gameSettings.rightMovement*/) {
		
		var movement = '';
		if (Math.random() > 0.5) {
			// movimento da alto verso basso
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(topCenterScreen.top, topCenterScreen.left);
			}
			endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
			movement = 'B';
		}
		else {
			// movimento da basso verso alto
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
			}
			endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
			movement = 'T'
		}
		animations.push(new Animation(startPoint, endPoint, true, movement));
	}
	if (gameSettings.upMovement && gameSettings.leftMovement && gameSettings.mixMovements  
		/* && !gameSettings.downMovement && !gameSettings.rightMovement*/) {
	
		if (!gameSettings.startFromCenter) {
			startPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
		}
		endPoint = new Point(topCenterScreen.top, 
					topCenterScreen.left - Math.floor(Math.random() * topCenterScreen.left));

		animations.push(new Animation(startPoint, endPoint, true, 'TL'));
	}
	if (gameSettings.upMovement && gameSettings.rightMovement && gameSettings.mixMovements 
		/*&& !gameSettings.downMovement && !gameSettings.leftMovement */) {
		
		if (!gameSettings.startFromCenter) {
			startPoint = new Point(bottomCenterScreen.top,
						bottomCenterScreen.left - Math.floor(Math.random() * bottomCenterScreen.left));
		}
		endPoint = new Point(topCenterScreen.top,
					topCenterScreen.left + Math.floor(Math.random() * topCenterScreen.left));
		
		animations.push(new Animation(startPoint, endPoint, true, 'TR'));
	}
	if (gameSettings.downMovement && gameSettings.leftMovement && gameSettings.mixMovements
		/*&& !gameSettings.upMovement && !gameSettings.rightMovement*/) {
	
		if (!gameSettings.startFromCenter) {
			startPoint = new Point(topCenterScreen.top,
						topCenterScreen.left + Math.floor(Math.random() * topCenterScreen.left));
		}
		endPoint = new Point(bottomCenterScreen.top,
					bottomCenterScreen.left - Math.floor(Math.random() * bottomCenterScreen.left));
		
		animations.push(new Animation(startPoint, endPoint, true, 'BL'));
	}
	if (gameSettings.downMovement && gameSettings.rightMovement && gameSettings.mixMovements
		/*&& !gameSettings.upMovement && !gameSettings.leftMovement*/) {
			
		if (!gameSettings.startFromCenter) {
			startPoint = new Point(topCenterScreen.top,
						topCenterScreen.left - Math.floor(Math.random() * topCenterScreen.left));
		}
		endPoint = new Point(bottomCenterScreen.top,
					bottomCenterScreen.left + Math.floor(Math.random() * bottomCenterScreen.left));
		
		animations.push(new Animation(startPoint, endPoint, true, 'BR'));
	}
	if (gameSettings.leftMovement && gameSettings.rightMovement && gameSettings.mixMovements 
		/*&& !gameSettings.upMovement && !gameSettings.downMovement*/) {
		
		var randomValue = Math.random();
		if (!gameSettings.startFromCenter) {
			if (randomValue > 0.5) {
				//da destra verso sinistra
				startPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			}
			else {
				startPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
			}
		}
		var movement = '';
		if (randomValue > 0.5) {
			endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
			movement = 'L'
		}
		else {
			endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			movement = 'R';
		}
		animations.push(new Animation(startPoint, endPoint, true, movement));
		
		
	}
	if (gameSettings.upMovement && gameSettings.downMovement && 
		gameSettings.leftMovement && gameSettings.mixMovements /*&& !gameSettings.rightMovement*/) {
		
			if (Math.random() > 0.5) {
				// primo movimento verso l'alto
				if (!gameSettings.startFromCenter) {
					startPoint = new Point(rightMiddleScreen.left,
								rightMiddleScreen.top + Math.floor(Math.random() * rightMiddleScreen.top));
					
					endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
					
				}
				else {
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * leftMiddleScreen.top),
								leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
			}
			else {
				// primo movimento verso il basso 
				if (!gameSettings.startFromCenter) {
					startPoint = new Point(rightMiddleScreen.left,
								rightMiddleScreen.top - Math.floor(Math.random() * rightMiddleScreen.top));
					
					endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				}
				else {
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * leftMiddleScreen.top),
								leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
			}
	}
	
	if (gameSettings.upMovement && gameSettings.downMovement && 
		gameSettings.rightMovement && gameSettings.mixMovements /**&& !gameSettings.leftMovement*/) {
			
		if (Math.random() > 0.5) {
				// primo movimento verso l'alto
				if (!gameSettings.startFromCenter) {
					startPoint = new Point(leftMiddleScreen.left,
								leftMiddleScreen.top + Math.floor(Math.random() * leftMiddleScreen.top));
					
					endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
					
				}
				else {
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * rightMiddleScreen.top),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
			}
			else {
				// primo movimento verso il basso 
				if (!gameSettings.startFromCenter) {
					startPoint = new Point(leftMiddleScreen.left,
								leftMiddleScreen.top - Math.floor(Math.random() * leftMiddleScreen.top));
					
					endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				}
				else {
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * rightMiddleScreen.top),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'TR'));
			}
	}

	if (gameSettings.downMovement && gameSettings.leftMovement && 
		gameSettings.rightMovement && gameSettings.mixMovements /*&& !gameSettings.upMovement*/) {
			
			if (Math.random() > 0.5) {
				// primo movimento verso sinistra
				if (!gameSettings.startFromCenter) {
					startPoint = new Point(topCenterScreen.top,
								topCenterScreen.left + Math.floor(Math.random() * topCenterScreen.left));
					endPoint = new Point(leftMiddleScreen.top, leftMidlleScreen.left);
				}
				else {
					endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * (leftMiddleScreen.top / 2)));
				}
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left + Math.floor(Math.random() * bottomCenterScreen.left));
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				
			}
			else {
				// primo movimento verso destra
				if (!gameSettings.startFromCenter) {
					startPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * topCenterScreen.left));
					endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
				}
				else {
					endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)));	
				}
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left - Math.floor(Math.random() * bottomCenterScreen.left));
				
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
			}
	}
	if (gameSettings.upMovement && gameSettings.downMovement &&
		gameSettings.leftMovement && gameSettings.rightMovement && gameSettings.mixMovements) {
		
		var firstPoint = Math.random();
		var direction = Math.random();
		
		if (firsPoint < 0.25) {
			// punto di partenza in alto
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(topCenterScreen.top, topCenterScreen.left);	
			}
			if (direction < 0.5) {
				// primo spostamento verso destra
				
				endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
							leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'TR'));
				
			}
			else {
				// primo spostamento verso sinistra	
				endPoint = new Point(leftMiddleScreen.top,
							leftMiddleScreen.left + Math.floor(Math.random() * (leftMiddleScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(topCenterScreen.top, endPoint.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'TL'));
			}
		}
		else if (firstPoint >= 0.25 && firsPoint < 0.5) {
			// punto di partenza a destra
			
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			}
			if (direction < 0.5) {
				// primo spostamento verso basso
				
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
							leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(topCenterScreen.top, 
							topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				
			}
			else {
				// primo spostamento verso alto	
				endPoint = new Point(topCenterScreen.top,
							topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
							leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'TR'));
			}
		}
		else if (firstPoint >= 0.5 && firstPoint < 0.75) {
			// punto di partenza in basso
			
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);	
			}
			if (direction < 0.5) {
				// primo spostamento verso destra
				
				endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(topCenterScreen.top,
							topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
							leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				
			}
			else {
				// primo spostamento verso sinistra	
				endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
							leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(topCenterScreen.top,
							topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
			}	
		}
		else if (firstPoint >= 0.75) {
			// punto di partenza a sinistra
			
			if (!gameSettings.startFromCenter) {
				startPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
			}
			if (direction < 0.5) {
				// primo spostamento verso basso
				
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(topCenterScreen.top,
							topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
				
			}
			else {
				// primo spostamento verso alto	
				endPoint = new Point(topCenterScreen.top,
							topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'TL'));
			}
		}
	}
	
	return animations;
},

/**
 * Creates the animation to perform when the image arrives
 * at destination or when the patient touches the image
 * for a defined amount of time
 */
animationEndMovement: function() {
	
	console.log("Animazione Completata");
	$('#image').remove();
	CatchMeNamespace.drawCanvas();
	setTimeout(CatchMeNamespace.defineAnimationFunction(false, 2000), 2000);
},

/**
 * creates the animation to perform at the end of the game
 */
animationEndGame: function() {
	
	console.log("Animazione fine gioco + ritorno stato iniziale");
	
	setTimeout(location.replace('../patient/index.html'), 2000);
}}

$('document').ready(function(e) {
	
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
		openWebSocket(port);
	}
	else if (getFromSessionStorage("permission") == "PATIENT") {
		manageOnCloseWebsocket(null);
	}
};


function manageOnCloseWebsocket(e) {
    console.log("Websocket works offline");
    
    websocket = new Object();
    websocket.send = function() {};
    websocket.close = function() {};

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    if (window.requestFileSystem) {
	    window.webkitStorageInfo.requestQuota(window.PERSISTENT, 10*1024*1024, function(grantedBytes) {
	
	        window.requestFileSystem(window.PERSISTENT, grantedBytes, OfflineNamespace.initFs, function(error) {
	            console.log("No space received");
	        })
	    }, function(error) {
	        console.log("No space allowed");
	        console.log(error);
	    });
    }
    else {
    	console.log("No storage filesystem");
    	
    	localFileSystemInitializationComplete();
    	
    }
}

function offlineJobs() {
	
	var fieldWhereGet = "CATCHME_SETTINGS_" + getFromSessionStorage("patientID");
	var settingsString = getFromLocalStorage(fieldWhereGet);
	
	if (settingsString != "") {
		var settings = JSON.parse(settingsString);
		
		CatchMeNamespace.defineGame(settings);
		
		if (window.requestFileSystem) {
			websocket.send = manageWriteOffline;
			
			OfflineNamespace.initFolderForGame();
		}
		else {
			// funzione settaggio parametri
			// per salvataggio in localStorage
			websocket.send = manageWriteWithLocalStorage;
			
			offlineSavingWithLocalStorage();
		}
	}
	else {
		console.log("no configuration saved");
	}
}

function localFileSystemInitializationComplete() {
	
	if (getFromSessionStorage("permission") == "PATIENT") {
		
		if (getFromSessionStorage("patientID")) {
			patientID = getFromSessionStorage("patientID");
		}
		else {
			patientID = "1";
		}
		
		if (navigator.onLine) {
			
			try {
				$.ajax({
					url: SERVER_ADDRESS + '/server/GetGameSettingsCatchMe.php',
					data: {
						patientID : patientID,
						onlySettings: true
					},
					cache: false,
					type: 'POST',
					success: function(message) {
						
						var settings = JSON.parse(message);
						
						var fieldWhereSave = "CATCHME_SETTINGS_" + patientID;
						saveInLocalStorage(fieldWhereSave, message);
						
						CatchMeNamespace.defineGame(settings);
						
						if (window.requestFileSystem) {
							websocket.send = manageWriteOffline;
							
							OfflineNamespace.initFolderForGame();
						}
						else {
							// funzione settaggio parametri
							// per salvataggio in localStorage
							websocket.send = manageWriteWithLocalStorage;
							
							offlineSavingWithLocalStorage();
						}
					},
					error: function() {
						console.log("Error in retrieving settings");
						offlineJobs();
					}
					
				});
			}
			catch(e) {
				offlineJobs();
			}
		}
		else {
			offlineJobs();
		}
	}
    
}

function sendPacketsGameDefinitionOffline() {
	
	var firstPacket = {
        	"GAME": gameIdentification,
        	"PATIENT_ID": patientID
        };
        
        websocket.send(JSON.stringify(firstPacket));
        
        var secondPacket = {
    		TYPE: "READY_TO_PLAY", 
    		IMAGE_WIDTH: gameSettings.effectiveImageWidth,
    		IMAGE_HEIGHT: gameSettings.effectiveImageHeight,
    		SCREEN_WIDTH: getScreenWidth(),
    		SCREEN_HEIGHT: getScreenHeight()
    	};

        websocket.send(JSON.stringify(secondPacket));
}

function folderForOfflineSavingCreated() {

	console.log("FolderForOfflineSavingCreated");
    offlineObjectManager.folderWhereWrite.getFile('packets.txt', {create: true}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

            offlineObjectManager.fileWriterPackets = fileWriter;
            
            sendPacketsGameDefinitionOffline();
            
            gameManager.timeToStart = new Date().getTime() + 5000;
            CatchMeNamespace.startGame();

        }, function(error) {
            console.log("Error in creating writer for packets.txt");
            console.log(error);
        });
    }, function(error) {
    	console.log("Error in creating packets.txt");
    	console.log(error);
    })
}

// costruire cartella in localStorage con nome giusto
function offlineSavingWithLocalStorage() {
	
	folderNameLocalStorage = OfflineNamespace.createFolderForOfflineWithLocalStorage();
	
	sendPacketsGameDefinitionOffline();
	
	gameManager.timeToStart = new Date().getTime() + 5000;
	CatchMeNamespace.startGame();
}

function manageWriteOffline(data) {

	// if pacchetto.type == "STOP_GAME" finito gioco
	
	stringForOfflineFile = stringForOfflineFile + data + "\n";
	packetsIntoOfflineString++;
	
	if (packetsIntoOfflineString > 250) {
		var bb = new Blob([stringForOfflineFile], {type: 'text/plain'});
		
		packetsIntoOfflineString = 0;
		stringForOfflineFile = "";
		
		offlineObjectManager.fileWriterPackets.seek(offlineObjectManager.fileWriterPackets.length);
		
		offlineObjectManager.fileWriterPackets.write(bb);
	}
	
	if ((JSON.parse(data)).TYPE == "STOP_GAME") {
		
		var bb = new Blob([stringForOfflineFile], {type: 'text/plain'});

	    try {
	    	offlineObjectManager.fileWriterPackets.seek(offlineObjectManager.fileWriterPackets.length);
	    	offlineObjectManager.fileWriterPackets.write(bb);
	    }
	    catch(error) {
	    	offlineObjectManager.fileWriterPackets.seek(offlineObjectManager.fileWriterPackets.length);
	    	offlineObjectManager.fileWriterPackets.write(bb);
	    }
	}

}

function manageWriteWithLocalStorage(data) {

	stringForOfflineFile = stringForOfflineFile + data + "\n";
	packetsIntoOfflineString++;
	
	if (packetsIntoOfflineString > 250) {
		var stringAlreadyInserted = getFromLocalStorage(folderNameLocalStorage);
		
		saveInLocalStorage(folderNameLocalStorage, stringAlreadyInserted + stringForOfflineFile);
		
		packetsIntoOfflineString = 0;
		stringForOfflineFile = "";
	}
	
	if ((JSON.parse(data)).TYPE == "STOP_GAME") { 
		
		var stringAlreadyInserted = getFromLocalStorage(folderNameLocalStorage);
		
		saveInLocalStorage(folderNameLocalStorage, stringAlreadyInserted + stringForOfflineFile);
		
	}
}

function readFile() {

    offlineObjectManager.folderWhereWrite.getFile('packets.txt', {}, function(fileEntry) {

        fileEntry.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
                console.log(this.result);
            }

            reader.readAsText(file);
        })
    })
}
