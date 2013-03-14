<?php

class bCrypt 
{
      
  function hash ( $password, $email = '',$rounds='08' )
  {
      $string = hash_hmac ( "whirlpool", str_pad ( $password, strlen ( $password ) * 4, sha1 ( $email ), STR_PAD_BOTH ), kk, true );
      $salt = substr ( str_shuffle ( './0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' ) , 0, 22 );
      return crypt ( $string, '$2a$' . $rounds . '$' . $salt );
  }

  function test ( $password, $stored, $email = '' )
  {
    $string = hash_hmac ( "whirlpool", str_pad ( $password, strlen ( $password ) * 4, sha1 ( $email ), STR_PAD_BOTH ), kk, true );
    return crypt ( $string, substr ( $stored, 0, 30 ) ) == $stored;
  }

} 

?>