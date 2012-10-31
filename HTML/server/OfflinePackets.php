<?php

require_once('DBParameters.php');
require_once('ManageOfflineHelpMe.php');
require_once('ManageOfflineCatchMe.php');

$log = 'log.txt';
$folderNameClient = $_POST['folderName'];
$packets = json_decode($_POST['packets']);

$array = explode("\n", $packets);
$firstPacket = json_decode($array[0], true);

list($year, $month, $day, $hour, $minutes, $seconds) = explode('_', $folderNameClient);
$month = ((int)$month) + 1;

$gameIdentification = $firstPacket['GAME'];

$queryGetGameID = "SELECT ID FROM Games WHERE Identification = \"$gameIdentification\"";
$resultQueryGetGameID = mysqli_query($connection, $queryGetGameID) or die(mysqli_error($connection));

$row = mysqli_fetch_array($resultQueryGetGameID);
$gameID = $row[0];

if (strlen($month) == 1) {
	$month = "0$month";
}
if (strlen($day) == 1) {
	$day = "0$day";
}
$dateForDB = "$year-$month-$day";

$patientID = $firstPacket['PATIENT_ID'];

$queryInsertNewVisit = "INSERT INTO Visits(Date, IDPatient, IDGame, IsAtHome)
VALUES ('$dateForDB', $patientID, $gameID, 1)";

echo "completed";

/*mysqli_query($connection, $queryInsertNewVisit) or die(mysqli_error($connection));
$visitId = mysqli_insert_id($connection);

$folderWhereSave = "$year-$month-$day-$hour-$minutes-$visitId";

$folderForDB = 'archivio_visite' . DIRECTORY_SEPARATOR 
				. $firstPacket['PATIENT_ID'] . DIRECTORY_SEPARATOR 
				. $folderWhereSave . DIRECTORY_SEPARATOR;

$folderForDB = str_replace(DIRECTORY_SEPARATOR, '/', $folderForDB);

$queryInsertFolderForVisit = "UPDATE Visits SET Folder = \"$folderForDB\" WHERE ID = $visitId";
mysqli_query($connection, $queryInsertFolderForVisit) or die(mysqli_error($connection));

$folderToCreate = 'WebsocketServer' . DIRECTORY_SEPARATOR . $folderForDB;

mkdir($folderToCreate);

$fileLog = fopen($log, 'w');
fwrite($fileLog, count($array));
fclose($fileLog);

if ($gameIdentification == "HELP_ME") {
	manageOfflineHelpMePackets($array, $folderToCreate, $visitId, $connection);
}
else if ($gameIdentification == "CATCH_ME") {
	manageOfflineCatchMePackets($array, $folderToCreate, $visitId, $connection);
}

echo "completed";*/
?>