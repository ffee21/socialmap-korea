/**
 * runs at page loading
 */

// DECLARING CONSTANTS
var DATA_DEF = 'DATA_DEF',
	MAP = 'MAP',
	DEFAULT_DATA = 'DEFAULT_DATA',
	SHOW_DATA = 'SHOW_DATA',
	SHOW_DATA_INDEX_CHANGED = "SHOW_DATA_INDEX_CHANGED";

// PREPARE STATUS VARIABLES
var s = {};
s[DATA_DEF] = false;
s[MAP] = false;
s[DEFAULT_DATA] = false;
s[SHOW_DATA] = false;


var width  = 700;
var height = 500;


var datafiles;

var vis = d3.select("#vis").append("svg")
    .attr("width", width).attr("height", height);

var defaultdata;
var showdata;

function applyInputValue(value) {
	s[SHOW_DATA] = false;
	update(SHOW_DATA_INDEX_CHANGED, value)
}

function update(what, data) {
	if (what == DATA_DEF) {
		datafiles = data;
		
		var consel = d3.select("select#consel");
		consel.selectAll("option")
				.data(datafiles)
				.enter().append("option")
				.attr("value", function(d) {return d.code;})
				.text(function(d) {return d.name;});

		s[DATA_DEF] = true;

		applyInputValue(datafiles[0].code)

	} else if (what == MAP) {
		var subunits = topojson.feature(data, data.objects.skorea_municipalities_geo);
		var features = subunits.features;
		
	    var projection = d3.geo.mercator()
	    					.center([0, 0])
						    .scale(1);

	    var path = d3.geo.path()
	    			.projection(projection);
		
		var paths = vis.selectAll("path")
						.data(features)
						.enter().append("path")
							.attr("d", path)
							.attr("id", function(d) { return "adm_" + d.properties.sigungu_cd; });
		
	    var bounds = path.bounds(subunits),
	      dx = bounds[1][0] - bounds[0][0],
	      dy = bounds[1][1] - bounds[0][1],
	      x = (bounds[0][0] + bounds[1][0]) / 2,
	      y = (bounds[0][1] + bounds[1][1]) / 2,
	      scale = .9 / Math.max(dx / width, dy / height),
	      translate = [width / 2 - scale * x, height / 2 - scale * y];
	    
		s[MAP] = true;
		
		
		paths.transition()
	      .duration(750)
	      .style("stroke-width", 1.5 / scale + "px")
	      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
	    
		
		
	} else if (what == DEFAULT_DATA) {
		defaultdata = data;
		s[DEFAULT_DATA] = true;
	} else if (what == SHOW_DATA_INDEX_CHANGED) {
		if (s[MAP] && s[DEFAULT_DATA]) { 
			showdata = defaultdata.filter(function (d) {return d.data_code == data;});
//			console.log(showdata);
			max = d3.max(showdata, function(d) {return parseFloat(d.value);});
			min = d3.min(showdata, function(d) {return parseFloat(d.value);});
			console.log("max: " + max + ", min: " + min);
			
			vis.selectAll("path")
			.style("fill", d3.rgb(255, 0, 0))
			.style("stroke", "solid 1px #303030");
		
			if (min > 100) { 	// for population-like data
				showdata.forEach(function(sd) {
					var v = Math.floor(256 * (sd.value - min)/(max-min) + 0);
					vis.select("#adm_" + sd.adm_code)
						.style("fill", d3.rgb(v,v,v))
						.attr("text", sd.value)
						.style("stroke", "solid 1px #303030");
				});
			} else if (min > 0 && max < 2) {	// for sex-ratio-like data
				showdata.forEach(function(sd) {
					var maxdist = Math.max(1-min, max-1);
					if (sd.value < 1) { // assume less is worse
						var v = Math.floor(255 * (1 - sd.value)/maxdist);
						vis.select("#adm_" + sd.adm_code)
							.style("fill", d3.rgb(255,255-v,255-v))
							.attr("text", sd.value)
							.style("stroke", "solid 1px #303030");
					} else {
						var v = Math.floor(255 * (sd.value-1)/maxdist);
						vis.select("#adm_" + sd.adm_code)
							.style("fill", d3.rgb(255-v,255-v,255))
							.attr("text", sd.value)
							.style("stroke", "solid 1px #303030");
					}
				});
			} else {
				showdata.forEach(function(sd) {
					var v = Math.floor(256 * (sd.value - min)/(max-min) + 0);
					vis.select("#adm_" + sd.adm_code)
						.style("fill", d3.rgb(v,v,v))
						.attr("text", sd.value)
						.style("stroke", "solid 1px #303030");
				});
			}
			
			
			
			s[SHOW_DATA] = true;
		} else {
			console.log("map is not loaded or default data is not loaded. will rerun in 100ms.")
			setTimeout(function() {update(what, data)}, 100);
		}
	}
}

d3.json("data_def.json", function(error, data) {
	if (error) {
		return console.error(error);
	} else{
		update(DATA_DEF, data);
	}	
});

d3.json("data.json", function(error, data) {
	if (error) {
		return console.error(error);
	} else{
		update(DEFAULT_DATA, data);
	}
});

d3.json("/static/map4.json", function(error, data) {
	if (error) {
		return console.error(error);
	} else{
		update(MAP, data);
	}	
});

