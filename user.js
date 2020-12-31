var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username:{
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 50,
    trim: true
  },
  password:{
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
    trim: true
  }
})

module.exports =  mongoose.model("User", userSchema);

