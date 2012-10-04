<?php
require_once("DBParameters.php");

$patientID = $_POST['patientID'];

$baseQuery = "SELECT FileLevels
				FROM HelpMeExercises 
				WHERE ";

$row;
/**
 * First check if there is already defined an exercise for this particular game for
 * this particular patient
 */
$queryExerciseAlreadyDefined = $baseQuery . "IDPatient = $patientID AND CurrentValidSettings = 1";

$resultQueryExerciseAlreadyDefined = mysqli_query($connection, $queryExerciseAlreadyDefined);

if (mysqli_num_rows($resultQueryExerciseAlreadyDefined) != 0) {
	
	$row = mysqli_fetch_assoc($resultQueryExerciseAlreadyDefined);	
}
else {
	
	$queryGetPatientGravity = "SELECT Gravity FROM Patients WHERE ID = $patientID";
	
	$queryResultPatientGravity = mysqli_query($connection, $queryGetPatientGravity) or die(mysqli_error($connection));
	$row = mysqli_fetch_assoc($queryResultPatientGravity);
	
	$patientGravity = $row["Gravity"];
	
	$queryRetrieveDefaultValues = $baseQuery . "DefaultGravity = '$patientGravity'";
	
	$resultQueryRetrieveDefaultValues = mysqli_query($connection, $queryRetrieveDefaultValues) or die(mysqli_error($connection));
	
	$row = mysqli_fetch_assoc($resultQueryRetrieveDefaultValues);
	
}
	
$arrayToSend = array(
	"TYPE" => "GAME_SPECS",
	"FILE_NAME" => $row["FileLevels"]
);
	
echo json_encode($arrayToSend);

?>