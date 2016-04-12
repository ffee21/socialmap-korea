function unique(redundantList) {
	var _uniqueList = [];
	$.each(redundantList, function(i, el) {
		if($.inArray(el, _uniqueList) === -1) _uniqueList.push(el);
	});
	
	return _uniqueList;
}


d3.json("/data.json", function(error, datadata) {
	if (error) {
		return console.error(error);
	} else {
		var datajson_data_code_list = [];
		var datajson_adm_code_list = [];
		
		datajson_adm_code_list = unique(datadata.map(function(d) { return d.adm_code; }));
		datajson_data_code_list = unique(datadata.map(function(d) { return d.data_code; }));
		
		d3.csv("/static/kostat_sigungu10-14.csv", function(error, data) {
			if (error) {
				return console.error(error);
			} else{
				var adm_region_list = data;
				var adm_code_list = data.map(function(d) {return d.code;});
				var adm_region_dict = {};
				
				for (item in adm_code_list) {
					adm_region_dict[adm_code_list[item]] = adm_region_list[item].sigungu;
				}
				adm_code_list = unique(adm_code_list.concat(datajson_adm_code_list)).sort();
				
				var table = d3.select("#datatable").append("table").attr("id", "datatablet");
				var trs = table.selectAll("tr").data(adm_code_list).enter().append("tr");
				trs.attr("id", function (d) {return d;});
				trs.append("td").text(function (d) {return d;});
				trs.append("td").text(function (d) {if (adm_region_dict[d]) return adm_region_dict[d];});
				for (item in datajson_data_code_list) {
					trs.append("td").attr("id", function (d) { return "cell_" + d + "_" + datajson_data_code_list[item]; }).style("background", "red");
				}
				
				for (item in datadata) {
					var theitem = datadata[item];
					var cell = d3.select("#cell_" + theitem.adm_code + "_" + theitem.data_code);
					cell.text(theitem.value);
					cell.style("background", "blue");
				}
			}
		});
	}
});