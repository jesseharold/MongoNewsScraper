
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

// Database configuration
var databaseUrl = "scrapedData";
var collections = [];

//get names of all collections
for (var i = 0; i < sites.length; i++){
    collections.push(sites[i].collectionName);
}

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

module.exports = {
    mongo: db,
    sites: sites
};