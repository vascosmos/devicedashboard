var app = angular.module('scmApp', ['ngRoute','rzModule']);
app.config(["$interpolateProvider", function($interpolateProvider) {
	  $interpolateProvider.startSymbol('[[');
	  $interpolateProvider.endSymbol(']]');
}]);

app.config( ["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
	  $routeProvider.when( "/successReg", {
	    templateUrl: "templates/successReg.html"
	  } );
	}] );

app.controller('SelectedComponentCtrl', ["$scope", function($scope) {
  // TODO Write me
}])

.controller('PidModelingCtrl', ["$scope", "SubmitPidModelSvc", function($scope, SubmitPidModelSvc) {

  var outgoingData = {};

  $scope.submit = function() {
    SubmitPidModelSvc.submitModel(outgoingData, function(response) {
      console.log('response: ', response);
    });
  }

}])

.controller('UsecaseSelectCtrl', ["$scope", "$timeout", function($scope, $timeout) {
  $scope.usecase = 'costChange';
  
  $scope.cpnData = _.cloneDeep(renderedData);
  
  if($scope.cpnData.changeType === 'COST_CHANGE'){
 	 $scope.usecase = 'costChange';
  } else {
	 $scope.usecase = 'supplierCostChange';
  } 

  // Disable the split use case if there is only one supplier
  var supplierData = _.cloneDeep(renderedData.quarterlyComponentData[Object.keys(renderedData.quarterlyComponentData)[0]]);
  if (supplierData.suppliers.length <= 1) {
    $scope.singleSupplier = true;
  } else {
    $scope.singleSupplier = false;
  }

  $scope.redrawSliders = function() {
    $timeout(function() {
      $scope.$broadcast('rzSliderForceRender');
    });
  }
}])

.controller('ComponentCostModelingCtrl', ["$scope", "SubmitComponentModelSvc", function($scope, SubmitComponentModelSvc) {

  function init() {
    $scope.cpnData = _.cloneDeep(renderedData);
    $scope.modCpnData = _.cloneDeep($scope.cpnData);
    userModCpnData = $scope.cpnData.quarterlyModifiedComponentData;
    // Set the initial cost savings value (should be zero)
    _.forEach($scope.cpnData.quarterlyComponentData, function(qtrData, qtrName) {
      updateSavings(qtrName);
    });
    
    /* update user selected Change type. */
    if($scope.cpnData.changeType === 'COST_CHANGE'){
    	 //$scope.usecase = 'costChange';
    	 /* retain previously modified mateiral cost. */
	    if(userModCpnData) {
	    	_.forEach(userModCpnData, function(qtrData, qtrName) {
	    		$scope.modCpnData.quarterlyComponentData[qtrName].materialCost = qtrData.materialCost;
	    	});
	    }
    }
    
    $scope.modified = false;
  }

  $scope.translate = function(value) {
    return '$' + value;
  }

  $scope.onCostSliderChange = function(quarter) {
    updateSavings(quarter);
    $scope.modCpnData.quarterlyComponentData[quarter].modified = true;
    updateOutgoingData();
  }

  $scope.colorClassFromValue = function(value) {
    if (value == 0) {
      return '';
    } else if (value > 0) {
      return 'text-success';
    } else {
      return 'text-danger';
    }
  }

  $scope.submit = function() {
    if ($scope.modified) {
      SubmitComponentModelSvc.submitModel(outgoingData, function(response) {
        console.log('response: ', response);
      });
    }
  }

  function updateSavings(quarter) {
    var modQtrData = $scope.modCpnData.quarterlyComponentData[quarter];
    var qtrData = $scope.cpnData.quarterlyComponentData[quarter];
    qtrData.savings = qtrData.materialCost - modQtrData.materialCost;
  }

  function updateOutgoingData() {

    // Update the dataset that will be sent to the server once the user is finished modeling this CPN
    outgoingData = _.transform($scope.modCpnData.quarterlyComponentData, function(result, qtrData, qtrName) {
      // console.log(qtrName);
      if (qtrData.modified) {
        result[qtrName] = {};
        result[qtrName].materialCost = qtrData.materialCost;
        $scope.modified = true;
      }
      return qtrData.modified;
    });
  }

  init();
}])


// Controller for handling Supplier Split Change
.controller('SupplierCostModelingCtrl', ["$scope", "SubmitComponentModelSvc", function($scope, SubmitComponentModelSvc) {

  var outgoingData = [];

  // Use only the first quarter's data
  $scope.supplierData = _.cloneDeep(renderedData.quarterlyComponentData[Object.keys(renderedData.quarterlyComponentData)[0]]);
  $scope.userModSupplierData = _.cloneDeep(renderedData.quarterlyModifiedComponentData['Present Quarter']);
 
  $scope.quarter = 'Present Quarter';
  // Initialize starting values for fields relevant to this page
  // Create an array of splits to drive the slider UI element
  $scope.supplierData.splits = [];
  if($scope.userModSupplierData){
	  _.forEach($scope.userModSupplierData.suppliers, function(supplier) {
		    supplier.savings = 0;
		    $scope.supplierData.splits.push(supplier.supplierSplit);
	});
	  _.forEach($scope.supplierData.suppliers, function(supplier) {
		    supplier.supplierSplit = supplier.supplierSplit / 100;
	});
  } else {
	  _.forEach($scope.supplierData.suppliers, function(supplier) {
		    supplier.savings = 0;
		    supplier.supplierSplit = supplier.supplierSplit / 100;
		    $scope.supplierData.splits.push(supplier.supplierSplit);
	});  
  }

  // TODO TEMP Calculating average cost since the mock data does not have the correct average cost
  $scope.supplierData.materialCost = 0;
  _.forEach($scope.supplierData.suppliers, function(supplier) {
    $scope.supplierData.materialCost += (supplier.supplierSplit * supplier.mpnCost);
  });

  $scope.modSupplierData = _.cloneDeep($scope.supplierData);

  $scope.modSupplierData.newAverageCost = $scope.supplierData.materialCost;
  $scope.modified = false;

  $scope.translate = function(value) {
    return '$' + value;
  }

  $scope.onCostSliderChange = function(index) {
    var supplier = $scope.cpnData.quarterlyComponentData[quarter].suppliers[index];
    supplier.savings = supplier.mpnCost - $scope.modCpnData.quarterlyComponentData[quarter].suppliers[index].mpnCost;

    updateAverageCost();
  }

  $scope.onSplitSliderChange = function() {
    var modComponentData = $scope.modSupplierData;
    var dataChanged = false; // TODO fix directive so ng-change isn't always firing
    _.forEach(modComponentData.suppliers, function(supplier, i) {
      if (modComponentData.suppliers[i].supplierSplit !== modComponentData.splits[i]) {
        modComponentData.modified = true;
        modComponentData.suppliers[i].modified = true;
        dataChanged = true;
        $scope.modified = true;
      }
    });
    if (dataChanged) {
      updateAverageCost();
    }
  }

  $scope.submit = function() {
    if ($scope.modified) {
      SubmitComponentModelSvc.submitModel(outgoingData, function(response) {
        console.log('response: ', response);
      });
    }
  }

  function updateAverageCost() {
    var newAverageCost = 0;
    var modComponentData = $scope.modSupplierData;
    _.forEach(modComponentData.suppliers, function(supplier, i) {
      if (modComponentData.suppliers[i].modified) {
        // Make sure the modified component data's split matches the split array which the slider is modifying
        modComponentData.suppliers[i].supplierSplit = modComponentData.splits[i];
        // Add this supplier's contribution to the average cost
        newAverageCost += (modComponentData.splits[i] * supplier.mpnCost);
      }
    });
    modComponentData.newAverageCost = newAverageCost;

    updateOutgoingData();

  }

  function updateOutgoingData() {
    // Update the dataset that will be sent to the server once the user is finished modeling this CPN
    outgoingData = {
      'Present Quarter': {
        'suppliers': _.transform($scope.modSupplierData.suppliers, function(r, s) {
          if (s.modified) {
            r.push(s);
          }
        })
      }
    };
  }

  $scope.colorClassFromValue = function(value) {
    if (value == 0) {
      return '';
    } else if (value > 0) {
      return 'text-success';
    } else {
      return 'text-danger';
    }
  }

}])
.controller('regisCtrl', ["$scope", "$http", "$location", "$window",  function($scope, $http, $location, $window) {
	$scope.first = '';
	$scope.last = '';
	$scope.company= '';
	$scope.email = '';
	$scope.phone= '';
	$scope.country ='';
	$scope.state = '';
	$scope.error = '';
	$scope.errorEx = false;
	$scope.getCSSClass = function(){
		if($scope.errorEx===true){
			return "container alert alert-danger";
		} else {
			return "container alert alert-danger display-none";
		}
	}
	
	$scope.regi =  function() {
		$scope.errorEx===true
		// check for validateion
	    $http.put("/api/createLead", 
	    		{"first": $scope.first,
	    	"last": $scope.last,
	    	"company": $scope.company,
	    	"email": $scope.email,
	    	"phone": $scope.phone,
	    	"country": $scope.country,
	    	"state": $scope.state,
	    	"expectedDepSize": "10"
	    }).error(function (error, status){
	    	if(error.status == 'failed'){
	    		console.log(error.message);
	    		$scope.error = error.message;
	    		$scope.errorEx = true;
	    	}
	  }).then(function(response){
	        var data = response.data;
	        if(data.status && data.status == 'success'){
				$window.location.href = "/successReg";
	        }
	      })
	}
}])

.controller('passCtrl', ["$scope", "$http", "$location", "$window",  function($scope, $http, $location, $window) {
	$scope.password = '';
	$scope.cPassword = '';
	$scope.email = '';
	$scope.setPass =  function() {
		$scope.error = '';
		if($scope.password === '' || $scope.cPassword === ""){
			$scope.error = "Password and/or Confirm Password can't be null";
			return;
		}
		if($scope.password !== $scope.cPassword){
			$scope.error = "Password and Confirm Password doesn't match";
			return;
		}
		
		// check for validateion
	    $http.post("/updatePassword", 
	    		{
	    			"password":$scope.password,
	    			"email":$scope.email
	    		}
	    ).then(function(response){
				$window.location.href = "/login";
	      })
		
	}
}])

.controller('deviceCtrl', ["$scope", "$http", "$location", "$window",  function($scope, $http, $location, $window) {
	
	$scope.emails = '';
	$scope.hideInviteMsg = true;
	$scope.editDevice = false;
	$scope.userId=parseInt($('#userID').val());
	$scope.licenseKey=''; 
	$scope.deviceEmail = '';
	$scope.deviceId = '';
	$scope.activeStatus = '';
	$scope.toggleActionName = '';
	
	
	//after update modified.
	$scope.updatedLicenseKey=''; 
	
	$http.post("/api/devices/userId",{"userId": $scope.userId}).error(function (error, status){
    	if(error.status == 'failed'){
    		console.log(error.message);
    		$scope.error = error.message;
    		$scope.errorEx = true;
    	}
	}).then(function(response){
        var data = response.data;
        if(data.status && data.status == 'success'){
			device = data.device[0];
			//device.active === 'Y' ? $scope.editDevice = true : $scope.editDevice = false;
			device.active == 'Y' ? $scope.activeStatus = true : $scope.activeStatus = false;
			device.active == 'Y' ? $scope.toggleActionName = 'Disable' : $scope.toggleActionName = 'Enable';
			$scope.deviceEmail = device.email;
			$scope.licenseKey = device.licenseKey;
			$scope.updatedLicenseKey =  device.licenseKey;
			$scope.os = device.os;
			$scope.version = device.version;
			$scope.deviceId = device.id;
        }
      });
	
	$scope.updateDevice = function(deviceId){
		$http.post("/api/device/", {"id": $scope.deviceId, "licenseKey": $scope.licenseKey}).error(function (error, status){
	    	if(error.status == 'failed'){
	    		console.log(error.message);
	    		$scope.error = error.message;
	    		$scope.errorEx = true;
	    	}
		}).then(function(response){
	        var data = response.data;
	        if(data.status && data.status == 'success'){
	        	$scope.updatedLicenseKey = $scope.licenseKey;
	        	$scope.editDevice=false;
	        }
	      });
	}
	
	$scope.toggleActivate = function(deviceId, currentStatus){
		
		currentStatus ? changeTo = 'N' : changeTo = 'Y';
		
		$http.post("/api/device/", {"id": $scope.deviceId, "active" : changeTo }).error(function (error, status){
	    	if(error.status == 'failed'){
	    		console.log(error.message);
	    		$scope.error = error.message;
	    		$scope.errorEx = true;
	    	}
		}).then(function(response){
	        var data = response.data;
	        if(data.status && data.status == 'success'){
	        	changeTo == 'Y' ? $scope.activeStatus = true : $scope.activeStatus = false;
	        	changeTo == 'Y' ? $scope.toggleActionName = 'Disable' : $scope.toggleActionName = 'Enable';
	        }
	      });
	}
	
	$scope.cancel = function(){
		$scope.licenseKey = $scope.updatedLicenseKey;
		$scope.editDevice=false;
	}
	$scope.edit = function(){
		$scope.editDevice=true;
	}
	
	$scope.getCSSEdit = function(){
		if($scope.editDevice){
			return '';
		} else {
			return 'display:none;';
		}
	}
	
	$scope.getCSSView = function(){
		if(!$scope.editDevice){
			return '';
		} else {
			return 'display:none;';
		}
	}
	
	$scope.sendInvite = function(){
		//One or more email address are not valid, please check and try again. 
		/*var regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        var result = string.replace(/\s/g, "").split(/,|;/);        
        for(var i = 0;i < result.length;i++) {
            if(!regex.test(result[i])) {
            	alert('One or more email address are not valid, please check and try again. ')
                return false;
            }
        } */
		$http.post("/api/sendInvite", 
	    		{
	    			"emails":$scope.emails
	    		}
	    ).then(function(response){
	    	data = response.data;
	    	if(data.status && data.status === 'success'){
	    		$scope.emails ='';
	    		$scope.hideInviteMsg = false;
	    		
	    	}
	    })
	    
	}
	
	
}])

// This directive is forked from https://github.com/anandthakker/angular-multirange-slider
app.directive('slider', ["$document", "$timeout", function ($document, $timeout) {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            property: '@',
            step: '@',
            ngModel: '=',
            ngChange: '='
        },
        replace: true,
        template: '<div class="slider-control">\n<div class="slider">\n</div>\n</div>',
        link: function (scope, element, attrs) {
            var fn, getP, handles, i, j, len, mv, pTotal, ref, setP, step, updatePositions;
            element = element.children();
            element.css('position', 'relative');
            handles = [];
            pTotal = 0;
            
            // Call the ng-change method when the ng-model collection object changes
            scope.$watchCollection('ngModel', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    scope.$eval(attrs.ngChange);
                }
            });
            
            step = function () {
                if (scope.step != null) {
                    return parseFloat(scope.step);
                } else {
                    return 0;
                }
            };
            getP = function (i) {
                if (scope.property != null) {
                    return scope.model[i][scope.property];
                } else {
                    return scope.model[i];
                }
            };
            setP = function (i, p) {
                var s = step();
                if (s > 0) {
                    p = Math.round(p / s) * s;
                }
                if (scope.property != null) {
                    return scope.model[i][scope.property] = p;
                } else {
                    return scope.model[i] = p;
                }
            };
            updatePositions = function () {
                var handle, i, j, len;
                pTotal = scope.model.reduce(function (sum, item, i) {
                    return sum + getP(i);
                }, 0);
                var pRunningTotal = 0;
                var results = [];
                for (i = j = 0, len = handles.length; j < len; i = ++j) {
                    handle = handles[i];
                    var p = getP(i);
                    pRunningTotal += p;
                    var x = pRunningTotal / pTotal * 100;
                    results.push(handle.css({
                        left: x + '%',
                        top: '-' + handle.prop('clientHeight') / 2 + 'px'
                    }));
                    if(x === 100){
                        handle.css('z-index', len - i);
                    }else{
                        handle.css('z-index', i);
                    }
                }
                return results;
            };
            ref = scope.model;
            fn = function (mv, i) {
                var handle, startPleft, startPright, startX;
                if (i === scope.model.length - 1) {
                    return;
                }
                handle = angular.element('<div class="slider-handle"></div>');
                handle.css('position', 'absolute');
                handles.push(handle);
                element.append(handle);
                startX = 0;
                startPleft = startPright = 0;
                return handle.on('mousedown', function (event) {
                    var mousemove, mouseup;
                    mousemove = function (_this) {
                        return function (event) {
                            return scope.$apply(function () {
                                var dp;
                                dp = (event.screenX - startX) / element.prop('clientWidth') * pTotal;
                                if (dp < -startPleft || dp > startPright) {
                                    return;
                                }
                                setP(i, startPleft + dp);
                                setP(i + 1, startPright - dp);
                                return updatePositions();
                            });
                        };
                    }(this);
                    mouseup = function () {
                        $document.unbind('mousemove', mousemove);
                        return $document.unbind('mouseup', mouseup);
                    };
                    event.preventDefault();
                    startX = event.screenX;
                    startPleft = getP(i);
                    startPright = getP(i + 1);
                    $document.on('mousemove', mousemove);
                    return $document.on('mouseup', mouseup);
                });
            };
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                mv = ref[i];
                fn(mv, i);
            }
            return scope.$watch('model', updatePositions, true);
        }
    };
}])

app.directive('ngUpdateHidden',function() {
    return function(scope, el, attr) {
        var model = attr['ngModel'];
        scope.$watch(model, function(nv) {
            el.val(nv);
        });

    };
})

// Converts a decimal to a percentage display format with a configurable number of decimals.
// Usage: [[myDecimal | percentage:2]]
app.filter('percentage', [ '$filter', function($filter) {
	return function(input, decimals) {
		return $filter('number')(input * 100, decimals) + '%';
	};
} ])
app.factory('SubmitComponentModelSvc', ["$http", "$window", function($http, $window) {
  return {
    submitModel: function(data, callback) {
      return $http.post('api/submitComponentModel', data).then(function(response) {
        if (response.data.redirect !== null) {
          $window.location.href = response.data.redirect;
        } else {
          if (callback) {
            callback(response.data);
          }
        }
      });
    }
  }
}])

app.factory('SubmitPidModelSvc', ["$http", "$window", function($http, $window) {
  return {
    submitModel: function(data, callback) {
      return $http.post('api/submitPidModel', data).then(function(response) {
        console.log('r in svc: ', response);
        if (response.data.redirect !== null) {
          $window.location.href = response.data.redirect;
        } else {
          if (callback) {
            callback(response.data);
          }
        }
      });
    }
  }
}]);