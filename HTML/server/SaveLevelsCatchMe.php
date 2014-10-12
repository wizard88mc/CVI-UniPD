<?php 
require_once("DBParameters.php");

$patientID = $_POST['patientID'];
$gameLevels = json_decode($_POST['settings'], true);
$queryToTest = array();
$queryToInsert = array();

$finalQuery = "INSERT INTO CatchMeExercises(IDPatient, Movements, StartFromCenter, MixMovements, Speed,
	Background, ImageColor, ChangeImageColor, ImageID, ImageWidth, CurrentValidSettings, ExerciseOrder, NumberOfRepetitions) VALUES";

foreach($gameLevels as $key => $levelSettings) {

	$rightMovement = $levelSettings['rightMovement'] ? 1 : 0;
	$leftMovement = $levelSettings['leftMovement'] ? 1 : 0;
	$upMovement = $levelSettings['upMovement'] ? 1 : 0;
	$downMovement = $levelSettings['downMovement'] ? 1 : 0;

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

	$startFromCenter = $levelSettings['startFromCenter'] ? 1 : 0;
	$mixMovements = $levelSettings['mixMovements'] ? 1 : 0;
	$speed = $levelSettings['speed']; 
	$backgroundColor = $levelSettings['backgroundColor'];
	$foregroundColor = $levelSettings['foregroundColor'];
	$imageID = $levelSettings['imageID'];
	$changeImageColor = $levelSettings['changeImageColor'] ? 1 : 0;
	$percentualImageWidth = $levelSettings['percentualImageWidth'];
	$numberOfRepetitions = $levelSettings['numberOfRepetitions'];
	
	$queryToInsert[] = $finalQuery . " ($patientID, \"$stringMovements\", $startFromCenter, 
		$mixMovements, $speed, \"$backgroundColor\", \"$foregroundColor\"
		, $changeImageColor, $imageID, $percentualImageWidth, 1, $key, $numberOfRepetitions)";
	
	$queryToTest[] = "SELECT * FROM CatchMeExercises WHERE IDPatient = $patientID AND Movements = \"$stringMovements\" AND StartFromCenter = $startFromCenter AND MixMovements = $mixMovements AND 
			Speed = $speed AND Background = \"$backgroundColor\" AND ImageColor = \"$foregroundColor\" AND ChangeImageColor = $changeImageColor AND ImageID = $imageID AND 
			CurrentValidSettings = 1 AND NumberOfRepetitions = $numberOfRepetitions AND ExerciseOrder = $key";
}

print_r($queryToTest);

$oldExercise = true;
echo count($queryToTest);
for ($i = 0; $i < count($queryToTest) && $oldExercise; $i++) {
	
	$resultTest = mysqli_query($connection, $queryToTest[$i]) or die(mysqli_error($connection));
	echo $resultTest->num_rows;
	if ($resultTest->num_rows == 0) {
		mysqli_query($connection, $queryToInsert[$i]) or die(mysqli_error($connection));
	}
}

if (!$oldExercise) {
	echo "Nuovo esercizio";
}
else {
	echo "Vecchio esercizio";
}

/*if (!$newExercise == true) {

	$finalQuery = substr($finalQuery, 0, strlen($finalQuery) - 1);
	
	print_r($finalQuery);
	
	$queryRemoveAllCurrentActiveExercises = "UPDATE CatchMeExercises SET CurrentValidSettings = 0 WHERE IDPatient = $patientID";
	
	mysqli_query($connection, $queryRemoveAllCurrentActiveExercises) or die(mysqli_error($connection));
	
	mysqli_query($connection, $finalQuery) or die(mysqli_error($connection));
	
	echo "Nuovo esercizio inserito correttamente";
}
else {
	echo "Esercizio vecchio";
}

/*$queryCheckAlreadyExercise = "SELECT * FROM CatchMeExercises  
		WHERE IDPatient = $patientID AND CurrentValidSettings = 1 
		AND Movements = \"$stringMovements\" AND Speed = $speed 
		AND StartFromCenter = $startFromCenter AND MixMovements = $mixMovements 
		AND Background = \"$backgroundColor\" AND ImageColor = \"$foregroundColor\" 
		AND ChangeImageColor = $changeImageColor AND ImageID = $imageID 
		AND ImageWidth = $percentualImageWidth AND IsSpaceGame = $isSpaceGame" ;
		
echo "$queryCheckAlreadyExercise \n";

$resultQueryCheckAlreadyExercise = mysqli_query($connection, $queryCheckAlreadyExercise) or die(mysqli_error($connection) . " $queryCheckAlreadyExercise");

if (mysqli_num_rows($resultQueryCheckAlreadyExercise) == 0) {
	
	// cerco se x caso è stato definito come esercizio di default per la sua gravità di patologia
	$queryGetGravity = "SELECT Gravity FROM Patients WHERE ID = $patientID";
	$resulQueryGetGravity = mysqli_query($connection, $queryGetGravity) or die(mysqli_error($connection));
	
	$row = mysqli_fetch_array($resulQueryGetGravity);
	$gravity = $row["Gravity"];
	
	$queryCheckIfDefault = "SELECT * FROM CatchMeExercises
		WHERE DefaultGravity = '$gravity' AND Movements = \"$stringMovements\" 
		AND Speed = $speed AND StartFromCenter = $startFromCenter
		AND MixMovements = $mixMovements
		AND Background = \"$backgroundColor\" AND ImageColor = \"$foregroundColor\"
		AND ChangeImageColor = $changeImageColor AND ImageID = $imageID
		AND ImageWidth = $percentualImageWidth AND IsSpaceGame = $isSpaceGame";
	
	$resultQueryCheckIfDefault = mysqli_query($connection, $queryCheckIfDefault) or die(mysqli_error($connection));
	
	if (mysqli_num_rows($resultQueryCheckIfDefault) == 0) {
		// nuovo esercizio da inserire per il bambino
		
		$queryChangeActive = "UPDATE CatchMeExercises SET CurrentValidSettings = 0 WHERE IDPatient = $patientID";
		mysqli_query($connection, $queryChangeActive) or die(mysqli_error($connection));
		
		$queryInsertNewExercise = "INSERT INTO CatchMeExercises(IDPatient, Movements, StartFromCenter, MixMovements, Speed, Background, ImageColor, ChangeImageColor, ImageID, ImageWidth, CurrentValidSettings, IsSpaceGame) 
				VALUES ($patientID, \"$stringMovements\", $startFromCenter, $mixMovements, $speed, \"$backgroundColor\", \"$foregroundColor\", $changeImageColor, $imageID, $percentualImageWidth, 1, $isSpaceGame)";
		
		mysqli_query($connection, $queryInsertNewExercise) or die(mysqli_error($connection));
		
		echo "Esercizio inserito correttamente";
	}
	else {
		echo "Esercizio di default per la disabilità";
	}
}
else {
	echo "Stesso esercizio già inserito";
}*/

?>