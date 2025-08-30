<?php

header('Content-type: text/csv');
header("Cache-control: private");

foreach ($_GET as $k => $v)     {

	if(preg_match('/[^0-9a-z_-]/', $k) ||
		preg_match('/[^0-9A-Za-z =\/\-\+],/', $v))

		die("Oops: $k, $v");

}

$mc = new Memcached('xboxstat5');
if (!count($mc->getServerList()))
	$mc->addServer( '127.0.0.1', 11211 );

$rep = $mc->get($_SERVER['QUERY_STRING']);

if( $rep )      {
	echo $rep;
	return 0;
}

$db = pg_pconnect("port=6432 host=/tmp dbname=global user=readonly password=masha27uk")
	or die("could not connect to DB");

$rows = array();
$timeout = 6;

if( preg_match('/^(get|add|del)/', $_GET['f']) )
    $_GET['f']();

$rep = implode($rows);

$mc->set($_SERVER['QUERY_STRING'], $rep, $timeout);
header("Cache-control: max-age=$timeout");
echo $rep;


// usage: GET http://host/api/getcsv.php?f=func&par=parameters

function getgames()	{

	global $db, $rows;

	$game = isset($_GET['game']) ? base64_decode($_GET['game']) : '';

	$where = "where players > 0\n";

	if(strlen($game) > 0)
		$where .= "and lower(name) like lower('%". pg_escape_string($db, $game) . "%')\n";

	$rows = pg_copy_to($db, "(

		select
			titleid,
			name,
			players
		from games
		$where
		order by players desc nulls last
		limit 200

	)", chr(9));

}

function gettab()	{		// tab = { devices, countries, langs }

	global $db, $rows;

	$tab = $_GET['tab'];
	$titleid = $_GET['titleid'];

	$where = "";

	if($tab != 'devices')
		if($_GET['devid'] >= 0)
			$where .= "and devid=".$_GET['devid']."\n";
		else
			$where .= "and devid is null\n";

	if($tab != 'countries')
		if($_GET['countryid'] > 0)
			$where .= "and countryid=".$_GET['countryid']."\n";
		else
			$where .= "and countryid is null\n";

	if($tab != 'langs')
		if($_GET['langid'] > 0)
			$where .= "and langid=".$_GET['langid']."\n";
		else
			$where .= "and langid is null\n";

	switch($tab)	{

		case 'devices':
			$fld1 = 'devname';
			$fld2 = 'devid';
			$join = 'left join devices using(devid)';
			$union = "and devid is null\n";
			break;
		case 'countries':
			$fld1 = 'name';
			$fld2 = 'countryid';
			$join = 'left join countries using(countryid)';
			$union = "and countryid is null\n";
			break;
		case 'langs':
			$fld1 = 'name';
			$fld2 = 'langid';
			$join = 'left join languages using(langid)';
			$union = "and langid is null\n";
			break;
	
	}

	$req = "

select
	$fld1,$fld2,gamers,secs,days,titleid,totgamers
from aggs.overall
$join
left join (
	select
		'',$fld2,
		gamers as totgamers
	from aggs.overall
	where
		titleid is null
		$where
	) using($fld2)
where
	titleid=$titleid
	$where
union
select
	$fld1,$fld2,gamers,secs,days,titleid,null as totgamers
from aggs.overall
$join
where
	titleid is null
	$where
order by titleid nulls first


	";

	error_log($req);

	$rows = pg_copy_to($db, "( $req )", chr(9));

}

function gettime()	{

	global $db, $rows;

	$titleid = $_GET['titleid'];

	$where = "titleid=$titleid\n";

	if($_GET['devid'] >= 0)
		$where .= "and devid=".$_GET['devid']."\n";
	else
		$where .= "and devid is null\n";

	if($_GET['countryid'] > 0)
		$where .= "and countryid=".$_GET['countryid']."\n";
	else
		$where .= "and countryid is null\n";

	if($_GET['langid'] > 0)
		$where .= "and langid=".$_GET['langid']."\n";
	else
		$where .= "and langid is null\n";

	$rows = pg_copy_to($db, "(
		
		select 
			'week',
			utime,
			gamers,
			secs,
			days
		from aggs.week
		where 
			$where
		union
		select 
			'month',
			utime,
			gamers,
			secs,
			days
		from aggs.month
		where 
			$where
		order by utime

	)", chr(9));

}
