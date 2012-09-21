<?php
require_once("DBParameters.php");

$patientName = $_POST["name"];
$patientSurname = $_POST['surname'];
$dateOfBirth = $_POST['dateOfBirth'];
$disability = $_POST['disabilita'];
$sex = $_POST['sex'];
$doctorID = $_POST['doctorID'];

list($yearBirth, $monthBirth, $dayBirth) = explode('-', $dateOfBirth);

$username = strtolower($patientName) . '.' . strtolower($patientSurname);
$password = md5(strtolower($patientSurname) . $dayBirth . $monthBirth);

$queryInsert = "INSERT INTO Patients (DoctorID, Name, Surname, Sex";

if ($dateOfBirth != "") {
	$queryInsert .= ", DateOfBirth";
}

$queryInsert .= ", Gravity, Username, Password) VALUES ($doctorID, '$patientName', '$patientSurname', '$sex'";

if ($dateOfBirth != "") {
	$queryInsert .= ", '$dateOfBirth'";
}

$queryInsert .= ",'$disability', '$username', '$password')";

$resultQuery = mysqli_query($connection, $queryInsert);

if ($resultQuery) {
	
	$infoToSendBack = array('OK' => 'true', 
					'ID' => mysqli_insert_id($connection), 
					'NAME' => $patientName,
					'SURNAME' => $patientSurname);
					
	echo json_encode($infoToSendBack);
}
else {
	$infoToSendBack = array('OK' => 'false', "ERROR" => mysqli_error($connection));
	
	echo json_encode($infoToSendBack);
}




?>