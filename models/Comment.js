var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  // This only saves one user's ObjectId, ref refers to the User model
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
