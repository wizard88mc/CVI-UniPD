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
			var divDialog = $('<div id="dialogLogin" title="Attendere.."><p>Login in corso. . .</p></div>');
			
			divDialog.appendTo(divPage);
			
			saveInLocalStorage("username", username);
			saveInLocalStorage("password", password);
			
			password = MD5(password);
			
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
			
			$.ajax({
				url: 'server/CheckLogin.php',
				type: 'POST',
				data: {username: username, password: password},
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
					loginIncorrect();
				}
			});
		}
		else {
			if (getFromLocalStorage("username") == username && 
				getFromLocalStorage("password") == password) {
				
				var permission = getFromLocalStorage("permission");
				if (permission == "PATIENT") {
					patientClient();
				}
				else {
					console.log("Loggato come dottore");
				}
			}			
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
	
	if (data.PERMISSION == 'DOCTOR') {
		doctorID = data.ID;
		doctorName = data.NAME;
		doctorSurname = data.SURNAME;
		
		setSessionStorage("doctorName", doctorName);
		setSessionStorage("doctorSurname", doctorSurname);
		setSessionStorage("permission", "DOCTOR");
		setSessionStorage("doctorID", doctorID);
		
		setSessionStorage("logged", "true");
		
		secondStepPage();
	}
	else if (data.PERMISSION == 'PATIENT') {
		setSessionStorage("permission", "PATIENT");
		setSessionStorage("patientID", data.ID);
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
	
	divPage.css('width', '80%').css('text-align', 'center');
	
	var title = $('<h2 id="welcomeDoctor">Bentornato Dott. '+ doctorName + ' ' + doctorSurname + '</h2>').appendTo(divPage);
	
	
	var logout = $('<img id="buttonLogout" src="images/logout.png" alt="Logout" />').appendTo(title);
	
	logout.on('click', function() {
		
		removeFromSessionStorage("logged");
		removeFromSessionStorage("doctorName");
		removeFromSessionStorage("doctorSurname");
		location.replace('index.html');
	})
	
	var divSceltaOperazione = $('<div id="divSceltaOperazione"></div>');
	divSceltaOperazione.css('width', '70%')
						.css('margin', 'auto')
						.css('padding-bottom', '2.0em');
						
	var buttonManagePatients = $('<button id="managePatients">Gestione Pazienti</button>').button();
	buttonManagePatients.click(managePatients);
	var buttonDoctorClient = $('<button id="doctorClient">Schermo Dottore</button>').button();
	buttonDoctorClient.click(doctorClient);
	var buttonPatientClient = $('<button id="patientClient">Schermo paziente</button>').button();
	buttonPatientClient.click(patientClient);
	
	buttonManagePatients.appendTo(divSceltaOperazione);
	buttonDoctorClient.appendTo(divSceltaOperazione);
	buttonPatientClient.appendTo(divSceltaOperazione);
	
	divSceltaOperazione.appendTo(divPage);
	
	$('#divSceltaOperazione > button')
					.css('padding-top', '1.5em')
					.css('padding-bottom', '1.5em')
					.css('font-size', '1.5em')
					.css('margin', '0.5em');
					
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

function loginIncorrect() {
	removeFromLocalStorage("username");
	removeFromLocalStorage("password");
	
	$('#dialogLogin').dialog("destroy").remove();
	
	$('<div id="dialogErrorLogin" title="Errore!"><p>Username e password inseriti non corretti. </p></div>')
		.appendTo(divPage);
		
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

$(document).ready(function(e) {
    
	divPage = $('#divMain');
	
	var alreadyLogged = checkAlreadyLogged();
	
	if (alreadyLogged) {
		doctorName = getFromSessionStorage("doctorName");
		doctorSurname = getFromSessionStorage("doctorSurname");
		secondStepPage();
	}
	else {
		
		builtHeader();
		
		var tableLogin = $('<table id="tableLogin"><tbody></tbody></table>');
		
		$('<tr id="usernameRow"><td class="label">Username: </td><td><input type="text" id="username" name="username" /></td></tr>').appendTo(tableLogin);
		$('<tr id="passwordRow"><td class="label">Password: </td><td><input type="password" id="password" name="password" /></td></tr>').appendTo(tableLogin);
		
		tableLogin.appendTo(divPage);
		
		$('input').addClass('inputText');
		
		$('td:.label').css('text-align', 'right');
		
		if (getFormLocalStorage("username") != "") {
			$('#username').attr({'value': getFormLocalStorage('username')});
		}
		if (getFormLocalStorage("password") != "") {
			$('#password').attr({'value': getFormLocalStorage('password')});
		}
		
		$('<div id="divButtonLogin" class="alignCenter"><button id="buttonLogin">Login</button></div>').appendTo(divPage);
		$('#buttonLogin').button();
		$('#buttonLogin').click(checkLogin);
		//$('#buttonLogin').click(secondStepPage);
		
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

	    window.webkitStorageInfo.requestQuota(window.PERSISTENT, 10*1024*1024, function(grantedBytes) {
	
	        window.requestFileSystem(window.PERSISTENT, grantedBytes, OfflineNamespace.initFs, function(error) {
	            console.log("No space received");
	        })
	    }, function(error) {
	        console.log("No space allowed");
	        console.log(error);
	    });
		
	}
});