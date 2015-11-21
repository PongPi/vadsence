'use strict';

var express = require('express');
var path = require('path');
var _ = require('lodash');

var Auth = require('../../auth/auth.service');
var UploadManager = require('./upload.model');

var router = express.Router();

router.post('/file', Auth.isAuthenticated(), function(req, res, next) {
	var data = _.pick(req.body, 'type'),
		file = req.files.file;
	var uploadPath = 'uploads/'
	if (file) {
		var fileName = file.originalFilename;
		var newFileName = path.basename(file.path);
		var filePath = uploadPath + newFileName;
		UploadManager.create({
			user_id: req.user._id || 0,
			file_name: fileName,
			file_path: filePath
		}, function(err, fileSaved) {
			if (err || !fileSaved) return res.status(500).json({
				message: err
			});
			return res.json(fileSaved);
		});
	} else {
		return res.status(500).json({
			error: 'Can not upload.'
		});
	}
});
router.post('/photo', function(req, res, next) {
	var data = _.pick(req.body, 'type'),
		uploadPath = path.normalize('uploads'),
		file = req.files.file;
	console.log(data);
	console.log(file); //original name (ie: sunset.png)
	//console.log(file.path); //tmp path (ie: /tmp/12345-xyaz.png)
	console.log(uploadPath); //uploads directory: (ie: /home/user/data/uploads)
});

module.exports = router;
