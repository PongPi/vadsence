'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var ToDoList = require('../../api/to_do_list/to_do_list.model');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    ToDoList.count({ type: user.type }, function (err, count) {
		if(user.to_do_list_ids.length === count){
			res.json({token: token, role : user.role, activation : true});
		}else{
			res.json({token: token, role : user.role, activation : false});
		}
		
	});
    
  })(req, res, next)
});

module.exports = router;