var width = 500, height = 500;
var map = d3.select("#map").append("svg")
			.attr("width", width)
			.attr("height", height);

d3.json("/static/map4.json", function(e, d) {
	if (e) {
		console.error(e);
	} else{
		var subunits = topojson.feature(d, d.objects["skorea_municipalities_geo"]);
		var features = subunits.features;
		
	    var projection = d3.geo.mercator()
	    				.scale(1)
	    				.center([0,0]);
	    
	    var path = d3.geo.path()
	    			.projection(projection);
	    
	    
	    var bounds = path.bounds(subunits),
		      dx = bounds[1][0] - bounds[0][0],
		      dy = bounds[1][1] - bounds[0][1],
		      x = (bounds[0][0] + bounds[1][0]) / 2,
		      y = (bounds[0][1] + bounds[1][1]) / 2,
		      scale = .9 / Math.max(dx / width, dy / height),
		      translate = [width / 2 - scale * x, height / 2 - scale * y];
		
	    var paths = map.selectAll("path")
		.data(features)
		.enter().append("path")
			.attr("d", path)
			.style("stroke", "1px solid black");
			
	    paths.transition()
	      .duration(750)
	      .style("stroke-width", 1.5 / scale + "px")
	      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	    
	    
	}
});