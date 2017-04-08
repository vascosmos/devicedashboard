// Used on both the GSM Dashboard and BU Dashboard pages for swapping sets of chart panels to show new data.
function changePanelsToQuarter(panelContainer, quarter, bu) {
	var requestData = {
			'costType' : quarter
	};
	if (typeof bu != 'undefined'){
		requestData['bu'] = bu;
	}
	$.ajax({
		type : "POST",
		url : 'api/dashboard/' + panelContainer.data('api'),
		data : requestData,
		success : function(data) {
			var selectedChartBeingDeleted = false;
			if ($('.selected-panel', panelContainer).size() > 0) {
				selectedChartBeingDeleted = true;
			}
			panelContainer.html('');
			_.forEach(data, function(buPanel) {
				var renderedHtml = renderPartial('chart-panel', buPanel);
				panelContainer.append(renderedHtml);
				var newPanel = $('.bu-or-pf-panel:last', panelContainer);
				changeChart(newPanel.data('default-chart-type'), '#chart-' + newPanel.data('chart-id'), getChartDataFromPanel(newPanel));
				$('[data-toggle="tooltip"]').tooltip();
			});
			// If the selected chart was deleted, select one of the newly swapped in charts
			if (selectedChartBeingDeleted === true) {
				selectFirstChart();
			}

		},
		complete : function() {
			// $('#login-form button span.ajax-spinner').remove();
		}
	});
}

function changeChart(chartType, bindto, chartData) {

	var graphCategories = [];
	$('.quarter-selector:first option').each(function() {
		graphCategories.push($(this).html());
	});

	var formatValue=d3.format("s");
	var chart = c3.generate({
		bindto : bindto,
		padding : {
			right : 40,
			left : 50
		},
		data : {
		    type : chartType,
			//type: 'bar',
	        types: {
		          Savings: 'spline',
		          'Mat Savings':'spline'
		        },
			columns : chartData,
			onclick : function(d, element) {
				// console.log(d);
				// console.log(element);
			},
			axes: {
		         'Savings': 'y2',
		         'Mat Savings':'y2'
		       	       
		        },
		        colors: {
		            Savings: '#FF9900',
		            Spend: '#26ADE4',
		            Margin: '#00ff00'
		        },
		        groups: [
		                 ['Spend', 'Margin']
		             ],
		},
		axis : {
			x : {
				type : 'category',
				categories : graphCategories
			},
			y : {
				show:true,
				label: 'Scale for Spend and margin (%)',
	            position: 'outer-left',
	            tick: {
	                //format: d3.format("s"),
	            	format:function(d) { return formatValue(d).replace('G', 'B'); },
	                
	            }
	        },
	        y2: {
	            show: true,
	            label: 'Scale for Savings',
	            position: 'inner-middle',
	            tick: {
	            	
	              //  format: d3.format("s"),
	            	format:function(d) { return formatValue(d).replace('G', 'B'); },
	               
	        },
	       /* max: 10000000000,
	        min: 100000*/
		}
		}
	});
}

function getChartDataFromPanel(panel) {
	var cData = [];
	$('.data-set', panel).each(function(j, setElement) {
		var dataSet = [];
		dataSet.push($('.set-name', setElement).html());
		$('.data-point', setElement).each(function(k, dataElement) {
			dataSet.push(parseFloat($(dataElement).html()));
		});
		cData.push(dataSet);
	});
	return cData;
}

function selectFirstChart() {
	$('.panel-row .bu-or-pf-panel:first').click();
}

$(function() {
	
	// Initialize select2 elements
	$('select').select2({'width':'120px'});
	
	// Select the present quarter on all quarter selects
	$('.quarter-selector').each(function(){
		$(this).select2('val', $('.quarter-selector:eq(0) option:eq(3)').val());
	});
	
	$('#top-chart-quarter-selector').change(function(evt) {
	    var selectedQuarter = $(this).select2('val');
	    changePanelsToQuarter($('#top-panels'), selectedQuarter);
	});
	
	$('.panel-row').on('click', '.bar-chart-btn', function(){
		changeChart('bar', '#' + $('.chart-bind-container', $(this).parent().parent()).attr('id'), getChartDataFromPanel($(this).parent().parent()));	
	});
	
	$('.panel-row').on('click', '.line-chart-btn', function(){
		changeChart('line', '#' + $('.chart-bind-container', $(this).parent().parent()).attr('id'), getChartDataFromPanel($(this).parent().parent()));
	});
	
	$('.panel-row').on('click', '.expand-chart-btn', function(){
		var chartId = $(this).parent().parent().data('chart-id');
		$('#zoomed-chart').html($(this).parent().parent().html());
		// Do some manipulation of the copied HTML, so that it makes sense for our modal view
		$('#zoomed-chart i.fa-expand').hide();
		$('#myModalLabel').html('Zoomed View: ' + $('#zoomed-chart .chart-label').html());
		$('#zoomed-chart .chart-label').hide();
		// Set the ID of the copied container to something new, to avoid duplicate IDs
		var newChartId = 'zoomed-' + chartId;
		$('#zoomed-chart .chart-bind-container').attr('id', newChartId);
		
		$('#myModal').on('shown.bs.modal', function (e) {
			changeChart('line', '#' + newChartId, getChartDataFromPanel($(this).parent().parent()));
		});
		
		$('.tooltip').hide();
	});
	
	// Handle toggling between standard (top 3) chart mode, and custom chart mode
	$('input[name="chartMode"]').change(function(){
		if($(this).val() === 'standard'){
			// Re-fetch the top 3 commodity groups
			var selectedQuarter = $('#top-chart-quarter-selector').select2('val');
			changePanelsToQuarter($('#top-panels'), selectedQuarter);
			$('.chart-top-3').show();
		}else{
			// Show input for accepting a new chart to be fetched (custom panels)
			$('.bu-or-pf-panel .chart-label, .chart-top-3').hide();
			$('.bu-or-pf-panel .chart-change-name').show();
		}
		
	});
	
	// Display the save button when the user begins typing a different commodity group name
	$('.panel-row').on('input', '.chart-change-name', function(evt){
		var panel = $(this).parent().parent().parent();
		$('.chart-change-btn', panel).show();
	});
	
	// Handle swapping to a different commodity group
	$('.panel-row').on('click', '.chart-change-btn', function(evt){
		if($(this).hasClass('disabled')){
			evt.preventDefault();
			return;
		}
		var panel = $(this).parent().parent().parent();
		$('.chart-change-btn i', panel).removeClass('fa-save');
		$('.chart-change-btn i', panel).addClass('fa-spinner fa-spin');
		$(this).addClass('disabled');
		$.ajax({
			type : "POST",
			url : 'api/' + $('#top-panels').data('swap-api'),
			data : {
				'name' : $('input.chart-change-name', panel).val()
			},
			success : function(data) {
			},
			complete : function(data) {
				$('.chart-change-btn i', panel).removeClass('fa-spinner fa-spin');
				$('.chart-change-btn i', panel).addClass('fa-save');
				var renderedHtml = renderPartial('chart-panel', JSON.parse(data.responseText));
				var parent = panel.parent();
				var index = panel.index();
				panel.replaceWith(renderedHtml);
				var newPanel = parent.children().eq(index).children().eq(0);
				changeChart(newPanel.data('default-chart-type'), '#chart-' + newPanel.data('chart-id'), getChartDataFromPanel(newPanel));
				$('.chart-label', newPanel).hide();
				$('.chart-change-name', newPanel).show();
				$('[data-toggle="tooltip"]').tooltip();
			}
		});
		evt.preventDefault();
	});
	
});
