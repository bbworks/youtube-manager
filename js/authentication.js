//-----------------------
// AUTHENTICATION
//-----------------------

//const apiKey = "";
//const clientId = "";
const scopes = ["https://www.googleapis.com/auth/youtube"];
const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

const authorizeButton = document.getElementById("authorize-button");
const signoutButton = document.getElementById("signout-button");

//create helper function to retrieve authorization credentials stored outside of version control
const fetchAuthCredentials = function(callback) {
  console.info("Fetching authorization credentials...");
  fetch("secret\\auth.json")
    .then(response=>response.json())
    .then(data=>{
      window.apiKey = data.web.api_key;
      window.clientId = data.web.client_id;
      console.info("Fetched authorization credentials.");
      callback();
    })
    .catch(err=>{console.err(err); window.alert("Failed to get authorization credentials. The application failed.", err)});
};

//Load the Google Client, OAuth2.0 libraries
const initAuthorization = function(loginCallback, logoutCallback) {
  fetchAuthCredentials(()=>{loadGoogleApis(loginCallback, logoutCallback)});
};

const loadGoogleApis = function(loginCallback, logoutCallback) {
  console.info("Loading Google Client, OAuth2.0 APIs...");
  gapi.load("client:auth2", ()=>{initializeGoogleApis(loginCallback, logoutCallback)});
};

//Initialize Google Client library (which simultaneously initializes Google OAuth2.0 library) and set up sign in listeners
const initializeGoogleApis = function(loginCallback, logoutCallback) {
  console.info("Loaded Google Client, OAuth2.0 APIs.");
  console.info("Initializing Google Client API...");
  gapi.client.init({
    apiKey: apiKey,
    clientId: clientId,
    scope: scopes.join(" "), //space delimited
    discoveryDocs: discoveryDocs,
  })
    .then(()=>{
      console.info("Initialized Google Client API.");
      //Listen for sign in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(
        isSignedIn => updateSigninStatus(isSignedIn, loginCallback, logoutCallback)
      );

      //Handle initial sign in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get(), loginCallback, logoutCallback);

      addClickEventListener(authorizeButton, handleAuthClick);
      addClickEventListener(signoutButton, handleSignoutClick);
    })
    .catch(err=>{
      console.error("Failed to initialize Google Client API.", err.error, err.details);
      // window.alert("Failed to initialize Google Client API. The application failed.", err);
    });
};

//Update UI sign in state changes
const updateSigninStatus = function(isSignedIn, loginCallback, logoutCallback) {
  console.info("Updating sign in status...");
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    signoutButton.removeAttribute("disabled");

    //Run the callback functions
    loginCallback();
  }
  else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";

    //Run the callback functions
    logoutCallback();
  }
  console.info("Updated sign in status.");
};

//Handle login
const handleAuthClick = function() {
  gapi.auth2.getAuthInstance().signIn();
};

//Handle logout
const handleSignoutClick = function() {
  gapi.auth2.getAuthInstance().signOut();
};

//Get channel from API
const getChannel = function(channel) {
  gapi.client.youtube.channels.list({
    part: "snippet,contentDetails,statistics",
    id: [channel.id],
  })
    .then(response => {if(response.result.pageInfo.totalResults === 0) {throw new Error();} console.log(response.result.items[0]);})
    .catch(err => {
    try {
      const error = JSON.parse(err.body).error;
      console.error(err);
      alert(`${error.code}: ${error.message}\r\n\r\nException: Error getting user ${channel.id}. The application failed.`);
    }
    catch {console.error(err); alert("The application failed.");}
  });
};
