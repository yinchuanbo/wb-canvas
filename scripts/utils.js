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
  const type = selectedObject?.type || '';
  let dis = null;
  if (['youtube', 'netdiskGroup', 'newNetdisk', 'code', 'pdf'].includes(type)) {
    setControlsVisibility(selectedObject);
    return;
  }
  if (['spotify', 'coda'].includes(type)) {
    setControlsVisibility(selectedObject, {
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: false,
      mt: false,
      mr: false,
      mb: false,
      mtr: false,
    });
    return;
  }
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
  if (selectedObject.type === "audio") {
    setControlsVisibility(selectedObject, {
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: false,
      mt: false,
      mr: false,
      mb: false,
      mtr: false,
    });
  }
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
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject?.fabricImg) {
        canvas.remove(activeObject.fabricImg);
      }
      if (activeObject?.newNetdisk) {
        activeObject.newNetdisk.netdiskNewBox = null;
      }
      if (activeObject?.codeBg) {
        activeObject.codeBg.codeBg = null;
      }
      if (activeObject?.pdfBg) {
        activeObject.pdfBg.pdfBg = null;
      }
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      activeObject = null;
      canvas.renderAll();
    }
  }
}
async function asyncHandleImage({ src, left, top }) {
  return new Promise((resolve) => {
    fabric.Image.fromURL(src, (obj) => {
      canvas.add(obj);
      obj.set({
        left,
        top,
      });
      canvas.renderAll();
      resolve(obj);
    });
  });
}
function createTempAudio({
  curTime,
  duration,
  left,
  top,
  isPlay,
  name,
  playRatio,
}) {
  let html = `<div class="audio__temp" style="left: -${156}px; top: -${156}px" data-left=${left} data-top=${top}>
    <div class="audio_main">
      <div class="audio__logo ${isPlay ? "active" : ""}"></div>
      <div class="audio__playBtn ${isPlay ? "active" : ""}"></div>
      <div class="audio__process">
        <div class="process__bar">
          <div class="process__bar__left" style="width: ${playRatio}%"></div>
        </div>
      </div>
      <div class="audio__time">
        <span>${curTime}</span>
        <span>${duration}</span>
      </div>
    </div>
    <div class="audio__name" style="border-radius: 8px!important">${name}</div>
  </div>`;
  html = html_to_element(html);
  qs(document, ".container").appendChild(html);
  return html;
}
// 截图
async function exportImageFun() {
  var objects = canvas.getObjects();
  objects = objects.filter((item) => item.visible !== false);
  const handleVideos = document.querySelectorAll(".handle__video");
  // const handleNetdiskEl = document.querySelectorAll('.netdisk__el');
  const temoObj = [];
  const tempDom = [];
  const tempVideoDom = Array.from(handleVideos);
  // const tempNetdiskDom = Array.from(handleNetdiskEl);
  // const audioArr = objects.filter((item) => item?.type === "audio");
  // if (audioArr?.length) {
  //   audioArr.forEach((item) => {
  //     const temp = createTempAudio({
  //       curTime: item.curObj?.currentTime || "00:00",
  //       duration: item.duration,
  //       left: item.left,
  //       top: item.top,
  //       isPlay: item.curObj.isPlay,
  //       name: item.curObj.audioFile.name,
  //       playRatio: item.curObj?.playRatio || 0,
  //     });
  //     tempDom.push(temp);
  //   });
  // }
  // const newArr = tempDom.concat(tempVideoDom, tempNetdiskDom)
  const newArr = tempDom.concat(tempVideoDom);
  for (let i = 0; i < newArr.length; i++) {
    const item = newArr[i];
    const itemCanvas = await html2canvas(item);
    const itemCanvasImg = itemCanvas.toDataURL("image/png");
    const itemLeft = item.dataset?.left;
    const itemTop = item.dataset?.top;
    const newItem = await asyncHandleImage({
      src: itemCanvasImg,
      left: parseFloat(itemLeft || item.style.left),
      top: parseFloat(itemTop || item.style.top),
    });
    temoObj.push(newItem);
  }
  objects = canvas.getObjects();
  objects = objects.filter((item) => item.visible !== false);
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
    if (object?.videoEl) {
      qs(document, ".container").appendChild(object.videoEl);
    } else if (object?.audioEl) {
      qs(document, ".container").appendChild(object.audioEl);
    }
  }
  temoObj.forEach((item) => {
    canvas.remove(item);
  });
  tempDom.forEach((item) => {
    item.remove();
  });
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
  canvas.freeDrawingBrush.color = "#000";
  // canvas.freeDrawingBrush.strokeDashArray = [20, 50];
  // canvas.freeDrawingBrush.shadow = new fabric.Shadow({
  //   blur: 5,
  //   offsetX: 10,
  //   offsetY: 0,
  //   affectStroke: true,
  //   color: "#30e3ca",
  // });
}

function setControlsVisibility(obj, val = {
  tl: true,
  tr: true,
  br: true,
  bl: true,
  ml: false,
  mt: false,
  mr: false,
  mb: false,
  mtr: false,
}) {
  obj?.setControlsVisibility?.(val);
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

function setMaxSize(vW, vH, maxW = 1280, maxH = 720) {
  let width, height;
  if (vW / vH >= maxW / maxH) {
    if (vW > maxW) {
      width = maxW;
      height = (vH * maxW) / vW;
    } else {
      width = vW;
      height = vH;
    }
  } else {
    if (vH > maxH) {
      height = maxH;
      width = (vW * maxH) / vH;
    } else {
      width = vW;
      height = vH;
    }
  }

  return {
    width,
    height,
  };
}

function incrementValue(duration = 1000, processDom, processBar) {
  let value = 0;
  const increment = 1;
  const targetValue = 100;
  const interval = duration / targetValue; // Interval for each increment in milliseconds
  const timer = setInterval(() => {
    value += increment;
    processBar.style.width = `${value}%`;
    if (value >= targetValue) {
      processDom.remove();
      clearInterval(timer);
    }
  }, interval);
}

function generateRandomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function blobToBase64(blob) {
  var reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = function () {
    var base64String = reader.result;
    console.log(base64String);
  };
}

function linkFun(e) {
  const hasLinkInput = e.target.closest('.link__input') !== null;
  if (hasLinkInput) return;
  this.classList.toggle('active')
}

function xhrequest(url) {
  return new Promise((resolve, reject) => {
    let DownUrl = url;
    fetch(DownUrl)
      .then(response => response.blob())
      .then(res => {
        let blod = new Blob([res]);
        resolve(blod);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function isYoutubeUrl(url) {
  var reg =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts))((.|-){11})(?:\S+)?$/;
  return reg.test(url);
}

function isVimeoUrl(url) {
  var reg = /^https?:\/\/(www\.)?vimeo\.com\/([0-9]+)/;
  return reg.test(url);
}

function isGoogleDocsUrl(url) {
  var reg =
    /^https?:\/\/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([a-zA-Z0-9\-_]+)/;
  return reg.test(url);
}
// Meet-Coda
function isMeetCodaUrl(url) {
  var reg =
    /^https?:\/\/coda\.io\/d\/(Meet-Coda_dfFgmufwT_V|Copy-of-Meet-Coda_dUAl_s3HCfl|([a-zA-Z0-9\-_]+))\/([a-zA-Z0-9\-_#]+)/;
  return reg.test(url);
}

function isSpotifyUrl(url) {
  var reg =
    /^https?:\/\/open\.spotify\.com\/(track|episode|show|playlist|embed)\/.*/;
  return reg.test(url);
}

function cropImage(imageUrl, targetWidth, targetHeight) {
  return new Promise((resolve, reject) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Create an image element
    const image = new Image();

    // Set the source of the image
    image.src = imageUrl;

    // When the image is loaded, perform the cropping
    image.onload = function () {
      // Set the canvas size to the desired target size
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw the image onto the canvas with the desired dimensions
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      // Get the cropped image as a data URL
      const croppedImageDataURL = canvas.toDataURL('image/jpeg');

      // Resolve the Promise with the cropped image data URL
      resolve(croppedImageDataURL);
    };

    // If there's an error loading the image, reject the Promise
    image.onerror = function () {
      reject(new Error('Failed to load image'));
    };
  });
}

function fetchDataFromCoda(url, token) {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  };
  return fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Request failed: ${response.status}`);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function getNodeContent(node) {
  var content = '';
  if (node.nodeType === Node.TEXT_NODE) {
    content = node.textContent;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (var i = 0; i < node.childNodes.length; i++) {
      content += getNodeContent(node.childNodes[i]);
    }
  }
  return content;
}

function getIndex(target) {
  const parent = target.parentNode;
  const siblings = parent.children;
  for (let i = 0; i < siblings.length; i++) {
    if (siblings[i] === target) {
      return i;
    }
  }
}