
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

                    immaginiADisposizione[family].push(new ImageObject(name, fileName));
                })
            });

        }
    });
},

anotherImageRetrieved: function() {

    gameManager.imageRetrieved++;
    if (gameManager.totalImageToRetrieve == gameManager.imageRetrieved) {

        presentationManager = new PresentationManager();
        presentationManager.createElements();
        //ExampleNamespace.prepareExamples();
    	//openWebSocket(port);
    }
},

retrieveLevels: function() {

    $.ajax({
        type: 'GET',
        url: 'settings/levels.xml',
        dataType: 'xml',
        cahce: 'false',
        success: function(xml) {

            $(xml).find('level').each(function() {

                var familyName = $(this).attr('imagesFamily');
                var sound = $(this).attr('sound');
                var distractors = 0;
                var target = 0;
                var listOfObjects = [];

                if ($(this).attr('defined') == 'true') {

                    $(this).find('object').each(function() {
                        listOfObjects.push($(this).attr('type'));
                    });

                }
                else {
                    var target = parseInt($(this).attr('numberOfTargets'));
                    var distractors = parseInt($(this).attr('numberOfDistracters'));
                }

                livelliGioco.push(new Level(familyName, target, distractors, listOfObjects, sound));
            });

            //ExampleNamespace.prepareExamples();

            /*initGame();
            openWebSocket(port);
            gameManager.timeToStart = new Date().getTime();
            allInfosRetrieved();*/
        }
    });
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

    // ho immagini a disposizione, costruisco livello definendo array

    if (level.sequenceOfObjects.length == 0) {
        for (var i = 0; i < level.numberOfTargets; i++) {
            var position = Math.floor(Math.random() * target.length);
            oggettiPerLivello.push(target[position]);
        }
        for (var i = 0; i < level.numberOfDistracters; i++) {
            var position = Math.floor(Math.random() * distrattori.length);
            oggettiPerLivello.push(distrattori[position]);
        }

        oggettiPerLivello.sort(function() { return Math.random() - Math.random() * 0.5;});
    }
    else {

        for (var i = 0; i < level.sequenceOfObjects.length; i++) {

            if (level.sequenceOfObjects[i] == 'T') {
                var position = Math.floor(Math.random() * target.length);
                oggettiPerLivello.push(target[position]);
            }
            else {
                var position = Math.floor((Math.random() * distrattori.length));
                oggettiPerLivello.push(distrattori[position]);
            }
        }
    }
    var audio = $('<audio id="audioLevel"></audio>').appendTo('#divSounds');
    $('<source src="sounds/' + level.sound + '" />').appendTo(audio);

},

    resetGame: function() {
        $('#divSystemImages').children().hide();
        $('#divMainContent div[id!="divBarraTempo"]').show();
        $('#audioLevel').remove();
        imageObjectOnScreen.element.remove();
    }

};