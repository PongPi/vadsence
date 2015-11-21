'use strict';

angular.module('vadsenceNodeApp')
  .controller('DashboardStudentNavbarCtrl', function($scope, $location) {
    $scope.dashboardStudentNavItems = [{
      href: '/student-profile/personal',
      text: 'Personal information'
    },
    {
      href: '/student-profile/academic',
      text: 'Academic information'
    },{
      href: '/student-profile/parent',
      text: 'Parent information'
    }
    ,{
      href: '/student-profile/change-password',
      text: 'Change password'
    }
    ];
    $scope.reloadUIkit = function(){
      
    }
    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
