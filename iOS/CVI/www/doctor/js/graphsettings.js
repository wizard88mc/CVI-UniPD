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
		xaxis: {panRange: [0, null], min: 0, axisLabel : 'Tempo (ms)'},
		yaxis: {panRange: false, min: 0, axisLabel: 'Errore (pixels)'},
		pan: { interactive: true}
		};

function createTooltip(posX, posY, time, scaleFactor) {
	
	var divContent = $('<div>').attr('id', 'tooltip');
	var left = posX + 5;
	
	if (tooltipObject['tooltipWidth'] + left > getScreenWidth()) {
		left = posX - 5 - tooltipObject['tooltipWidth'];
	}
	if (tooltipObject['tooltipHeight'] + posY > getScreenHeight()) {
		posY = posY - tooltipObject['tooltipHeight'];
	}
	
	divContent.css({
		position: 'absolute',
		width: tooltipObject['tooltipWidth'] + 'px',
		height: tooltipObject['tooltipHeight'] + 'px',
		top: posY + 5,
		left: left, 
		'background-color': '#FEE',
		'background-image': 'url(images/schermo2.fw.png)',
		'background-repeat': 'no-repeat',
		'background-size': '100% 100%',
		'background-position': 'center',
		opacity: 1,
		border: '1px solid',
		display: 'none'
	});
	
	var dimension = (tooltipObject['tooltipWidth'] * 8) / 100;
	
	var eyesPosition = eyesPositions[time];
	
	if (eyesPosition.left != -1 && eyesPosition.top != -1) {
		var leftEyes = eyesPosition.left * scaleFactor;
		var topEyes = eyesPosition.top * scaleFactor;
		
		leftEyes = leftEyes - (dimension / 2);
		topEyes = topEyes - (dimension / 2);
		
		$('<img src="images/eye.png" />').appendTo(divContent)
			.css({
				position: 'absolute',
				width: dimension,
				height: dimension,
				left: leftEyes,
				top: topEyes,
				'z-index': 2 
			});
	}
	
	var touchPosition = touchPositions[time];
	
	if (touchPosition.left != -1 && touchPosition.top != -1) {
		var leftTouch = touchPosition.left * scaleFactor;
		var topTouch = touchPosition.top * scaleFactor;
		leftTouch = leftTouch - (dimension / 2);
		
		$('<img src="images/hand_finger.png" />').appendTo(divContent)
			.css({
				position: 'absolute',
				width: dimension,
				height: dimension,
				left: leftTouch,
				top: topTouch,
				'z-index': 3
			});
	}
	
	// Recupero oggetto Point per la posizione x e y dell'immagine
	var imagePosition = imagePositions[time];
	var leftImage = imagePosition.left * scaleFactor;
	var topImage = imagePosition.top * scaleFactor;
	
	var arrowFactor = 0.5;
	
	tooltipObject['arrowWidth'] = tooltipObject['imageWidth'] * arrowFactor;
	
	
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