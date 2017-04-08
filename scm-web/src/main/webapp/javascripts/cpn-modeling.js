$(function() {

 /* $.ajax({
    type: "POST",
    url: '/api/getScatterPlotData?cpn=' + renderedData.componentName,
    success: function(data) {
      drawScatter(data);
    }
  });*/

  function drawScatter(data) {

    // console.log("got data", data);

    var c3XSData = {};
    var c3ColumnData = [];
    _.forEach(data, function(supplierData, supplierName) {
      // Configure C3's xs property to have the correct x-axis name
      c3XSData[supplierName] = supplierName + '__dataset';
      // Create the x-axis volume array for this supplier
      var volumeArray = [supplierName + '__dataset'];
      _.forEach(supplierData['Volume'], function(volume, i) {
        // TODO Remove the subtraction below (using for mock purposes)
        //      volume -= (i * 100000);
        volumeArray.push(volume);
      });
      c3ColumnData.push(volumeArray);
      // Create the y-axis cost array for this dataset
      var costArray = [supplierName];
      _.forEach(supplierData['Cost'], function(cost, i) {
        // TODO Remove the subtraction below (using for mock purposes)
        //      cost -= (i * 100);
        costArray.push(cost);
      });
      c3ColumnData.push(costArray);

      var chart = c3.generate({
        bindto: '#scatter-plot',
        padding: {
          right: 50
        },
        point: {
          r: 15
        },
        data: {
          // Declare the x axis values for each of the data sets
          xs: c3XSData,
          type: 'scatter',
          columns: c3ColumnData,
          mimeType: 'json',
          onclick: function(d, element) {
            console.log(url);
          },

          onmouseover: function(d) {
            console.log(d);
          }
        },

        tooltip: {
          format: {
            name: function(name, ratio, id, index) {
              return name + ", " + "quarter " + index;
            }
          }
        },
        legend: {
          position: 'inset'
        },


        axis: {
          x: {
            type: 'scatter',
            tick: {
              multiline: false
            },
            label: {
              text: "Volume",
              position: 'outer-center'
            }

          },
          y: {
            label: {
              text: 'Cost',
              position: 'outer-middle'
            }

          }

        }
      });
    });
  }

});
