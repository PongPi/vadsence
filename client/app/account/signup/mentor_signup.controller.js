'use strict';

angular.module('vadsenceNodeApp')
  .controller('MentorSignupCtrl', function($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if (form.$valid) {
        Auth.createUser({
            name: $scope.user.name,
            email: $scope.user.email,
            password: $scope.user.password,
            type: 'mentor',
            role: 'mentor'
          })
          .then(function() {
            // Account created, redirect to home
            // $location.path('/');
            var isStudent = Auth.isStudent();
            if (isStudent) {
              $location.path('/student-profile');
            } else {
              $location.path('/mentor-profile/personal');
            }
          })
          .catch(function(err) {
            err = err.data;
            $scope.errors = {};

            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, function(error, field) {
              form[field].$setValidity('mongoose', false);
              $scope.errors[field] = error.message;
            });
          });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
