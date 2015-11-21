'use strict';

angular.module('vadsenceNodeApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/pricing', {
        templateUrl: 'app/pricing/pricing.html',
        controller: 'PricingCtrl'
      });
  });
