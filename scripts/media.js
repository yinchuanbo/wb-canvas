// 处理文件上传
$id("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    e.target.value = "";
    if (file.type.startsWith("video/")) {
      new VideoMedia(event);
    } else if (file.type.startsWith("audio/")) {
      console.log("音频文件");
    } else if (file.type.startsWith("image/")) {
      const imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        new ImgMedia(imgObj);
      };
    }
  };
  reader.readAsDataURL(file);
});

class ImgMedia {
  constructor(imgObj) {
    this.imgObj = imgObj;
    this.cropBox = null;
    this.comScale = 1;
    this.init();
  }
  init() {
    this.createImageCom();
    this.setImageComEvents();
  }
  createImageCom() {
    let _this = this;
    this.fabricImg = new fabric.Image(this.imgObj);
    this.fabricImg.set({
      width: this.imgObj.width,
      height: this.imgObj.height,
      borderColor: "#1967d2",
      cornerColor: "#1967d2",
      cornerSize: 10,
      type: "image",
    });
    canvas.add(this.fabricImg);
    canvas.centerObject(this.fabricImg);
    this.originalImage = {
      width: this.fabricImg.width,
      height: this.fabricImg.height,
      left: this.fabricImg.left,
      top: this.fabricImg.top,
      src: this.fabricImg.getElement().src,
    };
    canvas.renderAll();
  }
  backToOrigin(type = "back") {
    if (this.originalImage) {
      canvas.remove(this.fabricImg);
      this.fabricImg = null;
      if (type === "back") {
        canvas.remove(this.cropBox);
        this.cropBox = null;
      }
      const newImg = new Image();
      newImg.src = this.originalImage.src;
      newImg.onload = () => {
        this.fabricImg = new fabric.Image(newImg);
        this.fabricImg.set({
          width: this.originalImage.width,
          height: this.originalImage.height,
          left: this.originalImage.left,
          top: this.originalImage.top,
          borderColor: "#1967d2",
          cornerColor: "#1967d2",
          cornerSize: 10,
          type: "image",
        });
        canvas.add(this.fabricImg);
        console.log(this.comScale);
        if (this.comScale !== 1) {
          this.fabricImg.scale(this.comScale, this.comScale);
          const offsetX = (this.fabricImg.width * this.comScale) / 2;
          const offsetY = (this.fabricImg.height * this.comScale) / 2;
          this.fabricImg.scale(this.comScale, this.comScale);
          const centerPoint = this.fabricImg.getCenterPoint();
          this.fabricImg.set({
            left: centerPoint.x - offsetX,
            top: centerPoint.y - offsetY,
          });
        }
        if (this.angle) {
          this.fabricImg.rotate(this.angle);
        }
        if (type === "change") {
          this.startCrop(this.preCropBox);
        }
        this.setImageComEvents();
        canvas.renderAll();
      };
    }
  }
  setImageComEvents() {
    let _this = this;
    this.fabricImg.on("scaling", function () {
      showToolBar();
    });
    this.fabricImg.on("moving", function (e) {
      _this.originalImage = {
        ..._this.originalImage,
        left: _this.fabricImg.left,
        top: _this.fabricImg.top,
      };
      if (_this.cropBox) {
        canvas.setActiveObject(_this.cropBox);
        var rectBounds = _this.cropBox.getBoundingRect();
        var imageBounds = _this.fabricImg.getBoundingRect();
        canvas.setActiveObject(_this.cropBox);
        if (rectBounds.left < imageBounds.left) {
          _this.fabricImg.set("left", rectBounds.left);
        }
        if (rectBounds.top < imageBounds.top) {
          _this.fabricImg.set("top", rectBounds.top);
        }
        if (
          rectBounds.left + rectBounds.width >
          imageBounds.left + imageBounds.width
        ) {
          _this.fabricImg.set(
            "left",
            rectBounds.left + rectBounds.width - imageBounds.width
          );
        }
        if (
          rectBounds.top + rectBounds.height >
          imageBounds.top + imageBounds.height
        ) {
          _this.fabricImg.set(
            "top",
            rectBounds.top + rectBounds.height - imageBounds.height
          );
        }
        canvas.renderAll();
      }
    });
    this.fabricImg.on("mousedown", function () {
      if (_this.cropBox) {
        canvas.setActiveObject(_this.cropBox);
      }
    });
    // 原生事件
    $id("changeToolbar").onclick = () => {
      if (_this?.isCrop) {
        _this.backToOrigin("change");
      } else {
        handleCrop();
        showToolBar();
      }
    };
    // 旋转
    $id("rotate").onclick = () => {
      if (this.fabricImg) {
        this.fabricImg.rotate(this.fabricImg.angle + 90);
        this.angle = this.fabricImg.angle;
      } else {
        const activeObject = canvas.getActiveObject();
        activeObject?.rotate?.(activeObject.angle + 90);
        this.angle = this.activeObject.angle;
      }
      canvas.renderAll();
    };
    // 缩放
    $id("scale").onclick = () => {
      const curActiveObject = this.fabricImg || canvas.getActiveObject();
      if (curActiveObject) {
        const centerPoint = curActiveObject.getCenterPoint();
        this.comScale += 0.05;
        const offsetX = (curActiveObject.width * this.comScale) / 2;
        const offsetY = (curActiveObject.height * this.comScale) / 2;
        curActiveObject.scale(this.comScale, this.comScale);
        curActiveObject.set({
          left: centerPoint.x - offsetX,
          top: centerPoint.y - offsetY,
        });
        canvas.renderAll();
      }
    };
    function handleCrop() {
      let { width, height, left, top, scaleX, scaleY } = _this.fabricImg;
      width = width * scaleX;
      height = height * scaleY;
      const minSize = Math.min(width, height);
      const curSize = minSize * 0.6;
      _this.startCrop({
        left: left + (width - curSize) / 2,
        top: top + (height - curSize) / 2,
        width: curSize,
        height: curSize,
      });
    }
    // 裁剪
    $id("crop").onclick = () => {
      const cropTypeList = $id("crop").querySelector(".cropType__list");
      if (cropTypeList) {
        cropTypeList.classList.toggle("active");
      }
    };
    $id("original").onclick = (e) => {
      e.stopPropagation();
      _this.isCrop = false;
      document.querySelector(".cropType__list").classList.remove("active");
      $id("toolbar").style.display = "none";
      $id("toolbar").classList.remove("active");
      _this.backToOrigin();
    };
    $id("rect1-1").onclick = (e) => {
      e.stopPropagation();
      document.querySelector(".cropType__list").classList.remove("active");
      let preCropBox = {
        left: _this.cropBox.left,
        top: _this.cropBox.top,
        width: _this.cropBox.width,
        height: _this.cropBox.height,
      };
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      // 1:1
      let left, top, width, height;
      if (preCropBox.width > preCropBox.height) {
        height = preCropBox.height;
        width = (preCropBox.height * 1) / 1;
        left = preCropBox.left + preCropBox.width / 2 - width / 2;
        top = preCropBox.top;
      } else {
        width = preCropBox.width;
        height = (preCropBox.width * 1) / 1;
        left = preCropBox.left;
        top = preCropBox.top + preCropBox.height / 2 - height / 2;
      }
      _this.startCrop({
        left,
        top,
        width,
        height,
      });
      preCropBox = null;
    };
    $id("circle1-1").onclick = (e) => {
      e.stopPropagation();
      document.querySelector(".cropType__list").classList.remove("active");
      let preCropBox = {
        left: _this.cropBox.left,
        top: _this.cropBox.top,
        width: _this.cropBox.width,
        height: _this.cropBox.height,
      };
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      const minsize = Math.min(preCropBox.width, preCropBox.height);
      _this.startCrop({
        left: preCropBox.left + preCropBox.width / 2 - minsize / 2,
        top: preCropBox.top + preCropBox.height / 2 - minsize / 2,
        radius: minsize / 2,
        type: "circle",
      });
      preCropBox = null;
    };
    $id("rect4-3").onclick = (e) => {
      e.stopPropagation();
      document.querySelector(".cropType__list").classList.remove("active");
      let preCropBox = {
        left: _this.cropBox.left,
        top: _this.cropBox.top,
        width: _this.cropBox.width,
        height: _this.cropBox.height,
      };
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      // 4:3
      let left, top, width, height;
      if (preCropBox.width > preCropBox.height) {
        height = preCropBox.height;
        width = (preCropBox.height * 4) / 3;
        left = preCropBox.left + preCropBox.width / 2 - width / 2;
        top = preCropBox.top;
      } else {
        width = preCropBox.width;
        height = (preCropBox.width * 3) / 4;
        left = preCropBox.left;
        top = preCropBox.top + preCropBox.height / 2 - height / 2;
      }
      _this.startCrop({
        left,
        top,
        width,
        height,
      });
      preCropBox = null;
    };
    $id("rect3-4").onclick = (e) => {
      e.stopPropagation();
      document.querySelector(".cropType__list").classList.remove("active");
      let preCropBox = {
        left: _this.cropBox.left,
        top: _this.cropBox.top,
        width: _this.cropBox.width,
        height: _this.cropBox.height,
      };
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      // 3:4
      let left, top, width, height;
      if (preCropBox.width > preCropBox.height) {
        height = preCropBox.height;
        width = (preCropBox.height * 3) / 4;
        left = preCropBox.left + preCropBox.width / 2 - width / 2;
        top = preCropBox.top;
      } else {
        width = preCropBox.width;
        height = (preCropBox.width * 4) / 3;
        left = preCropBox.left;
        top = preCropBox.top + preCropBox.height / 2 - height / 2;
      }
      _this.startCrop({
        left,
        top,
        width,
        height,
      });
      preCropBox = null;
    };
    $id("wide").onclick = (e) => {
      e.stopPropagation();
      document.querySelector(".cropType__list").classList.remove("active");
      let preCropBox = {
        left: _this.cropBox.left,
        top: _this.cropBox.top,
        width: _this.cropBox.width,
        height: _this.cropBox.height,
      };
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      // 16:9
      let left, top, width, height;
      if (preCropBox.width > preCropBox.height) {
        height = preCropBox.height;
        width = (preCropBox.height * 16) / 9;
        left = preCropBox.left + preCropBox.width / 2 - width / 2;
        top = preCropBox.top;
      } else {
        width = preCropBox.width;
        height = (preCropBox.width * 9) / 16;
        left = preCropBox.left;
        top = preCropBox.top + preCropBox.height / 2 - height / 2;
      }
      _this.startCrop({
        left,
        top,
        width,
        height,
      });
      preCropBox = null;
    };
    $id("custom").onclick = (e) => {
      e.stopPropagation();
      document.querySelector(".cropType__list").classList.remove("active");
      let preCropBox = {
        left: _this.cropBox.left,
        top: _this.cropBox.top,
        width: _this.cropBox.width,
        height: _this.cropBox.height,
      };
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      // _this.fabricImg.width:_this.fabricImg.height
      let left, top, width, height;
      if (preCropBox.width > preCropBox.height) {
        height = preCropBox.height;
        width =
          (preCropBox.height * _this.fabricImg.width) / _this.fabricImg.height;
        left = preCropBox.left + preCropBox.width / 2 - width / 2;
        top = preCropBox.top;
      } else {
        width = preCropBox.width;
        height =
          (preCropBox.width * _this.fabricImg.height) / _this.fabricImg.width;
        left = preCropBox.left;
        top = preCropBox.top + preCropBox.height / 2 - height / 2;
      }
      _this.startCrop({
        left,
        top,
        width,
        height,
      });
      preCropBox = null;
    };
  }
  limitCrop(maxWidth, maxHeight) {}
  startCrop({ left, top, width, height, type = "rect", radius = 0 }) {
    let _this = this;
    if (this.fabricImg) {
      if (this.cropBox) {
        canvas.remove(_this.cropBox);
        _this.cropBox = null;
      }
      if (type === "circle") {
        this.cropBox = new fabric.Circle({
          radius,
          fill: "rgba(0, 0, 0, 0.1)",
          left,
          top,
          borderColor: "#1967d2",
          cornerColor: "#1967d2",
          cornerSize: 8,
          transparentCorners: false,
          lockRotation: true,
          lockScalingFlip: true,
          evented: false,
          hasControls: true,
          type: "cropBox",
          aspe: 1,
        });
        this.cropBox.on("scaling", () => {
          showToolBar("crop");
          _this.preCropBox = {
            left: _this.cropBox.left,
            top: _this.cropBox.top,
            width: _this.cropBox.width * _this.cropBox.scaleX,
            height: _this.cropBox.height * _this.cropBox.scaleY,
            radius: _this.cropBox.radius,
            type: "circle",
          };
          // 设置 corner 的移动范围
        });
      } else {
        this.cropBox = new fabric.Rect({
          left,
          top,
          width,
          height,
          fill: "rgba(0, 0, 0, 0.1)",
          borderColor: "#1967d2",
          cornerColor: "#1967d2",
          cornerSize: 8,
          transparentCorners: false,
          lockRotation: true,
          lockScalingFlip: true,
          evented: false,
          hasControls: true,
          type: "cropBox",
          aspe: width / height,
        });
        this.cropBox.on("scaling", (e) => {
          const corner = e.transform.corner;
          var rectBounds = _this.cropBox.getBoundingRect();
          var imageBounds = _this.fabricImg.getBoundingRect();
          if (corner === "tl") {
          }
        });
      }
      canvas.add(this.cropBox);
      canvas.setActiveObject(this.cropBox);
      setControlsVisibility(this.cropBox);
      canvas.on("selection:cleared", function (event) {
        if (!event?.e || _this.lock) return;
        _this.lock = true;
        var pointer = canvas.getPointer(event.e);
        var target = canvas.findTarget(event.e);
        if (target && target.hasControls && target.containsPoint(pointer)) {
          if (_this.cropBox) {
            canvas.setActiveObject(_this.cropBox);
          }
        } else {
          _this.cropImage();
        }
        setTimeout(() => {
          _this.lock = null;
        }, 2000);
      });
    }
  }
  cropImage() {
    let _this = this;
    if (this.cropBox) {
      this.isCrop = true;
      var imageBounds = this.fabricImg.getBoundingRect();
      var left = this.cropBox.left - this.fabricImg.left;
      var top = this.cropBox.top - this.fabricImg.top;
      var width = this.cropBox.width * this.cropBox.scaleX;
      var height = this.cropBox.height * this.cropBox.scaleY;
      var croppedImage = new Image();
      croppedImage.src = this.fabricImg.toDataURL({
        left: this.cropBox.left - imageBounds.left,
        top: this.cropBox.top - imageBounds.top,
        width: width,
        height: height,
        format: "png",
      });
      croppedImage.onload = function () {
        if (_this.cropBox?.radius) {
          var circleCanvas = document.createElement("canvas");
          var ctx = circleCanvas.getContext("2d");
          var minSize = Math.min(width, height);
          circleCanvas.width = minSize;
          circleCanvas.height = minSize;
          ctx.beginPath();
          ctx.arc(minSize / 2, minSize / 2, minSize / 2, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            croppedImage,
            0,
            0,
            width,
            height,
            0,
            0,
            minSize,
            minSize
          );
          var circularImage = new Image();
          circularImage.src = circleCanvas.toDataURL();
          circularImage.onload = () => {
            var imgInstance = new fabric.Image(circularImage, {
              left: _this.fabricImg.left + left,
              top: _this.fabricImg.top + top,
              angle: 0,
              opacity: 1,
              cornerSize: 10,
              hasRotatingPoint: false,
              borderColor: "#1967d2",
              cornerColor: "#1967d2",
            });
            imgInstance.on("scaling", () => {
              showToolBar();
            });
            _this.preCropBox = {
              left: _this.cropBox.left,
              top: _this.cropBox.top,
              width: _this.cropBox.width,
              height: _this.cropBox.height,
              radius: _this.cropBox.radius,
              type: "circle",
            };
            canvas.remove(_this.fabricImg);
            canvas.remove(_this.cropBox);
            _this.cropBox = null;
            canvas.add(imgInstance);
            _this.fabricImg = imgInstance;
            canvas.renderAll();
          };
          return;
        }
        var imgInstance = new fabric.Image(croppedImage, {
          left: _this.fabricImg.left + left,
          top: _this.fabricImg.top + top,
          opacity: 1,
          cornerSize: 10,
          hasRotatingPoint: false,
          borderColor: "#1967d2",
          cornerColor: "#1967d2",
        });
        imgInstance.on("scaling", () => {
          showToolBar();
        });
        _this.preCropBox = {
          left: _this.cropBox.left,
          top: _this.cropBox.top,
          width: _this.cropBox.width * _this.cropBox.scaleX,
          height: _this.cropBox.height * _this.cropBox.scaleY,
          type: "rect",
          radius: "",
        };
        canvas.remove(_this.fabricImg);
        canvas.remove(_this.cropBox);
        _this.cropBox = null;
        canvas.add(imgInstance);
        _this.fabricImg = imgInstance;
        canvas.renderAll();
      };
    }
  }
}

class VideoMedia {
  constructor(data) {
    this.videoEvent = data;
    this.init();
    this.setEvents();
  }
  init() {
    this.createVideo();
  }
  genVideoDom1({ width, height, src }) {
    var videoElement = document.createElement("video");
    videoElement.setAttribute("height", height);
    videoElement.setAttribute("width", width);
    videoElement.style.display = "none";
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    var sourceElement = document.createElement("source");
    sourceElement.setAttribute("src", src);
    videoElement.appendChild(sourceElement);
    return videoElement;
  }
  genVideoDom2({ width, height }) {
    var videoElement = document.createElement("video");
    videoElement.setAttribute("height", height);
    videoElement.setAttribute("width", width);
    videoElement.style.display = "none";
    return videoElement;
  }
  createVideo() {
    const _this = this;
    const videoObj = document.createElement("video");
    videoObj.src = this.videoEvent.target.result;
    this.videoSrc = videoObj.src;
    videoObj.type = "video/mp4";
    videoObj.controls = true;
    videoObj.onloadedmetadata = () => {
      const videoDom1 = _this.genVideoDom1({
        width: videoObj.videoWidth,
        height: videoObj.videoHeight,
        src: videoObj.src,
      });
      const videoDom2 = _this.genVideoDom2({
        width: videoObj.videoWidth,
        height: videoObj.videoHeight,
      });
      // 背景
      var background = new fabric.Rect({
        width: videoDom1.width + 2 * 17,
        height: videoDom1.height + 2 * 17,
        fill: "#fff",
        originX: "center",
        originY: "center",
        shadow: {
          color: "rgba(0, 0, 0, 0.2)",
          offsetX: 0,
          offsetY: 3,
          blur: 6,
        },
        rx: 8,
        ry: 8,
      });
      var video = new fabric.Image(videoDom1, {
        originX: "center",
        originY: "center",
        objectCaching: false,
        type: "video",
      });

      const buttonImageElement = $id("videoPlayButton");

      var buttonImage = new fabric.Image(buttonImageElement, {
        originX: "center",
        originY: "center",
        type: "playButton",
      });

      var group = new fabric.Group([background, video, buttonImage], {
        originX: "center",
        originY: "center",
        type: "videoGroup",
      });

      group.on("scaling", () => {
        showToolBar();
      });

      var webcam = new fabric.Image(videoDom2, {
        originX: "center",
        originY: "center",
        objectCaching: false,
      });
      canvas.add(group);
      canvas.centerObject(group);

      const findVideo = group
        .getObjects()
        .find((item) => item.type === "video");

      group.on("mousedown", function (e) {
        // Your click event handler code here
        console.log("Button image clicked!", e);
        if (findVideo) {
          findVideo.getElement().play();
        }
      });

      navigator.mediaDevices
        .getUserMedia({ audio: false, video: true })
        .then(function (stream) {
          videoDom2.srcObject = stream;
          canvas.add(webcam);
          webcam.moveTo(0);
          webcam.getElement().play();
        })
        .catch(function (err) {
          console.log(err);
        });
      fabric.util.requestAnimFrame(function render() {
        canvas.renderAll();
        fabric.util.requestAnimFrame(render);
      });
    };
  }
  setEvents() {
    $id("downMedia").onclick = () => {
      var selectedObject = canvas.getActiveObject();
      if (selectedObject) {
        const link = document.createElement("a");
        link.href = this.videoSrc;
        link.download = "video.mp4"; // 设置下载的文件名
        link.click();
      }
    };
  }
}
