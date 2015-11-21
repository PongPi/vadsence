'use strict';
angular.module('vadsenceNodeApp')
    .controller('LoginCtrl', function($scope, $http, Auth, $rootScope, $location, $window,$translate) {
        $scope.user = {};
        $scope.errors = {};
        $rootScope.title = 'Login';
        Auth.logout();
        $scope.login = function() {
            $scope.submitted = true;

            //if(form.$valid) {
            Auth.login({
                    email: $scope.user.email,
                    password: $scope.user.password
                })
                .then(function() {
                    // Logged in, redirect to home

                    var isStudent = Auth.isStudent();
                    $rootScope.isStudent = isStudent;
                    if (isStudent) {
                        $location.path('/student/dashboard');
                    } else {
                        $location.path('/mentor/dashboard');
                    }

                })
                .catch(function(err) {
                    $scope.errors.other = err.message;
                });
        };

        $scope.signupStudent = function() {
            $location.path('/student/signup');
        };

        $scope.signupMentor = function() {
            $location.path('/mentor/signup');
        };

        $scope.loginOauth = function(provider) {
            $window.location.href = '/auth/' + provider;
        };




    });

'use strict';
angular.module('vadsenceNodeApp')
    .controller('ForgetCtrl', function($scope, $http, $rootScope, $location, $window,$translate) {
        $scope.resetPassword = function(form) {
            // forgetPassword
            $http.put('/api/users/forgetPassword', {
                email: $scope.resetEmail
            }).success(function() {
                swal("Send!", "Email reset password is send!", "success", function(isConfirm) {
                    window.location = '/login';
                });
            }).error(function() {
                swal("Error!", "Can not send reset your account! Please check your email again or contact administrator.", "error")
            });
        }

        $scope.resetSuccess = function() {
            swal({
                title: "Success",
                text: "Your new password was send to your email, please check out your mailbox and change to your password after login.",
                type: "success",
                showCancelButton: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Go to login",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                window.location = '/login';
            });
        }
    });