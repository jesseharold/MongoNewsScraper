var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  comments: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
