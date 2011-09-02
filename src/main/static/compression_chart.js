draw_chart = function() {
	var a = function(field) { return function(d) { return d[field]; }; };
	var curry = function(fna, fnb) { return function(d) { return fna(fnb(d)); }};
    var translate = function(fnx, fny) { return function(d, i) { return "translate(" + fnx(d, i) + "," + fny(d, i) +")"; }};
    var fixed = function(number) { return function(d, i) { return number; }};
    
	var w = 800,
	h = 600,
	m = { left: 70, right: 50, top: 50, bottom: 70 };
	
	var x = d3.scale.log().domain([1024, 1024 * 1024]).range([0, w]);
	var y = d3.scale.linear().domain([0, 1]).range([h, 0]);
	
	var vis = d3.select("body")
	    .append("svg:svg")
	    .attr("width", w + m.left + m.right)
	    .attr("height", h + m.top + m.bottom)

	var g = vis.append("svg:g")
	    .attr("transform", translate(fixed(m.left), fixed(m.top)));
	
	var line = d3.svg.line()
	    .x(curry(x, a("blockSize")))
	    .y(curry(y, a("average")));

	g.selectAll("path")
		.data(compressionAnalysis)
		.enter().append("svg:path")
		.attr("stroke", curry(d3.scale.category20c(), a("fileName")))
		.attr("d", curry(line, a("statistics")));
		
	g.append("svg:line")
	    .attr("x1", 0)
	    .attr("y1", h)
	    .attr("x2", w)
	    .attr("y2", h)

	g.append("svg:line")
	    .attr("x1", 0)
	    .attr("y1", 0)
	    .attr("x2", 0)
	    .attr("y2", h)

    var hRules = g.selectAll("g.hRule")
        .data(y.ticks(10))
      .enter().append("svg:g")
        .attr("class", "hRule")
        .attr("transform", translate(fixed(0), y));

    hRules.append("svg:line")
        .attr("x1", 0)
        .attr("x2", -6)
        .attr("stroke", "black");

    hRules.append("svg:line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("stroke", "lightgrey");

    hRules.append("svg:text")
        .attr("x", -9)
        .attr("text-anchor", "end")
        .text(function(d) { return (d * 100).toFixed(0) + "%"; });

    var vRules = g.selectAll("g.vRule")
        .data(x.ticks(10))
      .enter().append("svg:g")
        .attr("class", "vRule")
        .attr("transform", translate(x, fixed(0)));

    vRules.append("svg:line")
        .attr("y1", h)
        .attr("y2", h + 6)
        .attr("stroke", "black");

    vRules.append("svg:line")
        .attr("y1", 0)
        .attr("y2", h)
        .attr("stroke", "lightgrey");

    vRules.append("svg:g").attr("transform", "rotate(90 0 " + (h + 9) + ")").append("svg:text")
        .attr("y", h + 9)
        .attr("text-anchor", "start")
        .text(function(d) { return (d / 1000) + "K"; });

	g.append("svg:text")
		.attr("x", w / 2)
		.attr("y", h + 50)
        .attr("text-anchor", "middle")
		.text("Compression block size (bytes)");

	g.append("svg:text")
		.attr("x", -50)
		.attr("y", h / 2)
        .attr("text-anchor", "middle")
		.attr("transform", "rotate(90 -50 " + (h / 2) + ")")
		.text("Compressed size as ratio of uncompressed size");
}