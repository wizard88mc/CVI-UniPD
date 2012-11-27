
function Sacco() {
    this.element = $('<div>').attr('id', 'divSacco');
    this.secondElement = $('<div>').attr('id', 'divSaccoMezzo');
    
    	
	this.width = getScreenWidth() / 5 * 3;
    if (this.width < 768 / 2) {
        this.width = 768 / 2;
    }
    this.height = getScreenHeight() * 0.25;
    this.center = new Point(getScreenHeight() - this.height / 2, getScreenWidth() * 0.45);
    this.drawingPosition = new Point(this.center.top - this.height / 2, this.center.left - this.width / 2);
    this.element.css({
        width: this.width + 'px',
        height: this.height + 'px',
        position: 'absolute',
        top: getScreenHeight(),
        left: this.drawingPosition.left,
        'background-image': 'url(images/sacco_completo.png)',
        'background-size': '100% 100%',
        'z-index': 1
    });
    
    this.halfBagHeight = this.height * 0.7;
    this.halfBagTop = getScreenHeight() - this.halfBagHeight;
    
    this.secondElement.css({
    	width: this.width + 'px',
        height: this.halfBagHeight + 'px',
        position: 'absolute',
        top: getScreenHeight() + (this.height - this.halfBagHeight),
        left: this.drawingPosition.left,
        'background-image': 'url(images/sacco_mezzo.png)',
        'background-size': '100% 100%',
        'z-index': 100
    });
    
    this.moveInside = function() {
    	
    	this.element.css({
    		top: this.drawingPosition.top
    	});
    	this.secondElement.css({
    		top: this.halfBagTop
    	});
    };
    
    this.reset = function() {
    	this.element.css({
    		top: this.drawingPosition.top
    	});
    	
    	this.secondElement.css({
    		top: this.halfBagTop
    	});
    }

}
