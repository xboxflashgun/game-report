<?php

header('Content-type: application/json');
header("Cache-control: private");

foreach ($_GET as $k => $v)
	if(preg_match('/[^0-9a-z-]/', $k) || preg_match('/[^0-9a-zA-Z,-\/]/', $v))
		die("Oops");

$db = pg_connect("port=6432 host=/tmp dbname=global user=readonly password=masha27uk")	# , PGSQL_CONNECT_FORCE_NEW)
	or die("could not connect to DB");

$rep = array();

if( substr( $_GET['f'], 0, 3) == 'get' )
	$_GET['f']();

$to = 5;      # timeout
header("Cache-control: max-age=$to");

echo json_encode($rep, JSON_UNESCAPED_UNICODE);

# functions goes here

function getgameinfo() {

	global $db, $rep;

	$titleid = $_GET['titleid'];

	$rep[] = pg_fetch_all(pg_query($db, "select name,players from games where titleid=$titleid"), PGSQL_ASSOC);
	$rep[] = pg_fetch_all(pg_query($db, "select min(utime) as utime from presence where titleid=$titleid"), PGSQL_NUM);

}

