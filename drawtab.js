var graphs = {
	
	devices:    {  id: -1, color: '#29bf12', fld: 'devid',      filter: false   },
	countries:  {  id: -1, color: '#12b2cc', fld: 'countryid',  filter: true    },
	langs:      {  id: -1, color: '#ff9914', fld: 'langid',     filter: true    },

};

function drawtab(table)	{

	var filter = '';

	var url = `api/getcsv.php?f=gettab&tab=${table}&titleid=${titleid}`;
	Object.keys(graphs).forEach( t => url += `&${graphs[t].fld}=${graphs[t].id}` );

	fetch(url)
	.then( res => res.text() )
	.then( res => {
		
		var tab = [];
		var maxn;

		res.split('\n').forEach( s => {

			if(s.length === 0)
				return;

			var row = s.split('\t');
			row[1] = +row[1];
			row[2] = +row[2];
			if(row[0] === '\\N')	{

				row[0] = 'All';
				row[1] =  -1;
				maxn = row[2];

			}
			row[3] = +row[3];
			row[4] = +row[4];
			tab.push(row);

		});

		function filltab()	{

			var filter = '';
			if(graphs[table].filter)
				filter = d3.select("#filter-" + table).property('value').toLowerCase();

			d3.select(`#${table}`).selectAll('tr')
			.data( tab
				.filter(d => ( d[0].toLowerCase().indexOf(filter) >= 0 ))
				.sort( (a,b) => b[2] - a[2]) )
			.join( enter => {

				var tr = enter.append('tr');
				var td = tr.append('td');
				td.append('label').text(d => d[0])
					.append('input').attr('type','radio').attr('name', table)
					.property('value', d => d[1]).property('checked', (d => d[1] === graphs[table].id));
				tr.append('td').attr('title', d => d[2])
					.text(d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[2]));
				tr.append('td').append('div').style('width', d => 100.*d[2]/maxn + '%')
					.style('background', d=>graphs[table].color).classed('rect', true);
				tr.append('td').text( d => (100.*d[2]/maxn).toFixed(2) + '%');
				tr.append('td').text( d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[3]/3600));
				tr.append('td').text( d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[4]));

			}, update => {

				update.select('td:nth-child(1) label').text(d => d[0])
					.append('input').attr('type','radio').attr('name', table).property('value', d => d[1])
					.property('checked', (d => d[1] === graphs[table].id));
				update.select('td:nth-child(2)').attr('title', d => d[2])
					.text(d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[2]));
				update.select('td:nth-child(3) div').style('width', d => 100.*d[2]/maxn + '%');
				update.select('td:nth-child(4)').text( d => (100.*d[2]/maxn).toFixed(2) + '%');
				update.select('td:nth-child(5)').text( 
					d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[3]/3600));
				update.select('td:nth-child(6)').text( d => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, notation: 'compact' }).format(d[4]));
	
			}, exit => {
	
				exit.remove();
			
			});

			d3.select(`#${table}`).selectAll('input[type="radio"]').on('change', e => {

				var id = +e.target.value;
				graphs[table].id = id;

				Object.keys(graphs).forEach( t => {
					if(t !== table)
						drawtab(t);
				});
				paint();
				timegraph();

			});

			paint();

		}

		const grad = (a,b) => (a === b) ? 'white' : (a > b) ? '#0f0' : '#f00';

		function paint()	{

			var id = +d3.select(`#${table} input[type="radio"]:checked`).property("value");

			var sel = tab.find( d => d[1] === id );
			var [ avgh, avgd ] = [ sel[3], sel[4] ];

			d3.selectAll(`#${table} td:nth-child(5)`).style('color', v => grad(v[3], avgh));
			d3.selectAll(`#${table} td:nth-child(6)`).style('color', v => grad(v[4], avgd));

		}

		filltab();

		if(graphs[table].filter)
			d3.select("#filter-" + table).on('input', filltab);

	});

}
