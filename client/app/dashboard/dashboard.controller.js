'use strict';

angular.module('vadsenceNodeApp')
  .controller('DashboardCtrl', function ($scope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;
});
