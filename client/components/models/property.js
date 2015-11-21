'use strict';

angular.module('vadsenceNodeApp')
  .factory('Property', function ($resource) {
    return $resource('/api/properties/:type/:key/:controller', {
      type: '@_type'
    },
    {
      country: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'country',
          key:'all'
        }
      },
      timezone: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'timezone',
          key:'all'
        }
      },
      province: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'province',
        }
      },
      major: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'major',
          key:'all'
        }
      },
      area: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'area',
          key:'all'
        }
      },
      university: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'university',
          key:'all'
        }
      },
      strength: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'primary_strength',
          key:'all'
        }
      },
      accent: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'accent',
          key:'all'
        }
      },
      mandarin: {
        method: 'GET',
        params: {
          controller:'property',
          type: 'mandarin',
          key:'all'
        }
      }
	  });
  });
