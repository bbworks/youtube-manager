const proxyUrl = "https://cors-anywhere.herokuapp.com";
const baseUrl = "https://www.googleapis.com/youtube/v3";

const buildFetchUrl = function(data, params) {
  let returnUrl = `${baseUrl}/${data}?`; //`${proxyUrl}/${baseUrl}/${data}?`;
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
