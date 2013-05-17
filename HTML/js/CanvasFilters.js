Filters = {};
Filters.getPixels = function(img) {
	
	var c, ctx;
	if (img.getContext) {
		
		c = img;
		try { ctx = c.getContext('2d'); } catch(e) {}
	}
	if (!ctx) {
		c = this.getCanvas(img.width, img.height);
		ctx = c.getContext('2d');
		ctx.drawImage(img, 0, 0);
	}
	
	return ctx.getImageData(0, 0, c.width, c.height);
};

Filters.getCanvas = function(w, h) {
	
	var c = $('<canvas></canvas>');
	c.width(w);
	c.height(h);
	
	return c;
};

Filters.filterImage = function(filter, image, var_args) {
	
	var args = [this.getPixels(image)];
	for (var i = 2; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	return filter.apply(null, args);
};

Filters.setSpecificColor = function(pixels, red, green, blue) {
	
	var d = pixels.data;
	
	for (var i = 0; i < d.length; i+=4) {
		
		if (!(d[i] == 0 && d[i+1] == 0 && d[i+2] == 0) &&
			!(d[i] == 255 && d[i+1] == 255 && d[i+2] == 255) ) {
			
			d[i] = red;
			d[i+1] = green;
			d[i+2] = blue;
		}
		
	}
	
	return pixels;
};

function runFilter(id, filter, arg1, arg2, arg3) {
	
	var canvas = $('#' + id)[0];
	
	var idata = Filters.filterImage(filter, canvas, arg1, arg2, arg3);
	var ctx = canvas.getContext('2d');
	ctx.putImageData(idata, 0, 0);
}

setSpecificColor = function(id, red, green, blue) {
	
	runFilter(id, Filters.setSpecificColor, red, green, blue);
};
