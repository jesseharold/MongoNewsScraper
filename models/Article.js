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
  image: {
    type: String
  },
  // Associations
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment"
  }],
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;