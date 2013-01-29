datiEyeTracker = null;
maxEyeTracker =  null;
datiTouch = null;
maxTouch = null;
movements = null;
imagePositions = null;
touchPositions = null;
eyesPositions = null;

	
timing = null;
currentSpeedValue = -1;
	
var CatchMeNamespace = {
	
	trainingComplete: function() {
		
		var fakePacket = {
			TYPE: 'EYE_TRACKER_READY',
			DATA: 'false'
		};
		
		CatchMeNamespace.entryFunction(JSON.stringify(fakePacket));
	},
	
	entryFunction: function(message) {
		
		var dataReceived = JSON.parse(message.data || message);
		
		console.log(dataReceived);
		
		if (dataReceived.TYPE == 'IMAGE_SPECIFICATION') {
		
			tooltipObject['tooltipWidth'] = dataReceived.SCREEN_WIDTH * 0.4;
			tooltipObject['tooltipHeight'] = dataReceived.SCREEN_HEIGHT * 0.4;
			tooltipObject['imageWidth'] = dataReceived.IMAGE_WIDTH * 0.4;
			tooltipObject['imageHeight'] = dataReceived.IMAGE_HEIGHT * 0.4;
			
			$('#divMainContent div').remove();
			
			$('<div>').attr('id', 'divGrafo').appendTo('#divMainContent')
				.css({
					width: '90%',
					margin: 'auto',
					padding: '1.0em'
			});
			CatchMeNamespace.prepareChart();
			
			//timing = setInterval(CatchMeNamespace.updateChart, 5000);
			// Mostro un dialog che dice che è tutto a posto,
			// e di cliccare quando tutto è pronto x iniziare
		}
		else if (dataReceived.TYPE == "EYE_TRACKER_READY" && dataReceived.DATA == "false") {
			
			websocket.onmessage = CatchMeNamespace.manageMessagesGame;
			
			datiEyeTracker = [];
			maxEyeTracker =  -1;
			datiTouch = [];
			maxTouch = -1;
			movements = new Object();
			imagePositions = new Object();
			touchPositions = new Object();
			eyesPositions = new Object();
			currentSpeedValue = -1;
		
			$('<p>').text('Non appena tutto sarà pronto, cliccare su Ok per iniziare').appendTo($('<div>').attr('id', 'dialogWaitingToStart').attr('title', 'Pronto a cominciare').appendTo('#divMainContent'));
			$('#dialogWaitingToStart').dialog({
				modal: true,
				resizable: false,
				closeOnEscape: false,
				draggable: false,
				buttons: {
					Ok: function() {
						$(this).dialog("remove");
						$(this).remove();
						
						$('#divMainContent > h1').text('Prendimi!');
						
						var packetToSend = {
							'TYPE': 'START_GAME',
							'GAME_ID': gameIdentification,
							'PATIENT_ID': patientID,
							'WITH_TRACKER': useEyeTracker
						};
						
						websocket.send(JSON.stringify(packetToSend));
						timing = setInterval(CatchMeNamespace.updateChart, 5000);
					}
				}
			});
		}
		else if (dataReceived.TYPE == "EYE_TRACKER_READY" && dataReceived.DATA == true) {
			
			// dialog to start training session
			TrainingManager.dialogSelectParameters();
		}
		else if (dataReceived.TYPE == "TRAINING_RESULT") {
			
			TrainingManager.trainingResult(dataReceived.DATA);
			TrainingManager.trainingComplete = CatchMeNamespace.trainingComplete;
		}
		else if (dataReceived.TYPE == "EYE_TRACKER_NOT_READY") {
			$('<p>').text('Il sistema di eye-tracking non è collegato. Si desidera procedere con la visita senza analisi del movimento degli occhi?')
			.appendTo($('<div>').attr('id', 'dialogTrackerNotReady').attr('title', 'Tracciamento degli occhi non collegato').appendTo('#divMainContent'))
			.dialog({
				modal: true,
				resizable: false,
				closeOnEscape: false,
				draggable: false,
				width: getScreenWidth() * 0.5,
				buttons: {
					"Continua senza": function() {
						$(this).dialog("close");
						$(this).remove();
						
						withEyeTracker = false;
						
						CatchMeNamespace.trainingComplete();
						
					},
					"Attendi collegamento": function() {
						console.log("Attendi collegamento");
						$(this).dialog("close");
						$(this).remove();
						$('<p>').text("Collegare il sistema di eye-tracking per continuare...").appendTo(
							$('<div>').attr('id', '#dialogWaitingTracker').attr('title', 'In Attesa...').appendTo('#divMainContent')
							.dialog({
								modal: true,
								resizable: false,
								closeOnEscape: false,
								draggable: false,
								width: getScreenWidth() * 0.4
							})
						);
						
						var packetToSend = {
							TYPE: 'WAITING_TRACKER'
						};
						
						websocket.send(JSON.stringify(packetToSend));
					}
				}
			});
		}
		//else if ()
	},
	
	updateChart: function() {
	
		var maxY = -1;
		if (maxTouch > maxEyeTracker) {
			maxY = maxTouch; 
		}
		else { maxY = maxEyeTracker };
		grafo.setData([{label: 'Delta Vista', data: datiEyeTracker}, 
			{label: 'Delta Tocco', data: datiTouch}]);
			
		grafo.getOptions().yaxes[0].max = maxY + 10;
		
		if (datiTouch.length > 0) {
			
			var lastValue = (datiTouch[datiTouch.length - 1])[0];
			
			grafo.getOptions().xaxes[0].max = lastValue + 20;
			if (lastValue > 60 * 1000) {
				grafo.getOptions().xaxes[0].min = lastValue % (60 * 1000);
			}
		}
		
		grafo.setupGrid();
		grafo.draw();
	},
	
	prepareChart: function() {
	
		$('#divGrafo').height(getScreenHeight() * 0.6);
		
		grafo = $.plot($('#divGrafo'), [{label: 'Delta Vista', data: [datiEyeTracker]}, 
						{label: 'Delta Tocco', data: [datiTouch]}], opzioniGrafo);
		
		$('#divGrafo').bind('plothover', function(event, pos, item) {
			
			if (item) {
				$('#tooltip').remove();
				clearInterval(timing);
				
				timing = null;
				var timeValue = item.datapoint[0].toFixed();
				
				createTooltip(item.pageX, item.pageY, timeValue, 0.4);
			}
			else {
				
				$('#tooltip').remove();
				if (timing == null) {
					timing = setInterval(CatchMeNamespace.updateChart, 5000);
				}
			}
		});
		
		$('<div>').attr('id', 'divManager').appendTo('#divMainContent');
		
		$('<div>').attr('id', 'divSliderSpeed').appendTo('#divManager');
		$('<h1>').text('Modifica velocità').appendTo('#divSliderSpeed')
			.css({
				margin: '0em',
				'margin-bottom': '0.5em',
				'font-size': '1.5em'
			});
		
		$('<input>').attr('id', 'sliderSpeed').attr('type', 'slider')
			.attr('name', 'sliderSpeed').appendTo('#divSliderSpeed');
		
		$('<span>').attr('id', 'labelSpeed').appendTo('#divSliderSpeed');
		
		$('#divSliderSpeed').css('visibility', 'hidden');
		
		$('<div>').attr('id', 'buttonSendSpeed').appendTo('#divSliderSpeed')
			.button({
				label: 'Invia Modifica',
				disabled: true
			}).click(function() {
			
				var speed = $('#sliderSpeed').attr('value');
				var packet = {'TYPE': 'CHANGE_SPEED', 'NEW_SPEED' : speed};
				
				websocket.send(JSON.stringify(packet));
				currentSpeedValue = speed;
				$(this).button("disable");
			});
		
		var divArrows = $('<div>').attr('id', 'arrowsMoveGraph')
		.css({
			float: 'left',
			width: '30%',
			'margin-left': '5%',
			'margin-top': '2.0em'
			}).appendTo('#divManager');
		
		
		var leftArrow = $('<img>').attr('id', 'leftArrow').attr('alt', 'Muovi grafico a sinistra')
			.attr('src', '../images/leftarrow.png').addClass('arrow')
			.appendTo(divArrows)
			.click(function(e) {
			
				e.preventDefault();
				grafo.pan({left: -1000});
		});
			
		var rightArrow = $('<img>').attr('id', 'rightArrow')
			.addClass('arrow').attr('src', '../images/rightarrow.png')
			.attr('alt', 'Muovi grafo verso destra')
			.appendTo(divArrows)
			.click(function(e) {
				e.preventDefault();
				grafo.pan({left: 1000});
			});
		
		$('<div>').attr('id', 'buttonStopGame').appendTo('#divManager')
			.css({
				float: 'right',
				width: '30%',
				'margin-top': '2.0em'
			})
			.button({
				label: 'Interrompi gioco'
			})
			.click(function() {
				var packet = {'TYPE': 'STOP_GAME'};
				websocket.send(JSON.stringify(packet));
				
				$('#divSliderSpeed').css('visibility', 'hidden');
				$(this).css('visibility', 'hidden');
				clearInterval(timing);
				CatchMeNamespace.updateChart();
			})
			.css('visibility', 'hidden');
		
		$('<div>').appendTo('#divManager').css('clear', 'both');
		
	},
	
	manageMessagesGame: function(message) {
	
		var dataReceived = JSON.parse(message.data);
		
		if (dataReceived.TYPE == "GRAPH_DATA") {
			
			// aggiungere dati al grafo
			datiEyeTracker.push([dataReceived.TIME, dataReceived.DELTA_EYE]);
			datiTouch.push([dataReceived.TIME, dataReceived.DELTA_TOUCH]);
			
			if (dataReceived.DELTA_EYE > maxEyeTracker) {
				maxEyeTracker = dataReceived.DELTA_EYE;	
			}
			if (dataReceived.DELTA_TOUCH > maxTouch) {
				maxTouch = dataReceived.DELTA_TOUCH;
			}
			
			imagePositions[dataReceived.TIME] = new Point(dataReceived.IMAGE_SPECS.posTop, 
												dataReceived.IMAGE_SPECS.posLeft);
			touchPositions[dataReceived.TIME] = new Point(dataReceived.TOUCH_SPECS.posTop,
												dataReceived.TOUCH_SPECS.posLeft);
			eyesPositions[dataReceived.TIME] = new Point(dataReceived.EYES_SPECS.posTop,
												dataReceived.EYES_SPECS.posLeft);
												
			movements[dataReceived.TIME] = dataReceived.MOVEMENT;
		}
		else if (dataReceived.TYPE == "STOP_GAME") {
			clearInterval(timing);
			$('#divSliderSpeed').css('visibility', 'hidden');
			$('#buttonStopGame').css('visibility', 'hidden');
		}
		else if (dataReceived.TYPE == 'SPEED_VALUE') {
			
			$('#buttonStopGame').css('visibility', 'visible');
			$('#divSliderSpeed').css('visibility', 'visible');
			
			$('#sliderSpeed').attr('value', dataReceived.SPEED);
			currentSpeedValue = dataReceived.SPEED;
			$('#sliderSpeed').slider({
				from: 1, to: 10, step: 1,
				format: {format: '##'}, skin: 'round',
				onstatechange: function(value) {
					
					$('#speedLabel').text(value);
					if (value == currentSpeedValue) {
						$('#buttonSendSpeed').button("disable");
					}
					else {
						$('#buttonSendSpeed').button("enable");
					}
				}
			});
		}
		else {
			console.log("Bad Message Received in manageMessagesGame");
		}
	}
}
