//-----
// APP
//-----

//Declare variables
const app = {}; //create an app singleton variable

const USERS = {
  "BradleyBieraMusic": "UC6gN3HTPu-Lo9O3XwdYEtsg",
  "Bradley Biera": "UCk9xSbcaUpwWvJTRbqrPQXQ",
};

const DEFAULT_USER = "BradleyBieraMusic";


//Declare functions
const startApp = function() {
  updateUsernameContainer();
};

const stopApp = function() {
  //Declare variables
  const playlistsContainer = document.getElementById("playlists-container");
  const usernameContainer = document.getElementById("username-container");

  //Hide the playlists-container
  toggleVisibility(playlistsContainer, false);

  //Hide the username container
  toggleVisibility(usernameContainer, false);

};

const updateUsernameContainer = function() {
  //Iterate through our USERS, getting their channel data
  getYouTubeChannelMine(channelData => {
    //Set app singleton property
    app.channels = {};

    //Save the channel
    const channel = {
      id: channelData.id,
      title: channelData.snippet.title,
      description: channelData.snippet.description,
      kind: channelData.kind,
      publishedAt: channelData.snippet.publishedAt,
      thumbnail: channelData.snippet.thumbnails.default,
    };

    app.channels[channel.title] = channel;

    //Render the channels to the usernames select
    renderUsernameText(channel);
  }); //end getYouTubeChannel()
};

const buildUsernameNode = function(channel) {
  return `<a href="https://youtube.com/channel/${channel.id}" target="_blank">${channel.title}</a>`;
};

const renderUsernameText = function(channel) {
  //Declare variables
  const usernameText = document.getElementById("username-text");
  const usernameContainer = document.getElementById("username-container");

  //Set the container innerHTML
  usernameText.innerHTML = buildUsernameNode(channel);

  //Unhide the container
  toggleVisibility(usernameContainer, true);

  //Set our default channel
  updateCurrentChannel(channel.title);
};

const toggleVisibility = function(element, shouldBeVisible) {
  //Declare variables
  const isHidden = element.classList.contains("hidden");

  //Either toggle the visibility, or set it according to the params
  if (shouldBeVisible === null || shouldBeVisible === undefined)
    shouldBeVisible = !isHidden;

  if (shouldBeVisible && isHidden) {
    element.classList.remove("hidden");
  }
  else if (!shouldBeVisible && !isHidden) {
    element.classList.add("hidden");
  }
};

const updateCurrentChannel = function(username) {
  //Declare variables
  const usernameText = document.getElementById("username-text");
  const playlistsContainer = document.getElementById("playlists-container");

  //Update the current channel
  app.currentChannel = username;

  //Clear app selection properties
  resetAppProps();

  //Un-hide the playlists-container
  toggleVisibility(playlistsContainer, true);

  //Render the playlists
  updatePlaylists(app.channels[app.currentChannel].id);
};

const convertToHtml = function(text) {
  return text.toString().replace("\"", "&quot;");
}

const buildResourceContainer = function(resourceType, resource) {
  //Declare variables
  let privacyStatusClass = null;
  let privacyStatusTooltip = resource.privacyStatus.replace(/(.)(.+)/, (p1,p2,p3)=>`${p2.toUpperCase()}${p3}`); //capitalize first letter of status

  switch (resource.privacyStatus) {
    case "public":
      privacyStatusClass = "fas fa-globe-americas";
      break;
    case "private":
      privacyStatusClass = "fas fa-lock";
      break;
    case "unlisted":
      privacyStatusClass = "fas fa-eye-slash";
      break;
    default:
      privacyStatusClass = "fas fa-question";
      break;
  }

  //Return the resource HTML
  switch (resourceType) {
    case "playlist":
      return `<div class=\"playlist-container\" data-playlist-id=\"${convertToHtml(resource.id)}\"> `+
          `<section class=\"playlist-section playlist-section-main\"> `+
            `<img class=\"playlist-image\" src=\"${convertToHtml(resource.thumbnail.url)}\"></img> `+
            `<div class=\"playlist-info\"> `+
              `<h3 class=\"playlist-title\" title=\"${convertToHtml(resource.title)}\">${convertToHtml((resource.title.length <= 50 ? resource.title : resource.title.substring(0,47)+"..."))}</h3>`+
              `<i class="playlist-privacy-icon ${convertToHtml(privacyStatusClass)}" title=\"${convertToHtml(privacyStatusTooltip)}\"></i> `+
              `<span class=\"playlist-video-count\">${convertToHtml(resource.itemCount)} video${convertToHtml((resource.itemCount !== 1 ? "s" : ""))}</span> `+
              `<div class=\"playlist-description\" title=\"${convertToHtml(resource.description)}\"> `+
                `${convertToHtml((resource.description.length <= 100 ? resource.description : resource.description.substring(0,97)+"..."))} `+
              `</div> `+
            `</div> `+
            `<i class=\"playlist-loading-spinner fas fa-spinner\"></i> `+
          `</section> `+
          `<div class=\"playlist-section playlist-items-container shrink\"> `+
          `</div> `+
        `</div>`;
    case "playlistItem":
      return `<div class=\"playlist-item-container\" data-playlist-item-id=\"${convertToHtml(resource.id)}\" data-checked=\"false\">`+
          `<div class="playlist-item-image-container"> `+
            `<img class=\"playlist-item-image\" src=\"${convertToHtml(resource.thumbnail.url)}\"></img>`+
            `${(resource.duration ? `<span class="playlist-item-duration">${convertToHtml(resource.duration)}</span>` : "")}` +
          `</div> `+
          `<div class=\"playlist-item-info\">`+
            `<div class=\"playlist-item-title-container\"> `+
              `<h3 class=\"playlist-item-title\" title=\"${convertToHtml(resource.title)}\">${convertToHtml((resource.title.length <= 50 ? resource.title : resource.title.substring(0,47)+"..."))}</h3> `+
              `${(resource.definition === "hd" ? `<span class=\"playlist-item-definition-icon\" title=\"High Definition\">HD</span>` : "")}` +
              `${(resource.caption === true ? `<i class=\"playlist-item-caption-icon fas fa-closed-captioning\" title=\"Closed Captioning\"></i> ` : "")}` +
            `</div> `+
            `${(resource.channelTitle ? `<h5 class=\"playlist-item-channel-title\" title=\"${convertToHtml(resource.channelTitle)}\">${convertToHtml(resource.channelTitle)}</h5> ` : "")}` +
              `<i class="playlist-item-privacy-icon ${convertToHtml(privacyStatusClass)}" title="${convertToHtml(privacyStatusTooltip)}"></i> `+
            `<div class=\"playlist-item-description\" title=\"${convertToHtml(resource.description)}\"> `+
              `${convertToHtml((resource.description.length <= 80 ? resource.description : resource.description.substring(0,77)+"..."))} `+
            `</div>`+
          `</div>`+
          `<label class=\"checkbox playlist-item-checkbox\"> `+
            `<input type=\"checkbox\" class=\"checkbox-input\"> `+
            `<div class=\"checkbox-icon-container\"> `+
              `<i class=\"fas fa-check checkbox-icon\"></i> `+
            `</div> `+
          `</label> `+
        `</div>`;
  };
};

const updatePlaylists = function(channelId) {
  //Get the channel's playlist data
  getYouTubePlaylists(channelId, playlistsData => {
    //Set app singleton property
    app.channels[app.currentChannel].playlists = {};

    //Save the playlists
    playlistsData.forEach(playlistData => {
      const playlist = {
        id: playlistData.id,
        title: playlistData.snippet.title,
        description: playlistData.snippet.description,
        kind: playlistData.kind,
        channelId: playlistData.snippet.channelId,
        publishedAt: playlistData.snippet.publishedAt,
        thumbnail: playlistData.snippet.thumbnails.default,
        privacyStatus: playlistData.status.privacyStatus,
        itemCount: playlistData.contentDetails.itemCount,
      };

      app.channels[app.currentChannel].playlists[playlist.id] = playlist;
    });

    //Render the playlists to the playlists container
    renderPlaylists(channelId);
  }) //end getYouTubePlaylists();
};

const renderPlaylists = function(channelId) {
  //Declare variables
  const playlistsContainer = document.getElementById("playlists-container");

  //Reset the container content
  playlistsContainer.innerHTML = "";

  //Add the playlist container for each playlist
  for(const playlistId in app.channels[app.currentChannel].playlists) {
    const playlist = app.channels[app.currentChannel].playlists[playlistId];
    let playlistContainer = document.createElement("div"); //let so we can reassign after outerHTML overwrite
    playlistsContainer.appendChild(playlistContainer);
    playlistContainer.outerHTML = buildResourceContainer("playlist", playlist);

    //Add the click event listener for the playlist main section
    playlistContainer = document.querySelector(`.playlist-container[data-playlist-id=\"${playlistId}\"]`); //reset to the DOM element after overwritting outerHTML
    const playlistMainSection = playlistContainer.querySelector(".playlist-section-main");
    addClickEventListener(playlistMainSection, event=>handlePlaylistClick(playlistId));
  }; //end for(playlistId in playlists)
};

const updatePlaylistItems = function(playlistId) {
  //Get the playlist's playlistItems
  getYouTubePlaylistItems(playlistId, playlistItemsData => {
    //Set the app singleton property
    app.channels[app.currentChannel].playlists[playlistId].items = [];

    //Save the playlist items`
    playlistItemsData.forEach(playlistData => {
      const playlistItem = {
        id: playlistData.id,
        title: playlistData.snippet.title,
        description: playlistData.snippet.description,
        kind: playlistData.kind,
        position: playlistData.snippet.position,
        channelId: playlistData.snippet.channelId,
        playlistId: playlistData.snippet.playlistId,
        publishedAt: playlistData.snippet.publishedAt,
        thumbnail: (Object.keys(playlistData.snippet.thumbnails).length ? playlistData.snippet.thumbnails.default : {url: "https://i.ytimg.com/img/no_thumbnail.jpg" /*no thumbnail*/, width: 120, height: 90,}),
        videoId: playlistData.snippet.resourceId.videoId,
        privacyStatus: playlistData.status.privacyStatus,
      };

      app.channels[app.currentChannel].playlists[playlistId].items.push(playlistItem);
    });

    //Declare variables
    const videoIds = app.channels[app.currentChannel].playlists[playlistId].items.map(playlistItem=>playlistItem.videoId);

    //Get the playlist items' video resource
    getYouTubeVideo(videoIds, videosData => {
      const convertISO8601DurationToString = function(duration) {
        //Create helper function to return a leading zero
        // when needing constant 2 digits
        const addLeadingZero = function(num) {
          return `${(num.toString().length === 1 ? "0" : "")}${num}`;
        };

        const replaceFunction = function(p1,p2,p3,p4,p5) {
          const days = p2;
          const hours = p3;
          const minutes = p4;
          const seconds = p5;

          return (days ? days+" " : "") +
            (hours ? hours+":" : "") +
            (minutes ? (hours ? addLeadingZero(minutes) : minutes)+":" : "0:") +
            (seconds ? addLeadingZero(seconds) : "00") /*make sure that even no seconds is really ":00" seconds*/
        };

        const replaceRegexString =
          "P" +
          "(?:(\\d+)D)?" + //return days, if exist
          "T" +
          "(?:(\\d+)H)?" + //return hours, if exist
          "(?:(\\d+)M)?" + //return minutes, if exist
          "(?:(\\d+)S)?" //return seconds, if exist
          ;

        const replaceRegex = new RegExp(replaceRegexString);

        return duration.replace(
          replaceRegex,
          replaceFunction
        );
      };

      if (videosData) {
        app.channels[app.currentChannel].playlists[playlistId].items = app.channels[app.currentChannel].playlists[playlistId].items.map(playlistItem => {
          //Declare variables
          const videoResource = videosData.filter(videoData=>playlistItem.videoId === videoData.id)[0];

          //If there is no video resource (e.g. the video is private),
          // just return what we have from our playlist
          if (!videoResource) return playlistItem;

          //Otherwise, return more data
          return {
            ...playlistItem,
            ...{
              channelTitle: videoResource.snippet.channelTitle,
              caption: videoResource.contentDetails.caption,
              definition: videoResource.contentDetails.definition,
              duration: convertISO8601DurationToString(videoResource.contentDetails.duration),
            }
          };
        });
      }

      //Render the playlists items
      renderPlaylistItems(playlistId);
    }); //end getYouTubeVideo()
  }); //end getYouTubePlaylistItems()
};

const renderPlaylistItems = function(playlistId) {
  //Declare variables
  const playlistContainer = document.querySelector(`.playlist-container[data-playlist-id=${playlistId}]`);
  const playlistItemsContainer = playlistContainer.querySelector(".playlist-items-container");

  //Reset the container content
  playlistItemsContainer.innerHTML = "";

  //Add the playlist item container for each playlist
  app.channels[app.currentChannel].playlists[playlistId].items.forEach(playlistItem => {
    let playlistItemContainer = document.createElement("div"); //let so we can reassign after outerHTML overwrite
    playlistItemsContainer.appendChild(playlistItemContainer);
    playlistItemContainer.outerHTML = buildResourceContainer("playlistItem", playlistItem);

    //Add the click event listener for the playlist item container
    playlistItemContainer = document.querySelector(`.playlist-item-container[data-playlist-item-id=\"${playlistItem.id}\"]`); //reset to the DOM element after overwritting outerHTML
    addClickEventListener(playlistItemContainer, event=>handlePlaylistItemCheck(playlistItem, playlistItemContainer));
  });

  //Expand the playlist items container and remove the loading icon
  playlistItemsContainer.classList.remove("shrink");
  displayPlaylistLoadingIcon(playlistId, false);
};

const togglePlaylistItems = function(playlistId) {
  //Declare variables
  const playlistItemsContainer = document.querySelector(`.playlist-container[data-playlist-id=${playlistId}]`).querySelector(".playlist-items-container");

  //Shrink and expand the container, regardless of if there are items
  // (so we can still remove the padding from the empty container)
  if (playlistItemsContainer.classList.contains("shrink")) {
    playlistItemsContainer.classList.remove("shrink");
  }
  else {
    playlistItemsContainer.classList.add("shrink");
  }
};

const displayPlaylistLoadingIcon = function(playlistId, toDisplay) {
  const loadingIcon = document.querySelector(`.playlist-container[data-playlist-id=${playlistId}] .playlist-loading-spinner`);
  toDisplay = toDisplay || !loadingIcon.classList.contains("show");

  if (toDisplay) loadingIcon.classList.add("show")
  else loadingIcon.classList.remove("show");
};

const checkDisplayPlaylistItemSelectionContainer = function() {
  //Declare variables
  const playlistItemSelectionContainer = document.getElementById("playlist-item-selection-container");
  const playlistItemSelectionCount = document.getElementById("playlist-item-selection-count");
  const playlistItemSelectionMoveDialogCount = document.getElementById("playlist-item-selection-move-dialog-count");

  const numOfCheckedPlaylistItems = document.querySelectorAll(".playlist-item-container[data-checked=\"true\"]").length;
  const shouldDisplay = numOfCheckedPlaylistItems > 0;
  const isDisplayed = playlistItemSelectionContainer.classList.contains("display");

  //Set the number of selected items
  playlistItemSelectionCount.innerText = numOfCheckedPlaylistItems;
  playlistItemSelectionMoveDialogCount.innerText = numOfCheckedPlaylistItems;

  //Display (or not) the playlist item selection container, if applicable
  if (shouldDisplay) {
    if (!isDisplayed) playlistItemSelectionContainer.classList.add("display");
  }
  else {
    if (isDisplayed) playlistItemSelectionContainer.classList.remove("display");
  }
};

const checkDisplayPlaylistItemSelectionListContainer = function() {
  //Declare variables
  const playlistItemSelectionListContainer = document.getElementById("playlist-item-selection-list-container");
  const playlistItemSelectionContainer = document.getElementById("playlist-item-selection-container");

  const shouldNotDisplay = !playlistItemSelectionContainer.classList.contains("display");

  //Assume if the .playlist-item-selection-container is not displayed,
  // we should hide our .playlist-item-selection-list-container as well
  // Otherwise, if it's displayed, the .playlist-item-selection-list-container
  // can be displayed or not
  if (shouldNotDisplay) {
    playlistItemSelectionListContainer.classList.remove("display");
  }
};

const updatePlaylistItemSelectionList = function(playlistItem, shouldInsertNotDelete) {
  //Add or remove the playlist item selection
  if (shouldInsertNotDelete) {
    if (!app.selectedPlaylistItems[playlistItem.id]) {
      app.selectedPlaylistItems[playlistItem.id] = playlistItem;
    }
  } else {
    if (app.selectedPlaylistItems[playlistItem.id]) {
      delete app.selectedPlaylistItems[playlistItem.id];
    }
  }

  //Render the selected playlist items
  renderPlaylistItemSelectionList();
};

const renderPlaylistItemSelectionList = function() {
  const playlistItemSelectionListPlaylistItemsContainer = document.getElementById("playlist-item-selection-list-playlist-items-container");

  const addNewlySelectedPlaylistItems = function() {
    const addedPlaylistItems = Object.keys(app.selectedPlaylistItems)
      .filter(selectedPlaylistItemId =>
        !playlistItemSelectionListPlaylistItemsContainer.querySelector(`.playlist-item-container[data-playlist-item-id=\"${selectedPlaylistItemId}\"]`)
      )
      .map(selectedPlaylistItemId => app.selectedPlaylistItems[selectedPlaylistItemId]);

    addedPlaylistItems.forEach(addedPlaylistItem => {
      const addedPlaylistItemElement = document.createElement("div");
      playlistItemSelectionListPlaylistItemsContainer.appendChild(addedPlaylistItemElement);
      addedPlaylistItemElement.outerHTML = buildResourceContainer("playlistItem", addedPlaylistItem);
    });
  };

  const removeNewlyUnselectedPlaylistItems = function() {
    const deletedChildren = [...playlistItemSelectionListPlaylistItemsContainer.children].filter(child => !app.selectedPlaylistItems[child.getAttribute("data-playlist-item-id")]);

    deletedChildren.forEach(deletedChild =>
        playlistItemSelectionListPlaylistItemsContainer.removeChild(deletedChild)
    );
  };

  //Add playlist item containers for each selected playlist item
  addNewlySelectedPlaylistItems();

  //Remove unselected playlist items
  removeNewlyUnselectedPlaylistItems();
};

const buildMoveDialogMoveItem = function(videoId, thumbnail, title, status) {
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
      statusIcon = "fas fa-question-circle";
      break;
  }

  return `<div class="playlist-item-selection-move-dialog-move-item" data-video-id="${convertToHtml(videoId)}" data-copy-status="${convertToHtml(status)}"> `+
      `<i class="playlist-item-selection-move-dialog-move-item-copy-status ${convertToHtml(statusIcon)}"></i> `+
      `<img class="playlist-item-selection-move-dialog-move-item-thumbnail" src="${convertToHtml(thumbnail)}"> `+
      `<div class="playlist-item-selection-move-dialog-move-item-title">${convertToHtml(title)}</div> `+
      `<span class="playlist-item-selection-move-dialog-move-item-delete-status"></span>`+
    `</div>`;
};

const renderLinearGradient = function(element, degrees, leftColor, rightColor) {
  //Declare variables
  const regex = /linear-gradient\((\d+)deg, *(\w+|rgba?\( *\d{1,3} *, *\d{1,3} *, *\d{1,3} *(?:, *[\d\.]+ *)?\)) *, *(\w+|rgba?\( *\d{1,3} *, *\d{1,3} *, *\d{1,3} *(?:, *[\d\.]+ *)?\)) *\)/;
  const defaultDegrees = "90";
  const defaultColor = element.style.backgroundColor || window.getComputedStyle(element , null).getPropertyValue('background-color') || "white";

  //Check if we already have a linear-gradeitn background
  // if we do, use it as a default
  const matches = element.style.background.match(regex);
  if (matches) {
    degrees = degrees || matches[1];
    leftColor = leftColor || matches[2];
    rightColor = rightColor || matches[3];
  }

  //If we neither specified the param, nor have one set, set the default
  degrees = degrees || defaultDegrees;
  leftColor = leftColor || defaultColor;
  rightColor = rightColor || defaultColor;

  element.style.background = `linear-gradient(${degrees}deg, ${leftColor}, ${rightColor})`;
};

const updateMoveDialogMoveItem = function(videoId, thumbnail, title, status) {
  renderMoveDialogMoveItem(videoId, thumbnail, title, status);
};

const renderMoveDialogMoveItem = function(videoId, thumbnail, title, status) {
  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");
  let moveItem = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${videoId}\"]`); //let so we can reassign after outerHTML overwrite

  //If there isn't a move item yet created, create one
  if (!moveItem) {
    moveItem = document.createElement("div"); //let so we can reassign after outerHTML overwrite
    playlistItemSelectionMoveDialogMoveItemContainer.appendChild(moveItem);
  }

  //Update the HTML of the move item
  moveItem.outerHTML = buildMoveDialogMoveItem(videoId, thumbnail, title, status);
  moveItem = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${videoId}\"]`);
};

const updateDeleteDialogMoveItem = function(videoId, thumbnail, title, status) {
  renderDeleteDialogMoveItem(videoId, thumbnail, title, status);
};

const renderDeleteDialogMoveItem = function(videoId, thumbnail, title, status) {
  //Declare variables
  let statusText;

  switch (status) {
    case "inprogress":
      statusText = "Removing...";
      break;
    case "success":
      statusText = "Removed";
      break;
    case "failure":
      statusText = "Failed";
      break;
    default:
      status = "unknown";
      statusText = "unknown";
      break;
  }

  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");
  let moveItem = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${videoId}\"]`); //let so we can reassign after outerHTML overwrite

  //Set the status data attribute
  moveItem.setAttribute("data-remove-status", status);

  //Display the status icon and set the inner text
  const moveItemDeleteStatus = moveItem.querySelector(".playlist-item-selection-move-dialog-move-item-delete-status");
  if (moveItemDeleteStatus.style.display !== "inline-block") moveItemDeleteStatus.style.display = "inline-block";
  moveItemDeleteStatus.innerText = statusText;
};

const renderPlaylistItemSelectionMoveDialogPlaylistList = function() {
  //Declare variables
  const playlistItemSelectionMoveDialogPlaylistList = document.getElementById("playlist-item-selection-move-dialog-playlist-list");

  //Reset the list container innerHTML
  playlistItemSelectionMoveDialogPlaylistList.innerHTML = "";

  //Add a container for each playlist
  for(const playlistId in app.channels[app.currentChannel].playlists) {
    const playlist = app.channels[app.currentChannel].playlists[playlistId];
    let playlistContainer = document.createElement("div");
    playlistItemSelectionMoveDialogPlaylistList.appendChild(playlistContainer);
    playlistContainer.outerHTML = buildResourceContainer("playlist", playlist);
    playlistContainer = document.querySelector(`.playlist-item-selection-move-dialog-playlist-list .playlist-container[data-playlist-id=\"${playlistId}\"]`);

    //Attach event listener
    addClickEventListener(playlistContainer, event=>handlePlaylistItemSelectionMoveDialogPlaylistClick(playlistId));
  };
};

const handlePlaylistClick = function(playlistId) {
  //If we don't yet have our playlist's playlist items,
  // update the playlist items for the playlist
  if (!app.channels[app.currentChannel].playlists[playlistId].items) {
    displayPlaylistLoadingIcon(playlistId, true);
    updatePlaylistItems(playlistId);
    return;
  }
  togglePlaylistItems(playlistId);
};

const handlePlaylistItemSelectionListButtonClick = function() {
  const playlistItemSelectionListContainer = document.getElementById("playlist-item-selection-list-container");

  if (playlistItemSelectionListContainer.classList.contains("display")) {
    playlistItemSelectionListContainer.classList.remove("display");
  }
  else {
    playlistItemSelectionListContainer.classList.add("display");
  }
};

const resetAppProps = function() {
  //Clear app selection properties
  app.selectedPlaylist = null;
  app.selectedPlaylistItems = {};
};

const resetApp = function() {
  //Clear playlist item checkbox selections
  for(const playlistItemId in app.selectedPlaylistItems) {
    const playlistItem = app.selectedPlaylistItems[playlistItemId];
    const playlistItemElement = document.querySelector(`.playlist-item-container[data-playlist-item-id=\"${playlistItemId}\"]`)
    const playlistItemElementCheckbox = playlistItemElement.querySelector(".checkbox-input");

    handlePlaylistItemCheck(playlistItem, playlistItemElement);
  }

  //Unselect .playlist-item-selection-move-dialog-playlist-list .playlist-container
  // document.querySelectorAll(".playlist-item-selection-move-dialog-playlist-list .playlist-container")
  //   .forEach(playlistContainer=>{
  //     if (playlistContainer.classList.contains("selected")) {
  //       playlistContainer.classList.remove("selected");
  //     }
  //   });

  //Clear and hide the .playlist-item-selection-move-dialog
  const playlistItemSelectionMoveDialogBackground = document.getElementById("playlist-item-selection-move-dialog-background");
  const playlistItemSelectionMoveDialogPlaylistList = document.getElementById("playlist-item-selection-move-dialog-playlist-list");
  const playlistItemSelectionMoveDialogSelectedPlaylist = document.getElementById("playlist-item-selection-move-dialog-selected-playlist");

  playlistItemSelectionMoveDialogPlaylistList.innerHTML = "";
  playlistItemSelectionMoveDialogSelectedPlaylist.innerText = "";

  if (playlistItemSelectionMoveDialogBackground.classList.contains("display")) {
    playlistItemSelectionMoveDialogBackground.classList.remove("display");
  }

  //Wipe move items
  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");
  playlistItemSelectionMoveDialogMoveItemContainer.innerHTML = "";

  //Collapse all .playlist-item-containers
  document.querySelectorAll(".playlist-items-container:not(.shrink)")
    .forEach(playlistItemContainer=>playlistItemContainer.classList.add("shrink"));

  //Clear app selection properties
  resetAppProps();

  ////Re-update and render our playlists
  //updatePlaylists(app.channels[app.currentChannel].id);
};

const handlePlaylistItemCheck = function(playlistItem, playlistItemContainer) {
  const checkbox = playlistItemContainer.querySelector(".checkbox-input");
  checkbox.checked = !checkbox.checked;
  playlistItemContainer.setAttribute("data-checked", checkbox.checked);

  //Add or remove the playlist item selection
  updatePlaylistItemSelectionList(playlistItem, checkbox.checked);

  //Check whether the .playlist-item-selection-container should
  // be displayed or not (app.selectedPlaylistItems > 0)
  checkDisplayPlaylistItemSelectionContainer();

  //Check whether the .playlist-item-selection-list-container should
  // be displayed or not (.playlist-item-selection-container.display)
  checkDisplayPlaylistItemSelectionListContainer();
};

const handlePlaylistItemSelectionMoveDialogPlaylistClick = function(playlistId) {
  //Declare variables
  const playlistItemSelectionMoveDialogSelectedPlaylist = document.getElementById("playlist-item-selection-move-dialog-selected-playlist");
  const selectedPlaylistContainer = document.querySelector(`.playlist-item-selection-move-dialog .playlist-container[data-playlist-id=\"${playlistId}\"]`);

  //Declare functions
  const checkDisplayPlaylistItemSelectionMoveDialogCopyButton = function() {
    if (document.querySelectorAll("#playlist-item-selection-move-dialog .playlist-container:not(.selected)").length > 0) {
      const copyButton = document.getElementById("playlist-item-selection-move-dialog-copy-button");
      copyButton.removeAttribute("disabled");
    }
    else {
      const copyButton = document.getElementById("playlist-item-selection-move-dialog-copy-button");
      copyButton.setAttribute("disabled", "true");
    }
  };

  //Set our app singleton property
  app.selectedPlaylist = app.channels[app.currentChannel].playlists[playlistId];

  //Display the title of our selected playlist
  playlistItemSelectionMoveDialogSelectedPlaylist.innerText = app.selectedPlaylist.title;

  //Set our selected playlist
  if (!selectedPlaylistContainer.classList.contains("selected")) {
    selectedPlaylistContainer.classList.add("selected");
  }

  //Make sure our other playlists are not selected
  document.querySelectorAll(`.playlist-item-selection-move-dialog .playlist-container:not([data-playlist-id=\"${playlistId}\"])`)
    .forEach(playlistContainer=>{
      if (playlistContainer.classList.contains("selected")) {
        playlistContainer.classList.remove("selected");
      }
    });

  //Enable or disable the copy button depending on if we have selected a playlist
  checkDisplayPlaylistItemSelectionMoveDialogCopyButton();
};

const renderPlaylistItemSelectionMoveDialog = function() {
  //Render the playlist containers to the screen
  renderPlaylistItemSelectionMoveDialogPlaylistList();
};

const handlePlaylistItemSelectionMoveButtonClick = function() {
  //Declare variables
  const playlistItemSelectionMoveDialogBackground = document.getElementById("playlist-item-selection-move-dialog-background");

  //Create the move dialog
  renderPlaylistItemSelectionMoveDialog();

  //If we aren't displaying our move dialog, display it
  if (!playlistItemSelectionMoveDialogBackground.classList.contains("display")) {
    playlistItemSelectionMoveDialogBackground.classList.add("display");
  }
};

const handlePlaylistItemSelectionMoveDialogBackButtonClick = function() {
  const playlistItemSelectionMoveDialogBackground = document.getElementById("playlist-item-selection-move-dialog-background");

  if (playlistItemSelectionMoveDialogBackground.classList.contains(
"display")) {
    playlistItemSelectionMoveDialogBackground.classList.remove("display");
  }
};

const handlePlaylistItemSelectionMoveDialogCopyButtonClick = function() {
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
    }

    //Add the playlist item
    addYouTubePlaylistItem(
      bodyParams,
      result => {
        updateMoveDialogMoveItem(insertedPlaylistItem.videoId, insertedPlaylistItem.thumbnail.url, insertedPlaylistItem.title, "success");
        renderLinearGradient(playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`), "90", "rgb(211,255,211)", null);
        const playlistItemSelectionMoveDialog = document.getElementById("playlist-item-selection-move-dialog");
        const insertedPlaylistItemElement = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`);
        scrollToChild(playlistItemSelectionMoveDialog, insertedPlaylistItemElement, 4);
        callback(result);
      },
      err => {
        updateMoveDialogMoveItem(insertedPlaylistItem.videoId, insertedPlaylistItem.thumbnail.url, insertedPlaylistItem.title, "failure");
        renderLinearGradient(playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`), "90", "rgb(255,211,211)", null);
        const playlistItemSelectionMoveDialog = document.getElementById("playlist-item-selection-move-dialog");
        const insertedPlaylistItemElement = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`);
        scrollToChild(playlistItemSelectionMoveDialog, insertedPlaylistItemElement, 4);
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
};

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

const handlePlaylistItemSelectionDeleteDialogCancelButtonClick = function() {
  togglePlaylistItemSelectionDeleteDialogBackground(false);
};

const handlePlaylistItemSelectionDeleteDialogRemoveButtonClick = function() {
  const insertedPlaylistItemsArray = Object.keys(app.selectedPlaylistItems).map(playlistItemId=>{return app.selectedPlaylistItems[playlistItemId];});
  const playlistItemSelectionMoveDialogMoveItemContainer = document.getElementById("playlist-item-selection-move-dialog-move-item-container");

  const removePlaylistItemFromSourcePlaylist = function(insertedPlaylistItem, callback) {
    const insertedPlaylistItemElement = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`);

    deleteYouTubePlaylistItem(
      insertedPlaylistItem.id,
      response => {
        updateDeleteDialogMoveItem(insertedPlaylistItem.videoId, insertedPlaylistItem.thumbnail.url, insertedPlaylistItem.title, "success");
        const playlistItemSelectionMoveDialog = document.getElementById("playlist-item-selection-move-dialog");
        const insertedPlaylistItemElement = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`);
        renderLinearGradient(insertedPlaylistItemElement, null, null, "rgb(100,211,100)");
        scrollToChild(playlistItemSelectionMoveDialog, insertedPlaylistItemElement, 4);
        callback(response);
      },
      err => {
        updateDeleteDialogMoveItem(insertedPlaylistItem.videoId, insertedPlaylistItem.thumbnail.url, insertedPlaylistItem.title, "failure");
        const playlistItemSelectionMoveDialog = document.getElementById("playlist-item-selection-move-dialog");
        const insertedPlaylistItemElement = playlistItemSelectionMoveDialogMoveItemContainer.querySelector(`.playlist-item-selection-move-dialog-move-item[data-video-id=\"${insertedPlaylistItem.videoId}\"]`);
        renderLinearGradient(insertedPlaylistItemElement, null, null, "rgb(100,211,100)");
        scrollToChild(playlistItemSelectionMoveDialog, insertedPlaylistItemElement, 4);
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
};

//Attach event listeners
addClickEventListener(document.getElementById("playlist-item-selection-list-button"), handlePlaylistItemSelectionListButtonClick);
addClickEventListener(document.getElementById("playlist-item-selection-move-button"), handlePlaylistItemSelectionMoveButtonClick);
addClickEventListener(document.getElementById("playlist-item-selection-move-dialog-back-button"), handlePlaylistItemSelectionMoveDialogBackButtonClick);
addClickEventListener(document.getElementById("playlist-item-selection-move-dialog-copy-button"), handlePlaylistItemSelectionMoveDialogCopyButtonClick);
addClickEventListener(document.getElementById("playlist-item-selection-delete-dialog-cancel-button"), handlePlaylistItemSelectionDeleteDialogCancelButtonClick);
addClickEventListener(document.getElementById("playlist-item-selection-delete-dialog-remove-button"), handlePlaylistItemSelectionDeleteDialogRemoveButtonClick);

//When the page finishes loading, start the application
window.addEventListener("load", event=>initAuthorization(startApp, stopApp));
