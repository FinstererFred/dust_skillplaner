<?

error_reporting(0);

session_start();

if( (int)$_GET['planNr'] === $_SESSION['planID'] && $_SESSION['loggedIn'] == true)
{
	echo json_encode( array('unlock'=> true) );	
}

?>