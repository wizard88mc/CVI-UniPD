<?php 

function getFamilyAudios($family) {
	
	$fileXML = ".." . DIRECTORY_SEPARATOR . "helpMe" . DIRECTORY_SEPARATOR
		 . "settings" . DIRECTORY_SEPARATOR . "images.xml";
	
	$xml = simplexml_load_file($fileXML);
	
	$targetFamily = $xml->xpath('//family[@type="' . $family .'"]');
	
	$attributes = $targetFamily[0]->attributes();
	
	$audio = (string)$attributes["audioFile"][0];
	$audioBagComplete = (string)$attributes["audioBagReady"][0];
	$audioObjectNotInserted = (string)$attributes["audioObjectNotInserted"][0];
	
	return array($audio, $audioBagComplete, $audioObjectNotInserted);
	
}

ob_start();

require('GetGameSettingsHelpMe.php');

$result = ob_get_clean();

$packetWithFileName = json_decode($result, true);

$file = str_replace("/", DIRECTORY_SEPARATOR, $packetWithFileName['FILE_NAME']);

$fileXML = ".." . DIRECTORY_SEPARATOR . "helpMe" . DIRECTORY_SEPARATOR . "settings" 
		. DIRECTORY_SEPARATOR . $file;

$xml = simplexml_load_file($fileXML);

$arrayOfLevels = array();

foreach($xml->level as $level) {

	$attributes = $level->attributes();
	
	$levelType = (string)$attributes['type'][0];
	$elements = explode("x", $levelType);
	$targetFamily = (string)$attributes['targetFamily'][0];
	$maxTime = (int)$attributes['maxTimeImage'][0];
	
	$arrayImages = array();
	
	foreach ($level->image as $image) {
		
		$attributesImage = $image->attributes();
		
		$type = (string)$attributesImage['type'][0];
		$imageID = (string)$attributesImage['imageID'][0];
		
		$imageLevel = array(
				"isTarget" => $type == "T" ? 1: 0,
				"imageID" => $imageID	
			);
		
		$arrayImages[] = $imageLevel;
	}
	
	list($audio, $audioBagComplete, $audioObjectNotInserted) =
		getFamilyAudios($targetFamily);
	
	$arrayLevel = array(
			"type" => $levelType, 
			"numberOfTargets" => $elements[0],
			"numberOfDistracters" => $elements[1],
			"targetFamily" => $targetFamily,
			"sequence" => $arrayImages,
			"sound" => $audio,
			"soundBagComplete" =>$audioBagComplete, 
			"soundObjectNotInserted" => $audioObjectNotInserted,
			"maxTimeImage" => $maxTime
		);
	
	$arrayOfLevels[] = $arrayLevel;
}

print_r(json_encode($arrayOfLevels));

?>