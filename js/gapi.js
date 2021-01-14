const callYouTubeDataApiFunction = function(resourceType, method, params, pageToken, callback, errCallback) {
  //Declare variables
  let leftoverIds;
  const listIdChunkLength = 50;

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

    //Check that we search no more than 50 ids per call,
    // otherwise run with the first 50, and save the rest for
    // a follow-up call
    if (options.id && options.id !== "string" && options.id.length > 50) {
      leftoverIds = options.id.splice(listIdChunkLength, options.id.length);
    }
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
          //Check that we didn't drop some ids because we
          // had too many--if so, use these next and fetch again
          if (leftoverIds) {
            options.id = leftoverIds;
            callYouTubeDataApiFunction(resourceType, method, options, null, newPageData => {callback(new Array(...response.result.items, ...newPageData));});
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
