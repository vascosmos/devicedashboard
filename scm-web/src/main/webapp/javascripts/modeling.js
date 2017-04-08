function updateSelectionList() {
  var rows = $('#cpn-result-table').bootstrapTable('getAllSelections');
  var preselectedCpnCount = $('#selected-cpns ul li.not-searched').size();
  if ((rows.length + preselectedCpnCount) === 0) {
    $('#selected-cpns button').addClass('disabled');
    $('#selected-cpns .h3').hide();
  } else {
    $('#selected-cpns button').removeClass('disabled');
    $('#selected-cpns .h3').show();
    $('#selected-cpns').show();
  }
  var htmlStr = '';
  var cpns = [];
  _.forEach(rows, function(r) {
	  console.log(r);
	  if(cpns.indexOf(r.cpn_name)==-1) {
		    htmlStr += '<li class="list-group-item"><span class="h4">' + r.cpn_name + '</span></li>';
		    cpns.push(r.cpn_name);
	  }
  });
 /* _.forEach(rows, function(r) {
    console.log(r);
    htmlStr += '<li class="list-group-item"><span class="h4">' + r.cpn_name + '</span>';
    htmlStr += '</li>';
  });*/
  $('#selected-cpns ul li:not(.not-searched)').each(function() {
    $(this).remove();
  });
  $('#selected-cpns ul').append(htmlStr);
}

function updatePidFilters() {
  var rows = $('#pid-result-table').bootstrapTable('getAllSelections');
  var preselectedPidCount = $('#selected-pids ul li.not-searched').size();
  if (rows.length + preselectedPidCount === 0) {
    $('#pid-filter-btn,#create-pid-model').addClass('disabled');
    $('#selected-pids .h3').hide();
  } else {
    $('#pid-filter-btn,#create-pid-model').removeClass('disabled');
    $('#selected-pids .h3').show();
    $('#selected-pids').show();
  }
  var htmlStr = '';
  var pids = [];
  _.forEach(rows, function(r) {
    console.log(r);
    if(pids.indexOf(r.pid)==-1) {
	    htmlStr += '<li class="list-group-item"><span class="h4 selected-pid" data-pid-id="' + r.pid_item_id + '">' + r.pid + '</span>';
	    htmlStr += '</li>';
	    pids.push(r.pid);
    }
  });
  $('#selected-pids ul li:not(.not-searched)').each(function() {
	    $(this).remove();
	  });
  $('#selected-pids ul').append(htmlStr);
}


// on change of value of select, change the name of the associated input so that it is serializable
$(".dropdown-select").change(function() {
  $(this).parent().next().children().attr("name", $(this).val());
});


function initComponentResultTable(callback) {

  $('select').select2({
    'width': '120px'
  });

  // Initial Load of table
  var cpnColumnConfig = [{
      field: 'mod',
      title: 'Add To Model',
      checkbox: true
    }, {
      field: 'business_unit',
      title: 'BU',
    }, {
      field: 'pid',
      title: 'PID',
    }, {
      field: 'pid_item_id',
      title: 'PID ID',
      visible: false
    }, {
      field: 'product_family',
      title: 'PF',
    }, {
      field: 'cpn_name',
      title: 'CPN Name',
    }, {
      field: 'comm_mgr',
      title: 'SuCM',
    }, {
      field: 'material_cost',
      title: 'Mat Cost',
    }, {
      field: 'global_demand',
      title: 'Global Demand',
    }, {
      field: 'spend',
      title: 'Spend',
    }, /*{
      field: 'supplier_name',
      title: 'Supplier',
    }, {
      field: 'supplier_split',
      title: 'Splits %',
    },
    {
    field : 'supplier_count',
    title : 'Supplier Count',
  },*/
    {
      field: 'fiscal_period',
      title: 'Fiscal Period',
    }
  ];
  
//Initial Load of table
  var pidColumnConfig = [{
      field: 'mod',
      title: 'Add To Model',
      checkbox: true
    }, {
      field: 'business_unit',
      title: 'BU',
    }, {
      field: 'pid',
      title: 'PID',
    }, {
      field: 'pid_item_id',
      title: 'PID ID',
      visible: false
    }, {
      field: 'product_family',
      title: 'PF',
    }, {
      field: 'material_cost',
      title: 'Mat Cost',
    }, {
      field: 'global_demand',
      title: 'Global Demand',
    }, {
      field: 'spend',
      title: 'Spend',
    },{
      field: 'fiscal_period',
      title: 'Fiscal Period',
    }
  ];

  _.forEach(cpnColumnConfig, function(n) {
    n.align = 'left';
    n.valign = 'left';
    n.sortable = true;
  });
  
  _.forEach(pidColumnConfig, function(n) {
	    n.align = 'left';
	    n.valign = 'left';
	    n.sortable = true;
	  });

  var initialized = false;

  $('#cpn-result-table').bootstrapTable({
    method: 'post',
    cache: false,
    striped: true,
    pagination: true,
    pageSize: 10,
    pageList: [5, 10, 20],
    selectItemName: 'to-be-modeled',
    maintainSelected: true,
    onCheck: function(row) {
      updateSelectionList();
    },
    onUncheck: function(row) {
      updateSelectionList();
    },
    onPostBody: function() {
      if (typeof callback != 'undefined' && initialized === false) {
        callback();
      }
      initialized = true;
    },
    clickToSelect: true,
    columns: cpnColumnConfig
  });

  $('#pid-result-table').bootstrapTable({
    method: 'post',
    cache: false,
    striped: true,
    pagination: true,
    pageSize: 10,
    pageList: [5, 10, 20],
    selectItemName: 'to-be-modeled',
    maintainSelected: true,
    onCheck: function(row) {
      updatePidFilters();
    },
    onUncheck: function(row) {
      updatePidFilters();
    },
    onPostBody: function() {
      if (typeof callback != 'undefined' && initialized === false) {
        callback();
      }
      initialized = true;
    },
    clickToSelect: true,
    columns: pidColumnConfig
  });

  $('#selected-cpns').on('click', 'a', function(evt) {
    // TODO write me
    evt.preventDefault();
    evt.stopPropagation();
  });
  
  $('#selected-pids').on('click', 'a', function(evt) {
	    // TODO write me
	    evt.preventDefault();
	    evt.stopPropagation();
	  });


}

$(function() {

  initComponentResultTable();

  //when the search button is clicked...
  $('#search-filters').submit(function(evt) {
    doSearch(true);
  });

  // Called when filter-by-PIDs button is clicked
  $('#pid-filter-btn').click(function(evt) {
    if ($(this).hasClass('disabled')) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
    doSearch(false);
  });

  // Set searchPids to true if the pid results should be refreshed
  function doSearch(refreshPids) {
    var cpnSearchUrl = '/api/cpnSearch?';
    var pidSearchUrl = '/api/pidSearch?';
    var searchUrlParamCount = 0;

    $('.multi-field').each(function(i, element) {
      var fieldType = $('select', this).select2('val');
      var fieldVal = $('input', this).val();
      if (i > 0) {
    	  cpnSearchUrl += '&';
    	  pidSearchUrl += '&';
      }
      cpnSearchUrl += fieldType + '=' + fieldVal;
      pidSearchUrl += fieldType + '=' + fieldVal;
      searchUrlParamCount++;
    });
    if (refreshPids) {
      
      $('#pid-result-table').bootstrapTable('refresh', {
        url: pidSearchUrl
      });
      $('#pid-results').show(500);
      $('#selected-pids').show();
    } else {
      // Add all selected PIDs to the search
      $('#selected-pids ul .selected-pid').each(function() {
        if (searchUrlParamCount > 0) {
        	cpnSearchUrl += '&';
        }
        cpnSearchUrl += 'pidFilter=' + $(this).html();
      });
    }
    $('#cpn-result-table').bootstrapTable('refresh', {
      url: cpnSearchUrl
    });
    $('#cpn-results').show(500);
    $('#selected-cpns').show();
  }

  $('#create-pid-model').click(function(evt) {

    if ($(this).hasClass('disabled')) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
    var _this = $(this);
    $('#main-alert').hide();
    _this.append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
    var pids = [];
    $('#selected-pids li span.selected-pid').each(function(i) {
      pids.push($(this).data('pid-id'));
    });
    console.log('pids: ', pids);
    $.ajax({
      type: 'POST',
      url: 'api/createPidModel',
      data: {
        'pids': pids.toString()
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

  $('#selected-cpns button').click(function(evt) {

    if ($(this).hasClass('disabled')) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }
    var _this = $(this);
    $('#main-alert').hide();
    _this.append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
    var components = [];
    $('#selected-cpns li span').each(function(i) {
      components.push($(this).html());
    });
    $.ajax({
      type: 'POST',
      url: 'api/createModel',
      data: {
        'cpn': components.toString()
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

  if ($('#selected-cpns li').size() === 0) {
    $('#selected-cpns button').addClass('disabled');
  }

  // Restrict there to be a max/min possible number of input fields for search
  var INPUT_FIELDS_MAX = 5;
  var INPUT_FIELDS_MINIMUM = 1;


  $('.multi-field-wrapper').each(function() {
    var $wrapper = $('.multi-fields', this);
    $(".add-field", $(this)).click(function(e) {

      if ($('.multi-field', $wrapper).length < INPUT_FIELDS_MAX) {

        $(".remove-field").removeClass("disabled");

        // Destroy select plugin dom elements
        $('.multi-field select').each(function() {
          $(this).select2('destroy');
        });
        $('.multi-field:first-child', $wrapper).clone(true).appendTo($wrapper).find('input').val('').focus();
        // Rebuild all select boxes
        $('.multi-field select').each(function() {
          $(this).select2({
            'width': '120px'
          });
        });

      }
      if ($('.multi-field', $wrapper).length === INPUT_FIELDS_MAX) {
        $(".add-field").addClass("disabled");
      }
    });
    $('.multi-field .remove-field', $wrapper).click(function() {
      if ($('.multi-field', $wrapper).length > INPUT_FIELDS_MINIMUM) {
        $(this).closest('.multi-field').remove();
      }
      if ($('.multi-field', $wrapper).length < (INPUT_FIELDS_MINIMUM + 1)) {
        $(".remove-field").addClass("disabled");
      }
      if ($('.multi-field', $wrapper).length < INPUT_FIELDS_MAX) {
        //remove disabled class from add-field buttons
        $(".add-field").removeClass("disabled");
      }
    });
  });
  
  updateSelectionList();
  updatePidFilters();

});
