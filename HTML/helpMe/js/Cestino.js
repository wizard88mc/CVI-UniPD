
function Cestino() {
	
	this.element = $('<div id="divCestino"></div>');
	
	if (getScreenWidth() > getScreenHeight()) {
		this.height = getScreenHeight() * 0.5;
		this.width = this.height;
	}
	else {
		this.width = getScreenWidth() * 0.3;
		this.height = this.width;
	}
	
	this.left = 0;
	this.top = getScreenHeight() / 2 - this.height / 2;
	this.element.css({
		width: this.width + 'px',
		height: this.height + 'px',
		position: 'absolute',
		left: this.left + 'px',
		top: this.top + 'px',
		background: 'url(images/bin.png)',
		'background-size': '100% 100%',
		'background-repeat': 'no-repeat',
		'z-index': '100',
		display: 'none'
	});
}