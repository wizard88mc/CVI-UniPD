<?php

function manageOfflineCatchMePackets($packets, $folderForFiles, $visitID, $connection) {

	$fileNameInputEyeTracking = $folderForFiles . DIRECTORY_SEPARATOR . 'InputEyeTracking.txt';
	$fileNameInputImage = $folderForFiles . DIRECTORY_SEPARATOR . 'InputImage.txt';
	$fileNameInputTouch = $folderForFiles . DIRECTORY_SEPARATOR . 'InputTouch.txt';
	$fileDelta = $folderForFiles . DIRECTORY_SEPARATOR . 'DeltaValues.txt';
	$fileNameSettings = $folderForFiles . DIRECTORY_SEPARATOR . 'GameSettings.ini';
	
	$fileEyeTracking = fopen($fileNameInputEyeTracking, 'w');
	$fileImage = fopen($fileNameInputImage, 'w');
	$fileTouch = fopen($fileNameInputTouch, 'w');
	$fileResults = fopen($fileNameResults, 'w');
	
	$packetWithSettings = $packets[0];
	
	$imageWidth = $packetWithSettings["IMAGE_WIDTH"];
	$imageHeight = $packetWithSettings["IMAGE_HEIGHT"]; 
	
	$stringScreenDimensions = $packetWithSettings['SCREEN_WIDTH'] . "x"
		. $packetWithSettings["SCREEN_HEIGHT"] . "\r\n";
		
	$stringImageDimensions = $imageWidth . "x"
		. $imageHeight . "\r\n";
		
	$fileSettings = fopen($fileNameSettings, "w");
	fwrite($fileSettings, $stringScreenDimensions);
	fwrite($fileSettings, $stringImageDimensions);
	fclose($fileSettings);
	
	
	for($i = 0; $i < count($packets); $i++) {
		
		$currentPacket = json_decode($packets[$i], true);
		
		if ($currentPacket["TYPE"] == "GAME_DATA" && 
			$currentPacket["SUBTYPE"] == "POSITIONS") {
			
			$time = $currentPacket["TIME"];
			$imagePosition = (array)$currentPacket["IMAGE"];
			$touchPosition = (array)$currentPacket["TOUCH"];
			$movement = $currentPacket["MOVEMENT"];
			
			$stringEye = "(" . $time . ",-1, -1)\r\n";
			$stringTouch = "(" . $time . "," . $touchPosition[0]
				. "," . $touchPosition[1] . ")\r\n";
			$stringImage = "(" . $time . "," . $imagePosition[0]
				. "," . $imagePosition[1] . ")\r\n";
			
			$leftCenterImage = $imagePosition[0] + $imageWidth / 2;
			$topCenterImage = $imagePosition[1] + $imageHeight / 2;
			
			$distanceTouch = round(sqrt(pow($touchPosition[0] - $leftCenterImage, 2) +
				pow($touchPosition[1] - $topCenterImage, 2)));
				
			$stringDelta = "(" . $time . "," . $distanceTouch . ",-1,"
				. $imagePosition[0] . "," . $imagePosition[1] . ","
				. $movement . ")\r\n";
				
			fwrite($fileEyeTracking, $stringEye);
			fwrite($fileImage, $stringImage);
			fwrite($fileDelta, $stringDelta);
			fwrite($fileTouch, $stringTouch);
				
		}
	}

	// invocazione di codice java per 
	// far partire performance analyzer di catchMe
	
}











?>
