'use strict';
angular.module('vadsenceNodeApp').filter('timezone', function() {
    var list = [
            "Asia/Shanghai",
            "America/New_York",
            "US/Pacific",
            "Europe/London",
        ];
    return list;

});

