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
            $("p.formMessage").text("That username and email combination did not match existing user with " + prop + " " + val);
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
    $(".loginBlock").hover(function(){
        $(this).css("height", "auto");
    }, function(){
        $(this).css("height", 50);
    });

    // make save buttons into delete from saved buttons on saved articles page
    // if (window.location.href.indexOf("/saved/") > 0){
    //     $("ul.newsView a.viewSaved")
    //         .html("<strong>-</strong> Remove from Saved")
    //         .css("background-color", "#d86c48")
    //         .attr("href", function(){
    //             var linkParts = $(this).attr("href").split("save/");
    //             return "/unsave/" + linkParts[1];
    //         });
    // }
});//document ready

function login(name, email, userid){
    //console.log("logged in as ", name, email);
    $(".loginBlock").hide();
    $(".logoutBlock span.userName").text(", " + name);
    $(".logoutBlock").show().find("button.logout").click(logout);
    // add user id to forms, since it's only persisted on the front end
    $("form.commentForm input[name=author]").val(userid);
    $("form.commentForm textarea[name=commentText]").val("Comment on this article as " + name);
    $("a.viewSaved").attr("href", function(){
        return $(this).attr("href") + "/" + userid;
    });
}
function logout(){
    //console.log("logged out");
    Cookies.remove('newsCommentusername');
    Cookies.remove('newsCommentemail');
    loggedInName = null;
    loggedInEmail = null;
    $(".logoutBlock").hide().find("span.userName").text("");
    $(".loginBlock").show();
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