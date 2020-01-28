// add custom menu
/* function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom GitHub Menu')
      .addItem('Get User Repos','getUserRepos')
      .addItem('Get rate quota','getGitHubRateLimit')
      .addToUi();
}


/***************************************/
// Get User Repos
/*function getUserRepos() {
   var service = getGithubService_();

   if (service.hasAccess()) {
     Logger.log("App has access.");
     var api = "https://api.github.com/users/benlcollins";  // example

     var headers = {
       "Authorization": "Bearer " + getGithubService_().getAccessToken(),
       "Accept": "application/vnd.github.v3+json"
     };

     var options = {
       "headers": headers,
       "method" : "GET",
       "muteHttpExceptions": true
     };

     var response = UrlFetchApp.fetch(api, options);

     var json = JSON.parse(response.getContentText());

     Logger.log(json); // example
   }
   else {
     Logger.log("App has no access yet.");

     // open this url to gain authorization from github
     var authorizationUrl = service.getAuthorizationUrl();
     Logger.log("Open the following URL and re-run the script: %s",
         authorizationUrl);
   }
 }

/***************************************/
// Get Rate limit
/*function getGitHubRateLimit() {
  // set up the service
  var service = getGithubService_();

  if (service.hasAccess()) {
    Logger.log("App has access.");

    var api = "https://api.github.com/rate_limit";

    var headers = {
      "Authorization": "Bearer " + getGithubService_().getAccessToken(),
      "Accept": "application/vnd.github.v3+json"
    };

    var options = {
      "headers": headers,
      "method" : "GET",
      "muteHttpExceptions": true
    };

    var response = UrlFetchApp.fetch(api, options);

    var json = JSON.parse(response.getContentText());
    var responseCode = response.getResponseCode();

    Logger.log(responseCode);

    Logger.log("You have " + json.rate.remaining + " requests left this hour.");

  }
  else {
    Logger.log("App has no access yet.");

    // open this url to gain authorization from github
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log("Open the following URL and re-run the script: %s",
        authorizationUrl);
  }
}
*/