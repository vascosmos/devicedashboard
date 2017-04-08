
app.controller('SelectedComponentCtrl', function($scope) {
  // TODO Write me
})

.controller('PidModelingCtrl', function($scope, SubmitPidModelSvc) {

  var outgoingData = {};

  $scope.submit = function() {
    SubmitPidModelSvc.submitModel(outgoingData, function(response) {
      console.log('response: ', response);
    });
  }

})

.controller('UsecaseSelectCtrl', function($scope, $timeout) {
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
})

.controller('ComponentCostModelingCtrl', function($scope, SubmitComponentModelSvc) {

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
})


// Controller for handling Supplier Split Change
.controller('SupplierCostModelingCtrl', function($scope, SubmitComponentModelSvc) {

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

})
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
