'use strict';

angular.module('vadsenceNodeApp')
  .factory('BookedPrograms', function ($resource) {
    return $resource('/api/booked_programs/:id', {
      id: '@_id'
    },
    {
      get: {
        method: 'GET',
        params: {
        //   id:'me'
        }
      }

	  });
  });
