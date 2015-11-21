'use strict';
angular.module('vadsenceNodeApp').filter('datetimezoneview', function() {
    return function(input, time_zone, type) {
		//var full = moment.tz(input, time_zone).format();
		var view = moment.tz(input, time_zone).format(type);
		//console.log('datetimezoneview',input, time_zone, type, full,view);
        return view;

    }

});

