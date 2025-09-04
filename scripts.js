var titleid;

function main()	{

	d3.select("#report").style("display", "none");
	games();

}

function report()	{

	console.log(titleid);
	d3.select("#gameslist").style("display", "none");
	d3.select("#report").style("display", null);

	if(titleid === 0)
		return;

	Object.keys(graphs).forEach(t => drawtab(t));
	timegraph();

	d3.select("#game").on('focusin', games);

}

