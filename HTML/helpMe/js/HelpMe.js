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
			console.log("Settings received");
			console.log(livelliGioco);
			
			var packetToSend = {
				'TYPE': 'SCREEN_MEASURES',
				'SCREEN_WIDTH': getScreenWidth(),
				'SCREEN_HEIGHT': getScreenHeight()
			}
			
			websocket.send(JSON.stringify(packetToSend));
		}
		else if (data.TYPE == "START_PRESENTATION") {
			
			presentationManager = new PresentationManager();
			presentationManager.createElements();
			
			var packetToSend = {
				'TYPE': 'READY_TO_PLAY',
				'MACHINE_ID': checkAlreadySync()
			};
			
			websocket.send(JSON.stringify(packetToSend));
			
		}
		else if (data.TYPE == 'START_WORKING') {
			
			gameManager.timeToStart = data.START_TIME;
			allInfosRetrieved();
		}
		else if (data.TYPE == 'GO_BACK') {
			
			websocket.close();
			location.replace('../patient/index.html');
		}
		else if (data.TYPE == "STOP_GAME") {
			gameManager.gameInProgress = false;
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
	    		console.log(OfflineNamespace);
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
	$('#divSounds #audioLevel, #divSounds #audioBagComplete, #divSounds #audioObjectNotInserted').remove();
}

function manageLevels(repeatLevel) {

    if (repeatLevel) {
        gameManager.currentLevelRepetition++;

        if (gameManager.currentLevelRepetition > gameManager.maxRepetitionForLevel) {
            gameManager.levelIndex++;
            gameManager.currentLevelRepetition = 1;
            gameManager.levelCompletedCorrectly = true;
        }
    }
    else {
        gameManager.levelIndex++;
        gameManager.currentLevelRepetition = 1;
        gameManager.levelCompletedCorrectly = true;
    }

    if (gameManager.levelIndex < livelliGioco.length && gameManager.gameInProgress) {
    	
    	resetLevel();
    	
        gameManager.currentLevel = livelliGioco[gameManager.levelIndex];

        utilsNamespace.istantiateLevel(gameManager.currentLevel);
        gameManager.currentLevelRepetition = 1;

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
	            	var time = new Date().getTime();
	                presentationManager.timeLastFrame = time + 1000;
	                presentationManager.currentAnimationFrame = 
	                	window.requestAnimationFrame(frameAnimatorNamespace.gnomoReturnsOnSlitta);
	            }).get(0).play();
            }, 1000);
    	
    	}).get(0).play();
    }
}

function manageImageObjectsLevel() {

    gameManager.indexImageObject++;


    if (gameManager.indexImageObject < oggettiPerLivello.length) {
        gameManager.currentImage = oggettiPerLivello[gameManager.indexImageObject];

        // istanzio oggetto visualizzato sullo schermo
        imageObjectOnScreen = new ImageObjectOnScreen(gameManager.currentImage);
        imageObjectOnScreen.element.appendTo(gameManager.divMainContent);

        gameManager.packetWithResults = new ResultPacket(gameManager.currentLevel.targetFamily);

        gameManager.packetWithResults.IS_TARGET = gameManager.currentImage.target;
        gameManager.packetWithResults.OBJECT_NAME = gameManager.currentImage.name;

        gameManager.timeLastFrame = new Date().getTime();
        //gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);
        setTimeout(frameAnimatorNamespace.managerIngressoImmagine, 500);
    }
    else {
        // livello completato

        levelComplete();
    }
}

function levelComplete() {

    // Livello completato
    gameManager.indexImageObject = -1;
    
    var packetEndLevel = {
		TYPE: "LEVEL_ENDED"
    };
    
    websocket.send(JSON.stringify(packetEndLevel));
    
    sacco.element.css({
    	top: getScreenHeight()
    }).one('transitionend webkitTransitionEnd oTransitionEnd', function() {
    
    		// livello completato correttamente
        manageLevels(!gameManager.levelCompletedCorrectly);
    
    });
    
    sacco.secondElement.css({
    	top: getScreenHeight()
    });
    
}

function reproduceGoodAnswerSound() {
	
	var numberOfElements = $('#divSounds #soundsGoodAnswer audio').length;
	
	$('#divSounds #soundsGoodAnswer audio').get(Math.floor(Math.random() * numberOfElements)).play();
}

function reproduceBadAnswerSound() {
	
	var numberOfElements = $('#divSounds #soundsBadAnswer audio').length;
	
	$('#divSounds #soundsBadAnswer audio').get(Math.floor(Math.random() * numberOfElements)).play();
}

/**
 * Function chiamata quando un oggetto è stato inserito nel sacco
 */
function objectInsertedIntoSacco() {

    $('#divMainContent div').hide();
    imageObjectOnScreen.element.remove();

    // E' oggetto target: CORRETTO
    if (gameManager.currentImage.target) {

        gameManager.packetWithResults.RIGHT_ANSWER = true;
        // Visualizzo immagine e suono corretto
        gameManager.imageRightAnswer.show();
        
        // scelgo tra tutti i suoni a disposizione di risposta
        // positiva uno a caso e lo riproduco
        reproduceGoodAnswerSound();
    }
    else { // Non era oggetto target: ERRORE

        gameManager.packetWithResults.RIGHT_ANSWER = false;
        gameManager.levelCompletedCorrectly = false;
        
        gameManager.imageBadAnswer.show();
        // scelgo tra tutti i suoni a diposizione uno 
        // per la risposta sbagliata
        reproduceBadAnswerSound();
    }

    websocket.send(JSON.stringify(gameManager.packetWithResults))
}

/**
 * Function chiamata quando un oggetto non viene inserito dentro il sacco entro
 * il tempo massimo a disposizione
 */
function timeExpired(intoBin) {

    $('#divMainContent div').hide();
    imageObjectOnScreen.element.remove();
    
    if (!intoBin) {
    	gameManager.packetWithResults.COMPLETION_TIME = gameManager.maxTimeObjectOnScreen;
    }

    // Non ha inserito un oggetto target all'interno
    // del sacco: ERRORE
    if (gameManager.currentImage.target) {

        gameManager.packetWithResults.RIGHT_ANSWER = false;
        gameManager.imageBadAnswer.show();
        gameManager.levelCompletedCorrectly = false;
        
        $('#divSounds #audioObjectNotInserted').get(0).play();
        
    }
    else {
        // Non ha inserito un oggetto non target
        // dentro il sacco: corretto

        gameManager.packetWithResults.RIGHT_ANSWER = true;
        gameManager.imageRightAnswer.show();
        reproduceGoodAnswerSound();
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
		location.replace('../patient/index.html')
	}, 2000);
	
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

function localFileSystemInitializationComplete() {

	if (getFromSessionStorage("permission") == "PATIENT") {
		
		if (getFromSessionStorage("patientID")) {
			patientID = getFromSessionStorage("patientID");
		}
		else {
			patientID = "1";
		}
		
		// richiesta delle impostazioni di gioco
		console.log("Sending request");
		
		$.ajax({
			url: '../server/GetLevelsHelpMe.php',
			type: "POST",
			data: {
				patientID: patientID
			},
			success: function(data) {
				
				livelliGioco = JSON.parse(data);
				
				// x saltare presentazione
				/*presentationManager = new PresentationManager();
				presentationManager.createElements();*/
				try {
					initGame();
					allExamplesCompleted();
					/*presentationManager = new PresentationManager();
					presentationManager.createElements();*/
				}
				catch(error) {
					console.log("Errore in localFileSystemInitializationComplete");
					console.log(error);
				}
			}
			
		});
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

$('document').ready(function() {

    gameManager.divMainContent = $('#divMainContent').width(getScreenWidth())
    	.height(getScreenHeight()).css('overflow', 'hidden');

    gameManager.getSystemImages();
    gameManager.getSystemSounds();
    //utilsNamespace.retrieveLevels();
    utilsNamespace.getImagesFromSettings();
    //utilsNamespace.retrieveLevels();
});
