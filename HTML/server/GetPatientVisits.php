<?php

require_once("DBParameters.php");

$patientID = $_POST['patientID'];

$querySelect = "SELECT v.ID, DATE_FORMAT(v.Date, '%d/%m/%Y') AS Date, c.TouchEvaluation, c.EyeEvaluation
				FROM Visits v JOIN CatchMeEvaluation c
				ON v.ID = c.IDVisit
				WHERE v.IDPatient = $patientID
				ORDER BY v.Date DESC";
					
$resultQuery = mysqli_query($connection, $querySelect) or die("Error in query: " . mysqli_error($connection));

$arrayResult = array("CatchMe" => array(), "HelpMe" => array());

while ($visit = mysqli_fetch_assoc($resultQuery)) {
	
	$visitID = $visit['ID'];
	$date = $visit['Date'];
	$touchEvaluation = $visit['TouchEvaluation'];
	$eyeEvaluation = $visit['EyeEvaluation'];
	
	array_push($arrayResult["CatchMe"],
		array(
		"VISIT_ID" => $visitID,
		"DATE" => $date, 
		"TOUCH_EVAL" => $touchEvaluation,
		"EYE_EVAL" => $eyeEvaluation
	));
	
}

$querySelect = "SELECT v.ID, DATE_FORMAT(v.Date, '%d/%m/%Y') AS Date, h.FirstResponseTime, h.CompletionTime, h.CorrectAnswers, h.WrongAnswers
				FROM Visits v JOIN HelpMeEvaluation h
				ON v.ID = h.IDVisit
				WHERE v.IDPatient = $patientID
				ORDER BY v.Date DESC";

$resultQuery = mysqli_query($connection, $querySelect) or die("Error in query: " . mysqli_error($connection));

while ($visit = mysqli_fetch_assoc($resultQuery)) {
	
	$visitID = $visit["ID"];
	$date = $visit['Date'];
	$firstResponseTime = $visit['FirstResponseTime'];
	$completionTime = $visit['CompletionTime'];
	$correctAnswers = $visit['CorrectAnswers'];
	$wrongAnswers = $visit['WrongAnswers'];
	
	array_push($arrayResult['HelpMe'], array(
		"VISIT_ID" => $visitID,
		"DATE" => $date, 
		"FRT" => $firstResponseTime,
		"CT" => $completionTime,
		"CORRECT_ANSWERS" => $correctAnswers,
		"WRONG_ANSWERS" => $wrongAnswers
	));
}

echo json_encode($arrayResult);








?>
