var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var handlebars = require("express-handlebars");
var routes = require("./routes.js");

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
