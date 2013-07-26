
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var utilsNamespace = {

getImagesFromSettings: function() {

    $.ajax({
        type: "GET",
        url: "settings/images.xml",
        dataType: "xml",
        cache: 'false',
        success: function(xml) {

        	gameManager.totalImagesFamilies = $(xml).find('image').length;

            $(xml).find('family').each(function() {
                var family = $(this).attr('type');
                var audioFile = $(this).attr('audioFile');
                var audioBagCompleted = $(this).attr('audioBagReady');
                var audioObjectNotInserted = $(this).attr('audioObjectNotInserted');
                
                var sounds = {"audioFile": audioFile, "audioBagCompleted": audioBagCompleted,
                		"audioObjectNotInserted": audioObjectNotInserted};
                
                familySound[family] = sounds;

                immaginiADisposizione[family] = new Array();

                $(this).find('image').each(function() {

                    var name = $(this).attr('name');
                    var fileName = $(this).attr('fileName');
                    var imageID = $(this).attr('id');

                    immaginiADisposizione[family].push(new ImageObject(name, fileName, imageID));
                });
            });

        }
    });
},

anotherImageRetrieved: function() {

    gameManager.imageRetrieved++;
    if (gameManager.totalImageToRetrieve + gameManager.totalImagesFamilies 
    		== gameManager.imageRetrieved) {

    	// devo aprire connessione e mettermi in attesa
    	//ExampleNamespace.prepareExamples();
        //presentationManager = new PresentationManager();
        //presentationManager.createElements();
        //ExampleNamespace.prepareExamples();
    	
    	if (getFromSessionStorage("permission") == "DOCTOR") {
    		openWebSocket(port);
    	}
    	else {
    		manageOnCloseWebsocket(null);
    	}
    }
},

istantiateLevel: function(level) {

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
    			objectImage = arrayToSearch[j];
    		}
    		
    	}
    	oggettiPerLivello.push(objectImage);
    }

    /**
     * Add audio file specific for the level
     */
    utilsNamespace.addSoundSource($('<audio>').attr('id', 'audioLevel').appendTo('#divSounds'), 
    		familySound[targetFamily].audioFile);
    
    if (familySound[targetFamily].audioBagCompleted) {
    	utilsNamespace.addSoundSource($('<audio>').attr('id', 'audioBagComplete').appendTo('#divSounds'),
    			familySound[targetFamily].audioBagCompleted);
    }
    
    utilsNamespace.addSoundSource($('<audio>').attr('id', 'audioObjectNotInserted').appendTo('#divSounds'),
    		familySound[targetFamily].audioObjectNotInserted);
    
    $('#divSounds #audioObjectNotInserted').on('ended', function() {
    	utilsNamespace.resetGame();

        setTimeout(manageImageObjectsLevel, 1000);
    });
    
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
    	
    	$('<source>').attr('src', 'sounds/' + sourceFileName + '.ogg')
    		.attr('type', 'audio/ogg').attr('preload', 'auto').appendTo(element);
    	$('<source>').attr('src', 'sounds/' + sourceFileName + '.mp3')
    		.attr('type', 'audio/mpeg').attr('preload', 'auto').appendTo(element);
    }

};