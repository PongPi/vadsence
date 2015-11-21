'use strict';

var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var UploadSchema = new Schema({
	user_id: {
		type: Schema.Types.ObjectId,
	},
	file_name: String,
	file_path: String
});

UploadSchema.plugin(timestamps);
UploadSchema.index({
	user_id: 1,
	file_path: 1
}, {
	unique: true
});

module.exports = mongoose.model('Upload', UploadSchema);