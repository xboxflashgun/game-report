function games()	{

	d3.select("#gameslist").style("display", null);
	d3.select("#game").on('input', games);

	var url = "api/getcsv.php?f=getgames";
	var game = d3.select("#game").property('value');
	if(game.length > 0)
		url += '&game=' + to64(game);

	fetch(url)
	.then(res => res.text())
	.then(res => {

		var tab = [];
		tab.push( [0, '- reset -', 0] );

		res.split('\n').forEach( s => {

			if(s.length === 0)
				return;

			var row = s.split('\t');
			row[0] = +row[0];
			row[2] = +row[2];
			tab.push(row);

		});

		d3.select("#gamestab").selectAll("tr")
		.data( tab )
		.join( enter => {

			var tr=enter.append("tr").attr('data-id', d=> d[0]);
			tr.append("td").text(d => d[1]);
			tr.append("td").text(d => d[2]);

		}, update => {

			update.attr('data-id', d=> d[0]);
			update.select("td:nth-child(1)").text(d => d[1]);
			update.select("td:nth-child(2)").text(d => d[2]);

		}, exit => {

			exit.remove();

		});

		d3.select("#gamestab").selectAll("tr").on('click', (e) => {

			titleid = e.target.parentNode.dataset.id;
			report();

		});

	});

}

function to64(str)  {

	return btoa( String.fromCodePoint(...new TextEncoder().encode(str)));

}
