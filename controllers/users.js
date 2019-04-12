var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


router.get('/sign_in', function(request, response){
	response.render('users/sign_in', {
		layout: 'entry',
		page_title: "Sign In to Get Started"
	});
});

router.get('/sign_up', function(request, response){
	response.render('users/sign_up', {
		layout: 'entry',
		page_title: 'Sign Up to Get Started',
		errors: []
	});
});

router.post('/sign_up', function(request, response){

	User.validateUser(request.body, function(errors){
		if(errors.length > 0){
			response.render('users/sign_up', {
				layout: 'entry',
				page_title: 'Sign Up to Get Started',
				errors: errors,
				request: request.body
			});
		}else{
			User.get(request.body.email, function (err, acc) {
			  if(!acc){
			  	User.createUser(request.body,	function(error, user){
						if (error) throw error;
						request.flash('success_msg', 'You are registered successfully. Please login to your email to validate email address.');
						response.redirect('/users/sign_in');
					});
			  }else{
			  	errors.push("This email address already exist in our system.")
			  	response.render('users/sign_up', {
						layout: 'entry',
						page_title: 'Sign Up to Get Started',
						errors: errors,
						request: request.body
					});
			  }
			});
		}
	});
});

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  User.getUserByEmail(email, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' },
  function(email, password, done) {
   	User.getUserByEmail(email, function(err, user){
   		if(err) throw err;
	   	if(!user){
	   		return done(null, false, {message: 'Unknown User'});
	   	}

   		User.comparePassword(password, user.password, function(err, isMatch){
   			if(err) throw err;
   			if(isMatch){
   				return done(null, user);
   			} else {
   				return done(null, false, {message: 'Invalid password'});
   			}
   		});
   	});
	})
);


router.post('/sign_in',
  passport.authenticate('local', { successRedirect:'/dashboard', failureRedirect:'/users/sign_in', failureFlash: true }),
  function(request, response) {
    response.redirect('/');
  }
);

router.get('/sign_out', function(request, response){
	request.logout();

	request.flash('success_msg', 'You are logged out');

	response.redirect('/users/sign_in');
});

router.get('/validate-email/:email_verification_code', function(request, response){
	if(request.params.email_verification_code){
		User.query({}).where({"settings.email_verification_code": request.params.email_verification_code }).exec();
		// User.query().where({"settings.email_verification_code": request.params.email_verification_code }, function (err, acc) {
		// 	if (err) throw err;
		// 	if (acc){
		// 		User.update({
		// 		  email : acc.email,
		// 		  email_verification : true
		// 		}, function (err, user) {
		// 		  if(err) throw err;
		// 		  request.flash('success_msg', 'You account email has been verified. Please login.');
		// 			response.redirect('/users/sign_in');
		// 		});
		// 	}
		// });
	}else{
		request.flash('success_msg', 'URL you are trying to access has been expired. You may login here.');
		response.redirect('/users/sign_in');
	}
});

router.get('/recover_password', function(request, response){
	response.render('users/recover_password', {
		layout: 'entry',
		page_title: 'Recover Password'
	});
});

function ensureAuthenticated(request, response, next){
	if(!request.isAuthenticated()){
		return next();
	} else {
		response.redirect('/dashboard');
	}
}


module.exports = router;