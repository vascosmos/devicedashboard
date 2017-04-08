app.factory('SubmitComponentModelSvc', function($http, $window) {
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
})

app.factory('SubmitPidModelSvc', function($http, $window) {
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
});