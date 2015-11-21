'use strict';

var _ = require('lodash');
var nodemailer = require('nodemailer');
var config = require('../../config/environment');

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport(config.mail.config);

module.exports.transporter = transporter;

module.exports.send = function(options, callback) {
	var mailOptions = _.merge(config.mail.options, options);

	// send mail with defined transport object 
	transporter.sendMail(mailOptions, function(error, info) {
		if (callback) return callback(error, info);

		if (error) {
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
};
