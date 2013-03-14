<?php
include_once('plan.php');

$post = $_POST;

$plan = new plan();

$plan->writePlan($post);

?>