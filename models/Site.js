var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SiteSchema = new Schema({
  introText: {
    type: String
  },
  baseUrl: {
    type: String,
    required: true
  },
  urlToScrape: {
    type: String,
    required: true
  },
  shortName: {
    type: String
  },
  baseSelector: {
    type: String,
    required: true
  },
  imageSelector: {
    type: String
  },
  titleSelector: {
    type: String
  },
  linkSelector: {
    type: String
  }
  // This only saves one note's ObjectId, ref refers to the Note model
  articles: {
    type: Schema.Types.ObjectId,
    ref: "Article"
  }
});

var Site = mongoose.model("Site", SiteSchema);

module.exports = Site;
