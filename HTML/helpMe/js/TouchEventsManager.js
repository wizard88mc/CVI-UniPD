
// PageX e pageY di event sono valori interessanti
var touchManagerNamespace = {
		
    touchStart: function(event, ui) {
        if (gameManager.packetWithResults.FIRST_RESPONSE_TIME == 0) {
            gameManager.packetWithResults.FIRST_RESPONSE_TIME = new Date().getTime() - gameManager.startTimeObjectOnScreen;
        }
    },

    touchMove: function(event, ui) {

        gameManager.touchManagerObject.position.left = event.pageX;
        gameManager.touchManagerObject.position.top = event.pageY;

        var left = imageObjectOnScreen.element.position().left;
        var top = imageObjectOnScreen.element.position().top;
        
        if (top + imageObjectOnScreen.height > getScreenHeight()) {
        	
        	top = getScreenHeight() - imageObjectOnScreen.height;
        	
        	imageObjectOnScreen.element.css({
        		top: top
        	});
        	
        	imageObjectOnScreen.center.top = top + imageObjectOnScreen.height / 2;;
        	imageObjectOnScreen.drawingPosition.top = top;
        	
        }
        else {
        	imageObjectOnScreen.center.top = top + imageObjectOnScreen.height / 2;
        	imageObjectOnScreen.drawingPosition.top = top;
        }
        
        if (left + imageObjectOnScreen.width > getScreenWidth() ) {
        	
        	left = getScreenWidth() - imageObjectOnScreen.width;
        	
        	imageObjectOnScreen.element.css({
        		left: left
        	});
        	
        	imageObjectOnScreen.center.left = left + imageObjectOnScreen.width / 2;
        	imageObjectOnScreen.drawingPosition.left = left;
        }
        else {
        	imageObjectOnScreen.center.left = left + imageObjectOnScreen.width / 2;
        	imageObjectOnScreen.drawingPosition.left = left;
        }
        
        
        imageObjectOnScreen.center.left = left + imageObjectOnScreen.width / 2;

        
        imageObjectOnScreen.drawingPosition.left = left;
    },

    touchEnd: function(event, ui) {

        gameManager.touchManagerObject.position.left = -1;
        gameManager.touchManagerObject.position.center = -1;

        if (imageObjectOnScreen.center.top >= sacco.drawingPosition.top &&
            imageObjectOnScreen.center.left > sacco.drawingPosition.left &&
            imageObjectOnScreen.center.left < sacco.drawingPosition.left + sacco.width) {

            imageObjectOnScreen.moveInsideSacco = true;
            gameManager.packetWithResults.COMPLETION_TIME = new Date().getTime() - gameManager.startTimeObjectOnScreen;
        }
        
        if (imageObjectOnScreen.element.position().left + Math.round(imageObjectOnScreen.width / 4) <= 
        	cestino.width ) {
        	
        	imageObjectOnScreen.moveInsideCestino = true;
        	gameManager.packetWithResults.COMPLETION_TIME = new Date().getTime() - gameManager.startTimeObjectOnScreen;
        }
    },

    touchOnDiv: function(event) {
        if (event.target == this) {
            gameManager.touchManagerObject.position.left = event.pageX;
            gameManager.touchManagerObject.position.top = event.pageY;
        }
    },

    TouchManagerObject: function() {
        this.position = new Point();
    }
}
