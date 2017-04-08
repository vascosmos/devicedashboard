// Wait for DOM to be loaded before executing JS code
$(function() {
	
	// Initialize dropdowns
	$('select').select2({
		'width' : '120px'
	});

    // Fetch impact data
    $.ajax({
        type: "GET",
        url: '/api/impact/impactSummary',
        success: function(data) {
            _.merge(data.numbersImpacted, data.spend);
            _.merge(data.numbersImpacted, data.amountSavings);
            $('#tableDataImpact').bootstrapTable('load', data.numbersImpacted);
        }
    });

    // Once the tab is shown, show the correct C3 chart
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var chartno = $(e.target).parent().index() + 1;
        if (chartno === 1) {
            getImpactGraph($(".cpn-component-name").html(), 'CPN', '#cpn-impact-chart');
        } else if (chartno === 2) {
            getImpactGraph($(".cpn-component-name").html(), 'COMMODITY', '#cg-impact-chart');
        } else if (chartno === 3) {
            getPidImpactGraph($(".cpn-component-name").html(), 'PID', '#pid-impact-chart');
        } else if (chartno === 4) {
            getBUPFImpactGraph($(".cpn-component-name").html(), 'PF', '#pf-impact-chart');
        } else if (chartno === 5) {
            getBUPFImpactGraph($(".cpn-component-name").html(), 'BU', '#bu-impact-chart');
        } else {
            console.log('Unknown chart type');
        }
        // Trigger a refresh of the impact table for the selected impact type
        $('.quarter-selector', $('.impact-pane').eq(chartno - 1)).change();
    });

    // Click handler for CPN-drilldown
    $(".cpn-component-name").click(function() {
        getImpactGraph($(this).html(), 'CPN', '#cpn-impact-chart');
    });

    // Bar and line chart click handlers
    $('.impact-pane .fa-bar-chart').click(function(evt) {
        changeChart('bar', '#' + getImpactType(this) + '-impact-chart');
    });
    $('.impact-pane .fa-line-chart').click(function(evt) {
        changeChart('line', '#' + getImpactType(this) + '-impact-chart');
    });

    // Trigger a click event on the first tab
    $('#graph-tabs li:eq(0) a').tab('show');

    // Impact Summary table configuration
    $('#tableDataImpact').bootstrapTable({
        method: 'get',
        cache: false,
        columns: [{
                field: 'cdata',
                title: 'Data',
                align: 'left',
                halign: 'center',
                valign: 'center',
            }, {
                field: 'count',
                title: 'Numbers Impacted',
                align: 'left',
                halign: 'center',
                valign: 'center',

            }, {
                field: 'amountSavings',
                title: 'Amount Savings ($)',
                align: 'left',
                halign: 'left',
                valign: 'left',
            }, {
                field: 'amountSpend',
                title: 'Amount Spend($)',
                align: 'left',
                halign: 'left',
                valign: 'left',
            },

        ]
    });

    function changeChart(chartType, bindto) {

        // Read stored data from the chart's DOM element
        var chartData = $(bindto).data('chart-data');
        var categoriesData = $(bindto).data('chart-quarters');

        var chart = c3.generate({
            bindto: bindto,
            padding: {
                right: 20,
                left: 50
            },
            data: {
                type: chartType,
                columns: chartData,
                onclick: function(d, element) {
                },
                regions: {
                    //'data1': [{'start':1, 'end':2, 'style':'dashed'},{'start':3}], // currently 'dashed' style only
                	'Material Cost': [{'style':'dashed'}]
                }
            },
            axis: {
                x: {
                    type: 'category',
                    tick: {
                        multiline: false
                    },
                    categories: categoriesData
                },
                y: {
                    show: true,
                    //label: 'Savings in Thousands',
                    position: 'inner-middle',
                    tick: {
                        format: d3.format("s"),
                    }
                }
            }

        });
    }

    function getImpactURLs(type) {
        if (type === 'CPN') {
            return '/api/impact/cpnImpactGraph?';
        } else if (type === 'PID') {
            return '/api/impact/pidImpactGraph?compName=';
        } else if (type === 'COMMODITY') {
            return '/api/impact/cgImpactGraph';
        } else if (type === 'BU') {
            return '/api/impact/buImpactGraph';
        } else if (type === 'PF') {
            return '/api/impact/pfImpactGraph';
        } else {
            return '/api/impact/cpnImpactGraph?compName=';
        }
    }

    function checkAndAddLegend(chartData, data, name) {
        if (data) {
            data.splice(0, 0, name);
            chartData.push(data);
        }
    }

    function getBUPFImpactGraph(compName, type, chartId) {
        $.ajax({
            type: "GET",
            url: getImpactURLs(type),
            data: {},
            success: function(data) {
                console.log('data for ' + chartId, data);
                var chartData = [];

                checkAndAddLegend(chartData, data.quarterlyData.marginData, 'Margin');
                checkAndAddLegend(chartData, data.quarterlyData.cogsData, 'Total BU/PF COGS');
                checkAndAddLegend(chartData, data.quarterlyData.costSavingsData, 'Q/Q Cost Savings');
                checkAndAddLegend(chartData, data.quarterlyData.totalSpendData, 'Total Spend');
                checkAndAddLegend(chartData, data.quarterlyData.qoqSpendSavings, 'Q/Q Spend Savings');

                $(chartId).data('chart-data', chartData);
                $(chartId).data('chart-quarters', data.data.quarters);
                changeChart('line', chartId);

            }
        });
    }

    function getImpactGraph(compName, type, chartId) {
        $.ajax({
            type: "GET",
            url: getImpactURLs(type),
            data: {
                'compName': compName
            },
            success: function(data) {
                console.log('data for ' + chartId, data);
                var chartData = [];

                checkAndAddLegend(chartData, data.quarterlyData.marginData, 'Material Cost');
                checkAndAddLegend(chartData, data.quarterlyData.modeledMarginData, 'Modeled Material Cost');
                checkAndAddLegend(chartData, data.quarterlyData.spendData, 'Material Spend');
                checkAndAddLegend(chartData, data.quarterlyData.modeledSpendData, 'Modeled Material Spend');
                checkAndAddLegend(chartData, data.quarterlyData.savingData, 'Material Savings');
                checkAndAddLegend(chartData, data.quarterlyData.modeledSavingData, 'Modeled Material Savings');
                checkAndAddLegend(chartData, data.quarterlyData.spendSavingData, 'Spend Savings');
                checkAndAddLegend(chartData, data.quarterlyData.modeledSpendSavingsData, 'Modeled Spend Savings');

                $(chartId).data('chart-data', chartData);
                $(chartId).data('chart-quarters', data.data.quarters);
                changeChart('line', chartId);

            }
        });
    }

    function getPidImpactGraph(compName, type, chartId) {
        $.ajax({
            type: "GET",
            url: '/api/impact/pidImpactGraph?compName=' + compName,
            success: function(data) {
                console.log(data);
                var chartData = [];

                checkAndAddLegend(chartData, data.quarterlyData.materialCost, 'Material Cost');
                checkAndAddLegend(chartData, data.quarterlyData.modeledMatCost, 'Modeled Material Cost');
                checkAndAddLegend(chartData, data.quarterlyData.spend, 'Spend');
                checkAndAddLegend(chartData, data.quarterlyData.modeledSpend, 'Modeled Spend');
                checkAndAddLegend(chartData, data.quarterlyData.margin, 'Margin');
                checkAndAddLegend(chartData, data.quarterlyData.modeledMargin, 'Modeled Margin');

                $(chartId).data('chart-data', chartData);
                $(chartId).data('chart-quarters', data.data.quarters);
                changeChart('line', chartId);

            }
        });
    }

    // Gets the impact type for the specified DOM element. Most elements are under some category of impact (pid, cpn, etc.)
    function getImpactType(childElement) {
        console.log('impact type: ' + $(childElement).closest('.impact-pane').data('impact-type'));
        return $(childElement).closest('.impact-pane').data('impact-type');
    }

    $('.impact-pane .quarter-selector').change(function(evt) {
        var selectedQuarter = $(this).select2('val');
        console.log('evt' , evt);
        var impactType = getImpactType(this);

        $.ajax({
            type: "GET",
            url: '/api/impact/' + impactType + 'Impact?qtr=' + selectedQuarter,
            success: function(data) {
                var renderedHtml = renderPartial(impactType + '-impact-table', {
                    'componentData': data
                });
                $('#' + impactType + '-impact-table').html(renderedHtml);
            }
        });
    });

    var currentdate = new Date();
    var datetime = "" + currentdate.getFullYear() + (currentdate.getMonth()+1) + currentdate.getDate() + "_" + currentdate.getHours().toString() + currentdate.getMinutes().toString() + currentdate.getSeconds().toString();

    $("#final_model_name").text(datetime);
    
    var modelName = $('#finalModelName').text();
    
    $('#unique-model-number').on('input', function() {
    	$(this).val(function(_, v){
    	      return v.replace(/\s+/g, '');
    	 });
    	
    	var finalModelName = "" + $('#unique-model-number').val()  + "_" + datetime;
    	$("#final_model_name").text(finalModelName);
    });
    
    
    $('#save-model-btn').click(function(evt) {
        var _this = $(this);
        modelName = $('#final_model_name').text();
        modelNotes = $('#unique-model-notes').val();
        _this.append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
        $.ajax({
            type: "POST",
            url: 'api/saveModel',
            data: {
                'name': modelName,
                'notes': modelNotes
            },
            success: function(data) {
                unpackErrorAndMsg(data);
            },
            complete: function(data) {
                $('span.ajax-spinner', _this).remove();
            }
        });
        evt.preventDefault();
    });

});
