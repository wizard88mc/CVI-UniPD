var audioNemoPresentation = null;
var audioSourceNemoArrived = ["../sounds/che_limpido", "../sounds/guardiamo_qui", "../sounds/sono_qua" ];
var audioSourceNemoMoving  = ["../sounds/ora_vado_questa_parte", "../sounds/seguimi_andiamo_questa_parte"];
var audioNemoArrived = new Array();
var audioNemoMoving = new Array();

var ImageForTraining = function(settings) {
	
	this.image = new Image();
	this.image.onload = function() {
		
		TrainingExamplesNamespace.imageLoaded();
	};
	this.image.src = '../images/nemo_training.png';
	this.element = null;
	this.width = settings.POINT_DIAMETER;
	this.height = 0;
	this.center = new Point(0, 0);
	this.drawPosition = new Point(0, 0);
	this.secondsForTransition = settings.TRANSITION_DURATION;
	this.pointDuration = settings.POINT_DURATION;
	this.pointsToDraw = new Array(4);
	this.pointsArrived = 0;
	this.currentPoint = 0;
	this.scale = "";
	this.rotate = "";
	this.distanceX = 0;
	this.distanceY = 0;
	this.fixedWaitingForFirstPoint = 2000;
	this.timeToStart = settings.START_TIME;
	
	this.prepareImage = function() {
		
		var nextPoint = this.pointsToDraw[this.currentPoint];
		
		//this.moveObject();
	};
	
	this.moveObject = function() {
		
		console.log("MOVING OBJECT");
		
		var pointCenter = this.pointsToDraw[this.currentPoint];
		
		if (pointCenter != null) {
			console.log("End point: " + pointCenter.top + ", " + pointCenter.left);
			
			this.calculateRotation(pointCenter);
			this.calculateScale(pointCenter);
			
			addTransformSpecifications(this.element, this.transformString());
			
			var transition = 'top ' + this.secondsForTransition / 1000 + 's, ' +
				'left ' + this.secondsForTransition / 1000 + 's';
			
			addTransitionSpecifications(this.element, transition);
			
			this.center = pointCenter;
			
			var drawLeft = this.center.left - this.width / 2;
			var drawTop = this.center.top - this.height / 2;
			this.element.css({
				'transition-timing-function': 'linear',
				'-webkit-transition-timing-function': 'linear',
				top: drawTop,
				left: drawLeft
			});
			
			/**
			 * Reproduces random audio while Nemo moving
			 */
			var randomPosition = Math.floor(Math.random() * (audioNemoMoving.length - 1));
			audioNemoMoving[randomPosition].get(0).play();
		}
	};
	
	this.transformString = function() {
		var string = "";
		if (this.scale != "") {
			string += this.scale;
		}
		if (this.rotate != "") {
			string += " " + this.rotate;
		}
	
		return string;
	};
	
	this.initializeImage = function() {
	
		if (this.element != null) {
			this.element.remove();
			this.scale = "";
			this.rotate = "";
		}
		
		console.log("Starting point: " + this.center.top + ", " + this.center.left);
		
		var paintTop = this.center.top - this.width / 2;
		var paintLeft = this.center.left - this.height / 2;
		
		this.element = $(this.image).attr('id', 'imageTraining' + this.currentPoint)
			.appendTo('body');
			
		addTransitionSpecifications(this.element, 'none');
		addTransformSpecifications(this.element, 'none');
			
		this.element.on('transitionend webkitTransitionEnd oTransitionEnd', this.imageArrived);
		
		this.element.css({
			opacity: '1',
			position: 'absolute',
			width: this.width + 'px',
			height: this.height + 'px',
			top: paintTop,
			left: paintLeft,
		});
	};
	
	this.calculateScale = function(newPoint) {
	
		if (Number(this.center.left) > Number(newPoint.left) || 
			(Number(this.center.left == Number(newPoint.left) && 
				Number(this.center.top) > Number(newPoint.top)) )) {
			/**
			 * Need to rotate image
			 */
			this.scale = "scale(-1, 1)";
		}
		else {
			this.scale = "scale(1, 1)";
		}
		console.log(this.scale);
	};
	
	/**
	 * Calculates the rotation angle necessary to make 
	 * a more real animation of the Nemo fish while
	 * performing training
	 */
	this.calculateRotation = function(destinationPoint) {
	
		var catetoAdiacente = Math.abs(destinationPoint.left - this.center.left);
		var catetoOpposto = Math.abs(destinationPoint.top - this.center.top);
		var ipotenusa = Math.sqrt(Math.pow(catetoAdiacente, 2) + Math.pow(catetoOpposto, 2));
		
		var cosAlpha = catetoAdiacente / ipotenusa;
		var alpha = Math.acos(cosAlpha) * 180 / Math.PI ;
		
		/**
		 * First quadrant
		 */
		if (destinationPoint.top < this.center.top && 
			destinationPoint.left > this.center.left) {
			
			console.log("Primo quadrante");
			alpha = -alpha;
		}
		/**
		 * Second quadrant 
		 */
		else if (destinationPoint.top > this.center.top && 
			destinationPoint.left > this.center.left) {
	
			console.log("Secondo quadrante");
			alpha = alpha;	
		}
		/**
		 * Third quadrant 
		 */
		else if (destinationPoint.top > this.center.top && 
			destinationPoint.left < this.center.left) {
		
			console.log("Terzo quadrante");
			/**
			 * In this case alpha remains the same
			 */
		}
		/**
		 * Fourth quadrant
		 */
		else if (destinationPoint.top < this.center.top && 
			destinationPoint.left < this.center.left) {
		
			console.log("Quarto quadrante");
			alpha = -alpha;
		}
		
		console.log("Angolo: " + alpha);
		this.rotate = 'rotate(' + alpha + 'deg)';
	};
	
	this.imageArrived = function() {
		
		if (event.propertyName === "left") {
			
			/**
			 * Removes the moving fish and instantiate 
			 * the image to get attention on the particular
			 * position for the training
			 */
			imageForTraining.element.css({opacity: '0'});
			
			var image = $('<img>').attr('id', 'imageGetAttention')
					.css({
						position: 'absolute',
						width: imageForTraining.width,
						height: imageForTraining.height,
						top: imageForTraining.center.top - imageForTraining.width / 2,
						left: imageForTraining.center.left - imageForTraining.height / 2
					}).appendTo('body');
				
			if (imageForTraining.center.left < $(window).width() / 2) {
				
				image.attr('src', '../images/nemo_left_nuovo.fw.png');
			}
			else {
				image.attr('src', '../images/nemo_right_nuovo.fw.png');
			}
	
			image.addClass('animated bounceIn');
			
			/**
			 * Reproduces a sound to get the attention of the child
			 */
			var randomPosition = Math.floor(Math.random() * (audioNemoArrived.length - 1));
			audioNemoArrived[randomPosition].get(0).play();
			
			/*
			 * Timeout to start moving from current point to the next one
			 */
			setTimeout(function() {
				
				imageForTraining.currentPoint++;
				/**
				 * If there is another training position reach it
				 */
				if (imageForTraining.currentPoint < imageForTraining.pointsToDraw.length) {
					
					$('#imageGetAttention').remove();
						
					imageForTraining.element.css({opacity: '1'});
					imageForTraining.moveObject();
				}
				else {
					console.log("Training terminated");
				}
					
			}, imageForTraining.pointDuration);
		}
	};
};

var imageForTraining = null;

var TrainingExamplesNamespace = {
	
	startTraining: function(settings) {
		
		$('body').css({
			height: getScreenHeight(),
			'background-color': '#000064',
			'background-image': 'url(../images/background-training2.jpg)',
			'background-size': '100% 100%',
			'background-position': 'top center',
			'background-repeat': 'no-repeat'
		});
		
		if ($('#imageGetAttention').length != 0) {
			$('#imageGetAttention').remove();
		}
		
		imageForTraining = new ImageForTraining(settings);
		
		/**
		 * Loading audio for when Nemo reaches a target point for the training
		 */
		if (audioNemoArrived.length == 0) {
			
			if ($('#divSounds #audioTraining').length == 0) {
				$('<div>').attr('id', 'audioTraining').appendTo('#divSounds');
			}
			/**
			 * Iterating over the string sources with the file names
			 */
			for (var x in audioSourceNemoArrived) {
				var audioToAdd = $('<audio>').appendTo('#audioTraining');
				addGeneralSound(audioToAdd, audioSourceNemoArrived[x]);
				
				audioNemoArrived.push(audioToAdd);
			}
		} 
		
		if (audioNemoMoving.length == 0) {
			
			if ($('#divSounds #audioTraining').length == 0) {
				$('<div>').attr('id', 'audioTraining').appendTo('#divSounds');
			}
			/**
			 * Iterating over the string sources with the file names
			 */
			for (var x in audioSourceNemoMoving) {
				var audioToAdd = $('<audio>').appendTo('#audioTraining');
				addGeneralSound(audioToAdd, audioSourceNemoMoving[x]);
				
				audioNemoMoving.push(audioToAdd);
			}
		}
	},
	
	/**
	 * Function performed when the image has been loaded. 
	 * Calculates the width and height for the image and 
	 * draws it in the center of the screen
	 * 
	 */
	imageLoaded: function() {
			
		var aspectRatio = imageForTraining.image.naturalWidth / 
			imageForTraining.image.naturalHeight;
		
		imageForTraining.height = aspectRatio * imageForTraining.width;
		
		var center = new Point(getScreenHeight() / 2, getScreenWidth() / 2);
		
		imageForTraining.center = center;
		
		imageForTraining.initializeImage();
		
	},

	messageManager: function(data) {
		
		/**
		 * This message contains the list of point to be shown
		 * for the training phase
		 */
		if (data.TYPE == "CAL_POINT") {
			
			/**
			 * POINTS[n] = n point
			 * POINTS[n] = "X;Y" coordinates of a point
			 */ 
			
			for (var i = 0; i < data.POINTS.length; i++)
			{
				
				var elements = data.POINTS[i].split(";");
				var centerToDraw = new Point(Number(elements[1].replace(",", ".")), 
						Number(elements[0].replace(",", ".")));
				
				imageForTraining.pointsToDraw[i] = centerToDraw;
			}
			
			soundNemoPresentation = $('<audio>').attr('id', 'audioNemoPresentation').appendTo('#audioTraining');
			addGeneralSound(soundNemoPresentation, '../sounds/nemoPresentazione');
			
			soundNemoPresentation.on('ended', function() {
				
				var packetToSend = {
						TYPE: 'START_TRAINING'
				};
				websocket.send(JSON.stringify(packetToSend));
				
			});
			
			soundNemoPresentation.get(0).play();
		}
		else if (data.TYPE == "START_TRAINING") 
		{
			console.log("MESSAGE START TRAINING");
			var timeToStart = data.START_TIME;
			
			console.log(timeToStart - (new Date().getTime()));
			
			setTimeout(function() {
				
				imageForTraining.moveObject();
				
			}, timeToStart - (new Date().getTime()));
			
		}
	}
};

var TrainingManager = {
	
	screenWidth: 0,
	
	dialogSelectParameters: function() {
		
		var selectNumberPoints = $('<select>').attr('id', 'selectNumberOfPoints');
		$('<option>').attr('value', '7').attr('selected', 'selected').text('7 punti').appendTo(selectNumberPoints);
		$('<option>').attr('value', '9').text('9 punti').appendTo(selectNumberPoints);
		$('<option>').attr('value', '12').text('12 punti').appendTo(selectNumberPoints);
		$('<option>').attr('value', '15').text('15 punti').appendTo(selectNumberPoints);
		
		var selectTimePerPoint = $('<select>').attr('id', 'selectTimePerPoint');
		$('<option>').attr('value', '2000').attr('selected', 'selected').text('2 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '5000').text('5 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '10000').text('10 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '15000').text('15 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '20000').text('20 secondi').appendTo(selectTimePerPoint);
		
		var selectTimeTransition = $('<select>').attr('id', 'selectTimeTransition');
		$('<option>').attr('value', '1000').attr('selected', 'selected').text('1 secondo').appendTo(selectTimeTransition);
		$('<option>').attr('value', '2000').text('2 secondi').appendTo(selectTimeTransition);
		$('<option>').attr('value', '3000').text('3 secondi').appendTo(selectTimeTransition);
		$('<option>').attr('value', '5000').text('5 secondi').appendTo(selectTimeTransition);
		
		var sliderSize = $('<input>').attr('id', 'sliderSize').attr('type', 'slider')
			.attr('name', 'sliderSize').attr('value', '10');
		
		var tableForm = $('<table>');
		$('<tbody>').appendTo(tableForm);
		
		var row = $('<tr>').appendTo(tableForm);
		$('<td>').text('Numero di punti per il training: ').appendTo(row);
		$(selectNumberPoints).appendTo($('<td>').appendTo(row));
				
		row = $('<tr>').appendTo(tableForm);
		$('<td>').text('Tempo per ogni punto: ').appendTo(row);
		$(selectTimePerPoint).appendTo($('<td>').appendTo(row));
		
		row = $('<tr>').appendTo(tableForm);
		$('<td>').text('Tempo di transizione tra punti: ').appendTo(row);
		$(selectTimeTransition).appendTo($('<td>').appendTo(row));
		
		row = $('<tr>').appendTo(tableForm);
		$('<td>').text('Dimensione immagine (%): ').css('padding-top', '0.5em').appendTo(row);
		$(sliderSize).appendTo($('<td>').css('padding-right', '0em').appendTo(row));
		sliderSize.slider({
			from: 10, to: 30, step: 1, format: {format: '#'}
		});
		
		var divContainer = $('<div>');
		$('<h2>').text('Impostazioni per il training').appendTo(divContainer);
		$('<p>').text("E' necessario effettuare il training del sistema di eye tracking per continuare. Settare le impostazioni e cliccare su \"Inizia\".")
			.appendTo(divContainer);
		
		tableForm.appendTo(divContainer);
		
		divContainer.appendTo($('<div>').attr('id', 'dialogSettingsTraining').attr('title', 'Impostazioni')
			.appendTo('#divMainContent'));
		
		$('#dialogSettingsTraining').dialog({
				modal: true,
				resizable: false,
				draggable: false,
				closeOnEscape: false,
				//width: getScreenWidth() * 0.6,
				width: 'auto',
				buttons: {
					"Inizia": function() {
						
						var numberOfPoints = $('select#selectNumberOfPoints').val();
						var totalSeconds = $('select#selectTimePerPoint').val();
						var secondsTransition = $('select#selectTimeTransition').val();
						var imagePerc = $('#sliderSize').val();
						
						var packetWithSettings = {
							TYPE: 'TRAINING_SETTINGS', 
							POINTS: parseInt(numberOfPoints),
							POINT_DURATION: parseInt(totalSeconds),
							TRANSITION_DURATION: parseInt(secondsTransition),
							POINT_DIAMETER: parseInt(imagePerc * TrainingManager.screenWidth / 100)
						};
						
						websocket.send(JSON.stringify(packetWithSettings));
						
						$(this).dialog("close");
						$(this).remove();
						
						var dialog = $('<div>').attr('id', 'dialogWaitingCompleteTraining')
							.attr('title', 'Attendere ...').appendTo('#divMainContent');
							
						$('<p>').text('Training in corso. Attendere ....').appendTo(dialog);
								
						dialog.dialog({
							modal: true,
							resizable: false,
							draggable: false,
							closeOnEscape: false
						});
					}
				}
			});
	}, 
	
	trainingResult: function(message) {
		
		$('#dialogWaitingCompleteTraining').dialog('close');
		$('#dialogWaitingCompleteTraining').remove();
		
		var valueCalibration = message.STARS;
		var starsContainer = $('<p>');
		
		for (var i = 0; i < valueCalibration; i++) {
			$('<img>').attr('src', '../images/star.png').appendTo(starsContainer);
		}
		
		for (var i = valueCalibration; i < 5; i++) {
			$('<img>').attr('src', '../images/star.png').css('opacity', '0.5')
				.appendTo(starsContainer);
		}
		
		starsContainer.children('img').css({
			width: '15%',
			display: 'inline',
			'margin-left': '3%'
		});
		
		var dialog = $('<div>').attr('id', 'divDialogTrainingEvaluation')
		.attr('title', 'Risultato').appendTo('#divMainContent');
	
		$('<p>').text('Valutazione training: ').appendTo(dialog);
		starsContainer.appendTo(dialog);
		
		var finalResult = $('<p>').text('Risultato: ' + message.RESULT);
		var meanError = $('<p>').text('Errore medio: ' + message.AVERAGE_ERROR);
		var meanErrorRight = null; var meanErrorLeft = null
		
		if (message.RESULT) 
		{
			meanErrorRight = $('<p>').text('Errore medio occhio destro: ' + message.AVERAGE_ERROR_RIGHT);
			meanErrorLeft = $('<p>').text('Errore medio occhio sinistro: ' + message.AVERAGE_ERROR_LEFT);
		}
		
		finalResult.appendTo(dialog);
		meanError.appendTo(dialog);
		if (meanErrorRight != null && meanErrorLeft != null)
		{
			meanErrorRight.appendTo(dialog);
			meanErrorLeft.appendTo(dialog);
		}
		//starsContainer.appendTo(dialog);
		dialog.dialog({
				modal: true,
				closeOnEscape: false,
				resizable: false,
				draggable: false,
				width: 'auto',
				buttons: {
					"Inizia": function() {
						$(this).dialog("close");
						$(this).remove();
						
						var packetForValidation = {
							TYPE: 'TRAINING_VALIDATION',
							DATA: true
						};
						
						websocket.send(JSON.stringify(packetForValidation));
						
						TrainingManager.trainingComplete();
					}, 
					"Ripeti": function() {
						$(this).dialog("close");
						$(this).remove();
						
						var packetRetry = {
							TYPE: 'TRAINING_VALIDATION',
							DATA: false
						};
						
						websocket.send(JSON.stringify(packetRetry));
						
						TrainingManager.dialogSelectParameters();
					}
				}
			});
	},
	
	trainingComplete: function() {}

};