var tubo = null;
var sacco = null;
var cestino = null;
var imageObjectOnScreen = null;
var immaginiADisposizione = {};
var familySound = {};
var livelliGioco = [];
var oggettiPerLivello = [];
var gameManager = new GameManager();
var exampleManager = new ExampleNamespace.ExamplesManager();
var presentationManager = null;

var port = 8001;
var gameIdentification = "HELP_ME";
var identificationType = 'GAME_CLIENT';
var patientID = "1";
var playingWithoutWebSocket = false;
var stringForOfflineGame = "";
var totalPacketsIntoStringForOffline = 0;
var folderNameLocalStorage = "";
var gameID = -1;

function presentationComplete() {
	
	websocket.onmessage = function(message) {
		
		var data = JSON.parse(message.data);
		
		if (data.TYPE == "GAME_SETTINGS") {
			
			livelliGioco = data.LEVELS;
			
			/*var packetToSend = {
				'TYPE': 'SCREEN_MEASURES',
				'SCREEN_WIDTH': getScreenWidth(),
				'SCREEN_HEIGHT': getScreenHeight()
			}*/
			var packetToSend = {
				'TYPE': 'READY_TO_PLAY',
				'MACHINE_ID': checkAlreadySync()
				//'SCREEN_WIDTH': getScreenWidth(),
			};
			
			websocket.send(JSON.stringify(packetToSend));
		}
		else if (data.TYPE == "START_PRESENTATION") {
			
			presentationManager = new PresentationManager();
			presentationManager.createElements();
			
		}
		else if (data.TYPE == 'START_WORKING') {
			
			gameManager.timeToStart = data.START_TIME;
			allInfosRetrieved();
		}
		else if (data.TYPE == "SCREEN_MEASURES") {
			
			var packetToSend = {
				'TYPE': 'SCREEN_MEASURES',
				'RESULT': true,
				'SCREEN_WIDTH': getScreenWidth(),
				'SCREEN_HEIGHT': getScreenHeight()
			}
				
			websocket.send(JSON.stringify(packetToSend));
		}
		else if (data.TYPE == 'GO_BACK') {
			
			websocket.close();
			location.replace('../patient/index.html');
		}
		else if (data.TYPE == "STOP_GAME") {
			gameManager.gameInProgress = false;
		}
		else if (data.TYPE == "START_TRAINING") {
			
			TrainingExamplesNamespace.startTraining();
		}
		else {
			console.log(data);
			console.log(message);
		}
		
	}
}

function allInfosRetrieved() {

	console.log("allInfosRetrieved");
    gameManager.divMainContent.on('mousedown', function(event) {
        $(this).on('mousemove', touchManagerNamespace.touchOnDiv);
    });
    gameManager.divMainContent.on('mouseup', function(event) {
        $(this).off('mousemove');
        gameManager.touchManagerObject.position.left = -1;
        gameManager.touchManagerObject.position.top = -1;
    })

    setTimeout(function() {
    	manageLevels(false);
    	}, gameManager.timeToStart - new Date().getTime());
    
}

function allExamplesCompleted() {
	
	try{
		
		gameManager.isAnExample = false;
	    $('#divSounds #soundBefore').remove();
	    $('#divSounds #soundAfter').remove();
	    $('#imgArrow').remove();
	    
	    
	    if (!playingWithoutWebSocket) {
		    var packetToSend = {
		    	'TYPE': 'PRESENTATION_COMPLETE'
		    };
		    
		    websocket.send(JSON.stringify(packetToSend));
	    }
	    else {
	    	if (window.requestFileSystem) {
	    		OfflineNamespace.initFolderForGame();
	    	}
	    	else {
	    		offlineSavingWithLocalStorage();
	    	}
	    }
	}
	catch(error) {
		console.log("error in allExamplesCompleted");
		console.log(error);
	}
}

function initGame() {
	
	$('body').css({
		'background-image': 'url(images/sfondo_gioco.jpg)',
		'background-repeat': 'no-repeat',
		'background-size': '100% 100%'
	});

    sacco = new Sacco();
    sacco.element.appendTo('#divMainContent').addClass('saccoTransition');
    sacco.secondElement.appendTo('#divMainContent').addClass('saccoTransition');

    cestino = new Cestino();
    cestino.element.appendTo('#divMainContent');
   
}

function resetLevel() {
	
	sacco.reset();
	gameManager.currentLevelCorrectAnswers = 0;
	$('#divSounds #audioLevel, #divSounds #audioBagComplete, #divSounds #audioObjectNotInserted').remove();
}

function manageLevels(repeatLevel) {

    if (repeatLevel) {
        gameManager.currentLevelRepetition++;

        if (gameManager.currentLevelRepetition > gameManager.maxRepetitionForLevel) {
            gameManager.levelIndex++;
            gameManager.currentLevelRepetition = 1;
        }
    }
    else {
        gameManager.levelIndex++;
        gameManager.currentLevelRepetition = 1;
    }
    gameManager.levelCompletedCorrectly = true;

    if (gameManager.levelIndex < livelliGioco.length && gameManager.gameInProgress) {
    	
    	resetLevel();
    	
        gameManager.currentLevel = livelliGioco[gameManager.levelIndex];

        utilsNamespace.istantiateLevel(gameManager.currentLevel);

        $('#audioLevel').on('ended', function() {
            manageImageObjectsLevel();
        }).get(0).play();

    }
    else {
        // Gioco completato: faccio animazione finale e invio pacchetto
    	if (gameManager.gameInProgress) {
	        var packetEnd = {
	            TYPE: "STOP_GAME"
	        };
	
	        websocket.send(JSON.stringify(packetEnd));
	        
	        gameManager.gameInProgress = false;
    	}
        
    	$('#divSounds #sledCanLeave').on('ended', function() {
    		
    		$('#divSacco').remove();
    		$('#divSaccoMezzo').remove();
    		$('#divCestino').remove();
            
            $('body').css({
            	'background-image': 'url(images/ZZ10042.jpg)'
            });
            
            presentationManager.gnomo.element.css({
            	'visibility': 'visible'
            });
            presentationManager.slitta.element.css({
            	'visibility': 'visible'
            });
            
            setTimeout(function() {
	            $('#divSounds #gnomoSaysGoodbye').on('ended', function() {
	                
	                frameAnimatorNamespace.gnomoReturnsOnSlitta();
	                
	            }).get(0).play();
            }, 1000);
    	
    	}).get(0).play();
    }
}

function manageImageObjectsLevel() {

    gameManager.indexImageObject++;


    if (gameManager.indexImageObject < oggettiPerLivello.length && gameManager.gameInProgress) {
        gameManager.currentImage = oggettiPerLivello[gameManager.indexImageObject];

        // instantiation of a new object on the screen
        
        imageObjectOnScreen = new ImageObjectOnScreen(gameManager.currentImage);
        imageObjectOnScreen.element.appendTo(gameManager.divMainContent);

        gameManager.packetWithResults = new ResultPacket(gameManager.currentLevel.targetFamily);

        gameManager.packetWithResults.IS_TARGET = gameManager.currentImage.target;
        gameManager.packetWithResults.OBJECT_NAME = gameManager.currentImage.name;

        gameManager.timeLastFrame = new Date().getTime();
        
        setTimeout(frameAnimatorNamespace.managerIngressoImmagine, 500);
    }
    else {

        levelComplete();
    }
}

function levelComplete() {

    gameManager.indexImageObject = -1;
    
    if (gameManager.currentLevelCorrectAnswers > gameManager.maxCorrectAnswers) {
    	
    	gameManager.maxCorrectAnswers = gameManager.currentLevelCorrectAnswers;
    }
    
    var packetEndLevel = {
		TYPE: "LEVEL_ENDED"
    };
    
    websocket.send(JSON.stringify(packetEndLevel));
    var levelCompletion = function() { 
	    sacco.element.css({
	    	top: getScreenHeight()
	    }).one('transitionend webkitTransitionEnd oTransitionEnd', function() {
	    	
	    	
	    	setTimeout(function() {
	    		manageLevels(!gameManager.levelCompletedCorrectly);
	    	}, 1000);
	    	
	    });
	    
	    var topSecondElement = getScreenHeight() + 
	    	(sacco.height - sacco.halfBagHeight);
	    
	    sacco.secondElement.css({
	    	top: topSecondElement 
	    });
    }
    
    if ($('#divSounds #audioBagComplete').length != 0) {
    	$('#divSounds #audioBagComplete').on('ended', levelCompletion).get(0).play();
    }
    else {
    	levelCompletion();
    }
    
}

function playGoodAnswerSound() {
	
	var numberOfElements = $('#divSounds #soundsGoodAnswer audio').length;
	
	$('#divSounds #soundsGoodAnswer audio').get(Math.floor(Math.random() * numberOfElements)).play();
}

function playBadAnswerSound() {
	
	var numberOfElements = $('#divSounds #soundsBadAnswer audio').length;
	
	$('#divSounds #soundsBadAnswer audio').get(Math.floor(Math.random() * numberOfElements)).play();
}

/**
 * Function called when an object is inserted inside
 * the bag
 */
function objectInsertedIntoSacco() {

    $('#divMainContent div').hide();
    imageObjectOnScreen.element.remove();

    // It's a target object: CORRECT
    if (gameManager.currentImage.target) {

        gameManager.packetWithResults.RIGHT_ANSWER = true;
        
        gameManager.imageRightAnswer.show();
        gameManager.currentLevelCorrectAnswers++;
        
        playGoodAnswerSound();
    }
    // Not a target object: MISTAKE
    else { 

        gameManager.packetWithResults.RIGHT_ANSWER = false;
        gameManager.levelCompletedCorrectly = false;
        
        gameManager.imageBadAnswer.show();
        
        playBadAnswerSound();
    }

    websocket.send(JSON.stringify(gameManager.packetWithResults))
}

/**
 * Function called when an object is inserted
 * inside the bin or when the time expires
 */
function timeExpired(intoBin) {

    $('#divMainContent div').hide();
    imageObjectOnScreen.element.remove();
    
    if (!intoBin) {
    	gameManager.packetWithResults.COMPLETION_TIME = gameManager.maxTimeObjectOnScreen;
    }

    // Target object not inserted: MISTAKE
    
    if (gameManager.currentImage.target) {

        gameManager.packetWithResults.RIGHT_ANSWER = false;
        gameManager.imageBadAnswer.show();
        gameManager.levelCompletedCorrectly = false;
        
        $('#divSounds #audioObjectNotInserted').get(0).play();
        
    }
    // Not a target object: CORRECT
    else {

        gameManager.packetWithResults.RIGHT_ANSWER = true;
        gameManager.imageRightAnswer.show();
        gameManager.currentLevelCorrectAnswers++;
        playGoodAnswerSound();
    }

    websocket.send(JSON.stringify(gameManager.packetWithResults))
}

function waitingToStart(message) {

    var packet = JSON.parse(message.data);

    if (packet.TYPE == "START_WORKING") {
        gameManager.timeToStart = packet.START_TIME;

        websocket.onmessage = function(message) {
            var packet = JSON.parse(message);
            if (packet.TYPE == "STOP_GAME") {
            	
            }
            else {
                console.log("Bad message received during game: ");
                console.log(packet);
            }
        }

        allInfosRetrieved();
    }
}

function gameIsEnded() {
	
	websocket.close();
	
	setTimeout(function() {
		// suono che fa complimenti al bambino per il suo comportamento??
		
		$('#divSounds #finalFeedback #messoInsieme').on('ended', function() {
			
			$('#divSounds #finalFeedback #numberOfObjects #correct' + gameManager.maxCorrectAnswer).on('ended', function() {
				
				$('#divSounds #finalFeedback #oggettiAssomigliano').on('ended', function() {
					
					setTimeout(function() {
						location.replace('../patient/index.html');
					}, 1000);
				}).get(0).play();
			}).get(0).play();
			
		}).get(0).play();
		
		
	}, 500);
	
}

function manageOnCloseWebsocket(e) {

    console.log("Websocket works offline");
    playingWithoutWebSocket = true;
    
    websocket = new Object();
	websocket.send = function() {};
	websocket.close = function() {
		websocket = null;
	}

    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    if (window.requestFileSystem){
	    window.webkitStorageInfo.requestQuota(window.PERSISTENT, 10*1024*1024, function(grantedBytes) {
	
	        window.requestFileSystem(window.PERSISTENT, grantedBytes, OfflineNamespace.initFs, function(error) {
	            console.log("No space received");
	        })
	    }, function(error) {
	        console.log("No space allowed");
	        console.log(error);
	    });
    }
    else {
    	console.log("No storage supported");
    	
    	localFileSystemInitializationComplete();
    }
}

function offlineJobs() {
	
	var fieldWhereGet = "HELPME_SETTINGS_" + getFromSessionStorage("patientID");
	var levelString = getFromLocalStorage(fieldWhereGet);
	
	if (levelString != "") {
		livelliGioco = JSON.parse(levelString);
		presentationManager = new PresentationManager();
		presentationManager.createElements();
	}
	else {
		console.log("no configuration saved");
	}
}

function localFileSystemInitializationComplete() {

	if (getFromSessionStorage("permission") == "PATIENT") {
		
		if (getFromSessionStorage("patientID")) {
			patientID = getFromSessionStorage("patientID");
		}
		else {
			patientID = "1";
		}
		
		// richiesta delle impostazioni di gioco
		
		if (navigator.onLine) {
			
			try {
				$.ajax({
					url: SERVER_ADDRESS + '/server/GetLevelsHelpMe.php',
					type: "POST",
					data: {
						patientID: patientID
					},
					success: function(data) {
						
						livelliGioco = JSON.parse(data);
						
						var fieldWhereSave = "HELPME_SETTINGS_" + patientID;
						saveInLocalStorage(fieldWhereSave, data);
						
						// x saltare presentazione
						/*presentationManager = new PresentationManager();
						presentationManager.createElements();*/
						try {
							initGame();
							allExamplesCompleted();
							//presentationManager = new PresentationManager();
							//presentationManager.createElements();
						}
						catch(error) {
							console.log("Errore in localFileSystemInitializationComplete");
							console.log(error);
						}
					},
					error: function() {
						
						offlineJobs();
					}
				});
			}
			catch(e) {
				offlineJobs();
			}
		}
		else {
			offlineJobs();
		}
	}
}

function folderForOfflineSavingCreated() {

    offlineObjectManager.folderWhereWrite.getFile('packets.txt', {create: true}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

            offlineObjectManager.fileWriterPackets = fileWriter;

            websocket.send = manageWriteOffline;
            
            var firstPacket = {
            	"GAME": gameIdentification,
            	"PATIENT_ID": patientID
            };
                
            websocket.send(JSON.stringify(firstPacket));

           // presentationComplete();
            //utilsNamespace.retrieveLevels();
            gameManager.timeToStart = new Date().getTime() + 5000;
            allInfosRetrieved();

        }, function(error) {
            console.log("Error in creating packets.txt");
            console.log(error);
        });
    })
}

function offlineSavingWithLocalStorage() {
	
	console.log("offlineSavingWithLocalStorage");
	console.log(websocket);
	folderNameLocalStorage = OfflineNamespace.createFolderForOfflineWithLocalStorage();
	
	gameManager.timeToStart = new Date().getTime() + 5000;
	
	websocket.send = manageWriteOfflineWithLocalStorage;
	
	var firstPacket = {
    	"GAME": gameIdentification,
    	"PATIENT_ID": patientID
    };
        
    websocket.send(JSON.stringify(firstPacket));
    
    gameManager.timeToStart = new Date().getTime() + 3000;
    allInfosRetrieved();
    
}

function manageWriteOffline(data) {
	
	stringForOfflineGame = stringForOfflineGame + data + "\n";
	
	var object = JSON.parse(data);
	
	if (object.SUBTYPE == "SESSION_RESULTS" || object.TYPE == "STOP_GAME"){
		
		offlineObjectManager.fileWriterPackets.seek(offlineObjectManager.fileWriterPackets.length);

	    var bb = new Blob([stringForOfflineGame], {type: 'text/plain'});

	    offlineObjectManager.fileWriterPackets.write(bb);
	    
	    stringForOfflineGame = "";
	}
}

function manageWriteOfflineWithLocalStorage(data) {

	stringForOfflineGame = stringForOfflineGame + data + "\n";
	totalPacketsIntoStringForOffline++;
	
	var packet = JSON.parse(data);
	
	if (totalPacketsIntoStringForOffline > 250 || packet.SUBTYPE == "SESSION_RESULTS" ) {
		
		var stringAlreadyInserted = getFromLocalStorage(folderNameLocalStorage);
		
		saveInLocalStorage(folderNameLocalStorage, stringAlreadyInserted + stringForOfflineGame);
		stringForOfflineGame = "";
		totalPacketsIntoStringForOffline = 0;
	}
	
	if (packet.TYPE == "STOP_GAME") {
		
		var stringAlreadyInserted = getFromLocalStorage(folderNameLocalStorage);
		saveInLocalStorage(folderNameLocalStorage, stringAlreadyInserted + stringForOfflineGame);
		
	}
}

function readFile() {

    offlineObjectManager.folderWhereWrite.getFile('packets.txt', {}, function(fileEntry) {

        fileEntry.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
                console.log(this.result);
            }

            reader.readAsText(file);
        })
    });
}

function presentationEnded() {
	
	$('#divMainContent').children().css({'visibility': 'hidden'});
	$('body').css({
		'background-image': 'url(images/sfondo_gioco.jpg)'
	});
	ExampleNamespace.prepareExamples();
}

$(document).ready(function() {

	/*$('<img>').attr('src', '../images/preloader.gif')
	.attr('id', 'preloaderWaitingCache').prependTo('body');
	
	var appCache = window.applicationCache;
	
	appCache.addEventListener('updateready', cacheUpdateReady, false);
	appCache.addEventListener('cached', operationsCacheFinished, false);
	appCache.addEventListener('noupdate', operationsCacheFinished, false);
	appCache.addEventListener('error', operationsCacheFinished, false);
	appCache.addEventListener('obsolete', operationsCacheFinished, false);
	appCache.addEventListener('progress', progressFunctionCache, false);
	
	try {
		appCache.update();
	}
	catch(e) {
		operationsCacheFinished(e);
	}*/
    initPage();
});

function initPage() {

	$('#preloaderWaitingCache').remove();

    gameManager.divMainContent = $('#divMainContent').width(getScreenWidth())
    	.height(getScreenHeight()).css('overflow', 'hidden');

    gameManager.getSystemImages();
    gameManager.getSystemSounds();
    //utilsNamespace.retrieveLevels();
    utilsNamespace.getImagesFromSettings();
    //utilsNamespace.retrieveLevels();
};
