var cheerio = require("cheerio");
var request = require("request");
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// require all models
var articleModel = require('./../models/Article');
var commentModel = require('./../models/Comment');
var siteModel = require('./../models/Site');
var userModel = require('./../models/User');

exports.setup = function(app) {
    // list out all sites, link to their unique page
    app.get("/", function(req, res) {
        var promise = siteModel.find({}).exec();
        promise.then(function(data){
            //console.log(data);
            res.render("index", {siteOptions: data});
        })
        .catch(function(err){
            console.log("error: ", err);
        });
    });

    // perform the scrape and store data in mongo
    app.get("/news-site/:index/", function(req, res){
        var promise = siteModel.findOne({_id: req.params.index}).exec();
        promise.then(function(thisSite){
            //scrape the site
            console.log("scraping " + thisSite.urlToScrape);
            return request(thisSite.urlToScrape);
        })
        .then(function (response, html) {
            var $ = cheerio.load(html);
            console.log("loaded html");
            $(thisSite.baseSelector).each(function(i, element){
                var image = $(element).find(thisSite.imageSelector).attr("src");
                var title = $(element).find(thisSite.titleSelector).text();
                var link = $(element).find(thisSite.linkSelector).attr("href");
                //  console.log("image: " + image);
                //  console.log("title: " + title);
                //  console.log("link: " + link);
                // *** add this article to db ***
                articleModel.create({
                    title: title,
                    image: thisSite.baseUrl+image,
                    link: thisSite.baseUrl+link
                }, function(err, createdDoc){   
                    if (err){
                        if (err.code == 11000){
                            console.log("Scraped an article that already exists.");
                        } else {
                            console.log(err);
                        }
                    }
                    else { 
                        //this is not a duplicate
                        //push this article's ID into the site's associated articles array
                        console.log("pushing " + createdDoc._id  + " to articles array on site " + thisSite.shortName);
                        thisSite.articles.push(createdDoc._id);
                    }
                });
            });
        }).catch(function(err){
            console.log('error:', err);
        });
    });
                // }).then(function(){
                //     //do this once all the scraping is complete
                //     //display the site's articles
                //     var handlebarsInfo = {
                //         site: {
                //             shortName: thisSite.shortName,
                //             introText: thisSite.introText
                //         },
                //         posts: thisSite.articles
                //     };
                //     console.log("rendering page: ", handlebarsInfo);
                //     res.render("news", handlebarsInfo);
                // });


    app.post("/create/comment", function(req, res){
        var promise = commentModel.create({
            text: req.body.commentText,
            author: req.body.author
        }).exec();
        promise.then(function(createdComment){
            //push this comment's ID into the articles associated comments array
            return articleModel.findOne({_id: req.body.articleId});
        })
        .then(function(err, thisArticle){
            thisArticle.comments.push(createdComment._id);
            res.redirect("/news-site/" + req.body.siteId);
        }).catch(function(err){
            console.log('error:', err);
        });
    });

    app.post("/create/user", function(req, res){
        var promise = userModel.create({
            name: req.body.userName,
            email: req.body.userEmail
        }).exec();
        promise.then(function(createdUser){
            res.redirect("/");
        }).catch(function(err){
            console.log('error:', err);
        });
    });

    app.post("/create/site", function(req, res){
        var promise = siteModel.create({
            introText: req.body.introText,
            baseUrl: req.body.baseUrl,
            urlToScrape: req.body.urlToScrape,
            shortName: req.body.shortName,
            baseSelector: req.body.baseSelector,
            imageSelector: req.body.imageSelector,
            titleSelector: req.body.titleSelector,
            linkSelector: req.body.linkSelector
        }).exec();
        promise.then(function(createdUser){
            res.redirect("/");
        }).catch(function(err){
            console.log('error:', err);
        });
    });
};