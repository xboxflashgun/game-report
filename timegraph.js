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
			var utime = new Date(+row[1] * 1000);
			tab[row[0]].push( { 
				utime: utime,
				gamers: +row[2],
				avghours: (+row[3]/3600/(+row[2])),
				avgdays: (+row[4]/(+row[2])),
				header: (row[0] === 'month') ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(utime)
					: utime.toLocaleDateString(),
			});

		});

		draw_timegraph("#timegamers", "gamers");
		draw_timegraph("#timespent", "avghours");
		draw_timegraph("#timedays", "avgdays");

		function draw_timegraph(divname, col)	{

			var div = d3.select(divname);
			var width = div.node().clientWidth;
			var height = div.node().clientHeight;
			var [ mT, mR, mB, mL ] = [ 30, 0, 30, 40 ];		// marginTop, marginRight, ...

			var x = d3.scaleTime()
				.domain(d3.extent(tab['week'].map(d => d.utime).concat(tab['month'].map(d => d.utime))))
				.nice()
				.range([ mL, width-mR ]);
			var y = d3.scaleLinear( [0, d3.max(tab['month'].map(d => d[col])) ], [ height-mB, mT ] );

			var svg = div.select("svg");
			svg.select(".x-axis")
				.attr("transform", `translate(0, ${height-mB})`)
				.call(d3.axisBottom(x));	// .tickSizeOuter(0));

			svg.select(".y-axis")
				.attr("transform", `translate(${mL}, 0)`)
				.call(d3.axisLeft(y).tickFormat(d3.format(".3~s")));

			var bandwidth = x(new Date(7*24*3600*1000)) - x(new Date(0));		//	(width-mR-mL) / tab['week'].length - 1;
			bandwidth -= 1;		// padding

			svg.select(".graph-w")
				.selectAll("rect")
				.data(tab['week'])
				.join( enter => {
					enter.append("rect")
						.attr("x", d => x(d.utime))
						.attr("y", d => y(d[col]))
						.attr("height", d => y(0) - y(d[col]))
						.attr("fill", "#c07")
						.attr("width", bandwidth)
						.attr("data-date", d => d.utime.toLocaleDateString())
						.attr("data-id", (d,i) => i)
						.attr("data-tab", "week");
				}, update => {
					update
						.attr("x", d => x(d.utime))
						.attr("y", d => y(d[col]))
						.attr("height", d => y(0) - y(d[col]))
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
						.attr("y", d => y(d[col]))
						.attr("height", d => y(0) - y(d[col]))
						.attr("fill", "#309")
						.attr("width", d => band(d.utime))
						.attr("data-date", d => d.utime.toLocaleDateString())
						.attr("data-id", (d,i) => i)
						.attr("data-tab", "month");
				}, update => {
					update
						.attr("x", d => x(d.utime))
						.attr("y", d => y(d[col]))
						.attr("height", d => y(0) - y(d[col]))
						.attr("fill", "#309")
						.attr("width", d => band(d.utime))
						.attr("data-date", d => d.utime.toLocaleDateString())
						.attr("data-id", (d,i) => i)
						.attr("data-tab", "month");
				}, exit => exit.remove()
				);

			svg.selectAll("rect").on("mouseover", (e) => {

				var rect = d3.select(e.target);
				var [x, y, w] = [ +rect.attr("x"), +rect.attr("y"), +rect.attr("width") ];
				var [bx, by] = [ svg.node().getBoundingClientRect().x + window.scrollX, svg.node().getBoundingClientRect().y + window.scrollY];
				var popup=d3.select("#popup-rect")
					.style("display", null);

				var per = rect.attr("data-tab");
				var row = tab[per][rect.attr("data-id")];

				popup.style("top", y + by - 70 + "px")
					.style("left", x + bx + w/2 + "px");

				d3.select("#period-name").text(per.charAt(0).toUpperCase() + per.slice(1));
				d3.select("#period-str").text(row.header);
				var num = ( col === 'gamers' ) ? row[col] : row[col].toFixed(2);
				d3.select("#number").text(num);

				svg.select("rect.bright").attr("filter", "brightness(1)").classed("bright", false);
				rect.attr("filter", "brightness(1.2)").classed("bright", true);
		
				div.on('mouseout', () => { 
					popup.style("display",  "none");
					svg.select("rect.bright").attr("filter", "brightness(1)").classed("bright", false);
				});

			});

		}

	});

}
