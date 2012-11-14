
function Tubo() {
    this.element = $('<div id="divTubo"></div>');
    this.width = getScreenWidth() * 0.1;
    if (this.width > 80) {
        this.width = 80;
    }
    this.height = getScreenHeight() * 0.2;
    this.actualHeight = 0;
    this.center = new Point(this.height / 2, getScreenWidth() / 2);
    this.drawingPosition = new Point(0, this.center.left - this.width / 2);
    this.element.css({
        width: this.width + 'px',
        height: this.actualHeight + 'px',
        position: 'absolute',
        top: this.drawingPosition.top,
        left: this.drawingPosition.left,
        'background-color': '#000'
    });

    this.goBack = false;

this.reset = function() {
    this.goBack = false;
}

this.incremenentHeight = function(delta) {

	var howMuch = Math.round(((delta * this.height) / 1000));
    this.actualHeight += howMuch;
    this.element.css({
        height: this.actualHeight + 'px'
    });

    return this.actualHeight >= this.height;
}

this.decrementHeight = function(delta) {

	var howMuch = Math.round(((delta * this.height) / 1000));
    this.actualHeight -= howMuch;
    this.element.css({
        height: this.actualHeight + 'px'
    });

    return this.actualHeight <= 0;
}
}
