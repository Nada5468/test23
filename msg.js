const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const messageSchema = new Schema({
name:{
type: String,
required: true 
},
message:{
type: String,
required : true
}
})

var Messages = mongoose.model("messages", messageSchema, "messages");
module.exports = Messages;

