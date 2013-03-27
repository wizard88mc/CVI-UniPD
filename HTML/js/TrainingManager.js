var ImageForTraining = function(secondsForTransition) {
	
	this.image = new Image();
	this.image.onload = function() {
		
		TrainingExamplesNamespace.imageLoaded();
	}
	this.image.src = '../images/space_shuttle2.png';
	this.element = null;
	this.width = 0;
	this.height = 0;
	this.center = new Point(0, 0);
	this.drawPosition = new Point(0, 0);
	this.secondsForTransition = secondsForTransition;
	
	this.moveObject = function(pointCenter) {
		this.center = pointCenter;
		
		this.drawPosition.top = this.center.top - 
			this.height / 2;
		
		this.drawPosition.left = this.center.left - 
			this.width / 2;
	}
	
	this.drawObject = function() {
		this.element.css({
			left: this.drawPosition.left,
			top: this.drawPosition.top,
			opacity: '1'
		});
		
	}
	
}

var imageForTraining = null;

var TrainingExamplesNamespace = {
	
	startTraining: function(millisecondsTransition) {
		
		console.log('Starting training');
		
		$('body').css({
			height: getScreenHeight(),
			'background-color': '#000064',
			'background-image': 'url(../images/background_training.png)',
			'background-size': '100% auto',
			'background-position': 'left bottom',
			'background-repeat': 'no-repeat'
		});
		
		imageForTraining = new ImageForTraining(millisecondsTransition / 1000);
	},
	
	imageLoaded: function() {
		
		imageForTraining.element = $(imageForTraining.image)
			.attr('id', 'imageTraining')
			.appendTo('body');
			
		var aspectRatio = imageForTraining.image.naturalWidth / 
			imageForTraining.image.naturalHeight;
		
		var height = getScreenHeight() * 0.4;
		var width = aspectRatio * height;
		
		imageForTraining.width = width;
		imageForTraining.height = height;
		
		var centre = new Point(getScreenHeight() / 2, getScreenWidth() / 2);
		
		imageForTraining.moveObject(centre);
		imageForTraining.drawObject();
		
		imageForTraining.element.css({
			opacity: '1',
			width: width,
			height: height,
			position: 'absolute'
		});
		
		var transition = 'left ' + imageForTraining.secondsForTransition + 's, top ' 
			+ imageForTraining.secondsForTransition + 's';
		addTransitionSpecifications(imageForTraining.element, transition);
		
		imageForTraining.element.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
			
			imageForTraining.element.removeClass().addClass('animated bounceIn');
			
			setTimeout(function() {
				imageForTraining.element.removeClass().css('opacity', '1');
			}, 1300);
			
		})
	},

	messageManager: function(data) {
		
		if (data.TYPE == "CAL_POINT") {
			
			// POINTS[0] = X position
			// POINTS[1] = Y position
			var points = (data.DATA).split(" ");
			
			var centerToDraw = new Point(points[1], points[0]);
			
			imageForTraining.moveObject(centerToDraw);
			imageForTraining.drawObject();
		}
	}
}

var TrainingManager = {
	
	dialogSelectParameters: function() {
		
		var selectNumberPoints = $('<select>').attr('id', 'selectNumberOfPoints');
		$('<option>').attr('value', '5').attr('selected', 'selected').text('5 punti').appendTo(selectNumberPoints);
		$('<option>').attr('value', '7').text('7 punti').appendTo(selectNumberPoints);
		$('<option>').attr('value', '9').text('9 punti').appendTo(selectNumberPoints);
		
		var selectTimePerPoint = $('<select>').attr('id', 'selectTimePerPoint');
		$('<option>').attr('value', '10000').attr('selected', 'selected').text('10 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '15000').text('15 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '20000').text('20 secondi').appendTo(selectTimePerPoint);
		
		var selectTimeTransition = $('<select>').attr('id', 'selectTimeTransition');
		$('<option>').attr('value', '1000').attr('selected', 'selected').text('1 secondo').appendTo(selectTimeTransition);
		$('<option>').attr('value', '2000').text('2 secondi').appendTo(selectTimeTransition);
		$('<option>').attr('value', '3000').text('3 secondi').appendTo(selectTimeTransition);
		$('<option>').attr('value', '5000').text('5 secondi').appendTo(selectTimeTransition);
		
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
		
		var divContainer = $('<div>');
		$('<h2>').text('Impostazioni per il training').appendTo(divContainer);
		$('<p>').text("E' necessario effettuare il training del sistema di eye tracking per continuare. Settare le impostazioni e cliccare su \"Inizia\".")
			.appendTo(divContainer);
		
		tableForm.appendTo(divContainer);
		
		divContainer.appendTo($('<div>').attr('id', 'dialogSettingsTraining').attr('title', 'Impostazioni')
			.appendTo('#divMainContent').dialog({
				modal: true,
				resizable: false,
				draggable: false,
				closeOnEscape: false,
				width: getScreenWidth() * 0.6,
				position: {
					my: "center top",
					at: "center top+5%"
				},
				buttons: {
					"Inizia": function() {
						
						var numberOfPoints = $('select#selectNumberOfPoints').val();
						var totalSeconds = $('select#selectTimePerPoint').val();
						var secondsTransition = $('select#selectTimeTransition').val();
						
						var packetWithSettings = {
							TYPE: 'START_TRAINING',
							POINTS: numberOfPoints,
							POINT_DURATION: totalSeconds,
							TRANSITION_DURATION: secondsTransition
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
			}));
	}, 
	
	trainingResult: function(value) {
		
		$('#dialogWaitingCompleteTraining').dialog('close');
		$('#dialogWaitingCompleteTraining').remove();
		
		var starsContainer = $('<p>');
		
		for (var i = 0; i < value; i++) {
			$('<img>').attr('src', '../images/star.png').appendTo(starsContainer);
		}
		
		for (var i = value; i < 5; i++) {
			$('<img>').attr('src', '../images/star.png').css('opacity', '0.5').appendTo(starsContainer);
		}
		
		starsContainer.children('img').css({
			width: '15%',
			display: 'inline',
			'margin-left': '3%'
		});
		
		var dialog = $('<div>').attr('id', 'divDialogTrainingEvaluation').attr('title', 'Risultato')
			.appendTo('#divMainContent');
		
		$('<p>').text('Valutazione training: ').appendTo(dialog);
		starsContainer.appendTo(dialog);
		dialog.dialog({
				modal: true,
				closeOnEscape: false,
				resizable: false,
				draggable: false,
				buttons: {
					"Inizia": function() {
						$(this).dialog("close");
						$(this).remove();
						
						TrainingManager.trainingComplete();
					}, 
					"Ripeti": function() {
						$(this).dialog("close");
						$(this).remove();
						
						TrainingManager.dialogSelectParameters();
					}
				}
			})
	},
	
	trainingComplete: function() {}

}