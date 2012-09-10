<?php
require_once("DBParameters.php");
$replace = array("\r\n", "\r", "\n");

$visitID = $_POST['visitID'];

$querySelectFolder = "SELECT Folder, IDPatient FROM Visits WHERE ID = $visitID";

$resultQuerySelectFolder = mysqli_query($connection, $querySelectFolder) or die("Error in select folder: " + mysqli_error($connection));

$row = mysqli_fetch_array($resultQuerySelectFolder);

$arrayResult = array();

$folder = $row[0];

$fileName = str_replace('/', DIRECTORY_SEPARATOR, "WebsocketServer/" . $folder . "Results.txt");

$fileResults = fopen($fileName, "r") or die($fileName);

$resultsToSend = array();

if ($fileResults != 0) {
	
	while (!feof($fileResults)) {
		$line = str_replace($replace, '', fgets($fileResults));
		$line = str_replace('(', '', str_replace(')', '', $line));
		
		$components = explode(',', $line);
		
		// [0] TargetFamily, [1] isTarget, [2] objectName
		// [3] firstResponseTime, [4] CompletionTime, [5] RightAnswer
		
		if (count($components) > 1) {
			
			$informations = array(
				'IS_TARGET' => $components[1],
				'OBJECT_NAME' => $components[2],
				'FIRST_RESPONSE_TIME' => $components[3],
				'COMPLETION_TIME' => $components[4],
				'RIGHT_ANSWER' => $components[5]	
			);
			
			$targetFamily = $components[0];
			
			$resultsToSend[$targetFamily][] = $informations; 
		}
	}
}

echo json_encode($resultsToSend);

?>