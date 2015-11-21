'use strict';

angular.module('vadsenceNodeApp')
	.controller('TestUploadCtrl', function($scope,Upload,Helper) {
		Helper.init();

		// upload later on form submit or something similar
		$scope.submit = function() {
			$scope.upload($scope.file);
		};
		$scope.$watch('file', function() {
			if ($scope.file && !$scope.file.$error) {
				$scope.upload($scope.file);
			}
		})
		// upload on file select or drop
		$scope.upload = function(file) {
			Upload.upload({
				url: 'upload/file',
				file: file
			});
		};
	});
