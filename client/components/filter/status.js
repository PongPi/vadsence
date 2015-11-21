'use strict';
angular.module('vadsenceNodeApp').filter('status', function() {
    var list = [
            {type: 'BookedProgram', status : false, value:  'Ongoing'},
            {type: 'BookedProgram', status : true, value:  'Completed'},

            {type: 'BookedSession', status : 0, value:  'Scheduled'},
            
            {type: 'BookedSession', status : 1, value:  'Pending – On time'},

            {type: 'BookedSession', status : 2, value:  'Pending – Student late'},
            {type: 'BookedSession', status : 3, value:  'Pending – Tutor late'},
            {type: 'BookedSession', status : 4, value:  'Pending – Both late'},

            {type: 'BookedSession', status : 5, value:  'Completed'},

            {type: 'BookedSession', status : 6, value:  'Student missed'},
            {type: 'BookedSession', status : 7, value:  'Mentor missed'},
            {type: 'BookedSession', status : 8, value:  'Missed'},

            {type: 'BookedSession', status : 9,  value:  'Student cancelled'},
            {type: 'BookedSession', status : 10, value:  'Tutor cancelled'},            
            {type: 'BookedSession', status : 11, value:  'Cancelled'},

            {type: 'BookedSessionDraft', status : 0, value:  'Pending'},
            {type: 'BookedSessionDraft', status : 1, value:  'Submitted'},
            {type: 'BookedSessionDraft', status : 2, value:  'Pending Grammar house'},
            {type: 'BookedSessionDraft', status : 3, value:  'Pending tutor'},
            {type: 'BookedSessionDraft', status : 4, value:  'Mark up completed'},
            {type: 'BookedSessionDraft', status : 5, value:  'Not submitted'},
            {type: 'BookedSessionDraft', status : 6, value:  'Submitted late'},

            {type: 'account_status_fe', status : 0, value:  'Profile not complete​'},
            {type: 'account_status_fe', status : 1, value:  'Waitlisted​'},
            {type: 'account_status_fe', status : 2, value:  'Waitlisted​'},
            {type: 'account_status_fe', status : 3, value:  'Waitlisted​'},
            {type: 'account_status_fe', status : 4, value:  'Step 1​'},

            {type: 'account_status_be', status : 0, value:  'Incomplete profile​'},
            {type: 'account_status_be', status : 1, value:  'Not yet reviewed​'},
            {type: 'account_status_be', status : 2, value:  'Rejected​'},
            {type: 'account_status_be', status : 3, value:  'Approved​'},
            {type: 'account_status_be', status : 4, value:  'Ready​'},

        ];
    return function(input, type) {
        var filter = _.filter(list, function (item) {
            return item.type === type && item.status === input
        });
        return (filter[0]) ? filter[0].value : '';

    }

});

