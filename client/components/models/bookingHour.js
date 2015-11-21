'use strict';

angular.module('vadsenceNodeApp')
  .factory('BookingHour', function ($resource) {
    return $resource('/api/booking_hours/:id', {
      id: '@_id'
    },
    {
      // update: {
      //   method: 'PUT',
      //  params: {
      //     //controller:'password'
      //   }
      // },
      createList: {
        method: 'POST',
        params: {
          id: 'list'
        }
      }
	  });
  });
