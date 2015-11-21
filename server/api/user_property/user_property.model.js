'use strict';

var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var User = require('../user/user.model');
var findOrCreate = require('mongoose-findorcreate');
var _ = require('lodash');

var UserPropertySchema = new Schema({
  user_id: {type: Schema.Types.ObjectId , ref: 'User'},
  key: String,
  value: Schema.Types.Mixed
});

UserPropertySchema.plugin(timestamps);
UserPropertySchema.plugin(findOrCreate);

UserPropertySchema.index({
	user_id: 1,
	key: 1
}, {
	unique: true
});
UserPropertySchema.statics.updateUserProperties = function(user_id, callback) {
    var self = this;
    if(user_id){
        if (callback && typeof(callback) === "function") {
                            callback(true,false);
                    }
    }
    self.find({user_id : user_id}, function (err, userproperties) {
        if(!err){
            var new_user_properties =  _.pluck(userproperties, '_id');
            var User = require('../user/user.model');
            User.update({ _id: user_id }, { $set: { user_properties: new_user_properties }}, function (err, user) {
              if (err){
                    if (callback && typeof(callback) === "function") {
                            callback(true,false);
                    }
                }
                if (callback && typeof(callback) === "function") {
                    callback(false,true);
                }
            });

        }
    })
}


        

module.exports = mongoose.model('UserProperty', UserPropertySchema);
