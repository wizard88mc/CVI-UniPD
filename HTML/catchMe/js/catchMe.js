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
var machineID = -1;

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
				
			CatchMeNamespace.defineGame(data);
		}
		else if (data.TYPE == 'GO_BACK') {
			websocket.close();
			
			location.replace('../patient/index.html');
		}
		else {
			console.log("Bad packet received");
			console.log(message);
		}
	};
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
	
	if (customSpeedFromDoctor != -1) {
		levelsToPerform[gameManager.levelIterator].speed = customSpeedFromDoctor;
	}
	return Math.round(this.distance / (levelsToPerform[gameManager.levelIterator].speed * 5));
};
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
	this.percentualImageWidth = 0; // percentual of the image width, used for CSS
	this.effectiveImageWidth = 0; // image width in pixels, useful for calculations
	this.effectiveImageHeight = 0; // image height in pixels, used for calculation	
	this.imageID = -1;
	this.repetitionsOfMovements = 1;
	this.iteratorAnimations = -1;
	this.animations = new Array();
	
this.getBackgroundRGB = function() {
	return new Array(hexToR(this.backgroundColor),
					hexToG(this.backgroundColor),
					hexToB(this.backgroundColor));
};

this.getForegroundRGB = function() {
	return new Array(hexToR(this.foregroundColor),
					hexToG(this.foregroundColor),
					hexToB(this.foregroundColor));
};
	
};
//var gameSettings = null;

var levelsToPerform = new Object();
var customSpeedFromDoctor = -1;
var availableImages = new Array();
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
			this.actual.top == this.finalPoint.top);
};
}
var canvasSettings = null;
var listCanvasSettings = new Array();

function GameManager() {
	this.gameInAction = true;
	this.sensibility = 1000 / 25;
	this.timing;
	this.timeToStart = null;
	this.lastMessageSent = 0;
	//this.sequenceOfAnimations = [];
	//this.animationsIterator = 0;
	this.levelIterator = 0;
	this.currentRepetitionAnimation = 0;
	this.currentAnimation = null;
	this.lastTimePlayedGoodSound = 0;
}
var gameManager = null;

var CatchMeNamespace = {

defineGame: function(settings) {
	
	gameManager = new GameManager();
	canvasSettings = new CanvasSettings();
	availableImages = settings.IMAGES_SPECS;
	
	var levels = settings.EXERCISES;
	
	
	for (var index in levels) {
		
		if (levels[index] != null)
		{
			levelsToPerform[index] = new GameSettings();
			
			levelsToPerform[index].upMovement = levels[index].upMovement 
				|| levels[index].UP_MOV;
			levelsToPerform[index].downMovement = levels[index].downMovement 
				|| levels[index].DOWN_MOV;
			levelsToPerform[index].rightMovement = levels[index].rightMovement 
					|| levels[index].RIGHT_MOV;
			levelsToPerform[index].leftMovement = levels[index].leftMovement 
					|| levels[index].LEFT_MOV;
			levelsToPerform[index].startFromCenter = Boolean(levels[index].startFromCenter 
					|| levels[index].START_CENTER);
			levelsToPerform[index].mixMovements = Boolean(levels[index].mixMovements 
					|| levels[index].MIX_MOVEMENTS);
			levelsToPerform[index].backgroundColor = levels[index].backgroundColor 
					|| levels[index].BACK_COLOR;
			levelsToPerform[index].foregroundColor = levels[index].foregroundColor 
					|| levels[index].IMG_COLOR;
			levelsToPerform[index].speed = Number(levels[index].speed 
					|| levels[index].SPEED);
			levelsToPerform[index].changeImageColor = Boolean(levels[index].changeImageColor
					|| levels[index].CHANGE_IMG_COLOR);
			levelsToPerform[index].percentualImageWidth = Number(levels[index].percentualImageWidth 
					|| levels[index].IMG_WIDTH);
			levelsToPerform[index].imageID = Number(levels[index].imageID 
					|| levels[index].IMG_ID);
			levelsToPerform[index].repetitionsOfMovements = Number(levels[index].numberOfRepetitions 
					|| levels[index].NUM_REPETITIONS);
			
			var imageID = levelsToPerform[index].imageID;
			
			listCanvasSettings[index] = new CanvasSettings();
			
			var dimensions = (availableImages[imageID].IMG_SIZE).split("x");
			listCanvasSettings[index].width = Number(dimensions[0]);
			listCanvasSettings[index].height = Number(dimensions[1]);
			listCanvasSettings[index].fileName = availableImages[imageID].IMG_FILE;
			
			var divSounds = $('<div>').attr('id', 'divSounds').appendTo('body');
			
			var arraySounds = ['bene', 'molto_bene', 'continua_cosi'];
			
			for (var soundIndex in arraySounds) {
				
				addSoundSource($('<audio>').addClass('soundGreetings').appendTo(divSounds), arraySounds[soundIndex]);
			}
		}
	}
	CatchMeNamespace.buildAnimations();
},

createTransitionCSS: function(time, endPosition) {
	
	var stringTransition = 'left ' + time + 's linear, top ' + time + 's linear'; 
	
	addTransitionSpecifications($('#image'), stringTransition);
	
	$('#image').css({
		left: endPosition.left + 'px',
		top: endPosition.top + 'px'
	});
},

timingFunction: function() {
	
	var timeNow = new Date().getTime();
	var position = $('#image').position();
	listCanvasSettings[gameManager.levelIterator].actual = new Point(Math.round(position.top), Math.round(position.left));
		
	var packet = {
		TYPE: "GAME_DATA",
		SUBTYPE: "POSITIONS",
		TIME: timeNow - gameManager.timeToStart,
		IMAGE: [listCanvasSettings[gameManager.levelIterator].actual.left, listCanvasSettings[gameManager.levelIterator].actual.top],
		TOUCH: [touchManager.posX, touchManager.posY],
		MOVEMENT: gameManager.currentAnimation.movement
	};
	
	resetTouch();
	
	websocket.send(JSON.stringify(packet));

	gameManager.lastMessageSent = timeNow - gameManager.timeToStart;
		
	if (listCanvasSettings[gameManager.levelIterator].isArrivedToDestination()) {
		
		if (gameManager.currentAnimation.finalAnimation == true) {
			/**
			 * Called when the animation is completed and the object reaches
			 * the final destination
			 */
			CatchMeNamespace.animationEndMovement();
		}
		else {
			CatchMeNamespace.defineAnimationFunction(false, 0);
		}
	}

	if (!gameManager.gameInAction) {
		
		websocket.close();
		websocket = null;
		
		CatchMeNamespace.createTransitionCSS(0, listCanvasSettings[gameManager.levelIterator].actual);
		clearInterval(gameManager.timing);
		CatchMeNamespace.animationEndGame(); 
	}
	if ((timeNow - timeCloseIconShowed) > 5000) {
		
		$('#divCloseGame img').css('visibility', 'hidden');
		$('#divCloseGame img').unbind('click');
	}
},

sendPacketImageScreenInfo: function() {
	
	var packetToSend = {
			'TYPE': 'READY_TO_PLAY', 
			'MACHINE_ID': machineID,
			'IMAGE_WIDTH': levelsToPerform[gameManager.levelIterator].effectiveImageWidth,
			'IMAGE_HEIGHT': levelsToPerform[gameManager.levelIterator].effectiveImageHeight,
			'SCREEN_WIDTH': getScreenWidth(),
			'SCREEN_HEIGHT': getScreenHeight()
		};
		
		websocket.send(JSON.stringify(packetToSend));
},

putInWaiting: function() {
	
	$('#divMainContent').remove();
	
	machineID = checkAlreadySync();
	
	websocket.onmessage = CatchMeNamespace.waitingToStart;
	
	CatchMeNamespace.sendPacketImageScreenInfo();
},

trainingComplete: function() {
	
	websocket.onmessage = CatchMeNamespace.waitingToStart;
},

waitingToStart: function(message) {
	
	var packet = JSON.parse(message.data || message);

	if (packet.TYPE == "START_WORKING") {
		
		gameManager.timeToStart = packet.START_TIME;
		
		$('#imageGetAttention').remove();
		
		websocket.onmessage = function(message) { 
			try {
				var packet = JSON.parse(message.data);
				/**
				 * Message with information about the new speed
				 * of the image
				 */
				if (packet.TYPE == "CHANGE_SPEED") {
					customSpeedFromDoctor = packet.NEW_SPEED;	
				}
				/**
				 * The doctor requires to stop the game
				 */
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
		/**
		 * Time to start the game
		 */
		CatchMeNamespace.startGame();
	}
	else if (packet.TYPE == "TRAINING_SETTINGS") {
		
		TrainingExamplesNamespace.startTraining(packet);
	}
	else if (packet.TYPE == "CAL_POINT" || packet.TYPE == "START_TRAINING") {
		
		TrainingExamplesNamespace.messageManager(packet);
	}
	else if (packet.TYPE == "GO_BACK")
	{
		websocket.close();
		location.replace("../patient/index.html");
	}
	else {
		console.log("Bad message received during game");
		console.log(packet);
	}
},

drawCanvas: function(drawCanvas) {
	
	if (drawCanvas) {
		
		var canvas = $('<canvas>').attr('id', 'image')
			.appendTo('body').css('z-index', '10');
	
		canvas[0].width = listCanvasSettings[gameManager.levelIterator].width;
		canvas[0].height = listCanvasSettings[gameManager.levelIterator].height;
		var context = canvas[0].getContext('2d');
		var image = new Image();
		image.src = 'images/' + listCanvasSettings[gameManager.levelIterator].fileName;
		$(image).load(function() {
			context.drawImage(image, 0, 0, 
					listCanvasSettings[gameManager.levelIterator].width, 
					listCanvasSettings[gameManager.levelIterator].height);
		});
		
		
		canvas.css('width', levelsToPerform[gameManager.levelIterator].percentualImageWidth + '%');
		canvas.css('position', 'absolute');
		
		levelsToPerform[gameManager.levelIterator].effectiveImageWidth = canvas.width();
		levelsToPerform[gameManager.levelIterator].effectiveImageHeight = canvas.height();
		
		if (levelsToPerform[gameManager.levelIterator].changeImageColor) {
			
			var arrayForeground = levelsToPerform[gameManager.levelIterator].getForegroundRGB();
			setSpecificColor('image', arrayForeground[0],
							arrayForeground[1], arrayForeground[2]);
		}
	}
	else {
		for (var i = 0; i < Object.keys(levelsToPerform).length; i++) {
			
			var ratioDimensions = listCanvasSettings[i].width / listCanvasSettings[i].height;
			
			levelsToPerform[i].effectiveImageWidth = Math.round(getScreenWidth() * levelsToPerform[i].percentualImageWidth / 100);
			levelsToPerform[i].effectiveImageHeight = Math.round(levelsToPerform[i].effectiveImageWidth / ratioDimensions);
			
		}
	}
},

buildAnimations: function() {
	
	$('body').css({
		margin: '0em',
		padding: '0em'
	});
	CatchMeNamespace.drawCanvas(false);
	
	/**
	 * Defining standard points
	 */
	
	for (var i = 0; i < Object.keys(levelsToPerform).length; i++) {
		
		centerImage.top = Math.floor(getScreenHeight() / 2 - (levelsToPerform[i].effectiveImageHeight / 2));
		centerImage.left = Math.floor(getScreenWidth() / 2 - (levelsToPerform[i].effectiveImageWidth / 2));
		
		topCenterScreen.top = 0;
		topCenterScreen.left = centerImage.left;
		bottomCenterScreen.top = getScreenHeight() - levelsToPerform[i].effectiveImageHeight;
		bottomCenterScreen.left = centerImage.left;
		leftMiddleScreen.top = centerImage.top;
		leftMiddleScreen.left = 0;
		rightMiddleScreen.left = getScreenWidth() - levelsToPerform[i].effectiveImageWidth;
		rightMiddleScreen.top = centerImage.top; 
		
		levelsToPerform[i].animations = CatchMeNamespace.defineSingleAnimation(levelsToPerform[i]);
	}
	/**
	 * All animations defined, the game is ready to start
	 * Put it in waiting for the beginning of the game
	 */
	CatchMeNamespace.putInWaiting();
},

startGame: function() {
	
	var packetSpeed = {
			'TYPE': 'SPEED_VALUE', 
			'SPEED': levelsToPerform[0].speed
		};
	websocket.send(JSON.stringify(packetSpeed));
	
	$('body').css({
		background: 'none',
		width: getScreenWidth(),
		height: getScreenHeight()
	});
	
	$('#imageTraining').remove();
	
	/**
	 * Events necessary to manage touch
	 */
	$('body').on('touchstart touchmove', function(e) {
		e.preventDefault();
	});
	$('body').on('mousedown touchstart', touchTouch)
			.on('mousemove touchmove', touchMove)
			.on('mouseup touchend', touchUp);
	
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
	
	var audioExplanation = $('<audio>').attr('id', 'audioIntroduction').appendTo('#divSounds');
	addGeneralSound(audioExplanation, '../sounds/paperino.mp3');
	
	audioExplanation.get(0).play();
	
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
	
	//gameManager.currentRepetitionAnimation++;
	levelsToPerform[gameManager.levelIterator].iteratorAnimations++;
	//if (gameManager.currentRepetitionAnimation > levelsToPerform[gameManager.levelIterator].repetitionsOfMovements) {
		//levelsToPerform[gameManager.levelIterator].iteratorAnimation++;
		//gameManager.currentRepetitionAnimation = 1;
	//}
	if (levelsToPerform[gameManager.levelIterator].iteratorAnimations >= 
		levelsToPerform[gameManager.levelIterator].animations.length) {
		gameManager.levelIterator++;
		
		if (gameManager.levelIterator < Object.keys(levelsToPerform).length) {
			levelsToPerform[gameManager.levelIterator].iteratorAnimations = 0;
			CatchMeNamespace.sendPacketImageScreenInfo();
		}
	}
	
	if (gameManager.levelIterator < Object.keys(levelsToPerform).length) {
		
		CatchMeNamespace.drawCanvas(true);
		
		var currentLevel = levelsToPerform[gameManager.levelIterator];
		
		$('body').css({
			'background-color': currentLevel.backgroundColor
		});
		$('#divCloseGame').css('background-color', currentLevel.backgroundColor);
		
		var animationToPerform = currentLevel.animations[currentLevel.iteratorAnimations];
		gameManager.currentAnimation = animationToPerform;
		var startPoint = animationToPerform.startPoint;
		var endPoint = animationToPerform.endPoint;
		
		listCanvasSettings[gameManager.levelIterator].finalPoint = new Point(endPoint.top, endPoint.left);
		
		$('#image').css({
			left: startPoint.left,
			top: startPoint.top
		});
		
		$('#image').on('mousemove touchmove touchstart mousedown', function(e) {
	
			e.preventDefault();
			var time = new Date().getTime();
			if (time - gameManager.lastTimePlayedGoodSound > 5000) {
				
				var number = $('#divSounds audio.soundGreetings').length;
				
				var index = Math.floor(Math.random() * number);
				$('#divSounds audio.soundGreetings').get(index).play();
				
				gameManager.lastTimePlayedGoodSound = time;
			}
		});
	
		var timeForAnimation = animationToPerform.calculateAnimationTime();
		
		setTimeout(function() {
			
			CatchMeNamespace.createTransitionCSS(timeForAnimation, listCanvasSettings[gameManager.levelIterator].finalPoint);
			
			if (firstTime) {
				gameManager.timing = setInterval(CatchMeNamespace.timingFunction, gameManager.sensibility);	
			}
			
		}, timeToWait);
	}
},

defineSingleAnimation: function(levelSettings) {
	
	var animations = [];
	var startPoint = null, endPoint = null;
							
	if (levelSettings.startFromCenter) {
		startPoint = new Point(centerImage.top, centerImage.left);
	}
	if (levelSettings.upMovement) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
			}
			
			endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'T'));
			/**
			 * As requested, pushing two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'T'));
		}
	}
	if (levelSettings.downMovement) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(topCenterScreen.top, topCenterScreen.left);
			}
			
			endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'B'));
			/**
			 * As requested, pushing two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'B'));
		}
	}
	if (levelSettings.leftMovement /*&& !gameSettings.rightMovement && 
		!gameSettings.upMovement && !gameSettings.downMovement*/) {
			
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			}
			
			endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'L'));
			/**
			 * Pushing two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'L'));
		}
	}
	if (levelSettings.rightMovement /*&& !gameSettings.leftMovement && 
		!gameSettings.upMovement && !gameSettings.downMovement*/) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);	
			}
	
			endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
			animations.push(new Animation(startPoint, endPoint, true, 'R'));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'R'));
		}
	}
	
	if (levelSettings.upMovement && levelSettings.downMovement && levelSettings.mixMovements
		/* && !gameSettings.leftMovement && !gameSettings.rightMovement*/) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			var movement = '';
			if (Math.random() > 0.5) {
				// movimento da alto verso basso
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(topCenterScreen.top, topCenterScreen.left);
				}
				endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				movement = 'B';
			}
			else {
				// movimento da basso verso alto
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				}
				endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
				movement = 'T';
			}
			animations.push(new Animation(startPoint, endPoint, true, movement));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, movement));
		}
	}
	if (levelSettings.upMovement && levelSettings.leftMovement && levelSettings.mixMovements  
		/* && !gameSettings.downMovement && !gameSettings.rightMovement*/) {
	
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) { 
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
			}
			endPoint = new Point(topCenterScreen.top, 
						topCenterScreen.left - Math.floor(Math.random() * topCenterScreen.left));
	
			
			animations.push(new Animation(startPoint, endPoint, true, 'TL'));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'TL'));
		}
	}
	if (levelSettings.upMovement && levelSettings.rightMovement && levelSettings.mixMovements 
		/*&& !gameSettings.downMovement && !gameSettings.leftMovement */) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left - Math.floor(Math.random() * bottomCenterScreen.left));
			}
			endPoint = new Point(topCenterScreen.top,
						topCenterScreen.left + Math.floor(Math.random() * topCenterScreen.left));
			
			animations.push(new Animation(startPoint, endPoint, true, 'TR'));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'TR'));
		}
	}
	if (levelSettings.downMovement && levelSettings.leftMovement && levelSettings.mixMovements
		/*&& !gameSettings.upMovement && !gameSettings.rightMovement*/) {
	
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(topCenterScreen.top,
							topCenterScreen.left + Math.floor(Math.random() * topCenterScreen.left));
			}
			endPoint = new Point(bottomCenterScreen.top,
						bottomCenterScreen.left - Math.floor(Math.random() * bottomCenterScreen.left));
			
			animations.push(new Animation(startPoint, endPoint, true, 'BL'));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'BL'));
		}
	}
	if (levelSettings.downMovement && levelSettings.rightMovement && levelSettings.mixMovements
		/*&& !gameSettings.upMovement && !gameSettings.leftMovement*/) {
			
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (!levelSettings.startFromCenter) {
				startPoint = new Point(topCenterScreen.top,
							topCenterScreen.left - Math.floor(Math.random() * topCenterScreen.left));
			}
			endPoint = new Point(bottomCenterScreen.top,
						bottomCenterScreen.left + Math.floor(Math.random() * bottomCenterScreen.left));
			
			animations.push(new Animation(startPoint, endPoint, true, 'BR'));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, 'BR'));
		}
	}
	if (levelSettings.leftMovement && levelSettings.rightMovement && levelSettings.mixMovements 
		/*&& !gameSettings.upMovement && !gameSettings.downMovement*/) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			var randomValue = Math.random();
			if (!levelSettings.startFromCenter) {
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
				movement = 'L';
			}
			else {
				endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
				movement = 'R';
			}
			animations.push(new Animation(startPoint, endPoint, true, movement));
			/**
			 * Adding two times the same animation
			 */
			animations.push(new Animation(startPoint, endPoint, true, movement));
		}
	}
	if (levelSettings.upMovement && levelSettings.downMovement && 
			levelSettings.leftMovement && levelSettings.mixMovements /*&& !gameSettings.rightMovement*/) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (Math.random() > 0.5) {
				// primo movimento verso l'alto
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(rightMiddleScreen.left,
								rightMiddleScreen.top + Math.floor(Math.random() * rightMiddleScreen.top));
					
					endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
					
				}
				else {
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, false, 'TL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * leftMiddleScreen.top),
								leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
			}
			else {
				// primo movimento verso il basso 
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(rightMiddleScreen.left,
								rightMiddleScreen.top - Math.floor(Math.random() * rightMiddleScreen.top));
					
					endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				}
				else {
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * leftMiddleScreen.top),
								leftMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
			}
		}
	}
	
	if (levelSettings.upMovement && levelSettings.downMovement && 
			levelSettings.rightMovement && levelSettings.mixMovements /**&& !gameSettings.leftMovement*/) {
			
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (Math.random() > 0.5) {
				// primo movimento verso l'alto
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(leftMiddleScreen.left,
								leftMiddleScreen.top + Math.floor(Math.random() * leftMiddleScreen.top));
					
					endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
					
				}
				else {
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, false, 'TR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * rightMiddleScreen.top),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
			}
			else {
				// primo movimento verso il basso 
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(leftMiddleScreen.left,
								leftMiddleScreen.top - Math.floor(Math.random() * leftMiddleScreen.top));
					
					endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
				}
				else {
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
				}
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, false, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * rightMiddleScreen.top),
							rightMiddleScreen.left);
				
				animations.push(new Animation(startPoint, endPoint, true, 'TR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'TR'));
			}
		}
	}

	if (levelSettings.downMovement && levelSettings.leftMovement && 
			levelSettings.rightMovement && levelSettings.mixMovements /*&& !gameSettings.upMovement*/) {
			
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			if (Math.random() > 0.5) {
				/**
				 * First movement to left
				 */
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(topCenterScreen.top,
								topCenterScreen.left + Math.floor(Math.random() * topCenterScreen.left));
					endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
				}
				else {
					endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * (leftMiddleScreen.top / 2)));
				}
				
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, false, 'BL'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left + Math.floor(Math.random() * bottomCenterScreen.left));
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				
			}
			else {
				/**
				 * First movement to right
				 */
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * topCenterScreen.left));
					endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
				}
				else {
					endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)));	
				}
				
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'BR'));
				
				startPoint = new Point(endPoint.top, endPoint.left);
				endPoint = new Point(bottomCenterScreen.top,
							bottomCenterScreen.left - Math.floor(Math.random() * bottomCenterScreen.left));
				
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
				/**
				 * Adding two times the same animation
				 */
				animations.push(new Animation(startPoint, endPoint, true, 'BL'));
			}
		}
	}
	if (levelSettings.upMovement && levelSettings.downMovement &&
			levelSettings.leftMovement && levelSettings.rightMovement && levelSettings.mixMovements) {
		
		for (var i = 0; i < levelSettings.repetitionsOfMovements; i++) {
			var firstPoint = Math.random();
			var direction = Math.random();
			
			if (firsPoint < 0.25) {
				/**
				 * Starting point at the top of the screen
				 */
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(topCenterScreen.top, topCenterScreen.left);	
				}
				if (direction < 0.5) {
					/**
					 * First movement to right
					 */
					endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
								rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
								leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(topCenterScreen.top, topCenterScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'TR'));
					
				}
				else {
					/**
					 * First movement to the left
					 */
					endPoint = new Point(leftMiddleScreen.top,
								leftMiddleScreen.left + Math.floor(Math.random() * (leftMiddleScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
								rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(topCenterScreen.top, endPoint.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'TL'));
				}
			}
			else if (firstPoint >= 0.25 && firsPoint < 0.5) {
				
				/**
				 * Starting point on the right of the screen
				 */
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
				}
				if (direction < 0.5) {
					/*
					 * To the bottom of the screen
					 */
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
								leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(topCenterScreen.top, 
								topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'BR'));
					
				}
				else {
					/**
					 * First movement to the top of the screen
					 */
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
								leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(rightMiddleScreen.top, rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'TR'));
				}
			}
			else if (firstPoint >= 0.5 && firstPoint < 0.75) {
				// punto di partenza in basso
				
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);	
				}
				if (direction < 0.5) {
					// primo spostamento verso destra
					
					endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
								rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(leftMiddleScreen.top + Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
								leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'BR'));
					
				}
				else {
					/**
					 * First movement to the left
					 */
					endPoint = new Point(leftMiddleScreen.top - Math.floor(Math.random() * (leftMiddleScreen.top / 2)),
								leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
								rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(bottomCenterScreen.top, bottomCenterScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'BL'));
				}	
			}
			else if (firstPoint >= 0.75) {
				/**
				 * Starting point on the left of the screen
				 */
				if (!levelSettings.startFromCenter) {
					startPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
				}
				if (direction < 0.5) {
					/**
					 * First movement to the bottom of the screen
					 */
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left + Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(rightMiddleScreen.top - Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
								rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left - Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'BL'));
					
				}
				else {
					/**
					 * First movement to the top
					 */
					endPoint = new Point(topCenterScreen.top,
								topCenterScreen.left + Math.floor(Math.random() * (topCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'TR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(rightMiddleScreen.top + Math.floor(Math.random() * (rightMiddleScreen.top / 2)),
								rightMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BR'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(bottomCenterScreen.top,
								bottomCenterScreen.left - Math.floor(Math.random() * (bottomCenterScreen.left / 2)));
					
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, false, 'BL'));
					
					startPoint = new Point(endPoint.top, endPoint.left);
					endPoint = new Point(leftMiddleScreen.top, leftMiddleScreen.left);
					
					animations.push(new Animation(startPoint, endPoint, true, 'TL'));
					/**
					 * Adding two times the same animation
					 */
					animations.push(new Animation(startPoint, endPoint, true, 'TL'));
				}
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
	CatchMeNamespace.defineAnimationFunction(false, 4000);
},

/**
 * creates the animation to perform at the end of the game
 */
animationEndGame: function() {
	
	console.log("Animazione fine gioco + ritorno stato iniziale");
	
	setTimeout(location.replace('../patient/index.html'), 2000);
}};

$('document').ready(function(e) {
	
	var appCache = window.applicationCache;
	
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
	}
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
	        });
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
        
        CatchMeNamespace.sendPacketImageScreenInfo();
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
    });
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
            };

            reader.readAsText(file);
        });
    });
}
