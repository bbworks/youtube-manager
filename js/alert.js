const createElementFromHTML = function(html) {
  //First, build a container, and set our desired element inside
  const elementContainer = document.createElement("div");
  elementContainer.innerHTML = html;

  //Now that we have an actual DOM node, within our container,
  // return that DOM node
  const element = elementContainer.firstChild;
  return element;
};

const fadeIn = function(element, callback) {
  //Declare variables
  const className = "fading-in";

  //Fade in after after 10ms, and call our callback
  if (element.classList.contains("fading-in")) window.setTimeout(()=>{
    element.classList.remove("fading-in");

    //Now call our callback
    if(callback) callback();
  }, 10);
};

const fadeOut = function(element, callback) {
  //Declare variables
  const className = "fading-in";

  //Fade out
  if (!element.classList.contains("fading-in")) element.classList.add("fading-in");

  //Now call our callback after after 1s
  window.setTimeout(()=>{if(callback) callback();}, 250);
};

const buildAlertContainer = function() {
  return `<div id="alert-container" class="alert-container"></div>`;
}

const buildAlert = function(text, type) {
  let alertIcon;
  switch (type) {
    case "warning":
      alertIcon = "fas fa-exclamation-triangle";
      break;
    case "success":
      alertIcon = "fas fa-check-circle";
      break;
    case "error":
      alertIcon = "fas fa-times-circle";
      break;
    default:
      type = "info";
      alertIcon = "fas fa-info-circle";
      break;
  }

  return `<div class="alert alert-${type} fading-in">`+
      `<div class="alert-content">`+
        `<div class="alert-content-icon-container">`+
          `<i class="alert-content-icon ${alertIcon}"></i>`+
        `</div>`+
        `<div class="alert-content-text">${text}</div>`+
      `</div>`+
    `</div>`;
};

const addAlertContainer = function(parent) {
  //Declare variables
  parent = parent || document.body;
  const alertContainer = createElementFromHTML(buildAlertContainer());

  //Add the alert container
  parent.appendChild(alertContainer);

  //Return the alert container
  return alertContainer;
};

const addAlert = function(text, type) {
  //Declare variables
  const alertContainer = document.querySelector(".alert-container");

  //Create the alert DOM node
  const alert = createElementFromHTML(buildAlert(text, type));

  //Append the alert node
  alertContainer.appendChild(alert);

  //Fade in the alert
  fadeIn(alert);

  //Return the alert
  return alert;
};

const removeAlert = function(alert) {
  //Declare variables
  const alertContainer = document.querySelector("#alert-container");

  //Fade out the alert
  fadeOut(alert, ()=>{
    //Remove the alert DOM node
    alertContainer.removeChild(alert);
  });
};

const pushAlert = function(text, type, duration) {
  //Declare variables
  duration = duration || 5;
  const alertContainer = document.querySelector("#alert-container");

  //Declare functions
  const onHover = function(event) {
    //Clear the timeout while we're focused on the alert
    window.clearTimeout(timeoutId);

    //Start up the removal timeout again once we lose focus
    alert.addEventListener("mouseleave", offHover);
  };

  const offHover = function(event) {
    //Begin the timeout again to remove the alert
    timeoutId = window.setTimeout(()=>removeAlert(alert), duration*1000);

    //Now that we're no longer hovering, remove our offHover() listener
    alert.removeEventListener("mouseleave", offHover);
  };

  //Create the alert
  const alert = addAlert(text, type);

  //After the duration, remove the alert
  let timeoutId = window.setTimeout(()=>removeAlert(alert), duration*1000);

  //Reset the removal timeout if we focus on the node
  alert.addEventListener("mouseenter", onHover);
};

const pushErrorAlertOnError = event => {
  //Declare variables
  const error = event.error;
  const alertText = `The application failed.<br>`+
    `&nbsp;&nbsp;+ Error: ${error.message}<br>`+
    (error.filename === 0 || error.filename ? `&nbsp;&nbsp;+ File: ${error.filename}<br>` : "")+
    (error.lineno === 0 || error.lineno ? `&nbsp;&nbsp;+ Line: ${error.lineno}<br>` : "")+
    (error.colno === 0 || error.colno ? `&nbsp;&nbsp;+ Column: ${error.colno}` : "");

  //Push an alert to the screen
  pushAlert(alertText, "error");
};

//Attach event listeners
window.addEventListener("load", ()=>addAlertContainer());
window.addEventListener("error", pushErrorAlertOnError);
