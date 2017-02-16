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
        .sort({createdAt:-1})
        .populate("articles.comments")
        .sort({createdAt:-1})
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
                    // attempt to save this article
                    thisPost.save(function(err, createdDoc){   
                        if (err){
                            if (err.code == 11000){
                                // Scraped an article that already exists.
                                totalScraped++;
                                if (totalScraped >= totalArticles){
                                    renderPage();
                                }
                            } else {
                                // some other error
                                console.log(err);
                            }
                        }
                        else { 
                            //this is not a duplicate
                            //push this article's ID into the site's associated articles array
                            //console.log("pushing " + createdDoc._id  + " to articles array on site " + thisSite._id);
                            var promise = siteModel.findByIdAndUpdate(thisSite._id, {$push: {"articles": createdDoc._id}}, {new: true})
                            .populate("articles")
                            .sort({createdAt:-1})
                            .populate("articles.comments")
                            .sort({createdAt:-1})
                            .exec();
                            promise.then(function(updatedSite){
                                thisSite = updatedSite;
                                totalScraped++;
                                if (totalScraped >= totalArticles){
                                   renderPage();
                                }
                            }).catch(function(error){
                                if (error) console.log(error);
                            });
                        }
                        function renderPage(){
                            thisSite.isSavedPage = false;
                            res.render("news", thisSite);
                        }
                    });
                });
            });
        });
    });

    // save an article for later viewing
    app.get("/save/:article/:user", function(req, res){
        // push the saved article to the users's saved array
        var promise = userModel.findByIdAndUpdate(req.params.user, {$push: {"saved": req.params.article}})
            .exec();
            promise.then(function(updatedUser){
                // render the news page with a "site" made up of their saved articles
                res.redirect("/saved/" + req.params.user);
            }).catch(function(error){
                if (error) console.log(error);
            });
    });

    // remove an article from saved page
    app.get("/unsave/:article/:user", function(req, res){
        // remove the saved article from the users's saved array
        var promise = userModel.findByIdAndUpdate(req.params.user, {$pull: {"saved": req.params.article}})
            .exec();
            promise.then(function(updatedUser){
                // render the news page with a "site" made up of their saved articles
                res.redirect("/saved/" + req.params.user);
            }).catch(function(error){
                if (error) console.log(error);
            });
    });
    // view saved articles
    app.get("/saved/:user", function(req, res){
        // push the saved article to the users's saved array
        var promise = userModel.findById(req.params.user)
            .populate("saved")
            .sort({updatedAt:-1})
            .exec();
            promise.then(function(savingUser){
                // render the news page with a "site" made up of their saved articles
                var savedSite = {
                    _id: "savedPage",
                    shortName: savingUser.username + "'s Saved Articles",
                    introText: "You can keep articles here to read or comment later",
                    isSavedPage: true,
                    articles: savingUser.saved
                };
                res.render("news", savedSite);
            }).catch(function(error){
                if (error) console.log(error);
            });
    });

    app.post("/create/user", function(req, res){
        if (!req.body.username || ! req.body.email){
            // require field us missing
            res.redirect("/?err=90210&errmsg=field missing");
        } else {
            //check if this is an existing user
            userModel.findOne({username: req.body.username, email: req.body.email}, function(err, foundUser){
                if (err) {console.log("error finding user ", err);}
                if (foundUser){
                    //console.log("FOUND THIS USER ", foundUser);
                    res.redirect("/?username=" + req.body.username + "&email=" + req.body.email + "&id=" + foundUser._id);
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
                            //console.log("saved user");
                            res.redirect("/?username=" + createdUser.username + "&email=" + createdUser.email + "&id=" + createdUser._id);
                        }
                    });
                }
            });
        }
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
        }, function(err, createdSite){
            if (err){ 
                if (err.code == 11000){
                    res.redirect("/?message=sitealreadyexists");
                } else {
                    console.log('error creating site:', err);
                }
            } else {
                res.redirect("/?message=site-" + createdSite.shortName + "-added");
            }
        });
    });
    
    app.post("/create/comment", function(req, res){
        commentModel.create({
            text: req.body.commentText,
            author: req.body.author
        }, function(err, createdComment){
            if (err){ console.log('error creating comment:', err); } 
            // push comment ID onto article document
            var promise = articleModel.findByIdAndUpdate(req.body.articleId, {$push: {"comments": createdComment._id}})
            .exec();
            promise.then(function(updatedArticle){
                if (req.body.siteId === "savedPage"){
                    //redirect to saved page if comment was submitted from saved page
                    res.redirect("/saved/" + req.body.author);
                } else {
                    //redirect to news page if comment was submitted from news page
                    res.redirect("/news-site/" + req.body.siteId);
                }
            });
        });
    });
    
};