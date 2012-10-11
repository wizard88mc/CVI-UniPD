function GnomoElement(){
    this.element = null;
    this.imageFile = 'images/folletto.fw.png';
    this.ratioDimensions = 0;
    this.widthIncrease = 0;
    this.heightIncrease = 0;
    this.image = new Image();
    this.image.onload = function() {
        presentationManager.gnomo.naturalWidth = this.naturalWidth;
        presentationManager.gnomo.naturalHeight = this.naturalHeight;
        presentationManager.gnomo.ratioDimensions = presentationManager.gnomo.naturalWidth / 
            presentationManager.gnomo.naturalHeight;
        
        presentationManager.loadComplete();
    }
    this.image.src = this.imageFile;
    
    
    this.width = 0;
    this.height = 0;
    this.left = getScreenWidth();
    this.top = 0;
    this.moveRight = false;
    this.targetScale = 0;
    this.currentScale = 0;
    
    this.drawElement = function() {
        this.element.css({
            position: 'absolute',
            width: this.width,
            height: this.height,
            left: this.left,
            top: this.top
        });
    }
    
    this.calculateTargetDimensions = function() {
        this.targetWidth = getScreenWidth() / 10;
        
        this.targetHeight = this.targetWidth / this.ratioDimensions;
        
        if (this.targetHeight > getScreenHeight() / 2) {
        	this.targetWidth = Math.round(this.targetWidth * 2 / 3);
        	this.targetHeight = Math.round(this.targetHeight * 2 / 3);
        }
        
        this.targetScale = this.targetWidth / this.image.naturalWidth;
        
    }
    
    this.moveElement = function(left, delta) {
        
        this.top += presentationManager.totalDistanceTop * delta / 
        		presentationManager.timeToPerformMovement;
        
        var change = presentationManager.totalDistanceLeft * delta / 
        	presentationManager.timeToPerformMovement;
        if (left) {
            this.left -= change;
        }
        else {
            this.left += change;
        }
    };
    
    this.increaseDimensions = function(delta) {
        
    	this.currentScale += (delta * presentationManager.totalScaleFactorIncrease / 
    			presentationManager.timeToPerformMovement);
    	this.width = this.image.naturalWidth * this.currentScale;
        this.height = this.image.naturalHeight * this.currentScale;
    }
}

function SlittaElement() {
    this.element = null;
    this.imageFile = 'images/slitta.fw.png';
    this.imageFileBack = 'images/slitta_indietro.fw.png';
    this.ratioDimensions = 0;
    this.widthIncrease = 0;
    this.heightIncrease = 0;
    this.image = new Image();
    this.image.onload = function() {
        presentationManager.slitta.naturalWidth = this.naturalWidth;
        presentationManager.slitta.naturalHeight = this.naturalHeight;
        presentationManager.slitta.ratioDimensions = presentationManager.slitta.naturalWidth / 
            presentationManager.slitta.naturalHeight;
        
        presentationManager.loadComplete();
    }
    
    this.image.src = this.imageFile;
    
    this.width = 0;
    this.height = 0;
    this.left = getScreenWidth();
    this.top = 0;
    this.moveRight = false;
    this.currentScale = 0;
    
    this.drawElement = function() {
        this.element.css({
            position: 'absolute',
            width: this.width,
            height: this.height,
            left: this.left,
            top: this.top
        });
    };
    
    this.calculateTargetDimensions = function() {
        
        var ratioBetweenImages = presentationManager.gnomo.naturalWidth / 
            this.naturalWidth;
        
        this.targetWidth = (presentationManager.gnomo.targetWidth /* * 3 / 4*/) / ratioBetweenImages;
        this.targetHeight = this.targetWidth / this.ratioDimensions;
        this.targetScale = this.targetWidth / this.image.naturalWidth;
    };
    
    this.moveElement = function() {
        
		this.top = presentationManager.gnomo.top + presentationManager.gnomo.height * 3 / 4;
	    
        this.left = presentationManager.gnomo.left - 
        	(this.width - presentationManager.gnomo.width) / 2;
	    
	}
    
    this.increaseDimensions = function(delta) {
        
    	this.currentScale += (delta * presentationManager.totalScaleFactorIncrease / 
    			presentationManager.timeToPerformMovement);
    	this.width = this.image.naturalWidth * this.currentScale;
        this.height = this.image.naturalHeight * this.currentScale;
    }
}

function PresentationManager() {

    this.totalImages = 2;
    this.imagesLoaded = 0;
    this.gnomo = null;
    this.slitta = null;
    this.currentAnimationFrame = null;
    this.timeLastFrame = 0;
    this.timeToMoveScreen = 5;
    //this.speedForElementsWidth = (((getScreenWidth() / this.timeToMoveScreen) / 200));
    //this.speedForElementsHeight = ((((getScreenHeight() / 10) / this.timeToMoveScreen)) / 200);
    this.speedModified = false;
    this.angleForJump = 0;
    this.totalDistanceTop = 0;
    this.totalDistanceLeft = 0;
    this.totalWidthIncrease = 0;
    this.totalHeightIncrease = 0;
    this.totalScaleFactorIncrease = 0;
    this.timeToPerformMovement = 2000;

this.loadComplete = function() {
    presentationManager.imagesLoaded++;
    
    if (presentationManager.imagesLoaded == presentationManager.totalImages) {
        
        this.gnomo.calculateTargetDimensions();
        this.slitta.calculateTargetDimensions();
        presentationManager.buildPresentation();
    }
}

this.createElements = function() {
    this.gnomo = new GnomoElement();
    this.slitta = new SlittaElement();
}

this.buildPresentation = function() {
	$('body').css({
		'background-image': 'url(images/ZZ10042.jpg)',
		'background-repeat': 'no-repeat',
		'background-size': '100% 100%'
	});
    this.gnomo.element = $(this.gnomo.image);
    this.gnomo.drawElement();
    this.gnomo.element.appendTo('#divMainContent');
    this.slitta.element = $(this.slitta.image);
    this.slitta.drawElement();
    this.slitta.element.appendTo('#divMainContent');
    
    this.totalScaleFactorIncrease = this.slitta.targetScale / 6;
    this.totalDistanceTop = getScreenHeight() / 6;
    this.totalDistanceLeft = getScreenWidth() + this.slitta.image.naturalWidth * this.totalScaleFactorIncrease;
    this.timeLastFrame = new Date().getTime();
    this.currentAnimationFrame = window.requestAnimationFrame(frameAnimatorNamespace.functionMoveGnomo);
    //this.currentAnimationFrame = window.requestAnimationFrame(moveGnomoToCenter);
}

}