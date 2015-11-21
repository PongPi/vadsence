var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (user.suspended) {
            return done(null, false, { message: 'This user is suspended by admin.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'The password you have provided is incorrect.' });
        }
        return done(null, user);
      });
    }
  ));
};