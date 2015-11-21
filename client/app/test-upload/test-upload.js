'use strict';

angular.module('vadsenceNodeApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/test-upload', {
        templateUrl: 'app/test-upload/test-upload.html',
        controller: 'TestUploadCtrl'
      });
  });
