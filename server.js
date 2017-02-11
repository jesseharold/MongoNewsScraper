var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var cheerio = require("cheerio");
var handlebars = require("express-handlebars");
var request = require("request");

var PORT = process.env.PORT || 9000;
var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

app.get("/", function(req, res) {
    var indexInfo = {
        news:{
            sitename:"Cute Overload",
            text:"hi"
        }
    };
    res.render("index", indexInfo);
});


app.get("/scrape", function(req, res){
    var siteUrl = "http://www.aljazeera.com/news/";
    var baseUrl = "http://www.aljazeera.com";
    //= req.body.site;
    console.log("scraping "+ siteUrl);
    var results = [];
    request(siteUrl, function (error, response, html) {
        var $ = cheerio.load(html);
        $("h2.top-sec-title, h2.top-sec-smalltitle, h2.topics-sec-item-head, a.topics-sidebar-title>h3").each(function(i, element){
            var image = $(element).find(".entry-content img").attr("src");
            var title = $(element).text();
            var link = $(element).parent("a").attr("href");
            results.push({
                title: title,
                image: image,
                link: baseUrl+link
            });
        //   db.scrapedData.insert({
        //     title: title,
        //     image: image
        //   });
        });
        //console.log(results);
        var handlebarsInfo = {
            news:{
                sitename: siteUrl,
                text:"hi"
            },
            posts: results
        };
        res.render("index", handlebarsInfo);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
