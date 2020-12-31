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

//Initialize Google Client library (which simultaneously initializes Google OAuth2.0 library) and set up sign in listeners
const initializeGoogleApis = function(callback) {
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
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    //Handle initial sign in state
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    addClickEventListener(authorizeButton, handleAuthClick);
    addClickEventListener(signoutButton, handleSignoutClick);

    //Run the callback functions
    callback();
  });
};

//Update UI sign in state changes
const updateSigninStatus = function(isSignedIn) {
  console.info("Updating sign in status...");
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    signoutButton.removeAttribute("disabled");
    //getChannel(app.currentChannel);
  }
  else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
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

//Load the Google Client, OAuth2.0 libraries
const loadGoogleApis = function(callback) {
  console.info("Loading Google Client, OAuth2.0 APIs...");
  gapi.load("client:auth2", ()=>{initializeGoogleApis(callback)});
};

const initAuthorization = function(callback) {
  fetchAuthCredentials(()=>{loadGoogleApis(callback)});
};



//-----
// APP
//-----

const app = {
  currentChannel: null,
  selectedPlaylistItems: {},
};

let proxyUrl = "https://cors-anywhere.herokuapp.com/";
let baseUrl = "https://www.googleapis.com/youtube/v3";
let username = "bradleybieramusic";

const USERS = {
  "BradleyBieraMusic": null, //"UC6gN3HTPu-Lo9O3XwdYEtsg",
  "Bradley Biera": "UCk9xSbcaUpwWvJTRbqrPQXQ",
};

const addClickEventListener = function(element, func) {
  let touchIsMoving = false;
  element.addEventListener("mouseup", func);
  element.addEventListener("touchmove", event=>{touchIsMoving = true;});
  element.addEventListener("touchend", event=>{
    if(touchIsMoving) {
      touchIsMoving = false;
      return;
    }
    event.preventDefault();
    func(event);
  });
};

const buildFetchUrl = function(data, params) {
  let returnUrl = `${baseUrl}/${data}?`; //`${proxyUrl}${baseUrl}/${data}?`;
  if(params) {
    for(param in params) {
      returnUrl += `${param}=${params[param]}&`;
    }
  }
  returnUrl += `part=snippet&key=${apiKey}`;
  return returnUrl;
};

//Recursive function by pageToken
const fetchDataByPage = function(url, method, body, callback) {
  const settings = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  };
  //TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
  if (method.toUpperCase() !== "GET") {
    settings.body = JSON.stringify(body);
  }

  fetch(
    url,
    settings,
  )
    .then(response => response.json())
    .then(data => callback(data));
}; //end fetchDataByPage()

const fetchData = function(url, method, body, pageToken, callback) {
  fetchDataByPage(url + (pageToken ? `&pageToken=${pageToken}` : ""), method, body, pageData => {
    if (pageData.nextPageToken) {
      fetchData(url, method, body, pageData.nextPageToken, newPageData => {callback(new Array(...pageData.items, ...newPageData));});
    }
    else {
      callback(new Array(...pageData.items));
    }
  });
}; //end fetchData()

const updateCurrentChannel = function(username) {
  app.currentChannel = app.channels[username];
  renderPlaylists(app.currentChannel.id);
};

const loadUsernamesSelect = function() {
  app.channels = {};
  let numOfResponses = 0;
  const usernameSelect = document.getElementById("username-select");

  const callback = function() {
    Object.keys(app.channels).sort().forEach(channelName => {
      const channel = app.channels[channelName];
      usernameSelect.innerHTML += `<option class=\"username-select-option\">${channel.title}</option>`;
    });

    updateCurrentChannel(usernameSelect.value);

    loadGoogleApis();
  };

  for(const user in USERS) {
    fetchData(
      buildFetchUrl("channels", (USERS[user] ? {"id":USERS[user]} : {"forUsername":user})),
      "GET",
      null,
      null,
      channelData => {
        const newChannels = channelData.map(item => {
          return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            kind: item.kind,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.default,
          };
        });

        newChannels.forEach(channel => {
         app.channels[user] = channel;
        });

        if (++numOfResponses === Object.keys(USERS).length) {
          callback();
        }
      }
    );//end fetchData()
  } //end for(user in USERS)
};

const displayPlaylistItemSelectionContainer = function() {
  const playlistItemSelectionContainer = document.getElementById("playlist-item-selection-container");
  const playlistItemSelectionCount = document.getElementById("playlist-item-selection-count");
  const playlistItemSelectionMoveDialogCount = document.getElementById("playlist-item-selection-move-dialog-count");

  const numOfCheckedPlaylistItems = new Array(...document.getElementsByClassName("playlist-item-container")).filter(element=>element.getAttribute("data-checked") === "true").length;

  playlistItemSelectionCount.innerText = numOfCheckedPlaylistItems;
  playlistItemSelectionMoveDialogCount.innerText = numOfCheckedPlaylistItems;

  if (numOfCheckedPlaylistItems > 0) {
    if (!playlistItemSelectionContainer.classList.contains("display")) {
      playlistItemSelectionContainer.classList.add("display");
    }
  }
  else {
    if (playlistItemSelectionContainer.classList.contains("display")) {
      playlistItemSelectionContainer.classList.remove("display");
    }
  }
};

const updatePlaylistItemSelectionList = function(playlistItem, isInsertedNotDeleted) {
  if (isInsertedNotDeleted) {
    if (!app.selectedPlaylistItems[playlistItem.id]) {
      app.selectedPlaylistItems[playlistItem.id] = playlistItem;
    }
  } else {
    if (app.selectedPlaylistItems[playlistItem.id]) {
      delete app.selectedPlaylistItems[playlistItem.id];
    }
  }

  renderPlaylistItemSelectionList();
};

const renderPlaylistItemSelectionList = function() {
  const playlistItemSelectionListPlaylistItemsContainer = document.getElementById("playlist-item-selection-list-playlist-items-container");

  //Insert newly selected playlist itemss
  const addedPlaylistItems = Object.keys(app.selectedPlaylistItems).filter(selectedPlaylistItemId =>
    !new Array(...playlistItemSelectionListPlaylistItemsContainer.children).map(element=>
        element.getAttribute("data-playlist-item-id")
    ).includes(selectedPlaylistItemId)).map(element=>app.selectedPlaylistItems[element]);

  addedPlaylistItems.forEach(addedPlaylistItem =>
    playlistItemSelectionListPlaylistItemsContainer.innerHTML += buildResourceContainer("playlistItem", addedPlaylistItem.id, addedPlaylistItem.thumbnail.url, addedPlaylistItem.title, addedPlaylistItem.description)
  );

  //Remove unselected playlist items
  const deletedChildren = new Array(...playlistItemSelectionListPlaylistItemsContainer.children).filter(element=>
    !Object.keys(app.selectedPlaylistItems).includes(element.getAttribute("data-playlist-item-id"))
  ); //.map(element => app.selectedPlaylistItems[element.getAttribute("data-playlist-item-id")]);

  deletedChildren.forEach(deletedChild =>
      playlistItemSelectionListPlaylistItemsContainer.removeChild(deletedChild)
  );
};

const buildResourceContainer = function(resource, id, image, title, description) {
  switch (resource) {
    case "playlist":
      return `<div class=\"playlist-container\" data-playlist-id=\"${id}\"> `+
          `<section class=\"playlist-section playlist-section-main\"> `+
              `<img class=\"playlist-image\" src=\"${image}\"></img> `+
            `<div class=\"playlist-info\"> `+
              `<h3 class=\"playlist-title\">${title}</h3> `+
              `<span class=\"playlist-description\">${(description.length <= 50 ? description : description.substring(0,47)+"...")}</span> `+
          `</section> `+
          `<div class=\"playlist-section playlist-items-container shrink\"> `+
          `</div> `+
        `</div>`;
    case "playlistItem":
      return `<div class=\"playlist-item-container\" data-playlist-item-id=\"${id}\" data-checked=\"false\">`+
        `<img class=\"playlist-item-image\" src=\"${image}\"></img>`+
        `<div class=\"playlist-item-info\">`+
          `<h3 class=\"playlist-item-title\">${title}</h3>`+
          `<span class=\"playlist-item-description\">${(description.length <= 50 ? description : description.substring(0,47)+"...")}</span>`+
      `</div>`+
      `<input type="checkbox" class="playlist-item-checkbox" />`+
    `</div>`;
  };
};

const buildMoveDialogMoveItem = function(videoId, thumbnail, title, status) {
  let statusClass;
  let statusIcon;

  switch (status) {
    case "inprogress":
      statusClass = "inprogress";
      statusIcon = "fas fa-spinner";
      break;
    case "success":
      statusClass = "success";
      statusIcon = "fas fa-check-circle";
      break;
    case "failure":
      statusClass = "failure";
      statusIcon = "fas fa-times-circle";
      break;
    default:
      statusClass = "unknown";
      statusIcon = "fas fa-question-circle";
      break;
  }

  return `<div class="playlist-item-selection-move-dialog-move-item" data-video-id="${videoId}"> `+
      `<i class="playlist-item-selection-move-dialog-move-item-status-${statusClass} ${statusIcon}"></i> `+
      `<img class="playlist-item-selection-move-dialog-move-item-thumbnail" src="${thumbnail}"> `+
      `<div class="playlist-item-selection-move-dialog-move-item-title">${title}</div> `+
    `</div>`;
};

const updateMoveDialogMoveItem = function(videoId, status) {
  let statusClass;
  let statusIcon;

  switch (status) {
    case "inprogress":
      statusClass = "inprogress";
      statusIcon = "fas fa-spinner";
      break;
    case "success":
      statusClass = "success";
      statusIcon = "fas fa-check-circle";
      break;
    case "failure":
      statusClass = "failure";
      statusIcon = "fas fa-times-circle";
      break;
    default:
      statusClass = "unknown";
      statusIcon = "fas fa-question-circle";
      break;
  }

  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");
  const moveItems = new Array(...playlistItemSelectionMoveDialogMoveItemContainer.children).filter(child=>child.getAttribute("data-video-id") === videoId);

  moveItems.forEach(moveItem=>{
    const moveItemStatusIcon = new Array(...moveItem.children).filter(child=>child.className.match("playlist-item-selection-move-dialog-move-item-status"))[0];
    moveItemStatusIcon.className = moveItemStatusIcon.className.replace(/playlist-item-selection-move-dialog-move-item-status-\w+/, `playlist-item-selection-move-dialog-move-item-status-${statusClass}`).replace(/fa\w fa-[\w-]+/, statusIcon);
  });
};

const renderPlaylists = function(channelId) {
  const playlistsContainer = document.getElementById("playlists-container");

  const callback = function(playlistData) {
    app.currentChannel.playlists = {};
    playlistData.forEach(item => {
      app.currentChannel.playlists[item.id] = {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        kind: item.kind,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.default,
      };
    });

    playlistsContainer.innerHTML = "";
    for(const playlistId in app.currentChannel.playlists) {
      const playlist = app.currentChannel.playlists[playlistId];
      const playlistContainerHTML = buildResourceContainer("playlist", playlist.id, playlist.thumbnail.url, playlist.title, playlist.description);
      playlistsContainer.innerHTML += playlistContainerHTML;
    };

    new Array(...document.getElementsByClassName("playlist-section-main")).forEach(element=>{
      const playlistContainer = element.parentElement;
      addClickEventListener(element, event=>{
        renderPlaylistItems(playlistContainer.getAttribute("data-playlist-id"), playlistContainer);
      });
    });
  }; //end callback()

  fetchData(
    buildFetchUrl("playlists", {"channelId":channelId}),
    "GET",
    null,
    null,
    callback
  ); //end fetchData(playlistData)
};

const renderPlaylistItems = function(playlistId, playlistContainer) {
  const playlistItemsContainer = new Array(...playlistContainer.children).filter(element=>element.classList.contains("playlist-items-container"))[0];

  if (app.currentChannel.playlists[playlistId].items && app.currentChannel.playlists[playlistId].items.length) {
    if (playlistItemsContainer.classList.contains("shrink")) {
      playlistItemsContainer.classList.remove("shrink");
    }
    else {
      playlistItemsContainer.classList.add("shrink");
    }
    return;
  }

  const callback = function(playlistItemData) {
    app.currentChannel.playlists[playlistId].items = playlistItemData.map(item => {
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        kind: item.kind,
        position: item.snippet.position,
        channelId: item.snippet.channelId,
        playlistId: item.snippet.playlistId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: (Object.keys(item.snippet.thumbnails).length ? item.snippet.thumbnails.default : {url: "https://i.ytimg.com/img/no_thumbnail.jpg" /*no thumbnail*/, width: 120, height: 90,}),
        videoId: item.snippet.resourceId.videoId,
      };
    });

    playlistItemsContainer.innerHTML = "";
    app.currentChannel.playlists[playlistId].items.forEach(playlistItem=>{
      const playlistItemContainerHTML = buildResourceContainer("playlistItem", playlistItem.id, playlistItem.thumbnail.url, playlistItem.title, playlistItem.description);
      playlistItemsContainer.innerHTML += playlistItemContainerHTML;
    });

    new Array(...document.getElementsByClassName("playlist-item-container")).forEach(playlistItemContainer=>{
      addClickEventListener(playlistItemContainer, event=>{
        const checkbox = new Array(...playlistItemContainer.children).filter(element=>element.classList.contains("playlist-item-checkbox"))[0];
        checkbox.checked = !checkbox.checked;
        playlistItemContainer.setAttribute("data-checked", checkbox.checked);

        displayPlaylistItemSelectionContainer();

        const playlistItem = app.currentChannel.playlists[playlistId].items.filter(playlistItem => playlistItem.id === playlistItemContainer.getAttribute("data-playlist-item-id"))[0];
        updatePlaylistItemSelectionList(playlistItem, checkbox.checked);
      });
    });

    // new Array(...document.getElementsByClassName("playlist-item-checkbox")).forEach(element=>{
    //   const playlistItemContainer = element.parentElement;
    //   element.addEventListener("input", event=>{
    //     if (element.checked) {
    //       //Uncheck it
    //       if (!element.classsList.contains("fa-circle")) {element.classList.add("fa-circle");}
    //       if (element.classsList.contains("fa-check-circle")) {element.classList.remove("fa-check-circle");}
    //     }
    //     else {
    //       //check it
    //       if (!element.classsList.contains("fa-check-circle")) {element.classList.add("fa-check-circle");}
    //       if (element.classsList.contains("fa-circle")) {element.classList.remove("fa-circle");}
    //     }
    //   });
    // });

    playlistItemsContainer.classList.remove("shrink");
  }; //end callback()

  fetchData(
    buildFetchUrl("playlistItems", {"playlistId":playlistId}),
    "GET",
    null,
    null,
    callback
  );
};

const renderPlaylistItemSelectionMoveDialogPlaylistList = function() {
  const playlistItemSelectionMoveDialogPlaylistList = document.getElementById("playlist-item-selection-move-dialog-playlist-list");

  playlistItemSelectionMoveDialogPlaylistList.innerHTML = "";
    for(const playlistId in app.currentChannel.playlists) {
      const playlist = app.currentChannel.playlists[playlistId];
      const playlistContainerHTML = buildResourceContainer("playlist", playlist.id, playlist.thumbnail.url, playlist.title, playlist.description);
      playlistItemSelectionMoveDialogPlaylistList.innerHTML += playlistContainerHTML;
    };
};

window.addEventListener("load", event=>{
  if (!window.loaded) {
    initAuthorization(loadUsernamesSelect);
    window.loaded = true;
  }
});

document.getElementById("username-select").addEventListener("change", event=>{
  updateCurrentChannel(document.getElementById("username-select").value);
});

addClickEventListener(document.getElementById("playlist-item-selection-list-button"), event=>{
  const playlistItemSelectionListContainer = document.getElementById("playlist-item-selection-list-container");

  if (playlistItemSelectionListContainer.classList.contains(
"display")) {
    playlistItemSelectionListContainer.classList.remove("display");
  }
  else {
    playlistItemSelectionListContainer.classList.add("display");
  }
});

addClickEventListener(document.getElementById("playlist-item-selection-move-button"), event=>{
  const playlistItemSelectionMoveDialogBackground = document.getElementById("playlist-item-selection-move-dialog-background");

  renderPlaylistItemSelectionMoveDialogPlaylistList();

  if (playlistItemSelectionMoveDialogBackground.classList.contains(
"display")) {
    playlistItemSelectionMoveDialogBackground.classList.remove("display");
  }
  else {
    playlistItemSelectionMoveDialogBackground.classList.add("display");
  }

  new Array(...document.querySelectorAll("#playlist-item-selection-move-dialog .playlist-container")).forEach(element=>{
    addClickEventListener(element, event=>{
      const playlistContainers = new Array(...document.querySelectorAll("#playlist-item-selection-move-dialog .playlist-container"));
      const playlistItemSelectionMoveDialogSelectedPlaylist = document.getElementById("playlist-item-selection-move-dialog-selected-playlist");
      app.selectedPlaylist = app.currentChannel.playlists[element.getAttribute("data-playlist-id")];

      playlistItemSelectionMoveDialogSelectedPlaylist.innerText = app.currentChannel.playlists[element.getAttribute("data-playlist-id")].title;

      if (element.classList.contains("unselected")) {
        element.classList.remove("unselected");
      }

      playlistContainers.filter(playlistElement => playlistElement !== element)
        .forEach(eachElement=>{
          if (!eachElement.classList.contains("unselected")) {
              eachElement.classList.add("unselected");
          }
        });

      if (document.querySelectorAll("#playlist-item-selection-move-dialog .playlist-container.unselected").length > 0) {
        const copyButton = document.getElementById("playlist-item-selection-move-dialog-copy-button");
        copyButton.removeAttribute("disabled");
      }
      else {
        const copyButton = document.getElementById("playlist-item-selection-move-dialog-copy-button");
        copyButton.setAttribute("disabled", "true");
      }
    });
  });
});

addClickEventListener(document.getElementById("playlist-item-selection-move-dialog-back-button"), event=>{
  const playlistItemSelectionMoveDialogBackground = document.getElementById("playlist-item-selection-move-dialog-background");

  if (playlistItemSelectionMoveDialogBackground.classList.contains(
"display")) {
    playlistItemSelectionMoveDialogBackground.classList.remove("display");
  }
});

addClickEventListener(document.getElementById("playlist-item-selection-move-dialog-copy-button"), event=>{
  const insertPlaylistId = app.selectedPlaylist.id;
  const insertPlaylistVideosArray = Object.keys(app.selectedPlaylistItems).map(playlistItemId=>{return app.selectedPlaylistItems[playlistItemId];});
  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");

  //console.log(insertPlaylistId, insertPlaylistVideosArray);

  const insertVideo = function(insertedVideo, callback) {
    const bodyParams = {
      snippet: {
        playlistId: insertPlaylistId,
        resourceId: {
          kind: "youtube#video",
          videoId: insertedVideo.videoId,
        }
      }
    };

    //Create a child element, if necessary
    if (new Array(...playlistItemSelectionMoveDialogMoveItemContainer.children).filter(child=>child.getAttribute("data-video-id") === insertedVideo.videoId)) {
      playlistItemSelectionMoveDialogMoveItemContainer.innerHTML += buildMoveDialogMoveItem(insertedVideo.videoId, insertedVideo.thumbnail.url, insertedVideo.title, "inprogress");
      playlistItemSelectionMoveDialogMoveItemContainer
    }

    //console.log(buildFetchUrl("playlistItems"), bodyParams);

    //window.setTimeout(()=>{updateMoveDialogMoveItem(insertedVideo.videoId, "failure");}, 2000);

    gapi.client.youtube.playlistItems.insert({
      part: [
        "snippet",
      ],
      resource: bodyParams,
    })
    .then(response=>{
      updateMoveDialogMoveItem(insertedVideo.videoId, "success");
      console.log(response.result);
      callback(true);
    })
    .catch(err=>{
      updateMoveDialogMoveItem(insertedVideo.videoId, "failure");
      console.error(err);
      callback(false);
    });

    /*fetchData(
      buildFetchUrl("playlistItems"),
      "POST",
      bodyParams,
      null,
      newPlaylistItems => {
        // const insertedPlaylistItems = newPlaylistItems.map(item => {
        //   return {
        //     id: item.id,
        //     title: item.snippet.title,
        //     description: item.snippet.description,
        //     kind: item.kind,
        //     publishedAt: item.snippet.publishedAt,
        //     thumbnail: item.snippet.thumbnails.default,
        //   };
        // });

        console.log(newPlaylistItems);
      }
    ); //end fetchData()*/
  };

  const insertVideos = function(videosArray, index, retry, callback) {
    retry = retry || 0;
    const retryMax = 1;
    const video = videosArray[index];
    const nextVideo = (index < videosArray.length-1 ? true : false);

    insertVideo(video, success=>{
      if (success) {
        if (nextVideo) {
          insertVideos(videosArray, index+1, null, callback);
        }
        else {
          callback();
        }
      }
      else {
        if (retry > retryMax) {
          console.error("Failed to insert video. Continuing...");
          insertVideos(videosArray, index+1, null, callback);
        }
        else {
          const timeout = 5000;
          console.error(`Waiting ${timeout/1000} seconds for retry.`);
          window.setTimeout(()=>{insertVideos(videosArray, index, retry+1, callback)}, timeout);
        }
      }
    });
  };

  const callback = function() {
    console.info("Videos inserted.")
  };

  insertVideos(insertPlaylistVideosArray, 0, null, callback);
});
