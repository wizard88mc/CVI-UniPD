var tableBody = null;
var firstResponseTimeValues = {};
var completionTimeValues = {};
var goodAnswers = {};
var badAnswers = {};
var screenWidth = 0;
var screenHeight = 0;
var ratio = 0;
var canvas = null;
var context = null;
var drawingSettings = {
	firstPointTouch: false,
	firstPointEye: false,
	firstPointImage: false,
	lastPointTouch: new Point(),
	lastPointEye: new Point(),
	lastPointImage: new Point(),
	colorImage: '#FF0000',
	colorTouch: '#00FF00',
	colorEye: '#000000',
	mirinoEye:null 
};

var HelpMeNamespace = {
	
	entryFunction: function(message) {
		
		var data = JSON.parse(message.data);
		
		if (data.TYPE == "SCREEN_MEASURES") {
			
			$('#divMainContent div').remove();
			
			screenWidth = data.SCREEN_WIDTH;
			screenHeight = data.SCREEN_HEIGHT;
			
			console.log(screenHeight);
			console.log(screenWidth);
		
			HelpMeNamespace.prepareTable();	
			
			$('<div id="screenPreview"></div>').insertBefore('#tableResultsHelpMe');
			
			HelpMeNamespace.prepareLegend();
			HelpMeNamespace.prepareCanvas();
			
			$('<div id="divButtonStopGame">Interrompi gioco</div>').insertBefore('#tableResultsHelpMe')
			.button().on('click', function() {
				
				var packetToSend = {
					TYPE: "STOP_GAME"
				}
				
				websocket.send(JSON.stringify(packetToSend));
				
				$(this).remove();
			})
			
			$('<div id="dialogWaitingToStart" title="Pronto"><p>Non appena tutto sarà pronto, cliccare su Ok per iniziare la presentazione</p></div>').appendTo('#divMainContent')
			.dialog({
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
							'TYPE': 'START_PRESENTATION'
						};
						
						websocket.send(JSON.stringify(packetToSend));
						
					}
				}
			});
			
		}
		else if (data.TYPE == 'PRESENTATION_COMPLETE') {
			
			$('<div id="dialogWaitingToStart" title="Cominciamo!"><p>Presentazione completata. Premere Ok per iniziare il gioco</p></div>').appendTo('#divMainContent')
			.dialog({
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
							'PATIENT_ID': patientID,
							'GAME_ID': gameIdentification
						};
						
						websocket.send(JSON.stringify(packetToSend));
						
						websocket.onmessage = HelpMeNamespace.messagesDuringGame;
					}
				}
			});
		}
		else {
			console.log("Bad Message in entryFunction:");
			console.log(message);
			console.log(message.data);
		}
		
	},
	
	messagesDuringGame: function(message) {
		
		var data = JSON.parse(message.data);
		
		// devo fare disegno del canvas con le varie posizioni
		if (data.TYPE == 'GAME_POSITIONS') {
			
			var pointTouch = data.TOUCH_SPECS;
			
			if (pointTouch.LEFT != null && pointTouch.LEFT != -1) {
				pointTouch.LEFT = pointTouch.LEFT * ratio;
				pointTouch.TOP = pointTouch.TOP * ratio;
				
				if (!drawingSettings.firstPointTouch) {
					drawingSettings.firstPointTouch = true;
				}
				else {
					
					context.strokeStyle = drawingSettings.colorTouch;
					context.beginPath();
					context.moveTo(drawingSettings.lastPointTouch.LEFT, 
						drawingSettings.lastPointTouch.TOP);
					context.lineTo(pointTouch.LEFT, pointTouch.TOP);
					context.closePath();
					context.stroke();
				}
				
				drawingSettings.lastPointTouch = pointTouch;
			}
			else if (pointTouch.LEFT != null && pointTouch.LEFT == -1) {
				drawingSettings.firstPointTouch = false;
			 }
			
			
			var pointEye = data.EYE_SPECS;
			
			if (pointEye != null && pointEye.LEFT != -1) {
				pointEye.LEFT = pointEye.LEFT * ratio;
				pointEye.TOP = pointEye.TOP * ratio;
				
				if (!drawingSettings.firstPointEye) {
					drawingSettings.firstPointEye = true;
				}
				else {
					context.strokeStyle = drawingSettings.colorEye;
					context.beginPath();
					context.moveTo(drawingSettings.lastPointEye.LEFT, 
						drawingSettings.lastPointEye.TOP);
					context.lineTo(pointEye.LEFT, pointEye.TOP);
					context.closePath();
					context.stroke();
				}
				
				drawingSettings.lastPointEye = pointEye;
				drawingSettings.mirinoEye.css({
					visibility: 'visible',
					top: canvas.position().top + pointEye.TOP,
					left: canvas.position().left + pointEye.LEFT
				});
			}
			else if (pointEye.LEFT != null && pointEye.LEFT == -1) {
				drawingSettings.firstPointEye = false;
			}
			
			
			var pointImage = data.IMAGE_SPECS;
			
			if (pointImage.LEFT != null && pointImage.LEFT != -1) {
				pointImage.TOP = pointImage.TOP * ratio;
				pointImage.LEFT = pointImage.LEFT * ratio;
				
				if (!drawingSettings.firstPointImage) {
					drawingSettings.firstPointImage = true;
				}
				else {
					
					context.strokeStyle = drawingSettings.colorImage;
					context.fillStyoe = drawingSettings.colorImage;
					context.beginPath();
					context.moveTo(drawingSettings.lastPointImage.LEFT, 
						drawingSettings.lastPointImage.TOP);
					context.lineTo(pointImage.LEFT, pointImage.TOP);
					context.closePath();
					context.stroke();
				}
				
				drawingSettings.lastPointImage = pointImage;
			}
			else if (pointImage.LEFT != null && pointImage.LEFT == -1) {
				drawingSettings.firstPointImage = false;
			}
			
			
		}
		else if (data.TYPE == 'SESSION_RESULTS') {
			
			var targetFamily = data.TARGET_FAMILY;
			
			if (!firstResponseTimeValues[targetFamily]) {
				// livello non ancora iniziato, inizializzo valori
				firstResponseTimeValues[targetFamily] = new Array(data.FIRST_RESPONSE_TIME);
				completionTimeValues[targetFamily] = new Array(data.COMPLETION_TIME);
				goodAnswers[targetFamily] = 0;
				badAnswers[targetFamily] = 0;
				
				var row = $('<tr id="' + targetFamily +'"></tr>');
				row.appendTo(tableBody);
				$('<td>Riepilogo</td>').appendTo(row);
				$('<td>' + targetFamily + '</td>').appendTo(row);
				$('<td class="meanValueFRT"></td>').appendTo(row);
				$('<td class="meanValueCT"></td>').appendTo(row);
				$('<td class="counts"></td>').appendTo(row);
			}
			
			firstResponseTimeValues[targetFamily].push(data.FIRST_RESPONSE_TIME);
			completionTimeValues[targetFamily].push(data.COMPLETION_TIME);
				
			if (data.RIGHT_ANSWER == true) {
				goodAnswers[targetFamily]++;
			}
			else {
				badAnswers[targetFamily]++;
			}
			
			HelpMeNamespace.updateFamilyRow(targetFamily);
			
			HelpMeNamespace.resetCanvas();
		}
		else {
			console.log("Bad message received in Entry Function: ");
			console.log(data);
		}
	},
	
	updateFamilyRow: function(targetFamily) {
		
		var meanValueFRT = 0;
		var totalFRT = 0;
		var meanValueCT = 0;
		var totalCT = 0;
		
		for (var i = 0; i < firstResponseTimeValues[targetFamily].length; i++) {
			
			if (firstResponseTimeValues[targetFamily][i] != null) {
				meanValueFRT += firstResponseTimeValues[targetFamily][i];
				totalFRT++;
			}
		}
		
		meanValueFRT = meanValueFRT / totalFRT;
		
		for (var i = 0; i < completionTimeValues[targetFamily].length; i++) {
			
			if (completionTimeValues[targetFamily][i] != null) {
				meanValueCT += completionTimeValues[targetFamily][i];
				totalCT++;
			}
		}
		
		meanValueCT = meanValueCT / totalCT;
		
		var row = $('#tableResultsHelpMe tr[id=' + targetFamily + ']');
		
		row.children('.meanValueFRT').text(meanValueFRT.toFixed(2));
		row.children('.meanValueCT').text(meanValueCT.toFixed(2));
		row.children('.counts').text(goodAnswers[targetFamily] + '/' + 
									badAnswers[targetFamily]);
		
	},
	
	prepareTable: function() {
		
		var table = $('<table id="tableResultsHelpMe"></table>').appendTo('#divMainContent');
		$('<thead><tr><th>Oggetto</th><th>Famiglia Target</th><th>First Response Time (ms)</th><th>Tempo di completamento (ms)</th><th>Esatte / Errate</th></thead>')
			.addClass('ui-widget-header').appendTo(table);
			
		tableBody = $('<tbody></tbody>').appendTo(table);		
	},
	
	prepareCanvas: function() {
		
		canvas = $('<canvas id="screenSimulator"></canvas>').prependTo('#screenPreview');
		
		canvasObject = canvas.get(0);
		
		var totalWidth = $('#screenPreview').width();
		var legendWidth = $('#divLegend').width();
		
		var total = 100 * (Math.floor((totalWidth - legendWidth) / 100) - 1);
		canvasObject.width = total;
		
		ratio = total / screenWidth;
		canvasObject.height = screenHeight * ratio;
		
		console.log(canvasObject.width);
		console.log(canvasObject.height);
		
		context = canvasObject.getContext('2d');
		context.lineWidth = 3;
		
		drawingSettings.mirinoEye = $('<img class="mirino" src="images/eye.png" />').appendTo('#screenPreview')
		.css({
			width: Math.floor(getScreenWidth() * 0.015),
			height: Math.floor(getScreenWidth() * 0.015)
		});
	},
	
	resetCanvas: function() {
		
		context.clearRect(0, 0, canvasObject.width, canvasObject.height);
		drawingSettings.firstPointEye = false;
		drawingSettings.firstPointImage = false;
		drawingSettings.firstPointTouch = false; 
		drawingSettings.lastPointEye = null;
		drawingSettings.lastPointImage = null;
		drawingSettings.lastPointTouch = null;
	},
	
	prepareLegend: function() {
		
		var divLegend = $('<div id="divLegend"></div>').appendTo('#screenPreview');
		
		$('<h2>Legenda</h2>').appendTo(divLegend).css({
			'font-size': '1.5em',
			margin: '0em',
			'text-align': 'center',
			'margin-bottom': '0.3em'
		});
		
		var list = $('<ul></ul>').appendTo(divLegend);
		$('<li class="imageCenter">Centro Immagine</li><li class="touchCenter">Posizione tocco</li><li class="eyeCenter">Posizione Occhi</li>').appendTo(list);
		
	}
	
	
	
}