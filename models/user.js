var bcrypt = require('bcryptjs');
var randomstring = require("randomstring");
var validatejs = require('valid.js')
dynamo = require('dynamodb');
Joi = require('joi');
var validate = validatejs.validate,
    isValid = validatejs.isValid,
    string = validatejs.string,
    util = validatejs.util,
    number = validatejs.number

var UserSchema = dynamo.define('User', {
  hashKey : 'email',
  timestamps : true,
  schema : {
    email: Joi.string().email(),
    id: dynamo.types.uuid(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    mobile_number: Joi.string(),
    company_name: Joi.string(),
    user_type: Joi.string().default('Customer'),
    status: Joi.string().default('Inactive'),
    password: Joi.string(),
    settings: {
      nickname: Joi.string(),
      acceptedTerms: Joi.boolean().default(true),
      email_verification: Joi.boolean().default(false),
      email_verification_code: Joi.string()
    }
  }
});

dynamo.createTables(function(err) {
});

var User = module.exports = dynamo.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.settings = { email_verification_code: randomstring.generate() }
      userAccount = new User(newUser);
      userAccount.save(function(err,user){
        callback(err,user.attrs);
      });
    });
  });
}

module.exports.getUserByEmail = function(email, callback){
  User.get(email, function (err, user) {
    if(err) throw err;
    callback(err,user.attrs);
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
}

module.exports.validateUser = function(UserForm, callback){
  errors = new Array();
  if(!isValid(UserForm.email, [util.isEmail, util.isRequired])){
    errors.push("Please enter valid email address");
  }
  if(!isValid(UserForm.first_name, [string.length(3,15), util.isRequired])){
    errors.push("Please enter valid first name");
  }
  if(!isValid(UserForm.company_name, [string.length(3,64), util.isRequired])){
    errors.push("Please enter valid company name");
  }
  if(!isValid(UserForm.mobile_number, [string.length(10,10), util.isRequired])){
    errors.push("Please enter valid 10 digital mobile number");
  }
  if(!isValid(UserForm.password, [string.length(8,16), util.isRequired])){
    errors.push("Please enter 8-16 character password.");
  }
  callback(errors);
}
