var mongoose = require("mongoose");

// Database configuration
var databaseUrl = "scrapedData";

mongoose.connect("mongodb://localhost/" + databaseUrl);
var db = mongoose.connection;

// Log any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

module.exports = {
    mongo: db
};