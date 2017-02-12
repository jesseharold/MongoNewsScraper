var initialSite  = {
                introText: "Text about site goes here.",
                baseUrl: "http://www.aljazeera.com",
                urlToScrape: "http://www.aljazeera.com/news/",
                collectionName: "aljazeera",
                baseSelector: "div.top-section-lt, div.top-section-rt-s1, div.topics-sec-item, div.topics-sec-item-cont, div.row topics-sidebar-opinion-item",
                imageSelector: "img",
                titleSelector: "h2,h3",
                linkSelector: "a"
            };
module.exports = {
    site = initialSite
};