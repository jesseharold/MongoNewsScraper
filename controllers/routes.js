var cheerio = require("cheerio");
var request = require("request");
var db = require("./../database.js");
// require all models
var articleModel = require('./../models/Article');
var commentModel = require('./../models/Comment');
var siteModel = require('./../models/Site');
var userModel = require('./../models/User');

exports.setup = function(app) {
    
    // list out all sites, link to their scrape page
    app.get("/", function(req, res) {
        siteModel.find({}, function(err, data){
            if (err){ return console.log(err);}
            console.log(data);
            res.render("index", {siteOptions: data});
        });
    });

    // perform the scrape and store data in mongo
    app.get("/scrape/:index/", function(req, res){
        var siteIndex = parseInt(req.params.index);
        console.log("siteIndex: ", req.params.index);
        var thisSite = siteModel.find({_id: siteIndex});
        console.log("scraping "+ thisSite.urlToScrape);

        //scrape the site
        request(thisSite.urlToScrape, function (error, response, html) {
            var $ = cheerio.load(html);
            $(thisSite.baseSelector).each(function(i, element){
                var image = $(element).find(thisSite.imageSelector).attr("src");
                var title = $(element).find(thisSite.titleSelector).text();
                var link = $(element).find(thisSite.linkSelector).attr("href");

                // *** update this to mongoose ***
                articleModel.insert({
                    title: title,
                    image: image,
                    link: thisSite.baseUrl+link
                });
            });

            //display the site's articles
            articleModel.find({site: siteIndex}, function(err, data){
                var handlebarsInfo = {
                    site: {
                        sitename: thisSite.urlToScrape,
                        text: thisSite.introText
                    },
                    posts: data
                };
                res.render("news", handlebarsInfo);
            });
        });
    });
};