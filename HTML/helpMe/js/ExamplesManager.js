
var ExampleNamespace = {

    ExamplesManager: function() {
    this.examples = []; // array di example
    this.currentExample = null;
    this.indexCurrentExample = -1;
    this.totalImagesToRetrieve = 1;
    this.imagesRetrieved = 0;
    this.arrowImage = null;
    this.arrow = null;
    this.arrowStartingHeight = 0;

this.loadOtherImages = function() {

    this.arrowImage = new Image();
    this.arrowImage.onload = ExampleNamespace.imageForExampleLoaded;
    this.arrowImage.src = 'images/down_arrow.png';
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
}
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

        initGame();
        gameManager.isAnExample = true;
        ExampleNamespace.iterateOnExamples();
    }
},

    iterateOnExamples: function() {

    exampleManager.indexCurrentExample++;

    if (exampleManager.indexCurrentExample < exampleManager.examples.length) {

        exampleManager.currentExample = exampleManager.examples[exampleManager.indexCurrentExample];

        imageObjectOnScreen = new ImageObjectOnScreen(exampleManager.currentExample);
        imageObjectOnScreen.element.appendTo('#divMainContent');

        $('#divSounds #soundBefore').remove();
        $('#divSounds #soundAfter').remove();

        if (exampleManager.currentExample.soundBefore != null) {
            var soundBefore = $('<audio id="soundBefore"></audio>').appendTo('#divSounds');
            utilsNamespace.addSoundSource(soundBefore, exampleManager.currentExample.soundBefore);
        }
        if (exampleManager.currentExample.soundAfter != null) {
            var soundAfter = $('<audio id="soundAfter"></audio>').appendTo('#divSounds');
            utilsNamespace.addSoundSource(soundAfter, exampleManager.currentExample.soundAfter);
        }

        setTimeout(function() {
        	gameManager.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.managerIngressoImmagine);
            gameManager.timeLastFrame = new Date().getTime();
        }, 1000);
        
    }
    else {
        allExamplesCompleted();
        // openWebSocket(port);
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
}