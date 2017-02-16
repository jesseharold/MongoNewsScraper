$(document).ready(function(){

    //--- USER MANAGEMENT ---//

    //check for existing cookie
    var loggedInName = Cookies.get('newsCommentusername');
    var loggedInEmail = Cookies.get('newsCommentemail');
    var loggedInId = Cookies.get('newsCommentId');
    var queryString = getUrlVars();
    // check for errors coming back from the server
    if (queryString.err){
        if (queryString.err == 11000){
            //duplicate user error, notify user
            var prop = queryString.errmsg.substring(queryString.errmsg.indexOf("index:%20")+9, queryString.errmsg.indexOf("dup%20key")-5);
            var val = queryString.errmsg.substring(queryString.errmsg.indexOf("dup%20key:%20%7B%20:%20%22")+26, queryString.errmsg.indexOf("%22%20%7D"));
            //console.log("A user already exists with " + prop + " " + val);
            $("p.formMessage").text("A user already exists with " + prop + " " + val);
        } else if (queryString.err == 90210){
            $("p.formMessage").text("Both username and email are required");   
        }
    }
    // check to see if we just redirected from creating a new user
    if (queryString.username && queryString.email){
        loggedInName = queryString.username;
        loggedInEmail = queryString.email;
        loggedInId = queryString.id;
        Cookies.set('newsCommentusername', loggedInName, { expires: 7 });
        Cookies.set('newsCommentemail', loggedInEmail, { expires: 7 });
        Cookies.set('newsCommentId', loggedInId, { expires: 7 });
    }
    if (loggedInName){
        login(loggedInName, loggedInEmail, loggedInId);
    }

    // --- EVENT HANDLERS ---//
    $("#loginBlock").hover(function(){
        $(this).css("height", "auto");
    }, function(){
        $(this).css("height", 50);
    });

    // a hack to get the the site id onto the comments forms
    // couldn't get the handlebars to work
    $("form.commentForm input[name=siteId]").val(function(){
        var newsUrl = window.location.href.indexOf("/news-site/");
        var siteID = "";
        if (newsUrl > 0){
            // if we're on a news page, get the id
            var siteID = window.location.href.substring(newsUrl+11, newsUrl+35);
        }
        return siteID;
    });
});//document ready

function login(name, email, userid){
    //console.log("logged in as ", name, email);
    $("#loginBlock").hide();
    $("#logoutBlock span.userName").text(", " + name);
    $("#logoutBlock").show().find("button.logout").click(logout);
    $("form.commentForm input[name=author]").val(userid);
}
function logout(){
    //console.log("logged out");
    Cookies.remove('newsCommentusername');
    Cookies.remove('newsCommentemail');
    loggedInName = null;
    loggedInEmail = null;
    $("#logoutBlock").hide().find("span.userName").text("");
    $("#loginBlock").show();
}
function getUrlVars(){
    var vars = false;
    var hash;
    var queryStringStart = window.location.href.indexOf('?') + 1;
    if (queryStringStart > 0){
        vars = [];
        var hashes = window.location.href.slice(queryStringStart).split('&');
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    }
    return vars;
}