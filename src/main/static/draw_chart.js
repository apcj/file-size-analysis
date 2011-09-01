draw_chart = function() {
	d3.select(".analysistarget").text("Analysing: " + root);
	
	var nameToReduction = {};
	analysis.map(function(d) { nameToReduction[d.name] = d.reductionRatio; });
	
	listing.map(function(d) {
		if (nameToReduction[d.name]) {
			d.reducedSize = d.size * (1 - nameToReduction[d.name]);
		} else {
			d.reducedSize = d.size;
		}
	});

    var curry = function(fna, fnb) { return function(d) { return fna(fnb(d)); }};

    var size = function(file) { return file.size; };
    var reducedSize = function(file) { return file.reducedSize; };
    var folder = function(file) { return file.folder; };
    var eq = function(expected) { return function(d) { return expected === d; }};
    var greaterThan = function(threshold) { return function(d) { return d > threshold; }};

    var largeFiles = listing.filter(curry(eq(""), folder)).filter(curry(greaterThan(1000000), size));
    var indexFiles = listing.filter(function(f) { return f.folder.indexOf("/index") === 0; });
    var indexes = { name: "indexes", size: d3.sum(indexFiles, size) };
	indexes.reducedSize = indexes.size;
    largeFiles.push(indexes);
    var data = largeFiles.sort(function(a, b) { return b.size - a.size; });

	var total = function(sizeFunction) { return d3.sum(listing, sizeFunction); };
	
    var featuredSize = d3.sum(data, size);
	var remainder = { name: "remainder", size: total(size) - featuredSize };
	remainder.reducedSize = remainder.size;
    data.push(remainder);

    var formatSize = function(d) { return (d / (1024 * 1024)).toFixed(0) + "MB"; };
    var percentageOfTotal = function(sizeFunction) { return function(d) { return (100 * d / total(sizeFunction)).toFixed(0) + "%"; }};

    var translate = function(fnx, fny) { return function(d, i) { return "translate(" + fnx(d, i) + "," + fny(d, i) +")"; }};
    var fixed = function(number) { return function(d, i) { return number; }};
	var choose = function(decider, a, b) { return function(d) { return decider(d) ? a : b; }};
	var longBar = function(sizeFunction) { return curry(greaterThan(20000000), sizeFunction); };

    var w = 600,
        h = 500,
        m = { left: 260, right: 50, top: 50, bottom: 40 },
        x = d3.scale.linear().domain([0, d3.max(data, size)]).range([0, w]),
        y = d3.scale.ordinal().domain(d3.range(data.length)).rangeBands([0, h], .2);

	var makeAChart = function(selector, sizeFunction, barsCallback) {
	    var vis = d3.select(selector)
	      .append("svg:svg")
	        .attr("width", w + m.left + m.right)
	        .attr("height", h + m.top + m.bottom)
	      .append("svg:g")
	        .attr("transform", translate(fixed(m.left), fixed(m.top)));
	
		vis.append("svg:text")
			.attr("x", w)
			.attr("y", -30)
			.attr("text-anchor", "end")
			.attr("font-size", 20)
			.text("total size on disk: " + formatSize(total(sizeFunction)));

	    var rules = vis.selectAll("g.rule")
	        .data(x.ticks(10))
	      .enter().append("svg:g")
	        .attr("class", "rule")
	        .attr("transform", translate(x, fixed(0)));

	    rules.append("svg:line")
	        .attr("y1", h)
	        .attr("y2", h + 6)
	        .attr("stroke", "black");

	    rules.append("svg:line")
	        .attr("y1", 0)
	        .attr("y2", h)
	        .attr("stroke", "#888")
	        .attr("stroke-opacity", .3);

	    rules.append("svg:text")
	        .attr("y", h + 9)
	        .attr("dy", ".71em")
	        .attr("text-anchor", "middle")
	        .text(formatSize);

	    vis.append("svg:line")
	        .attr("y1", 0)
	        .attr("y2", h)
	        .attr("stroke", "black");

	    vis.append("svg:line")
	        .attr("x1", 0)
	        .attr("x2", w)
			.attr("y1", h)
			.attr("y2", h)
	        .attr("stroke", "black");
		
	    var bars = vis.selectAll("g.bar")
	        .data(data)
	      .enter().append("svg:g")
	        .attr("class", "bar")
	        .attr("transform", translate(fixed(0), function(d, i) { return y(i); }));

		barsCallback(bars);

	    bars.append("svg:text")
	        .attr("x", curry(x, sizeFunction))
	        .attr("y", y.rangeBand() / 2)
	        .attr("dx", choose(longBar(sizeFunction), -6, 6))
	        .attr("dy", ".35em")
	        .attr("fill", choose(longBar(sizeFunction), "white", "black"))
	        .attr("text-anchor", choose(longBar(sizeFunction), "end", "start"))
	        .text(curry(formatSize, sizeFunction));

	    bars.append("svg:text")
	        .attr("x", w)
	        .attr("y", y.rangeBand() / 2)
	        .attr("dx", 6)
	        .attr("dy", ".35em")
	        .attr("fill", "black")
	        .attr("text-anchor", "start")
	        .text(curry(percentageOfTotal(sizeFunction), sizeFunction));

	    bars.append("svg:text")
	        .attr("x", 0)
	        .attr("y", y.rangeBand() / 2)
	        .attr("dx", -6)
	        .attr("dy", ".35em")
	        .attr("text-anchor", "end")
	        .text(function(d, i) { return d.name; });

		return vis;
	}

	var vis1 = makeAChart(".chart.original", size, function(bars) {
	    bars.append("svg:rect")
	        .attr("fill", "steelblue")
	        .attr("width", curry(x, size))
	        .attr("height", y.rangeBand());
	});
	var vis2 = makeAChart(".chart.reduced", reducedSize, function(bars) {
	    bars.append("svg:rect")
	        .attr("fill", "none")
	        .attr("stroke", "steelblue")
	        .attr("width", curry(x, size))
	        .attr("height", y.rangeBand());
	
	    bars.append("svg:rect")
	        .attr("fill", "steelblue")
	        .attr("width", curry(x, reducedSize))
	        .attr("height", y.rangeBand());
	});
	
	vis2.append("svg:text")
		.attr("x", w)
		.attr("y", -10)
		.attr("text-anchor", "end")
		.attr("font-size", 20)
		.text("reduction: " + ((total(size) - total(reducedSize)) / total(size) * 100).toFixed() + "%");


};