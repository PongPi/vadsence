'use strict';
angular.module('vadsenceNodeApp').filter('nameView', function() {
    
    return function(input) {
    	if(_.has(input,'first_name') && _.has(input,'last_name')){
        	return _.capitalize(input.first_name + ' ' + input.last_name[0]+'.');
    	}else{
        	return "";
        }
    }

});

