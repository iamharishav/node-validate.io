var express = require('express');
var router = express.Router();

router.get('/', function(request, response){
	response.render('static/home', {
		page_title: "Email Marketing Tool"
	});
});

module.exports = router;