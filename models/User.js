var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  comments: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
