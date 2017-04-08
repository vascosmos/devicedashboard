// Wait for DOM to be loaded before executing JS code
$(function() {
	
	function updateSelectionList() {
		  var rows = $('#pid-result-table').bootstrapTable('getAllSelections');
		  if (rows.length === 0) {
		    $('#selected-pids button').addClass('disabled');
		  } else {
		    $('#selected-pids button').removeClass('disabled');
		  }
		  var htmlStr = '';
		  var pids = [];
		  _.forEach(rows, function(r) {
			  console.log("selected : " + r.pid);
			  if(pids.indexOf(r.pid)==-1) {
				    htmlStr += '<li class="list-group-item" value="' + r.pid_item_id + '">' + r.pid + '</li>';
				    pids.push(r.pid);
			  }
		  });
		  $('#selected-pids ul').html(htmlStr);
		}
	
	
	 $('#create-model-form').submit(function(evt) {
		    if ($('button', this).hasClass('disabled')) {
		      evt.preventDefault();
		      evt.stopPropagation();
		      return;
		    }
		    var reqStr = '';
		    $('#selected-pids li').each(function(i) {
		      if (i === 0) {
		        reqStr += '?pid=' + $(this).html() +'|'+$(this).val();
		      } else {
		        reqStr += '&pid=' + $(this).html()+'|'+$(this).val();
		      }
		    });
		    window.location.href = 'modeling' + reqStr;
		    evt.preventDefault();
		  });

  $('#top-pids-quarter').change(function(evt) {
    var selectedQuarter = $('#top-pids-quarter').select2('val');
    var paramType;
    if ($('#top-panels').find('.selected-panel').size() > 0) {
      paramType = 'bu';
    } else {
      paramType = 'pf';
    }
    $('#pid-result-table').bootstrapTable('refresh', {
      url: '/api/dashboard/top20pids?' + paramType + '=' + $('#selected-bu-or-pf').html() + '&quarter=' + selectedQuarter
    });
  });

  // Initial load of panels
  $('.bu-or-pf-panel').each(function(i, el) {
    var chartData = getChartDataFromPanel(el);
    changeChart($(this).data('default-chart-type'), '#chart-' + $(this).data('chart-id'), chartData);
  });

  // Initial load of table
  var pidColumnConfig = [
	{
		field : 'mod',
		title : 'Add To Model',
		checkbox : true
	},
   {
    field: 'pid',
    title: 'PID',
    align: 'left',
    valign: 'left',
    sortable: true
  }, {
      field: 'pid_item_id',
      title: 'PID ID',
      visible: false
    }, {
    field: 'glo_cost',
    title: 'Glo Std Cost',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'demand',
    title: 'Volume',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'spend',
    title: 'Spend',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'savings',
    title: 'Savings',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'list_price',
    title: 'List Price',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'df_fee',
    title: 'DF Fee',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'asp',
    title: 'ASP',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'margins',
    title: 'Margin',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, {
    field: 'revenue',
    title: 'Revenue ',
    align: 'left',
    valign: 'left',
    sortable: true,
  }, ];


  _.forEach(pidColumnConfig, function(n) {
    n.align = 'left';
    n.valign = 'left';
    n.sortable = true;
  });

  $('#pid-result-table').bootstrapTable({
    method: 'get',
    cache: false,
    striped: true,
    pagination: true,
    pageSize: 5,
    pageList: [5, 10, 20],
    clickToSelect: true,
    columns: pidColumnConfig,
    onCheck : function(row) {
		updateSelectionList();
	},
	onUncheck : function(row) {
		updateSelectionList();
	}
  });

  var selectedChartElement;

  $('.panel-row').on('click', 'rect.c3-event-rect', function(evt) {
    // Update the dropdown in the PID table to reflect the selected quarter
    var selectedQuarter = $('#top-pids-quarter option').eq($(this).context.__data__.x).val();
    $('#top-pids-quarter').select2('val', selectedQuarter);
    // Style the selected C3 element
    if (typeof selectedChartElement != 'undefined') {
      selectedChartElement.attr('stroke-width', 0);
    }
    $(this).attr('stroke-width', 2);
    $(this).attr('stroke', '#3388aa');
    $(this).attr('opacity', 0.5);
    selectedChartElement = $(this);
  });

  $('.panel-row').on('click', '.bu-or-pf-panel', function(evt) {
    if ($(this).hasClass('selected-panel')) {
      return;
    }
    var panelName = $('.chart-label', $(this)).html();
    // If this is a BU panel, change the PF panels to match the selected BU
    if($(this).parent().parent().attr('id') === 'top-panels'){
	  changePanelsToQuarter($('#pf-panels'), $('#top-chart-quarter-selector').select2('val'), panelName);
    }
    $('#selected-bu-or-pf').html(panelName);
    $('.selected-panel').removeClass('selected-panel');
    $(this).addClass('selected-panel');
    // Select the previous quarter automatically
    console.log($('rect', $(this)));
    $('rect', $(this)).eq(9).click();
  });


  // Parse the quarters for configuring the aggregate graph
  var graphCategories = [];
  $('#top-pids-quarter option').each(function() {
    graphCategories.push($(this).html());
  });

  var formatValue = d3.format("s");
  c3.generate({

    bindto: '#chart-1',
    padding: {
      right: 40,
      left: 50
    },
    data: {
      type: 'bar',
      types: {
        Savings: 'spline'
      },
      url: 'api/dashboard/bu/overallvascosmos',
      mimeType: 'json',
      onclick: function(d, element) {
        console.log(url);
        //changeTable(url);
      },
      axes: {
        'Savings': 'y2'

      },
      colors: {
        Savings: '#FF9900',
        Spend: '#26ADE4',
        Margin: '#00ff00'
      }
    },



    zoom: {
      enabled: true,
      rescale: true
    },

    axis: {
      x: {
        type: 'category',
        tick: {
          multiline: false
        },
        categories: graphCategories
      },
      y: {
        show: true,
        label: 'Scale  for Spend and Margin (%)',
        position: 'inner-middle',

        tick: {
          //format: d3.format("s"),
          format: function(d) {
            return formatValue(d).replace('G', 'B');
          },

        },

      },
      y2: {
        show: true,
        label: 'Scale for  Savings',
        position: 'inner-middle',
        tick: {

          //  format: d3.format("s"),
          format: function(d) {
            return formatValue(d).replace('G', 'B');
          },

        },
        /* max: 10000000000,
         min: 100000*/
      }
    }
  });

  selectFirstChart();

});
