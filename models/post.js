var mongoose = require("mongoose");

var schema = new mongoose.Schema({  
 title: String ,  text : String , catg: String  , img: String , date: { type: Date, default: Date.now }   , like: { type:Number , default: 0} , dislike: { type:Number , default: 0}  , comment: [String] , likedusers: [String]   , dislikedusers: [String] 
 }); 

module.exports = mongoose.model('post', schema);