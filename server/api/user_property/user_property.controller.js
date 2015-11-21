'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var UserProperty = require('./user_property.model');
var User = require('../user/user.model');

// Get list of user_propertys
exports.index = function(req, res) {
	return res.status(200).json([]);
};

// Get a single user_property
exports.show = function(req, res) {
	UserProperty.find({
			user_id: req.params.id
		}, {
			_id: 0,
			key: 1,
			value: 1
		},
		function(err, user_property) {
			if (err) {
				return handleError(res, err);
			}

			user_property = user_property || [];
			user_property = _.object(_.pluck(user_property, 'key'), _.pluck(user_property, 'value'));

			return res.json(user_property || []);
		});
};

// Get a single user_property
exports.getUserProperty = function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(404).send('Not Found');
	}

	UserProperty.findOne({
		user_id: req.params.id,
		key: req.params.key
	}, '-createdAt -updatedAt -__v', function(err, user_property) {
		if (err) {
			return handleError(res, err);
		}
		if (!user_property) {
			return res.status(404).json({});
		}
		return res.status(200).json(user_property.value || {});
	});
};

//update user_property
exports.updateUserProperty = function(req, res) {
	UserProperty.findOne({
		user_id: req.params.id,
		key: req.params.key
	}, function(err, user_property) {
		if (err) {
			return handleError(res, err);
		}
		if (!user_property) {
			user_property = new UserProperty({user_id: req.params.id, key: req.params.key});
		}

		// Remove duplicate and empty values;
		user_property.value = _.uniq(_.compact(req.body.value)) || [];
		user_property.save();

		return res.json(user_property || {});
	});
};

// update more user_property
exports.updateUserProperties = function(req, res) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id) || !req.body.data || !Array.isArray(req.body.data) || !req.body.data.length) {
		return res.status(404).send('Not Found');
	}
	var user_properties = [];

	var createOrUpdate = function(key, value) {

		//console.log('createOrUpdate', key, value);

		UserProperty.findOrCreate({
			user_id: req.params.id,
			key: key
		}, function(err, row) {
			if (err) {
				return handleError(res, err);
			}

			// TODO: Validate the values
			row.value = value;
			row.save(function (_err, row_saw) {
				if (err) {
					return handleError(res, _err);
				}
				//console.log(row_saw);
				// body...
				user_properties.push(row._id);
				if (user_properties.length === req.body.data.length) {
					User.update({
						_id: req.params.id
					}, {user_properties: user_properties}, function(err, data) {
						if (err) {
							return handleError(res, err);
						}

						//console.log('====>user_properties data',data);
						return res.send({
							message: 'ok'
						});
					});
				}
			});

		});
	}
//	console.log(req.body.data);
	for (var i in req.body.data) {
		var record = req.body.data[i];
		if (record && record.key) {//&& record.value
			createOrUpdate(record.key, record.value);
		}
	}
};

// Creates a new user_property in the DB.
exports.create = function(req, res) {
	UserProperty.create(req.body, function(err, user_property) {
		if (err) {
			return handleError(res, err);
		}
		return res.status(201).json(user_property);
	});
};

// Updates an existing user_property in the DB.
exports.update = function(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	UserProperty.findById(req.params.id, function(err, user_property) {
		if (err) {
			return handleError(res, err);
		}
		if (!user_property) {
			return res.status(404).send('Not Found');
		}
		var updated = _.merge(user_property, req.body);
		updated.save(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(200).json(updated);
		});
	});
};

// Deletes a user_property from the DB.
exports.destroy = function(req, res) {
	UserProperty.findById(req.params.id, function(err, user_property) {
		if (err) {
			return handleError(res, err);
		}
		if (!user_property) {
			return res.status(404).send('Not Found');
		}
		user_property.remove(function(err) {
			if (err) {
				return handleError(res, err);
			}
			return res.status(204).send('No Content');
		});
	});
};

function handleError(res, err) {
	return res.status(500).send(err);
}
