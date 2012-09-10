
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
        'background-color': '#800000',
        'z-index': 100
    });

}
