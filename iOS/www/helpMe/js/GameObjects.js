
function GameManager() {
    this.levelIndex = -1;
    this.currentLevel = null;
    this.indexImageObject = -1;
    this.currentImage = null;
    this.maxTimeObjectOnScreen = 30000;
    this.startTimeObjectOnScreen = null;
    this.imageRetrieved = 0;
    this.totalImageToRetrieve = 2;
    this.totalImagesFamilies = -this.totalImageToRetrieve - 1;
    this.isAnExample = false;
    this.imageRightAnswer = null;
    this.imageBadAnswer = null;
    this.currentAnimationFrame = null;
    this.divMainContent = null;
    this.packetWithResults = null;
    this.lastTimeMessageSent = 0;
    this.timeLastFrame = 0;
    this.maxSensibility = 1000 / 25;
    this.touchManagerObject = new TouchManager();
    this.timeToStart = 0;
    this.levelCompletedCorrectly = true;
    this.maxRepetitionForLevel = 3;
    this.currentLevelRepetition = 1;
    this.maxCorrectAnswers = -1;
    this.gameInProgress = true;
    this.currentLevelCorrectAnswers = 0;

this.getSystemImages = function() {

    $('<div>').attr('id', 'divSystemImages').appendTo('body');

    var imageGoodAnswer = new Image();
    imageGoodAnswer.onload = function() {

        var width = this.width;
        var height = this.height;

        var finalHeight = getScreenHeight() * 0.8;
        var rapportoFinalHeightHeight = finalHeight / height;
        var finalWidth = width * rapportoFinalHeightHeight;

        if (finalWidth > getScreenWidth()) {
            finalWidth = getScreenWidth() * 0.8;
            var rapportoFinalWidthWidth = finalWidth / width;
            finalHeight = height * rapportoFinalWidthWidth;

        }

        gameManager.imageRightAnswer = $(this);
        gameManager.imageRightAnswer.appendTo('#divSystemImages');
        gameManager.imageRightAnswer.css({
            position: 'absolute',
            width: finalWidth,
            height: finalHeight,
            top: getScreenHeight() / 2 - finalHeight / 2,
            left: getScreenWidth() / 2 - finalWidth / 2,
            display: 'none',
            'z-index': 100
        });
        
        utilsNamespace.anotherImageRetrieved();
    }
    imageGoodAnswer.src="images/spongebob_ok.gif";

    var imageBadAnswer = new Image();
    imageBadAnswer.onload = function() {

        var width = this.width;
        var height = this.height;

        var finalHeight = getScreenHeight() * 0.8;
        var rapportoFinalHeightHeight = finalHeight / height;
        var finalWidth = width * rapportoFinalHeightHeight;

        if (finalWidth > getScreenWidth()) {
            finalWidth = getScreenWidth() * 0.8;
            var rapportoFinalWidthWidth = finalWidth / width;
            finalHeight = height * rapportoFinalWidthWidth;

        }

        gameManager.imageBadAnswer = $(this);
        gameManager.imageBadAnswer.appendTo('#divSystemImages');
        gameManager.imageBadAnswer.css({
            position: 'absolute',
            width: finalWidth,
            height: finalHeight,
            top: getScreenHeight() / 2 - finalHeight / 2,
            left: getScreenWidth() / 2 - finalWidth / 2,
            display: 'none',
            'z-index': 100
        });

        utilsNamespace.anotherImageRetrieved();
    }
    imageBadAnswer.src = "images/spongebob_sad.png";
};

this.getSystemSounds = function() {

    var divSounds = $('<div>').attr('id','divSounds').appendTo('body');

    var goodAnswers = $('<div>').attr('id', 'soundsGoodAnswer').appendTo(divSounds);
    var badAnswers = $('<div>').attr('id', 'soundsBadAnswer').appendTo(divSounds);
    
    // array with the name of the files to play in case of 
    // good answer or bad answer
    var goodSounds = new Array("bene", "molto_bene", "continua_cosi");
    var badSounds = new Array("intruso");
    
    if (getFromSessionStorage("patientSex") == "M") {
    	goodSounds.push("bravo");
    	goodSounds.push("bravissimo");
    }
    else if (getFromSessionStorage("patientSex") == "F") {
    	goodSounds.push("brava");
    	goodSounds.push("bravissima");
    }
    
    for (x in goodSounds) {
    	utilsNamespace.addSoundSource($('<audio>').appendTo(goodAnswers), goodSounds[x]);
    }
    
    for (x in badSounds) {
        utilsNamespace.addSoundSource($('<audio>').appendTo(badAnswers), badSounds[x]);
    }

    $('#divSounds div audio').on('ended', function() {

        utilsNamespace.resetGame();

        setTimeout(manageImageObjectsLevel, 1000);
    });
    
    utilsNamespace.addSoundSource($('<audio>').attr('id', 'gnomoSaysGoodbye').appendTo(divSounds),
    	"saluto_elfo_fine");
    
    utilsNamespace.addSoundSource($('<audio>').attr('id', 'sledCanLeave').appendTo(divSounds),
    	"slitta_puo_partire");
    	
    $('<div>').attr('id', 'finalFeedback').appendTo('#divSounds');
    
    utilsNamespace.addSoundSource($('<audio>').attr('id', 'messoInsieme').appendTo('#divSounds #finalFeedback'), 'messo_insieme');
    utilsNamespace.addSoundSource($('<audio>').attr('id', 'oggettiAssomigliano').appendTo('#divSounds #finalFeedback'), 'oggetti_assomigliano');
    
    var divObjects = $('<div>').attr('id', 'numberOfObjects').appendTo('#divSounds div#finalFeedback');
    
    var numbers = new Array('uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove');
    
    for (x in numbers) {
    	utilsNamespace.addSoundSource($('<audio>').attr('id', 'correct' + (x+1)).appendTo(divObjects), numbers[x]);
    }
    
    
}

}

function ResultPacket(targetFamily) {
    this.TYPE = 'GAME_DATA';
    this.SUBTYPE = 'SESSION_RESULTS';
    this.TARGET_FAMILY = targetFamily;
    this.IS_TARGET = null;
    this.OBJECT_NAME = null;
    this.FIRST_RESPONSE_TIME = 0;
    this.COMPLETION_TIME = 0;
    this.RIGHT_ANSWER = null;
}

function TouchManager() {
    this.position = new Point(-1,-1);
}