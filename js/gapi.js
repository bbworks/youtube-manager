const callYouTubeDataApiFunction = function(resourceType, method, params, pageToken, callback, errCallback) {
  //Build the request options
  const options = {
    ...{
      "part": [
        "snippet",
        "contentDetails",
        "status",
      ],
    },
    ...params
  };

  if (method === "list") {
    //Set the maximum amount of results per call
    options.maxResults = 50;

    //Only set the pageToken option if we're provided one
    if (pageToken) options.pageToken = pageToken;
  }

  //Call the Google YouTube Data API, recursively
  gapi.client.youtube[resourceType][method](options)
    .then(response => {
      console.log(response);
      if (method === "list") {
        if (response.result.nextPageToken) {
          callYouTubeDataApiFunction(resourceType, method, options, response.result.nextPageToken, newPageData => {callback(new Array(...response.result.items, ...newPageData));});
        }
        else {
          //If we're using a single id instead of expecting an arary,
          // set the callback to use just the first item of the
          // response.result.items or an array of items
          if (options.id && typeof options.id === "string") {
            callback(response.result.items[0]);
          }
          else /*(options.id instanceof Array)*/ {
            callback(new Array(...response.result.items));
          }
        }
      }
      else if (method === "update" || method === "insert"){
        callback(response.result);
      }
      else /*(method === "delete")*/ {
        callback(response);
      }
    })
    .catch(err=>{
      if (errCallback) errCallback(err);
      console.error(err);
    });
};

//Declare our specific functions
const getYouTubeChannel = function(channelId, callback, errCallback) {
  callYouTubeDataApiFunction("channels", "list", {"id": channelId}, null, callback, errCallback);
};

const getYouTubePlaylist = function(playlistId, callback, errCallback) {
  callYouTubeDataApiFunction("playlists", "list", {"id": playlistId}, null, callback, errCallback);
};

const getYouTubePlaylists = function(channelId, callback, errCallback) {
  callYouTubeDataApiFunction("playlists", "list", {"channelId": channelId}, null, callback, errCallback);
};

const getYouTubePlaylistItem = function(playlistItemId, callback, errCallback) {
  callYouTubeDataApiFunction("playlistItems", "list", {"id": playlistItemId}, null, callback, errCallback);
};

const getYouTubePlaylistItems = function(playlistId, callback, errCallback) {
  callYouTubeDataApiFunction("playlistItems", "list", {"playlistId": playlistId}, null, callback, errCallback);
};

const getYouTubeVideo = function(videoId, callback, errCallback) {
  callYouTubeDataApiFunction("videos", "list", {"id": videoId}, null, callback, errCallback);
};

const addYouTubePlaylistItem = function(resourceObject, callback, errCallback) {
  callYouTubeDataApiFunction("playlistItems", "insert", {"resource": resourceObject}, null, callback, errCallback);
};

const deleteYouTubePlaylistItem = function(playlistItemId, callback, errCallback) {
  callYouTubeDataApiFunction("playlistItems", "delete", {"id": playlistItemId}, null, callback, errCallback);
};
