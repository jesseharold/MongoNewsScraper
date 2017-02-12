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
  // This only saves one Comment's ObjectId, ref refers to the Comment model
  comments: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  },
  // This only saves one site's ObjectId, ref refers to the Site model
  site: {
    type: Schema.Types.ObjectId,
    ref: "Site"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
