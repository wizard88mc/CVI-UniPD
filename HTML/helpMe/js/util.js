
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (window.webkitRequestAnimationFrame || 
                                        window.mozRequestAnimationFrame || 
                                        window.oRequestAnimationFrame || 
                                        window.msRequestAnimationFrame ||
                                        function(callback) {
                                            return window.setTimeout(callback, 1000 / 60);
                                        });
}

window.cancelRequestAnimationFrame = (function() {

    return window.cancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame
})();

var utilsNamespace = {

getImagesFromSettings: function() {

    $.ajax({
        type: "GET",
        url: "settings/images.xml",
        dataType: "xml",
        cache: 'false',
        success: function(xml) {

            gameManager.totalImageToRetrieve += $(xml).find('image').length;

            $(xml).find('family').each(function() {
                var family = $(this).attr('type');
                var audioFile = $(this).attr('audioFile');

                immaginiADisposizione[family] = new Array();

                $(this).find('image').each(function() {

                    var name = $(this).attr('name');
                    var fileName = $(this).attr('fileName');
                    var imageID = $(this).attr('id');

                    immaginiADisposizione[family].push(new ImageObject(name, fileName, imageID));
                })
            });

        }
    });
},

anotherImageRetrieved: function() {

    gameManager.imageRetrieved++;
    if (gameManager.totalImageToRetrieve == gameManager.imageRetrieved) {

    	// devo aprire connessione e mettermi in attesa
    	//ExampleNamespace.prepareExamples();
        //presentationManager = new PresentationManager();
        //presentationManager.createElements();
        
        
        //ExampleNamespace.prepareExamples();
    	openWebSocket(port);
    }
},

retrieveLevels: function(fileName) {

	$.ajax({
        type: 'GET',
        url: 'settings/' + fileName,
        dataType: 'xml',
        cahce: 'false',
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
        		
        		livelliGioco.push(new Level(type, targetsAndDistracters[0], targetsAndDistracters[1],
	        				targetFamily, sequenceOfImages, familySound[targetFamily] , maxTime));
	        		
        	});
        	
			// console.log(livelliGioco);

            //ExampleNamespace.prepareExamples();

            /*initGame();
            openWebSocket(port);
            gameManager.timeToStart = new Date().getTime();
            allInfosRetrieved();*/
        	
        	initGame();
        	gameManager.timeToStart = new Date().getTime();
        	allInfosRetrieved();
        }
    });
},

istantiateLevel: function(level) {

	console.log(level);
    var distrattori = [];
    var target = [];
    var targetFamily = level.targetFamily;
    oggettiPerLivello = [];
    
    for(var family in immaginiADisposizione) {

        if (family == targetFamily) {
            for (var i in immaginiADisposizione[family]) {
                var object = immaginiADisposizione[family][i];
                object.target = true;
                target.push(object);
            }
        }
        else {
            for (var i in immaginiADisposizione[family]) {
                var object = immaginiADisposizione[family][i];;
                object.target = false;
                distrattori.push(object);
            }

        }
    }

    for (var i = 0; i < level.sequence.length; i++) {
    	
    	var currentImageLevel = level.sequence[i];
    	var objectImage = null;
    	var arrayToSearch = null;
    	if (currentImageLevel.isTarget) {
    		arrayToSearch = target;
    	}
    	else {
    		arrayToSearch = distrattori;
    	}
    	
    	for (var j = 0; j < arrayToSearch.length && objectImage == null; j++ ) {
    		
    		if (arrayToSearch[j].imageID == currentImageLevel.imageID) {
    			objectImage = arrayToSearch[j]
    		}
    		
    	}
    	oggettiPerLivello.push(objectImage);
    }

    // ho immagini a disposizione, costruisco livello definendo array

    var audio = $('<audio id="audioLevel"></audio>').appendTo('#divSounds');
    utilsNamespace.addSoundSource(audio, level.sound);
    
    gameManager.maxTimeObjectOnScreen = Number(level.maxTimeImage) * 1000;

},

    resetGame: function() {
        $('#divSystemImages').children().hide();
        $('#divMainContent div[id!="divBarraTempo"]').show();
        $('#audioLevel').remove();
        imageObjectOnScreen.element.remove();
        
        gameManager.packetWithResults.FIRST_RESPONSE_TIME = 0;
    },
    
    addSoundSource: function(element, sourceFileName) {
    	$('<source src="sounds/' + sourceFileName + '.ogg" />').appendTo(element);
    	$('<source src="sounds/' + sourceFileName + '.mp3" />').appendTo(element);
    }

};