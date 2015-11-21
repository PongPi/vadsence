'use strict';

angular.module('vadsenceNodeApp')
  .factory('TimeZone', function ($resource) {
    return $resource('/api/time_zones/:id', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT',
       params: {
          //controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
        //   id:'me'
        }
      }
	  });
  });
