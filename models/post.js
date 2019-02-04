var mongoose = require("mongoose");

var schema = new mongoose.Schema({  
 title: String ,  text : String , catg: String  , img: String , date: { type: Date, default: Date.now }  
 }); 

module.exports = mongoose.model('post', schema);