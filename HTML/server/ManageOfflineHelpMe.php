<?php

function manageOfflineHelpMePackets($packets, $folderForFiles, $visitID, $connection) {

	$fileNameInputEyeTracking = $folderForFiles . DIRECTORY_SEPARATOR . 'InputEyeTracking.txt';
	$fileNameInputImage = $folderForFiles . DIRECTORY_SEPARATOR . 'InputImage.txt';
	$fileNameInputTouch = $folderForFiles . DIRECTORY_SEPARATOR . 'InputTouch.txt';
	$fileNameResults = $folderForFiles . DIRECTORY_SEPARATOR . 'Results.txt';
	
	$totalPackets = 0;
	$totalCorrect = 0;
	$totalIncorrect = 0;
	$sumFRT = 0;
	$sumCompletionTime = 0;
	
	
	$fileEyeTracking = fopen($fileNameInputEyeTracking, 'w');
	$fileImage = fopen($fileNameInputImage, 'w');
	$fileTouch = fopen($fileNameInputTouch, 'w');
	$fileResults = fopen($fileNameResults, 'w');

	for ($i = 1; $i < count($packets); $i++) {
		
		$jsonPacket = json_decode($packets[$i], true);
		
		if ($jsonPacket['TYPE'] == 'GAME_DATA') {
			
			if ($jsonPacket['SUBTYPE'] == 'POSITIONS') {
				
				$positionsTouch = (array)$jsonPacket['TOUCH'];
				$positionsImage = (array)$jsonPacket['IMAGE'];
				
				$stringForImage = '(' . $jsonPacket['TIME']
					. ',' . $positionsImage[0] . ','
					. $positionsImage[1] . ')' . "\r\n";
					
				$stringForTouch = '('. $jsonPacket['TIME']
					. ',' . $positionsTouch[0] . ','
					. $positionsTouch[1] . ')' . "\r\n";
					
				fwrite($fileImage, $stringForImage);
				fwrite($fileTouch, $stringForTouch);
			}
			else if ($jsonPacket['SUBTYPE'] == 'SESSION_RESULTS') {
				
				$isTarget = $jsonPacket['IS_TARGET'] ? 'true': 'false';
				$rightAnswer = $jsonPacket['RIGHT_ANSWER'] ? 'true' : 'false';
				
				$stringToWrtite = '(' . $jsonPacket['TARGET_FAMILY'] . ','
					. $isTarget . ','
					. $jsonPacket['OBJECT_NAME'] . ','
					. $jsonPacket['FIRST_RESPONSE_TIME'] . ','
					. $jsonPacket['COMPLETION_TIME'] . ',' 
					. $rightAnswer . ')' . "\r\n";
				
				fwrite($fileResults, $stringToWrtite);
				
				$sumFRT += $jsonPacket['FIRST_RESPONSE_TIME'];
				$sumCompletionTime += $jsonPacket['COMPLETION_TIME'];
				$totalPackets++;
				if ($jsonPacket['RIGHT_ANSWER'] == true) {
					$totalCorrect++;
				}
				else {
					$totalIncorrect++;
				} 
			}
		}
	}
	
	$sumCompletionTime = (int)($sumCompletionTime / $totalPackets);
	$sumFRT = (int)($sumFRT / $totalPackets);
	
	// query per inserire totali
	$queryInsertReportVisit = "INSERT INTO HelpMeEvaluation(IDVisit, FirstResponseTime, CompletionTime, CorrectAnswers, WrongAnswers)
								VALUES ($visitID, $sumFRT, $sumCompletionTime, $totalCorrect, $totalIncorrect)";
								
	mysqli_query($connection, $queryInsertReportVisit) or die(mysqli_error($connection));
	
	fclose($fileResults);
	fclose($fileImage);
	fclose($fileTouch);
	fclose($fileEyeTracking);
}


?>