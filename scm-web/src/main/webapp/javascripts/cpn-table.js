	
function initComponentResultTable(callback){

	$('select').select2({'width':'120px'});

	// Initial Load of table
	var cpnColumnConfig = [ {
		field : 'mod',
		title : 'Add To Model',
		checkbox : true
	}, {
		field : 'cpn_name',
		title : 'CPN Name',
	}, {
		field : 'comm_mgr',
		title : 'SuCM',
	}, {
		field : 'material_cost',
		title : 'Mat Cost($)',
	}, {
		field : 'global_demand',
		title : 'Global Demand',
	}, {
		field : 'spend',
		title : 'Spend',
	}, /*{
		field : 'supplier_name',
		title : 'Supplier',
	}, {
		field : 'supplier_split',
		title : 'Splits',
	},
	{
		field : 'supplier_count',
		title : 'Supplier Count',
	},*/
	{
		field : 'fiscal_period',
		title : 'Fiscal Period',
	} ];

	_.forEach(cpnColumnConfig, function(n) {
		n.align = 'left';
		n.valign = 'left';
		n.sortable = true;
	});

	var initialized = false;
	
	$('#cpn-result-table').bootstrapTable({
		method : 'post',
		cache : false,
		striped : true,
		pagination : true,
		pageSize : 10,
		pageList : [ 5, 10, 20 ],
		selectItemName : 'to-be-modeled',
		maintainSelected : true,
		onCheck : function(row) {
			updateSelectionList();
		},
		onUncheck : function(row) {
			updateSelectionList();
		},
		onPostBody : function(){
			if(typeof callback != 'undefined' && initialized === false){
				callback();
			}
			initialized = true;
		},
		clickToSelect : false,
		columns : cpnColumnConfig
	});
	
	$('#selected-cpns').on('click', 'a', function(evt){
		// TODO write me
		evt.preventDefault();
		evt.stopPropagation();
	});
	
	
	
}