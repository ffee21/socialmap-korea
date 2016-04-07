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
				.attr("value", function(d) {return d.data_code;})
				.text(function(d) {return d.name;});

		s[DATA_DEF] = true;

		applyInputValue(datafiles[0].data_code)

	} else if (what == MAP) {
		var subunits = topojson.feature(data, data.objects.skorea_municipalities_geo);
		var features = subunits.features;
		
	    var projection = d3.geo.mercator()
						    .center([129, 36])
						    .scale(4000)
						    .translate([width/2, height/2]);

	    var path = d3.geo.path()
	    			.projection(projection);
		
		vis.selectAll("path")
			.data(features)
			.enter().append("path")
				.attr("d", path)
				.attr("id", function(d) { return "adm_" + d.properties.code; });
		s[MAP] = true;
	} else if (what == DEFAULT_DATA) {
		defaultdata = data;
		s[DEFAULT_DATA] = true;
	} else if (what == SHOW_DATA_INDEX_CHANGED) {
		if (s[MAP] && s[DEFAULT_DATA]) {
			showdata = defaultdata.filter(function (d) {return d.data_code == data;});
			
			max = d3.max(showdata, function(d) {return d.value;});
			min = d3.min(showdata, function(d) {return d.value;});
			
			showdata.forEach(function(sd) {
				var v = 256 * (sd.value - min)/(max-min);
				vis.select("#adm_" + sd.adm_code)
					.style("fill", d3.rgb(v,v,v));
			});
			
			s[SHOW_DATA] = true;
		} else {
			console.log("map is not loaded or default data is not loaded. will rerun in 100ms.")
			setTimeout(function() {update(what, data)}, 100);
		}
	}
}

d3.csv("data_def.csv", function(error, data) {
	if (error) {
		return console.error(error);
	} else{
		update(DATA_DEF, data);
	}	
});

d3.csv("data.csv", function(error, data) {
	if (error) {
		return console.error(error);
	} else{
		update(DEFAULT_DATA, data);
	}
});

d3.json("map.json", function(error, data) {
	if (error) {
		return console.error(error);
	} else{
		update(MAP, data);
	}	
});

