
function cacheEventHandler() {
	
	var status = window.applicationCache.status;

	switch(status) {
	case window.applicationCache.UPDATEREAY: 
		window.applicationCache.swapCache();
	}
}

function registerCacheEvents() {
	
	window.applicationCache.addEventListener('updateready', cacheEventHandler);
}