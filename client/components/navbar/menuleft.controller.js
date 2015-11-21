'use strict';

angular.module('vadsenceNodeApp')
    .controller('MenuLeftCtrl', function($scope, $rootScope, $location, Auth) {
        $scope.menu = [{
            'title': 'Home',
            'link': '/'
        }];

        $scope.reloadUIKit = function() {
            var nav = UIkit.nav($('.uk-nav'));
        }
        $scope.isCollapsed = true;
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.isAdmin = Auth.isAdmin;
        $scope.getCurrentUser = Auth.getCurrentUser;
        $rootScope.isAdmin = Auth.isAdmin;
        $scope.logout = function() {
            Auth.logout();
            $location.path('/login');
        };
        $scope.isActive = function(route) {
            return route === $location.path();
        };

    });
