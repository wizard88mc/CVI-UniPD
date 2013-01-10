<?php 
require_once("DBParameters.php");

$patientID = $_POST['patientID'];
$gameSettings = json_decode($_POST['settings'], true);

$rightMovement = $gameSettings['rightMovement'];
$leftMovement = $gameSettings['leftMovement'];
$upMovement = $gameSettings['upMovement'];
$downMovement = $gameSettings['downMovement'];

$stringMovements = "";

if ($leftMovement) {
	$stringMovements = $stringMovements . "L";
}
if ($rightMovement) {
	$stringMovements = $stringMovements . ";R";
}
if ($upMovement) {
	$stringMovements = $stringMovements . ";T";
}
if ($downMovement) {
	$stringMovements = $stringMovements . ";B";
}

if (strpos($stringMovements, ";") == 0) {
	$stringMovements = substr_replace($stringMovements, "", 0, 1);
}

$startFromCenter = $gameSettings['startFromCenter'];
$mixMovements = $gameSettings['mixMovements'];
$speed = $gameSettings['speed']; 
$backgroundColor = $gameSettings['backgroundColor'];
$foregroundColor = $gameSettings['foregroundColor'];
$imageID = $gameSettings['imageID'];
$changeImageColor = $gameSettings['changeImageColor'];
if ($changeImageColor == "") {
	$changeImageColor = 0;
}
$percentualImageWidth = $gameSettings['percentualImageWidth'];
$isSpaceGame = $gameSettings['isSpaceGame'];


$queryCheckAlreadyExercise = "SELECT * FROM CatchMeExercises  
		WHERE IDPatient = $patientID AND CurrentValidSettings = 1 
		AND Movements = \"$stringMovements\" AND Speed = $speed 
		AND Background = \"$backgroundColor\" AND ImageColor = \"$foregroundColor\" 
		AND ChangeImageColor = $changeImageColor AND ImageID = $imageID 
		AND ImageWidth = $percentualImageWidth AND IsSpaceGame = $isSpaceGame" ;

$resultQueryCheckAlreadyExercise = mysqli_query($connection, $queryCheckAlreadyExercise) or die(mysqli_error($connection) . " $queryCheckAlreadyExercise");

if (mysqli_num_rows($resultQueryCheckAlreadyExercise) == 0) {
	
	// cerco se x caso è stato definito come esercizio di default per la sua gravità di patologia
	$queryGetGravity = "SELECT Gravity FROM Patients WHERE ID = $patientID";
	$resulQueryGetGravity = mysqli_query($connection, $queryGetGravity) or die(mysqli_error($connection));
	
	$row = mysqli_fetch_array($resulQueryGetGravity);
	$gravity = $row["Gravity"];
	
	$queryCheckIfDefault = "SELECT * FROM CatchMeExercises
		WHERE DefaultGravity = '$gravity' AND Movements = \"$stringMovements\" AND Speed = $speed
		AND Background = \"$backgroundColor\" AND ImageColor = \"$foregroundColor\"
		AND ChangeImageColor = $changeImageColor AND ImageID = $imageID
		AND ImageWidth = $percentualImageWidth AND IsSpaceGame = $isSpaceGame";
	
	$resultQueryCheckIfDefault = mysqli_query($connection, $queryCheckIfDefault) or die(mysqli_error($connection));
	
	if (mysqli_num_rows($resultQueryCheckIfDefault) == 0) {
		// nuovo esercizio da inserire per il bambino
		
		$queryChangeActive = "UPDATE CatchMeExercises SET CurrentValidSettings = 0 WHERE IDPatient = $patientID";
		mysqli_query($connection, $queryChangeActive) or die(mysqli_error($connection));
		
		$queryInsertNewExercise = "INSERT INTO CatchMeExercises(IDPatient, Movements, Speed, Background, ImageColor, ChangeImageColor, ImageID, ImageWidth, CurrentValidSettings, IsSpaceGame) 
				VALUES ($patientID, \"$stringMovements\", $speed, \"$backgroundColor\", \"$foregroundColor\", $changeImageColor, $imageID, $percentualImageWidth, 1, $isSpaceGame)";
		
		mysqli_query($connection, $queryInsertNewExercise) or die(mysqli_error($connection));
		
		echo "Esercizio inserito correttamente";
	}
	else {
		echo "Esercizio di default per la disabilità";
	}
}
else {
	echo "Stesso esercizio già inserito";
}

?>