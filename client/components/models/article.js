'use strict';

angular.module('vadsenceNodeApp')
  .factory('Article', function ($resource) {
    return $resource('/api/articles/:id/:controller', {
      id: '@_id'
    },
    {
      // changePersonal: {
      //   method: 'PUT',
      //   params: {
      //     controller:'personal'
      //   }
      // },
      // changeProgram: {
      //   method: 'PUT',
      //   params: {
      //     controller:'program'
      //   }
      // },
      // get: {
      //   method: 'GET',
      //   params: {
      //     id:'me'
      //   }
      // }
	  });
  });
