var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

const Joi = require('joi');
dynamo = require('dynamodb');
dynamo.AWS.config.update({accessKeyId: 'AKIAJJTPW6EM2TQUMJ6A', secretAccessKey: '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', region: "ap-south-1"});

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
	defaultLayout: 'site',
	partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

var static = require('./controllers/static');
app.use('/', static);

var users = require('./controllers/users');
app.use('/users', users);

var dashboard = require('./controllers/dashboard');
app.use('/dashboard', dashboard);

var lists = require('./controllers/lists');
app.use('/lists', lists);

app.set('port', (process.env.PORT || 1000));
app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});