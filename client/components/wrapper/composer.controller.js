'use strict';

angular.module('vadsenceNodeApp')
    .controller('ComposerCtrl', function($scope, $rootScope, $location, 
        Auth, Article, Upload) {
        
    $scope.picture = {};
    $scope.video = {};
    $scope.user = {};
    Auth.getUser(function (error,currentUser) {
        if(error){

        }
        console.log('ComposerCtrl',error,currentUser)
        $scope.user = currentUser;
    });
    $scope.picture_save = function (form) {
        console.log('ComposerCtrl',form);
        if (form.$valid) {
            Article.save({
              content: $scope.picture.content,
              url: $scope.picture.url,
              author: $scope.user._id,
              category: 'picture'
            },
                function(data) {
                    // $cookieStore.put('token', data.token);
                    // $cookieStore.put('isMentor', data.type == 'mentor');
                    // $cookieStore.put('isStudent', data.type == 'student');
                    // $cookieStore.put('isActivation', data.activation);
                    // currentUser = User.get();
                    // return cb(user);
                    console.log('ComposerCtrl',data);
                },
                function(err) {
                    console.log('ComposerCtrl',err);
                    // this.logout();
                    // return cb(err);
                });
        }
    }    
    $scope.video_save = function (form) {
        console.log('ComposerCtrl',form);
        if (form.$valid) {
            Article.save({
              content: $scope.video.content,
              url: $scope.video.url,
              author: $scope.user._id,
              category: 'video'
            },
                function(data) {
                    // $cookieStore.put('token', data.token);
                    // $cookieStore.put('isMentor', data.type == 'mentor');
                    // $cookieStore.put('isStudent', data.type == 'student');
                    // $cookieStore.put('isActivation', data.activation);
                    // currentUser = User.get();
                    // return cb(user);
                    console.log('ComposerCtrl',data);
                },
                function(err) {
                    console.log('ComposerCtrl',err);
                    // this.logout();
                    // return cb(err);
                });
        }
    }
    // upload later on form submit or something similar
    // $scope.submit = function() {
    //     $scope.upload($scope.file);
    // };
    $scope.file = {};
    $scope.$watch('file.picture', function(old, new_file) {
        console.log('ComposerCtrl file', $scope.file)
        if ($scope.file.picture && !$scope.file.picture.$error) {
            $scope.upload($scope.file.picture);
        }
    },true);
    // upload on file select or drop
    $scope.upload = function(file) {
        $('#timeline-picture-upload i').replaceWith('<i >Đang Upload...</i>');
            $('#timeline-picture-upload').prop('disabled', true);

        Upload.upload({
            url: 'upload/file',
            file: file
        }).success(function(data, status, headers, config) {
            $('#timeline-picture-upload i').replaceWith('<i >Chọn ảnh</i>');
            $('#timeline-picture-upload').prop('disabled', false);
            console.log('ComposerCtrl upload', data)
            $scope.picture.url = data.file_path;
            swal("Document uploaded", "", "success");
        }).error(function(data, status, headers, config) {
            $('#timeline-picture-upload i').replaceWith('<i >Chọn ảnh</i>');
            $('#timeline-picture-upload').prop('disabled', false);
            // Helper.displayMessage('danger', 'Something went wrong');
            swal("Error!", "Something went wrong. Please try again.", "error");
        });

        

    };
});
