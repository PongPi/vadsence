'use strict';

angular.module('vadsenceNodeApp').filter('range', function() {
	return function(input, info) {
		if (!isNaN(parseFloat(info)) && isFinite(info)) {
			var total = info;
		}
		else {
			var total = info.total || 0;
			var step = info.step || 1;
			var startAt = info.startAt || 1;	
		}
		
		total = parseInt(total);
		for (var i = startAt; i <= total; i = i + step) {
			input.push(i);
		}
		return input;
	};
});
