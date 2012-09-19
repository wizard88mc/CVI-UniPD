var imagesFamily = new Object();
var listOfLevels = [];
var listOfLevelTipologies = [];
var listOfImages = [];
var familySound = new Object();

function ImageGame(ID,name, fileName) {
	this.imageID = ID;
	this.name = name;
	this.fileName = fileName;
}

function ImageLevel(isTarget, imageID) {
	this.isTarget = isTarget;
	this.imageID = imageID;
	this.compare = function(otherImage) {
		return (this.isTarget == otherImage.isTarget && 
				this.imageID == otherImage.imageID);
	}
}

function Level(type, targets, distracters, targetFamily, sequence, maxTimeImage, sound) {
	this.type = type;
	this.numberOfTargets = targets;
	this.numberOfDistracters = distracters;
	this.targetFamily = targetFamily;
	this.sequence = sequence;
	this.sound = sound;
	this.maxTimeImage = maxTimeImage;
	
	this.compare = function(otherLevel) {
		
		if (this.type != otherLevel.type ||
			this.numberOfTargets != otherLevel.numberOfTargets ||
			this.numberOfDistracters != otherLevel.numberOfDistracters || 
			this.targetFamily != otherLevel.targetFamily || 
			this.maxTimeImage != otherLevel.maxTimeImage || 
			this.sequence.length != otherLevel.sequence.length) {
			
			return false;
		}
		
		for (var i = 0; i < this.sequence.length; i++) {
			
			if (!this.sequence[i].compare(otherLevel.sequence[i])) {
				return false;
			}
		}
		return true;
	}
}

var HelpMeSettingsNamespace = {
	
	checkImageType: function(imageID, typeElement, targetFamily) {
		
		if (targetFamily == "") {
			return false;
		}
		var possibleImages = imagesFamily[targetFamily];
		var foundInTarget = false;
		
		for (var index = 0; index < possibleImages.length && !foundInTarget; index++) {
			if (possibleImages[index].imageID == imageID) {
				foundInTarget = true;
			}
		}
		
		if (typeElement == 'T' && foundInTarget) {
			return true;
		}
		if (typeElement == 'D' && !foundInTarget) {
			return true;
		}
		return false;
	},
	
	buildSelectImages: function(imageID) {
		
		var select = $('<select></select>');
		
		if (imageID == -1) {
			$('<option value=""></option>').attr('selected', 'selected').appendTo(select);
		}
		
		for (var family in imagesFamily ) {

			var group = $('<optgroup label="'+family+'"></optgroup>').appendTo(select);
			var familyImages = imagesFamily[family];
			
			for (var index in familyImages) {
				
				var image = familyImages[index];
				var selected = ''
				if (image.imageID == imageID) {
					selected = ' selected="selected" ';
				}
				$('<option'+selected+'>'+image.name+'</option>').attr('value', image.imageID).appendTo(group);
			}
		}
		
		select.change(function() {
			var imageID = $(this).val();
			var typeElement = $(this).parent().parent().children('.columnImageType').text();
			var divLevel = $(this).parents().eq(4);
			var targetFamily = divLevel.find('select.selectTargetFamily').val();
			
			$(this).parent().next().children('img').attr('src', '../helpMe/images/'+HelpMeSettingsNamespace.getImageFilename(imageID));

			var isImageCorrect = HelpMeSettingsNamespace.checkImageType(imageID, typeElement, targetFamily);
			
			console.log(isImageCorrect);
			if (!isImageCorrect) {
				// indicare che l'immagine selezionata non è corretta
			}
			
		})
		
		return select;
	},
	
	buildSelectTargetFamily: function(targetFamily) {
		
		var select = $('<select class="selectTargetFamily"></select>');
		
		if (targetFamily == null) {
			$('<option value=""></option>').attr('selected', 'selected').appendTo(select);
		}
		
		for (var family in imagesFamily) {
			
			var selected = '';
			if (family == targetFamily) {
				selected = ' selected="selected" ';
			}
			$('<option'+selected+'>'+family+'</option>').attr('value', family).appendTo(select);
		}
		
		return select;
		
	},
	
	buildMaxTimeSelect: function(timeDefined) {
		
		console.log(timeDefined);
		var select = $('<select class="selectMaxTime"></select>');
		if (timeDefined == null) {
			$('<option value=""></option>').attr('selected', 'selected').appendTo(select);
		}
		
		for (var i = 6; i <= 20; i += 1) {
			var selected = '';
			if (i == timeDefined) {
				selected = ' selected="selected" ';
			}
			$('<option'+selected+'>'+i+'</option>').attr('value', i).appendTo(select);
		}
		
		return select;
	},
	
	buildLevelTitle: function(index, targets, distracters) {
		
		return 'Livello <span class="levelIndex">' + (index + 1) + '</span> - T: ' + targets 
		+ ' x D: ' + distracters;
	},
	
	makeRowSelectable: function(row) {
		
		$(row).selectable({
			stop: function() {
				$('td.ui-selected, tr.ui-selected').removeClass('ui-selected');
				$(this).children().addClass('ui-selected');
				$(this).addClass('ui-selected');
			}
		});
	},
	
	updateLabelsTabs: function() {
		$('#menuTabs li').each(function(index) {
			$(this).children('a').text(index + 1);
			$(this).children('a').attr('href', "#level" + index);
		});
		
		$('div[id^="level"]').each(function(index) {
			
			$(this).find('h2 span[class="levelIndex"]').text(index + 1);
			$(this).attr('id', "level" + index);
		});
	},
	
	getImageFilename: function(id) {
		
		for (var i = 0; i < listOfImages.length; i++) {
			
			if (listOfImages[i].imageID == id) {
				return listOfImages[i].fileName;
			}
		}
	},

	getImagesFamilies: function() {
		
		$.ajax({
			type: "GET",
	        url: "../helpMe/settings/images.xml",
	        dataType: "xml",
	        cache: 'false',
	        success: function(xml) {
	
	            $(xml).find('family').each(function() {
	            	
	                var family = $(this).attr('type');
	                
	                var audioFile = $(this).attr('audioFile');
	
	                familySound[family] = audioFile;
	                imagesFamily[family] = new Array();
	
	                $(this).find('image').each(function() {
	
	                    var name = $(this).attr('name');
	                    var fileName = $(this).attr('fileName');
	                    var imageID = $(this).attr('id');
	
	                    var image = new ImageGame(imageID, name, fileName);
	                    imagesFamily[family].push(image);
	                    listOfImages.push(image);
	                });
	            });
	            // recupero le diverse tipologie di livelli
	            
	            $.ajax({
	            	type: "GET",
	            	url: '../helpMe/settings/difficulties.xml',
	            	cache: 'false',
	            	dataType: 'xml',
	            	success: function(xml) {
	            		
	            		$(xml).find('typeLevel').each(function() {
	            			var type = $(this).attr('type');
	            			listOfLevelTipologies.push(type);
	            		});
	            		
	            		// recupero impostazioni di gioco, che saranno
	    	            // o di default oppure quelle specifiche per il bambino
	            		$.ajax({
	    	            	type: "POST",
	    	            	url: "../server/GetGameSettingsHelpMe.php",
	    	            	data: {
	    	            		patientID: patientID,
	    	            		gameID: gameID
	    	            	},
	    	            	success: function(message) {
	    	            		
	    	            		try {
	    	            			var data = JSON.parse(message);
	    		            		if (data.TYPE == "GAME_SPECS") {
	    		            			HelpMeSettingsNamespace.getGameLevels(data.FILE_NAME);
	    		            		}
	    	            		}
	    	            		catch(error) {
	    	            			console.log(error);
	    	            			console.log(message);
	    	            		}
	    	            	}
	    	            });
	            	}
	            });
	            
	        }
		});
	},
	
	getGameLevels: function(fileName) {
		
		console.log(fileName);
		$.ajax({
			type: "GET",
			url: '../helpMe/settings/' + fileName,
			dataType: "xml",
	        cache: 'false',
	        success: function(xml) {
	        	
	        	$(xml).find('level').each(function() {
	        		
	        		var type = $(this).attr('type');
	        		var targetsAndDistracters = type.split('x');
	        		var targetFamily = $(this).attr('targetFamily');
	        		var maxTime = $(this).attr('maxTimeImage');
	        		var sequenceOfImages = [];
	        		
	        		$(this).find('image').each(function() {
	        			var type = $(this).attr('type');
	        			var imageID = $(this).attr('imageID');
	        			var isTarget = true;
	        			if (type == 'D') {
	        				isTarget = false;
	        			}
	        			sequenceOfImages.push(new ImageLevel(isTarget, imageID));
	        		})
	        		
	        		listOfLevels.push(new Level(type, targetsAndDistracters[0], targetsAndDistracters[1],
	        				targetFamily, sequenceOfImages, maxTime));
	        		
	        	});
	        	
	        	HelpMeSettingsNamespace.buildDivSettings();
	        }
		})
	},
	
	buildDivSettings: function() {
		
		$('#divMainContent div').remove();
		
		$('#imgGoBack').off('click');
		$('#imgGoBack').on('click', function() {

			// invio pacchetto x dire di tornare indietro
			var packet = {
				TYPE: 'GO_BACK'
			};
			
			websocket.send(JSON.stringify(packet));
			
			$('#divMainContent div, #divMainContent table').remove();
			NewVisitNamespace.initializePage();
		})
		
		var divContainerAll = $('<div id="divContainerAll"></div>').appendTo('#divMainContent');
		divContainerAll.css({
			width: '90%',
			margin: 'auto'
		});
		
		$('<div id="divNewLevel"></div>').appendTo(divContainerAll).addClass('ui-widget-content ui-corner-all');
		$('<label for="selectNewLevel" class="label">Inserisci nuovo livello: </label>').appendTo('#divNewLevel')
			.css({
				padding: '0.5em',
				'vertical-align': 'middle'
			});
		$('<select id="selectNewLevel"></select>').appendTo('#divNewLevel');
		
		for (var index in listOfLevelTipologies) {
			$('<option></option>').attr('value', listOfLevelTipologies[index])
				.text(listOfLevelTipologies[index])
				.appendTo('#selectNewLevel');
		}
		
		$('<div id="buttonAddLevel">Aggiungi livello</div>').appendTo('#divNewLevel').button();
		
		$('#buttonAddLevel').on('click', function() {
			
			var valueLevel = $('#selectNewLevel').children('option:selected').val();
			var elements = valueLevel.split('x');
			// in element[0] ho target, element[1] distrattori
			var indexLevel = $('#menuTabs').children('li').length;
			
			var link = "#level" + indexLevel;
			var levelTitle = HelpMeSettingsNamespace.buildLevelTitle(indexLevel, elements[0], elements[1]);
			var divLevel = $('<div id="level'+indexLevel+'"><h2>'+levelTitle+'</h2></div>');
			divLevel.appendTo('#tabsLevels');
			
			var select = HelpMeSettingsNamespace.buildSelectTargetFamily();
			select.appendTo($('<div class="divSelectTargetFamily">Famiglia target: </div>').appendTo(divLevel));
			
			var selectTime = HelpMeSettingsNamespace.buildMaxTimeSelect();
			selectTime.appendTo($('<div class="divSelectMaxTime">Tempo massimo immagine: </div>').appendTo(divLevel));
			
			var table = $('<table class="tableLevel"></table>').appendTo(divLevel);
			
			for (var i = 0; i < elements[0]; i++) {
				
				var selectImage = HelpMeSettingsNamespace.buildSelectImages(-1);
				
				var row = $('<tr><td class="columnImageType">T</td><td class="columnImageSelect"></td></tr>').appendTo(table)
					.addClass('ui-widget-content');
				selectImage.appendTo(row.children('td').last());
				
				$('<td><img class="imgPreview" /></td>').appendTo(row);
				
				HelpMeSettingsNamespace.makeRowSelectable(row);
			}
			
			for (var i = 0; i < elements[1]; i++) {
				var selectImage = HelpMeSettingsNamespace.buildSelectImages(-1);
				
				var row = $('<tr><td class="columnImageType">D</td><td class="columnImageSelect"></td></tr>').appendTo(table)
					.addClass('ui-widget-content');
				selectImage.appendTo(row.children('td').last());
				
				$('<td><img class="imgPreview" /></td>').appendTo(row);
				HelpMeSettingsNamespace.makeRowSelectable(row);
			}
			
			$('<input type="hidden" name="levelType" />').attr('value', valueLevel).appendTo(divLevel);
			$('<input type="hidden" name="numberTargets" />').attr('value', elements[0]).appendTo(divLevel);
			$('<input type="hidden" name="numberDistracters" />').attr('value', elements[1]).appendTo(divLevel);
			
			var lastSimilarLevel = divLevel.prevAll('div[id^="level"]:has(input[name="levelType"][value="'+valueLevel+'"])').first();
			divLevel.insertAfter(lastSimilarLevel);
			var indexToInsert = lastSimilarLevel.parent().children('div').index(lastSimilarLevel);
			
			var label = indexLevel + 1;
			$('#tabsLevels').tabs("add", link, label, indexToInsert + 1);
			
			HelpMeSettingsNamespace.updateLabelsTabs();
		})
		
		var divTabs = $('<div id="tabsLevels"></div>').appendTo(divContainerAll);
		divTabs.css({
			float: 'left',
			width: '60%',
			padding: '1.0em'
		});
		
		$('<ul id="menuTabs"></ul>').appendTo(divTabs);
		
		for (var index in listOfLevels) {
			
			index = Number(index);
			var currentLevel = listOfLevels[index];

			$('<li><a href="#level' + index + '">' + (index + 1) + '</a></li>').appendTo('#menuTabs');
			
			var title = HelpMeSettingsNamespace.buildLevelTitle(index, currentLevel.numberOfTargets, currentLevel.numberOfDistracters);
			
			var divLevel = $('<div id="level' + index + '"><h2>' + title + '</h2></div>').appendTo(divTabs);
			
			var select = HelpMeSettingsNamespace.buildSelectTargetFamily(currentLevel.targetFamily);
			select.appendTo($('<div class="divSelectTargetFamily">Famiglia target: </div>').appendTo(divLevel));
			
			var selectTime = HelpMeSettingsNamespace.buildMaxTimeSelect(currentLevel.maxTimeImage);
			selectTime.appendTo($('<div class="divSelectMaxTime">Tempo massimo immagine: </div>').appendTo(divLevel));
			
			var sequenceImages = currentLevel.sequence;
			var table = $('<table class="tableLevel"></table>').appendTo(divLevel);
			
			for (var indexImages in sequenceImages) {
				
				var image = sequenceImages[indexImages];
				var target = 'T';
				if (!image.isTarget) {
					target = 'D';
				}
				
				var selectImage = HelpMeSettingsNamespace.buildSelectImages(image.imageID);
				
				var row = $('<tr><td class="columnImageType">'+target+'</td><td class="columnImageSelect"></td></tr>').appendTo(table)
					.addClass('ui-widget-content');
				selectImage.appendTo($('td.columnImageSelect').last());
				
				$('<img>').addClass('imgPreview')
				.attr('src', '../helpMe/images/'+HelpMeSettingsNamespace.getImageFilename(image.imageID))
				.appendTo($('<td></td>').appendTo(row));
				
				HelpMeSettingsNamespace.makeRowSelectable(row);
			}
			
			$('<input type="hidden" name="levelType" />').attr('value', currentLevel.type).appendTo(divLevel);
			$('<input type="hidden" name="numberTargets" />').attr('value', currentLevel.numberOfTargets).appendTo(divLevel);
			$('<input type="hidden" name="numberDistracters" />').attr('value', currentLevel.numberOfDistracters).appendTo(divLevel);
		}
		
		var divButtons = $('<div id="buttons"></div>').appendTo(divContainerAll);
		divButtons.addClass('ui-widget-content ui-corner-all')
			.css({
				float: 'right',
				width: '33%',
			});
		$('<div id="buttonMoveUp">&uarr;</div>').appendTo(divButtons).button();
		$('#buttonMoveUp').on('click', function() {
			var rowSelected = $('tr.ui-selected');
			var rowIndex = rowSelected.parent().children().index(rowSelected);
			 
			 if (rowIndex > 0) {
				 rowSelected.insertBefore(rowSelected.parent().children().get(rowIndex - 1));
			 }
		})
		$('<idv id="buttonMoveDown">&darr;</div>').appendTo(divButtons).button();
		$('#buttonMoveDown').on('click', function() {
			var rowSelected = $('tr.ui-selected');
			var rowIndex = rowSelected.parent().children().index(rowSelected);
			var totalRows = rowSelected.parent().children().size();

			if (rowIndex < totalRows - 1) {
				rowSelected.insertAfter(rowSelected.parent().children().get(rowIndex + 1));
			}
		});
		
		$('<div id="buttonDeleteLevel">Elimina livello</div>').appendTo(divButtons).button()
		.on('click', function() {
			
			var index = $('#menuTabs').children().index('#menuTabs li[class*="ui-tabs-selected"]');
			
			divTabs.tabs("remove", index);
			
			HelpMeSettingsNamespace.updateLabelsTabs();
		})
		
		$('<div id="buttonComplete">Livelli completati</div>').appendTo(divButtons).button()
			.on('click', function() {
				HelpMeSettingsNamespace.collectLevelsToSend();
			});
		
		divButtons.children().css({
				margin: '0.5em'
			});
		
		$('#tabsLevels h2').css({
			'margin-bottom': '0.2em'
		});
		
		$('<div></div>').appendTo(divContainerAll).css({
			clear: 'both'
		});
		
		divTabs.tabs();
	},
	
	collectLevelsToSend: function() {
		
		listOfNewLevels = new Array();
		
		var divsLevels = $('#tabsLevels div[id^="level"]');

		for (var index = 0; index < divsLevels.length; index++) {
			
			var currentLevel = divsLevels.get(index);
			var levelType = $(currentLevel).children('input[name="levelType"]').val();
			var numberOfTargets = $(currentLevel).children('input[name="numberTargets"]').val()
			var numberOfDistracters = $(currentLevel).children('input[name="numberDistracters"]').val()
			var targetFamily = $(currentLevel).children().children('select[class="selectTargetFamily"]').val();
			var maxTimeWaiting = $(currentLevel).children().children('select[class="selectMaxTime"]').val();
			var sound = familySound[targetFamily];
			
			var rowsElements = $(currentLevel).find('table tbody tr');
			
			var imagesSequence = [];

			rowsElements.each(function() {

				var typeImage = $(this).find('td.columnImageType').text();
				var imageID = $(this).find('td.columnImageSelect select').val();
				var isTarget = true;
				if (typeImage == 'D') {
					isTarget = false;
				}
				
				imagesSequence.push(new ImageLevel(isTarget, imageID));
			});
			
			listOfNewLevels.push(new Level(levelType, numberOfTargets, numberOfDistracters, targetFamily, 
					imagesSequence, maxTimeWaiting, sound));
			
		}
		
		// devo verificare se x caso ho cambiato livelli di
		// rispetto a quelli di partenza; 
		// in caso affermativo devo salvare dati
		var levelsToSend = false;
		if (listOfLevels.length != listOfNewLevels.length) {
			// devo spedire
			levelsToSend = true;
			console.log("Spedisci");
		}
		else {
			var equals = true;
			for (var index = 0; index < listOfNewLevels.length && equals; index++) {
				
				equals = equals && listOfNewLevels[index].compare(listOfLevels[index]);
			}
			
			if (!equals) {
				// devo spedire
				levelsToSend = true;
				console.log("Spedisci");
			}
			else {
				console.log("non spedisci");
			}
		}
		
		if (levelsToSend) {
			$.ajax({
				type: "POST", 
				url: "../server/SaveLevelsHelpMe.php",
				data: {
					patientID: patientID,
					levels: JSON.stringify(listOfNewLevels)
				},
				success: function(message) {

					if (message == 1) {
						console.log("Complete");
						HelpMeSettingsNamespace.sendLevelsToClient(listOfNewLevels);
					}
				}
			})
			
		}
		HelpMeSettingsNamespace.sendLevelsToClient(listOfNewLevels);
	},
	
	sendLevelsToClient: function(levels) {
		
		console.log(levels);
		
		$.getScript('js/watchHelpMe.js')
		.done(function(data, textStatus) {
			console.log("HelpMe loaded");
			websocket.onmessage = HelpMeNamespace.entryFunction;
			
			var packetToSend = {
				TYPE: "GAME_SETTINGS",
				LEVELS: levels
			};
			
			websocket.send(JSON.stringify(packetToSend));
			
			/*var packetSession = {
				'TYPE': 'SESSION_SPECS',
				'PATIENT_ID': patientID,
				'GAME_ID': gameIdentification
			};
						
			websocket.send(JSON.stringify(packetSession));*/
		})
		.fail(function(jqxhr, settings, exception) {
			console.log("Error loading file catchMe");
			console.log(jqxhr);
			console.log(settings);
			console.log(exception);
		});
		
	}
}