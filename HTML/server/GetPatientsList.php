<?php
require_once("DBParameters.php");

$doctorID = $_POST['doctorID'];

$querySelect = "SELECT ID, Name, Surname, DateOfBirth FROM Patients WHERE DoctorID = $doctorID ORDER BY Surname ASC, Name ASC";

$resultQuery = mysqli_query($connection, $querySelect) or die(mysqli_error($connection));

$arrayPatients = array();

while ($row = mysqli_fetch_assoc($resultQuery)) {
	
	$patientID = $row["ID"];
	$name = $row["Name"];
	$surname = $row["Surname"];
	
	$arrayPatients[] = array(
		"ID" => $patientID, 
		"NAME" => $name,
		"SURNAME" => $surname 
	);
	
}

echo json_encode($arrayPatients);

?>