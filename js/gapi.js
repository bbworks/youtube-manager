const recurseData = function(func, options, pageToken, callback) {
  //If we're reading a page, add it to our params
  if (pageToken && !options.hasOwnProperty("pageToken")) {
    options.pageToken = pageToken;
  }

  func(options, pageData => {
    if (pageData.nextPageToken) {
      recurseData(func, options, newPageData => {callback(new Array(...pageData.items, ...newPageData));});
    }
    else {
      callback(new Array(...pageData.items));
    }
  });
};

const callYouTubeDataApiFunction = function(resourceType, method, params, callback) {
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

  gapi.client.youtube[resourceType][method](options)
    .then(response=>{callback(response.result)})
    .catch(err=>{console.error(err);});
};

const getYouTubeChannels = function(params, callback) {
  callYouTubeDataApiFunction("channels", "list", params, callback);
};


const getYouTubePlaylists = function(params) {
  const options = {
    ...{
      "part": [
        "snippet"
      ],
      "maxResults": 50,
    },
    ...params
  };

  gapi.client.youtube.playlists.list(options)
    .then(response=>{console.log(response.result);})
    .catch(err=>{console.error(err);});
};


const getYouTubePlaylistItems = function(params) {
  const options = {
    ...{
      "part": [
        "snippet"
      ],
      "maxResults": 50,
    },
    ...params
  };

  gapi.client.youtube.playlistItems.list(options)
    .then(response=>{console.log(response.result);})
    .catch(err=>{console.error(err);});
};
