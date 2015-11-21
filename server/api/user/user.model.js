'use strict';

var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var UserProperty = require('../user_property/user_property.model');
var Program = require('../program/program.model');
var BookingHour = require('../booking_hour/booking_hour.model');
var ToDoList = require('../to_do_list/to_do_list.model');
var momentTimezone = require('moment-timezone');
var BookedSession = require('../booked_session/booked_session.model');
var BookedProgram = require('../booked_program/booked_program.model');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var config = require('../../config/environment');

var _ = require('lodash');

var UserSchema = new Schema({
	name: String, // English name
	email: {
		type: String,
		lowercase: true
	},
	role: {
		type: String,
		default: 'user'
	},
	hashedPassword: String,
	provider: String,
	salt: String,
	facebook: {},
	twitter: {},
	google: {},
	github: {},

	// Addition ======
	program_ids: [{type: Schema.Types.ObjectId, ref: "Program"}],
	user_properties: [{ type: Schema.Types.ObjectId, ref: 'UserProperty' }],
	properties: Schema.Types.Mixed,
	first_name: String,
	last_name: String,
	day_of_birth: Date,
	gender: String,
	type: String,
	country: String,
	province: String,
	city: String,
	time_zone: String,
	status: { type: Number, default: 0 },
	activation_key: String,
	deleted: {
		type: String,
		default: 0
	},
	withdrawal_amount: {type: Number, default: 0},
	//Pong Pi Add
	to_do_list_ids: [{ type: Schema.Types.ObjectId, ref: 'ToDoList' }],
	activation: { type: Boolean, default: false },
	code: String,
	suspended: { type: Boolean, default: false },
});
UserSchema.index({ email:1 }, { unique: true });
UserSchema.index({ code:1 }, { unique: true });
UserSchema.plugin(timestamps);

/**
 * Virtuals
 */
UserSchema
	.virtual('password')
	.set(function(password) {
		this._password = password;
		this.salt = this.makeSalt();
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._password;
	});

// Public profile information
UserSchema
	.virtual('profile')
	.get(function() {
		return {
			'name': this.name,
			'role': this.role
		};
	});

// Non-sensitive info we'll be putting in the token
UserSchema
	.virtual('token')
	.get(function() {
		return {
			'_id': this._id,
			'role': this.role
		};
	});

/**
 * Validations
 */

// Validate empty email
UserSchema
	.path('email')
	.validate(function(email) {
		if (authTypes.indexOf(this.provider) !== -1) return true;
		return email.length;
	}, 'Email cannot be blank');

// Validate empty password
UserSchema
	.path('hashedPassword')
	.validate(function(hashedPassword) {
		if (authTypes.indexOf(this.provider) !== -1) return true;
		return hashedPassword.length;
	}, 'Password cannot be blank');

// Validate email is not taken
UserSchema
	.path('email')
	.validate(function(value, respond) {
		var self = this;
		this.constructor.findOne({
			email: value
		}, function(err, user) {
			if (err) throw err;
			if (user) {
				if (self.id === user.id) return respond(true);
				return respond(false);
			}
			respond(true);
		});
	}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
	return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
	.pre('save', function(next) {
		if (!this.isNew) return next();

		if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
			next(new Error('Invalid password'));
		else
			next();
	});

/**
 * Methods
 */
UserSchema.methods = {
	/**
	 * Authenticate - check if the passwords are the same
	 *
	 * @param {String} plainText
	 * @return {Boolean}
	 * @api public
	 */
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashedPassword;
	},

	/**
	 * Make salt
	 *
	 * @return {String}
	 * @api public
	 */
	makeSalt: function() {
		return crypto.randomBytes(16).toString('base64');
	},

	/**
	 * Encrypt password
	 *
	 * @param {String} password
	 * @return {String}
	 * @api public
	 */
	encryptPassword: function(password) {
		if (!password || !this.salt) return '';
		var salt = new Buffer(this.salt, 'base64');
		return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
	},
	/**
	 * update property
	 * update user_properties form UserProperty Model
	 *
	 *
	 * @api public
	 */
	updateProperty: function() {
		//console.log('updateProperty start');
		var _this = this;
		UserProperty.find({user_id : _this._id}, function (err, userproperties) {
			if(!err){
				var new_user_properties =  _.pluck(userproperties, '_id');
				_this.constructor.findById(_this._id, function (err, user) {
					if(user){
						var updated = _.merge(user, { user_properties: new_user_properties });
						updated.save(function (err) {
						 // console.log('updateProperty updated err', err);
						});
					}
				});

			}
		})
	}
};

// check if current user available section in 7 day
UserSchema.methods.AvailableIn7DayCounter = function(callback){
	var BookingHour = require('../booking_hour/booking_hour.model');
	var self = this;
	var today = new Date(momentTimezone().format("YYYY-MM-DD 00:00:00"));
	var nextweekday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

	BookingHour.aggregate([
			{ "$match": {
					date: { "$gt": today , "$lte": nextweekday },
					mentor_id: self._id,
					$or: [{booked: false}, {book: null}]
			}},
			{ "$group": {
					"_id": "$mentor_id",
					"available_hrs": { "$sum": 1 }
			}},
			{ "$match": {
					available_hrs: {"$gte": 1}
			}}
	], function(err, result) {
			if (result.length > 0) {
				callback(err, result[0]);
			} else {
				callback(err, null);
			}
	} );

}

UserSchema.methods.income = function(callback) {
	if (this.role != 'mentor') { return callback("You can not view this mentor income section."); }
	var self = this;
	console.log('=================');
	var session_normal_price = 40;
	var referer_bonus_price = 10;
	var penalty_price = 60;
	var query = {mentor_id : this._id};
	var upcoming_list = {advisory_session: {fee: 40, counter: 0}, editting_session: {fee: 50, counter: 0}, referer_bonus: {fee: 10, counter: 0}};
	var historical_list = {advisory_session: {fee: 40, counter: 0}, editting_session: {fee: 50, counter: 0}, referer_bonus: {fee: 10, counter: 0}, penalty: {fee: 60, counter: 0}};
	BookedSession.find(query).populate('booking_hour_id').populate('booked_program_id').exec(function(err, result){

		for (var i=0; i< result.length; i++){
			var session = result[i];
			session.checkStatus({
	            time_zone_current: self.time_zone,
	            time_zone_view : self.time_zone
	        });
			console.log(session.draft_status);
			console.log(session.status);
			// console.log(session.booked_program_id);
			console.log('========');
			if (session.status == 0 || session.status == 1 || session.status == 2 || session.status == 3 || session.status == 4) {
				if (session.name == 'Essay Editing' || session.name == 'Resume Editing') {
					upcoming_list.editting_session.counter += 1;
				} else {
					upcoming_list.advisory_session.counter += 1;
				}
				if (session.booking_hour_id.use_mentor_code && session.booked_program_id.use_mentor_code != "") {
					upcoming_list.referer_bonus.counter += 1;
				}
			}
			else if (session.status == 7 || session.status == 8 || session.status == 5) {
				console.log(session.status);
				if (session.status == 7 || session.status == 8) {
					historical_list.penalty.counter += 1;
				}
				else {
					console.log("*******");
					if (session.name == 'Essay Editing' || session.name == 'Resume Editing') {
						historical_list.editting_session.counter += 1;
					} else {
						historical_list.advisory_session.counter += 1;
					}
					if (session.booking_hour_id.use_mentor_code && session.booking_hour_id.use_mentor_code != "") {
						historical_list.referer_bonus.counter += 1;
					}
				}
			}
		}
		callback(err,upcoming_list, historical_list);
	});

}

UserSchema.methods.total_income = function(historical_list) {
	var income = (historical_list.advisory_session.counter * historical_list.advisory_session.fee)
							+ (historical_list.editting_session.counter * historical_list.editting_session.fee)
							+ (historical_list.referer_bonus.counter * historical_list.referer_bonus.fee)
							- (historical_list.penalty.counter * historical_list.penalty.fee);
	return income;
}

UserSchema.methods.DateAvailable = function(callback) {
	var BookingHour = require('../booking_hour/booking_hour.model');
	var self = this;
	var moment_today = momentTimezone().tz(this.time_zone);
	var today = new Date();
	var tomorow = new Date(today.getTime() + 0 * 60 * 60 * 1000);
	// var tomorow_end_date = new Date(today.getTime() + 23 * 60 * 60 * 1000);
	// var nextweekday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

	BookingHour.aggregate([
			{ "$match": {
					$and:[
						// {$or: [
						//
						// 	{date: { "$gte":tomorow_begin_date, "$lte": tomorow_end_date}, booked: {"$ne": true} } ]
						// },
						{date: { "$gte": tomorow }, booked: {"$ne": true} },
						{mentor_id: self._id}
					],


			}},
			{ "$group": {
					"_id": "$date",
			}}
	], function(err, result) {
				var date_arr =_.map(result, function (key) { return momentTimezone(key._id); });
				callback(err, date_arr);
	} );

}


// user todo list
UserSchema.methods.mentor_todo_list = function(callback) {
	var self = this;
	var ret = [];
	self.isMentorProfileCompleted(function(err, result){
		if (err) { console.log('========', err, '========'); return callback(err); }
		if (result == false) { ret.push("Please complete your profile and provide available slots within the next 7 days to begin tutoring."); }
		self.isPaypalEmailCompleted(function(err, result){
			if (err) { console.log('========', err, '========'); return callback(err); }
			if (result == false) { ret.push("Please provide a Paypal email"); }
			self.isAvailable2StotIn7Day(function(err,result){
				if (err) { console.log('========', err, '========'); return callback(err); }
				if (result == false) { ret.push("Students are waiting for you! Please update your slot availability."); }
				self.isSubmitMarkUpPending(function(err,result){
					if (err) { console.log('========', err, '========'); return callback(err); }
					if (result == false) { ret.push("Draft ready for your review. Please submit mark up at least 12 hours before the editing session."); }
					self.isBookedSessionPending(function(err,result){
						if (err) { console.log('========', err, '========'); return callback(err); }
						if (result == false) { ret.push("Please complete your session report immediately in order to receive payment."); }
						return callback(err, ret);
					});

				});

			});

		});

	});
};

UserSchema.methods.isMentorProfileCompleted = function(callback){
	var self = this;
	var check_attrs = ["first_name", "last_name", "country", "day_of_birth", "time_zone"];
	var check_prop_attrs = ["major_area", "short_introduction", "clubs_activities"];

	for (var i = 0; i < check_attrs.length; i++) {
		if (self[check_attrs[i]] == "" || self[check_attrs[i]] == null) {
			return callback(null, false);
		}
	}

	UserProperty.find({ user_id: self._id }, function(err, prop) {
		if (err) { console.log('========', err, '========'); return callback(err); }
		var properties = _.object(_.pluck(prop, 'key'), _.pluck(prop, 'value'));

		for (var i = 0; i < check_prop_attrs.length; i++) {
			if (properties[check_prop_attrs[i]] == "" || properties[check_prop_attrs[i]] == null) {
				return callback(null, false);
			}
		}
		self.AvailableIn7DayCounter(function(err, data){
			if (!data || data.available_hrs == 0) {
				return callback(null, false);
			} else {
				return callback(null, true);
			}
		})

	});
}


UserSchema.methods.isPaypalEmailCompleted = function(callback) {
	UserProperty.findOne({ user_id: this._id, key: "paypal_email"}, function(err, prop) {
		if (err) {
//			console.log('========', err, '========');
			return callback(err); }
		if (!prop || prop.value == null || prop.value == "") {
			return callback(err,false);
		} else {
			return callback(err, true);
		}
	});
}

UserSchema.methods.isAvailable2StotIn7Day = function(callback) {
	this.AvailableIn7DayCounter(function(err, data){
//		console.log(err,data, '==============');
		if (err) {
//			console.log('========', err, '========');
			return callback(err, false); }

		if (!data || data.available_hrs <= 2 ) {
			return callback(null, false);
		} else {
			return callback(null, true);
		}
	})
}

UserSchema.methods.isSubmitMarkUpPending = function(callback) {
	var self = this;
	var BookedProgram = require('../booked_program/booked_program.model');
	BookedProgram.find({mentor_id: self._id, enable: true}, "_id", function(err, booked_pr_list){
		var booked_pr_ids = _.map(booked_pr_list, function (key) { return mongoose.Types.ObjectId(key._id); });
		BookedSession.find({booked_program_id: {$in: booked_pr_ids},  draft_status: 3}, function(err, data){
			if (err) {
				//console.log('========', err, '========');
				return callback(err, false); }
			if (data.length > 0) {
				return callback(null, false);
			} else {
				return callback(null, true);
			}
		});
	});
}

UserSchema.methods.isBookedSessionPending = function(callback) {
	var self = this;
	var BookedProgram = require('../booked_program/booked_program.model');
	BookedProgram.find({mentor_id: self._id, enable: true}, "_id", function(err, booked_pr_list){
		var booked_pr_ids = _.map(booked_pr_list, function (key) { return mongoose.Types.ObjectId(key._id); });
		BookedSession.find({booked_program_id: {$in: booked_pr_ids},  status: 1}, function(err, data){
			if (err) {
				//console.log('========', err, '========');
				return callback(err, false); }
			if (data.length > 0) {
				return callback(null, false);
			} else {
				return callback(null, true);
			}
		});
	});
}

UserSchema.statics.mentorMapStudent = function(student_id, program, callback) {
		var self = this;
		var ret = [];

		this.findById(student_id).populate('user_properties').exec(function(err, student) {
				var student_properties = {};
				if(student.user_properties || {}){
					student_properties = _.object(_.pluck(student.user_properties, 'key'), _.pluck(student.user_properties, 'value'));
				}
				console.log('BEGIN -----------------------', student_properties.primary_strength, student_properties.first_strength);
				// find mentor with booking hour available and match program
				self.findAvaiMentorByProgram(program, function(err, mentor_ids){
						if (err) { return callback(err, []); }
						var temp_list = mentor_ids.slice(0);
						// find mentor map with student strengths
						console.log('Mentor with match program FOUND:', mentor_ids);
						if (student_properties.primary_strength && !student_properties.first_strength) {
								console.log("******* Student has only ONE strength ****** ==> 6 mentor with strength, 2 mentor with Area");
								// find mentor map with student on 1st strength
								self.mapStudentByStrength(student_properties.primary_strength, mentor_ids, 6,function(err, mentor_by_strength){
										if (err) { return callback(err, []); }
										// map mentor by area
										console.log('Mentor match with first Strength: ',mentor_by_strength);
										ret = mentor_by_strength;
										self.mapStudentByArea(student_properties.intended_major_area, temp_list, mentor_by_strength, function(err, mentor_ids_by_area){
											console.log('Mentor match with Area:', mentor_ids_by_area);
												if (err) { return callback(err, []); }
												callback(null, ret.concat(mentor_ids_by_area));
										});
								});
						}
						else if (student_properties.primary_strength && student_properties.first_strength) {
								console.log("******* Student has more than ONE strength ****** ==> 4 mentor with strength, 2 mentor with First Strength, 2 Mentor with Second Strength");
								// find mentor map with student on 1st strength
								self.mapStudentByStrength(student_properties.primary_strength, mentor_ids, 4,function(err, mentor_by_strength1){
										if (err) { return callback(err, []); }
										// find mentor map with student on 1st strength
										console.log('Mentor match with first Strength: ',mentor_by_strength1);
										ret = mentor_by_strength1;
										var filter_list1 = self.buildFilterList(mentor_ids, mentor_by_strength1);
										self.mapStudentByStrength(student_properties.first_strength, filter_list1, 2,function(err, mentor_by_strength2){
												if (err) { return callback(err, []); }
												// map mentor by area
												console.log('Mentor match with second Strength: ',mentor_by_strength2);
												ret = ret.concat(mentor_by_strength2);
												self.mapStudentByArea(student_properties.intended_major_area, temp_list, ret, function(err, mentor_ids_by_area){
														if (err) { return callback(err, []); }
														console.log('Mentor match with Area:', mentor_ids_by_area);
														callback(null,ret.concat(mentor_ids_by_area));
												});
										});
								});
						} else {
								console.log('Not strength match, find by area HERE -------------------------');
								self.mapStudentByArea(student_properties.intended_major_area, temp_list, [], function(err, mentor_ids_by_area){
										if (err) { return callback(err, []); }
										callback(null,ret.concat(mentor_ids_by_area));
								});
						}
				});

		});
}

UserSchema.statics.findAvaiMentorByProgram = function(program, callback) {
		var BookingHour = require('../booking_hour/booking_hour.model');
		var moment_today = momentTimezone();
		var today = new Date();
		var tomorow = new Date(today.getTime() + 0 * 60 * 60 * 1000);
		// var tomorow_end_date = new Date(today.getTime() + 47 * 60 * 60 * 1000);



		this.find({role: "mentor", program_ids: program._id},"_id", function(err, mentors) {

				if (err || !mentors) { return callback(err, []); }

				var mentor_ids = _.map(mentors, function (key) { return mongoose.Types.ObjectId(key._id); });
				//console.log(mentor_ids, '+++++++++');
				BookingHour.aggregate([
						{ "$match": {
								$and:[
									{ date: { "$gte": tomorow }, booked: {"$ne": true} },
									{ mentor_id: { $in: mentor_ids }}
								]
								// date: { "$gt": tomorow_begin_date },
								// mentor_id: { $in: mentor_ids },
								// $or: [{booked: false}, {booked: null}]
						}},
						{ "$group": {
								"_id": "$mentor_id",
								"available_hrs": { "$sum": 1 }
						}},
						{ "$match": {
								available_hrs: {"$gte": program.session_ids.length}
						}}
				], function(err, result) {
						if (err) { return callback(err, []); }
//						console.log(result, '**********');
						var mentor_ids = _.map(result, function (key) { return key._id });
						callback(null, mentor_ids);
				} );

		});
}

UserSchema.statics.mapStudentByStrength = function(student_strength, mentor_ids, threshold , callback) {
		var ret = [];
		var self = this;
		UserProperty.aggregate([
				{
						"$match": {
								user_id: {$in: mentor_ids},
								key: { $in: ['strength_1', 'strength_2'] },
								value: student_strength
						},
				},
				{
						"$group": {
								"_id": "$user_id"
						}

				}],
				function(err, prop){
						if (err) { return callback(err, []); }

						var mentor_by_strength = _.map(prop, function (key) { return key._id });
						console.log('Mentor with strength:',prop, ' / ', threshold);
						if (mentor_by_strength.length > threshold) {
								// find mentor available within 7 days
								self.mentorAvailableIn7Day(mentor_by_strength, function(err, mentor_ids_in_7day){
										if (err) { return callback(err, []); }
										console.log('Mentor avai in 7 day:', mentor_ids_in_7day);
										if (mentor_ids_in_7day.length > threshold) {
												// select randomly
												ret = self.selectRandom(mentor_ids_in_7day, threshold);
										} else if (mentor_ids_in_7day.length < threshold) {
												// populate mentor
												ret = self.populateMentor(mentor_ids, mentor_ids_in_7day, threshold);
										} else {
												ret = mentor_ids_in_7day;
										}
										return callback(null, ret);
								});
						} else if (mentor_by_strength.length < threshold) {
								ret = self.populateMentor(mentor_ids, mentor_by_strength, threshold);
								console.log('Not enough mentor, populate from match program list ==>', ret);
								return callback(null, ret);
						} else {
								console.log('Enough Mentor');
								ret = mentor_by_strength;
								return callback(null, ret);
						}

				}
		);



}

UserSchema.statics.mapStudentByArea = function(student_major, mentor_ids ,except_mentor_ids, callback){

		if (mentor_ids.length == 0) {
				return callback([]);
		}

		var self = this;
		var filter_list = self.buildFilterList(mentor_ids, except_mentor_ids);
		UserProperty.aggregate([
				{
						"$match": {
								user_id: {$in: filter_list},
								key: "major_area",
								value: student_major
						},
				},
				{
						"$group": {
								"_id": "$user_id"
						}

				}],
				function(err, prop){
						var mentor_ids_by_area = _.map(prop, function (key) { return key._id });
						if (mentor_ids_by_area.length > 2) {
								// select mentor available in 7 day
								self.mentorAvailableIn7Day(mentor_ids_by_area, function(err, mentor_ids_in_7day) {
										if (err) { return callback(err, []); }
										if (mentor_ids_in_7day.length > 2) {
												// select randomly
												var ret = self.selectRandom(mentor_ids_in_7day, 2);
												return callback(null, ret);
										} else if (mentor_ids_in_7day.length < 2) {
												// populate
												var ret = self.populateMentor(mentor_ids_by_area, mentor_ids_in_7day,2);
												return callback(null, ret);
										} else {
												return callback(null, mentor_ids_in_7day);
										}
								});
						} else if (mentor_ids_by_area.length < 2) {
								// populate from list
								var ret = self.populateMentor(filter_list, mentor_ids_by_area, 2);
								return callback(null, ret);
						} else {
								return callback(null, mentor_ids_by_area);
						}
				}
		);
}

UserSchema.statics.mentorAvailableIn7Day = function(mentor_ids, callback){
		var BookingHour = require('../booking_hour/booking_hour.model');
		var today = new Date(momentTimezone().format("YYYY-MM-DD 00:00:00"));
		var nextweekday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
		BookingHour.aggregate([
				{ "$match": {
						date: { "$gt": today , "$lte": nextweekday },
						mentor_id: { $in: mentor_ids },
						$or: [{booked: false}, {book: null}]
				}},
				{ "$group": {
						"_id": "$mentor_id",
						"available_hrs": { "$sum": 1 }
				}},
				{ "$match": {
						available_hrs: {"$gte": 1}
				}}
		], function(err, result) {
				if (err) { return callback(err, []); }
				var mentor_ids = _.map(result, function (key) { return key._id });
				return callback(err, mentor_ids);
		} );
}

UserSchema.statics.selectRandom = function(mentor_ids, minimum) {
		while (mentor_ids.length > minimum) {
				var remove_idx = this.getRandomInt(0,mentor_ids.length-1);
				mentor_ids.splice(remove_idx,1);
		}
		return mentor_ids;
}

UserSchema.statics.populateMentor = function(from_list, current_list, minimum) {
		while (current_list.length < minimum && from_list.length > 0) {
				var populate_idx = this.getRandomInt(0,from_list.length-1);
				current_list.push(from_list[populate_idx]);
				from_list.splice(populate_idx,1);
		}
		return current_list;
}

UserSchema.statics.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
}

UserSchema.statics.buildFilterList = function(allow_list, except_list) {
		var ret = [];
		var flag = true;
		for (var id=0; id< allow_list.length; id++) {
				flag = true;
				for (var id2=0; id2 < except_list.length; id2++) {
						if (allow_list[id].equals(except_list[id2])) {
								flag = false;
								break;
						}
				}
				if (flag) { ret.push(allow_list[id]) }
		}
		return ret;
}

UserSchema.methods.checkStudentTriggerToDoList = function(callback) {
    var self = this;
    var student_id = self._id;
    var time_zone = self.time_zone;

    var deep_populate = [
        'booked_session_ids',
        'booked_session_ids.booking_hour_id',
        'student_id',
        'mentor_id',
        'mentor_id.user_properties',
        'booked_session_ids.session_id',
        'booked_session_ids.session_id.session_properties',
        'booked_session_ids.booked_session_properties'
    ];
    var query = {student_id : student_id, enable: true};

    function join_list_array (list) {

    }
    var BookedProgram = require('../booked_program/booked_program.model');
    BookedProgram
        .find(query)
        .deepPopulate(deep_populate)
        .exec(function(err, booked_programs) {
        	for (var i = booked_programs.length - 1; i >= 0; i--) {
                booked_programs[i].establishment(booked_programs[i], time_zone);
            };

            var booked_session = _.compact(_.flatten(_.pluck(booked_programs, 'booked_session_ids'), true));
            var markup = _.filter(booked_session, function (session) {
            	return ((session.file_markup && session.file_markup.length > 0) && !_.has(session.properties, 'download_markup'));
            });

            var To_Do_List = [];
            if(markup.length > 0){
                To_Do_List.push('markup');
            }

            if(booked_programs.length === 0 && self.status === 4){
                To_Do_List.push('purchase');
            }

            var report = _.filter(booked_session, function (session) {
                return ((_.has(session.properties, 'session_completed') && session.properties.session_completed) && !_.has(session.properties, 'download_report'));
            });

            if(report.length > 0){
                To_Do_List.push('report');
            }

            var upcoming_session = _.compact(_.flatten(_.pluck(_.filter(booked_programs, function (programs) {
            	return programs.view_document;
            }), 'upcoming_session'), true));
            var draft = _.filter(upcoming_session, function (session) {
            	//console.log('draft',session.view_document, !_.has(session.properties, 'upload_draft'));
                return !_.has(session.properties, 'upload_draft') && session.view_document === true;
            });
            //console.log('checkStudentTriggerToDoList', draft.length);
            if(draft.length > 0){
                To_Do_List.push('draft');
            }

            var ToDoList = require('../to_do_list/to_do_list.model');

            ToDoList
				.find({key:{ $in: To_Do_List }, type: "student_trigger" })
				.exec(function(err_ToDoList, to_do_lists) {
					if(err_ToDoList) {
						callback(err_ToDoList, false);
					}
					if (to_do_lists.length === 0) {
						callback('Not Found', false);
					}else{
						callback(false, to_do_lists);
					}

				});
        });
}
UserSchema.statics.updateUserData = function(params, body, callback) {
	var self = this;

	// Just update these fields
	var updateFields = ['name', 'email', 'first_name', 'last_name', 'day_of_birth',
	'gender', 'country', 'province', 'city', 'time_zone', 'to_do_list', 'activation'];

	var updateData = {};
	for (var i in updateFields) {
		var field = updateFields[i];
		if (body[field]) updateData[field] = body[field];
	}

	if(_.has(body,'to_do_list')){
		find_to_do_list(body.to_do_list)
	}else{
		update_data_user();
	}
	function find_to_do_list (todolist_key) {
		ToDoList.findOne({key: todolist_key,type: "student"}, function (err, to_do_list) {
			if(to_do_list){
				update_data_user(to_do_list._id);
			}else{
				update_data_user();
			}
		});
	}
	function update_data_user (to_do_list) {

		self.findById(params.id, function(err, user) {
			if (err) {
				callback(err, false);
			}
			if (!user) {
				callback('Not Found', false);
			}
			if(to_do_list){
				// Remove duplicate and empty values;
				user.to_do_list_ids.push(to_do_list);
				user.to_do_list_ids = updateData.to_do_list_ids = _.uniq(_.compact(user.to_do_list_ids), function(n) {
											  return n.toString();
											}, Math) || [];

			}
			checkToDoList("student", user.to_do_list_ids.length, function (todo) {
				// body...
				updateData.status = user.status;
				if(todo === true && user.status === 0){
					updateData.status = 1;
				}
				//console.log(todo, user.status, updateData.status);
				var updated = _.merge(user, updateData);
				updated.save(function(save_err) {
					if (save_err) {
						callback(save_err, false);
					}
					callback(false, user);
				});

			});

		});
	}

}

function checkToDoList(user_type, to_do_list_ids, callback) {
	ToDoList.count({ type: user_type }, function (err, count) {
		if(to_do_list_ids === count){
			callback(true);
		}else{
			callback(false);
		}
	});
}

UserSchema.statics.checkToDoList = function(req, callback) {
	var self = this;
	var userId = req.user._id;
	if(_.has(req.params,'id') && req.params.id != "me"){
		userId = req.params.id;
	}

	var user_type = "student";
	if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf('mentor')) {
		user_type = "mentor";
	}
	var updateData = {};

	self.findById(userId, function(err, user) {
		if (err) return callback(err, false);
		if (!user) return callback('Not Found', false);

		checkToDoList("student", user.to_do_list_ids.length, function (todo) {

			updateData.status = user.status;
			if(todo === true && user.status === 0){
				updateData.status = 1;
			}
			//console.log(todo, user.status, updateData.status);
			var updated = _.merge(user, updateData);
			updated.save(function(save_err) {
				if (save_err) {
					callback(save_err, false);
				}
				callback(false, user);
			});

		});
	});
}
module.exports = mongoose.model('User', UserSchema);
