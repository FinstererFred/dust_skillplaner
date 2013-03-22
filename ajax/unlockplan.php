<?
include_once('plan.class.php');

$plan = new plan();

$planNr = (int)$_GET['planNr'];

$pw = $_GET['pw'];

if($planNr > 0)
{
	$bcrypt = new bCrypt;

	$userpw = $plan->unlockPlan($planNr);
	
	$pw = $bcrypt->test($pw, $userpw['pw'], $userpw['salt'] ); 

	if($pw)
	{
		session_start();

		$_SESSION['loggedIn'] = true;

		$_SESSION['planID'] = (int)$planNr;
	}

	echo json_encode( array('unlock'=> $pw) );
}

?>