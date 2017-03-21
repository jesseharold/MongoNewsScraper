# MongoNewsScraper
View and comment on news stories scraped from a source of your choice.

https://mongonewsscraper.herokuapp.com

##Overview

A web app that lets users leave comments on the latest news, using Mongoose and Cheerio to scrape news from other sites.

Whenever a user visits, the app will scrape stories from a news outlet of their choice. 

The data includes:
* a link to the story and 
* a headline, 
* an image, if available
    
Users can set their username for the app (no auth)
Users can leave comments on the stories scraped from news sources. 
Users can choose stories to add to their "saved" list of favorites.
Users can remove articles from their saved list 
All comments are visible to every user.

Mongoose models:
* associates sites with articles, articles with comments, users with comments, and users with saved articles.
* Articles are checked to make sure duplicates aren't stored.
* Usernames are checked for duplicates.

## TO DO
* when not logged in user clicks on save, prompt them to log in, currently showing "cannot get..."
* sort results newest at the top
* delete old articles after a certain time. 1 week?
* make time look nicer, use momentjs in pre functions on model
* make it so saved articles show as already saved, can't be saved twice

Optional To Do's:
* sort saved articles on date saved (would need to update article on save)
* add time/date published to articles model, selectors, and display
* link username in comment to email address (not a good idea?)
