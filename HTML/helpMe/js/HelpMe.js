var tubo = null;
var sacco = null;
var barraTempo = null;
var imageObjectOnScreen = null;
var immaginiADisposizione = {};
var livelliGioco = [];
var oggettiPerLivello = [];
var gameManager = new GameManager();
var exampleManager = new ExampleNamespace.ExamplesManager();
var presentationManager = null;

var port = 8001;
var gameIdentification = "HELP_ME";
var identificationType = 'GAME_CLIENT';
var patientID = '1';
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
	gameManager.isAnExample = false;
    $('#divSounds #soundBefore').remove();
    $('#divSounds #soundAfter').remove();
    $('#imgArrow').remove();
    
    var packetToSend = {
    	'TYPE': 'PRESENTATION_COMPLETE'
    };
    
    websocket.send(JSON.stringify(packetToSend));
}

function initGame() {
	
	$('body').css({
		'background-image': 'url(images/sfondo_gioco.jpg)',
		'background-repeat': 'no-repeat',
		'background-size': '100% 100%'
	});

    sacco = new Sacco();
    sacco.element.appendTo('#divMainContent');

    barraTempo = new BarraTempo();
    barraTempo.element.appendTo('#divMainContent');
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
        
        $('#divSacco, #divBarraTempo').remove();
        
        $('body').css({
        	'background-image': 'url(images/ZZ10042.jpg)'
        });
        
        presentationManager.gnomo.element.css({
        	'visibility': 'visible'
        });
        presentationManager.slitta.element.css({
        	'visibility': 'visible'
        });
        
        var time = new Date().getTime();
        presentationManager.timeLastFrame = time + 1000;
        presentationManager.currentAnimationFrame = 
        	window.requestAnimationFrame(frameAnimatorNamespace.gnomoReturnsOnSlitta);
        
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
        //tubo.reset();
        barraTempo.reset();

        gameManager.timeLastFrame = new Date().getTime();
        gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);
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
    
    sacco.element.addClass('saccoTransition');
    sacco.css({
    	top: getScreenHeight()
    }).one('transitionend webkitTransitionEnd oTransitionnd', function() {
    	if (gameManager.levelCompletedCorrectly) {
            // chiudo sacco e 
        	// posso farlo uscire verso sotto
        	// al livello successivo torna su
            manageLevels(false);
        }
        else {
            manageLevels(true);
        }
    })
    
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
        $('#audioGoodAnswer').get(0).play();
        gameManager.imageRightAnswer.show();

    }
    else { // Non era oggetto target: ERRORE

        gameManager.packetWithResults.RIGHT_ANSWER = false;
        $('#audioBadAnswer').get(0).play();
        gameManager.imageBadAnswer.show();
        gameManager.levelCompletedCorrectly = false;
    }

    websocket.send(JSON.stringify(gameManager.packetWithResults))
}

/**
 * Function chiamata quando un oggetto non viene inserito dentro il sacco entro
 * il tempo massimo a disposizione
 */
function timeExpired() {

    $('#divMainContent div').hide();
    imageObjectOnScreen.element.remove();
    gameManager.packetWithResults.FIRST_RESPONSE_TIME = 0;
    gameManager.packetWithResults.COMPLETION_TIME = gameManager.maxTimeObjectOnScreen;

    // Non ha inserito un oggetto target all'interno
    // del sacco: ERRORE
    if (gameManager.currentImage.target) {

        gameManager.packetWithResults.RIGHT_ANSWER = false;
        $('#audioBadAnswer').get(0).play();
        gameManager.imageBadAnswer.show();
        gameManager.levelCompletedCorrectly = false;
    }
    else {
        // Non ha inserito un oggetto non target
        // dentro il sacco: corretto

        gameManager.packetWithResults.RIGHT_ANSWER = true;
        $('#audioGoodAnswer').get(0).play();
        gameManager.imageRightAnswer.show();
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
	setTimeout(location.replace('../patient/index.html'), 2000);
}

function manageOnCloseWebsocket(e) {
    console.log("Websocket works offline");

    //TODO: da rimuovere a regime
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

    window.webkitStorageInfo.requestQuota(window.PERSISTENT, 10*1024*1024, function(grantedBytes) {

        window.requestFileSystem(window.PERSISTENT, grantedBytes, OfflineNamespace.initFs, function(error) {
            console.log("No space received");
        })
    }, function(error) {
        console.log("No space allowed");
        console.log(error);
    });
}

function localFileSystemInitializationComplete() {
    OfflineNamespace.initFolderForGame();
}

function folderForOfflineSavingCreated() {

    offlineObjectManager.folderWhereWrite.getFile('packets.txt', {create: true}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

            offlineObjectManager.fileWriterPackets = fileWriter;

            websocket.send = manageWriteOffline;

            presentationComplete();
            //utilsNamespace.retrieveLevels();
            gameManager.timeToStart = new Date().getTime() + 1000;
            allInfosRetrieved();

        }, function(error) {
            console.log("Error in creating packets.txt");
            console.log(error);
        });
    })
}

function manageWriteOffline(data) {

    offlineObjectManager.fileWriterPackets.seek(offlineObjectManager.fileWriterPackets.length);

    var bb = new Blob([data + "\r\n"], {type: 'text/plain'});

    offlineObjectManager.fileWriterPackets.write(bb);

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

    gameManager.divMainContent = $('#divMainContent').width(getScreenWidth()).height(getScreenHeight()).css('overflow', 'hidden');

    gameManager.getSystemImages();
    gameManager.getSystemSounds();
    utilsNamespace.retrieveLevels();
    utilsNamespace.getImagesFromSettings();
    //utilsNamespace.retrieveLevels();
});
