/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

/**
 * EVENTI: 
 * T: rappresenta il click o il tocco
 * M: rappresenta il movimento
 * R: rappresenta il release del mouse o del tocco
 */

var touchManager = {
	time: new Date().getTime(),
	event: '',
	posX : -1,
	posY: -1
};


function addTouchInformations(touch) {
	touchManager.time = touch.originalEvent.timeStamp - gameManager.timeToStart;
	touchManager.posX = touch.originalEvent.clientX;
	touchManager.posY = touch.originalEvent.clientY;
}

function resetTouch() {
	if (touchManager.event != 'M') {
		touchManager.event = '';
		touchManager.posX = -1;
		touchManager.posY = -1;	
	}
	
}

/**
 * This function is called with a click event, or when the touch
 * is released after a move event with an offset from the starting
 * position sufficiently small
 * 
 * @param {Object} e
 * @param {Object} touch
 */
function touchTouch(e, touch) {
	
	if (touchManager.event == '') {
		touchManager.event = 'T';
		addTouchInformations(e);	
	}
	
}

/**
 * This function is called with a move event
 * 
 * @param {Object} e
 * @param {Object} touch
 */
function touchMove(e, touch) {
	
	touchManager.event = 'M';
	addTouchInformations(e);
}

/**
 * This function is called when the touch is released
 * with sufficient offset from the starting position
 * of the movement
 * 
 * @param {Object} e
 * @param {Object} touch
 */

function touchUp(e, touch) {
	
	e.preventDefault();
	touchManager.event = 'R';
	
}
