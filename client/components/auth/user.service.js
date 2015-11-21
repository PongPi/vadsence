'use strict';

angular.module('vadsenceNodeApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      checkToDoList: {
        method: 'GET',
        params: {
          controller:'checkToDoList',
          id:'me'
        }
      },
      studentTrigger: {
        method: 'GET',
        params: {
          controller:'studenttrigger',
          id:'me'
        }
      },
      view: {
        method: 'GET',
        params: {
          controller:'view', 
        }
      }
	  });
  });
