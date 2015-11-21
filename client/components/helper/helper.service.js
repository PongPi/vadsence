'use strict';

angular.module('vadsenceNodeApp').factory('Helper', function Helper($location, $rootScope) {
	return {
		init: function() {
			$rootScope.isDisplayMessage = false;
		},

		// Display messsage, error, ...
		// Using:
		//      - displayMessage('success', 'Some bla ....')
		//      - displayMessage(false) to hide message
		displayMessage: function(status, message,heading) {
			$rootScope.isDisplayMessage = false;
			var h;
			if (!status) {
				return;
			}
			if(heading != undefined)
			{
				h = heading;
			}
			else
			{
				h = status;
			}
			if(status == "danger"){
				swal("Error!", message, "error");
			}else{
				swal(h, message, status);
			}
			// $rootScope.isDisplayMessage = true;
			// $rootScope.messageClass = 'alert alert-' + status;
			// $rootScope.messageText = message;
		},
	};
});
