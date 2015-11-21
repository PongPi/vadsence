'use strict';

angular.module('vadsenceNodeApp')
  .controller('SignupCtrl', function($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};
    $scope.options = ['student', 'mentor'];

    $scope.register = function(form) {
      $scope.submitted = true;
      console.log(form.confirm.$error);
      if($scope.user.password !== $scope.user.confirm){
        form.confirm.$error.required = true;
        form.$valid = false;
        //console.log(form.confirm.$error);
        //return false;
      }
      if (form.$valid) {
        Auth.createUser({
            //name: $scope.user.name,
            email: $scope.user.email,
            password: $scope.user.password,
            role: 'student', //$scope.user.type
          })
          .then(function() {
            // Account created, redirect to home
            //var isStudent = Auth.isStudent();
            //if (isStudent) {
              $location.path('/student/dashboard');
            //} else {
            //  $location.path('/mentor-profile/personal');
            //}
            // $location.path('/');
          })
          .catch(function(err) {
            console.log('err', err);
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
