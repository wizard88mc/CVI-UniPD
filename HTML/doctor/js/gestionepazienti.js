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

	var table = $('<table>').attr('id', 'tableVisitsCatchMe');
	$('<caption>').text('Gioco Prendimi!').addClass('ui-widget-header').appendTo(table);
	var thead = $('<thead>').addClass('ui-widget-header').appendTo(table);
	$('<tr>').appendTo(thead);
	$('<th>').text('Data').appendTo(thead);
	$('<th>').text('Valutazione Vista').appendTo(thead);
	$('<th>').text('Valutazione Tocco').appendTo(thead);
	$('<th>').text('Casa/Studio').addClass('smallColumn').appendTo(thead);
	$('<th>').text('Visualizza Grafico').appendTo(thead);
			
	var body;
	if (visits.length > 0) {
		
		body = $('<tbody>').appendTo(table);
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
				
		var row = $('<tr>');
		$('<td>').text(data).appendTo(row);
		$('<td>').text(eyeEval).appendTo(row);
		$('<td>').text(touchEval).appendTo(row);
		
		if (visits[element].IS_AT_HOME == true) {
			var image = $('<img>').attr('src', 'images/home.png').attr('alt', 'Visita a casa');
			image.appendTo($('<td>').addClass('home').appendTo(row));
		}
		else {
			var image = $('<img>').attr('src', 'images/hospital.png').attr('alt', 'Visita in studio');
			image.appendTo($('<td>').addClass('hospital').appendTo(row));
		}
		
		var image = $('<img>').attr('src', '../images/navigate-right.png').attr('alt', 'Visualizza grafo')
				.addClass('watchButton');
							
		image.click(function() {

			var id = $(this).parent().children('input[name=visitID]').attr('value');
			makeRequestForGraphData(id);
		});

		var cell = $('<td>').appendTo(row);
		image.appendTo(cell);
		$('<input>').attr('type', 'hidden').attr('name', 'visitID').val(visitID).appendTo(cell);
				
		row.appendTo(body);
	}
			
	table.css('display', 'none');
	table.appendTo('#divTableContainer').fadeIn(2000);
	
	$('#divChooseOptions #divCheckboxExercises input:checkbox').change();
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

	var table = $('<table>').attr('id', 'tableVisitsHelpMe');
	$('<caption>').text('Gioco Aiutami!').addClass('ui-widget-header').appendTo(table);
	var thead = $('<thead>').addClass('ui-widget-header').appendTo(table);
	$('<tr>').appendTo(thead);
	$('<th>').text('Data').appendTo(thead);
	$('<th>').text('T. Risposta (ms)').appendTo(thead);
	$('<th>').text('T. Completamento (ms)').appendTo(thead);
	$('<th>').text('Ris. Corrette').appendTo(thead);
	$('<th>').text('Ris. Errate').appendTo(thead);
	$('<th>').text('Casa/Studio').addClass('smallColumn').appendTo(thead);
	$('<th>').text('Dettagli').appendTo(thead);
			
	var body;
	if (visits.length > 0) {
		
		body = $('<tbody>').appendTo(table);
	}
			
	for (element in visits) {
				
		var visitID = visits[element].VISIT_ID;
		var data = visits[element].DATE;
		var firstResponseTime = visits[element].FRT;
		var completionTime = visits[element].CT;
		var correct = visits[element].CORRECT_ANSWERS;
		var wrong = visits[element].WRONG_ANSWERS;
				
		var row = $('<tr>');
		$('<td>').text(data).appendTo(row);
		$('<td>').text(firstResponseTime).appendTo(row);
		$('<td>').text(completionTime).appendTo(row);
		$('<td>').text(correct).appendTo(row);
		$('<td>').text(wrong).appendTo(row);
		
		if (visits[element].IS_AT_HOME == true) {
			var image = $('<img>').attr('src', 'images/home.png').attr('alt', 'Visita a casa');
			image.appendTo($('<td>').addClass('home').appendTo(row));
		}
		else {
			var image = $('<img>').attr('src', 'images/hospital.png').attr('alt', 'Visita in studio');
			image.appendTo($('<td>').addClass('hospital').appendTo(row));
		}
		
		var image = $('<img>').attr('src', '../images/navigate-right.png').attr('alt', 'Visualizza esercizi')
				.addClass('watchButton');
							
		image.click(function() {

			var id = $(this).parent().children('input[name=visitID]').attr('value');
			makeRequestForExercisesStory(id);
		});

		var cell = $('<td>').appendTo(row);
		
		image.appendTo(cell);
		$('<input>').attr('type', 'hidden').attr('name', 'visitID').val(visitID).appendTo(cell);
				
		row.appendTo(body);
	}
			
	table.css('display', 'none');
	table.appendTo('#divTableContainer').fadeIn(2000);
			
	$('#divChooseOptions #divCheckboxExercises input:checkbox').change();
}

function updateRowsColorTable(table) {
	
	$(table).find('tbody tr').filter(function() {
		return $(this).css('display') != 'none';
	}).each(function(index) {
					
		if (index % 2 == 0) {
			$(this).addClass('alternate');
		}
		else {
			$(this).removeClass('alternate');
		}
	});
	
}
	

function drawTable(newTable) {
	
	var visits = listOfPatients[currentPatientID];
	$('#imgGoBack').off('click').on('click', function() {
		location.replace('../index.html');
	});
	
	
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
				$('<div>').attr('id', 'divNoVisitsFound').addClass('ui-state-error ui-corner-all').appendTo('#divTableContainer');
				$('<p>').text('Attenzione: Nessuna visita trovata per il paziente selezionato').appendTo('#divNoVisitsFound');
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
		
		$('<div>').attr('id', 'divTableContainer').appendTo('#divMainContent');
	}
	
	if (patientID != '') {
		
		currentPatientID = patientID;
		
		if ($('#divTableContainer table').length > 0) {
			$('#divTableContainer table').fadeOut();
			$('#divTableContainer table').remove();
		}
		
		if ($('#imgPreloaderMiddle').length == 0) {
			$('<img>').attr('id', 'imgPreloaderMiddle')
				.attr('alt', 'In attesa dati visite')
				.attr('src', '../images/preloader.gif').appendTo('#divTableContainer');
		}
		
		$('#imgPreloaderMiddle').fadeIn(1000, function() {
			
			$.ajax({
				url: SERVER_ADDRESS + '/server/GetPatientVisits.php',
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
					url: SERVER_ADDRESS + '/server/GetGraphData.php',
					type: 'POST', 
					data: {visitID: visitID},
					success: function(data) {
						
						//console.log(data);
						try {
							lastDataReceived = JSON.parse(data);
							
							drawGraph(true);
						}
						catch(Err) {
							console.log("Error in makeRequestForGraphData");
							console.log(Err);
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
					url: SERVER_ADDRESS + '/server/GetHelpMeDetailsData.php',
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
	
	$('#imgGoBack').off('click');
	$('#imgGoBack').on('click', function() {
		
		$('#divBackButtonContainer, #divGrafo').fadeOut('fast', function() {
			$('#imgPreloaderMiddle').fadeIn('fast', function() {
				drawTable(false);	
			});
		});
	});
	
	if (differentValues) {
		
		if ($('#divGrafo').length == 0) {
			$('<div>').attr('id', 'divGrafo').appendTo('#divTableContainer');
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
	
	
	$('#imgGoBack').off('click');
	$('#imgGoBack').on('click', function() {
		
		$('#divBackButtonContainer, #listExercises').fadeOut('fast', function() {
			$('#imgPreloaderMiddle').fadeIn('fast', function() {
				drawTable(false);	
			})
		});
	});
	
	if (differentValues) {
		
		$('#listExercises').remove();
		
		var list = $('<dl>').attr('id', 'listExercises').appendTo('#divTableContainer');
		list.css({
			display: 'none'
		});
		
		
		for(var element in lastDataReceived) {
			
			var listOfExercises = lastDataReceived[element];
			var dataTerm = $('<dt>').text('Famiglia target: ' + element).appendTo(list);
			$('<img>').attr('src', '../images/show_more.png').attr('alt', 'Dettagli')
				.prependTo(dataTerm).on('click', moreDetails);
			
			var dd = $('<dd>').css('display', 'none').appendTo(list);
			var table = $('<table>').appendTo(dd);
			$('<thead>').appendTo(table);
			var row = $('<tr>').addClass('ui-widget-header').appendTo(table);
			$('<th>').text('Nome Oggetto').appendTo(row);
			$('<th>').text('Ogg. Target').addClass('smallerColumn').appendTo(row);
			$('<th>').text('Tempo risposta (ms)').appendTo(row);
			$('<th>').text('Tempo Completamento (ms)').appendTo(row);
			$('<th>').text('Risp. Corretta').addClass('smallerColumn').appendTo(row);
			
			var totalNumber = listOfExercises.length;
			var totalFRT = 0;
			var totalCT = 0;
			var totalCorrect = 0;
			var totalIncorrect = 0;
			
			var yesImage = $('<img>').attr('src', '../images/correct.png').addClass('imageAnswer');
			var noImage = $('<img>').attr('src', '../images/incorrect.png').addClass('imageAnswer');
			
			
			for (var index in listOfExercises) {
				
				var isTarget = listOfExercises[index].IS_TARGET;
				var objectName = listOfExercises[index].OBJECT_NAME;
				var frt = parseInt(listOfExercises[index].FIRST_RESPONSE_TIME);
				var ct = parseInt(listOfExercises[index].COMPLETION_TIME);
				var rightAnswer = listOfExercises[index].RIGHT_ANSWER;
				
				var row = $('<tr>').appendTo(table);
				$('<td>').text(objectName).appendTo(row);
				if (isTarget == "true") {
					$('<img>').attr('src', '../images/correct.png').addClass('imageAnswer').attr('alt', 'Oggetto target')
					.appendTo($('<td>').appendTo(row));
				}
				else {
					$('<img>').attr('src', '../images/incorrect.png').addClass('imageAnswer').attr('alt', 'Oggetto non target')
					.appendTo($('<td>').appendTo(row));
				}
				$('<td>').text(frt).appendTo(row);
				$('<td>').text(ct).appendTo(row);
				if (rightAnswer == "true") {
					$('<img>').attr('src', '../images/correct.png').addClass('imageAnswer').attr('alt', 'Risposta corretta').appendTo($('<td>').appendTo(row));
				}
				else {
					$('<img>').attr('src', '../images/incorrect.png').addClass('imageAnswer').attr('alt', 'Risposta corretta').appendTo($('<td>').appendTo(row));
				}
				
				totalFRT += frt;
				totalCT += ct;
				if (rightAnswer == "true") {
					totalCorrect++;
				}
				else {
					totalIncorrect++;
				}
			}
			
			var totalsRow = $('<tr>').css('font-weight', 'bold').appendTo(table);
			$('<td>').appendTo(totalsRow);
			$('<td>').text('Valori medi: ').appendTo(totalsRow);
			$('<td>').text(Math.round(totalFRT / totalNumber)).appendTo(totalsRow);
			$('<td>').text(Math.round(totalCT / totalNumber)).appendTo(totalsRow);
			$('<td>').text(totalCorrect + '/' + totalIncorrect).appendTo(totalsRow);
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
	
	
	$('<div>').attr('id', 'divChooseOptions').appendTo('#divMainContent');
	$('<table>').attr('id', 'tableSelectOptions').appendTo('#divChooseOptions');
	
	var row = $('<tr>').appendTo('#tableSelectOptions');
	$('<label>').attr('for', 'selectPatient')
		.text('Seleziona paziente: ').addClass('label')
		.appendTo($('<td>').addClass('alignRight').appendTo(row));
	
	$('<select>').attr('id', 'selectPatient').attr('name', 'selectPatient')
	.appendTo($('<td>').appendTo(row));
	$('#selectPatient').change(function() {
		
		if ($('#divTableContainer').children().length > 0) {
			$('#divTableContainer').children().fadeOut();
		}
		// far entrare loader middle
		savePatientVisits($(this).val());
	});
	$('<option>').attr('value', '').text(' - - - ').appendTo('#selectPatient');
	$('<img>').attr('id', 'imgPreloaderPatients').attr('src', '../images/preloader.gif')
		.attr('alt', 'In Attesa').appendTo($('<td>').appendTo(row));
		
	var div = $('<div>').attr('id', 'divCheckboxExercises')
		.addClass('alignLeft').appendTo('#divChooseOptions');
		
	$('<input>').attr('type', 'checkbox').attr('name', 'homeExercises')
		.val('homeExercises').attr('id', 'homeExercises').appendTo(div);
	$('<label>').attr('for', 'homeExercises').text('Visualizza esercizi svolti a casa').appendTo(div);
	
	$('<br />').appendTo(div);
	
	$('<input>').attr('type', 'checkbox').attr('name', 'visitExercises')
		.val('visitExercises').attr('id', 'visitExercises').appendTo(div);
	$('<label>').attr('for', 'visitExercises').text('Visualizza esercizi svolti nello studio medico').appendTo(div);
	
	$('#divChooseOptions #divCheckboxExercises input:checkbox').attr('checked', 'checked');
	
	$('#divChooseOptions #divCheckboxExercises input:checkbox').change(function() {
		
		if ($('#divChooseOptions #divCheckboxExercises input[name=homeExercises]').attr('checked') == "checked") {
			$('#tableVisitsCatchMe tr td[class=home], #tableVisitsHelpMe tr td[class=home]').parent('tr')
				.fadeIn('fast');
		}
		else {
			$('#tableVisitsCatchMe tr td[class=home], #tableVisitsHelpMe tr td[class=home]').parent('tr')
				.fadeOut('fast');
		}
		
		if ($('#divChooseOptions #divCheckboxExercises input[name=visitExercises]').attr('checked') == "checked") {
			$('#tableVisitsCatchMe tr td[class=hospital], #tableVisitsHelpMe tr td[class=hospital]').parent('tr')
				.fadeIn('fast');
		}
		else {
			$('#tableVisitsCatchMe tr td[class=hospital], #tableVisitsHelpMe tr td[class=hospital]').parent('tr')
				.fadeOut('fast');
		}
		
		setTimeout(function() {
			updateRowsColorTable($('#tableVisitsCatchMe'));
			updateRowsColorTable($('#tableVisitsHelpMe'));	
		}, 300);
		
		
	})
	
	$.ajax({
		url: SERVER_ADDRESS + '/server/GetPatientsList.php',
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
	
	row = $('<tr>').appendTo('#tableSelectOptions');
	
	$('<label>').attr('for', 'selectGame').text('Seleziona gioco: ').addClass('label')
		.appendTo($('<td>').addClass('alignRight').appendTo(row));
	
	$('<select>').attr('id', 'selectGame').attr('name', 'selectGame')
		.appendTo($('<td'>).appendTo(row));
	
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
	$('<option>').val('').text(' - - - ').appendTo('#selectGame');
	$('<option>').val('catchMe').text('Prendimi!').appendTo('#selectGame');
	$('<option>').val('helpMe').text('Aiutami!').appendTo('#selectGame');
	
	var container = $('<p>').insertBefore('#divChooseOptions')
		.css({
			width: '30%',
			'text-align': 'left',
			'margin-left': '5%'
		});
	
	$('<img>').attr('id', 'imgGoBack').attr('src', '../images/tasto_indietro.png')
		.attr('alt', 'Torna indietro').appendTo(container)
		.css({
			cursor: 'pointer',
			width: '40%'
		})
		.on('click', function() {
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
