'use strict';

var jwt = require('jsonwebtoken');
var _ = require('lodash');
var passport = require('passport');
var util = require('util');
var urlencode = require('urlencode');
var randomstring = require("randomstring");

var User = require('./user.model');
var config = require('../../config/environment');
var mail = require('../../components/mail');
var ToDoList = require('../to_do_list/to_do_list.model');
var config = require('../../config/environment');
var validationError = function(res, err) {
	return res.status(422).json(err);
};
var slug = require('slug');

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
	User.find({}, '-salt -hashedPassword', function(err, users) {
		if (err) return res.status(500).send(err);
		res.status(200).json(users);
	});
};

/**
 * Creates a new user
 */
exports.create = function(req, res, next) {
	var newUser = new User(req.body);
	newUser.provider = 'local';

	// Make sure user role is ['user', 'student', 'mentor']
	if (!_.include(['user', 'student', 'mentor'], newUser.role)) {
		newUser.role = newUser.role || 'user';
	}

	if(newUser.name){
		var min = 100;
		var max = 999;
		var num = Math.floor(Math.random() * (max - min + 1)) + min;

		newUser.code = slug(newUser.name, '',{lowercase: false}).toUpperCase() +  num;
	}


	newUser.save(function(err, user) {
		if (err) return validationError(res, err);
		var token = jwt.sign({
			_id: user._id
		}, config.secrets.session, {
			expiresInMinutes: 60 * 5
		});

		res.json({
			token: token,
			type: user.type,
			role: user.role,
			activation : false
		});
	});
};

/**
 * Update profile
 */
exports.update = function(req, res) {
	if (req.body._id) delete req.body._id;
	User.updateUserData(req.params, req.body, function (err, data) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(200).json(data);
	})
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
	var userId = req.params.id;

	User.findById(userId, function(err, user) {
		if (err) return next(err);
		if (!user) return res.status(401).send('Unauthorized');
		res.json(user.profile);
	});
};

/**
 * Get a Check To Do List
 */
exports.checkToDoList = function(req, res, next) {

	User.checkToDoList(req, function (err, data) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(200).json(data);
	});
};

/**
 * Get a Check To Do List
 */
exports.studentTrigger = function(req, res, next) {
	var userId = req.user._id;
	if(_.has(req.params,'id') && req.params.id != "me"){
		userId = req.params.id;
	}
	//console.log('checkToDoList exports', userId);
	var user_type = "student";
	if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf('mentor')) {
		user_type = "mentor";
	}

	if(user_type === 'student'){
		User.findById(userId, function(err, user) {
			if (err) return next(err);
			if (!user) return res.status(401).send('Unauthorized');
			user.checkStudentTriggerToDoList(function (err_check, to_do_list) {//userId,user.time_zone, )
				if(err_check) { return handleError(res, err_check); }
				if(!to_do_list) { return res.status(404).send('Not Found'); }
				return res.json({list: to_do_list});
			});
		});
	}else{
		return res.status(404).send('Not Found');
	}

};



/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
	User.findByIdAndRemove(req.params.id, function(err, user) {
		if (err) return res.status(500).send(err);
		return res.status(204).send('No Content');
	});
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
	var userId = req.user._id;
	var oldPass = String(req.body.oldPassword);
	var newPass = String(req.body.newPassword);

	User.findById(userId, function(err, user) {
		if (user.authenticate(oldPass)) {
			user.password = newPass;
			user.save(function(err) {
				if (err) return validationError(res, err);
				res.status(200).send('OK');
			});
		} else {
			res.status(403).send('Forbidden');
		}
	});
};

/**
 * Put forget password
 */
exports.forgetPassword = function(req, res, next) {
	var email = String(req.body.email);

	User.findOne({
		email: email
	}, function(err, user) {
		if (!user || err) {
			return res.status(404).send('Not Found');
		} else {
			user.activation_key = user.makeSalt();
			user.save(function(err) {
				if (err) return res.status(404).send('Not Found');

				//Send mail
				var linkChangePassword = req.protocol + '://' + req.get('host') + "/api/users/changePasswordWithKey?key=" + urlencode(user.activation_key) + "&email=" + urlencode(email);

				mail.send({
					from: 'vadsence <vadsenceservice@gmail.com>', // sender address
					to: email, // list of receivers
					subject: config.mail.template.forgot.title, // Subject line
					html: util.format(config.mail.template.forgot.body, linkChangePassword) // html body
				}, function(err, result) {
					//console.log(err, result);
					res.status(200).send('OK');
				});

			});

		}
	});

};

/**
 * Change password with key when forget password
 */
exports.changePasswordWithKey = function(req, res) {
	var key = String(req.query.key);
	var email = String(req.query.email);
	var newPass = randomstring.generate(8);
	var godashboard = req.protocol + '://' + req.get('host');

	User.findOne({
		email: email
	}, function(err, user) {
		if (!user || err) {
			return res.status(404).send('Not Found');
		} else {

			if (user.activation_key === key) {

				user.password = newPass;
				user.save(function(err) {
					if (err) return res.status(404).send('Not Found');

					mail.send({
						from: 'vadsence <vadsenceservice@gmail.com>', // sender address
						to: email, // list of receivers
						subject: config.mail.template.reset_success.title, // Subject line
						html: util.format(config.mail.template.reset_success.body, newPass, godashboard) // html body
					}, function(err, result) {
						if (err) {
							res.send("Some thing went wrong!");
						}
						//console.log(err, result);
						res.redirect('/forgetpassword/complete');
					});
					});
			} else {
				res.send("Your key is wrong or not found!");
			}
		}
	});
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
	var userId = req.user._id;
	User.findOne({
		_id: userId
	}, '-salt -hashedPassword')
	.populate('user_properties')
	.exec(function(err, user) { // don't ever give out the password or salt
		if (err) return next(err);
		if (!user) return res.status(401).send('Unauthorized');
		var properties = _.object(_.pluck(user.user_properties, 'key'), _.pluck(user.user_properties, 'value'));

		var user_type = "student";
		if (config.userRoles.indexOf(user.role) >= config.userRoles.indexOf('mentor')) {
			user_type = "mentor";
		}
		user = _.merge(user, {
					properties: properties,
					//activation: true,
				});

		ToDoList.count({ type: user_type }, function (err, count) {
			var _user = {};
			if(user.to_do_list_ids.length === count){
				_user = _.merge(user, {
					//properties: properties,
					activation: true,
				});
			}else{
				_user = _.merge(user, {
					//properties: properties,
					activation: false
				});
			}
			res.json(_user);
		});


	});

};

/**
 * Get info
 */
exports.view = function(req, res, next) {
	var userId = req.params.id;
	User.findOne({
		_id: userId
	}, '-salt -hashedPassword').populate('user_properties').exec(function(err, user) { // don't ever give out the password or salt
		if (err) return next(err);
		if (!user) return res.status(401).send('Unauthorized');
		var properties = _.object(_.pluck(user.user_properties, 'key'), _.pluck(user.user_properties, 'value'));
		var user_type = "student";
		if (config.userRoles.indexOf(user.role) >= config.userRoles.indexOf('mentor')) {
			user_type = "mentor";
		}
		ToDoList.count({ type: user_type }, function (err, count) {
			//console.log('checkToDoList me', count, user.to_do_list_ids.length)
			var _user = {};
			if(user.to_do_list_ids.length === count){
				_user = _.merge(user, {
					properties: properties,
					activation: true
				});
			}else{
				_user = _.merge(user, {
					properties: properties,
					activation: false
				});
			}
			res.json(_user);
		});


	});

};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
	res.redirect('/');
};

exports.generate_pass = function(req, res) {
	var crypto = require('crypto');
	var password = req.query.password;
	var salt = new Buffer(req.query.salt,'base64');
	var hashedPass = "";
	if (!password || !salt) hashedPass = '';
	hashedPass = crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
	console.log(password, salt, hashedPass);
	res.status(200).send(hashedPass);
}

function handleError(res, err) {
	return res.status(500).send(err);
}
