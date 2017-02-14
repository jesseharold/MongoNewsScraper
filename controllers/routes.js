var cheerio = require("cheerio");
var request = require("request");
var mongoose = require("mongoose");
// require all models
var articleModel = require('./../models/Article');
var commentModel = require('./../models/Comment');
var siteModel = require('./../models/Site');
var userModel = require('./../models/User');

exports.setup = function(app) {
    // list out all sites, link to their unique page
    app.get("/", function(req, res) {
        siteModel.find({})
        .then(function(err, data){
            if (err){ return console.log(err);}
            //console.log(data);
            res.render("index", {siteOptions: data});
        });
    });

    // perform the scrape and store data in mongo
    app.get("/news-site/:index/", function(req, res){
        siteModel.findOne({_id: req.params.index})
        .then(function(err, thisSite){
            if (err){console.log(err);}
            //scrape the site
            console.log("scraping " + thisSite.urlToScrape);
            request(thisSite.urlToScrape)
            .then(function (error, response, html) {
                if (error){console.log(err);}
                var $ = cheerio.load(html);
                //console.log("loaded html");
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
                    })
                    .then(function(err, createdDoc){   
                        if (err){
                            if (err.code == 11000){
                                console.log("Scraped an article that already exists.");
                            } else {
                                console.log(err);
                            }
                        }
                        else { //this is not a duplicate
                            //push this article's ID into the site's associated articles array
                            console.log("pushing " + createdDoc._id  + " to articles array on site " + thisSite.shortName);
                            thisSite.articles.push(createdDoc._id);
                        }
                    });
                }).then(function(){
                    //do this once all the scraping is complete
                    //display the site's articles
                    var handlebarsInfo = {
                        site: {
                            shortName: thisSite.shortName,
                            introText: thisSite.introText
                        },
                        posts: thisSite.articles
                    };
                    console.log("rendering page: ", handlebarsInfo);
                    res.render("news", handlebarsInfo);
                });
            });
        });
    });

    app.post("/create/comment", function(req, res){
        commentModel.create({
            text: req.body.commentText,
            author: req.body.author
        })
        .then(function(err, createdComment){
            if (err){console.log(err);}
            //push this comment's ID into the articles associated comments array
            articleModel.findOne({_id: req.body.articleId})
            .then(function(err, thisArticle){
                thisArticle.comments.push(createdComment._id);
                res.redirect("/news-site/" + req.body.siteId);
            });
        });
    });

    app.post("/create/user", function(req, res){
        userModel.create({
            name: req.body.userName,
            email: req.body.userEmail
        }, function(err, createdUser){
            if (err){console.log(err);}
            res.redirect("/");
        });
    });

    app.post("/create/site", function(req, res){
        siteModel.create({
            introText: req.body.introText,
            baseUrl: req.body.baseUrl,
            urlToScrape: req.body.urlToScrape,
            shortName: req.body.shortName,
            baseSelector: req.body.baseSelector,
            imageSelector: req.body.imageSelector,
            titleSelector: req.body.titleSelector,
            linkSelector: req.body.linkSelector
        })
        .then(function(err, createdUser){
            if (err){console.log(err);}
            res.redirect("/");
        });
    });
};