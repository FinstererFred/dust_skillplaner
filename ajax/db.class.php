<?php

    $user = 'root';
    $pw =   '';
    $host = 'localhost';
    $db =   'test'; 
    $port = '3306';   

 
  $constr = sprintf("mysql:host=%s;port=%d;dbname=%s", $host, $port, $db);
  
  // Versuchen, eine DB-Verbindung herzustellen
  $db = new PDO($constr, $user, $pw);
    
  // Errormode setzen
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
 
?>