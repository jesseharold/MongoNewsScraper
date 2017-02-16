var cheerio = require("cheerio");
var request = require("request");
var bodyParser = require('body-parser');
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
                    // make any relative links into full URLs
                    if (link && link.indexOf("http") === -1){
                        link = thisSite.baseUrl+link;
                    }
                    if (image && image.indexOf("http") === -1){
                        image = thisSite.baseUrl+image;
                    }
                    // *** add this article to db ***
                    var thisPost = new articleModel({
                        title: title,
                        image: image,
                        link: link
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

    app.post("/create/user", function(req, res){
        if (!req.body.username || ! req.body.email){
            // require field us missing
            res.redirect("/?err=90210&errmsg=field missing");
        } else {
            //check if this is an existing user
            userModel.findOne({username: req.body.username, email: req.body.email}, function(err, user){
                if (err) {console.log("error finding user ", err);}
                if (user){
                    console.log("FOUND THIS USER ", user);
                    res.redirect("/?username=" + req.body.username + "&email=" + req.body.email);
                } else {
                    //not an existing user, save new
                    var newUser = new userModel({
                        username: req.body.username,
                        email: req.body.email
                    });
                    newUser.save(function(err, createdUser){
                        if (err) {
                            console.log(err);
                            res.redirect("/?err=" + err.code + "&errmsg=" + err.errmsg);
                        }
                        else{
                            console.log("saved user");
                            res.redirect("/?username=" + createdUser.username + "&email=" + createdUser.email);
                        }
                    });
                }
            });
        }
    });

    // app.post("/create/site", function(req, res){
    //     var promise = siteModel.create({
    //         introText: req.body.introText,
    //         baseUrl: req.body.baseUrl,
    //         urlToScrape: req.body.urlToScrape,
    //         shortName: req.body.shortName,
    //         baseSelector: req.body.baseSelector,
    //         imageSelector: req.body.imageSelector,
    //         titleSelector: req.body.titleSelector,
    //         linkSelector: req.body.linkSelector
    //     }).exec();
    //     promise.then(function(createdUser){
    //         res.redirect("/");
    //     }).catch(function(err){
    //         console.log('error:', err);
    //     });
    // });
};