'use strict';
angular.module('vadsenceNodeApp').filter('property', function() {
    var list = [
            {type: 'year-in-college', key : "Freshman", value:  'Freshman'},
            {type: 'year-in-college', key : "Sophmore", value:  'Sophmore'}, 
            {type: 'year-in-college', key : "Junior", value:  'Junior'},
            {type: 'year-in-college', key : "Senior", value:  'Senior'},
            {type: 'year-in-college', key : "Alumni", value:  'Alumni'},
            
        ];
    return function(input) {
        var filter = _.filter(list, function (item) {
            //console.log(item)
            return item.type === input
        });
        return filter;

    }

});
