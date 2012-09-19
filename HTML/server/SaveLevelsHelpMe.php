<?php 
require_once("DBParameters.php");

$patientID = $_POST['patientID'];
$levels = json_decode($_POST['levels'], true);

$queryGetFolderHelpMe = 'SELECT Folder FROM Games WHERE Identification = "HELP_ME"';
$resultQueryGetFolderHelpMe = mysqli_query($connection, $queryGetFolderHelpMe) or die(mysqli_error($connection));
$row = mysqli_fetch_array($resultQueryGetFolderHelpMe);

$folderGame = $row[0];

$completeFolderGameSettings = "../$folderGame/settings/";

if (!file_exists($completeFolderGameSettings)) {
	mkdir($completeFolderGameSettings);
}

$fileNewLevel = $patientID . "/" . date("Ymd-His") . '.xml';
$completeNewFile = $completeFolderGameSettings . $fileNewLevel;
$stringFileLevel = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n";
$stringFileLevel .= "<levels>\r\n";

for ($i = 0; $i < count($levels); $i++) {
	
	$currentLevel = $levels[$i];
	$levelType = $currentLevel["type"];
	$targetFamily = $currentLevel["targetFamily"];
	$maxTimeWaiting = $currentLevel["maxTimeImage"];
	
	$stringObject = "<level targetFamily=\"" . $targetFamily . "\" type=\"" . $levelType . 
	"\" maxTimeImage=\"" . $maxTimeWaiting . "\">\r\n";
	$listOfImages = $currentLevel["sequence"];
	
	for ($j = 0; $j < count($listOfImages); $j++) {
		
		$currentImage = $listOfImages[$j];
		$imageID = $currentImage["imageID"];
		$isTarget = 'T';
		if (!$currentImage["isTarget"]) {
			$isTarget = 'D';
		}
		
		
		$stringImage = "<image type=\"" . $isTarget . "\" imageID=\"" . $imageID . "\" />\r\n";
	}
	
	$stringObject .= "$stringImage</level>\r\n";
	
	$stringFileLevel = $stringFileLevel . $stringObject;
	
}

$stringFileLevel .= "</levels>";

$fileWriterLevel = fopen($completeNewFile, "w");
fwrite($fileWriterLevel, $stringFileLevel);
fclose($fileWriterLevel);

// recupero gli attuali esercizi validi per il bambino
// che siano o quelli di default oppure quelli suoi specifici

$querySelectCurrentExercise = "SELECT * FROM HelpMeExercises WHERE IDPatient = $patientID AND CurrentValidSettings = 1";
$resultQuerySelectCurrentExercise = mysqli_query($connection, $querySelectCurrentExercise) or die(mysqli_error($connection));

if (mysqli_num_rows($resultQuerySelectCurrentExercise) > 0) {
	
	// setto l'esercizio corrente a non più valido
	$row = mysqli_fetch_array($resultQuerySelectCurrentExercise);
	$entryID = $row[0];
	
	$queryUpdateRecord = "UPDATE HelpMeExercises SET CurrentValidSettings = 0 WHERE ID=$entryID";
	mysqli_query($connection, $queryUpdateRecord);
	
}

$queryInsertNewExercise = "INSERT INTO HelpMeExercises(IDPatient, FileLevels, CurrentValidSettings)
		VALUES ($patientID, \"$fileNewLevel\", TRUE)";

mysqli_query($connection, $queryInsertNewExercise) or die(mysqli_error($connection));

/*$fileLog = fopen("log.txt", "w");
fwrite($fileLog, $folderGame);
fclose($fileLog);*/

echo 1;

?>