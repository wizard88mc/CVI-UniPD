<?php
require_once("DBParameters.php");

$querySelect = "SELECT ID, Name, Folder, Description FROM Games ORDER BY Name ASC";

$resultQuery = mysqli_query($connection, $querySelect) or die(mysqli_error($connection));

$arrayGames = array();

while ($row = mysqli_fetch_assoc($resultQuery)) {
	
	$gameID = $row["ID"];
	$name = $row["Name"];
	$folder = $row["Folder"];
	$description = $row["Description"];
	
	$arrayGames[] = array(
		"ID" => $gameID, 
		"NAME" => $name,
		"FOLDER" => $folder, 
		"DESCRIPTION" => $description 
	);
	
}

echo json_encode($arrayGames);

?>