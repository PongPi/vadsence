'use strict';

angular.module('vadsenceNodeApp')
  .factory('ProgramCategory', function ($resource) {
    return $resource('/api/program_categories/:id', {
      id: '@_id'
    },
    {
	  });
  });
