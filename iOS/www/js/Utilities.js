/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */

window.URL = window.URL || window.webkitURL;

SERVER_ADDRESS = 'http://ciman.math.unipd.it';
//SERVER_ADDRESS = 'http://localhost/CVI/HTML';


function Point() {
	this.top = -1;
	this.left = -1;
}

function Point(topP, leftP) {
	this.top  = topP;
	this.left = leftP;	
}


function getScreenWidth() {
	return $(window).width();
}

function getScreenHeight() {
	return $(window).height();
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function removeMeasureUnit(message) {
	
	return message.replace(new RegExp("[a-z]+"), "");
}

function checkAlreadySync() {
	
	return localStorage.getItem("machineID");
}

function getAddress() {
	var host = window.location.host;
	
	if (host == "localhost") {
		return "/CVI/HTML";
	}
	else return "";
}

function getAddressForWebsocket() {
	
	return window.location.host;
}

function builtHeader() {
	var divHeader = $('<div>').attr('id', 'divHeader')
		.addClass('ui-widget-header alignCenter').appendTo('#divMainContent');
	
	$('<h1>').text('Cortical Visual Impairment').appendTo(divHeader);
	$('<h2>').text('Assessment in Web').appendTo(divHeader);
}

function setCookie(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++) {
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	 	y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  	x=x.replace(/^\s+|\s+$/g,"");
	  	if (x==c_name) {
	    	return unescape(y);
	    }
  	}
}

function saveInLocalStorage(key, value) {
	
	if (localStorage == null) {
		setCookie(key, value, 10);
	}
	else {
		localStorage.setItem(key,value);
	}
}

function getFromLocalStorage(key) {
	
	if (localStorage == null) {
		return getCookie(key);
	}
	else {
		if (localStorage.getItem(key) != null) {
			return localStorage.getItem(key);
		}
		else {
			return "";
		}
	}
}

function removeFromLocalStorage(key) {
	
	if (localStorage == null) {
		setCookie(key, "", -1);	
	}
	else {
		localStorage.removeItem(key);
	}
}

function setSessionStorage(key, value) {
	
	if (sessionStorage == null) {
		setCookie(key, value, 1);
	}
	else {
		sessionStorage.setItem(key, value);
	}
}

function getFromSessionStorage(key) {
	if (sessionStorage == null) {
		return getCookie(key);
	}
	else {
		if (sessionStorage.getItem(key) != null) {
			return sessionStorage.getItem(key);
		}
		else return "";
	}
}

function removeFromSessionStorage(key) {
	
	if (sessionStorage == null) {
		setCookie(key, "", -1);
	}
	else {
		if (sessionStorage.getItem(key) != null) {
			sessionStorage.setItem(key, "");
		}
	}
}

/**
 * Costruisce valore decimale del colore 
 * definito inizialmente come RGB
 * @param {Object} r: red component
 * @param {Object} g: green component
 * @param {Object} b: blue component
 */
function hexFromRGB(r, g, b) {
	var hex = [
		r.toString( 16 ),
		g.toString( 16 ),
		b.toString( 16 )
	];
	
	$.each( hex, function( nr, val ) {
		if ( val.length === 1 ) {
			hex[ nr ] = "0" + val;
		}
	});
	
	return hex.join( "" ).toUpperCase();
}

function cutHex(h) {
	return (h.charAt(0)=="#") ? h.substring(1,7):h
}
function hexToR(h) {
	return parseInt((cutHex(h)).substring(0,2),16)
}
function hexToG(h) {
	return parseInt((cutHex(h)).substring(2,4),16)
}
function hexToB(h) {
	return parseInt((cutHex(h)).substring(4,6),16)
}

/**
 * 
 * @param {Object} backgroundColor: array with the RGB components
 * @param {Object} foregroundColor: array with the RGB components
 */
function checkColorContrast(backgroundColor, foregroundColor) {
	
	var totalSum = Math.max(backgroundColor[0], foregroundColor[0]) - 
					Math.min(backgroundColor[0], foregroundColor[0]) + 
					Math.max(backgroundColor[1], foregroundColor[1]) - 
					Math.min(backgroundColor[1], foregroundColor[1]) + 
					Math.max(backgroundColor[2], foregroundColor[2]) -
					Math.min(backgroundColor[2], foregroundColor[2]);
					
	return totalSum > 500; 
}

function addSoundSource(element, sourceFileName) {
	
	$('<source>').attr('src', 'sounds/' + sourceFileName + '.ogg').attr('type', 'audio/ogg').attr('preload', 'auto').appendTo(element);
	$('<source>').attr('src', 'sounds/' + sourceFileName + '.mp3').attr('type', 'audio/mpeg').attr('preload', 'auto').appendTo(element);
}

function checkForLocalStorageIfFolder(folder) {
	
	var pattern = /^\d_\d{4}_\d+_\d+_\d+_\d+_\d+/i;
	var isCorrect = pattern.test(folder);
	
	return isCorrect;
}

function addTransitionSpecifications(element, transition) {
	
	element.css({
		transition: transition,
		'webkit-transition': transition,
		'-moz-transition': transition,
		'-o-transition': transition
	});
}

function addTransformSpecifications(element, transform) {
	
	element.css({
		transform: transform,
		'-webkit-transform': transform,
		'-moz-transform': transform,
		'-o-transform': transform
	});
}

