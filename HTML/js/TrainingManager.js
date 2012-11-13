var ImageForTraining = function() {
	
	this.image = new Image();
	this.image.onload = function() {
		
		TrainingExamplesNamespace.imageLoaded();
	}
	this.element = null;
	this.width = 0;
	this.height = 0;
	this.center = new Point(0, 0);
	this.drawPosition = new Point(0, 0);
	
	this.moveObject = function(pointCenter) {
		this.center = pointCenter;
		
		this.drawPosition.top = this.center.top - 
			this.height / 2;
		
		this.drawPosition.left = this.center.left - 
			this.width / 2;
	}
	
	this.drawObject = function() {
		this.element.css({
			left: this.drawPosition.left,
			top: this.drawPosition.top
		});
	}
	
}

var imageForTraining = null;

var TrainingExamplesNamespace = {
	
	startingTraining: function() {
		
		websocket.onmessage = TrainingExamplesNamespace.messageManager;
		
		imageForTraining = new ImageForTraining();
	},
	
	imageLoaded: function() {
		
		imageForTraining.element = $(imageForTraining.image)
			.attr('id', 'imageTraining')
			.appendTo('#divMainContent');
			
		var aspectRatio = imageForTraining.image.naturalWidth / 
			imageForTraining.image.naturalHeight;
		
		var height = getImageHeight() * 0.3;
		var width = aspectRatio * height;
		
		imageForTraining.element.css({
			opacity: '0',
			width: width,
			height: height
		});
		
		var center = new Point(getScreenHeight() / 2, getScreenWidth() / 2);
		
		imageForTraining.moveObject(center);
		imageForTraining.drawObject();
	}

	messageManager: function(message) {
		
		var data = JSON.parse(data);
		
		if (data.TYPE == "TRAINING_POSITIONS") {
			
			var centerToDraw = new Point(data.POS_TOP, data.POS_LEFT);
			
			imageForTraining.moveObject(centerToDraw);
			imageForTraining.drawObject();
		}
	}

}