<?php

function manageOfflineCatchMePackets($packets, $folderForFiles, $visitID, $connection) {
	
	$fileNameInputEyeTracking = $folderForFiles . DIRECTORY_SEPARATOR . 'InputEyeTracking.txt';
	$fileNameInputImage = $folderForFiles . DIRECTORY_SEPARATOR . 'InputImage.txt';
	$fileNameInputTouch = $folderForFiles . DIRECTORY_SEPARATOR . 'InputTouch.txt';
	$fileNameDelta = $folderForFiles . DIRECTORY_SEPARATOR . 'DeltaValues.txt';
	$fileNameSettings = $folderForFiles . DIRECTORY_SEPARATOR . 'GameSpecs.ini';
	
	$fileEyeTracking = fopen($fileNameInputEyeTracking, 'w');
	$fileImage = fopen($fileNameInputImage, 'w');
	$fileTouch = fopen($fileNameInputTouch, 'w');
	$fileDelta = fopen($fileNameDelta, 'w');
	
	
	for($i = 1; $i < count($packets); $i++) {
		
		$currentPacket = json_decode($packets[$i], true);
		
		if ($currentPacket["TYPE"] == "GAME_DATA" && 
			$currentPacket["SUBTYPE"] == "POSITIONS") {
			
			$time = $currentPacket["TIME"];
			$imagePosition = (array)$currentPacket["IMAGE"];
			$touchPosition = (array)$currentPacket["TOUCH"];
			$movement = $currentPacket["MOVEMENT"];
			
			$stringEye = "(" . $time . ",-1,-1)\r\n";
			$stringTouch = "(" . $time . "," . $touchPosition[0]
				. "," . $touchPosition[1] . ")\r\n";
			$stringImage = "(" . $time . "," . $imagePosition[0]
				. "," . $imagePosition[1] . ")\r\n";
			
			$leftCenterImage = $imagePosition[0] + $imageWidth / 2;
			$topCenterImage = $imagePosition[1] + $imageHeight / 2;
			
			$distanceTouch = -1;
			
			if ((int)$touchPosition[0] != -1 && (int)$touchPosition[1] != -1) {
			
				$distanceTouch = round(sqrt(pow((int)$touchPosition[0] - $leftCenterImage, 2) +
					pow((int)$touchPosition[1] - $topCenterImage, 2)));
			}
				
			$stringDelta = "(" . $time . "," . $distanceTouch . ",-1,"
				. $imagePosition[0] . "," . $imagePosition[1] . ","
				. $movement . ")\r\n";
				
			fwrite($fileEyeTracking, $stringEye);
			fwrite($fileImage, $stringImage);
			fwrite($fileDelta, $stringDelta);
			fwrite($fileTouch, $stringTouch);
				
		}
		else if ($currentPacket["TYPE"] == "READY_TO_PLAY") {
			
			$imageWidth = $currentPacket["IMAGE_WIDTH"];
			$imageHeight = $currentPacket["IMAGE_HEIGHT"];
			
			$stringScreenDimensions = $currentPacket['SCREEN_WIDTH'] . "x"
					. $currentPacket["SCREEN_HEIGHT"] . "\r\n";
			
			$stringImageDimensions = $imageWidth . "x"
					. $imageHeight . "\r\n";
			
			$fileSettings = fopen($fileNameSettings, "w");
			
			fwrite($fileSettings, $stringScreenDimensions);
			fwrite($fileSettings, $stringImageDimensions);
			fclose($fileSettings);
		}
	}
	
	fclose($fileEyeTracking);
	fclose($fileImage);
	fclose($fileDelta);
	fclose($fileTouch);
	
	$stringToRemove = "WebsocketServer" . DIRECTORY_SEPARATOR;
	
	// invocazione di codice java per
	// far partire performance analyzer di catchMe
	
	$array = Array();
	
	$parameters = "$fileNameInputImage $fileNameInputEyeTracking $fileNameInputTouch $fileNameSettings $visitID";
	
	exec("java -jar WebsocketServer" . DIRECTORY_SEPARATOR . "dist" . DIRECTORY_SEPARATOR  . "WebSocketServer.jar $parameters", $array);
	
	print_r($array);
}



?>
