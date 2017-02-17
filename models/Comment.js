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

// make date look nicer
var formatDate = function(next) {
  console.log("formatting date: ");
  next();
};

//attach pre processor to all find events used
CommentSchema.
  pre('findById', formatDate).
  pre('findOne', formatDate).
  pre('find', formatDate);

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
