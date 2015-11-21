/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/schedule_reports', require('./api/schedule_report'));
  app.use('/api/godatas', require('./api/godata'));
  app.use('/api/to_do_lists', require('./api/to_do_list'));
  app.use('/api/program_categories', require('./api/program_category'));
  app.use('/api/properties', require('./api/property'));
  app.use('/api/mentors', require('./api/mentor'));
  app.use('/api/transaction_properties', require('./api/transaction_property'));
  app.use('/api/transactions', require('./api/transaction'));
  app.use('/api/balances', require('./api/balance'));
  app.use('/api/booked_sessions', require('./api/booked_session'));
  app.use('/api/booked_session_properties', require('./api/booked_session_property'));
  app.use('/api/booked_program_properties', require('./api/booked_program_property'));
  app.use('/api/booked_programs', require('./api/booked_program'));
  app.use('/api/session_properties', require('./api/session_property'));
  app.use('/api/sessions', require('./api/session'));
  app.use('/api/programs', require('./api/program'));
  app.use('/api/booking_hours', require('./api/booking_hour'));
  app.use('/api/program_property', require('./api/program_property'));
  app.use('/api/user_properties', require('./api/user_property'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/zoomus', require('./api/zoomus'));

  app.use('/auth', require('./auth'));
  app.use('/upload', require('./components/upload'));

  app.use('/test_mail', require('./api/test_mail'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};