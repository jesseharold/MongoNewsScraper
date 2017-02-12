var cheerio = require("cheerio");
var request = require("request");
var db = require("./../database.js");
var sites = require("./../sites");

exports.setup = function(app) {
    
    // list out all sites, link to their scrape page
    app.get("/", function(req, res) {
        res.render("index", {siteOptions: sites});
    });

    // perform the scrape and store data in mongo
    app.get("/news-site/:index/", function(req, res){
        var siteIndex = parseInt(req.params.index);
        console.log("siteIndex: ", req.params.index);
        var thisSite = sites[siteIndex];
        console.log("scraping "+ thisSite.urlToScrape);
        request(thisSite.urlToScrape, function (error, response, html) {
            var $ = cheerio.load(html);
            $(thisSite.baseSelector).each(function(i, element){
                var image = $(element).find(thisSite.imageSelector).attr("src");
                var title = $(element).find(thisSite.titleSelector).text();
                var link = $(element).find(thisSite.linkSelector).attr("href");

                // *** update this to mongoose ***
                db.mongo[thisSite.collectionName].insert({
                    title: title,
                    image: image,
                    link: thisSite.baseUrl+link
                });
            });
            // get all info from the db
            // *** update this to mongoose ***
            var results = [];

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
};