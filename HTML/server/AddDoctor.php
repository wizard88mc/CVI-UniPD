<?php
require_once('DBParameters.php');

if (mysqli_connect_error()) {
	echo "Some error!";
}
else {
	echo "Tutto ok";
}

$query = "INSERT INTO Doctor(Name, Surname, Username, Password) VALUES ('Matteo', 'Ciman', 'dottore', '" . md5("dottore") . "')";

$result = mysqli_query($connection, $query) or die($connection->error);

echo $result;

?>