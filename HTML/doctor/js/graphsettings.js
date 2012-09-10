/**
 * @author Matteo
 */

grafo = null;
tooltipObject = new Object();

var opzioniGrafo = { 
		series: {
			shadowsize: 0,
			points: {show: true},
			lines: {show: true}
		},
		legend: {
			show: true
		},
		grid: {
			backgroundColor: '#FFF',
			hoverable: true,
			clickable: true
		},
		xaxis: {panRange: [0, null], min: 0},
		yaxis: {panRange: false, min: 0},
		pan: { interactive: true}
		};

function createTooltip(posX, posY, time, scaleFactor) {
	
	var divContent = $('<div id="tooltip"></div>');
	var left = posX + 5;
	
	if (tooltipObject['tooltipWidth'] + left > getScreenWidth()) {
		left = posX - 5 - tooltipObject['tooltipWidth'];
	}
	divContent.css({
		position: 'absolute',
		width: tooltipObject['tooltipWidth'] + 'px',
		height: tooltipObject['tooltipHeight'] + 'px',
		top: posY + 5,
		left: left, 
		'background-color': '#FEE',
		'background-image': 'url(images/schermo.fw.png)',
		'background-repeat': 'no-repeat',
		'background-size': '20%',
		'background-position': 'center',
		opacity: 1,
		border: '1px solid',
		display: 'none'
	});
	
	// Recupero oggetto Point per la posizione x e y dell'immagine
	var imagePosition = imagePositions[time];
	var leftImage = imagePosition.left * scaleFactor;
	var topImage = imagePosition.top * scaleFactor;
	
	var arrowFactor = 0.5;
	if (!tooltipObject['arrowWidth']) {
		tooltipObject['arrowWidth'] = tooltipObject['imageWidth'] * arrowFactor;
	}
	
	var arrowLeft = tooltipObject['imageWidth'] / 2 - (tooltipObject['arrowWidth'] / 2);
	var arrowTop = tooltipObject['imageHeight'] / 2 - (tooltipObject['arrowWidth'] / 2);
	
	var divImageSample = $('<div id="divImageSample"></div>');
	divImageSample.appendTo(divContent);
	
	divImageSample.css({
		position: 'absolute',
		width: tooltipObject['imageWidth'] + 'px',
		height: tooltipObject['imageHeight'] + 'px',
		left: leftImage,
		top: topImage,
		'background-color': '#F00'
	});
	
	var imgArrow = $('<img src="../images/arrow_movement.png" alt="Movimento" />');
	imgArrow.appendTo(divImageSample);
	
	imgArrow.css({
		width: tooltipObject['arrowWidth'],
		position: 'absolute',
		left: arrowLeft + 'px',
		top: arrowTop + 'px'
	});
	
	createCssRotation(imgArrow, movements[time]);
	
	divContent.appendTo('body').fadeIn(200);
	
}

function createCssRotation(image, movement) {
	
	var angle = 'none';
	if (movement == 'TL') {
		angle = 'rotate(45deg)';
	}
	if (movement == 'T') {
		angle = 'rotate(90deg)';
	}
	if (movement == 'TR') {
		angle = 'rotate(135deg)'
	}
	if (movement == 'R') {
		angle = 'rotate(180deg)';
	}
	if (movement == 'BR') {
		angle = 'rotate(225deg)';
	}
	if (movement == 'B') {
		angle = 'rotate(270deg)'
	}
	if (movement == 'BL') {
		angle = 'rotate(315deg)';
	}
	image.css({
		transform: angle,
		'-ms-transform': angle,
		'-moz-transform': angle,
		'-webkit-transform': angle,
		'-o-transform': angle
	});
}