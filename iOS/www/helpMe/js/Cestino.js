
function Cestino() {
	
	this.element = $('<div>').attr('id', 'divCestino');
	
	this.height = getScreenHeight();
	this.width = Math.round(getScreenWidth() / 7);
	
	this.left = 0;
	this.top = 0;
	this.element.css({
		width: this.width + 'px',
		height: this.height + 'px',
		position: 'absolute',
		left: this.left + 'px',
		top: this.top + 'px',
		'z-index': '100',
	});
}