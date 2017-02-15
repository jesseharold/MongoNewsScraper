$(document).ready(function(){
    //check for existing cookie
    var loggedInName = Cookies.get('newsCommentusername');
    var loggedInEmail = Cookies.get('newsCommentemail');

    if (getUrlVars){
        loggedInName = getUrlVars.username;
        loggedInEmail = getUrlVars.email;
        Cookies.set('newsCommentusername', loggedInName, { expires: 7 });
        Cookies.set('newsCommentemail', loggedInEmail, { expires: 7 });
    }
    if (loggedInName){
        login(loggedInName, loggedInEmail);
    }
});
function login(name, email){
    console.log("logged in as ", name, email);
    $("#loginBlock").hide();
    $("#logoutBlock span.userName").text(", " + name);
    $("#logoutBlock").show().find("button.logout").click(logout);
}
function logout(){
    console.log("logged out");
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
        var hashes = window.location.href.slice().split('&');
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    }
    return vars;
}