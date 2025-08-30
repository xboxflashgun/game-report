function timegraph()	{

	var url = `api/getcsv.php?f=gettime&titleid=${titleid}`;
	Object.keys(graphs).forEach( t => url += `&${graphs[t].fld}=${graphs[t].id}` );

	fetch(url)
	.then(res => res.text())
	.then(res => {

		var tab = {};

		res.split('\n').forEach(s => {

			if(s.length === 0)
				return;

			var row = s.split('\t');
			tab[row[0]] ??= [];
			tab[row[0]].push( { 
				utime: new Date(+row[1] * 1000),
				gamers: +row[2],
				avghours: +row[3]/3600/(+row[2]),
				avgdays: +row[4]/(+row[2])
			});

		});

		console.log(tab);

		var div = d3.select("#timegamers");
		var width = div.node().clientWidth;
		var height = div.node().clientHeight;
		var [ mT, mR, mB, mL ] = [ 30, 0, 30, 40 ];		// marginTop, marginRight, ...

		var x = d3.scaleTime()
			.domain(d3.extent(tab['week'].map(d => d.utime).concat(tab['month'].map(d => d.utime))))
			.nice()
			.range([ mL, width-mR ]);
		var y = d3.scaleLinear( [0, d3.max(tab['month'].map(d => d.gamers)) ], [ height-mB, mT ] );

		var svg = d3.select("#timegamers svg");
		svg.select(".x-axis")
			.attr("transform", `translate(0, ${height-mB})`)
			.call(d3.axisBottom(x));	// .tickSizeOuter(0));

		svg.select(".y-axis")
			.attr("transform", `translate(${mL}, 0)`)
			.call(d3.axisLeft(y).tickFormat(d3.format(".3~s")));

		var bandwidth = x(new Date(7*24*3600*1000)) - x(new Date(0));		//	(width-mR-mL) / tab['week'].length - 1;
		bandwidth *= 0.8;		// padding

		console.log(bandwidth);
		svg.select(".graph-w")
			.selectAll("rect")
			.data(tab['week'])
			.join( enter => {
				enter.append("rect")
					.attr("x", d => x(d.utime))
					.attr("y", d => y(d.gamers))
					.attr("height", d => y(0) - y(d.gamers))
					.attr("fill", "#c07")
					.attr("width", bandwidth)
					.attr("data-date", d => d.utime.toLocaleDateString())
					.attr("data-id", (d,i) => i)
					.attr("data-tab", "week");
			}, update => {
				update
					.attr("x", d => x(d.utime))
					.attr("y", d => y(d.gamers))
					.attr("height", d => y(0) - y(d.gamers))
					.attr("fill", "#c07")
					.attr("width", bandwidth)
					.attr("data-date", d => d.utime.toLocaleDateString())
					.attr("data-id", (d,i) => i)
					.attr("data-tab", "week");
			}, exit => exit.remove()
			);

		// month graph

		function band(utime)	{		// bandwidth for months

			var nd = new Date(new Date(utime).setMonth((utime.getMonth() + 1)));
			return x(nd) - x(utime) - 1;

		}

		svg.select(".graph-m")
			.selectAll("rect")
			.data(tab['month'])
			.join( enter => {
				enter.append("rect")
					.attr("x", d => x(d.utime))
					.attr("y", d => y(d.gamers))
					.attr("height", d => y(0) - y(d.gamers))
					.attr("fill", "#309")
					.attr("width", d => band(d.utime))
					.attr("data-date", d => d.utime.toLocaleDateString())
					.attr("data-id", (d,i) => i)
					.attr("data-tab", "month");
			}, update => {
				update
					.attr("x", d => x(d.utime))
					.attr("y", d => y(d.gamers))
					.attr("height", d => y(0) - y(d.gamers))
					.attr("fill", "#309")
					.attr("width", bandwidth)
					.attr("data-date", d => d.utime.toLocaleDateString())
					.attr("data-id", (d,i) => i)
					.attr("data-tab", "month");
			}, exit => exit.remove()
			);

		svg.selectAll("rect").on("mouseover", (e) => {

			var rect = d3.select(e.target);
			var [x, y] = [ +rect.attr("x"), +rect.attr("y") ];
			var [bx, by] = [ svg.node().getBoundingClientRect().x + window.scrollX, svg.node().getBoundingClientRect().y + window.scrollY];
			var popup=d3.select("#popup-rect");
			var row = tab[rect.attr("data-tab")][rect.attr("data-id")];

			popup.style("top", y + by + "px")
				.style("left", x + bx + "px");

			console.log(row);

		});

	});

}
