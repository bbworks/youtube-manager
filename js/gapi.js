const callYouTubeDataApiFunction = function(resourceType, method, params, pageToken, callback, errCallback) {
  //Build the request options
  const options = {
    ...{
      "part": [
        "snippet"
      ],
    },
    ...params
  };

  if (method === "list") {
    options.maxResults = 50;

    if (pageToken) options.pageToken = pageToken;
  }

  //Call the Google YouTube Data API, recursively
  gapi.client.youtube[resourceType][method](options)
    .then(response => {
      if (method === "list") {
        if (response.result.nextPageToken) {
          callYouTubeDataApiFunction(resourceType, method, options, response.result.nextPageToken, newPageData => {callback(new Array(...response.result.items, ...newPageData));});
        }
        else {
          callback(new Array(...response.result.items));
        }
      }
      else {
        callback(response.result);
      }
    })
    .catch(err=>{
      if (errCallback) errCallback(err);
      console.error(err);
    });
};

//Declare our specific functions
const getYouTubeChannels = function(channelId, callback, errCallback) {
  callYouTubeDataApiFunction("channels", "list", {"id": channelId}, null, callback, errCallback);
};

const getYouTubePlaylists = function(channelId, callback, errCallback) {
  callYouTubeDataApiFunction("playlists", "list", {"channelId": channelId}, null, callback, errCallback);
};

const getYouTubePlaylistItems = function(playlistId, callback, errCallback) {
  callYouTubeDataApiFunction("playlistItems", "list", {"playlistId": playlistId}, null, callback, errCallback);
};

const addYouTubePlaylistItem = function(resourceObject, callback, errCallback) {
  callYouTubeDataApiFunction("playlistItems", "insert", {"resource": resourceObject}, null, callback, errCallback);
};
