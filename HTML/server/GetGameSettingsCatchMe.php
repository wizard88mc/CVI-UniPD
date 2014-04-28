<?php
require_once("DBParameters.php");

function retrieveImageInfo() {
	
	$xmlFile = "../catchMe/settings/images.xml";
	
	$xml = simplexml_load_file($xmlFile);
		
	$arrayImages = array();
		
	$images = $xml->xpath('//image');
		
	foreach ($images as $image) {
			
		$attributes = $image->attributes();
			
		$imageID = (int)$attributes['id'][0];
		$imageName = (string)$attributes['imageName'][0];
		$fileName = (string)$attributes['fileName'][0];
		$size = (string)$attributes['size'][0];
			
		$arrayImages[$imageID] = array(
				"IMG_NAME" => $imageName,
				"IMG_FILE" => $fileName,
				"IMG_SIZE" => $size
			);
	}
		
	return $arrayImages;
}

$patientID = $_POST['patientID'];

/**$baseQuery = "SELECT e.Movements, e.StartFromCenter, e.MixMovements, 
			e.Speed, e.ChangeImageColor, e.BackgroundColor, e.ImageColor, 
			e.ImageWidth, i.ID, i.ImageName, i.FileName, i.Dimensions
			FROM CatchMeExercises e JOIN Images i 
			WHERE e.ImageID = i.ID AND ";*/

$baseQuery = "SELECT e.Movements, e.StartFromCenter, e.MixMovements,
			e.Speed, e.ChangeImageColor, e.Background, e.ImageColor,
			e.ImageWidth, e.ImageID, e.ExerciseOrder, e.NumberOfRepetitions
			FROM CatchMeExercises e
			WHERE ";

$row;
$resultToUse;
/**
 * First check if there is already defined an exercise for this particular game for
 * this particular patient
 */
$queryExerciseAlreadyDefined = $baseQuery . "e.IDPatient = $patientID AND CurrentValidSettings = 1 ORDER BY ExerciseOrder ASC";

$resultQueryExerciseAlreadyDefined = mysqli_query($connection, $queryExerciseAlreadyDefined);

if (mysqli_num_rows($resultQueryExerciseAlreadyDefined) != 0) {
	
	$resultsToUse = $resultQueryExerciseAlreadyDefined;
	//$row = mysqli_fetch_assoc($resultQueryExerciseAlreadyDefined);	
}
else {
	
	$queryGetPatientGravity = "SELECT Gravity FROM Patients WHERE ID = $patientID";
	
	$queryResultPatientGravity = mysqli_query($connection, $queryGetPatientGravity);
	$row = mysqli_fetch_assoc($queryResultPatientGravity);
	
	$patientGravity = $row["Gravity"];
	
	$queryRetrieveDefaultValues = $baseQuery . "e.DefaultGravity = '$patientGravity'";
	
	$resultQueryRetrieveDefaultValues = mysqli_query($connection, $queryRetrieveDefaultValues) or die (mysqli_error($connection));
	
	$resultsToUse = $resultQueryRetrieveDefaultValues;
	//$row = mysqli_fetch_assoc($resultQueryRetrieveDefaultValues);
	
}

$finalResultToSend = array("TYPE" => "GAME_SPECS");
$arrayExercises = array();

$arrayOtherImages = retrieveImageInfo();

if (count($arrayOtherImages) != 0) {
	$finalResultToSend['IMAGES_SPECS'] = $arrayOtherImages;
}

while ($row = mysqli_fetch_assoc($resultsToUse)) {

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

	$arrayExercises[$row["ExerciseOrder"]] = array(
		"RIGHT_MOV" => $movements["RightMovement"],
		"LEFT_MOV" => $movements["LeftMovement"],
		"UP_MOV" => $movements['UpMovement'],
		"DOWN_MOV" => $movements['DownMovement'],
		"SPEED" => $row["Speed"],
		"START_CENTER" => (int)$row["StartFromCenter"],
		"MIX_MOVEMENTS" => (int)$row["MixMovements"],
		"BACK_COLOR" => $row["Background"],
		"IMG_COLOR" => $row["ImageColor"],
		"CHANGE_IMG_COLOR" => (int)$row["ChangeImageColor"],
		"IMG_ID" => (int)$row['ImageID'],
		"IMG_WIDTH" => (int)$row['ImageWidth'],
		"NUM_REPETITIONS" => (int)$row['NumberOfRepetitions']
	);
}

$finalResultToSend["EXERCISES"] = $arrayExercises;

echo json_encode($finalResultToSend);
?>

