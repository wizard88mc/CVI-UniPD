<?php

require_once('DBParameters.php');

$replace = array("\r\n", "\r", "\n");

$visitID = $_POST['visitID'];

$querySelectFolder = "SELECT Folder, IDPatient FROM Visits WHERE ID = $visitID";

$resultQuerySelectFolder = mysqli_query($connection, $querySelectFolder) or die("Error in select folder: " + mysqli_error($connection));

$row = mysqli_fetch_array($resultQuerySelectFolder);

$arrayResult = array();

$folder = $row[0];

$fileNameDelta = str_replace('/', DIRECTORY_SEPARATOR, "WebsocketServer/" . $folder . "DeltaValues.txt");
$fileNameImagePositions = str_replace('/', DIRECTORY_SEPARATOR, 'WebsocketServer/' . $folder . "InputImage.txt");
$fileNameTouchPositions = str_replace('/', DIRECTORY_SEPARATOR, 'WebsocketServer/' . $folder . "InputTouch.txt");
$fileNameEyesPositions = str_replace('/', DIRECTORY_SEPARATOR, 'WebsocketServer/' . $folder . "InputEyeTracking.txt");
$fileNameSettings = str_replace('/', DIRECTORY_SEPARATOR, 'WebsocketServer/' . $folder . 'GameSpecs.ini');

$fileSettings = fopen($fileNameSettings, "r") or die($fileNameSettings);

if ($fileSettings != 0) {
		
	$lineScreenSettings = str_replace($replace, '', fgets($fileSettings));
	$lineImageSettings = str_replace($replace, '', fgets($fileSettings));
	
	$imageSettings = explode('x', $lineImageSettings);
	$screenSettings = explode('x', $lineScreenSettings);
	
	$arrayResult["IMAGE_SPECS"] = array("IMG_SPECS" => $imageSettings, 
	 						"SCREEN_SPECS" => $screenSettings);
}

$fileDelta = fopen($fileNameDelta, "r") or die($fileNameDelta);
$fileImage = fopen($fileNameImagePositions, "r") or die($fileNameImagePositions);
$fileTouch = fopen($fileNameTouchPositions, "r") or die($fileNameTouchPositions);
$fileEyes = fopen($fileNameEyesPositions, "r") or die($fileNameEyesPositions);

// c'è il file dell'eye tracking
if ($fileDelta != 0) {
	
	while (!feof($fileDelta)) {
		
		$line = fgets($fileDelta);
		$line = str_replace('(', '', str_replace(')', '', $line));
		$components = explode(',', $line);
		
		$lineImage = fgets($fileImage);
		$lineImage = str_replace(array('(', ')'), '', $lineImage);
		$componentsImage = explode(',', $lineImage); // in 1 c'è left, in 2 c'è top
		
		$lineTouch = fgets($fileTouch);
		$lineTouch = str_replace(array('(', ')'), '', $lineTouch);
		$componentsTouch = explode(',', $lineTouch);
		
		$lineEyes = fgets($fileEyes);
		$lineEyes = str_replace(array('(', ')'), '', $lineEyes);
		$componentsEyes = explode(',', $lineEyes);
		
		while ($componentsImage[0] != $components[0]) {
			$line = fgets($fileDelta);
			$line = str_replace('(', '', str_replace(')', '', $line));
			$components = explode(',', $line);
		}
		
		// [0] c'è il tempo, [1] delta touch, [2] delta eye, [3] image pos left
		// [4] image pos top, [5] movement
		
		if (count($components) > 1) {
		
			$informations = array(
				"DELTA_TOUCH" => (int)str_replace($replace, "", $components[1]),
				"DELTA_EYE" => (int)str_replace($replace, "", $components[2]),
				"IMG_LEFT" => (int)str_replace($replace, "", $components[3]),
				"IMG_RIGHT" => (int)str_replace($replace, "", $components[4]),
				"MOVEMENT" => (int)str_replace($replace, "", $components[5]),
				"IMAGE_POS" => array((int)str_replace($replace, "", $componentsImage[2]), 
								(int)str_replace($replace, "", $componentsImage[1])),
				"TOUCH_POS" => array((int)str_replace($replace, "", $componentsTouch[2]),
								(int)str_replace($replace, "", $componentsTouch[1])),
				"EYES_POS" => array((int)str_replace($replace, "", $componentsEyes[2]),
								(int)str_replace($replace, "", $componentsEyes[1]))
			);
			
			$time = $components[0];
			$arrayResult[$time] = $informations;
		}
		
	}
}

echo json_encode($arrayResult, JSON_NUMERIC_CHECK);




?>