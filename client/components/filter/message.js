'use strict';
angular.module('vadsenceNodeApp').filter('message', function() {
    var list = [
            {type: 'account_status', status : 0, value:  '​Please complete your profile so we can begin matching you to our elite mentors.'},
            {type: 'account_status', status : 1, value:  'You have completed your profile!​ Due to high volumes, there is currently a waitlist. We will reach out to you as soon as your spot is available. Please reach us at QQ 2868080059 if you have any questions.​ In the meantime, please check out our resources page for more information.​'},
            {type: 'account_status', status : 2, value:  'You have completed your profile!​ Due to high volumes, there is currently a waitlist. We will reach out to you as soon as your spot is available. Please reach us at QQ 2868080059 if you have any questions.​ In the meantime, please check out our resources page for more information.​'},
            {type: 'account_status', status : 3, value:  'You have completed your profile!​ Due to high volumes, there is currently a waitlist. We will reach out to you as soon as your spot is available. Please reach us at QQ 2868080059 if you have any questions.​ In the meantime, please check out our resources page for more information.​'},
        ];
    return function(input, type) {
        var filter = _.filter(list, function (item) {
            return item.type === type && item.status === input
        });
        return (filter[0]) ? filter[0].value : '';

    }

});

