/**
 * @author Matteo Ciman
 */

var listOfPatients = new Object();
var currentPatientID = 0;
var currentVisitID = 0;
var lastDataReceived = null;
var deltaTouch = [];
var deltaEye = [];
var movements = [];
var imagePositions = [];
var eyesPositions = [];
var touchPositions = [];
var lastGraphWatched = null;
var doctorID = getFromSessionStorage("doctorID");

function drawCatchMeTable(visits) {
	
	if ($('#divNoVisitsFound').length > 0) {
		
		$('#divNoVisitsFound').fadeOut(0, function() {
			$(this).remove();	
		});
	}
	if ($('#tableVisitsCatchMe').length > 0) {

		$('#tableVisitsCatchMe').fadeOut(2000, function() {
			$(this).remove();
		});
	}

	var table = $('<table id="tableVisitsCatchMe"></table>');
	$('<caption>Gioco Prendimi!</caption>').addClass('ui-widget-header').appendTo(table);
	$('<thead><tr><th>Data</th><th>Valutazione Vista</th><th>Valutazione Tocco</th><th>Visualizza Grafo</th></tr></thead>').addClass('ui-widget-header').appendTo(table);
			
	var body;
	if (visits.length > 0) {
		
		body = $('<tbody></tbody>');
			body.appendTo(table);
	}
			
	for (element in visits) {
				
		var visitID = visits[element].VISIT_ID;
		var data = visits[element].DATE;
		var eyeEval = visits[element].EYE_EVAL;
		var touchEval = visits[element].TOUCH_EVAL;
				
		if (!eyeEval) {
			eyeEval = '- - -';
			visits[element].EYE_EVAL = eyeEval;
		}
		if (!touchEval) {
			touchEval = '- - -';
			visits[element].TOUCH_EVAL = touchEval;
		}
				
		var row = $('<tr></tr>');
		$('<td>'+data+'</td>').appendTo(row);
		$('<td>'+eyeEval+'</td>').appendTo(row);
		$('<td>'+touchEval+'</td>').appendTo(row);
		var image = $('<img src="../images/navigate-right.png" alt="Visualizza grafo" />')
				.addClass('watchButton');
							
		image.click(function() {

			var id = $(this).parent().children('input[name=visitID]').attr('value');
			makeRequestForGraphData(id);
		});

		var cell = $('<td></td>');
		image.appendTo(cell);
		$('<input type="hidden" name="visitID" value="' + visitID + '" />').appendTo(cell);
		cell.appendTo(row);
				
		row.appendTo(body);
	}
			
	table.css('display', 'none');
	table.appendTo('#divTableContainer').fadeIn(2000);
			
	$('#tableVisitsCatchMe tbody tr:odd').addClass('alternate');
}
	


function drawHelpMeTable(visits) {
	
	if ($('#divNoVisitsFound').length > 0) {
		
		$('#divNoVisitsFound').fadeOut(0, function() {
			$(this).remove();	
		});
	}
	if ($('#tableVisitsHelpMe').length > 0) {

		$('#tableVisitsHelpMe').fadeOut(2000, function() {
			$(this).remove();
		});
	}

	var table = $('<table id="tableVisitsHelpMe"></table>');
	$('<caption>Gioco Aiutami!</caption>').addClass('ui-widget-header').appendTo(table);
	$('<thead><tr><th>Data</th><th>First Response Time (ms)</th><th>Completion Time (ms)</th><th>Ris. Corrette</th><th>Ris. Errate</th><th>Visualizza Esercizio</th></tr></thead>')
		.addClass('ui-widget-header').appendTo(table);
			
	var body;
	if (visits.length > 0) {
		
		body = $('<tbody></tbody>');
			body.appendTo(table);
	}
			
	for (element in visits) {
				
		var visitID = visits[element].VISIT_ID;
		var data = visits[element].DATE;
		var firstResponseTime = visits[element].FRT;
		var completionTime = visits[element].CT;
		var correct = visits[element].CORRECT_ANSWERS;
		var wrong = visits[element].WRONG_ANSWERS;
				
		var row = $('<tr></tr>');
		$('<td>'+data+'</td>').appendTo(row);
		$('<td>'+firstResponseTime+'</td>').appendTo(row);
		$('<td>'+completionTime+'</td>').appendTo(row);
		$('<td>'+correct+'</td>').appendTo(row);
		$('<td>'+wrong+'</td>').appendTo(row);
		var image = $('<img src="../images/navigate-right.png" alt="Visualizza esercizi" />')
				.addClass('watchButton');
							
		image.click(function() {

			var id = $(this).parent().children('input[name=visitID]').attr('value');
			makeRequestForExercisesStory(id);
		});

		var cell = $('<td></td>');
		image.appendTo(cell);
		$('<input type="hidden" name="visitID" value="' + visitID + '" />').appendTo(cell);
		cell.appendTo(row);
				
		row.appendTo(body);
	}
			
	table.css('display', 'none');
	table.appendTo('#divTableContainer').fadeIn(2000);
			
	$('#tableVisitsHelpMe tbody tr:odd').addClass('alternate');
}
	

function drawTable(newTable) {
	
	var visits = listOfPatients[currentPatientID];
	
	if (newTable) {
		if (visits.CatchMe.length > 0) {
			drawCatchMeTable(visits.CatchMe);
		}
		else {
			
			if ($('#tableVisitsCatchMe').length > 0) {
				$('#tableVisitsCatchMe').fadeOut(2000, function() {
					$(this).remove();
				});
			}
		}
		
		if (visits.HelpMe.length > 0) {
			drawHelpMeTable(visits.HelpMe);
		}
		
		if (visits.CatchMe.length == 0 && visits.HelpMe.length == 0) {
			if ($('#divTableContainer table').length > 0) {
				$('#divTableContainer table').fadeOut(2000, function() {
					$(this).remove();
				});
			}
			
			if ($('#divNoVisitsFound').length == 0) {
				$('<div id="divNoVisitsFound" class="ui-state-error ui-corner-all"></div>').appendTo('#divTableContainer');
				$('<p>Attenzione: Nessuna visita trovata per il paziente selezionato</p>').appendTo($('#divNoVisitsFound'));
				$('#divNoVisitsFound').fadeIn(2000);
			}
			else {
				$('#divNoVisitsFound').fadeIn();
			}
		}
		
	}
	else {
		$('#imgPreloaderMiddle').fadeOut(1000, function() {
			
			if ($('#selectGame').val() == "catchMe") {
				$('#tableVisitsCatchMe').fadeIn();	
			}
			else if ($('#selectGame').val() == "helpMe") {
				$('#tableVisitsHelpMe').fadeIn();
			}
			else if ($('#selectGame').val() == "") {
				$('#divTableContainer table').fadeIn();
			}
			
		});
	}
		
}

function savePatientVisits(patientID) {
	
	if ($('#divTableContainer').length == 0) {
		
		$('<div id="divTableContainer"></div>').appendTo('#divMainContent');
	}
	
	if (patientID != '') {
		
		currentPatientID = patientID;
		
		if ($('#divTableContainer table').length > 0) {
			$('#divTableContainer table').fadeOut();
			$('#divTableContainer table').remove();
		}
		
		if ($('#imgPreloaderMiddle').length == 0) {
			$('<img id="imgPreloaderMiddle" alt="In attesa dati visite" src="../images/preloader.gif" />').appendTo('#divTableContainer');
		}
		
		$('#imgPreloaderMiddle').fadeIn(1000, function() {
			
			$.ajax({
				url: '../server/GetPatientVisits.php',
				type: 'POST',
				data: {patientID: patientID},
				success: function(message, status) {
					
					if (status == 'success') {
						
						try {
							var data = JSON.parse(message);
							
							listOfPatients[patientID] = data;
						}
						catch(err) {
							console.log(message);
						}
					}
					$('#imgPreloaderMiddle').fadeOut(1000, function() {
						drawTable(true);
					});
					
				},
				error: function(event, textStatus) {
					// in caso di errore
				}
			})
		});
	}
}

function makeRequestForGraphData(visitID) {
	
	$('#divTableContainer table').fadeOut(500, function() {
	
		if (visitID != currentVisitID) {
			
			$('#imgPreloaderMiddle').fadeIn('fast', function() {
				
				$.ajax({
					url: '../server/GetGraphData.php',
					type: 'POST', 
					data: {visitID: visitID},
					success: function(data) {
						
						//console.log(data);
						try {
							lastDataReceived = JSON.parse(data);
							
							drawGraph(true);
						}
						catch(Err) {
							console.log(data);
						}
					}
				});
			});
		}
		else {
			drawGraph(false);
		}
	});
	
}

function makeRequestForExercisesStory(visitID) {
	// richiesta storia esercizio
	
	$('#divTableContainer table').fadeOut(500)
		.promise().done(function() {
	
		if (visitID != currentVisitID) {
			
			$('#imgPreloaderMiddle').fadeIn('fast', function() {
				
				$.ajax({
					url: '../server/GetHelpMeDetailsData.php',
					type: 'POST', 
					data: {visitID: visitID},
					success: function(data) {
						
						try {
							lastDataReceived = JSON.parse(data);
							drawHelpMeReport(true);
						}
						catch(Err) {
							console.log(data);
						}
					}
				});
			});
		}
		else {
			drawHelpMeReport(false);
		}
	});
}

function drawGraph(differentValues) {
	
	
	if (differentValues) {
		
		if ($('#divGrafo').length == 0) {
			$('<div id="divGrafo"></div>').appendTo('#divTableContainer');
			$('#divGrafo').height(getScreenHeight() * 0.5);
			
			$('#divGrafo').bind('plothover', function(event, pos, item) {
		
				if (item) {
					$('#tooltip').remove();
					
					var timeValue = item.datapoint[0].toFixed();
					
					createTooltip(item.pageX, item.pageY, timeValue, 0.3);
				}
				else {
					
					$('#tooltip').remove();
				}
			});
			
			$('#imgGoBack').off('click');
			$('#imgGoBack').one('click', function() {
				
				$(this).on('click', function() {
					location.replace('../index.html');
				})
				
				$('#divBackButtonContainer, #divGrafo').fadeOut('fast', function() {
					$('#imgPreloaderMiddle').fadeIn('fast', function() {
						drawTable(false);	
					});
				});
			});
		}
		
		deltaTouch = [];
		deltaEye = []; 
		var maxY = -1;
		
		var settings = lastDataReceived["IMAGE_SPECS"];
		delete lastDataReceived["IMAGE_SPECS"];
		
		tooltipObject["imageWidth"] = parseInt(settings.IMG_SPECS[0]) * 0.3;
		tooltipObject["imageHeight"] = parseInt(settings.IMG_SPECS[1]) * 0.3;
		tooltipObject['tooltipWidth'] = parseInt(settings.SCREEN_SPECS[0]) * 0.3;
		tooltipObject['tooltipHeight'] = parseInt(settings.SCREEN_SPECS[1]) * 0.3;
		
		for (var time in lastDataReceived) {
			
			var objectInfo = lastDataReceived[time];
			
			var eye = parseInt(objectInfo.DELTA_EYE);
			var touch = parseInt(objectInfo.DELTA_TOUCH);
			
			if (eye > touch && eye > maxY) {
				if (eye > maxY) {
					maxY = eye;
				}
			}
			else if (touch > maxY) {
				maxY = touch;
			}
			
			if (eye == -1) { eye = null; }
			if (touch == -1) { touch = null; }
			
			
			deltaTouch.push([time, touch]);
			deltaEye.push([time, eye]);
			movements[time] = objectInfo.MOVEMENT;
			
			var imagePos = objectInfo.IMAGE_POS
			imagePositions[time] = new Point(imagePos[0], imagePos[1]);
			
			var touchPos = objectInfo.TOUCH_POS;
			touchPositions[time] = new Point(touchPos[0], touchPos[1]);
			
			var eyesPos = objectInfo.EYES_POS;
			eyesPositions[time] = new Point(eyesPos[0], eyesPos[1]);
			
		}
		
	}
	
	$('#imgPreloaderMiddle').fadeOut('normal', function() {
		
		if (differentValues) {
			
			$('#divBackButtonContainer, #divGrafo').fadeIn(function() {
				grafo = $.plot($('#divGrafo'), [{label: 'Delta Vista', data: deltaEye}, 
				{label: 'Delta Touch', data: deltaTouch}], opzioniGrafo);
		
				if (deltaEye[deltaEye.length -1][0] > 61000) {
					grafo.getOptions().xaxes[0].max = 60000;
				}
				grafo.getOptions().yaxes[0].max = maxY;
				
				grafo.setupGrid();
				grafo.resize();
				grafo.draw();	
			})
			
		}
		else {
			$('#divGrafo, #divBackButtonContainer').fadeIn();
		}
	})
}

function drawHelpMeReport(differentValues) {
	
	if (differentValues) {
		
		$('#listExercises').remove();
		
		var list = $('<dl id="listExercises"></dl>').appendTo('#divTableContainer');
		list.css({
			display: 'none'
		});
		
		
		
		$('#imgGoBack').off('click');
		$('#imgGoBack').on('click', function() {
			
			$(this).off('click');
			$(this).on('click',function(){
				location.replace('../index.html');
			});
			
			$('#divBackButtonContainer, #listExercises').fadeOut('fast', function() {
				$('#imgPreloaderMiddle').fadeIn('fast', function() {
					drawTable(false);	
				})
			});
		});
		
		
		for(var element in lastDataReceived) {
			
			var listOfExercises = lastDataReceived[element];
			var dataTerm = $('<dt>Famiglia target: ' + element + '</dt>').appendTo(list);
			var image = $('<img src="../images/show_more.png" alt="Dettagli" />').prependTo(dataTerm);
			image.on('click', moreDetails);
			var dd = $('<dd></dd>').css('display', 'none').appendTo(list);
			var table = $('<table><thead><tr class="ui-widget-header"><th>Nome Oggetto</th><th>Ogg. Target</th><th>FRT (ms)</th><th>CT (ms)</th><th>Risp. Corretta</th></tr></thead></table>').appendTo(dd);
			
			var totalNumber = listOfExercises.length;
			var totalFRT = 0;
			var totalCT = 0;
			var totalCorrect = 0;
			var totalIncorrect = 0;
			
			
			for (var index in listOfExercises) {
				
				var isTarget = listOfExercises[index].IS_TARGET;
				var objectName = listOfExercises[index].OBJECT_NAME;
				var frt = parseInt(listOfExercises[index].FIRST_RESPONSE_TIME);
				var ct = parseInt(listOfExercises[index].COMPLETION_TIME);
				var rightAnswer = listOfExercises[index].RIGHT_ANSWER;
				
				var row = $('<tr></tr>').appendTo(table);
				$('<td>'+objectName+'</td>').appendTo(row);
				$('<td>'+isTarget+'</td>').appendTo(row);
				$('<td>'+frt+'</td>').appendTo(row);
				$('<td>'+ct+'</td>').appendTo(row);
				$('<td>'+rightAnswer+'</td>').appendTo(row);
				
				totalFRT += frt;
				totalCT += ct;
				if (rightAnswer == "true") {
					totalCorrect++;
				}
				else {
					totalIncorrect++;
				}
			}
			
			var totalsRow = $('<tr></tr>').css('font-weight', 'bold').appendTo(table);
			$('<td></td><td>Valori medi: </td>').appendTo(totalsRow);
			$('<td>'+ Math.round(totalFRT / totalNumber) +'</td>').appendTo(totalsRow);
			$('<td>'+ Math.round(totalCT / totalNumber) +'</td>').appendTo(totalsRow);
			$('<td>'+ totalCorrect + '/' + totalIncorrect +'</td>').appendTo(totalsRow);
		}
		
		$('#imgPreloaderMiddle').fadeOut('normal', function() {
			
			$('#listExercises, #divBackButtonContainer').fadeIn();
		});
		
	}
	else {
		$('#imgPreloaderMiddle').fadeOut('normal', function() {
			
			$('#listExercises, #divBackButtonContainer').fadeIn();
		});
	}
	
}

$('document').ready(function() {
	
	
	$('<div id="divChooseOptions"></div>').appendTo('#divMainContent');
	$('<table id="tableSelectOptions"></table>').appendTo('#divChooseOptions');
	
	var row = $('<tr></tr>').appendTo('#tableSelectOptions');
	$('<td class="alignRight"><label for="selectPatient">Seleziona paziente: </label></td>').appendTo(row);
	$('label[for="selectPatient"]').addClass('label');
	$('<td><select id="selectPatient" name="selectPatient"></select></td>').appendTo(row);
	$('#selectPatient').change(function() {
		
		if ($('#divTableContainer').children().length > 0) {
			$('#divTableContainer').children().fadeOut();
		}
		// far entrare loader middle
		savePatientVisits($(this).val());
	});
	$('<option value=""> - - - </option>').appendTo('#selectPatient');
	$('<td><img id="imgPreloaderPatients" src="../images/preloader.gif" alt="In Attesa" /></td>').appendTo(row);
	$.ajax({
		url:'../server/GetPatientsList.php',
		type: 'POST',
		data: {
			doctorID: doctorID
		},
		success: function(data, status) {
			
			if (status == 'success') {
				var message = JSON.parse(data);
				
				for (var i = 0; i < message.length; i++) {
					var patient = message[i];
					var name = patient.NAME + " " + patient.SURNAME;
					listOfPatients[patient.ID] = name;
					$('<option value="' + patient.ID + '">' + name + '</option>').appendTo('#selectPatient');
				}
				
				$('#imgPreloaderPatients').hide();
			}	
		}
	})
	
	row = $('<tr></tr>').appendTo('#tableSelectOptions');
	
	$('<td class="alignRight"><label for="selectGame">Seleziona gioco: </label></td>').appendTo(row);
	$('label[for="selectGame"]').addClass('label');
	$('<td><select id="selectGame" name="selectGame"></select></td>').appendTo(row);
	$('#selectGame').change(function() {
		
		var value = $(this).val();
		
		
		$('#divTableContainer').children().fadeOut('normal').promise().done(function() {
			if (value == "") {
				$('#divTableContainer table').fadeIn();
			}
			else if (value == "catchMe") {
				$('#tableVisitsCatchMe').fadeIn();		
			}
			else if (value == "helpMe") {
				$('#tableVisitsHelpMe').fadeIn();
			}			
		});
		
	});
	$('<option value=""> - - - </option>').appendTo('#selectGame');
	$('<option value="catchMe">Prendimi!</option>').appendTo('#selectGame');
	$('<option value="helpMe">Aiutami!</option>').appendTo('#selectGame');
	
	var container = $('<p></p>').insertBefore('#divChooseOptions');
	container.css({
		width: '30%',
		'text-align': 'left',
		'margin-left': '5%'
	});
	
	var goBack = $('<img id="imgGoBack" src="../images/tasto_indietro.png" alt="Torna indietro" />').appendTo(container);
	goBack.css({
		cursor: 'pointer',
		width: '40%'
	});
	goBack.on('click', function() {
		location.replace('../index.html');
	});
	
});

function moreDetails() {
	$(this).parent().next('dd').fadeIn();
	$(this).attr('src', '../images/less_details.png');
	$(this).off('click');
	$(this).on('click', lessDetails);
}

function lessDetails() {
	$(this).parent().next('dd').fadeOut();
	$(this).attr('src', '../images/show_more.png');
	$(this).off('click');
	$(this).on('click', moreDetails);
}
