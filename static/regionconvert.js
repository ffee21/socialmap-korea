function unique(redundantList) {
	var _uniqueList = [];
	$.each(redundantList, function(i, el) {
		if($.inArray(el, _uniqueList) === -1) _uniqueList.push(el);
	});
	
	return _uniqueList;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var table = d3.select("#formcont").append("table");
var tr1 = table.append("tr");
var tr2 = table.append("tr");
var tr3 = table.append("tr");

tr1.append("td").text("Source:");
tr2.append("td")
	.append("textarea")
	.attr("id", "txtsrc")
	.attr("cols", "40")
	.attr("rows", "10")
	.text("서울특별시 종로구\t100\n서울특별시 중구\t200\n서울특별시 용산구\t300");
tr3.append("td").attr("rowspan", "3").text("BaseYear")
	.append("input").attr("type", "text").attr("value","2010").attr("id", "txtbaseyear");
tr1.append("td");
tr2.append("td")
	.text(">>");
tr1.append("td").text("Destination:");
tr2.append("td")
	.append("textarea")
	.attr("id", "txtdst")
	.attr("cols", "40")
	.attr("rows", "10");

var regionlist = [];
var regiondict = {};

d3.json("/region_def.json", function(e,d) {
	if (e) {
		console.error(e);
	} else {
		var rt = d3.select("#regiontable");
		
		regionlist = d;
		
		region_name_list = unique(regionlist.map(function(item) { return item.region_name; })).sort();
		baseyear_list = unique(regionlist.map(function(item) { return item.baseyear; })).sort();
		
		var rtt = rt.append("table");
		
		var rttt = rtt.append("tr");
		rttt.append("td");
		for (item2 in baseyear_list) {
			rttt.append("td").text(baseyear_list[item2]);
			regiondict[baseyear_list[item2]] = {};
		}
		for (item1 in region_name_list) {
			rttt = rtt.append("tr");
			rttt.append("td").text(region_name_list[item1])
			for (item2 in baseyear_list) {
				rttt.append("td").attr("id", region_name_list[item1].replaceAll(" ", "_") + "_" + baseyear_list[item2]);
			}
		}
		
		for (item in regionlist) {
			var thecell = d3.select("#" + regionlist[item].region_name.replaceAll(" ", "_") + "_" + regionlist[item].baseyear);
			thecell.text(regionlist[item].region_code);
			
			regiondict[regionlist[item].baseyear][regionlist[item].region_name] = regionlist[item].region_code;
		}
	}
});

function updateValue() {
	var txtsrc = $("#txtsrc").val();
	var baseyear = $("#txtbaseyear").val();
	var inlist = txtsrc.split("\n");
	var outlist = [];
	
	for (item in inlist) {
		var linesplit = inlist[item].split("\t");
		if (regiondict[baseyear]) {
			if (linesplit.length > 1) {
				var codevalue = regiondict[baseyear][linesplit[0]];
				if (!codevalue) {
					var ilbangu = linesplit[0];
					for (item2 in regiondict[baseyear]) {
						var terms = item2.split(" ");
						var terms2 = ilbangu.split(" ");
						if (terms[terms.length-1] == terms2[terms2.length-1]) {
							codevalue = regiondict[baseyear][item2];
							outlist.push(codevalue + "\t" + inlist[item]);
						}
					}
					if (!codevalue) {
						outlist.push(codevalue + "\t" + inlist[item]);
					}
				} else {
					outlist.push(codevalue + "\t" + inlist[item]);
				}
			}
		}
	}
	$("#txtdst").val(outlist.join("\n"));
}

$("#txtsrc").on('change keyup paste', updateValue);
$("#txtbaseyear").on('change keyup paste', updateValue);