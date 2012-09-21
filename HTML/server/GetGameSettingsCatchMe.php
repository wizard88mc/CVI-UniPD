<?php
require_once("DBParameters.php");

$patientID = $_POST['patientID'];

$baseQuery = "SELECT e.Movements, e.Speed, e.ChangeImageColor, 
				e.BackgroundColor, e.ImageColor, e.ImageWidth, 
				i.ID, i.ImageName, i.FileName, i.Dimensions
				FROM CatchMeExercises e JOIN Images i 
				WHERE e.ImageID = i.ID AND ";

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

$querySelectImages = "SELECT ID, ImageName, FileName, Dimensions FROM Images ORDER BY ImageName ASC";

$resultQuerySelectImages = mysqli_query($connection, $querySelectImages);

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
	
$arrayToSend = array(
	"TYPE" => "GAME_SPECS",
	"RIGHT_MOV" => $movements["RightMovement"],
	"LEFT_MOV" => $movements["LeftMovement"],
	"UP_MOV" => $movements['UpMovement'],
	"DOWN_MOV" => $movements['DownMovement'],
	"SPEED" => $row["Speed"],
	"BACK_COLOR" => $row["BackgroundColor"],
	"IMG_COLOR" => $row["ImageColor"],
	"CHANGE_IMG_COLOR" => $row["ChangeImageColor"],
	"IMG_SPECS" => array("IMG_ID" => $row['ID'], "IMG_NAME" => $row['ImageName'], "IMG_FILE" => $row['FileName']),
	"IMG_WIDTH" => $row['ImageWidth'],
	"CANVAS_DIMENSIONS" => $row['Dimensions']
);

$arrayOtherImages = array();

while ($row = mysqli_fetch_assoc($resultQuerySelectImages)) {
	$imageID = $row['ID'];
	if ($imageID != $arrayToSend['IMG_SPECS']['IMG_ID']) {
		$arrayOtherImages[$imageID] = array(
			"IMG_NAME" => $row["ImageName"], 
			"IMG_FILE" => $row['FileName'],
			"IMG_DIMS" => $row['Dimensions']);
	} 
}

if (count($arrayOtherImages) != 0) {
	$arrayToSend['OTHER_IMG'] = $arrayOtherImages;
}
	
echo json_encode($arrayToSend);

?>