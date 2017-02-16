var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Associations
  saved: [{
    type: Schema.Types.ObjectId,
    ref: "Article"
  }]
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
