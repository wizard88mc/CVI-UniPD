var tableBody = null;
var firstResponseTimeValues = {};
var completionTimeValues = {};
var goodAnswers = {};
var badAnswers = {};
var ratio = 0;
var canvas = null;
var context = null;
var indexCurrentLevel = 0;
var changeCurrentIndexLevel = false;
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
		
	initializePage: function() {
		
		$('#divMainContent div').remove();
	
		HelpMeNamespace.prepareTable();	
		
		$('<div>').attr('id', 'screenPreview').insertBefore('#tableResultsHelpMe');
		
		HelpMeNamespace.prepareLegend();
		HelpMeNamespace.prepareCanvas();
		
		$('<div>').attr('id', 'divButtonStopGame').text('Stop game').insertBefore('#tableResultsHelpMe')
		.button().on('click', function() {
			
			var packetToSend = {
				TYPE: "STOP_GAME"
			}
			
			websocket.send(JSON.stringify(packetToSend));
			
			$(this).remove();
		});
		
		websocket.onmessage = HelpMeNamespace.entryFunction;
	},
	
	trainingComplete: function() {
		
		var fakePacket = {
			TYPE: 'EYE_TRACKER_READY',
			DATA: 'false'
		};
		
		HelpMeNamespace.entryFunction(JSON.stringify(fakePacket));
	},
	
	entryFunction: function(message) {
		
		var data = JSON.parse(message.data || message);
		
		if (data.TYPE == "EYE_TRACKER_READY" && data.DATA == false) {
			
			useEyeTracker = true;
			
			$('<p>').text('Non appena tutto sarà pronto, cliccare su Ok per iniziare la presentazione...').appendTo(
			$('<div>').attr('id', 'dialogWaitingToStart').attr('title', 'Pronto').appendTo('#divMainContent')
			.dialog({
				modal: true,
				resizable: false,
				closeOnEscape: false,
				draggable: false,
				buttons: {
					Ok: function() {
						$(this).dialog("remove");
						$(this).remove();
						
						$('#divMainContent > h1').text('HelpMe!');
						
						var packetToSend = {
							'TYPE': 'START_PRESENTATION'
						};
						
						websocket.send(JSON.stringify(packetToSend));
						
						$('<p>').text('Presentazione in corso. Attendere ....').appendTo(
							$('<div>').attr('id', 'dialogWaitingEndPresentation').attr('title', 'Attendere')
							.appendTo('#divMainContent').dialog({
								modal: true,
								resizable: false,
								closeOnEscape: false,
								draggable: false
							}));
					}
					
				}
			}));
		}
		else if (data.TYPE == "EYE_TRACKER_READY" && data.DATA == true) {
			
			TrainingManager.dialogSelectParameters();
		}
		else if (dataReceived.TYPE == "TRAINING_RESULT") {
			
			TrainingManager.trainingResult(dataReceived.DATA);
			TrainingManager.trainingComplete = HelpMeNamespace.trainingComplete;
		}
		else if (data.TYPE == "EYE_TRACKER_NOT_READY") {
			
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
						
						useEyeTracker = false;
						
						var fakePacket = {
								TYPE: 'EYE_TRACKER_READY',
								DATA: 'false'
						};
						HelpMeNamespace.entryFunction(JSON.stringify(fakePacket));
						
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
		else if (data.TYPE == 'PRESENTATION_COMPLETE') {
			
			$('#dialogWaitingEndPresentation').dialog("close").remove();
			
			$('<p>').text('Presentazione completata. Premere Ok per iniziare il gioco').appendTo(
			$('<div>').attr('id', 'dialogWaitingToStart').attr('title', 'Cominciamo!').appendTo('#divMainContent')
			.dialog({
				modal: true,
				resizable: false,
				closeOnEscape: false,
				draggable: false,
				buttons: {
					Ok: function() {
						$(this).dialog("remove");
						$(this).remove();
						
						$('#divMainContent > h1').text('HelpMe!');
						
						var packetToSend = {
							'TYPE': 'START_GAME',
							'PATIENT_ID': patientID,
							'GAME_ID': gameIdentification,
							'WITH_TRACKER': useEyeTracker
						};
						
						websocket.send(JSON.stringify(packetToSend));
						
						websocket.onmessage = HelpMeNamespace.messagesDuringGame;
					}
				}
			}));
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
					top: canvas.position().top + pointEye.TOP - drawingSettings.mirinoEye.height() / 2,
					left: canvas.position().left + pointEye.LEFT - drawingSettings.mirinoEye.width() / 2
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
		else if (data.TYPE == 'LEVEL_ENDED') {
			changeCurrentIndexLevel = true; 
		}
		else if (data.TYPE == 'SESSION_RESULTS') {
			
			var targetFamily = data.TARGET_FAMILY;
			
			if (!firstResponseTimeValues[indexCurrentLevel]) {
				// livello non ancora iniziato, inizializzo valori
				firstResponseTimeValues[indexCurrentLevel] = new Array();
				completionTimeValues[indexCurrentLevel] = new Array();
				goodAnswers[indexCurrentLevel] = 0;
				badAnswers[indexCurrentLevel] = 0;
				
				var row = $('<tr>').attr('id', targetFamily + indexCurrentLevel)
					.css('font-weight', 'bold').appendTo(tableBody);
				$('<td>').text('Resume').appendTo(row);
				$('<td>').text(targetFamily).appendTo(row);
				$('<td>').addClass('meanValueFRT').appendTo(row);
				$('<td>').addClass('meanValueCT').appendTo(row);
				$('<td>').addClass('counts').appendTo(row);
			}
			
			firstResponseTimeValues[indexCurrentLevel].push(data.FIRST_RESPONSE_TIME);
			completionTimeValues[indexCurrentLevel].push(data.COMPLETION_TIME);
				
			if (data.RIGHT_ANSWER == true) {
				goodAnswers[indexCurrentLevel]++;
			}
			else {
				badAnswers[indexCurrentLevel]++;
			}
			
			HelpMeNamespace.updateFamilyRow(targetFamily);
			
			var newRow = $('<tr>').appendTo(tableBody);
			$('<td>').text(data.OBJECT_NAME).appendTo(newRow);
			$('<td>').text(targetFamily).appendTo(newRow);
			$('<td>').text(data.FIRST_RESPONSE_TIME).appendTo(newRow);
			$('<td>').text(data.COMPLETION_TIME).appendTo(newRow);
			$('<td>').text(data.RIGHT_ANSWER).appendTo(newRow);
			
			HelpMeNamespace.resetCanvas();
			
			if (changeCurrentIndexLevel) {
				indexCurrentLevel++;
				changeCurrentIndexLevel = false;
			}
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
		
		for (var i = 0; i < firstResponseTimeValues[indexCurrentLevel].length; i++) {
			
			if (firstResponseTimeValues[indexCurrentLevel][i] != null) {
				meanValueFRT += firstResponseTimeValues[indexCurrentLevel][i];
				totalFRT++;
			}
		}
		
		meanValueFRT = meanValueFRT / totalFRT;
		
		for (var i = 0; i < completionTimeValues[indexCurrentLevel].length; i++) {
			
			if (completionTimeValues[indexCurrentLevel][i] != null) {
				meanValueCT += completionTimeValues[indexCurrentLevel][i];
				totalCT++;
			}
		}
		
		meanValueCT = meanValueCT / totalCT;
		
		var row = $('#tableResultsHelpMe tr[id=' + targetFamily + indexCurrentLevel + ']');
		
		row.children('.meanValueFRT').text(meanValueFRT.toFixed(2));
		row.children('.meanValueCT').text(meanValueCT.toFixed(2));
		row.children('.counts').text(goodAnswers[indexCurrentLevel] + '/' + 
									badAnswers[indexCurrentLevel]);
		
	},
	
	prepareTable: function() {
		
		var table = $('<table>').attr('id', 'tableResultsHelpMe').appendTo('#divMainContent');
		var row = $('<tr>').appendTo($('<thead>').addClass('ui-widget-header').appendTo(table));
		$('<th>').text('Object').appendTo(row);
		$('<th>').text('Target Family').appendTo(row);
		$('<th>').text('First Response Time (ms)').appendTo(row);
		$('<th>').text('Completion Time (ms)').appendTo(row);
		$('<th>').text('Correct / Wrong').appendTo(row);
			
		tableBody = $('<tbody>').appendTo(table);		
	},
	
	prepareCanvas: function() {
		
		canvas = $('<canvas>').attr('id', 'screenSimulator').prependTo('#screenPreview');
		
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
		
		drawingSettings.mirinoEye = $('<img>').addClass('mirino')
			.attr('src', 'images/eye-new.png').appendTo('#screenPreview')
			.css({
				width: Math.floor(getScreenWidth() * 0.05),
				height: Math.floor(getScreenWidth() * 0.05)
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
		
		var divLegend = $('<div>').attr('id', 'divLegend').appendTo('#screenPreview');
		
		$('<h2>').text('Label').appendTo(divLegend).css({
			'font-size': '1.5em',
			margin: '0em',
			'text-align': 'center',
			'margin-bottom': '0.3em'
		});
		
		var list = $('<ul>').appendTo(divLegend);
		$('<li>').addClass('imageCenter').text('Image center').appendTo(list);
		$('<li>').addClass('touchCenter').text('Touch position').appendTo(list);
		$('<li>').addClass('eyeCenter').text('Eyes position').appendTo(list)
		
	}
	
}
