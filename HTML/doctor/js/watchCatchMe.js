datiEyeTracker = [];
maxEyeTracker =  -1;
datiTouch = [];
maxTouch = -1;
movements = new Object();
imagePositions = new Object();
touchPositions = new Object();
eyesPositions = new Object();

	
timing = null;
currentSpeedValue = -1;
	
var CatchMeNamespace = {
	
	entryFunction: function(message) {
		var dataReceived = JSON.parse(message.data);
		
		console.log(dataReceived);
		
		if (dataReceived.TYPE == 'IMAGE_SPECIFICATION') {
		
			tooltipObject['tooltipWidth'] = dataReceived.SCREEN_WIDTH * 0.4;
			tooltipObject['tooltipHeight'] = dataReceived.SCREEN_HEIGHT * 0.4;
			tooltipObject['imageWidth'] = dataReceived.IMAGE_WIDTH * 0.4;
			tooltipObject['imageHeight'] = dataReceived.IMAGE_HEIGHT * 0.4;
			
			websocket.onmessage = CatchMeNamespace.manageMessagesGame;
			
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
		
			$('<div id="dialogWaitingToStart" title="Pronto a cominciare"><p>Non appena tutto sarà pronto, cliccare su Ok per iniziare</p></div>').appendTo('#divMainContent');
			$('#dialogWaitingToStart').dialog({
				modal: true,
				resizable: false,
				closeOnEscape: false,
				draggable: false,
				buttons: {
					Ok: function() {
						$(this).dialog("remove");
						$(this).remove();
						console.log("Starting");
						
						$('#divMainContent > h1').text('Prendimi!');
						
						var packetToSend = {
							'TYPE': 'START_GAME',
							'GAME_ID': gameIdentification,
							'PATIENT_ID': patientID
						};
						
						websocket.send(JSON.stringify(packetToSend));
						timing = setInterval(CatchMeNamespace.updateChart, 5000);
					}
				}
			});
		}
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
		
		$('<div id="divManager"></div>').appendTo('#divMainContent');
		
		$('<div id="divSliderSpeed"></div>').appendTo('#divManager');
		$('<h1>Modifica velocità</h1>').appendTo('#divSliderSpeed');
		$('#divSliderSpeed h1').css({
			margin: '0em',
			'margin-bottom': '0.5em',
			'font-size': '1.5em'
		});
		$('<input id="sliderSpeed" type="slider" name="sliderSpeed" />').appendTo('#divSliderSpeed');
		$('<span id="labelSpeed"></span>').appendTo('#divSliderSpeed');
		
		$('#divSliderSpeed').css('visibility', 'hidden');
		
		$('<div id="buttonSendSpeed"></div>').appendTo('#divSliderSpeed');
		$('#buttonSendSpeed').button({
			label: 'Invia Modifica',
			disabled: true
		});
		$('#buttonSendSpeed').click(function() {
			
			var speed = $('#sliderSpeed').attr('value');
			var packet = {'TYPE': 'CHANGE_SPEED', 'NEW_SPEED' : speed};
			
			websocket.send(JSON.stringify(packet));
			currentSpeedValue = speed;
			$(this).button("disable");
		});
		
		var divArrows = $('<div id="arrowsMoveGraph"></div>').css({
			float: 'left',
			width: '30%',
			'margin-left': '5%',
			'margin-top': '2.0em'
			});
		divArrows.appendTo('#divManager');
		
		
		var leftArrow = $('<img id="leftArrow" class="arrow" src="../images/leftarrow.png" alt="Muovi grafo a sinistra" />');
		leftArrow.appendTo(divArrows);
		leftArrow.click(function(e) {
			
			e.preventDefault();
			grafo.pan({left: -1000});
		});
		var rightArrow = $('<img id="rightArrow" class="arrow" src="../images/rightarrow.png" alt="Muovi grafo verso destra" />');
		rightArrow.appendTo(divArrows);
		rightArrow.click(function(e) {
			e.preventDefault();
			grafo.pan({left: 1000});
		});
		
		$('<div id="buttonStopGame"></div>').appendTo('#divManager');
		$('#buttonStopGame').css({
			float: 'right',
			width: '30%',
			'margin-top': '2.0em'
		});
		$('#buttonStopGame').button({
			label: 'Interrompi gioco'
		});
		$('#buttonStopGame').click(function() {
			var packet = {'TYPE': 'STOP_GAME'};
			websocket.send(JSON.stringify(packet));
			
			$('#divSliderSpeed').css('visibility', 'hidden');
			$(this).css('visibility', 'hidden');
			clearInterval(timing);
			CatchMeNamespace.updateChart();
		});
		
		$('#buttonStopGame').css('visibility', 'hidden');
		
		$('<div></div>').appendTo('#divManager').css('clear', 'both');
		
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
