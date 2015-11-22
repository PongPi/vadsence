'use strict';

angular.module('vadsenceNodeApp')
	.factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
		var currentUser = {};
		currentUser = User.get();

		//if($cookieStore.get('token')) {
		//	currentUser = User.get();
		//}

		return {

			/**
			 * Authenticate user and save token
			 *
			 * @param  {Object}   user     - login info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			login: function(user, callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				$http.post('/auth/local', {
					email: user.email,
					password: user.password
				}).
				success(function(data) {
					$cookieStore.put('token', data.token);
					$cookieStore.put('isMentor', data.role == 'mentor');
					$cookieStore.put('isStudent', data.role == 'student');
					$cookieStore.put('isActivation', data.activation);
					currentUser = User.get();
					deferred.resolve(data);
					return cb();
				}).
				error(function(err) {
					this.logout();
					deferred.reject(err);
					return cb(err);
				}.bind(this));

				return deferred.promise;
			},

			/**
			 * Delete access token and user info
			 *
			 * @param  {Function}
			 */
			logout: function() {
				$cookieStore.remove('token');
				currentUser = {};
			},

			/**
			 * Create a new user
			 *
			 * @param  {Object}   user     - user info
			 * @param  {Function} callback - optional
			 * @return {Promise}
			 */
			createUser: function(user, callback) {
				var cb = callback || angular.noop;

				return User.save(user,
					function(data) {
						$cookieStore.put('token', data.token);
						$cookieStore.put('isMentor', data.type == 'mentor');
						$cookieStore.put('isStudent', data.type == 'student');
						$cookieStore.put('isActivation', data.activation);
						currentUser = User.get();
						return cb(user);
					},
					function(err) {
						this.logout();
						return cb(err);
					}.bind(this)).$promise;
			},

			/**
			 * Change password
			 *
			 * @param  {String}   oldPassword
			 * @param  {String}   newPassword
			 * @param  {Function} callback    - optional
			 * @return {Promise}
			 */
			changePassword: function(oldPassword, newPassword, callback) {
				var cb = callback || angular.noop;

				return User.changePassword({ id: currentUser._id }, {
					oldPassword: oldPassword,
					newPassword: newPassword
				}, function(user) {
					return cb(user);
				}, function(err) {
					return cb(err);
				}).$promise;
			},

			/**
			 * Gets all available info on authenticated user
			 *
			 * @return {Object} user
			 */
			getCurrentUser: function(callback) {
				if (callback && typeof(callback) === "function") {
					callback(currentUser);
				}
				return currentUser;
			},

			/**
			 * Check if a user is logged in
			 *
			 * @return {Boolean}
			 */

			isLoggedIn: function() {
				return currentUser.hasOwnProperty('role');
			},
			/**
			 * Check if a user is Mentor
			 *
			 * @return {Boolean}
			 */
			isMentor: function() {
				//console.log(currentUser)
				return $cookieStore.get('isMentor');
			},

			/**
			 * Check if a user is student
			 *
			 * @return {Boolean}
			 */
			isStudent: function() {
				//console.log(currentUser)
				return $cookieStore.get('isStudent');
			},

			/**
			 * Check if a user is Activation
			 *
			 * @return {Boolean}
			 */
			isActivation: function() {
				//console.log(currentUser)
				return $cookieStore.get('isActivation');
			},

			/**
			 * Waits for currentUser to resolve before checking if user is logged in
			 */
			isLoggedInAsync: function(cb) {
				if(currentUser.hasOwnProperty('$promise')) {
					currentUser.$promise.then(function() {
						cb(true);
					}).catch(function() {
						cb(false);
					});
				} else if(currentUser.hasOwnProperty('role')) {
					cb(true);
				} else {
					cb(false);
				}
			},

			/**
			 * Check if a user is an admin
			 *
			 * @return {Boolean}
			 */
			isAdmin: function() {
				return false; // Not use this ways
			},

			/**
			 * Get auth token
			 */
			getToken: function() {
				return $cookieStore.get('token');
			},
			getUser: function(callback){
				User.get(function(currentUser){
                 //    $cookieStore.put('isActivation', currentUser.activation);

	                // var now = moment();
	                // if (currentUser.day_of_birth !== undefined || currentUser.day_of_birth !== 'Invalid date') {
	                //     currentUser.day_of_birth = moment(currentUser.day_of_birth).format('MM/DD/YYYY');
	                // } else {
	                //     currentUser.day_of_birth = now.format('MM/DD/YYYY');
	                // }
	                if (callback && typeof(callback) === "function") {
						callback(false,currentUser);
					}
	            }, function(error){
	            	// console.log('getUser', error)
	            	if(_.has(error,'status') && parseInt(error.status) == 401){
	            		return callback(false,{});
	            	}
	            	if (callback && typeof(callback) === "function") {
							callback(error,{});
					}
	            });
			},
     // 	checkToDoList: function () {

	    //     if($cookieStore.get('isStudent') && $cookieStore.get('token')){
	    //     	User.checkToDoList(function (data) {
	    //     		console.log('checkToDoList', data)	;
	    //     		if(parseInt(data.status) < 4){
	    //     			$cookieStore.put('isActivation', false);
	    //     		}else{
	    //     			$cookieStore.put('isActivation', true);
	    //     		}
		   //    	}, function (err) {
		   //    		$cookieStore.put('isActivation', false);

		   //    	});
	    //     }
    	// },
     // 	studentTrigger: function (callback) {

	    //     if($cookieStore.get('isStudent') && $cookieStore.get('token')){
	    //     	User.studentTrigger(function (data) {
	    //     		if (callback && typeof(callback) === "function") {
					// 	callback(false,data);
					// }

	    //     		//$cookieStore.put('isActivation', true);
		   //    	}, function (err) {
		   //    		if (callback && typeof(callback) === "function") {
					// 	callback(err,false);
					// }

		   //    	});
	    //     }
    	// }
	};
});
