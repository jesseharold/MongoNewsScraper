$(document).ready(function(){
    //check for existing cookie
    var loggedInName = Cookies.get('newsCommentusername');
    var loggedInEmail = Cookies.get('newsCommentemail');

    $("input#login").click(function(){
        loggedInName = $(this).siblings("input[name=username]").val();
        loggedInEmail = $(this).siblings("input[name=email]").val();
        Cookies.set('newsCommentusername', loggedInName, { expires: 7 });
        Cookies.set('newsCommentemail', loggedInEmail, { expires: 7 });
        login(loggedInName, loggedInEmail);
    });
    if (loggedInName){
        login(loggedInName, loggedInEmail);
    }
});
function login(name, email){
    console.log("logged in as ", name, email);
    $("#loginBlock").hide();
    $("#logoutBlock span.userName").text(", " + name);
    $("#logoutBlock").show().find("button.logout").click(logout);
    // create new user in db
    $.ajax({
    type: "POST",
        url: "create/user",
        data: {
            username: name,
            email: email
        },
        success: createdUserSuccess,
        error: createdUserError,
        dataType: "JSON"
    });
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
function createdUserSuccess(data){
    console.log("success", data);
}
function createdUserError(err){
    console.error(err);
}