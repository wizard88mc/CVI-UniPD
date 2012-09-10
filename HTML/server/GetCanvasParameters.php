<?php

require_once('DBParameters.php');

$imageID = $_POST['imageID'];

$queryGetCanvasInfos = "SELECT CanvasRules, Dimensions FROM Images WHERE ID = $imageID";

$resultQueryGetCanvasInfos = mysqli_query($connection, $queryGetCanvasInfos);

$row = mysqli_fetch_assoc($resultQueryGetCanvasInfos);

$resulToSend = array(
		'CANVAS_RULES' => $row['CanvasRules'], 
		'CANVAS_DIMENSIONS' => $row['Dimensions']);
		
echo json_encode($resulToSend); 


?>