'use strict';

angular.module('vadsenceNodeApp')
	.controller('StudentSignupCtrl', function($scope, Auth, $location, $window) {
		$scope.user = {};
		$scope.errors = {};
		Auth.logout();
		$scope.register = function(form) {
			console.log('register', form.$valid)
			$scope.submitted = true;
			if($scope.user.password !== $scope.user.confirm){
		        form.confirm.$error.required = true;
		        form.$valid = false;
		    }
			if (form.$valid) {
				Auth.createUser({
						name: $scope.user.name,
						email: $scope.user.email,
						password: $scope.user.password,
						type: 'student',
						role: 'student'
					})
					.then(function() {
			              $location.path('/student-profile');
					})
					.catch(function(err) {
						err = err.data;
						$scope.errors = {};
						// Update validity of form fields that match the mongoose errors
						var error_str = ""
						angular.forEach(err.errors, function(error, field) {
							//form[field].$setValidity('mongoose', false);
							$scope.errors[field] = error.message;
							error_str += " "+ error.message+".";
						});
						swal("Op!", error_str, "error");
					});
			}
		};

		$scope.loginOauth = function(provider) {
			$window.location.href = '/auth/' + provider;
		};
	});
