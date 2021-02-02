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

const scrollToChild = function(container, child, topPadding) {
  container.scroll({
    top: child.offsetTop - topPadding,
    behavior: "smooth"
  });
};
