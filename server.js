var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var handlebars = require("express-handlebars");

var mongoose = require("mongoose");
// Database configuration
var databaseUrl = "scrapedData";
mongoose.connect("mongodb://localhost/" + databaseUrl);
var db = mongoose.connection;
// Log any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
// require all models
var articleModel = require('./models/Article');
var commentModel = require('./models/Comment');
var siteModel = require('./models/Site');
var userModel = require('./models/User');

db.once("open", function() {
  console.log("Mongoose connection successful.");
  console.log("seeding sites...");
  siteModel.find({}).exec(function (err, collection) {
    console.log("seeding collection: ", collection);
        if (collection.length === 0) {
            var initialSite  = {
                introText: "Text about site goes here.",
                baseUrl: "http://www.aljazeera.com",
                urlToScrape: "http://www.aljazeera.com/news/",
                collectionName: "aljazeera",
                baseSelector: "h2.top-sec-title, h2.top-sec-smalltitle, h2.topics-sec-item-head, a.topics-sidebar-title>h3",
                imageSelector: ".entry-content img",
                titleSelector: "",
                linkSelector: ""
            };
          siteModel.create(initialSite);
        }
    });
});


var routes = require("./controllers/routes.js");

var PORT = process.env.PORT || 9000;
var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

routes.setup(app);

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
