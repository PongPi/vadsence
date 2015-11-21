'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.put('/forgetPassword', controller.forgetPassword);
router.all('/changePasswordWithKey', controller.changePasswordWithKey);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/generate_pass', controller.generate_pass);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/:id/view', controller.view);
router.get('/:id/checkToDoList', auth.isAuthenticated(), controller.checkToDoList);
router.get('/me/checkToDoList', auth.isAuthenticated(), controller.checkToDoList);
router.get('/:id/studenttrigger', auth.isAuthenticated(), controller.studentTrigger);
router.get('/me/studenttrigger', auth.isAuthenticated(), controller.studentTrigger);
router.post('/:id', auth.isAuthenticated(), controller.update);
router.post('/', controller.create);

module.exports = router;
