$id("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    e.target.value = "";
    if (file.type.startsWith("video/")) {
      new VideoMedia(event);
    } else if (file.type.startsWith("audio/")) {
      new AudioMedia(file);
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
    // this.fabricImg.on("scaling", () => {
    //   console.log('111')
    //   this.originalImage.scaleX = this.fabricImg.scaleX;
    //   this.originalImage.scaleY = this.fabricImg.scaleY;
    // });
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
        const width = this.originalImage.width;
        const height = this.originalImage.height;
        console.log("this.originalImage", this.originalImage);
        this.fabricImg.set({
          width,
          height,
          left: this.originalImage.left,
          top: this.originalImage.top,
          borderColor: "#1967d2",
          cornerColor: "#1967d2",
          cornerSize: 10,
          type: "image",
          scaleX: this.originalImage?.scaleX || 1,
          scaleY: this.originalImage?.scaleY || 1,
        });
        canvas.add(this.fabricImg);
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
      _this.originalImage.scaleX = _this.fabricImg.scaleX;
      _this.originalImage.scaleY = _this.fabricImg.scaleY;
      if (_this.isCrop) {
        if (_this.preCropBox?.type === "circle") {
          _this.preCropBox.left = _this.fabricImg.left;
          _this.preCropBox.top = _this.fabricImg.top;
          _this.preCropBox.width = _this.fabricImg.width * _this.fabricImg.scaleX;
          _this.preCropBox.height = _this.fabricImg.height * _this.fabricImg.scaleY;
          _this.preCropBox.radius = _this.fabricImg.width / 2;
        } else {
          _this.preCropBox.left = _this.fabricImg.left;
          _this.preCropBox.top = _this.fabricImg.top;
          _this.preCropBox.width = _this.fabricImg.width * _this.fabricImg.scaleX;
          _this.preCropBox.height = _this.fabricImg.height * _this.fabricImg.scaleY;
        }
      }
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
  startCrop({ left, top, width, height, type = "rect", radius = 0 }) {
    console.trace();
    let _this = this;
    if (this.fabricImg) {
      if (this.cropBox) {
        canvas.remove(_this.cropBox);
        _this.cropBox = null;
      }
      console.log("走这里了");
      if (type === "circle") {
        this.cropBox = new fabric.Circle({
          radius,
          fill: "rgba(0, 0, 0, 0.2)",
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
          console.log("1111-1");
          _this.preCropBox = {
            left: _this.cropBox.left,
            top: _this.cropBox.top,
            width: _this.cropBox.width * _this.cropBox.scaleX,
            height: _this.cropBox.height * _this.cropBox.scaleY,
            radius: _this.cropBox.radius,
            type: "circle",
          };
        });
      } else {
        this.cropBox = new fabric.Rect({
          left,
          top,
          width,
          height,
          fill: "rgba(0, 0, 0, 0.2)",
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
      }
      canvas.add(this.cropBox);
      canvas.setActiveObject(this.cropBox);
      setControlsVisibility(this.cropBox);
      this.cropBox.on(
        "scaling",
        function (event) {
          showToolBar("cropBox");
          var cropBoxCoords = this.cropBox.getBoundingRect();
          var fabricImgCoords = this.fabricImg.getBoundingRect();
          if (
            cropBoxCoords.left < fabricImgCoords.left ||
            cropBoxCoords.top < fabricImgCoords.top ||
            cropBoxCoords.left + cropBoxCoords.width >
            fabricImgCoords.left + fabricImgCoords.width ||
            cropBoxCoords.top + cropBoxCoords.height >
            fabricImgCoords.top + fabricImgCoords.height
          ) {
            this.cropBox.set({
              scaleX: this.cropBox.lastScaleX,
              scaleY: this.cropBox.lastScaleY,
              left: this.cropBox.lastLeft,
              top: this.cropBox.lastTop,
            });
            this.cropBox.setCoords();
          } else {
            this.cropBox.lastScaleX = this.cropBox.scaleX;
            this.cropBox.lastScaleY = this.cropBox.scaleY;
            this.cropBox.lastLeft = this.cropBox.left;
            this.cropBox.lastTop = this.cropBox.top;
          }
        }.bind(this)
      );
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
            console.log("1111-2");
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
        console.log("1111-3");
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
        _this.setImageComEvents();
        canvas.renderAll();
      };
    }
  }
}

class VideoMedia {
  constructor(data) {
    this.videoEvent = data;
    this.init();
    this.isPlay = false;
    this.setEvents();
  }
  init() {
    this.createVideo();
  }
  genVideoDom1({ width, height, src, duration }) {
    const html = `
      <div class="handle__video" style="width: ${width}px;height: ${height}px">
        <button type="button" class="play__button"></button>
        <video style="width: 100%;height:100%;object-fit: fill" preload="auto">
          <source src="${src}"></source>
        </video>
        <div class="video__controls" style="display: none">
          <button type="button" class="play__icon"></button>
          <span class="cur__time">00:00</span>
          <div class="process__bar">
            <input type="range" value="0" />
          </div>
          <span class="all__time">${duration}</span>
          <button type="button" class="sound__btn">
            <div class="change__sound">
              <input type="range" min="0" max="100" step="1" value="70">
            </div>
          </button>
        </div>
      </div>
    `;
    return html_to_element(html);
  }
  showVideo() {
    const { x, y } = this.background.aCoords.tl;
    this.videoEl.style.display = "block";
    this.videoEl.style.position = "absolute";
    this.videoEl.style.left = `${x + 17}px`;
    this.videoEl.style.top = `${y + 17}px`;
    this.videoEl.style.width = `${this.background.width * this.background.scaleX - 34
      }px`;
    this.videoEl.style.height = `${this.background.height * this.background.scaleY - 34
      }px`;
  }
  createVideo() {
    const _this = this;
    const videoObj = document.createElement("video");
    videoObj.src = this.videoEvent.target.result;
    this.videoSrc = videoObj.src;
    videoObj.type = "video/mp4";
    videoObj.onloadedmetadata = () => {
      _this.videoEl = _this.genVideoDom1({
        width: videoObj.videoWidth,
        height: videoObj.videoHeight,
        src: videoObj.src,
        duration: formatTime(videoObj.duration),
      });
      qs(document, ".container").appendChild(_this.videoEl);
      this.background = new fabric.Rect({
        width: videoObj.videoWidth + 2 * 17,
        height: videoObj.videoHeight + 2 * 17,
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
        type: "video",
      });
      canvas.add(this.background);
      canvas.centerObject(this.background);
      this.background.on("removed", function () {
        _this.videoEl.remove();
      });
      _this.showVideo();
      this.background.on("moving", () => {
        _this.showVideo();
      });
      this.background.on("scaling", () => {
        _this.showVideo();
        showToolBar();
        const curW = this.background.scaleX * this.background.width;
        const curH = this.background.scaleY * this.background.height;
        let curSize = Math.min(curW, curH) - 34;
        curSize = curSize > 80 ? 80 : curSize;
        qs(_this.videoEl, ".play__button").style.width = `${curSize}px`;
        qs(_this.videoEl, ".play__button").style.height = `${curSize}px`;
        if (curW <= 270) {
          if (!_this.isPlay) return;
          qs(_this.videoEl, ".video__controls").style.display = "none";
        } else {
          if (!_this.isPlay) return;
          qs(_this.videoEl, ".video__controls").style.display = "flex";
        }
      });
      qs(_this.videoEl, ".play__button").onclick = () => {
        qs(_this.videoEl, "video").play();
        qs(_this.videoEl, ".play__button").style.display = "none";
        qs(_this.videoEl, ".video__controls").style.display = "flex";
        qs(_this.videoEl, ".play__icon").classList.add("pause");
        _this.isPlay = true;
      };
      qs(_this.videoEl, "video").addEventListener("ended", () => {
        _this.isPlay = false;
        qs(_this.videoEl, ".play__button").style.display = "block";
        qs(_this.videoEl, ".play__icon").classList.remove("pause");
        qs(_this.videoEl, ".video__controls").style.display = "none";
      });
      qs(_this.videoEl, "video").addEventListener("timeupdate", () => {
        if (!_this.isPlay) return;
        qs(_this.videoEl, ".video__controls .cur__time").innerHTML = formatTime(
          qs(_this.videoEl, "video").currentTime
        );
        qs(_this.videoEl, ".video__controls .process__bar input").value =
          Math.ceil(
            (qs(_this.videoEl, "video").currentTime / videoObj.duration) * 100
          );
      });
      qs(_this.videoEl, ".video__controls .process__bar input").oninput = (
        e
      ) => {
        qs(_this.videoEl, "video").pause();
        qs(_this.videoEl, "video").currentTime =
          (e.target.value / 100) * videoObj.duration;
        qs(_this.videoEl, ".video__controls .cur__time").innerHTML = formatTime(
          qs(_this.videoEl, "video").currentTime
        );
        qs(_this.videoEl, "video").oncanplay = () => {
          qs(_this.videoEl, "video").play();
        };
      };
      qs(_this.videoEl, ".play__icon").onclick = () => {
        if (_this.isPlay) {
          _this.isPlay = false; // 暂停
          qs(_this.videoEl, "video").pause();
          qs(_this.videoEl, ".play__icon").classList.remove("pause");
        } else {
          _this.isPlay = true; // 播放
          qs(_this.videoEl, "video").play();
          qs(_this.videoEl, ".play__icon").classList.add("pause");
        }
      };
      qs(_this.videoEl, ".sound__btn").onclick = () => {
        qs(_this.videoEl, ".sound__btn").classList.toggle("show");
      };
      qs(_this.videoEl, ".sound__btn").oninput = (e) => {
        qs(_this.videoEl, "video").volume = e.target.value / 100;
      };
      canvas.renderAll();
    };
  }
  setEvents() {
    $id("downMedia").onclick = () => {
      var selectedObject = canvas.getActiveObject();
      if (selectedObject && selectedObject === this.background) {
        const link = document.createElement("a");
        link.href = this.videoSrc;
        link.download = "video.mp4"; // 设置下载的文件名
        link.click();
      }
    };
  }
}

class AudioMedia {
  constructor(data) {
    this.audioFile = data;
    this.isPlay = false;
    this.init();
  }
  init() {
    this.createAudio();
  }
  showAudio() {
    const { x, y } = this.background.aCoords.tl;
    this.audioEl.style.position = "absolute";
    this.audioEl.style.left = `${x}px`;
    this.audioEl.style.top = `${y + 156 - 30}px`;
  }
  createHtml(src, duration) {
    const html = `
      <div class="handle__audio">
        <audio src="${src}"></audio>
        <div class="audio__name" contenteditable="true">${this.audioFile.name}</div>
        <div class="audio__process">
          <input type="range" value="0" />
        </div>
        <div class="audio__time">
          <span class="audio__curTime">00:00</span>
          <span class="audio__allTime">${duration}</span>
        </div>
        <div class="audio__logo"></div>
        <div class="audio__playBtn"></div>
      </div>
    `;
    return html_to_element(html);
  }
  createAudio() {
    let _this = this;
    const url = URL.createObjectURL(this.audioFile);
    var audioElement = new Audio(url);
    audioElement.onloadedmetadata = () => {
      this.audioEl = this.createHtml(url, formatTime(audioElement.duration));
      this.audio = qs(this.audioEl, "audio");
      qs(document, ".container").appendChild(this.audioEl);
      // 创建背景
      this.background = new fabric.Rect({
        width: 156,
        height: 156,
        fill: "#f7f7f8",
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
        type: "audio",
        hasControls: false,
      });
      canvas.add(this.background);
      canvas.centerObject(this.background);
      _this.showAudio();
      this.background.on("moving", () => {
        _this.showAudio();
      });
      this.background.on("removed", function () {
        _this.audioEl.remove();
      });
      qs(this.audioEl, ".audio__playBtn").onclick = () => {
        if (!this.isPlay) {
          this.isPlay = true;
          qs(this.audioEl, ".audio__playBtn").classList.add("active");
          qs(this.audioEl, ".audio__logo").classList.add("active");
          this.audio.play();
        } else {
          this.isPlay = false;
          qs(this.audioEl, ".audio__playBtn").classList.remove("active");
          qs(this.audioEl, ".audio__logo").classList.remove("active");
          this.audio.pause();
        }
      };
      this.audio.addEventListener("ended", () => {
        this.isPlay = false;
        qs(this.audioEl, ".audio__playBtn").classList.remove("active");
        qs(this.audioEl, ".audio__logo").classList.remove("active");
        qs(_this.audioEl, ".audio__process input").value = 0;
        qs(_this.audioEl, ".audio__time .audio__curTime").innerHTML = "00:00";
      });
      this.audio.addEventListener("timeupdate", () => {
        if (!_this.isPlay) return;
        qs(_this.audioEl, ".audio__time .audio__curTime").innerHTML =
          formatTime(this.audio.currentTime);
        qs(_this.audioEl, ".audio__process input").value = Math.ceil(
          (this.audio.currentTime / this.audio.duration) * 100
        );
      });
      qs(_this.audioEl, ".audio__process input").oninput = (e) => {
        this.audio.pause();
        this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
        qs(_this.audioEl, ".audio__time .audio__curTime").innerHTML =
          formatTime(this.audio.currentTime);
        this.audio.oncanplay = () => {
          this.audio.play();
        };
      };
      $id("downMedia").onclick = () => {
        var selectedObject = canvas.getActiveObject();
        if (selectedObject && selectedObject === this.background) {
          const link = document.createElement("a");
          link.href = url;
          link.download = "audio.mp3"; // 设置下载的文件名
          link.click();
        }
      };
      canvas.renderAll();
    };
  }
}
