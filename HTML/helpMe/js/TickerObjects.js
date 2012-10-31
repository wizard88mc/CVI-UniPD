
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
	                window.cancelAnimationFrame(gameManager.currentAnimationFrame);
	                gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);
	            }
	        }
	        else {
	            if (tubo.decrementHeight(delta)) {
	                window.cancelAnimationFrame(gameManager.currentAnimationFrame);
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
    	
    	var transition = 'all ' + imageObjectOnScreen.timeForMovingToCenter / 1000 +'s linear';
    	
    	//console.log(imageObjectOnScreen.element.position());
    	//	console.log(imageObjectOnScreen.targetPoint);
    	
    	imageObjectOnScreen.element.on('transitionend webkitTransitionEnd oTransitionEnd', function(event) {
    		
    		if (event.originalEvent.propertyName === "left") {
    			
    			$(this).off('transitionend webkitTransitionEnd oTransitionEnd');
    			$(this).css({
    				transition: 'none',
    				'-webkit-transition': 'none'
    			});
    			
    			imageObjectOnScreen.arrivedAtCenter();
    			
    			frameAnimatorNamespace.startRealGame();
    		}
    	}).css({
    		transition: transition,
    		'-webkit-transition': transition,
    		width: imageObjectOnScreen.targetWidth,
    		height: imageObjectOnScreen.targetHeight, 
    		left: imageObjectOnScreen.targetPoint.left,
    		top: imageObjectOnScreen.targetPoint.top
    	});
    	
    	
        /*gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);

        var delta = time - gameManager.timeLastFrame;
        if (delta > 1000 / 25) {
        	
        	imageObjectOnScreen.moveObject(delta, false);
        	imageObjectOnScreen.scaleObject(delta);
        	if (imageObjectOnScreen.center.top < imageObjectOnScreen.targetCenter.top && 
        			imageObjectOnScreen.center.left < imageObjectOnScreen.targetCenter.left) {
        		
        		imageObjectOnScreen.scaleObject(0);
        		window.cancelAnimationFrame(gameManager.currentAnimationFrame);
                gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.startRealGame);
        	}
	        gameManager.timeLastFrame = time;
        }*/
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

            // devo aggiungere gestione evento mouseMove +
            // mouselick x il sacco mezzo e nel caso in cui
            // la posizione del mouse sia dentro oggetto giro 
            // evento a suo gestore (evento deve essere tocco + sposto)
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
                /*setTimeout(function() {

                    ExampleNamespace.exampleCompleted();
                }, 1000);*/
            		
        		var objectTransition = function() {            		
	            	imageObjectOnScreen.element.one('transitionend webkitTransitionEnd oTransitionEnd', function() {
	        			
	            		imageObjectOnScreen.element.one('transitionend webkitTransitionEnd oTransitionEnd', function() {
	            			
	            			ExampleNamespace.exampleCompleted();
	            		});
	            		
	            		imageObjectOnScreen.element.css({
	                		'transition': 'all 2s linear',
	                		'-moz-transition': 'all 2s linear',
	                		'-webkit-transition': 'all 2s linear',
	                		'-o-transition': 'all 2s linear'
	                	});
	                	
	                	imageObjectOnScreen.element.css({
	                		width: '0px',
	                		height: '0px',
	                		left: '0px',
	                		top: imageObjectOnScreen.center.top,
	                		'-webkit-transform': 'rotate(720deg)',
	                		'-moz-transform': 'rotate(720deg)',
	                		'-o-transform': 'rotate(720deg)',
	                		'transform': 'rotate(720deg)'
	                	});
	        		});
	            	
	            	imageObjectOnScreen.element.css({
	            		'transition': 'left 2s linear',
	            		'-moz-transition': 'left 2s linear',
	            		'-webkit-transition': 'left 2s linear',
	            		'-o-transition': 'left 2s linear'
	            	});
	            	
	            	imageObjectOnScreen.element.css({
	            		left: cestino.width + 'px',
	            	});
        		}
        		
        		if ($('#divSounds #soundBefore').length > 0) {
        			
        			$('#divSounds #soundBefore').on('ended', function() {
        				
        				objectTransition();
        			}).get(0).play();
        		}
        		else {
        			objectTransition();
        		}
            	
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
	            window.cancelAnimationFrame(gameManager.currentAnimationFrame);
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
                IMAGE: [Math.round(imageObjectOnScreen.center.left), Math.round(imageObjectOnScreen.center.top)],
                TOUCH: [Math.round(gameManager.touchManagerObject.position.left), Math.round(gameManager.touchManagerObject.position.top)]
            };

            websocket.send(JSON.stringify(packetPositions));

            gameManager.lastTimeMessageSent = time;
        }

        // riduce la dimensione della barra in relazione al tempo passato ed a quello massimo di attesa
        if (!imageObjectOnScreen.moveInsideSacco && !imageObjectOnScreen.moveInsideCestino) {
        	
            var elapsedTime = time - gameManager.startTimeObjectOnScreen;

            //barraTempo.timeIsPassing(elapsedTime / gameManager.maxTimeObjectOnScreen);

            if (elapsedTime >= gameManager.maxTimeObjectOnScreen) {
                window.cancelAnimationFrame(gameManager.currentAnimationFrame);
                // devo richiamare funzione per fine tempo
                timeExpired(false);
            }
        }
        else if (imageObjectOnScreen.moveInsideSacco) {
        	
        	var delta = time - gameManager.timeLastFrame;

            imageObjectOnScreen.moveObjectIntoSacco(delta);
            if (imageObjectOnScreen.drawingPosition.top > sacco.drawingPosition.top) {

                window.cancelAnimationFrame(gameManager.currentAnimationFrame);
                objectInsertedIntoSacco();
            }
        }
        else if (imageObjectOnScreen.moveInsideCestino) {
        		
    		window.cancelAnimationFrame(gameManager.currentAnimationFrame);
    		
    		imageObjectOnScreen.element.one('transitionend webkitTransitionEnd oTransitionEnd', function() {
    			
    			timeExpired(true);
    		})
    		
    		imageObjectOnScreen.element.css({
        		'transition': 'all 2s linear',
        		'-moz-transition': 'all 2s linear',
        		'-webkit-transition': 'all 2s linear',
        		'-o-transition': 'all 2s linear'
        	});
        	
        	imageObjectOnScreen.element.css({
        		width: '0px',
        		height: '0px',
        		left: '0px',
        		top: imageObjectOnScreen.center.top,
        		'-webkit-transform': 'rotate(720deg)',
        		'-moz-transform': 'rotate(720deg)',
        		'-o-transform': 'rotate(720deg)',
        		'transform': 'rotate(720deg)'
        	});
        }
    },
    
    functionMoveGnomo: function(currentTime) {
    
    	var transition = 'width 5s linear, height 5s linear, left 5s linear, top 5s linear';
    	
    	presentationManager.slitta.element.css({
    		'transition': transition,
    		'-webkit-transition': transition
    	});
    	
    	presentationManager.gnomo.element.css({
    		'transition': transition,
    		'-webkit-transition': transition
    	});
    	
    	presentationManager.gnomo.element.css({
    		width: presentationManager.firstPoint.gnomo.width,
    		height: presentationManager.firstPoint.gnomo.height,
    		left: presentationManager.firstPoint.gnomo.left,
    		top: presentationManager.firstPoint.gnomo.top
    	});
    	
    	presentationManager.slitta.element.on('transitionend webkitTransitionEnd', function(event) {
    		
    		event.stopPropagation();
    		if (event.originalEvent.propertyName === "left") {
    			
    			$(this).off('transitionend webkitTransitionEnd');
    			
    			presentationManager.gnomo.element.css({
    				width: presentationManager.secondPoint.gnomo.width,
    				height: presentationManager.secondPoint.gnomo.height,
    				left: presentationManager.secondPoint.gnomo.left,
    				top: presentationManager.secondPoint.gnomo.top
    			});
    			
    			presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFileBack);
    			presentationManager.slitta.element.on('transitionend webkitTransitionEnd oTransitionEnd', function(event) {
    				
    				event.stopPropagation();
    				if (event.originalEvent.propertyName === "left") {
    					
    					$(this).off('transitionend webkitTransitionEnd oTransitionEnd');
    					frameAnimatorNamespace.moveGnomoToCenter();
    				}
    			}).css({
    				width: presentationManager.secondPoint.slitta.width,
    				height: presentationManager.secondPoint.slitta.height,
    				left: presentationManager.secondPoint.slitta.left,
    				top: presentationManager.secondPoint.slitta.top
    			});
    		}
    		
    	}).css({
    		width: presentationManager.firstPoint.slitta.width,
    		height: presentationManager.firstPoint.slitta.height,
    		top: presentationManager.firstPoint.slitta.top,
    		left: presentationManager.firstPoint.slitta.left
    	});
    	
	    /*presentationManager.currentAnimationFrame = 
	        window.requestAnimationFrame(frameAnimatorNamespace.functionMoveGnomo);
	    
	    var delta = currentTime - presentationManager.timeLastFrame;
	    if (delta > 1000 / 50) {
	        if (!presentationManager.gnomo.moveRight) {
	            if (presentationManager.slitta.left > presentationManager.firstPoint.slitta.left) {	                
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
	                presentationManager.slitta.left = presentationManager.firstPoint.slitta.left;
	                presentationManager.slitta.top = presentationManager.firstPoint.slitta.top;
	                presentationManager.slitta.width = presentationManager.firstPoint.slitta.width;
	                presentationManager.slitta.height = presentationManager.firstPoint.slitta.height;
	                presentationManager.gnomo.left = presentationManager.firstPoint.gnomo.left;
	                presentationManager.gnomo.top = presentationManager.firstPoint.gnomo.top;
	                presentationManager.gnomo.width = presentationManager.firstPoint.gnomo.width;
	                presentationManager.gnomo.height = presentationManager.firstPoint.gnomo.height;
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
	                window.cancelAnimationFrame(presentationManager.currentAnimationFrame);
	                
	                
	                presentationManager.gnomo.currentScale = presentationManager.gnomo.targetScale;
	                presentationManager.gnomo.width = presentationManager.gnomo.targetWidth;
	                presentationManager.gnomo.height = presentationManager.gnomo.targetHeight;
	                
	                presentationManager.gnomo.top = (getScreenHeight() * 0.7) - presentationManager.gnomo.height; 
	                
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
	    }*/
	},
    moveGnomoToCenter: function() {
    
    	presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFile);
    	
    	presentationManager.slitta.element.css({
    		transition: 'all 1s linear',
    		'-webkit-transition': 'all 1s linear'
    	});
    	presentationManager.gnomo.element.css({
    		transition: 'all 1s linear',
    		'-webkit-transition': 'all 1s linear'
    	});
    	
    	presentationManager.gnomo.element.css({
    		width: presentationManager.thirdPoint.gnomo.width,
    		height: presentationManager.thirdPoint.gnomo.height,
    		left: presentationManager.thirdPoint.gnomo.left,
    		top: presentationManager.thirdPoint.gnomo.top
    	});
    	
    	presentationManager.slitta.element.on('transitionend webkitTransitionEnd oTransitionEnd', function(event) {
    		
    		if (event.originalEvent.propertyName === "top") {
    			
    			$(this).off('transitionend webkitTransitionEnd oTransitionEnd');
    			
    			var transition = 'all 3s ease-out';
    	    	
    	    	presentationManager.slitta.element.css({
    	    		transition: transition,
    	    		'-webkit-transition': transition
    	    	});
    	    	presentationManager.gnomo.element.css({
    	    		transition: transition,
    	    		'-webkit-transition': transition
    	    	});
    	    	
    	    	presentationManager.gnomo.element.css({
    	    		width: presentationManager.fourthPoint.gnomo.width,
    	    		height: presentationManager.fourthPoint.gnomo.height,
    	    		left: presentationManager.fourthPoint.gnomo.left,
    	    		top: presentationManager.fourthPoint.gnomo.top
    	    	});
    	    	
    	    	presentationManager.slitta.element.on('transitionend webkitTransitionEnd oTransitionEnd', function(event) {
    	    		
    	    		if (event.originalEvent.propertyName === "left") {
    	    			$(this).off('transitionend webkitTransitionEnd oTransitionEnd');
    	    			
    	    			setTimeout(function() {
    	    				
    	    				var transition = 'all 0.1s linear';
        	    			
        	    			presentationManager.gnomo.element.css({
        	    				transition: transition,
        	    				'-webkit-transition': transition
        	    			});
        	    			
        	    			presentationManager.gnomo.element.on('transitionend webkitTransitionEnd oTransitionEnd', function(event) {
        	    				
        	    				if (event.originalEvent.propertyName === "top") {
        	    					
        	    					$(this).off('transitionend webkitTransitionEnd oTransitionEnd');
        	    					
        	    					var transition = 'all 0.2s linear';
        	    					
        	    					presentationManager.gnomo.element.css({
        	    						transition: transition,
        	    						'-webkit-transition': transition
        	    					});
        	    					
        	    					presentationManager.gnomo.element.on('transitionend webkitTransitionEnd oTransitionEnd', function(event) {
        	    						
        	    						if (event.originalEvent.propertyName === "top") {
        	    							
        	    							presentationManager.slitta.element.css({
        	    								transition: 'none',
        	    								'-webkit-transition': 'none'
        	    							});
        	    							
        	    							setTimeout(function() {
        	    		                    	$('#divMainContent').children().css({
        	    		                        	visibility: 'hidden'
        	    		                        });
        	    		                    	
        	    		                    	$('#divSounds #audioFrenata').remove();
        	    		                        presentationEnded();
        	    		                    }, 1500);
        	    						}
        	    						
        	    					}).css({
        	    						top: presentationManager.sixthPoint.gnomo.top
        	    					});
        	    					
        	    				}
        	    			}).css({
        	    				top: presentationManager.fifthPoint.gnomo.top,
        	    				'z-index': 10
        	    			});
        	    			
    	    			}, 1000);
    	    			
    	    		}
    	    	}).css({
    	    		width: presentationManager.fourthPoint.slitta.width,
    	    		height: presentationManager.fourthPoint.slitta.height,
    	    		left: presentationManager.fourthPoint.slitta.left,
    	    		top: presentationManager.fourthPoint.slitta.top
    	    	});
    			
    		}
    		
    	}).css({
    		width: presentationManager.thirdPoint.slitta.width,
    		height: presentationManager.thirdPoint.slitta.height,
    		left: presentationManager.thirdPoint.slitta.left,
    		top: presentationManager.thirdPoint.slitta.top
    	});
    	
    /*presentationManager.currentAnimationFrame = 
        window.requestAnimationFrame(frameAnimatorNamespace.moveGnomoToCenter);
    
    var delta = time - presentationManager.timeLastFrame;
    if (delta > 1000 / 50) {
        if (!presentationManager.gnomo.arrivedToCenter) {

            var distance = presentationManager.gnomo.left - 
                (getScreenWidth() / 2 - presentationManager.gnomo.width / 2);
            
            if (distance > 0) {

                if (distance < 100 && distance > 30) {
                    $('#divSounds #audioFrenata').get(0).play();
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
                window.cancelAnimationFrame(presentationManager.currentAnimationFrame);
                //$('#audioIntroduzione').on('ended', function() {
                  //  console.log("Completed");
                    setTimeout(function() {
                    	$('#divMainContent').children().css({
                        	visibility: 'hidden'
                        });
                    	
                    	$('#divSounds #audioFrenata').remove();
                        presentationEnded();
                    }, 1500);
                    
                    /*setTimeout(function() {
                    	presentationManager.timeLastFrame = new Date().getTime();	
                    	presentationManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.gnomoReturnsOnSlitta);
                    });*/
                    //ExampleNamespace.prepareExamples();
                //}).get(0).play();
     /*       }
        }
    }*/
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
            	
            	window.cancelAnimationFrame(presentationManager.currentAnimationFrame);
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
				
				
				window.cancelAnimationFrame(presentationManager.currentAnimationFrame);
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
				
				window.cancelAnimationFrame(presentationManager.currentAnimationFrame);
				gameIsEnded();
			}
			
			presentationManager.timeLastFrame = time;
		}
	}

};