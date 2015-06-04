var eventEndAnimation = 'transitionend webkitTransitionEnd oTransitionEnd';

var frameAnimatorNamespace = {

    /**
     * 
     * Defines the transition that moves the image from
     * the red machine of the environment to the center
     * of the screen, changing its positions and its
     * size
     */ 
    managerIngressoImmagine: function() {
    	
    	var transition = 'all ' + imageObjectOnScreen.timeForMovingToCenter + 's linear';
    	
    	addTransitionSpecifications(imageObjectOnScreen.element, transition);
    	
    	//console.log(imageObjectOnScreen.element.position());
    	//	console.log(imageObjectOnScreen.targetPoint);
    	
    	imageObjectOnScreen.element.on(eventEndAnimation, function(event) {
    		
    		if (event.originalEvent.propertyName === "left") {
    			
    			$(this).off(eventEndAnimation);
    			
    			addTransitionSpecifications(imageObjectOnScreen.element, 'none');
    			
    			imageObjectOnScreen.arrivedAtCenter();
    			
    			frameAnimatorNamespace.imageInTheCenterOfTheScreen();
    		}
    	}).css({
    		width: imageObjectOnScreen.targetWidth,
    		height: imageObjectOnScreen.targetHeight, 
    		left: imageObjectOnScreen.targetPoint.left,
    		top: imageObjectOnScreen.targetPoint.top
    	});
    },

    /**
     * if the current image is not for example, it attaches
     * the mouse events to the corresponding functions,
     * otherwise it decide if it has to move the example
     * inside the bag or not, and to reproduce the
     * corresponding sounds
     */
    imageInTheCenterOfTheScreen: function() {

    	/**
    	 * If it is not an example, attaches the
    	 * mouse events to the corresponding functions
    	 * and starts the game
    	 */ 
        if (!gameManager.isAnExample) {

            imageObjectOnScreen.element.draggable({
                start: touchManagerNamespace.touchStart,
                drag: touchManagerNamespace.touchMove,
                stop: touchManagerNamespace.touchEnd
            });

            gameManager.startTimeObjectOnScreen = new Date().getTime();
            gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.realGameManager);
        }
        else {

        	/**
        	 * Manages the example, if it has to insert it into the
        	 * bag or not, with or without the arrow showing a small
        	 * help for the children
        	 */
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
                /**
                 * If the example has no help, show the hand
                 * that follows the object from the starting
                 * position to the end of the transition
                 */
                else {
                	exampleManager.hand = $(exampleManager.handImage)
                		.attr('id', 'imgHand').appendTo('#divMainContent');
                	
                	var startTopPositionHand = imageObjectOnScreen.drawingPosition.top + 
                		imageObjectOnScreen.height * 2 / 3;
                	var startLeftPositionHand = imageObjectOnScreen.drawingPosition.left +
                		imageObjectOnScreen.width / 2;
                	exampleManager.hand.width(imageObjectOnScreen.element.width() * 2 / 3);
                	exampleManager.hand.height(exampleManager.hand.width());
                	exampleManager.hand.css({
                		position: 'absolute',
                		top: startTopPositionHand,
                		left: startLeftPositionHand,
                		'z-index': 200
                	});
                	
                	addTransformSpecifications(exampleManager.hand, 'rotate(-20deg)');
                	
                }
                if ($('#divSounds #soundBefore').length > 0) {

                    $('#divSounds #soundBefore').on('ended', function() {
                    	gameManager.timeLastFrame = new Date().getTime();
                        
                    	frameAnimatorNamespace.moveExampleIntoBag();
                    }).get(0).play();

                }
                else {
                	gameManager.timeLastFrame = new Date().getTime();
                    
                	frameAnimatorNamespace.moveExampleIntoBag();
                }
            }
            /**
             * The example has to go inside the bin 
             * on the left of the screen
             */
            else {
            		
            	/**
            	 * Defines the transition for the example from it
            	 * starting position to the bin on the left side
            	 */
        		var objectTransition = function() {	
	            	imageObjectOnScreen.element.one(eventEndAnimation, function() {
	        			
	            		imageObjectOnScreen.element.one(eventEndAnimation, function(event) {
	            			
	            			if (event.originalEvent.propertyName === "left") {
	                			
	                			imageObjectOnScreen.element.off(eventEndAnimation);
	                			imageObjectOnScreen.element.remove();
	                			
	            	            ExampleNamespace.exampleCompleted();
	                		}
	            		});
	            		
	            		addTransitionSpecifications(imageObjectOnScreen.element, 'all 2s linear');
	                	
	                	imageObjectOnScreen.element.css({
	                		width: '0px',
	                		height: '0px',
	                		left: '0px',
	                		top: getScreenHeight()
	                	});
	                	
	                	addTransformSpecifications(imageObjectOnScreen.element, 'rotate(720deg)');
	                	
	        		});
	            	
	            	addTransitionSpecifications(imageObjectOnScreen.element, 'left 2s linear');
	            	
	            	imageObjectOnScreen.element.css({
	            		left: cestino.width + 'px',
	            	});
	            	
	            	if (exampleManager.arrow != null) {
            			addTransitionSpecifications(exampleManager.arrow, 'all 2s linear');
            			
            			exampleManager.arrow.on(eventEndAnimation, function(event) {
                			
                			if (event.originalEvent.propertyName == "left") {
                				
                				exampleManager.arrow.remove();
                				addTransitionSpecifications(exampleManager.arrow, 'none');
            	                exampleManager.arrow = null;
                			}
                		}).css({
            				width: '0px',
            				left: cestino.width + 'px'
            			});
            		}
	            	
	            	if (exampleManager.hand != null) {
	            		addTransitionSpecifications(exampleManager.hand, 'all 2s linear');
	            		
	            		exampleManager.hand.on(eventEndAnimation, function(event) {
	            			
		            		if (event.originalEvent.propertyName == "left") {
		            			
		            			exampleManager.hand.remove();
		            			addTransitionSpecifications(exampleManager.hand, 'none');
		            			exampleManager.hand = null;
		            		}
	            		}).css({
	            			left: (cestino.width + imageObjectOnScreen.width * 2 / 3) + 'px'
	            		});
	            	}
	            	
	            	
        		};
        		
        		if (exampleManager.currentExample.withHelp) {
        			
        			exampleManager.arrow = $(exampleManager.arrowImage).attr('id', 'imgArrow')
        				.appendTo('#divMainContent');
        			
        			var bottomPositionImage = imageObjectOnScreen.drawingPosition.top + 
        				(imageObjectOnScreen.height / 2);
        			var hypotenuse = Math.sqrt(Math.pow(sacco.center.left, 2) 
        					+ Math.pow(getScreenHeight() - bottomPositionImage, 2));
        			
        			var sinAngle = sacco.center.left / hypotenuse;
        			//var angle = Math.asin(sinAngle) * 180 / Math.PI;
        			
        			var heightArrow = (cestino.width) / sinAngle;
                    
                    exampleManager.arrow.width(imageObjectOnScreen.element.width() / 3);
                    exampleManager.arrowStartingHeight = sacco.center.top - bottomPositionImage;
                    exampleManager.arrow.height(heightArrow);
                    
                    bottomPositionImage += (exampleManager.arrow.width() * 2 / 3);
                    
                    exampleManager.arrow.css({
                        position: 'absolute',
                        top: bottomPositionImage,
                        left: imageObjectOnScreen.center.left - exampleManager.arrow.height() * 2 / 3,
                        'z-index': 200
                    });
                    
                    addTransformSpecifications(exampleManager.arrow, 'center top');
                    addTransformSpecifications(exampleManager.arrow, 'rotate(90deg)');
        		}
        		else {
        			/**
        			 * Show the hand that follows the object
        			 * to the bin
        			 */
    				exampleManager.hand = $(exampleManager.handImage).attr('id', 'imgHand').appendTo('#divMainContent');
                	
                	var startTopPositionHand = imageObjectOnScreen.drawingPosition.top + 
                		imageObjectOnScreen.height * 2 / 3;
                	var startLeftPositionHand = imageObjectOnScreen.drawingPosition.left +
                		imageObjectOnScreen.width / 2;
                	exampleManager.hand.width(imageObjectOnScreen.element.width() * 2 / 3);
                	exampleManager.hand.height(exampleManager.hand.width());
                	exampleManager.hand.css({
                		position: 'absolute',
                		top: startTopPositionHand,
                		left: startLeftPositionHand,
                		'z-index': 200
                	});
                	
                	addTransformSpecifications(exampleManager.hand, 'rotate(-20deg)');
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

    /**
     * Moves the example inside the bag
     */
    moveExampleIntoBag: function() {
    	
    	var time = 3;
    	var transition = 'all ' + time + 's linear';
    	
    	var finalTopObject = sacco.center.top;
    	
    	addTransitionSpecifications(imageObjectOnScreen.element, transition);
    	
    	imageObjectOnScreen.element.on(eventEndAnimation, function(event) {
    		
    		if (event.originalEvent.propertyName === "top") {
    			
    			imageObjectOnScreen.element.off(eventEndAnimation);
    			imageObjectOnScreen.element.remove();
    			
	            ExampleNamespace.exampleCompleted();
    		}
    	}).css({
    		top: finalTopObject
    	});
    	
    	if (exampleManager.arrow != null) {
    		
    		var transitionArrow = 'all ' + time / 2 + 's linear';
    		var finalTopArrow = exampleManager.arrow.position().top + exampleManager.arrow.height();
    		
    		addTransitionSpecifications(exampleManager.arrow, transitionArrow);
    		
    		exampleManager.arrow.on(eventEndAnimation, function(event) {
    			
    			if (event.originalEvent.propertyName === "height") {
    				
    				exampleManager.arrow.off(eventEndAnimation);
    				addTransitionSpecifications(exampleManager.arrow, 'none');
    				exampleManager.arrow.remove();
	                exampleManager.arrow = null;
    			}
    		}).css({
    			height: '0px',
    			top: finalTopArrow
    		});
    	}
    	if (exampleManager.hand != null) {
    		
    		addTransitionSpecifications(exampleManager.hand, transition);
    		
    		exampleManager.hand.on(eventEndAnimation, function(event) {
    			
    			if (event.originalEvent.propertyName === "top") {
    				
    				exampleManager.hand.off(eventEndAnimation);
    				addTransitionSpecifications(exampleManager.hand, 'none');
    				exampleManager.hand.remove();
    				exampleManager.hand = null;
    			}
    		}).css({
    			top: finalTopObject
    		})
    	}
    	
        /*gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.moveExampleIntoBag);

        var delta = time - gameManager.timeLastFrame;
        if (delta > 1000 / 50) {
	        imageObjectOnScreen.moveObject(delta, true);
	
	        if (exampleManager.arrow != null) {
	        	
	        	exampleManager.reduceArrowHeight(delta);
	
	            if (exampleManager.arrow.height() < 0) {
	                
	            }
	        }
	
	        if (imageObjectOnScreen.drawingPosition.top > sacco.center.top) {
	            window.cancelAnimationFrame(gameManager.currentAnimationFrame);
	            
	        }
	        gameManager.timeLastFrame = time; 
        }**/
    },

    /**
     * Works during the game, sending a packet with all the informations
     * every maxSensibility milliseconds, and checks if the time is expired
     */
    realGameManager: function(time) {

        gameManager.currentAnimationFrame = 
            window.requestAnimationFrame(frameAnimatorNamespace.realGameManager);
        
        time = new Date().getTime();

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

        if (!imageObjectOnScreen.moveInsideSacco && !imageObjectOnScreen.moveInsideCestino) {
        	
            var elapsedTime = time - gameManager.startTimeObjectOnScreen;
            
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
    		
    		imageObjectOnScreen.element.one(eventEndAnimation, function() {
    			
    			timeExpired(true);
    		});
    		
    		addTransitionSpecifications(imageObjectOnScreen.element, 'all 2s linear');
        	
        	imageObjectOnScreen.element.css({
        		width: '0px',
        		height: '0px',
        		left: '0px',
        		top: getScreenHeight()
        	});
        	
        	addTransformSpecifications(imageObjectOnScreen.element, 'rotate(720deg)');
        }
    },
    
    functionMoveGnomo: function(currentTime) {
    
    	var transition = 'all ' + presentationManager.timeToPerformMovement + 's linear';
    	
    	addTransitionSpecifications(presentationManager.slitta.element, transition);
    	addTransitionSpecifications(presentationManager.gnomo.element, transition);
    	
    	presentationManager.gnomo.element.css({
    		width: presentationManager.firstPoint.gnomo.width,
    		height: presentationManager.firstPoint.gnomo.height,
    		left: presentationManager.firstPoint.gnomo.left,
    		top: presentationManager.firstPoint.gnomo.top
    	});
    	
    	presentationManager.slitta.element.on(eventEndAnimation, function(event) {
    		
    		if (event.originalEvent.propertyName === "left") {
    			
    			$(this).off(eventEndAnimation);
    			
    			presentationManager.gnomo.element.css({
    				width: presentationManager.secondPoint.gnomo.width,
    				height: presentationManager.secondPoint.gnomo.height,
    				left: presentationManager.secondPoint.gnomo.left,
    				top: presentationManager.secondPoint.gnomo.top
    			});
    			
    			presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFileBack);
    			
    			presentationManager.slitta.element.on(eventEndAnimation, function(event) {
    				
    				if (event.originalEvent.propertyName === "left") {
    					
    					$(this).off(eventEndAnimation);
    					addTransitionSpecifications(presentationManager.slitta.element, 'none');
    			    	addTransitionSpecifications(presentationManager.gnomo.element, 'none');
    			    	
    			    	presentationManager.gnomo.element.css({
    			    		width: presentationManager.thirdPoint.gnomo.width,
    			    		height: presentationManager.thirdPoint.gnomo.height,
    			    		left: presentationManager.thirdPoint.gnomo.left,
    			    		top: presentationManager.thirdPoint.gnomo.top
    			    	});
    			    	presentationManager.slitta.element.css({
    			    		width: presentationManager.thirdPoint.slitta.width,
    			    		height: presentationManager.thirdPoint.slitta.height,
    			    		top: presentationManager.thirdPoint.slitta.top,
    			    		left: presentationManager.thirdPoint.slitta.left
    			    	});
    			    	
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
	},
	
    moveGnomoToCenter: function() {
    
    	presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFile);
    	
    	var transition = 'all ' + presentationManager.timeToPerformMovement / 2 + 's ease-out';
    	
    	addTransitionSpecifications(presentationManager.slitta.element, transition);
    	addTransitionSpecifications(presentationManager.gnomo.element, transition);
    	
    	presentationManager.gnomo.element.css({
    		width: presentationManager.fourthPoint.gnomo.width,
    		height: presentationManager.fourthPoint.gnomo.height,
    		left: presentationManager.fourthPoint.gnomo.left,
    		top: presentationManager.fourthPoint.gnomo.top
    	});
    	
    	presentationManager.slitta.element.on(eventEndAnimation, function(event) {
    		
    		/*if (event.originalEvent.propertyName === "top") {
    			
    			$(this).off(eventEndAnimation);
    			
    			var transition = 'all ' + presentationManager.timeToperformMovement / 2 +'s ease-out';
    	    	
    			addTransitionSpecifications(presentationManager.slitta.element, transition);
    			addTransitionSpecifications(presentationManager.gnomo.element, transition);
    	    	
    	    	presentationManager.gnomo.element.css({
    	    		width: presentationManager.fourthPoint.gnomo.width,
    	    		height: presentationManager.fourthPoint.gnomo.height,
    	    		left: presentationManager.fourthPoint.gnomo.left,
    	    		top: presentationManager.fourthPoint.gnomo.top
    	    	});
    	    	
    	    	presentationManager.slitta.element.on(eventEndAnimation, function(event) {*/
    	    		
    	    		if (event.originalEvent.propertyName === "left") {
    	    			
    	    			$(this).off(eventEndAnimation);
    	    			
    	    			setTimeout(function() {
    	    				
    	    				var transition = 'all 0.1s linear';
        	    			
    	    				addTransitionSpecifications(presentationManager.gnomo.element, transition);
        	    			
        	    			presentationManager.gnomo.element.on(eventEndAnimation, function(event) {
        	    				
        	    				if (event.originalEvent.propertyName === "top") {
        	    					
        	    					$(this).off(eventEndAnimation);
        	    					
        	    					var transition = 'all 0.2s linear';
        	    					
        	    					addTransitionSpecifications(presentationManager.gnomo.element, transition);
        	    					
        	    					presentationManager.gnomo.element.on(eventEndAnimation, function(event) {
        	    						
        	    						if (event.originalEvent.propertyName === "top") {
        	    							
        	    							presentationManager.gnomo.element.off(eventEndAnimation);
        	    							
        	    							addTransitionSpecifications(presentationManager.slitta.element, 'none');
        	    							addTransitionSpecifications(presentationManager.gnomo.element, 'none');
        	    							
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
    	    	/*}).css({
    	    		width: presentationManager.fourthPoint.slitta.width,
    	    		height: presentationManager.fourthPoint.slitta.height,
    	    		left: presentationManager.fourthPoint.slitta.left,
    	    		top: presentationManager.fourthPoint.slitta.top
    	    	});
    			
    		}*/
    		
    	}).css({
    		width: presentationManager.fourthPoint.slitta.width,
    		height: presentationManager.fourthPoint.slitta.height,
    		left: presentationManager.fourthPoint.slitta.left,
    		top: presentationManager.fourthPoint.slitta.top
    	});
}, 

	gnomoReturnsOnSlitta: function(time) {
		
		var transition = 'all 0.2s linear';
		
		addTransitionSpecifications(presentationManager.gnomo.element, transition);
		
		presentationManager.gnomo.element.on(eventEndAnimation, function(event) {
			
			if (event.originalEvent.propertyName === "top") {
				
				presentationManager.gnomo.element.off(eventEndAnimation);
				
				var transition = 'all 0.1s linear';
				
				addTransitionSpecifications(presentationManager.gnomo.element, transition);
				
				presentationManager.gnomo.element.on(eventEndAnimation, function(event) {
					
					if (event.originalEvent.propertyName === "top") {
						
						presentationManager.gnomo.element.off(eventEndAnimation);
						frameAnimatorNamespace.moveSlittaOutside();
					}
				}).css({
					top: presentationManager.fourthPoint.gnomo.top,
					'z-index': 0
				});
			}
		}).css({
			top: presentationManager.fifthPoint.gnomo.top
		});
		
	},
	
	moveSlittaOutside: function() {
		
		var transition = 'all ' + presentationManager.timeToPerformMovement / 2 + 's ease-in';
		
		addTransitionSpecifications(presentationManager.gnomo.element, transition);
		addTransitionSpecifications(presentationManager.slitta.element, transition);
		
		presentationManager.gnomo.element.css({
			left: presentationManager.pointSlittaOutsideForAway.gnomo.left
		});
		
		presentationManager.slitta.element.on(eventEndAnimation, function(event) {
			
			if (event.originalEvent.propertyName === "left") {
				
				presentationManager.slitta.element.off(eventEndAnimation);
				frameAnimatorNamespace.moveSlittaAway();
			}
			
		}).css({
			left: presentationManager.pointSlittaOutsideForAway.slitta.left
		});
		
	},
	
	moveSlittaAway: function() {
		
		var transition = 'all ' + presentationManager.timeToPerformMovement / 2 + 's linear';
		
		presentationManager.slitta.element.attr('src', presentationManager.slitta.imageFileBack);
		
		addTransitionSpecifications(presentationManager.gnomo.element, transition);
		addTransitionSpecifications(presentationManager.slitta.element, transition);
		
		presentationManager.gnomo.element.css({
			width: presentationManager.pointSlittaAway.gnomo.width,
			height: presentationManager.pointSlittaAway.gnomo.height,
			left: presentationManager.pointSlittaAway.gnomo.left,
			top: presentationManager.pointSlittaAway.gnomo.top
		});
		
		presentationManager.slitta.element.on(eventEndAnimation, function(event) {
			
			if (event.originalEvent.propertyName === "top") {
				
				presentationManager.slitta.element.off(eventEndAnimation);
				gameIsEnded();
			}
			
		}).css({
			width: presentationManager.pointSlittaAway.slitta.width,
			height: presentationManager.pointSlittaAway.slitta.height,
			top: presentationManager.pointSlittaAway.slitta.top,
			left: presentationManager.pointSlittaAway.slitta.left
		});
	}

};