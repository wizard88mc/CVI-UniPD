<?php 
require_once('DBParameters.php');

$gameID = $_POST['gameID'];

$querySelectGameIdentification = "SELECT Identification FROM Games WHERE ID = $gameID";

$selectGameIdentification = mysqli_query($connection, $querySelectGameIdentification) or die(mysqli_error($connection));

$row = mysqli_fetch_array($selectGameIdentification);

$arrayResult = array("IDENTIFICATION" => $row[0]);

echo json_encode($arrayResult);

?>