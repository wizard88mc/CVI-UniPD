
function ImageObjectOnScreen(currentImage) {

    this.element = $('<canvas></canvas>');
    var context = this.element.get(0).getContext('2d');
    this.imageElement = currentImage.image;
    this.element.get(0).width = currentImage.image.naturalWidth;
    this.element.get(0).height = currentImage.image.naturalHeight;
    context.drawImage(currentImage.image, 0, 0);
    this.targetCenter = new Point(Math.round(getScreenHeight() * 0.49), Math.round(getScreenWidth() * 0.49));
    this.targetWidth = Math.round(getScreenWidth() / 5);
    /*if (this.targetWidth > getScreenWidth() * 0.16) {
    	this.targetWidth = getScreenWidth() * 0.16;
    }*/
    this.targetScale = this.targetWidth / currentImage.image.naturalWidth;
    this.targetHeight = Math.round(currentImage.image.naturalHeight * this.targetScale);
    
    if (this.targetCenter.top + this.targetHeight / 2 >= sacco.drawingPosition.top) {
        this.targetWidth = Math.round(this.targetWidth / 2);
        this.targetHeight = Math.round(this.targetHeight / 2);
        this.targetScale /= 2;
    }
    this.center = new Point(Math.round(getScreenHeight() * 0.47), Math.round(getScreenWidth() * 0.74));

    this.drawingPosition = new Point(this.center.top, this.center.left);
    this.distanceTop = this.targetCenter.top - this.center.top;
    this.distanceLeft = this.targetCenter.left - this.center.left;
    this.width = 0;
    this.height = 0;
    this.currentScale = 0;
    this.moveInsideSacco = false;
    this.moveInsideCestino = false;
    this.dimensionsAlreadyReduced = false;

    this.element.css({
        position: 'absolute',
        width: this.width + 'px',
        height: this.height + 'px',
        top: this.drawingPosition.top,
        left: this.drawingPosition.left,
        'z-index': 5
    });
    
    this.timeForMovingToCenter = 2000;
    this.timeForMovingIntoSacco = 3000;

this.moveObject = function(delta, intoSacco) {

	var deltaTop = 0; 
	var deltaLeft = 0;
	if (intoSacco) {
		deltaTop = Math.round((getScreenHeight() - this.targetCenter.top) * delta / 
				this.timeForMovingIntoSacco);
	}
	else {
		deltaTop = Math.round((this.distanceTop * delta) / this.timeForMovingToCenter);
		deltaLeft = Math.round((this.distanceLeft * delta) / this.timeForMovingToCenter);
	}
	
    this.center.left += Math.round(deltaLeft);
    this.center.top += Math.round(deltaTop);
    this.drawingPosition.left += deltaLeft;
    this.drawingPosition.top += deltaTop;

    this.element.css({
        top: this.drawingPosition.top,
        left: this.drawingPosition.left
    });
};

	this.moveObjectIntoSacco = function(delta) {
		
		var deltaLeft = 0, deltaTop = 0;
		if (this.center.left > sacco.center.left + 1) {
            deltaLeft = -1.5;
        }
        if (this.center.left < sacco.center.left - 1) {
            deltaLeft = 1.5;
        }
        if (this.drawingPosition.top < getScreenHeight()) {
            deltaTop = 1.5;
        }
        
        this.center.left += Math.round(deltaLeft);
        this.center.top += Math.round(deltaTop);
        this.drawingPosition.left += deltaLeft;
        this.drawingPosition.top += deltaTop;

        this.element.css({
            top: this.drawingPosition.top,
            left: this.drawingPosition.left
        });
	};
	
	this.moveObjectIntoCestino = function(delta) {
		
		if (!this.dimensionsAlreadyReduced) {
			this.dimensionsAlreadyReduced = true;
			var ratio = this.width / this.height;
			this.width = cestino.width * 0.5;
			this.height = this.width / ratio;
			this.center.left = this.drawingPosition.left + this.width / 2;
			this.center.top = this.drawingPosition.top + this.height / 2;
			this.element.css({
				width: this.width + 'px',
				height: this.height + 'px'
			});
		}
		else {
			var ratio = this.width / this.height;
			this.width = this.width * 0.9;
			this.height = this.height * 0.9;
			this.center.left = this.drawingPosition.left + this.width / 2;
			this.center.top = this.drawingPosition.top + this.height / 2;
			this.element.css({
				width: this.width + 'px',
				height: this.height + 'px'
			});
		}
		
		var deltaTop = 0; var deltaLeft = 0;
		if (this.center.left > 0) {
			deltaLeft = -1.5;
		}
		if (this.center.top > cestino.top + cestino.height / 2) {
			deltaTop = -1.5;
		}
		if (this.center.top < cestino.top + cestino.height / 2) {
			deltaTop = 1.5;
		}
		
		this.center.left += Math.round(deltaLeft);
        this.center.top += Math.round(deltaTop);
        this.drawingPosition.left += deltaLeft;
        this.drawingPosition.top += deltaTop;

        this.element.css({
            top: this.drawingPosition.top,
            left: this.drawingPosition.left
        });
	}

    this.scaleObject = function(delta) {

    	var scale = (delta * this.targetScale / this.timeForMovingToCenter);
    	this.currentScale += scale; 

        this.width = this.currentScale * this.imageElement.naturalWidth;
        this.height = this.currentScale * this.imageElement.naturalHeight;

        this.drawingPosition.top = Math.round(this.center.top - this.height / 2);

        this.drawingPosition.left = Math.round(this.center.left - this.width / 2);

        this.element.css({
            width: this.width + 'px',
            height: this.height + 'px',
            top: this.drawingPosition.top,
            left: this.drawingPosition.left
        });

    }

    this.moveCenter = function(x, y) {
        this.center.x = x;
        this.center.y = y;
        this.bitmap.x = this.center.x - this.width / 2;
        this.bitmap.y = this.center.y - this.height / 2;
    }
}