function operationsCacheFinished(e) {
	
	if (e.code && e.code == 11) {
		return;
	}
	var appCache = window.applicationCache;
	appCache.removeEventListener('cached', operationsCacheFinished, false);
	appCache.removeEventListener('updateReady', cacheUpdateReady, false);
	appCache.removeEventListener('noupdate', operationsCacheFinished, false);
	appCache.removeEventListener('error', operationsCacheFinished, false);
	appCache.removeEventListener('obsolete', operationsCacheFinished, false);
	
	console.log("calling initPage");
	initPage();
}

function cacheUpdateReady(e) {
	
	if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
		window.applicationCache.swapCache();
		operationsCacheFinisched(null);
	}
}