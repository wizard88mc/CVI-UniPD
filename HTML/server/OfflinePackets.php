<?php

require_once('DBParameters.php');
require_once('ManageOfflineHelpMe.php');
//require_once('ManageOfflineCatchMe.php');

$log = 'log.txt';
$folderNameClient = $_POST['folderName'];
$packets = json_decode($_POST['packets']);

$array = explode("\n", $packets);
$firstPacket = json_decode($array[0], true);

list($year, $month, $day, $hour, $minutes, $seconds) = explode('_', $folderNameClient);
$month = $month + 1;
$folderWhereSave = "$year-$month-$day-$hour-$minutes-$seconds";

$gameIdentification = $firstPacket['GAME'];

$queryGetGameID = "SELECT ID FROM Games WHERE Identification = \"$gameIdentification\"";
$resultQueryGetGameID = mysqli_query($connection, $queryGetGameID) or die(mysqli_error($connection));

$row = mysqli_fetch_array($resultQueryGetGameID);
$gameID = $row[0];
$patientID = $firstPacket['PATIENT_ID'];


$folderForDB = 'archivio_visite' . DIRECTORY_SEPARATOR 
				. $firstPacket['PATIENT_ID'] . DIRECTORY_SEPARATOR 
				. $folderWhereSave . DIRECTORY_SEPARATOR;
				
$folderToCreate = 'WebsocketServer' . DIRECTORY_SEPARATOR . $folderForDB; 

$folderForDB = str_replace(DIRECTORY_SEPARATOR, '/', $folderForDB);

mkdir($folderToCreate);

if (strlen($month) == 1) {
	$month = "0$month";
}
if (strlen($day) == 1) {
	$day = "0$day";
}
$dateForDB = "$year-$month-$day";
$queryInsertNewVisit = "INSERT INTO Visits(Date, IDPatient, IDGame, Folder)
						VALUES ('$dateForDB', $patientID, $gameID, '$folderForDB')";
						
mysqli_query($connection, $queryInsertNewVisit) or die(mysqli_error($connection));
$visitId = mysqli_insert_id($connection);

$fileLog = fopen($log, 'w');
fwrite($fileLog, count($array));
fclose($fileLog);

if ($gameIdentification == "HELP_ME") {
	manageOfflineHelpMePackets($array, $folderToCreate, $visitId, $connection);
}
else if ($gameIdentification == "CATCH_ME") {
	
}

echo "completed";
?>