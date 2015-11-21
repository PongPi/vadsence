'use strict';

var vadsenceapp = angular.module('vadsenceNodeApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngAnimate',
        'ui.bootstrap',
        'angular-loading-bar',
        'ui.select',
        'ngFileUpload',
        'pascalprecht.translate',
        'easypiechart',
        'textAngular',
        'ngImgCrop'
    ])
    .config(function($routeProvider, $locationProvider, $httpProvider,$translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'assets/languages/locale-',
            suffix: '.json'
        });
        $translateProvider.useLocalStorage();
        $translateProvider.preferredLanguage('cn');
        $routeProvider
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
    })
   .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
            return {
                // Add authorization token to headers
                request: function (config) {
                    config.headers = config.headers || {};
                    if ($cookieStore.get('token')) {
                        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
                    }
                    return config;
                },
                // Intercept 401s and redirect you to login
                responseError: function (response) {
                    if (response.status == 401) {
                        if($rootScope.isHome !== true){
                            $location.path('/login');
                            // remove any stale tokens
                            $cookieStore.remove('token');
                        }


                        return $q.reject(response);
                    } else {
                        return $q.reject(response);
                    }
                }
            };
        })
        .run(function ($rootScope, $location, $cookieStore, Auth, Helper,$translate,$translateLocalStorage) {
            // Redirect to login if route requires auth and you're not logged in
            $rootScope.$on('$routeChangeStart', function (event, next) {
                // if ($location.path().length > 1) {
                //     if ($location.path() == '/faq'
                //     || $location.path() == '/resources'
                //     || $location.path() == '/login'
                //     || $location.path() == '/signup'
                //     || $location.path() == '/why-vadsence'
                //     || $location.path() == '/academic-index-caculator'
                //     || $location.path() == '/contact'
                //     || $location.path() == '/programs'
                //     || $location.path() == '/programs/programs-essay/'
                //     || $location.path() == '/programs/programs-resume/'
                //     || $location.path() == '/vadsence_beta'
                //     || $location.path() == '/forgetpassword'
                //     || $location.path() == '/forgetpassword/complete'
                //     ) {
                //         $rootScope.isHome = true;
                //     } else {
                //         $rootScope.isHome = false;
                //     }
                // } else {
                //     $rootScope.isHome = true;
                // }
            // $rootScope.changeLang = function(key)
            // {
            //     $translate.use(key);
            //     var url = $rootScope.urlKey;
            //     $rootScope.includeURL = 'app/pages/html/translate/'+url+key+'.html';
            //     $rootScope.lang_use = key;
            // }
                // setTimeout(function(){
                //   Auth.getUser(function(error, currentUser){
                //     if(!error){
                //         $rootScope.user = currentUser;
                //         var now = moment();
                //         if(! $rootScope.user.time_zone){
                //             if($rootScope.user.role == 'mentor')
                //             {
                //                 $rootScope.user.time_zone = "America/New_York";
                //             }
                //             else
                //             {
                //                 $rootScope.user.time_zone = "Asia/Shanghai";
                //             }
                //         }
                //         $rootScope.current_time = now.tz($rootScope.user.time_zone).format('hh:mm a');
                //     }
                //   });
                // }, 0);
                $rootScope.isLoggedIn = Auth.isLoggedIn;
                console.log('rootScope',  Auth.isLoggedIn())
                if (Auth.isLoggedIn()) {
                    // Auth.getUser(function(error, currentUser){
                    //     if(error){
                    //         Helper.displayMessage('danger', 'Something went wrong');
                    //         return false;
                    //     }
                    //
                    //     $rootScope.user = currentUser;
                    //     var now = moment();
                    //     if ($rootScope.user.time_zone !== undefined) {
                    //         $rootScope.current_time = now.tz($rootScope.user.time_zone).format('hh:mm a');
                    //     } else {
                    //         $rootScope.current_time = now.format('hh:mm a');
                    //     }
                    // });
                }

                activeMenu($rootScope, $location);
                $rootScope.isStudent = Auth.isStudent();
                $rootScope.isMentor = Auth.isMentor();
                Auth.isLoggedInAsync(function (loggedIn) {
                    if (next.authenticate && !loggedIn) {
                        event.preventDefault();
                        $location.path('/login');
                    } else {
                        if ($cookieStore.get('token')) {
                            if ($location.path().indexOf('/login') !== -1) {
                                event.preventDefault();
                                $location.path('/student-profile/personal');
                            }
                        }
                    }
                });
            });
        });

function activeMenu($rootScope, $location) {
    var path = $location.path();

    // switch (path) {
    //     case "/mentor-profile":

    //         break;
    //     case "/mentor-profile/personal":
    //         $rootScope.isMenuActived = 2;
    //         break;
    //     case "/mentor-profile/my-sessions":
    //         $rootScope.isMenuActived = 4;
    //         break;
    //     case "/my-sessions":
    //         $rootScope.title = "My Ongoing Programs";
    //         $rootScope.isMenuActived = 4;
    //         break;
    //     case "/session/:sessionId":
    //         $rootScope.title = "My Ongoing Programs";
    //         break;
    //     case "/student-profile":
    //         $rootScope.title = "My Profile";
    //         break;
    //     case "/student-profile/personal":
    //         $rootScope.title = "Personal information";

    //         break;
    //     case "/student-profile/academic":
    //         $rootScope.title = "Academic information";

    //         break;
    //     case "/student-profile/extra":
    //         $rootScope.title = "Extra information";

    //         break;
    //     case "/student-profile/parent":
    //         $rootScope.title = "Parent information";

    //         break;
    //     case "/student-profile/change-password":
    //         $rootScope.title = "Change password";

    //         break;
    //     case "/schedule-a-session":
    //         $rootScope.title = "Schedule a new program";

    //         break;
    //     case "/mentor/availability":
    //         $rootScope.title = "Mentor availability";
    //         $rootScope.isMenuActived = 3;
    //         break;
    //     case "/mentor/dashboard":
    //         $rootScope.title = "Mentor Dashboard";

    //         break;
    //     case "/student/dashboard":
    //         $rootScope.title = "My Progress";
    // }

}
// $( "body" ).delegate( "ul.select2-choices", "click", function() {
//   $(this).find("input").focus();
// });
jQuery(document).ready(function() {    
   // Metronic.init(); // init layout 
   Layout.init(); // init layout 
   // Demo.init(); // init layout 
});