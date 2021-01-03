const callYouTubeDataApiFunction = function(resourceType, method, params, pageToken, callback) {
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
  }

  if (pageToken) {
    options.pageToken = pageToken;
  }

  //Call the Google YouTube Data API, recursively
  gapi.client.youtube[resourceType][method](options)
    .then(response => {
      if (response.result.nextPageToken) {
        callYouTubeDataApiFunction(resourceType, method, options, response.result.nextPageToken, newPageData => {callback(new Array(...response.result.items, ...newPageData));});
      }
      else {
        callback(new Array(...response.result.items));
      }
    })
    .catch(err=>{console.error(err);});
};

//Declare our specific functions
const getYouTubeChannels = function(channelId, callback) {
  callYouTubeDataApiFunction("channels", "list", {"id": channelId}, null, callback);
};


const getYouTubePlaylists = function(channelId, callback) {
  callYouTubeDataApiFunction("playlists", "list", {"channelId": channelId}, null, callback);
};


const getYouTubePlaylistItems = function(playlistId, callback) {
  callYouTubeDataApiFunction("playlistItems", "list", {"playlistId": playlistId}, null, callback);
};
