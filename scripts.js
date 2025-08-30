var titleid;

function main()	{

	games();

}

function report()	{

	console.log(titleid);
	d3.select("#gameslist").style("display", "none");

	if(titleid === 0)
		return;

	Object.keys(graphs).forEach(t => drawtab(t));
	timegraph();

	d3.select("#game").on('focusin', games);

}

