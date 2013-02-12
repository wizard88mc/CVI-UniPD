elementsDownloaded = 1;

function operationsCacheFinished(e) {
	
	console.log("operationsCacheFinished");
	if (e != null && e.code && e.code == 11) {
		return;
	}
	var appCache = window.applicationCache;
	appCache.removeEventListener('cached', operationsCacheFinished, false);
	appCache.removeEventListener('updateready', cacheUpdateReady, false);
	appCache.removeEventListener('noupdate', operationsCacheFinished, false);
	appCache.removeEventListener('error', operationsCacheFinished, false);
	appCache.removeEventListener('obsolete', operationsCacheFinished, false);
	appCache.removeEventListener('progress', progressFunctionCache, false);
	
	console.log("calling initPage");
	initPage();
}

function cacheUpdateReady(e) {
	
	var cache = window.applicationCache;
	setTimeout(function() {
		if (cache.status == cache.UPDATEREADY) {
			cache.swapCache();
			operationsCacheFinished(null);
		}
	}, 1000);
	
}

function progressFunctionCache(e) {
	console.log("downloading element: " + elementsDownloaded);
	elementsDownloaded++;
}