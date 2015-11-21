'use strict';

angular.module('vadsenceNodeApp')
  .factory('Mentor', function ($resource) {
    return $resource('/api/mentors/:id/:controller', {
      id: '@_id'
    },
    {
      // changePassword: {
      //   method: 'PUT',
      //   params: {
      //     controller:'password'
      //   }
      // },
      changePersonal: {
        method: 'PUT',
        params: {
          controller:'personal'
        }
      },
      changeProgram: {
        method: 'PUT',
        params: {
          controller:'program'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
