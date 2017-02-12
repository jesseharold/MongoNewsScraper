var cheerio = require("cheerio");
var request = require("request");
var mongoose = require("mongoose");
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
    app.get("/news-site/:index/", function(req, res){
        siteModel.findOne({_id: req.params.index}, function(err, thisSite){
            if (err){console.log(err);}
            //scrape the site
            console.log("scraping " + thisSite.urlToScrape);
            request(thisSite.urlToScrape, function (error, response, html) {
                if (error){console.log(err);}
                var $ = cheerio.load(html);
                //"a.topics-sidebar-title" 
                $(thisSite.baseSelector).each(function(i, element){
                    var image = $(element).find(thisSite.imageSelector).attr("src");
                    var title = $(element).find(thisSite.titleSelector).text();
                    var link = $(element).find(thisSite.linkSelector).attr("href");
                    // console.log("image: " + image);
                    // console.log("title: " + title);
                    // console.log("link: " + link);
                    // *** update this to mongoose ***
                    articleModel.create({
                        title: title,
                        image: image,
                        link: thisSite.baseUrl+link
                    }, function(err, createdDoc){   
                        if (err){console.log(err);}
                        //display the site's articles
                        articleModel.find({site: req.params.index}, function(err, data){
                            if (err){console.log(err);}
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
            });
        });
    });
};