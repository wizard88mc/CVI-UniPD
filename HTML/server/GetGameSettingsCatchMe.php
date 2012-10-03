<?php
require_once("DBParameters.php");

function retrieveImageInfo($imageID, $others) {
	
	$xmlFile = "../catchMe/settings/images.xml";
	
	$xml = simplexml_load_file($xmlFile);
	
	if (!$others) {
		$correctNode = $xml->xpath('//image[@id="' . $imageID . '"]');
		
		$attributes = $correctNode[0]->attributes();
		
		$imageName = (string)$attributes['imageName'][0];
		$fileName = (string)$attributes['fileName'][0];
		$dimensions = (string)$attributes['dimensions'][0];
		
		return array($imageID, $imageName, $fileName, $dimensions);
	}
	else {
		
		$arrayImages = array();
		
		$images = $xml->xpath('//image[@id!="' . $imageID . '"]');
		
		foreach ($images as $image) {
			
			$attributes = $image->attributes();
			
			$imageID = (int)$attributes['id'][0];
			$imageName = (string)$attributes['imageName'][0];
			$fileName = (string)$attributes['fileName'][0];
			$dimensions = (string)$attributes['dimensions'][0];
			
			$arrayImages[$imageID] = array(
					"IMG_NAME" => $imageName,
					"IMG_FILE" => $fileName,
					"IMG_DIMS" => $dimensions
				);
		}
		
		return $arrayImages;
	}
}




$patientID = $_POST['patientID'];

/**$baseQuery = "SELECT e.Movements, e.StartFromCenter, e.MixMovements, 
			e.Speed, e.ChangeImageColor, e.BackgroundColor, e.ImageColor, 
			e.ImageWidth, i.ID, i.ImageName, i.FileName, i.Dimensions
			FROM CatchMeExercises e JOIN Images i 
			WHERE e.ImageID = i.ID AND ";*/

$baseQuery = "SELECT e.Movements, e.StartFromCenter, e.MixMovements,
			e.Speed, e.ChangeImageColor, e.BackgroundColor, e.ImageColor,
			e.ImageWidth, e.ImageID
			FROM CatchMeExercises e
			WHERE ";

$row;
/**
 * First check if there is already defined an exercise for this particular game for
 * this particular patient
 */
$queryExerciseAlreadyDefined = $baseQuery . "e.IDPatient = $patientID AND CurrentValidSettings = 1";

$resultQueryExerciseAlreadyDefined = mysqli_query($connection, $queryExerciseAlreadyDefined);

if (mysqli_num_rows($resultQueryExerciseAlreadyDefined) != 0) {
	
	$row = mysqli_fetch_assoc($resultQueryExerciseAlreadyDefined);	
}
else {
	
	$queryGetPatientGravity = "SELECT Gravity FROM Patients WHERE ID = $patientID";
	
	$queryResultPatientGravity = mysqli_query($connection, $queryGetPatientGravity);
	$row = mysqli_fetch_assoc($queryResultPatientGravity);
	
	$patientGravity = $row["Gravity"];
	
	$queryRetrieveDefaultValues = $baseQuery . "e.DefaultGravity = '$patientGravity'";
	
	$resultQueryRetrieveDefaultValues = mysqli_query($connection, $queryRetrieveDefaultValues) or die (mysqli_error($connection));
	
	$row = mysqli_fetch_assoc($resultQueryRetrieveDefaultValues);
	
}

$movements = array(
		'RightMovement' => 0, 
		'LeftMovement' => 0,
		'UpMovement' => 0,
		'DownMovement' => 0);

if (strpos($row['Movements'], 'R') !== false) {
	$movements['RightMovement'] = 1;
}
if (strpos($row['Movements'], 'L') !== false) {
	$movements['LeftMovement'] = 1;
}
if (strpos($row['Movements'], 'T') !== false) {
	$movements['UpMovement'] = 1;
}
if (strpos($row['Movements'], 'B') !== false) {
	$movements['DownMovement'] = 1;
}

list($imageID, $imageName, $imageFile, $imageDimensions) = retrieveImageInfo($row['ImageID'], false);

//print_r($row['StartFromCenter'] == "1" ? true : false);

$arrayToSend = array(
	"TYPE" => "GAME_SPECS",
	"RIGHT_MOV" => $movements["RightMovement"],
	"LEFT_MOV" => $movements["LeftMovement"],
	"UP_MOV" => $movements['UpMovement'],
	"DOWN_MOV" => $movements['DownMovement'],
	"SPEED" => $row["Speed"],
	"START_CENTER" => $row["StartFromCenter"],
	"MIX_MOVEMENTS" => $row["MixMovements"],
	"BACK_COLOR" => $row["BackgroundColor"],
	"IMG_COLOR" => $row["ImageColor"],
	"CHANGE_IMG_COLOR" => $row["ChangeImageColor"],
	"IMG_SPECS" => array("IMG_ID" => $imageID, "IMG_NAME" => $imageName, "IMG_FILE" => $imageFile),
	"IMG_WIDTH" => $row['ImageWidth'],
	"CANVAS_DIMENSIONS" => $imageDimensions
);

//print_r($arrayToSend);

/*$querySelectImages = "SELECT ID, ImageName, FileName, Dimensions FROM Images ORDER BY ImageName ASC";

$resultQuerySelectImages = mysqli_query($connection, $querySelectImages);*/

retrieveImageInfo($row['ImageID'], true);

if (!isset($_POST['onlySettings'])) {
	
	$arrayOtherImages = retrieveImageInfo($row['ImageID'], true);
	
	if (count($arrayOtherImages) != 0) {
		$arrayToSend['OTHER_IMG'] = $arrayOtherImages;
	}	
}
	
echo json_encode($arrayToSend);

?>