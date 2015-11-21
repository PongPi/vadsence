'use strict';

angular.module('vadsenceNodeApp')
  .controller('DashboardCtrl', function ($scope, Auth) {
        $scope.isLoggedIn = Auth.isLoggedIn;
        //DTOptionsBuilder, DTColumnBuilder
		// $scope.dtOptions={
  //           "bStateSave": true,
  //           "lengthMenu": [
  //               [10, 20, 50, 100, 150, -1],
  //               [10, 20, 50, 100, 150, "All"]
  //           ],
  //           "pageLength": 10,
  //           "ajax": {
  //               "url": "/api/sessions", // ajax source
  //           },
  //           "order": [
  //               [0, "asc"]
  //           ] 
  //       }
  //       $scope.dtColumns=[
	 //        DTColumnBuilder.newColumn(null).withTitle('#').renderWith(function(data, type, full, meta) {
	 //        	return meta.row +1 ;
	 //        	// console.log('newColumn', data, type, full, meta.row)
	 //        }),
	 //        DTColumnBuilder.newColumn('name').withTitle('Name'),
	 //        DTColumnBuilder.newColumn('fee_normal').withTitle('Fee Normal'),
	 //        DTColumnBuilder.newColumn('fee_special').withTitle('Fee Purchase Additional'),
	 //        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
  //           .renderWith(function(data, type, full, meta) {
  //               return '<button class="btn btn-warning" ng-click="editFee(' + data._id + ')">' +
  //                   '   <i class="fa fa-edit"></i>' +
  //                   '</button>&nbsp;';
  //           });
  //       ];
});
