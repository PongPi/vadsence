'use strict';

angular.module('vadsenceNodeApp')
  .factory('Program', function ($resource) {
    return $resource('/api/programs/:id', {
      id: '@_id'
    });
  });
