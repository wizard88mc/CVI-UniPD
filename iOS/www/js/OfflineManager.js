offlineObjectManager = new Object();
offlineObjectManager.folderWhereWrite = null;
offlineObjectManager.rootDirectoryEntry = null;
offlineObjectManager.arrayOfflineVisits = new Array();
offlineObjectManager.visitsSent = 0;
offlineObjectManager.defaultFolder = 'offline_visits';

var OfflineNamespace = {

    createDirectoryForSave: function(rootDirEntry, folders) {
        // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
        if (folders[0] == '.' || folders[0] == '') {
            folders = folders.slice(1);
        }
        rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
            // Recursively add the new subfolder (if we still have another to create).
            if (folders.length) {
                offlineObjectManager.folderWhereWrite = dirEntry;
                OfflineNamespace.createDirectoryForSave(dirEntry, folders.slice(1));
            }
            else {
                OfflineNamespace.directoriesCreated();
            }
        }, function(err) {
            console.log("Error in creating folders for save");
            console.log(err);
        });
    },
    
    initFs: function(fs) {
    	
    	fs.root.getDirectory(offlineObjectManager.defaultFolder, {create: true}, function(dirEntry) {
    		
    		offlineObjectManager.rootDirectoryEntry = dirEntry;
    		
    		localFileSystemInitializationComplete();
    	}, function(error) {
    		console.log("Error in creating root directory");
    		console.log(error);
    	})
    },

    initFolderForGame: function() {

        var date = new Date();
        var folderGame = date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + date.getDate() + '_' + date.getHours() + '_'
            + date.getMinutes() + '_' + date.getSeconds();

        folderGame = patientID + '/' + folderGame;
        OfflineNamespace.createDirectoryForSave(offlineObjectManager.rootDirectoryEntry, folderGame.split('/'));

        /*fs.root.getDirectory(OfflineNamespace.defaultFolder, {}, function(dirEntry) {
            dirEntry.removeRecursively(function() {
                console.log('Delete complete');
            })
        });*/

        //OfflineNamespace.folderWhereWrite.getFile('game_identification.txt', {create: true, exclusive: true})

    },

    directoriesCreated: function() {

        // SCRIVE NOME DEL GIOCO NEL FILE game_identification.txt
        offlineObjectManager.folderWhereWrite.getFile('game_identification.txt', {create: true, exclusive: true},
            function(fileEntry) {

                fileEntry.createWriter(function(fileWriter) {
                	
                    var bb = new Blob([gameIdentification + "\n"], {type: 'text\plain'});
                    fileWriter.write(bb);

                }, function(error) {
                    console.log("Error in writing game_identification.txt");
                    console.log(error);
                });
            }, function(error) {
                console.log("Error creating game_identification.txt");
                console.log(error);
            });

        folderForOfflineSavingCreated();

        /*offlineObjectManager.folderWhereWrite.getParent(function(dirEntry) {
            dirEntry.getParent(function(dirEntry) {
                dirEntry.removeRecursively(function() {
                    console.log("Delete complete");
                }, function(error){
                    console.log(error);
                })
            })
        });
        /*offlineObjectManager.folderWhereWrite.getParent().getParent().removeRecursively(function() {
            console.log("Delete complete");
        })*/

    },
    
    toArray: function(list) {
    	return Array.prototype.slice.call(list || [], 0);
    },
    
    someVisitsToSend: function() {
    	
    	var dialog = $('<div>').attr('id', 'divDialogAskToSendVisits')
    		.attr('title', 'Inviare visite salvate?').appendTo('body');
    	
    	$('<p>').text('Ci sono delle visite non ancora spedite. Inviarle ora?')
    		.appendTo(dialog);
    	
    	var width = getScreenWidth() * 0.4;
    	dialog.dialog({
    		modal: true,
    		resizable: false,
    		draggable: false,
    		width: width,
    		buttons: {
    			"Invia ora": function() {
    				
    				var dialog = $('<div>').attr('id', 'divDialogSendingVisits')
      				.attr('title', 'Invio in corso').addClass('alignCenter').appendTo('body');
        	
	      			$('<p>').addClass('alignLeft').text('Sto spedendo le visite salvate...')
	      				.appendTo(dialog);
	      			
	      			$('<img>').attr('src', 'images/preloader.gif').attr('alt', 'In spedizione')
	      				.attr('id', 'imgPreloaderSendigOfflineVisits').appendTo(dialog);
	      			
	      			var width = getScreenWidth() * 0.5;
	      	    	dialog.dialog({
	      	    		modal: true,
	      	    		resizable: false,
	      	    		draggable: false,
	      	    		width: width
	      	    	});
	      	    	
	      	    	$(this).remove();
    				
    				if (window.requestFileSystem) {
    					OfflineNamespace.iterateOnPatients();
    				}
    				else {
    					OfflineNamespace.sendFromLocalStorage();
    				}
    			},
    			"Non inviare": function() {
    				$(this).remove();
    			}
    		}
    	});
    }, 
    
    retrieveSubfolders: function(directoryEntry) {
    	
    	var dirReader = directoryEntry.createReader();
    	var subfolders = [];
	
		var readEntries = function() {
	    	dirReader.readEntries (function(results) {
	      		if (results.length) {
	        		subfolders = subfolders.concat(OfflineNamespace.toArray(results));
	        		readEntries();
	      		}
	      		
	    	});
	  	};
	
		readEntries();
		return subfolders;
    },
    
    iterateOnPatients: function() {
    	
    	for (index in offlineObjectManager.arrayOfflineVisits) {
    		
    		var patientID = offlineObjectManager.arrayOfflineVisits[index].name;
    		var subfolders = [];
    		var dirReader = offlineObjectManager.arrayOfflineVisits[index].createReader(); 
    		
    		var readEntries = function() {
		    	dirReader.readEntries (function(results) {
		      		if (results.length) {
		        		subfolders = subfolders.concat(OfflineNamespace.toArray(results));
		        		readEntries();
		      		}
		      		else {
		      			
		      			for (secondIndex in subfolders) {
		      				
		      				OfflineNamespace.workWithOfflineFolder(subfolders[secondIndex]);
		      			}
		      		}
		    	});
		  	};
		
			readEntries();
    		
    		/*offlineObjectManager.arrayOfflineVisits[index].removeRecursively(function() {
    			console.log("Folder rimossa");
    		});*/
    	}
    }, 
    
    workWithOfflineFolder: function(directoryEntry) {
    	
    	var folderName = directoryEntry.name;
    				
		var gameID = this.result;
		
		directoryEntry.getFile('packets.txt', {}, function(fileEntry) {
			
			fileEntry.file(function(filePackets) {
				
				var readerPackets = new FileReader();
				
				readerPackets.onloadend = function(e) {
					
					var packets = JSON.stringify(this.result);
					
					$.ajax({
						url: SERVER_ADDRESS + '/server/OfflinePackets.php',
						type: 'POST',
						data: {
							packets: packets, 
							folderName: folderName
						},
						success: function(message) {
							console.log(message);
							
							if (message == "completed") {
								/*directoryEntry.removeRecursively(function() {
									
									OfflineNamespace.anotherVisitSend();
								});*/
								OfflineNamespace.anotherVisitSend();
							}
						}
						
					});
				}
				
				readerPackets.readAsText(filePackets);
			})
		})
    },
    
    sendFromLocalStorage: function() {
    	
    	var arrayFolderDelete = new Array();
    	
    	for (var i = 0; i < localStorage.length; i++) {
    		
    		var folder = localStorage.key(i);

    		if (checkForLocalStorageIfFolder(folder)) {
    			
    			var packets = JSON.stringify(localStorage.getItem(folder));
    			
    			arrayFolderDelete.push(folder);
    			
    			$.ajax({
    				url: SERVER_ADDRESS + '/server/OfflinePackets.php',
    				type: 'POST',
    				data: {
    					packets: packets,
    					folderName: folder
    				},
    				success: function(message) {

    					if (message == "completed") {
    						OfflineNamespace.anotherVisitSend();
    					}
    				}
    			})
    		}
    	
    	}
    	
    	for (index in arrayFolderDelete) {
    		
    		localStorage.removeItem(arrayFolderDelete[index]);
    	}
    },
    
    anotherVisitSend: function() {
    	
    	var createDialogAllVisitsSent = function() {
    		$('#divDialogSendingVisits').dialog("destroy").remove();
    		
    		var dialog = $('<div>').attr('id', 'divDialogSendingComplete')
				.attr('title', 'Completato!').addClass('alignCenter').appendTo('body');
	
  			$('<p>').addClass('alignLeft').text('Tutte le visite sono state spedite!!')
  				.appendTo(dialog);
  			
  			var width = getScreenWidth() * 0.4;
  	    	dialog.dialog({
  	    		modal: true,
  	    		resizable: false,
  	    		draggable: false,
  	    		width: width,
  	    		buttons: {
  	    			"Chiudi": function() {
  	    				$(this).dialog("close");
  	    				$(this).remove();
  	    			}
  	    		}
  	    	});
    	}
    	
    	if (window.requestFileSystem) {
	    	offlineObjectManager.visitsSent++;
	    	//TODO modificare valore della barra totale di un dialog che mostra stato avanzamento
	    	
	    	if (offlineObjectManager.visitsSent == offlineObjectManager.arrayOfflineVisits.length) {
	    		
	    		offlineObjectManager.rootDirectoryEntry.removeRecursively(function() {
	    			
	    			createDialogAllVisitsSent();
	    			console.log("Visits deleted");
	    		});
	    	}
    	}
    	else {
    		createDialogAllVisitsSent();
    	}
    },
    
    createFolderForOfflineWithLocalStorage: function() {
    	
    	var today = new Date();
    	var folder = patientID + "_" + today.getFullYear() + "_"
    		+ (today.getMonth() + 1) + "_" + today.getDate() + "_"
    		+ today.getHours() + "_" + today.getMinutes() + "_"
    		+ today.getSeconds();
    	
    	saveInLocalStorage(folder, "");
    	
    	return folder;
    	
    }
};