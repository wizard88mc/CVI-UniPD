var ImageForTraining = function() {
	
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
	
	startTraining: function() {
		
		console.log('Starting training');
		
		$('body').css({
			height: getScreenHeight(),
			'background-color': '#000064',
			'background-image': 'url(../images/background_training.png)',
			'background-size': '100% auto',
			'background-position': 'left bottom',
			'background-repeat': 'no-repeat'
		});
		
		imageForTraining = new ImageForTraining();
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
		
		var transition = 'left 3s, top 3s';
		addTransitionSpecifications(imageForTraining.element, transition);
		
		imageForTraining.element.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
			
			imageForTraining.element.removeClass().addClass('animated bounceIn');
			
			setTimeout(function() {
				imageForTraining.element.removeClass().css('opacity', '1');
			}, 1300);
			
		})
	},
	
	messageManager: function(data) {
		
		if (data.TYPE == "TRAINING_POSITION") {
			
			var centerToDraw = new Point(data.POS_TOP, data.POS_LEFT);
			
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
		$('<option>').attr('value', '10').attr('selected', 'selected').text('10 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '15').text('15 secondi').appendTo(selectTimePerPoint);
		$('<option>').attr('value', '20').text('20 secondi').appendTo(selectTimePerPoint);
		
		var tableForm = $('<table>');
		$('<tbody>').appendTo(tableForm);
		
		
		var row = $('<tr>').appendTo(tableForm);
		$('<td>').text('Numero di punti per il training: ').appendTo(row);
		$(selectNumberPoints).appendTo($('<td>').appendTo(row));
				
		row = $('<tr>').appendTo(tableForm);
		$('<td>').text('Tempo per ogni punto: ').appendTo(row);
		$(selectTimePerPoint).appendTo($('<td>').appendTo(row));
		
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
				buttons: {
					"Inizia": function() {
						
						var numberOfPoints = $('select#selectNumberOfPoints').val();
						var totalSeconds = $('select#selectTimePerPoint').val();
						
						var packetWithSettings = {
							TYPE: 'TRAINING_SETTINGS',
							POINTS: numberOfPoints,
							SPEED: totalSeconds // da capire cosa devo scegliere
						};
						
						websocket.send(JSON.stringify(packetWithSettings));
						
						$(this).dialog("close");
						$(this).remove();
						
						$('<p>').text('Training in corso. Attendere ....').appendTo(
							$('<div>').attr('id', 'dialogWaitingCompleteTraining').attr('title', 'Attendere')
							.appendTo('#divMainContent').dialog({
								modal: true,
								resizable: false,
								draggable: false,
								closeOnEscape: false
							})
						);
					}
				}
			}));
	}, 
	
	trainingResult: function(value) {
		
		$('#dialogWaitingCompleteTraining').dialog('close');
		$('#dialogWaitingCompleteTraining').remove();
		
		$('<div>').attr('id', 'divDialogTrainingEvaluation').attr('title', 'Valutazione training')
			.appendTo('#divMainContent').dialog({
				modal: true,
				closeOnEscape: false,
				resizable: false,
				draggable: false,
				buttons: {
					"Inizia": function() {
						$(this).dialog("close");
						$(this).remove();
						
						TrainingManager.trainingComplete();
					}
				}
			})
	},
	
	trainingComplete: function() {}

}