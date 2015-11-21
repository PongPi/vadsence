'use strict';

angular.module('vadsenceNodeApp')
  .factory('BookedSessionProperty', function ($resource) {
    return $resource('/api/booked_session_properties/:id/:controller', {
      id: '@_id'
    },
    {

      });
  });
