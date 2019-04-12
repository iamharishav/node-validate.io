var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(request, response){
	response.render('dashboard/index', {
		layout: 'application',
		page_title: "Dashboard"
	});
});

function ensureAuthenticated(request, response, next){
	if(request.isAuthenticated()){
		return next();
	} else {
		response.redirect('/users/sign_in');
	}
}

module.exports = router;