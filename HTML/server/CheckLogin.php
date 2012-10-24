<?php
require_once("DBParameters.php");

$username = $_POST['username'];
$password = $_POST['password'];

$queryCheckLogin = "SELECT ID, Name, Surname FROM Doctors WHERE Username = '$username' AND Password = '$password'";

$queryResult = mysqli_query($connection, $queryCheckLogin) or die ("Mysql Error: " . mysqli_error($connection));

if ($queryResult->num_rows > 0) {
	$result = mysqli_fetch_assoc($queryResult);
	$arrayResults = array(
		"CORRECT" => "true",
		"ID" => $result["ID"],
		"NAME" => $result["Name"],
		"SURNAME" => $result["Surname"],
		"PERMISSION" => "DOCTOR"
	);
}
else {
	
	$queryCheckLogin = "SELECT ID, Name, Surname, Sex FROM Patients WHERE Username = '$username' AND Password = '$password'";
	
	$queryResult = mysqli_query($connection, $queryCheckLogin) or die ("Mysql Error: " . mysqli_error($connection));
	
	if ($queryResult->num_rows > 0) {
		$result = mysqli_fetch_assoc($queryResult);
		$arrayResults = array(
			"CORRECT" => "true",
			"ID" => $result["ID"],
			"NAME" => $result["Name"],
			"SURNAME" => $result["Surname"],
			"SEX" => $result["Sex"],
			"PERMISSION" => "PATIENT"
		);
	}
	else {
		$arrayResults = array("CORRECT", "false");
	}
}

$stringToSend = json_encode($arrayResults);

echo $stringToSend;

?>