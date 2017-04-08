function updateSelectionList() {
  var rows = $('#cpn-result-table').bootstrapTable('getAllSelections');
  if (rows.length === 0) {
    $('#selected-cpns button').addClass('disabled');
  } else {
    $('#selected-cpns button').removeClass('disabled');
  }
  var htmlStr = '';
  var cpns = [];
  _.forEach(rows, function(r) {
	  if(cpns.indexOf(r.cpn_name)==-1) {
		    htmlStr += '<li class="list-group-item">' + r.cpn_name + '</li>';
		    cpns.push(r.cpn_name);
	  }
  });
  $('#selected-cpns ul').html(htmlStr);
}

// Wait for DOM to be loaded before executing JS code
$(function() {

  $('.panel-row').on('click', 'rect.c3-event-rect', function(evt) {
    console.log($(this));
    // Update the dropdown in the PID table to reflect the selected quarter
    var selectedQuarter = $('#top-pids-quarter option').eq($(this).context.__data__.x).val();
    $('#top-pids-quarter').select2('val', selectedQuarter);
    // TODO Change the supplier chart's URL to have the new API params


    // Style the selected C3 element
    if (typeof selectedChartElement != 'undefined') {
      selectedChartElement.attr('stroke-width', 0);
    }
    $(this).attr('stroke-width', 2);
    $(this).attr('stroke', '#3388aa');
    $(this).attr('opacity', 0.5);
    selectedChartElement = $(this);
    refreshSupplierChart();
  });

  $('.panel-row').on('click', '.bu-or-pf-panel', function(evt) {
    if ($(this).hasClass('selected-panel')) {
      return;
    }
    $('#selected-bu-or-pf').html('for ' + $('.chart-label', $(this)).html());
    $('.selected-panel').removeClass('selected-panel');
    $(this).addClass('selected-panel');
    // Select the previous quarter automatically
    console.log($('rect', $(this)));
    $('rect', $(this)).eq(9).click();
  });

  // Initial load of panels
  $('.bu-or-pf-panel').each(function(i, el) {
    var chartData = getChartDataFromPanel(el);
    changeChart($(this).data('default-chart-type'), '#chart-' + $(this).data('chart-id'), chartData);
  });

  var selectedChartElement;

  $('#create-model-form').submit(function(evt) {
    if ($('button', this).hasClass('disabled')) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
    var reqStr = '';
    $('#selected-cpns li').each(function(i) {
      if (i === 0) {
        reqStr += '?cpn=' + $(this).html();
      } else {
        reqStr += '&cpn=' + $(this).html();
      }
    });
    window.location.href = 'modeling' + reqStr;
    evt.preventDefault();
  });

  // Parse the quarters for configuring the aggregate graph
  var graphCategories = [];
  $('#top-pids-quarter option').each(function() {
    graphCategories.push($(this).html());
  });


  c3.generate({
    bindto: '#chart-1',
    padding: {
      right: 20,
      left: 50
    },
    data: {
      type: 'line',
      url: 'api/dashboard/gsm/overallvascosmos',
      mimeType: 'json',
      onclick: function(d, element) {
        console.log(url);
        //changeTable(url);
      },
      colors: {
          Savings: '#FF9900',
          Spend: '#26ADE4',
          //Margin: '#00ff00'
        }
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
        label: 'Scale in Millions',
        position: 'inner-middle',
        tick: {
          format: d3.format("s"),

        }
      }
    }
  });
  var formatValue = d3.format("s");
  c3.generate({
    bindto: '#chart-2',
    padding: {
      right: 20,
      left: 50
    },
    data: {
      type: 'bar',
      url: 'api/dashboard/cpnAging',
      mimeType: 'json',
      onclick: function(d, element) {
        console.log(url);
        //changeTable(url);
      },
      colors: {
         // Savings: '#FF9900',
          Spend: '#26ADE4',
          //Margin: '#00ff00'
        }
    },

    axis: {
      x: {
        type: 'category',
        tick: {
          multiline: false
        },
        categories: ['0-3 Yrs ', '4-7 Yrs ', '7+ Yrs']
      },
      y: {
        show: true,
        label: 'Scale in Trillions',
        position: 'inner-middle',
        tick: {
          //format: d3.format("s"),
          format: function(d) {
            return formatValue(d).replace('G', 'B');
          },
        }
      }
    }
  });


  function refreshSupplierChart() {
    var selectedQuarter = $('#top-pids-quarter').select2('val');
    var gsmSubGroup = encodeURIComponent($('.bu-or-pf-panel.selected-panel').data('chart-name'));

    var url = 'http://localhost:8080/api/dashboard/topsuppliers?gsmsubgroup=' + gsmSubGroup + '&quarter=' + selectedQuarter;
    CallURL();

    function CallURL() {
      $.ajax({

        url: url,
        type: "GET",
        dataType: "json",
        async: false,
        success: function(msg) {
          console.log(msg);
        },
        error: function() {
          console.log("no message");
        }

      });

    }
    var formatValue = d3.format("s");
    c3.generate({
      bindto: '#supplierchart',
      padding: {
        right: 20,
        left: 50
      },
      data: {
        type: 'bar',
        url: 'api/dashboard/topsuppliers?gsmsubgroup=' + gsmSubGroup + '&quarter=' + selectedQuarter,
        mimeType: 'json',
        keys: {
          x: 'supplierName',
          value: ['Savings', 'Spend']
        },

        axes: {
          'Savings': 'y2'
        },
        colors: {
            Savings: '#FF9900',
            Spend: '#26ADE4',
            //Margin: '#00ff00'
          }

      },

      axis: {
        x: {
          type: 'category'
        },
        y: {
          show: true,
          label: 'Spend M for Millions and B for Billions',
          position: 'inner-middle',
          tick: {
            //format: d3.format("s"),
            format: function(d) {
              return formatValue(d).replace('G', 'B');
            },
          }
        },
        y2: {
          show: true,
          label: 'Savings in Thousands',
          position: 'inner-middle',
          tick: {

            format: d3.format("s"),

          }
        }
      }
    });
  }

  $('#top-pids-quarter').change(function(evt) {
    refreshCpnTableData();
  });

  function refreshCpnTableData() {
    var selectedQuarter = $('#top-pids-quarter').select2('val');
    var subGroup = encodeURIComponent($('.selected-panel .chart-label').html());
    $('#cpn-result-table').bootstrapTable('refresh', {
      url: 'api/dashboard/top20cpns?gsmsubgroup=' + subGroup + '&quarter=' + selectedQuarter
    });
  }

  initComponentResultTable(function() {
    $('#cpn-results').show();
    // Load an initial dataset for CPN table
    selectFirstChart();
    // TODO Find a way around using setTimeout. It seems the onPostBody callback of bootstrapTable is called too early
    setTimeout(function() {
      refreshCpnTableData();
    }, 1000);
  });

  selectFirstChart();


});
