<?php

if (!isset($_POST['name'])
        || !isset($_POST['time'])
        || empty($_POST['name'])
        || empty($_POST['time'])) {
    die();    
}

$name = strtolower(strip_tags(trim($_POST['name'])));
$time = intval(strip_tags(trim($_POST['time'])));

if ($time < 0) {
    die();
}

$host = 'localhost';
$user = 'headhunt_danmaku';
$pass = '$2y$10$kcohXAHR8EKJ2r5PBFedI.0Kr8Evq5FF4bRE0pAXECWru67rWTbkW';
$db = 'headhunt_danmaku';

$conn = mysqli_connect($host, $user, $pass, $db) or die(mysqli_connect_error());

$sql = "
INSERT INTO Time (name, time)
VALUES ('$name', $time)
";

mysqli_query($conn, $sql) or die(mysqli_error($conn));

$result = array();
$result['status'] = 'success';

echo json_encode($result);