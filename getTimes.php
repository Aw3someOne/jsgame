<?php

$host = 'localhost';
$user = 'headhunt_danmaku';
$pass = '$2y$10$kcohXAHR8EKJ2r5PBFedI.0Kr8Evq5FF4bRE0pAXECWru67rWTbkW';
$db = 'headhunt_danmaku';

$conn = mysqli_connect($host, $user, $pass, $db) or die(mysqli_connect_error());

$sql = "
SELECT name, time FROM Time
ORDER BY time ASC
LIMIT 10
";

$results = mysqli_query($conn, $sql) or die(mysqli_error($conn));

$table = array();
while ($row = $results->fetch_assoc()) {
    array_push($table, $row);
}

echo json_encode($table);