
function BarraTempo() {

    this.element = $('<div id="divBarraTempo"></div>');

    this.width = sacco.width;
    this.height = getScreenHeight() * 0.08;
    this.center = new Point(this.height, sacco.center.left);

    this.drawingPosition = new Point(this.center.top - this.height / 2, this.center.left - this.width / 2);

    this.element.css({
        width: this.width + 'px',
        height: this.height + 'px',
        position: 'absolute',
        left: this.drawingPosition.left,
        top: this.drawingPosition.top,
        'background-color': '#00F',
        display: 'none',
        'z-index': 1
    });

this.timeIsPassing = function(factor) {

    var realWidth = this.width - this.width * factor;

    this.element.css({
        width: realWidth
    });
}

this.reset = function() {

    this.element.css({
        width: this.width,
        display: 'none'
    });
}

this.elementForStage = function() {

    this.graphics = new Graphics();
    this.graphics.beginFill(Graphics.getRGB(0, 0, 255, 0.7));
    this.graphics.drawRect(0, 0 , this.width, -this.height);

    this.shape = new Shape(this.graphics);
    this.shape.x = this.center.x - this.width / 2;
    this.shape.y = this.center.y + this.height / 2;

    this.shadow = new Shadow('#000000', 10, 10, 15);
    this.shape.shadow = this.shadow;

    return this.shape;
}
}
