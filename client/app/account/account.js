'use strict';

angular.module('vadsenceNodeApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/forgetpassword', {
        templateUrl: 'app/account/login/forget_password.html',
        controller: 'ForgetCtrl'
      })
      .when('/forgetpassword/complete', {
        templateUrl: 'app/account/login/forget_password_complete.html',
        controller: 'ForgetCtrl'
      })
      .when('/signup', {
        templateUrl: 'app/account/signup/signup.html',
        //templateUrl: 'app/account/signup/student_signup.html',
        controller: 'StudentSignupCtrl'
      })
      .when('/mentor/signup', {
        templateUrl: 'app/account/signup/mentor_signup.html',
        controller: 'MentorSignupCtrl'
      })
      .when('/settings', {
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  });