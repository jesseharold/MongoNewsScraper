module.exports = [
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
 