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
  // Associations
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
