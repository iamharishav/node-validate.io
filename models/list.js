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

var ListSchema = dynamo.define('List', {
  hashKey : 'id',
  timestamps : true,
  schema : {
    customer_id: Joi.string(),
    id : dynamo.types.uuid(),
    name : Joi.string(),
    description: Joi.string(),
    status : Joi.string().default('Active')
  }
});

dynamo.createTables(function(err) {

});

var List = module.exports = dynamo.model('List', ListSchema);

module.exports.createList = function(newList, user, callback){
  newList.customer_id = user.id
  newList = new List(newList);
  newList.save(function(err,list){
    callback(err,list);
  });
}


module.exports.validateList = function(ListForm, callback){
  errors = new Array();
  if(!isValid(ListForm.name, [util.isRequired])){
    errors.push("Please enter valid list name");
  }
  if(!isValid(ListForm.description, [util.isRequired])){
    errors.push("Please enter valid list description");
  }
  callback(errors);
}