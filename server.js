var express = require("express");
var path = require('path');
var bodyParser = require('body-parser');
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var handlebars = require("express-handlebars");
var request = require("request");

// Database configuration
var databaseUrl = "scrapedData";
var collections = ["aljazeera"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

var sites = [
    {
        index: 0,
        introText: "Text about site goes here.",
        baseUrl: "http://www.aljazeera.com",
        urlToScrape: "http://www.aljazeera.com/news/",
        collectionName: "aljazeera",
        baseSelector: "h2.top-sec-title, h2.top-sec-smalltitle, h2.topics-sec-item-head, a.topics-sidebar-title>h3",
        imageSelector: ".entry-content img",
        titleSelector: "",
        linkSelector: ""
    }
];

var PORT = process.env.PORT || 9000;
var app = express();

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

app.get("/", function(req, res) {
    // list out all sites, link to their scrape page
    res.render("index", {siteOptions: sites});
});

app.get("/news-site/:index/", function(req, res){
    var siteIndex = parseInt(req.params.index);
    console.log("siteIndex: ", req.params.index);
    var thisSite = sites[siteIndex];
    console.log("scraping "+ thisSite.urlToScrape);
    var results = [];
    request(thisSite.urlToScrape, function (error, response, html) {
        var $ = cheerio.load(html);
        $(thisSite.baseSelector).each(function(i, element){
            var image = $(element).find(thisSite.imageSelector).attr("src");
            var title = $(element).find(thisSite.titleSelector).text();
            var link = $(element).find(thisSite.linkSelector).attr("href");
            results.push({
                title: title,
                image: image,
                link: thisSite.baseUrl+link
            });
            db[thisSite.collectionName].insert({
                title: title,
                image: image,
                link: link
            });
        });
        var handlebarsInfo = {
            site: {
                sitename: thisSite.urlToScrape,
                text: thisSite.introText
            },
            posts: results
        };
        res.render("news", handlebarsInfo);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});
