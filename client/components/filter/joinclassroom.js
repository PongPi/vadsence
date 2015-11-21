'use strict';
angular.module('vadsenceNodeApp').filter('joinClassroom', function() {
    return function(start_time, time_zone) {

        if (!start_time) return false;
        var now = moment.tz(new Date(), time_zone).format();

        //var date_current = moment.tz(start_time, time_zone).format();

        var date_start = moment.tz(start_time, time_zone).subtract({'minute': 15}).format();

        var date_end = moment.tz(start_time, time_zone).add({'minute':60}).format();

        //console.log('joinClassroom', date_current, now, date_start, date_end);

        if(now < date_start || now  > date_end){
        	return false;
        }else{
        	return true;
        }

        

    }

});