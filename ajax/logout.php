<?
session_start();
$_SESSION['loggedIn'] = false;
$_SESSION['planID'] = 0;
session_destroy();
?>