'use strict';

angular.module('vadsenceNodeApp')
  .factory('BookedSession', function ($resource) {
    return $resource('/api/booked_sessions/:id/:controller', {
      id: '@_id'
    },
    {
      updateDocument: {
        method: 'PUT',
        params: {
          controller:'document'
        }
      },      
      updateCompleted: {
        method: 'PUT',
        params: {
          controller:'completed'
        }
      },      
      update: {
        method: 'PUT' // this method issues a PUT request
      }
	  });
  });
