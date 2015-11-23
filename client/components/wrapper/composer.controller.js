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
        if(_.size($scope.user) === 0){
            swal("Lỗi!", "Bạn vui lòng đăng nhập trước khi đăng bài!", "error");
            return;
        }
        if (form.$valid && 
                (_.has($scope.picture,'url') && $scope.picture.url.length > 0)
            ) {
            Article.save({
              content: $scope.picture.content,
              url: $scope.picture.url,
              author: $scope.user._id,
              category: 'picture'
            },
                function(data) {

                    console.log('ComposerCtrl',data);
                },
                function(err) {
                    swal("Lỗi!", "Something went wrong. Please try again.", "error");
                });
        }else{
            swal("Lỗi!", "Bạn vui lòng nhập đầy đủ dữ liệu trước khi đăng bài!", "error");
        }
    }    
    $scope.video_save = function (form) {
        console.log('ComposerCtrl $scope.user',_.size($scope.user),_.size($scope.video));
        if(_.size($scope.user) === 0){
            swal("Lỗi!", "Bạn vui lòng đăng nhập trước khi đăng bài!", "error");
            return;
        }
        if (form.$valid) {
            Article.save({
              content: $scope.video.content,
              url: $scope.video.url,
              author: $scope.user._id,
              category: 'video'
            },
                function(data) {
                    console.log('ComposerCtrl',data);
                },
                function(err) {
                    swal("Lỗi!", "Something went wrong. Please try again.", "error");
                });
        }else{
            swal("Lỗi!", "Bạn vui lòng nhập đầy đủ dữ liệu trước khi đăng bài!", "error");
        }
    }
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
            if(_.has(data,'message') && data.message == "Unauthorized"){
                swal("Lỗi!", "Bạn vui lòng đăng nhập trước khi đăng bài!", "error");
            }else{
                swal("Lỗi!", "Something went wrong. Please try again.", "error");
            }
            //console.log('ComposerCtrl upload error', data)
            $('#timeline-picture-upload i').replaceWith('<i >Chọn ảnh</i>');
            $('#timeline-picture-upload').prop('disabled', false);
        });

        

    };
});
