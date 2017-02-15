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
        var promise = siteModel.findOne({_id: req.params.index})
        .populate("articles")
        .populate("articles.comments")
        .exec();
        promise.then(function(thisSite){
            //scrape the site
            console.log("scraping " + thisSite.urlToScrape);
            var totalScraped = 0;
            request(thisSite.urlToScrape, function (err, response, html) {
                var $ = cheerio.load(html);
                var totalArticles = $(thisSite.baseSelector).length;
                $(thisSite.baseSelector).each(function(i, element){
                    var image = $(element).find(thisSite.imageSelector).attr("src");
                    var title = $(element).find(thisSite.titleSelector).text();
                    var link = $(element).find(thisSite.linkSelector).attr("href");
 
                    // *** add this article to db ***
                    var thisPost = new articleModel({
                        title: title,
                        image: thisSite.baseUrl+image,
                        link: thisSite.baseUrl+link
                    });
                    thisPost.save(function(err, createdDoc){   
                        if (err){
                            if (err.code == 11000){
                                totalScraped++;
                                console.log("Scraped an article that already exists.", totalScraped);
                                if (totalScraped >= totalArticles){
                                    res.render("news", thisSite);
                                }
                            } else {
                                console.log(err);
                            }
                        }
                        else { 
                            //this is not a duplicate
                            //push this article's ID into the site's associated articles array
                            console.log("pushing " + createdDoc._id  + " to articles array on site " + thisSite._id);
                            var promise = siteModel.findByIdAndUpdate(thisSite._id, {$push: {"articles": createdDoc._id}}, {new: true})
                            .populate("articles")
                            .populate("articles.comments")
                            .exec();
                            promise.then(function(updatedSite){
                                thisSite = updatedSite;
                                totalScraped++;
                                if (totalScraped >= totalArticles){
                                    // all asynchronous article saves are done, render the site
                                    res.render("news", thisSite);
                                }
                            }).catch(function(error){
                                if (error) console.log(error);
                            });
                        }
                    });
                });
            });
        });
    });

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