
var frameAnimatorNamespace = {

	// Si occupa di far entrare il tubo all'interno dello schermo a partire dall'alto
	// e successivamente, una volta arrivato in posizione, si occupa di farlo tornare indietro
    managerMovimentoTubo: function(time) {

        gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerMovimentoTubo);
        var delta = time - gameManager.timeLastFrame; 
        if (delta > 30) {
	        if (!tubo.goBack) {
	            if (tubo.incremenentHeight(delta)) {
	                tubo.goBack = true;
	                window.cancelRequestAnimationFrame(gameManager.currentAnimationFrame);
	                gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);
	            }
	        }
	        else {
	            if (tubo.decrementHeight(delta)) {
	                window.cancelRequestAnimationFrame(gameManager.currentAnimationFrame);
	                frameAnimatorNamespace.startRealGame();
	            }
	        }
	        gameManager.timeLastFrame = time;
        }
    },

    // si occupa di gestire l'ingresso dell'immagine all'interno dello schermo
    // tenendola nascosta fino a quando non supera il tubo e poi ingrandendola
    // fino a quando non arriva al centro dello schermo
    managerIngressoImmagine: function(time) {

        gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);

        var delta = time - gameManager.timeLastFrame;
        if (delta > 1000 / 25) {
        	
        	imageObjectOnScreen.moveObject(delta, false);
        	imageObjectOnScreen.scaleObject(delta);
        	if (imageObjectOnScreen.center.top < imageObjectOnScreen.targetCenter.top && 
        			imageObjectOnScreen.center.left < imageObjectOnScreen.targetCenter.left) {
        		
        		window.cancelRequestAnimationFrame(gameManager.currentAnimationFrame);
                gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.startRealGame);
        	}
	        gameManager.timeLastFrame = time;
        }
    },

    // visualizza barra del tempo di gioco +
    // registra eventi tocco +
    // inizia requestAnimationFrame per il gioco
    startRealGame: function() {

    	// Se non è un esempio faccio entrare la barra del tempo
    	// + registro eventi per gestire tocco sull'immagine
        if (!gameManager.isAnExample) {
            //barraTempo.element.fadeIn(1500, function(){

            imageObjectOnScreen.element.draggable({
                start: touchManagerNamespace.touchStart,
                drag: touchManagerNamespace.touchMove,
                stop: touchManagerNamespace.touchEnd
                });

            gameManager.startTimeObjectOnScreen = new Date().getTime();
            gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.realGameManager);
            //});
        }
        else {

            if (exampleManager.currentExample.insertIntoSacco) {
                if (exampleManager.currentExample.withHelp) {
                    exampleManager.arrow = $(exampleManager.arrowImage).attr('id', 'imgArrow').appendTo('#divMainContent');
                    var bottomPositionImage = imageObjectOnScreen.drawingPosition.top + imageObjectOnScreen.height;
                    exampleManager.arrow.width(imageObjectOnScreen.element.width() / 3);
                    exampleManager.arrowStartingHeight = sacco.center.top - bottomPositionImage;
                    exampleManager.arrow.height(exampleManager.arrowStartingHeight);
                    exampleManager.arrow.css({
                        position: 'absolute',
                        top: bottomPositionImage,
                        left: imageObjectOnScreen.center.left - exampleManager.arrow.width() / 2,
                        'z-index': 200
                    });
                }
                if ($('#divSounds #soundBefore').length > 0) {

                    $('#divSounds #soundBefore').on('ended', function() {
                    	gameManager.timeLastFrame = new Date().getTime();
                        gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveExampleIntoSacco);
                    }).get(0).play();

                }
                else {
                	gameManager.timeLastFrame = new Date().getTime();
                    gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveExampleIntoSacco);
                }
            }
            else {
                setTimeout(function() {

                    ExampleNamespace.exampleCompleted();
                }, 1000);
            }
        }
    },

    moveExampleIntoSacco: function(time) {

        gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveExampleIntoSacco);

        var delta = time - gameManager.timeLastFrame;
        if (delta > 1000 / 50) {
	        imageObjectOnScreen.moveObject(delta, true);
	
	        if (exampleManager.arrow != null) {
	        	
	        	exampleManager.reduceArrowHeight(delta);
	
	            if (exampleManager.arrow.height() < 0) {
	                exampleManager.arrow.remove();
	                exampleManager.arrow = null;
	            }
	        }
	
	        if (imageObjectOnScreen.drawingPosition.top > sacco.center.top) {
	            window.cancelRequestAnimationFrame(gameManager.currentAnimationFrame);
	            imageObjectOnScreen.element.remove();
	
	            ExampleNamespace.exampleCompleted();
	        }
	        gameManager.timeLastFrame = time; 
        }
    },

    // ticker che si occupa della gestione del gioco mentre c'è immagine
    // che deve essere inserita nel sacco
    realGameManager: function(time) {

        gameManager.currentAnimationFrame = 
            window.requestAnimationFrame(frameAnimatorNamespace.realGameManager);

        if (time - gameManager.lastTimeMessageSent > gameManager.maxSensibility) {
            var packetPositions = {
                TYPE: 'GAME_DATA',
                SUBTYPE: 'POSITIONS',
                TIME: time - gameManager.timeToStart,
                IMAGE: [imageObjectOnScreen.center.left, imageObjectOnScreen.center.top],
                TOUCH: [gameManager.touchManagerObject.position.left, gameManager.touchManagerObject.position.top]
            };

            if (websocket != null) {
                websocket.send(JSON.stringify(packetPositions));
            }

            gameManager.lastTimeMessageSent = time;
        }

        // riduce la dimensione della barra in relazione al tempo passato ed a quello massimo di attesa
        if (!imageObjectOnScreen.moveInsideSacco) {
            var elapsedTime = time - gameManager.startTimeObjectOnScreen;

            //barraTempo.timeIsPassing(elapsedTime / gameManager.maxTimeObjectOnScreen);

            if (elapsedTime >= gameManager.maxTimeObjectOnScreen) {
                window.cancelRequestAnimationFrame(gameManager.currentAnimationFrame);
                // devo richiamare funzione per fine tempo
                timeExpired();
            }
        }
        else {
        	
        	var delta = time - gameManager.timeLastFrame;

            imageObjectOnScreen.moveObjectIntoSacco(delta);
            if (imageObjectOnScreen.drawingPosition.top > sacco.drawingPosition.top) {

                window.cancelRequestAnimationFrame(gameManager.currentAnimationFrame);
                objectInsertedIntoSacco();
            }
        }
    },
    
    functionMoveGnomo: function(currentTime) {
	    presentationManager.currentAnimationFrame = 
	        window.requestAnimationFrame(frameAnimatorNamespace.functionMoveGnomo);
	    
	    var delta = currentTime - presentationManager.timeLastFrame;
	    if (delta > 1000 / 50) {
	        if (!presentationManager.gnomo.moveRight) {
	            if (presentationManager.slitta.left + presentationManager.slitta.width * 2
	                > 0) {	                
	                presentationManager.gnomo.increaseDimensions(delta);
	                presentationManager.gnomo.moveElement(true, delta);
	                presentationManager.slitta.increaseDimensions(delta);
	                presentationManager.slitta.moveElement();
	                presentationManager.gnomo.drawElement();
	                presentationManager.slitta.drawElement();
	                presentationManager.timeLastFrame = currentTime;
	            }
	            else {
	                presentationManager.gnomo.moveRight = true;
	                presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFileBack);
	                presentationManager.totalDistanceLeft = getScreenWidth() + presentationManager.slitta.left;
	            }
	        }
	        else {
	            
	            if (presentationManager.slitta.left < getScreenWidth()) {
	            	
	            	presentationManager.gnomo.increaseDimensions(delta);
	                presentationManager.gnomo.moveElement(false, delta);
	                presentationManager.slitta.increaseDimensions(delta);
	                presentationManager.slitta.moveElement();
	                presentationManager.gnomo.drawElement();
	                presentationManager.slitta.drawElement();
	                presentationManager.timeLastFrame = currentTime;
	            }
	            else {
	                window.cancelRequestAnimationFrame(presentationManager.currentAnimationFrame);
	                
	                
	                presentationManager.gnomo.currentScale = presentationManager.gnomo.targetScale;
	                presentationManager.gnomo.width = presentationManager.gnomo.targetWidth;
	                presentationManager.gnomo.height = presentationManager.gnomo.targetHeight;
	                
	                var screenPart = getScreenHeight() / 4;
	                var half = screenPart / 2;
	                var positionInPart = half - presentationManager.gnomo.height / 2;
	                presentationManager.gnomo.top = screenPart * 2 + positionInPart;
	                
	                presentationManager.slitta.currentScale = presentationManager.slitta.targetScale;
	                presentationManager.slitta.width = presentationManager.slitta.targetWidth;
	                presentationManager.slitta.height = presentationManager.slitta.targetHeight;
	                presentationManager.slitta.moveElement();
	                presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFile);
	                
	                presentationManager.gnomo.drawElement();
	                presentationManager.slitta.drawElement();
	                
	                presentationManager.totalDistanceTop = 0;
	                presentationManager.totalDistanceLeft = presentationManager.slitta.left + 
	                	presentationManager.slitta.width;
	                
	                presentationManager.currentAnimationFrame = 
	                    window.requestAnimationFrame(frameAnimatorNamespace.moveGnomoToCenter);
	            }
	        }
	    }
	},

    moveGnomoToCenter: function(time) {
    
    presentationManager.currentAnimationFrame = 
        window.requestAnimationFrame(frameAnimatorNamespace.moveGnomoToCenter);
    
    var delta = time - presentationManager.timeLastFrame;
    if (delta > 1000 / 50) {
        if (!presentationManager.gnomo.arrivedToCenter) {

            var distance = presentationManager.gnomo.left - 
                (getScreenWidth() / 2 - presentationManager.gnomo.width / 2);
            
            if (distance > 0) {

                if (distance < 100 && distance > 30) {
                    $('#audioFrenata').get(0).play();
                    presentationManager.timeToPerformMovement = 
                        (distance * 500);
                    presentationManager.distanceModified = true;
                }
                
                presentationManager.gnomo.moveElement(true, delta)
                presentationManager.slitta.moveElement();
                presentationManager.gnomo.drawElement();
                presentationManager.slitta.drawElement();
                presentationManager.timeLastFrame = time;
            }
            else {
                presentationManager.gnomo.arrivedToCenter = true;
                time += 500;
                presentationManager.timeLastFrame = time;
            }
        }
        else {
            presentationManager.gnomo.element.css({'z-index': 3});
            if (presentationManager.angleForJump < Math.PI) {
                presentationManager.angleForJump += 0.3;
                presentationManager.gnomo.top += Math.sin(presentationManager.angleForJump) * 10;
                presentationManager.gnomo.drawElement();
            }
            else {
                window.webkitCancelRequestAnimationFrame(presentationManager.currentAnimationFrame);
                $('#audioIntroduzione').on('ended', function() {
                    console.log("Completed");
                    $('#divMainContent').children().css({
                    	visibility: 'hidden'
                    });
                    presentationEnded();
                    /*setTimeout(function() {
                    	presentationManager.timeLastFrame = new Date().getTime();	
                    	presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.gnomoReturnsOnSlitta);
                    });*/
                    //ExampleNamespace.prepareExamples();
                }).get(0).play();
            }
        }
    }
}, 

	gnomoReturnsOnSlitta: function(time) {
		
		presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.gnomoReturnsOnSlitta);
		
		$('#divMainContent').children().css({
			visibility: 'visible'
		});
		
		var delta = time - presentationManager.timeLastFrame; 
		if (delta > 1000 / 50) {
			
			if (presentationManager.angleForJump > 0) {
				presentationManager.angleForJump -= 0.3;
				presentationManager.gnomo.top -= Math.sin(presentationManager.angleForJump) * 10;
				presentationManager.gnomo.drawElement();
			}
			else {
				presentationManager.gnomo.element.css({'z-index': 1});
            	presentationManager.slitta.element.css({'z-index': 2});
            	
            	window.cancelRequestAnimationFrame(presentationManager.currentAnimationFrame);
            	presentationManager.totalDistanceTop = 0;
            	presentationManager.totalDistanceLeft = presentationManager.slitta.left + presentationManager.slitta.width;
            	presentationManager.timeToPerformMovement = 1000;
            	
            	// Attendo 1 secondo prima di far partire la slitta
            	presentationManager.timeLastFrame = new Date().getTime() + 1000;
            	presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveSlittaOutside)
            	
			}
		}
	},
	
	moveSlittaOutside: function(time) {
		
		presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveSlittaOutside);
		
		var delta = time - presentationManager.timeLastFrame;
		if (delta > 1000 / 50) {
			if (presentationManager.slitta.left + presentationManager.slitta.width > 0) {
				
				presentationManager.gnomo.moveElement(true, delta);
				presentationManager.slitta.moveElement();
				presentationManager.gnomo.drawElement();
				presentationManager.slitta.drawElement();
			}
			else {
				
				presentationManager.gnomo.top = getScreenHeight() / 3;
				presentationManager.gnomo.currentScale = presentationManager.gnomo.currentScale / 4;
				presentationManager.slitta.currentScale = presentationManager.slitta.currentScale / 4;
				
				presentationManager.slitta.moveElement();
				presentationManager.gnomo.drawElement();
				presentationManager.slitta.drawElement();
				
				
				window.cancelRequestAnimationFrame(presentationManager.currentAnimationFrame);
				presentationManager.totalDistanceTop = - presentationManager.slitta.top + presentationManager.slitta.height;
				presentationManager.totalDistanceLeft = getScreenWidth() - presentationManager.slitta.left + presentationManager.slitta.width;
				presentationManager.totalScaleFactorIncrease = 0 - (presentationManager.slitta.currentScale);
				presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFileBack);
				presentationManager.timeLastFrame = new Date().getTime();
				presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveSlittaToCenterForAway);
			}
			
			presentationManager.timeLastFrame = time;
		}
	},
	
	moveSlittaToCenterForAway: function(time) {
		
		presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveSlittaToCenterForAway);
		
		var delta = time - presentationManager.timeLastFrame;
		if (delta > 1000 / 50) {
			
			if (presentationManager.slitta.left <= getScreenWidth()) {
			
				presentationManager.gnomo.increaseDimensions(delta);
				presentationManager.gnomo.moveElement(false, delta);
				presentationManager.slitta.increaseDimensions(delta);
				presentationManager.slitta.moveElement();
				presentationManager.gnomo.drawElement();
				presentationManager.slitta.drawElement();
			}
			else {
				
				window.cancelRequestAnimationFrame(presentationManager.currentAnimationFrame);
				gameIsEnded();
			}
			
			presentationManager.timeLastFrame = time;
		}
	}

};