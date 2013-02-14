/**
 * @author Matteo Ciman
 * 
 * @version 0.1
 */
 
 var doctorID = null;
 var doctorName = null;
 var doctorSurname = null;
 var divPage = null;
 
// PAGE INITIALIZATION
 
var offlineLogin = function(username, password) {

	console.log("offlineLogin");
	console.log(getFromLocalStorage("username"));
	console.log(getFromLocalStorage("password"));
	if (getFromLocalStorage("username") == username && 
			getFromLocalStorage("password") == password) {
			
		var permission = getFromLocalStorage("permission");
		if (permission == "PATIENT") {
			
			var data = new Object();
			data.ID = getFromLocalStorage("patientID");
			data.NAME = getFromLocalStorage("patientName");
			data.SURNAME = getFromLocalStorage("patientSurname");
			data.SEX = getFromLocalStorage("patientSex");
			data.PERMISSION = permission;
			loginCorrect(data);
		}
		else {
			
			$('<p>').text('La modalità offline è disponibile solamente per i bambini e non per i dottori.')
				.appendTo($('<div>').attr('id', 'dialogOfflineDoctor')
						.attr('Impossibile accedere').appendTo($('#divMainContent')));	
			
			var width = getScreenWidth() * 0.5;
			
			$('#dialogOfflineDoctor').dialog({
				width: width,
				modal: true,
				draggable: false,
				resizable: false,
				closeOnEscape: true,
				buttons: {
					"Ok": function() {
						$(this).dialog("close");
						$(this).remove();
					}
				}
			})
		}
	}
}

function checkLogin(e) {
	
	var username = $('#username').val();
	var password = $('#password').val();
	
	if (username == "") {
		$('#usernameRow > td:first').css('color', '#F00');
	}
	if (password == "") {
		$('#passwordRow > td:first').css('color', '#F00');
	}
	if (username == "" || password == "") {
		return;
	}
	else {
		
		if (navigator.onLine) {
			var divDialog = $('<div>').attr('id', 'dialogLogin').attr('title', 'Attendere..');
			$('<p>').text('Login in corso').appendTo(divDialog);
			
			divDialog.appendTo('#divMainContent');
			
			saveInLocalStorage("username", username);
			saveInLocalStorage("password", password);
			
			var width = getScreenWidth() * 0.4;
			
			divDialog.dialog({
				width: width,
				modal: true,
				draggable: false,
				resizable: false,
				closeOnEscape: false,
				open: function() {
					$('a.ui-dialog-titlebar-close').hide();
				}
			})
			
			var pageAddress = SERVER_ADDRESS + '/server/CheckLogin.php'; 
			
			try {
			$.ajax({
				url: SERVER_ADDRESS + '/server/CheckLogin.php',
				type: 'POST',
				data: {username: username, password: MD5(password)},
				success: function(message) {
					
					var data = JSON.parse(message);
					
					if (data.CORRECT == "true") {
						loginCorrect(data);
					}
					else {
						loginIncorrect();
					}
				},
				error: function(message) {
					//console.log(message);
					offlineLogin(username, password);
				}
			});
			}
			catch(e) {
				offlineLogin(username, password);
			}
		}
		else {
			offlineLogin(username, password);	
		}
	}
}

function patientClient(e) {
	
	location.replace('patient/index.html');
}

function doctorClient(e) {
	location.replace('doctor/index.html');
}

function managePatients(e) {
	location.replace('doctor/gestionepazienti.html');
}

function loginCorrect(data) {
	
	setSessionStorage("logged", "true");
	
	if (data.PERMISSION == 'DOCTOR') {
		doctorID = data.ID;
		doctorName = data.NAME;
		doctorSurname = data.SURNAME;
		
		setSessionStorage("doctorName", doctorName);
		setSessionStorage("doctorSurname", doctorSurname);
		setSessionStorage("permission", "DOCTOR");
		setSessionStorage("doctorID", doctorID);
		saveInLocalStorage("permission", "DOCTOR");
		
		secondStepPage();
	}
	else if (data.PERMISSION == 'PATIENT') {
		setSessionStorage("permission", "PATIENT");
		saveInLocalStorage("permission", "PATIENT");
		setSessionStorage("patientID", data.ID);
		saveInLocalStorage("patientID", data.ID);
		setSessionStorage("patientName", data.NAME);
		saveInLocalStorage("patientName", data.NAME);
		setSessionStorage("patientSurname", data.SURNAME);
		saveInLocalStorage("patientSurname", data.SURNAME);
		setSessionStorage("patientSex", data.SEX);
		saveInLocalStorage("patientSex", data.SEX);
		location.replace('patient/index.html');
	}
}

function secondStepPage() {
	
	$('#divButtonLogin').remove();
	$('#tableLogin').remove();
	$('#dialogLogin').dialog("destroy").remove();
	
	if ($('#divHeader').length == 0) {
		builtHeader();
	}
	
	$('#divMainContent').css({
		width: '80%',
		'text-align': 'center'
	});
	
	var title = $('<h2>').attr('id', 'welcomeDoctor')
		.text('Bentornato Dott. '+ doctorName + ' ' + doctorSurname).appendTo('#divMainContent');
	
	
	var logout = $('<img>').attr('id', 'buttonLogout').attr('src', 'images/logout.png').attr('alt', 'Logout').appendTo(title);
	
	logout.on('click', function() {
		
		removeFromSessionStorage("logged");
		removeFromSessionStorage("doctorName");
		removeFromSessionStorage("doctorSurname");
		removeFromSessionStorage("doctorID");
		removeFromSessionStorage("permission")
		location.replace('index.html');
	});
	
	var divSceltaOperazione = 
		$('<div>').attr('id', 'divSceltaOperazione')
		.css('width', '70%')
		.css('margin', 'auto')
		.css('padding-bottom', '2.0em');
						
	var buttonManagePatients = $('<button>').attr('id', 'managePatients').text('Gestione Bambini').button();
	buttonManagePatients.click(managePatients);
	var buttonDoctorClient = $('<button>').attr('id', 'doctorClient').text('Schermo Dottore').button();
	buttonDoctorClient.click(doctorClient);
	var buttonPatientClient = $('<button>').attr('id', 'patientClient').text('Schermo Bambino').button();
	buttonPatientClient.click(patientClient);
	
	buttonManagePatients.appendTo(divSceltaOperazione);
	buttonDoctorClient.appendTo(divSceltaOperazione);
	buttonPatientClient.appendTo(divSceltaOperazione);
	
	divSceltaOperazione.appendTo('#divMainContent');
	
	$('#divSceltaOperazione > button').css({
		'padding-top': '1.5em',
		'padding-bottom': '1.5em',
		'font-size': '1.5em',
		margin: '0.5em'
	});
}

function localFileSystemInitializationComplete() {
	
	var dirReader = offlineObjectManager.rootDirectoryEntry.createReader();
	
	var readEntries = function() {
    	dirReader.readEntries (function(results) {
      		if (results.length) {
        		offlineObjectManager.arrayOfflineVisits = offlineObjectManager.arrayOfflineVisits
        			.concat(OfflineNamespace.toArray(results));
        		readEntries();
      		}
      		else {
      			console.log(offlineObjectManager.arrayOfflineVisits);
      			if (offlineObjectManager.arrayOfflineVisits.length) {
      				OfflineNamespace.someVisitsToSend();
      			}
      		}
    	});
  	};

	readEntries();
	
}

function checkLocalStorageForOfflineExercises() {
	
	var count = 0;
	for (var i = 0; i < localStorage.length; i++) {
		
		var folder = localStorage.key(i);
		
		if (checkForLocalStorageIfFolder(folder)) {
			count = count + 1;
		}
	}
	
	if (count > 0) {
		OfflineNamespace.someVisitsToSend();
	}
}

function loginIncorrect() {
	removeFromLocalStorage("username");
	removeFromLocalStorage("password");
	
	$('#dialogLogin').dialog("destroy").remove();
	
	$('<p>').text('Username e password inseriti non corretti. ').appendTo(
			$('<div>').attr('id', 'dialogErrorLogin').attr('title', 'Errore!')
			.appendTo('#divMainContent'));
		
	var width = getScreenWidth() * 0.5;
		
	$('#dialogErrorLogin').dialog({
		modal: true, 
		width: width,
		buttons: {
			Ok: function() {
				$(this).dialog("close");
				$(this).remove();
			}
		}, 
		resizable: false,
		draggable: false
	});
}

/**
 * Checks if a user is already logged or not 
 */
function checkAlreadyLogged() {
	
	var logged = getFromSessionStorage("logged");
	if (logged == "true") {
		return true;
	}
	else { return false;}
	
}

/*$(document).ready(function(e) {

//$(document).on('deviceready', function(e) {
	var appCache = window.applicationCache;
	
	$('<img>').attr('src', 'images/preloader.gif')
	.attr('id', 'preloaderWaitingCache').prependTo('body');
	
	appCache.addEventListener('updateready', cacheUpdateReady, false);
	appCache.addEventListener('cached', operationsCacheFinished, false);
	appCache.addEventListener('noupdate', operationsCacheFinished, false);
	appCache.addEventListener('error', operationsCacheFinished, false);
	appCache.addEventListener('obsolete', operationsCacheFinished, false);
	appCache.addEventListener('progress', progressFunctionCache, false);
	
	try {
		appCache.update();
	}
	catch(e) {
		operationsCacheFinished(e);
	}
    
});*/

$(document).ready(function(e) {
                  initPage();
               });

function initPage() {
	
	$('#preloaderWaitingCache').remove();
	
	$('<div>').attr('id', 'divMainContent').appendTo('body');
	
	var alreadyLogged = checkAlreadyLogged();
	
	if (alreadyLogged) {
		if (getFromSessionStorage("permission") == "DOCTOR") {
			doctorName = getFromSessionStorage("doctorName");
			doctorSurname = getFromSessionStorage("doctorSurname");
			secondStepPage();
		}
		else if (getFromSessionStorage("permission") == "PATIENT") {
			location.replace('patient/index.html');
		}
	}
	else {
		
		builtHeader();
		
		var tableLogin = $('<table>').attr('id', 'tableLogin').appendTo('#divMainContent');
		$('<tbody>').appendTo(tableLogin);
        
        $('<tr>').attr('id', 'usernameRow').appendTo(tableLogin);
        $('<td>').addClass('label').text('Username: ').appendTo('#usernameRow');
        $('<input>').attr('type', 'text').attr('id', 'username').attr('name', 'username').appendTo($('<td>').appendTo('#usernameRow'));
		
        $('<tr>').attr('id', 'passwordRow').appendTo(tableLogin);
        $('<td>').addClass('label').text('Password: ').appendTo('#passwordRow');
        $('<input>').attr('type', 'password').attr('id', 'password').attr('name', 'password').appendTo($('<td>').appendTo('#passwordRow'));
        
		$('input').addClass('inputText');
		
		$('td:.label').css('text-align', 'right');
		
		if (getFromLocalStorage("username") != "") {
			$('#username').attr({'value': getFromLocalStorage('username')});
		}
		if (getFromLocalStorage("password") != "") {
			$('#password').attr({'value': getFromLocalStorage('password')});
		}
		
		$('<button>').attr('id', 'buttonLogin').text('Login').appendTo(
				$('<div>').attr('id', 'divButtonLogin').addClass('alignCenter').appendTo('#divMainContent'));
		
		$('#buttonLogin').button();
		$('#buttonLogin').click(checkLogin);
		
		if (!navigator.onLine && !getFromLocalStorage('username') 
				&& !getFromLocalStorage('password') && !getFromLocalStorage('permission')) {
			
			$('<p>').text("Per poter utilizzare l'applicazione in modalità offline è necessario collegarsi alla rete almeno una volta.").appendTo(
					$('<div>').attr('id', 'dialogNeverConnected').attr('title', 'Errore!')
					.appendTo('#divMainContent'));
				
			$('#dialogNeverConnected').dialog({
				modal: true,
                resizable: false,
                draggable: false,
                closeOnEscape: false,
				buttons: {
					Ok: function() {
						$(this).dialog("close");
						$(this).remove();
					}
				}, 
				resizable: false,
				draggable: false
			});
		}
		
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		
		if (window.requestFileSystem) {

		    window.webkitStorageInfo.requestQuota(window.PERSISTENT, 10*1024*1024, function(grantedBytes) {
		
		        window.requestFileSystem(window.PERSISTENT, grantedBytes, OfflineNamespace.initFs, function(error) {
		            console.log("No space received");
		        })
		    }, function(error) {
		        console.log("No space allowed");
		        console.log(error);
		    });
		}
		else {
			checkLocalStorageForOfflineExercises();
		}
		
	}
};