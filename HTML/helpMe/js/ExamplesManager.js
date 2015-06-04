
var ExampleNamespace = {

    ExamplesManager: function() {
    this.examples = []; // array di example
    this.currentExample = null;
    this.indexCurrentExample = -1;
    this.totalImagesToRetrieve = 2;
    this.imagesRetrieved = 0;
    this.arrowImage = null;
    this.arrow = null;
    this.arrowStartingHeight = 0;
    this.handImage = null;
    this.hand = null;
    this.handStartingHeight = 0;

this.loadOtherImages = function() {

    this.arrowImage = new Image();
    this.arrowImage.onload = ExampleNamespace.imageForExampleLoaded;
    this.arrowImage.src = 'images/down_arrow.png';
    
    this.handImage = new Image();
    this.handImage.onload = ExampleNamespace.imageForExampleLoaded;
    //this.handImage.src = '../images/handPresentation.png';
    this.handImage.src = '../images/finger3.png';
};

this.reduceArrowHeight = function(delta) {
	
	var deltaTop = Math.ceil(this.arrowStartingHeight * delta / 
			(imageObjectOnScreen.timeForMovingIntoSacco / 2));
	
	var height = this.arrow.height();
	var top = Math.round(removeMeasureUnit(this.arrow.css('top')));
	
	height = height -  deltaTop;
	if (height <= 0) {
		height = 0;
	}
	top = top + deltaTop;
	
	this.arrow.css({
		height: height,
		top: top
	});
};
},

    Example: function(img, help, insertInto, soundB, soundA) {
	    this.imageFile = img;
	    this.withHelp = help;
	    this.insertIntoSacco = insertInto;
	    this.soundBefore = soundB;
	    this.soundAfter = soundA;
	
		this.loadImage = function() {
		    this.image = new Image();
		    this.image.onload = ExampleNamespace.imageForExampleLoaded;
		    this.image.src = this.imageFile;
		};
	},

    prepareExamples: function() {

	    $.ajax({
	        TYPE: 'GET',
	        url: 'settings/examples.xml',
	        dataType: 'xml',
	        cache: 'false',
	        success: function(xml) {
	
	            exampleManager.totalImagesToRetrieve += $(xml).find('example').length;
	
	            $(xml).find('example').each(function() {
	
	                var imageFileName = $(this).attr('image');
	                var withHelp = $(this).attr('withHelp') == "true";
	                var insertInto = $(this).attr('insertIntoBag') == "true";
	                var soundBefore = $(this).attr('soundBefore');
	                if (soundBefore === undefined) {
	                    soundBefore = null;
	                }
	                var soundAfter = $(this).attr('soundAfter');
	                if (soundAfter === undefined) {
	                    soundAfter = null;
	                }
	
	                var newExample = new ExampleNamespace.Example(imageFileName, withHelp,insertInto, soundBefore, soundAfter);
	                exampleManager.examples.push(newExample);
	                newExample.loadImage();
	            });
	
	            exampleManager.loadOtherImages();
	        }
	    });
	},

    imageForExampleLoaded: function() {

	    exampleManager.imagesRetrieved++;
	
	    if (exampleManager.imagesRetrieved == exampleManager.totalImagesToRetrieve) {
	
	    	console.log("ExampleManager.imageForExampleLoaded");
	    	
	        initGame();
	        gameManager.isAnExample = true;
	        var introductionSound = $('<audio>').attr('id', 'audioIntroduzione').appendTo(divSounds);
	        utilsNamespace.addSoundSource(introductionSound, "introduzione");
	        
	        utilsNamespace.addSoundSource($('<audio>').attr('id', 'secondIntroduction').appendTo(divSounds), 
	        		'introduzione_seconda_parte');
	        
	        introductionSound.one('ended', function() {
	        	
	        	console.log("introduction sound");
	        	
	        	sacco.element.one('transitionend webkitTransitionEnd oTransitionEnd', function() {
	        		
	        		$('#divSounds #secondIntroduction').one('ended', function() {
	        			console.log("secondIntroduction ended");
	            		$(this).remove();
	                	ExampleNamespace.iterateOnExamples();
	            	}).get(0).play();
	        		
	        		sacco.element.off('transitionend webkitTransitionEnd oTransitionEnd');
	        	});
	        	
	        	sacco.moveInside();
	        	
	        	$(this).remove();
	        }).get(0).play();
	        
	    }
	},

    iterateOnExamples: function() {

	    exampleManager.indexCurrentExample++;
	    //exampleManager.indexCurrentExample = 100;
	
	    if (exampleManager.indexCurrentExample < exampleManager.examples.length) {
	    	
	    	$('#divSounds #soundBefore').remove();
	        $('#divSounds #soundAfter').remove();
	        $('#imgArrow').remove();
	
	        exampleManager.currentExample = exampleManager.examples[exampleManager.indexCurrentExample];
	
	        imageObjectOnScreen = new ImageObjectOnScreen(exampleManager.currentExample);
	        imageObjectOnScreen.element.appendTo('#divMainContent');
	
	        if (exampleManager.currentExample.soundBefore != null) {
	            utilsNamespace.addSoundSource($('<audio>').attr('id', 'soundBefore').appendTo('#divSounds'), 
	            		exampleManager.currentExample.soundBefore);
	        }
	        if (exampleManager.currentExample.soundAfter != null) {
	            utilsNamespace.addSoundSource($('<audio>').attr('id', 'soundAfter').appendTo('#divSounds'), 
	            		exampleManager.currentExample.soundAfter);
	        }
	
	    	//gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);
	        gameManager.timeLastFrame = new Date().getTime();
	        setTimeout(frameAnimatorNamespace.managerIngressoImmagine, 500);
	        
	    }
	    else {
	        allExamplesCompleted();
	    }
	
	},

    exampleCompleted: function() {

    
	    if ($('#divSounds #soundAfter').length > 0) {
	        $('#divSounds #soundAfter').on('ended', function() {
	
	            imageObjectOnScreen.element.remove();
	            ExampleNamespace.iterateOnExamples();
	        }).get(0).play();
	    }
	    else {
	        imageObjectOnScreen.element.remove();
	        ExampleNamespace.iterateOnExamples();
	    }
	}
};