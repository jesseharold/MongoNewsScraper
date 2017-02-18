var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
