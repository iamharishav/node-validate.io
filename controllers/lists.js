var express = require('express');
var router = express.Router();

var List = require('../models/list');

router.get('/', ensureAuthenticated, function(request, response){
	var lists = new Array();
	List.query( { customer_id: { eq: request.user.id } }, function (error, lists) {
		if (error) throw error;
		console.log(lists);
		response.render('lists/index', {
			layout: 'application',
			page_title: 'Subscribers List Management',
			lists: lists
		});
	});
	
});

router.get('/create', ensureAuthenticated, function(request, response){
	response.render('lists/create', {
		layout: 'application',
		page_title: 'Create Subscribers List'
	});
});

router.post('/create', ensureAuthenticated, function(request, response){
	List.validateList(request.body, function(errors){
		if( errors.length > 0 ){		
			response.render('lists/create', {
				layout: 'application',
				page_title: 'Create Subscribers List',
				errors: errors
			});
		}else{
			List.createList(request.body, request.user,	function(error, list){
				if (error) throw error;
				request.flash('success_msg', 'You have successfully created list. Please go ahead and add subscribers');
				response.redirect('/lists/'+list.attrs.id);
			});
		}
	});
});

router.get('/:id?', ensureAuthenticated, function(request, response){
	
	List.get(request.params.id, function (error, list) {
		if (error) throw error;
	  response.render('lists/show', {
			layout: 'application',
			page_title: 'Subscribers List',
			list: list.attrs
		});
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