var aj  = {
        shortName: "Al Jazeera",
        introText: "A global perspective on world news, based in Qatar.",
        baseUrl: "http://www.aljazeera.com",
        urlToScrape: "http://www.aljazeera.com/news/",
        baseSelector: "div.top-section-lt, div.top-section-rt-s1, div.topics-sec-item, div.topics-sec-item-cont, div.row topics-sidebar-opinion-item",
        imageSelector: "img",
        titleSelector: "h2,h3",
        linkSelector: "a"
    };
var dn  = {
        shortName: "Democracy Now!",
        introText: "Ad-free, internet-only left-leaning news shows.",
        baseUrl: "https://www.democracynow.org/",
        urlToScrape: "https://www.democracynow.org/",
        baseSelector: "div.news_item",
        imageSelector: "img",
        titleSelector: "h3",
        linkSelector: "a"
    };
module.exports = {
    sites: [aj, dn]
};