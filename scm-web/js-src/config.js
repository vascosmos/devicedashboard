app.config(function($interpolateProvider) {
	  $interpolateProvider.startSymbol('[[');
	  $interpolateProvider.endSymbol(']]');
});

app.config( function($routeProvider, $locationProvider) {
	  $routeProvider.when( "/successReg", {
	    templateUrl: "templates/successReg.html"
	  } );
	} );