
function GameManager() {
    this.levelIndex = -1;
    this.currentLevel = null;
    this.indexImageObject = -1;
    this.currentImage = null;
    this.maxTimeObjectOnScreen = 2000;
    this.startTimeObjectOnScreen = null;
    this.imageRetrieved = 0;
    this.totalImageToRetrieve = 2;
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
    this.gameInProgress = true;

this.getSystemImages = function() {

    $('<div id="divSystemImages"></div>').appendTo('body');

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

    var divSounds = $('<div id="divSounds"></div>').appendTo('body');

    var goodAnswer = $('<audio id="audioGoodAnswer"></audio>');
    $('<source src="sounds/sound_prova.mp3" />').appendTo(goodAnswer);
    goodAnswer.appendTo(divSounds);

    var badAnswer = $('<audio id="audioBadAnswer"></audio>');
    $('<source src="sounds/sound_prova.mp3" />').appendTo(badAnswer);
    badAnswer.appendTo(divSounds);

    $('#divSounds').children().on('ended', function() {

        console.log("Sound ended");
        utilsNamespace.resetGame();

        setTimeout(manageImageObjectsLevel, 1000);
    });
    
    var soundFrenata = $('<audio id="audioFrenata"></audio>');
    $('<source src="sounds/frenata.mp3" />').appendTo(soundFrenata);
    soundFrenata.appendTo(divSounds);
    
    var introductionSound = $('<audio id="audioIntroduzione"></audio>');
    $('<source src="sounds/sound_prova.mp3" />').appendTo(introductionSound);
    introductionSound.appendTo(divSounds);
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