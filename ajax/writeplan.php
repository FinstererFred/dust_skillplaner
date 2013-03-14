<?php
include_once('plan.class.php');

$post = $_POST;

$plan = new plan();

$plan->writePlan($post);

?>