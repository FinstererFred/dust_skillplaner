<?php
include_once('plan.php');

$plan = new plan();

$planNr = (int)$_GET['planNr'];

if($planNr > 0)
{
	if($_GET['action'] == 'skills')
	{
		echo json_encode( $plan->loadPlanSkills($planNr) );
	}
	if($_GET['action'] == 'details')
	{
		echo json_encode( $plan->loadPlanDetails($planNr) );	
	}
}


?>