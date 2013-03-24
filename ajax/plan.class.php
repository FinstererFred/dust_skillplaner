<?
define('kk', '6.7868303620e-1');

include_once('db.class.php');

include_once('bcrypt.class.php');

session_start();

error_reporting(0);

class plan 
{
	
	function __construct() 
	{
		global $db;

		$this->db = $db;	
	}

	function loadPlanDetails($planNr)
	{
		$sql = "SELECT p.desc, p.overcap FROM dt_plan p WHERE p.id = :planNr";

		$stmt = $this->db->prepare($sql);

		$stmt->bindParam(':planNr', $planNr, PDO::PARAM_INT);

		$stmt->execute();

		$rs = $stmt->fetch(PDO::FETCH_ASSOC);

		return $rs;
	}

	function loadPlanSkills($planNr)
	{
		$sql = "SELECT ps.skillID, ps.startLvl, ps.endLvl from dt_planskills ps where ps.planID = :planNr ORDER BY ps.planskillID";

		$stmt = $this->db->prepare($sql);

		$stmt->bindParam(':planNr', $planNr, PDO::PARAM_INT);

		$stmt->execute();

		$_outArray = array();

		while( $rs = $stmt->fetch(PDO::FETCH_ASSOC) )
		{
			array_push($_outArray, $rs);
		}

		return $_outArray;
	}

	function unlockPlan($planNr)
	{
		$sql = "SELECT p.pw, p.salt FROM dt_plan p WHERE p.id = :planNr";

		$stmt = $this->db->prepare($sql);

		$stmt->bindParam(':planNr', $planNr, PDO::PARAM_INT);

		$stmt->execute();

		$rs = $stmt->fetch(PDO::FETCH_ASSOC);

		return array( 'pw' => $rs['pw'], 'salt' => $rs['salt']);
	}

	function writePlan($daten)
	{
		$used = str_replace('\\', '', $daten['usedSkills']);
		
		$used = json_decode($used);

		$planNr = $daten['planNr'];

		$bcrypt = new bCrypt;

		$redirect = false;

		$suchmuster = '/[^A-Za-z0-9-_ ]/';

		if( preg_match($suchmuster, $daten['name']) ) { echo "omg"; return; }
		
		if($planNr > 0)
		{
			$userpw = $this->unlockPlan( $planNr );

			$pw = $bcrypt->test($daten['pw'], $userpw['pw'], $userpw['salt'] ); 

			$name = $daten['name'];

			$overcap = (int)$daten['overcap'];

			if(!$pw && ($_SESSION['planID'] != $planNr && $_SESSION['loggedIn'] != true) ) { echo "omg";	return;	}

			$sql = "DELETE from dt_planskills where planID = :planNr";

			$stmt = $this->db->prepare($sql);

			$stmt->bindParam(':planNr', $planNr, PDO::PARAM_INT);

			$stmt->execute();

			$sql = "UPDATE dt_plan SET dt_plan.desc = :name, dt_plan.overcap = :overcap WHERE id = :planNr LIMIT 1";

			$stmt = $this->db->prepare($sql);

			$stmt->bindParam(':name', $name, PDO::PARAM_STR);
			
			$stmt->bindParam(':overcap', $overcap , PDO::PARAM_INT);
			
			$stmt->bindParam(':planNr', $planNr, PDO::PARAM_INT);

			$stmt->execute();
		}
		else
		{
			$salt = $this->generateSalt(10);

			$pw = $bcrypt->hash( $daten['pw'], $salt);

			$sql = "INSERT into dt_plan (dt_plan.desc,dt_plan.overcap,pw,salt,dt_plan.date) VALUES (:name,:overcap,:pw,:salt,:date)";

			$stmt = $this->db->prepare($sql);

			$overcap = (int)$daten['overcap'];

			$stmt->bindParam(':overcap', $overcap , PDO::PARAM_INT);

			$stmt->bindParam(':name', $daten['name'], PDO::PARAM_STR);
			
			$stmt->bindParam(':pw', $pw, PDO::PARAM_STR);
			
			$stmt->bindParam(':salt', $salt, PDO::PARAM_STR);
			
			$zeit = date('Y-m-d h:i:s',time());

			$stmt->bindParam(':date', $zeit, PDO::PARAM_STR);

			$stmt->execute();

			$planNr = $this->db->lastInsertId();

			$redirect = true;
		}
		
		foreach ($used as $key => $skill) 
		{
			$sql = "INSERT into dt_planskills (planID,skillID,startLvl,endLvl) VALUES (:planNr, :skillID, :startLvl, :endLvl)";

			$stmt = $this->db->prepare($sql);

			$stmt->bindParam(':planNr', $planNr, PDO::PARAM_INT);
			
			$stmt->bindParam(':skillID', $skill->skill_id, PDO::PARAM_INT);
			
			$stmt->bindParam(':startLvl', $skill->start_level, PDO::PARAM_INT);
			
			$stmt->bindParam(':endLvl', $skill->end_level, PDO::PARAM_INT);

			$stmt->execute();

		}

		if($redirect) 
		{ 
			$_SESSION['loggedIn'] = true;

			$_SESSION['planID'] = (int)$planNr;
			
			echo 'redir::'.$planNr;
		}
		else
		{
			echo 'ok';
		}

	}

	function generateSalt($max = 15) {
        $characterList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";
        $i = 0;
        $salt = "";
        while ($i < $max) {
            $salt .= $characterList{mt_rand(0, (strlen($characterList) - 1))};
            $i++;
        }
        return $salt;
	}
}


?>