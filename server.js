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
var seeds = require("./../seeds.js");

db.once("open", function() {
  console.log("Mongoose connection successful.");
  siteModel.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
          console.log("seeding sites collection");
          siteModel.create(seeds.site);
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
