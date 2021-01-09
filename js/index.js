//-----
// APP
//-----

const app = {
  currentChannel: null,
  selectedPlaylistItems: {},
};

const USERS = {
  "BradleyBieraMusic": "UC6gN3HTPu-Lo9O3XwdYEtsg",
  "Bradley Biera": "UCk9xSbcaUpwWvJTRbqrPQXQ",
};

const DEFAULT_USER = "BradleyBieraMusic";

const updateCurrentChannel = function(username) {
  //Update the selected useranme option
  const usernameSelect = document.getElementById("username-select");
  usernameSelect.value = username;

  //Update the playlists
  const user = app.channels[username];
  app.currentChannel = user;
  renderPlaylists(user.id);
};

const loadUsernamesSelect = function() {
  app.channels = {};
  let numOfResponses = 0;
  const usernameSelect = document.getElementById("username-select");

  const callback = function() {
    //Add the <option>s for each user channel
    Object.keys(app.channels).sort().forEach(channelName => {
      const channel = app.channels[channelName];
      usernameSelect.innerHTML += `<option class=\"username-select-option\">${channel.title}</option>`;
    });

    //Set our default channel
    updateCurrentChannel(DEFAULT_USER);
  };

  getYouTubeChannel(Object.values(USERS), channelsData => {
    //Save our channels
    channelsData.forEach(channelData => {
      const channel = {
        id: channelData.id,
        title: channelData.snippet.title,
        description: channelData.snippet.description,
        kind: channelData.kind,
        publishedAt: channelData.snippet.publishedAt,
        thumbnail: channelData.snippet.thumbnails.default,
      };

      app.channels[channel.title] = channel;
    });

    //End with our callback
    callback();
  }); //end getYouTubeChannel()
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
    playlistItemSelectionListPlaylistItemsContainer.innerHTML += buildResourceContainer("playlistItem", addedPlaylistItem.id, addedPlaylistItem.thumbnail.url, addedPlaylistItem.title, addedPlaylistItem.description, addedPlaylistItem.privacyStatus, null)
  );

  //Remove unselected playlist items
  const deletedChildren = new Array(...playlistItemSelectionListPlaylistItemsContainer.children).filter(element=>
    !Object.keys(app.selectedPlaylistItems).includes(element.getAttribute("data-playlist-item-id"))
  ); //.map(element => app.selectedPlaylistItems[element.getAttribute("data-playlist-item-id")]);

  deletedChildren.forEach(deletedChild =>
      playlistItemSelectionListPlaylistItemsContainer.removeChild(deletedChild)
  );
};

const buildResourceContainer = function(resource, id, image, title, description, privacyStatus, videoCount) {
  let privacyStatusClass = null;
  switch (privacyStatus) {
    case "public":
      privacyStatusClass = "fas fa-globe-americas";
      break;
    case "private":
      privacyStatusClass = "fas fa-lock";
      break;
    default:
      privacyStatusClass = "fas fa-question";
      break;
  }

  switch (resource) {
    case "playlist":
      return `<div class=\"playlist-container\" data-playlist-id=\"${id}\"> `+
          `<section class=\"playlist-section playlist-section-main\"> `+
            `<img class=\"playlist-image\" src=\"${image}\"></img> `+
            `<div class=\"playlist-info\"> `+
              `<h3 class=\"playlist-title\">${title}</h3> `+
              `<i class="playlist-privacy-icon ${privacyStatusClass}"></i> `+
              `<span class=\"playlist-video-count\">${videoCount} video${(videoCount > 1 ? "s" : "")}</span> `+
              `<div class=\"playlist-description\"> `+
                `${(description.length <= 50 ? description : description.substring(0,47)+"...")} `+
              `</div> `+
            `</div> `+
          `</section> `+
          `<div class=\"playlist-section playlist-items-container shrink\"> `+
          `</div> `+
        `</div>`;
    case "playlistItem":
      return `<div class=\"playlist-item-container\" data-playlist-item-id=\"${id}\" data-checked=\"false\">`+
          `<img class=\"playlist-item-image\" src=\"${image}\"></img>`+
          `<div class=\"playlist-item-info\">`+
            `<h3 class=\"playlist-item-title\">${title}</h3>`+
            `<i class="playlist-item-privacy-icon ${privacyStatusClass}"></i> `+
            `<span class=\"playlist-item-description\">${(description.length <= 50 ? description : description.substring(0,47)+"...")}</span>`+
          `</div>`+
          `<label class="checkbox playlist-item-checkbox"> `+
            `<input type="checkbox" class="checkbox-input"> `+
            `<div class="checkbox-icon-container"> `+
              `<i class="fas fa-check checkbox-icon"></i> `+
            `</div> `+
          `</label> `+
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

  return `<div class="playlist-item-selection-move-dialog-move-item" data-video-id="${videoId}" data-copy-status="${statusClass}"> `+
      `<i class="playlist-item-selection-move-dialog-move-item-copy-status ${statusIcon}"></i> `+
      `<img class="playlist-item-selection-move-dialog-move-item-thumbnail" src="${thumbnail}"> `+
      `<div class="playlist-item-selection-move-dialog-move-item-title">${title}</div> `+
      `<span class="playlist-item-selection-move-dialog-move-item-delete-status"></span>`+
    `</div>`;
};

const updateMoveDialogMoveItem = function(videoId, status) {
  let statusClass;
  let statusIcon;

  switch (status) {
    case "inprogress":
      statusIcon = "fas fa-spinner";
      break;
    case "success":
      statusIcon = "fas fa-check-circle";
      break;
    case "failure":
      statusIcon = "fas fa-times-circle";
      break;
    default:
      status = "unknown";
      statusIcon = "fas fa-question-circle";
      break;
  }

  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");
  const moveItems = new Array(...playlistItemSelectionMoveDialogMoveItemContainer.children).filter(child=>child.getAttribute("data-video-id") === videoId);

  moveItems.forEach(moveItem=>{
    moveItem.setAttribute("data-copy-status", status);

    const moveItemStatusIcon = new Array(...moveItem.children).filter(child=>child.classList.contains("playlist-item-selection-move-dialog-move-item-copy-status"))[0];
    moveItemStatusIcon.className = moveItemStatusIcon.className.replace(/fa\w fa-[\w-]+/, statusIcon);
  });
};

const updateDeleteDialogMoveItem = function(videoId, status) {
  let statusText;

  switch (status) {
    case "inprogress":
      statusText = "Removing...";
      break;
    case "success":
      statusText = "Removed.";
      break;
    case "failure":
      statusText = "Failed.";
      break;
    default:
      status = "unknown";
      statusText = "unknown";
      break;
  }

  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");
  const moveItems = new Array(...playlistItemSelectionMoveDialogMoveItemContainer.children).filter(child=>child.getAttribute("data-video-id") === videoId);

  moveItems.forEach(moveItem=>{
    moveItem.setAttribute("data-remove-status", status);

    const moveItemDeleteStatus = new Array(...moveItem.children).filter(child=>child.className.match("playlist-item-selection-move-dialog-move-item-delete-status"))[0];
    if (moveItemDeleteStatus.style.display !== "inline-block") moveItemDeleteStatus.style.display = "inline-block";
    moveItemDeleteStatus.innerText = statusText;
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
        privacyStatus: item.status.privacyStatus,
        itemCount: item.contentDetails.itemCount,
      };
    });

    playlistsContainer.innerHTML = "";
    for(const playlistId in app.currentChannel.playlists) {
      const playlist = app.currentChannel.playlists[playlistId];
      const playlistContainerHTML = buildResourceContainer("playlist", playlist.id, playlist.thumbnail.url, playlist.title, playlist.description, playlist.privacyStatus, playlist.itemCount);
      playlistsContainer.innerHTML += playlistContainerHTML;
    };

    new Array(...document.getElementsByClassName("playlist-section-main")).forEach(element=>{
      const playlistContainer = element.parentElement;
      addClickEventListener(element, event=>{
        renderPlaylistItems(playlistContainer.getAttribute("data-playlist-id"), playlistContainer);
      });
    });
  }; //end callback()

  getYouTubePlaylists(channelId, callback);
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
        privacyStatus: item.status.privacyStatus,
      };
    });

    playlistItemsContainer.innerHTML = "";
    app.currentChannel.playlists[playlistId].items.forEach(playlistItem=>{
      //Switch to appendChild from innerHTML append for better performance
      const element = document.createElement("div");
      playlistItemsContainer.appendChild(element);
      element.outerHTML = buildResourceContainer("playlistItem", playlistItem.id, playlistItem.thumbnail.url, playlistItem.title, playlistItem.description, playlistItem.privacyStatus);
    });

    new Array(...document.getElementsByClassName("playlist-item-container")).forEach(playlistItemContainer=>{
      addClickEventListener(playlistItemContainer, event=>{
        const checkbox = playlistItemContainer.querySelector(".checkbox-input");
        console.log(checkbox);
        checkbox.checked = !checkbox.checked;
        playlistItemContainer.setAttribute("data-checked", checkbox.checked);

        displayPlaylistItemSelectionContainer();

        const playlistItem = app.currentChannel.playlists[playlistId].items.filter(playlistItem => playlistItem.id === playlistItemContainer.getAttribute("data-playlist-item-id"))[0];
        updatePlaylistItemSelectionList(playlistItem, checkbox.checked);
      });
    });

    playlistItemsContainer.classList.remove("shrink");
  }; //end callback()

  getYouTubePlaylistItems(playlistId, callback);
};

const renderPlaylistItemSelectionMoveDialogPlaylistList = function() {
  const playlistItemSelectionMoveDialogPlaylistList = document.getElementById("playlist-item-selection-move-dialog-playlist-list");

  playlistItemSelectionMoveDialogPlaylistList.innerHTML = "";
    for(const playlistId in app.currentChannel.playlists) {
      const playlist = app.currentChannel.playlists[playlistId];
      const element = document.createElement("div");
      playlistItemSelectionMoveDialogPlaylistList.appendChild(element);
      element.outerHTML = buildResourceContainer("playlist", playlist.id, playlist.thumbnail.url, playlist.title, playlist.description, playlist.privacyStatus, playlist.itemCount);
    };
};

window.addEventListener("load", event=>{
  if (!window.loaded) {
    initAuthorization(loadUsernamesSelect);
    window.loaded = true;
  }
});

document.getElementById("username-select").addEventListener("input", event=>{
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
  const insertPlaylistItemsArray = Object.keys(app.selectedPlaylistItems).map(playlistItemId=>{return app.selectedPlaylistItems[playlistItemId];});
  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");

  //console.log(insertPlaylistId, insertPlaylistItemsArray);

  const insertVideo = function(insertedPlaylistItem, callback) {
    const bodyParams = {
      snippet: {
        playlistId: insertPlaylistId,
        resourceId: {
          kind: "youtube#video",
          videoId: insertedPlaylistItem.videoId,
        }
      }
    };

    //Create a child element, if necessary
    if (new Array(...playlistItemSelectionMoveDialogMoveItemContainer.children).filter(child=>child.getAttribute("data-video-id") === insertedPlaylistItem.videoId)) {
      playlistItemSelectionMoveDialogMoveItemContainer.innerHTML += buildMoveDialogMoveItem(insertedPlaylistItem.videoId, insertedPlaylistItem.thumbnail.url, insertedPlaylistItem.title, "inprogress");
      playlistItemSelectionMoveDialogMoveItemContainer
    }

    //Add the playlist item
    addYouTubePlaylistItem(
      bodyParams,
      result => {
        updateMoveDialogMoveItem(insertedPlaylistItem.videoId, "success");
        callback(result);
      },
      err => {
        updateMoveDialogMoveItem(insertedPlaylistItem.videoId, "failure");
        callback(false);
      },
    );
  };

  const insertVideos = function(playlistItemsArray, index, retry, callback) {
    retry = retry || 0;
    const retryMax = 1;
    const playlistItem = playlistItemsArray[index];
    const hasNextVideo = (index < playlistItemsArray.length-1 ? true : false);

    insertVideo(playlistItem, success=>{
      if (success) {
        if (hasNextVideo) {
          insertVideos(playlistItemsArray, index+1, null, callback);
        }
        else {
          callback();
        }
      }
      else {
        if (retry >= retryMax) {
          console.error("Failed to insert video. Continuing...");
          insertVideos(playlistItemsArray, index+1, null, callback);
        }
        else {
          const timeout = 5000;
          console.error(`Could not insert video. Waiting ${timeout/1000} seconds for ${retryMax - retry} more retr${(retryMax - retry === 1 ? "y" : "ies")}...`);
          window.setTimeout(()=>{insertVideos(playlistItemsArray, index, retry+1, callback)}, timeout);
        }
      }
    });
  };

  const callback = function() {
    togglePlaylistItemSelectionDeleteDialogBackground(true);
  };

  insertVideos(insertPlaylistItemsArray, 0, null, callback);
});

const togglePlaylistItemSelectionDeleteDialogBackground = function(displayBoolean) {
  const playlistItemSelectionDeleteDialogBackground = document.getElementById("playlist-item-selection-delete-dialog-background");

  if (displayBoolean === null || displayBoolean === undefined) {
    displayBoolean = !playlistItemSelectionDeleteDialogBackground.classList.contains(
  "display")
  }

  if (displayBoolean) {
    playlistItemSelectionDeleteDialogBackground.classList.add("display");
  }
  else {
    playlistItemSelectionDeleteDialogBackground.classList.remove("display");
  }
};

addClickEventListener(document.getElementById("playlist-item-selection-delete-dialog-cancel-button"), event=>{togglePlaylistItemSelectionDeleteDialogBackground(false);});

addClickEventListener(document.getElementById("playlist-item-selection-delete-dialog-remove-button"), event=>{
  const insertedPlaylistItemsArray = Object.keys(app.selectedPlaylistItems).map(playlistItemId=>{return app.selectedPlaylistItems[playlistItemId];});
  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");

  const removePlaylistItemFromSourcePlaylist = function(insertedPlaylistItem, callback) {
    deleteYouTubePlaylistItem(
      insertedPlaylistItem.id,
      response => {
        updateDeleteDialogMoveItem(insertedPlaylistItem.videoId, "success");
        callback(response);
      },
      err => {
        updateDeleteDialogMoveItem(insertedPlaylistItem.videoId, "failure");
        callback(false);
      },
    );
  };

  const removePlaylistItemFromSourcePlaylists = function(playlistItemsArray, index, retry, callback) {
    retry = retry || 0;
    const retryMax = 1;
    const playlistItem = playlistItemsArray[index];
    const hasNextVideo = (index < playlistItemsArray.length-1 ? true : false);

    //First, assure we don't attempt to remove playlist items that failed to copy
    const moveItem = new Array(...playlistItemSelectionMoveDialogMoveItemContainer.children).filter(child=>child.getAttribute("data-video-id") === playlistItem.videoId)[0];
    if (moveItem.getAttribute("data-copy-status") !== "success") {
      if (hasNextVideo) {
        removePlaylistItemFromSourcePlaylists(playlistItemsArray, index+1, null, callback);
      }
      else {
        callback();
      }
      return;
    }

    //Remove the playlist item
    removePlaylistItemFromSourcePlaylist(playlistItem, success=>{
      if (success) {
        if (hasNextVideo) {
          removePlaylistItemFromSourcePlaylists(playlistItemsArray, index+1, null, callback);
        }
        else {
          callback();
        }
      }
      else {
        if (retry >= retryMax) {
          console.error("Failed to remove video from source playlist. Continuing...");
          removePlaylistItemFromSourcePlaylists(playlistItemsArray, index+1, null, callback);
        }
        else {
          const timeout = 5000;
          console.error(`Could not remove video from source playlist. Waiting ${timeout/1000} seconds for ${retryMax - retry} more retr${(retryMax - retry === 1 ? "y" : "ies")}...`);
          window.setTimeout(()=>{removePlaylistItemFromSourcePlaylists(playlistItemsArray, index, retry+1, callback)}, timeout);
        }
      }
    });
  };

  const callback = function() {
    console.info("Source playlist items removed.")
  };

  togglePlaylistItemSelectionDeleteDialogBackground(false);

  removePlaylistItemFromSourcePlaylists(insertedPlaylistItemsArray, 0, null, callback);
});
