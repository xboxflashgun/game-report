var titleid;

function main()	{

	games();

}

function report()	{

	console.log(titleid);
	d3.select("#gameslist").style("display", "none");

	if(titleid === 0)
		return;

	fetch("api/getjson.php?f=getgameinfo&titleid=" + titleid)
	.then(res => res.json())
	.then(res => {

		Object.keys(res[0][0]).forEach( k => d3.select("#"+k).text(res[0][0][k]));
		d3.select("#timesince").text( (new Date( +res[1][0] * 1000)).toLocaleDateString());

	});

	Object.keys(graphs).forEach(t => drawtab(t));
	timegraph();

}

