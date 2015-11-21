'use strict';

angular.module('vadsenceNodeApp')
  .factory('Country', function ($resource) {
    return $resource('/api/countries/:id', {
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
