
function Sacco() {
    this.element = $('<div id="divSacco"></div>');
    this.width = getScreenWidth() / 3;
    if (this.width < 768 / 2) {
        this.width = 768 / 2;
    }
    this.height = getScreenHeight() * 0.25;
    this.center = new Point(getScreenHeight() - this.height / 2, getScreenWidth() / 2);
    this.drawingPosition = new Point(this.center.top - this.height / 2, this.center.left - this.width / 2);
    this.element.css({
        width: this.width + 'px',
        height: this.height + 'px',
        position: 'absolute',
        top: this.drawingPosition.top,
        left: this.drawingPosition.left,
        //'background-color': '#800000',
        'background-image': 'url(images/sacco_completo.png)',
        'background-size': '100% 100%',
        'z-index': 1
    });
    
    this.secondElement = $('<div id="divSaccoMezzo"></div>');
    this.secondElement.css({
    	width: this.width + 'px',
        height: this.height + 'px',
        position: 'absolute',
        top: this.drawingPosition.top,
        left: this.drawingPosition.left,
        //'background-color': '#800000',
        'background-image': 'url(images/sacco_mezzo.png)',
        'background-size': '100% 100%',
        'z-index': 100
    })
    
    this.reset = function() {
    	this.element.css({
    		top: this.drawingPosition.top
    	});
    	
    	this.secondElement.css({
    		top: this.drawingPosition.top
    	});
    }

}
