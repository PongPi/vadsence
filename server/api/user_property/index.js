'use strict';

var express = require('express');
var controller = require('./user_property.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:id/:key', controller.getUserProperty);
router.put('/:id/:key', controller.updateUserProperty);
router.put('/:id', controller.updateUserProperties);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
