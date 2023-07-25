function getHiddenElementWidth(element) {
  element.style.display = "block"; // 显示元素
  var width = element.clientWidth + 20; // 获取宽度
  element.style.display = "none"; // 隐藏元素
  return width;
}

// 重新设置 toolbar 位置
function showToolBar() {
  $id("toolbar").style.display = "none";
  $id("toolbar").classList.remove("active");
  var selectedObject = canvas.getActiveObject();
  if (!selectedObject) return;
  let boundingRect = selectedObject.getBoundingRect();
  let dis = null;
  if (selectedObject.type === "cropBox" || selectedObject.type === "circle") {
    $id("toolbar").classList.remove("videoActive");
    $id("toolbar").classList.add("active");
    dis = 138;
  } else if (
    selectedObject.type === "video" ||
    selectedObject.type === "videoGroup" ||
    selectedObject.type === "audio"
  ) {
    $id("toolbar").classList.remove("active");
    $id("toolbar").classList.add("videoActive");
    dis = 56;
  } else {
    $id("toolbar").classList.remove("active");
    $id("toolbar").classList.remove("videoActive");
    dis = 56;
  }
  $id("toolbar").style.left =
    boundingRect.left + (boundingRect.width / 2 - dis / 2) + "px";
  $id("toolbar").style.top = boundingRect.top - 65 + "px";
  $id("toolbar").style.display = "flex";
  $id("toolbar").style.padding = "5px 10px";
  selectedObject.setControlVisible("ml", false);
  selectedObject.setControlVisible("mr", false);
  selectedObject.setControlVisible("mt", false);
  selectedObject.setControlVisible("mb", false);
  selectedObject.setControlVisible("mtr", false);
  canvas.renderAll();
}
// 监听视口尺寸改变
function handleResize() {
  canvas.setWidth(window.innerWidth);
  canvas.setHeight(window.innerHeight);
  canvas.renderAll();
}
// 处理组件删除
function deleteComponent(event) {
  if (event.key === "Delete") {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }
}
async function asyncHandleImage({
  src,
  left,
  top
}) {
  return new Promise((resolve) => {
    fabric.Image.fromURL(src, (obj) => {
      canvas.add(obj);
      obj.set({
        left,
        top,
      })
      canvas.renderAll();
      console.log(888)
      resolve(obj);
    });
  })
}
// 截图
async function exportImageFun() {
  const handleVideos = document.querySelectorAll('.handle__video');
  const temoObj = [];
  for (let i = 0; i < handleVideos.length; i++) {
    const handleVideo = handleVideos[i];
    const itemCanvas = await html2canvas(handleVideo);
    const itemCanvasImg = itemCanvas.toDataURL("image/png");
    const newItem = await asyncHandleImage({
      src: itemCanvasImg,
      left: parseFloat(handleVideo.style.left),
      top: parseFloat(handleVideo.style.top)
    });
    temoObj.push(newItem)
  }
  var objects = canvas.getObjects();
  console.log('objects', objects)
  var minX = objects[0].left;
  var minY = objects[0].top;
  var maxX = objects[0].left + objects[0].width;
  var maxY = objects[0].top + objects[0].height;
  for (var i = 1; i < objects.length; i++) {
    var object = objects[i];
    minX = Math.min(minX, object.left);
    minY = Math.min(minY, object.top);
    maxX = Math.max(maxX, object.left + object.width);
    maxY = Math.max(maxY, object.top + object.height);
  }
  var margin = 30;
  var boundingBox = {
    left: minX - margin,
    top: minY - margin,
    width: maxX - minX + 2 * margin,
    height: maxY - minY + 2 * margin,
  };
  var tempCanvas = new fabric.Canvas(null, {
    width: boundingBox.width,
    height: boundingBox.height,
    backgroundColor: "#fff",
  });
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i];
    var left = object.left - boundingBox.left;
    var top = object.top - boundingBox.top;
    // 从原始画布中移除元素
    canvas.remove(object);
    // 调整元素位置
    object.set({
      left: left,
      top: top,
    });
    tempCanvas.add(object);
  }
  var dataURL = tempCanvas.toDataURL({
    format: "png",
    quality: 1,
  });
  var link = document.createElement("a");
  link.href = dataURL;
  link.download = "image.png";
  link.click();
  // 将元素重新添加到原始画布
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i];
    var left = object.left + boundingBox.left;
    var top = object.top + boundingBox.top;
    object.set({
      left: left,
      top: top,
    });
    canvas.add(object);
  }
  temoObj.forEach(item => {
    canvas.remove(item)
  })
  canvas.renderAll();
}

var isColorPickerMode = false;

function getColor() {
  canvas.defaultCursor = "crosshair";
  canvas.selection = false;
  canvas.skipTargetFind = true;
  isColorPickerMode = !isColorPickerMode;
}

function pencilFun() {
  // 将画布设置成绘画模式
  canvas.isDrawingMode = true;
  canvas.defaultCursor = "crosshair";
  canvas.freeDrawingBrush.width = 10;
  canvas.freeDrawingBrush.color = "red";
  // canvas.freeDrawingBrush.strokeDashArray = [20, 50];
  canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    blur: 5,
    offsetX: 10,
    offsetY: 0,
    affectStroke: true,
    color: "#30e3ca",
  });
}

function setControlsVisibility(obj) {
  obj?.setControlsVisibility?.({
    tl: true,
    tr: true,
    br: true,
    bl: true,
    ml: false,
    mt: false,
    mr: false,
    mb: false,
    mtr: false,
  });
}

const qs = (dom, selector) => {
  return dom.querySelector(selector);
};

const qsAll = (dom, selector) => {
  return dom.querySelectorAll(selector);
};

const html_to_element = (html) => {
  var template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
};

function formatTime(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  return formattedMinutes + ":" + formattedSeconds;
}
