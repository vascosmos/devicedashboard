/*originally, update and clicked called each other because click handled the hiding 
 * and update handled the drawing of the nodes.
 * Now, update calls the method click, which in turn calls the methods update and rememberAndOfferEdit.
 * rememberAndOfferEdit calls buildGraph. BuildGraph calls update.
 * So there are two paths:
 * one where editing does not occur:
 * (buildGraph -> update -> click -> update -> ...etc)
 * and the other where editing does occur
 * (buildGraph -> update -> click-> rememberAndOfferEdit -> buildGraph -> update -> ...etc)
 * buildGraph gets the data, and can open up to the most recently affected node
 * update appends the data to the svg and does the painting
 * click is the in-app controller of the open-and-shut logic
 * rememberAndOfferEdit builds the buttons and sets the new data, which is then called by buildGraph
 */
// Here we set the variables
var margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
  },
  width = 1960 - margin.right - margin.left,
  height = 1200 - margin.top - margin.bottom;

var i = 0,
  duration = 750,
  root;
//this sets up the d3 tree structure
var tree = d3.layout.tree();
// Set the node size so that nodes are spaced out appropriately. The first parameter is used for height in this case.
tree.nodeSize([50, 50]);
//we use diagonal for the connecting links between the nodes
var diagonal = d3.svg.diagonal()
  .projection(function(d) {
    return [d.y, d.x];
  });

// Initialize the zoom function (camera control)
var zoom = d3.behavior.zoom()
  .scaleExtent([0.1, 1])
  .on("zoom", zoomed);

function zoomed() {
  viz.attr("transform", "translate(" +
    d3.event.translate + ")" +
    "scale(" + d3.event.scale + ")");
}

//Here we append the svg element to the DOM
var svg = d3.select("div.svg").append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .attr("margin-left", "30px")
  .call(zoom);

// Here we append the g element to the svg, seperating the data g's, as a group, from svg.
var viz = svg.append('g')
  .attr('id', 'viz')
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var selectCircle = viz.append('circle').attr('r', 12).style("fill", "#0099CC").style("fill-opacity", ".3").style("display", "none");
selectCircle.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select(self.frameElement).style("height", "800px");

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }

  update(d);
  console.log(d);
  populateNodeTable(d);
  centerOnNode(d);

}

function onEditClick(data) {
  if (data.depth === 0) {
    $('#pid-volume-change-modal-label').html(data.name);
    $('#pid-volume-change-modal').modal('show');
  } else {
    $('#cpn-swap-modal-label').html(data.name);
    $('#cpn-swap-modal-label').data('parent-id', data.parent.componentId);
    $('#cpn-swap-modal-label').data('component-id', data.componentId);
    $('#cpn-number-units').attr('placeholder', data.extendedQuantity);
    $('#cpn-swap-modal').modal('show');
  }
}

//update appends the data to the svg and does the painting
function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
    links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 200;
  });

  // Update the nodes
  var node = viz.selectAll("g.node")
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  // Enter any new nodes at the parent's previous position. 
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    });
  //This rectangle is behind the text
  nodeEnter.append("rect")
    .attr("width", 130)
    .attr("height", 40)
    .attr("x", 9)
    .attr("y", -6)
    .style("fill", "#cccccc")
    .style("fill-opacity", ".8");
  // Component swap button
  nodeEnter.append("rect")
    .attr("width", 12)
    .attr("height", 13)
    .attr("x", "122px")
    .attr("y", "-5px")
    .style("fill", "white")
    .style("fill-opacity", ".8");
  nodeEnter.append("image")
    .attr("class", "swap-btn")
    .attr("xlink:href", function(d) {
      return d.depth === 0 ? "images/fa-edit-256-purp.png" : "images/fa-edit-256.png";
    })
    .attr("x", "122px")
    .attr("y", "-6px")
    .attr("width", 16)
    .attr("height", 16)
    .on("click", onEditClick);
  //circle is the node we see
  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("fill", function(d) {
      return d._children ? "#000" : "#fff";
    })
    .classed("node-circle", true)
    .on("click", click);
  //first text, for name
  nodeEnter.append("text")
    .attr("x", "10px")
    .attr("dy", "5px")
    .attr("text-anchor", "start")
    .attr('color', 'red')
    .text(function(d) {
      var nodeText = d.name;
      return nodeText;
    })
    .style("fill-opacity", 1e-6).style('fill', 'black').style('font-weight', 'bold');

  //second text portion; for number of units
  nodeEnter.append("text")
    .attr("x", "10px")
    .attr("dy", "17px")
    .text(function(d) {
      return ' ' + d.extendedQuantity;
    })
    .style('fill', 'red');

  //third text portion; for modified number of units (TODO)
  nodeEnter.append("text")
    .attr("x", "70px")
    .attr("dy", "17px")
    .text(function(d) {
      var nodeText = '';
      if (d.usingCustomCost) {
        nodeText = ' ' + '(' + '$' + Math.round(d.uiCustomCost * 100) / 100 + ')';
      }
      return nodeText;

    })
    .style('fill', 'blue');

  //fourth text portion; for cost
  nodeEnter.append("text")
    .attr("x", "10px")
    .attr("dy", "29px")

  .text(function(d) {
      return ' $' + Math.round(d.cost * 100) / 100;
    })
    .style('fill', 'green');
  // Fifth text portion; for rollup cost
  nodeEnter.append("text")
    .attr("x", "70px")
    .attr("dy", "29px")

  .text(function(d) {
      var nodeText = '';
      if (d.rollupCost) {
        nodeText = ' ' + '[' + '$' + Math.round(d.customRollupCost * 100) / 100 + ']';
      }
      return nodeText;
    })
    .style('fill', '#631D32');


  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeUpdate.select("circle")
    .attr("r", 4.5)
    .style("fill", function(d) {
      return d._children ? "#000" : "#fff";
    });

  nodeUpdate.select("text")
    .style("fill-opacity", 1);


  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);

  // Update the links
  var link = viz.selectAll("path.link")
    .data(links, function(d) {
      return d.target.id;
    });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal({
        source: o,
        target: o
      });
    });

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal({
        source: o,
        target: o
      });
    })
    .remove();

  //this portion paints the path from first to focus node
  //in general, chain from target through the sources to first node.
  var firstSourcePath;

  function paintLink(node) {
    for (var k = 0; k < link[0].length; k++) {
      // console.log(link[0][k].__data__.target.name);

      //paint the first link

      if (link[0][k].__data__.target.componentId === node.componentId) {
        // console.log("source name ", link[0][k].__data__.source.name);
        link[0][k].style.stroke = "#337ab7";
        if (link[0][k].__data__.source.componentId !== "undefined") {
          firstSourcePath = link[0][k].__data__.source;
          paintLink(firstSourcePath);
        }
      }
    }
  }

  // generate an array of all nodes with customCost, and call paintLink(..) with each of them
  var customCostArray = [];
  var buildCustomCostArray = function(node) {

    // Push the node onto the array if it has custom cost. We'll call paint on it later.
    if (typeof node.uiCustomCost !== 'undefined' && node.usingCustomCost === true) {
      customCostArray.push(node);
    }

    _.forEach(node.children, function(childNode) {
      buildCustomCostArray(childNode);
    });

  };
  buildCustomCostArray(source);

  // We've stored all of the nodes which have custom cost into an array. Paint each of these nodes.
  _.forEach(customCostArray, function(nodeWithCustomCost) {
    paintLink(nodeWithCustomCost);
  });


  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function populateNodeTable(node) {
  $('#node-input').data('node-name', node.componentId);
  $('#component-details').show();
  $('#component-name').text(node.name);
  if (node.children) {
    $('#node-context-children').text(node.children.length);
  } else {
    $('#node-context-children').text("None");
  }
  $('#node-context-cost').text(node.cost);
  $('#node-context-rollup-cost').text(node.rollupCost);
  $('#node-context-custom-rollup-cost').text(node.customRollupCost);
  if (node.usingCustomCost === true) {
    $('#node-impact').html('Loading...');
    $('#node-input').val(node.uiCustomCost);
    $.ajax({
      method: "POST",
      url: "/api/impact/fetchItemImpactSummary",
      data: {
        itemId: node.componentId
      }
    }).done(function(data) {
      $('#impact-modal-title').html('Impact of Changing Cost for Component: ' + node.name);
      var impactHtml = '<div class="impact-data"><span>Business Units: ' + data.business_unit.length + ' </span></div>';
      impactHtml += '<div class="impact-data"><span>Organizations: ' + data.organization_code.length + ' </span></div>';
      impactHtml += '<div class="impact-data"><span>Product Families: ' + data.product_family.length + ' </span></div>';
      impactHtml += '<div class="impact-data"><button class="btn btn-xs btn-primary" type="button" data-toggle="modal" data-target="#impact-modal">View Details</button></div>';
      $('#node-impact').html(impactHtml);
      var buTableHtml = '<table class="table">';
      for (var i = 0; i < data.business_unit.length; i++) {
        buTableHtml += '<tr><td>' + data.business_unit[i] + '</td></tr>';
      }
      buTableHtml += '</table>';
      var orgTableHtml = '<table class="table">';
      for (i = 0; i < data.organization_code.length; i++) {
        orgTableHtml += '<tr><td>' + data.organization_code[i] + '</td></tr>';
      }
      orgTableHtml += '</table>';
      var pfTableHtml = '<table class="table">';
      for (i = 0; i < data.product_family.length; i++) {
        pfTableHtml += '<tr><td>' + data.product_family[i] + '</td></tr>';
      }
      pfTableHtml += '</table>';
      $('#bu-impact-table').html(buTableHtml);
      $('#org-impact-table').html(orgTableHtml);
      $('#pf-impact-table').html(pfTableHtml);
      console.log('impact: ', data);
      $('i#submit-spinner').hide();
    });
  } else {
    $('#node-impact').html('No custom cost set.');
    $('#node-input').val('');
  }
  $('#node-context-depth').text(node.depth);

  //Move the selection circle
  //  selectCircle.attr("transform", "translate(" + node.y0 + "," + node.x0 + ")");
  selectCircle.attr("transform", "translate(" + node.y + "," + node.x + ")")
    .style("display", "block");
}

//Here we loop through the "node" object array, looking for a match to targetName
var getNode = function(node, targetName) {
  var result;
  if (node.componentId === targetName) {
    result = node;
  }
  if (typeof result === 'undefined') {
    _.forEach(node.children, function(childNode) {
      //console.log("childNode:  ", childNode);
      var t = getNode(childNode, targetName);
      if (typeof t !== 'undefined') {
        result = t;
      }
    });
    _.forEach(node._children, function(childNode) {
      //console.log("childNode:  ", childNode);
      var t = getNode(childNode, targetName);
      if (typeof t !== 'undefined') {
        result = t;
      }
    });
  }
  return result;
};

function buildGraph(data) {
  // Uncollapse the graph so that it can collapse to the new target node
  uncollapse(data);
  var targetNodeName = data.focusNode;
  var clickedNode = getNode(data, targetNodeName);

  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

  //This method shows most recently affected node on load (collapses the other paths). We use getNode, above, to help us select the correct node
  function collapse(data) {

    if (data.children && data.children.length > 0) {
      // Prevent collapse of targetNodeName's parents
      if (typeof targetNodeName !== 'undefined') {
        // getNode will return undefined if the targetNode is NOT a child of d
        var targetIsChild = (typeof getNode(data, targetNodeName) !== 'undefined');
        // If the target node is a descendant of this node, try to collapse this node's children.
        // Children of this node which are ancestors of the targetNode will not collapse -- they will
        // trigger the else statement below
        if (targetIsChild) {
          data.children.forEach(collapse);
        } else {
          // If the targetNode is not a descendent of d, then collapse d
          data._children = data.children;
          data._children.forEach(collapse);
          data.children = null; // Effectively collapses node d
        }
      } else {
        // No target specified, collapse all of the nodes
        data._children = data.children;
        data._children.forEach(collapse);
        data.children = null;
      }
    }
  }
  if (root.children) {
    root.children.forEach(collapse);
  }

  update(root);

  if (typeof targetNodeName !== 'undefined') {
    // Nodes are now positioned on the screen. Find the node in the chart and center on it.
    centerOnNode(clickedNode);
    populateNodeTable(clickedNode);
  }

}

function buildTable(data) {
  var tData = [];

  function buildTableRecord(recordData) {
    tData.push({
      'name': '<button class="btn btn-primary details-button" data-name="' + recordData.componentId + '" type="button">' + recordData.name,
      'cost': recordData.cost,
      'extendedQuantity': recordData.extendedQuantity,
      'spend': recordData.spend
    });
    if (recordData.children && recordData.children.length > 0) {
      recordData.children.forEach(buildTableRecord);
    }
    if (recordData._children && recordData._children.length > 0) {
      recordData._children.forEach(buildTableRecord);
    }
  }
  buildTableRecord(data);

  $('#tableBody').bootstrapTable('load', tData);

}

// Accepts data from the server and rebuilds the UI accordingly. Used after any fetch and store calls.
function processServerGraphData(data) {
  buildGraph(data.root);
  $('#tableBody').data('graph-data', data.root);
  $('#tableBody').data('orgId', data.orgId);
  buildTable(data.root);
}

function getGraphData() {

  $.ajax({
    method: "POST",
    url: "/api/fetchData",
    data: {
      pid: $('#current-pid-id').data('pidid'),
      org: '1'
    }
  }).done(function(data) {
    data.root.focusNode = data.root.componentId;
    processServerGraphData(data);
    $('i#submit-spinner').hide();
  });

}

//Uncollapses the tree starting from the specified root node
var uncollapse = function(root) {
  if (root.children) {
    root.children.forEach(uncollapse);
  }
  if (root._children) {
    root.children = root._children;
    root._children.forEach(uncollapse);
    root._children = null;
  }
};

// Centers the viewport at the target nodes position.
function centerOnNode(data) {
  var moveX = ($('.svg').width() / 2) - data.y;
  var moveY = ($('.svg').height() / 2) - data.x;

  // Pan the camera so that it's over the node which was selected
  viz
    .transition()
    .duration(1000)
    .attr("transform", "translate(" + moveX + "," + moveY + ")");

  // Update the zoom object so that it has the same position
  zoom.scale(1);
  zoom.translate([moveX, moveY]);

}

$(function() {

  //When the "Insert Change", i.e. "node-submit" button is clicked, the data is posted and the three different areas are removed
  $('#node-submit').click(function(evt) {
    //    $('i#change-spinner').show();
    //    $.ajax({
    //        method: "POST",
    //        url: "/api/storeData",
    //        data: {
    //          componentId: $('#node-input').data('node-name'),
    //          newCost: $('#node-input').val(),
    //          pid: $.urlParam('pid'),
    //          orgId: $('#tableBody').data('orgId'),
    //          orgCode: $.urlParam('orgCode'),
    //          costType: $.urlParam('costType')
    //        }
    //      })
    //      .done(function(data) {
    //        console.log('stored data. got new graph:', data);
    //        data.root.focusNode = $('#node-input').data('node-name');
    //        processServerGraphData(data);
    //        $('i#change-spinner').hide();
    //        // If saving this custom cost triggered the creation of a new version, refresh the page
    //        if ($('#unsaved-version').val() === 'true') {
    //          location.reload();
    //        }
    //      });
    //    evt.preventDefault();
    //    evt.stopPropagation();
  });

  var outgoingData = {
    "pidDemand": {
      "Q2FY16": 10,
      "Q3FY16": 20,
      "Q4FY16": 30,
      "Q1FY17": 40,
      "Q2FY17": 50
    },
    "componentParams": [{
      "fromId": "312103890",
      "toId": "313894771",
      "parentId": "311859345",
      "sortOrder": "SORTORDER1",
      "qty": 10
    }, {
      "fromId": "313276731",
      "toId": "307843472",
      "parentId": "312103890",
      "sortOrder": "SORTORDER2",
      "qty": 20
    }]
  };

  // Clear values from inputs after the modal has finished hiding
  $('#cpn-swap-modal').on('hidden.bs.modal', function() {
    $('#cpn-swap-modal input').val('');
  });
  $('#cpn-swap-save').click(function(evt) {
    var label = $('#cpn-swap-modal-label');
    outgoingData = {
      "pidDemand": {},
      "componentParams": [{
        "fromId": label.html(),
        "toId": $('#cpn-swap-to').val(),
        "parentId": label.data('parent-id'),
        "sortOrder": "N/A",
        "qty": $('#cpn-number-units').val()
      }]
    };
    $('#submit-pid-model').removeClass('disabled');
    window.scrollTo(0, document.body.scrollHeight);
    $('#submit-pid-model').click();
  });
  $('#pid-demand-save').click(function(evt) {
    outgoingData = {"componentParams": []};
    outgoingData['pidDemand'] = {};
    for (var i = 0; i < 5; i++) {
      var newDemand = $('#pid-volume-change-modal .modal-body input').eq(i).val();
      if (newDemand !== null) {
        var quarter = $('#pid-volume-change-modal .modal-body th').eq(i + 1).html();
        outgoingData['pidDemand'][quarter] = newDemand;
      }
    }
    $('#submit-pid-model').removeClass('disabled');
    window.scrollTo(0, document.body.scrollHeight);
    $('#submit-pid-model').click();
  });

  // Click handler for pid model submission button
  $('#submit-pid-model').click(function(evt) {
    if ($(this).hasClass('disabled')) {
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    }
    var _this = $(this);
    _this.append('<span class="ajax-spinner">&nbsp;&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
    $.ajax({
      type: "POST",
      url: 'api/submitPidModel',
      contentType: 'application/json',
      data: JSON.stringify(outgoingData),
      success: function(data) {
        unpackErrorAndMsg(data);
      },
      complete: function(data) {
        $('span.ajax-spinner', _this).remove();
      }
    });
    evt.preventDefault();
  });

  //help popover
  var popoverContent = "<ul><li>Click a node to expand it and see its children</li>" +
    "<li>Click a node to edit it</li>" +
    "<li>Scroll your mouse wheel to zoom</li>" +
    "<li>Left-click and hold, or hold down your mouse wheel to drag the tree</li>" +
    "<li>Cost values in the graph are rounded to two decimal places</li>" +
    "</ul>";

  $('#help-popover').popover({
    html: true,
    container: 'body',
    placement: 'auto',
    content: function() {
      return popoverContent;
    }
  });

  var pidColumnConfig = [{
    field: 'name',
    title: 'Component Name',
  }, {
    field: 'cost',
    title: 'Cost',
  }, {
    field: 'extendedQuantity',
    title: 'Extended Quantity',
  }, {
    field: 'spend',
    title: 'Spend',
  }];

  _.forEach(pidColumnConfig, function(n) {
    n.align = 'left';
    n.valign = 'left';
    n.sortable = true;
  });

  $('#tableBody').bootstrapTable({
    cache: false,
    striped: true,
    pagination: true,
    pageSize: 10,
    pageList: [5, 10, 20],
    search: true,
    columns: pidColumnConfig
  });

  $('#key-popover').popover({
    html: true,
    container: '#tree-container',
    placement: 'auto right',
    content: function() {
      return $('#key-table').html();
    }
  });

  $('#key-popover').on('show.bs.popover hide.bs.popover', function() {
    $(this).find('i').toggleClass('fa-plus-circle fa-minus-circle');
  });

  //when user clicks a button in "Full PID Tree Details" table, then focus on the corresponding node
  $('#tableBody').on('click', 'button.details-button', function(evt) {
    // Set the focusNode to be the node which was just selected
    $('#tableBody').data('graph-data').focusNode = $(this).data('name');
    // Scroll to the graph div
    $('html,body').animate({
      scrollTop: $('div.svg:first').offset().top
    });

    // Trigger the collapse
    buildGraph($('#tableBody').data('graph-data'));

    evt.preventDefault();
    evt.stopPropagation();
  });

  getGraphData();


});
