var tubo = null;
var sacco = null;
var barraTempo = null;
var imageObjectOnScreen = null;
var immaginiADisposizione = {};
var livelliGioco = [];
var oggettiPerLivello = [];
var gameManager = new GameManager();
var exampleManager = new ExampleNamespace.ExamplesManager();
var presentationManager = null;

var port = 8001;
var gameIdentification = "HELP_ME";
var identificationType = 'GAME_CLIENT';
var patientID = '1';
var gameID = -1;

function initGame() {

    sacco = new Sacco();
    sacco.element.appendTo('#divMainContent');
}

function levelComplete() {

    
    sacco.element.addClass('saccoTransition');
    sacco.element.css({
    	top: getScreenHeight()
    }).one('transitionend webkitTransitionEnd oTransitionEnd', function() {

    	sacco.element.removeClass('saccoTransition');
    	setTimeout(function() {
    		sacco.reset();
    	}, 1000);
    })
    
}

$('document').ready(function() {

    gameManager.divMainContent = $('#divMainContent').width(getScreenWidth()).height(getScreenHeight()).css('overflow', 'hidden');

    initGame();
    
    setTimeout(levelComplete, 1000);
});
