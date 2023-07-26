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
    this.init();
  }
  init() {
    this.createImageCom();
    this.setImageComEvents();
  }
  createImageCom() {
    this.fabricImg = new fabric.Image(this.imgObj);
    window.fabricImg = this.fabricImg;
    const originImgW = this.imgObj.width;
    const originImgH = this.imgObj.height;
    const size = setMaxSize(originImgW, originImgH);
    this.fabricImg.set({
      width: originImgW,
      height: originImgH,
      borderColor: "#1967d2",
      cornerColor: "#1967d2",
      cornerSize: 10,
      type: "image",
      scaleX: size.width / originImgW,
      scaleY: size.height / originImgH,
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
      if (type === "back") {
        canvas.remove(this.cropBox);
        this.cropBox = null;
      }
      this.fabricImg.visible = true;
      const scaleXTemp = this.imgCopy.scaleX * this.fabricImg.scaleX;
      const scaleYTemp = this.imgCopy.scaleY * this.fabricImg.scaleY;
      this.fabricImg.set({
        scaleX: scaleXTemp,
        scaleY: scaleYTemp,
      });
      canvas.remove(this.imgCopy);

      this.imgCopy = null;
      const scaleX = this.fabricImg.scaleX;
      const scaleY = this.fabricImg.scaleY;
      const clipPath = this.fabricImg.clipPath;
      this.fabricImg.clipPath = null;
      this.fabricImg.dirty = true;
      if (this.offsetPos.type === "circle") {
        this.startCrop({
          left:
            this.fabricImg.left +
            (this.offsetPos.x / this.offsetPos.scaleX) * scaleX,
          top:
            this.fabricImg.top +
            (this.offsetPos.y / this.offsetPos.scaleY) * scaleY,
          radius: (clipPath.width * scaleX) / 2,
          type: "circle",
        });
      } else {
        this.startCrop({
          left:
            this.fabricImg.left +
            (this.offsetPos.x / this.offsetPos.scaleX) * scaleX,
          top:
            this.fabricImg.top +
            (this.offsetPos.y / this.offsetPos.scaleY) * scaleY,
          width: clipPath.width * scaleX,
          height: clipPath.height * scaleY,
        });
      }
      canvas.renderAll();
    }
  }
  setImageComEvents() {
    let _this = this;
    this.fabricImg.on("scaling", function () {
      showToolBar();
      qs($id("scale"), ".scale__range").classList.remove("active");
    });
    this.fabricImg.on("moving", function (e) {
      _this.originalImage = {
        ..._this.originalImage,
        left: _this.fabricImg.left,
        top: _this.fabricImg.top,
      };
      if (_this.cropBox) {
        qs($id("scale"), ".scale__range").classList.remove("active");
        canvas.setActiveObject(_this.cropBox);
        var rectBounds = _this.cropBox.getBoundingRect();
        var imageBounds = _this.fabricImg.getBoundingRect();
        canvas.setActiveObject(_this.cropBox);
        const angle = ((this.angle ?? 0) / 90) % 4;
        if (angle === 0) {
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
        } else if (angle === 2) {
          if (rectBounds.left < imageBounds.left) {
            _this.fabricImg.set("left", rectBounds.left + imageBounds.width);
          }
          if (rectBounds.top < imageBounds.top) {
            _this.fabricImg.set("top", rectBounds.top + imageBounds.height);
          }
          if (
            rectBounds.left + rectBounds.width >
            imageBounds.left + imageBounds.width
          ) {
            _this.fabricImg.set("left", rectBounds.left + rectBounds.width);
          }
          if (
            rectBounds.top + rectBounds.height >
            imageBounds.top + imageBounds.height
          ) {
            _this.fabricImg.set("top", rectBounds.top + rectBounds.height);
          }
        } else if (angle === 1) {
          if (rectBounds.left < imageBounds.left) {
            _this.fabricImg.set("left", rectBounds.left + imageBounds.width);
          }
          if (rectBounds.top < imageBounds.top) {
            _this.fabricImg.set("top", rectBounds.top);
          }
          if (
            rectBounds.left + rectBounds.width >
            imageBounds.left + imageBounds.width
          ) {
            _this.fabricImg.set("left", rectBounds.left + rectBounds.width);
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
        } else if (angle === 3) {
          if (rectBounds.left < imageBounds.left) {
            _this.fabricImg.set("left", rectBounds.left);
          }
          if (rectBounds.top < imageBounds.top) {
            _this.fabricImg.set("top", rectBounds.top + imageBounds.height);
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
            _this.fabricImg.set("top", rectBounds.top + rectBounds.height);
          }
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
      this.fabricImg.rotate(this.fabricImg.angle + 90);
      this.angle = this.fabricImg.angle;
      const angle = ((this.angle ?? 0) / 90) % 4;
      const centerPoint = this.fabricImg.getCenterPoint();
      let adjustedLeft = null,
        adjustedTop = null,
        allW = null,
        allH = null;
      if (angle === 0 || angle === 2) {
        adjustedLeft = centerPoint.x - this.fabricImg.getScaledWidth() / 2;
        adjustedTop = centerPoint.y - this.fabricImg.getScaledHeight() / 2;
        allW = adjustedLeft + this.fabricImg.getScaledWidth();
        allH = adjustedTop + this.fabricImg.getScaledHeight();
      } else {
        adjustedLeft = centerPoint.x - this.fabricImg.getScaledHeight() / 2;
        adjustedTop = centerPoint.y - this.fabricImg.getScaledWidth() / 2;
        allW = adjustedLeft + this.fabricImg.getScaledHeight();
        allH = adjustedTop + this.fabricImg.getScaledWidth();
      }
      if (this.cropBox.left < adjustedLeft) {
        this.cropBox.set({
          left: adjustedLeft,
        });
      }
      if (this.cropBox.top < adjustedTop) {
        this.cropBox.set({
          top: adjustedTop,
        });
      }
      if (this.cropBox.left + this.cropBox.width > allW) {
        this.cropBox.set({
          left: allW - this.cropBox.width,
        });
      }
      if (this.cropBox.top + this.cropBox.height > allH) {
        this.cropBox.set({
          top: allH - this.cropBox.height,
        });
      }
      canvas.renderAll();
    };
    // 缩放
    $id("scale").onclick = (e) => {
      if (e.target.tagName === "INPUT") return;
      const scaleRange = qs($id("scale"), ".scale__range");
      scaleRange.classList.toggle("active");
    };
    $id("scaleRange").oninput = (e) => {
      const centerPoint = this.fabricImg.getCenterPoint();
      let scaleX = this.fabricImg.scaleX;
      let scaleY = this.fabricImg.scaleY;
      scaleX += 0.01;
      scaleY += 0.01;
      const offsetX = (this.fabricImg.width * scaleX) / 2;
      const offsetY = (this.fabricImg.height * scaleY) / 2;
      this.fabricImg.scale(scaleX, scaleY);
      this.fabricImg.set({
        left: centerPoint.x - offsetX,
        top: centerPoint.y - offsetY,
      });
      canvas.renderAll();
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
    let _this = this;
    if (this.fabricImg) {
      if (this.cropBox) {
        canvas.remove(_this.cropBox);
        _this.cropBox = null;
      }
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
          type: "circle",
          aspe: 1,
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
        function () {
          showToolBar("cropBox");
          qs($id("scale"), ".scale__range").classList.remove("active");
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
            canvas.renderAll();
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
  createNewCom() {
    var croppedImage = new Image();
    var _this = this;
    croppedImage.src = this.fabricImg.clipPath.toDataURL();
    console.log('croppedImage.src', croppedImage.src)
    croppedImage.onload = function () {
      _this.imgCopy = new fabric.Image(croppedImage, {
        left: _this.offsetPos.x + _this.fabricImg.left,
        top: _this.offsetPos.y + _this.fabricImg.top,
        cornerSize: 10,
        hasRotatingPoint: false,
        borderColor: "#1967d2",
        cornerColor: "#1967d2",
      });
      canvas.add(_this.imgCopy);
      _this.fabricImg.visible = false;
      _this.imgCopy.on("moving", () => {

      });
      canvas.renderAll();
    };
  }
  cropImage() {
    let _this = this;
    if (this.cropBox) {
      this.isCrop = true;
      var width = this.cropBox.width * this.cropBox.scaleX;
      var height = this.cropBox.height * this.cropBox.scaleY;
      const imgCenter = this.fabricImg.getCenterPoint();
      const rectCenter = this.cropBox.getCenterPoint();
      let curLeft, curTop;
      const xAbs = Math.abs(imgCenter.x - rectCenter.x);
      const yAbs = Math.abs(imgCenter.y - rectCenter.y);
      if (rectCenter.x > imgCenter.x) {
        curLeft = xAbs;
      } else {
        curLeft = -xAbs;
      }
      if (rectCenter.y > imgCenter.y) {
        curTop = yAbs;
      } else {
        curTop = -yAbs;
      }
      let clippingRect = null;
      const angle = ((this.angle ?? 0) / 90) % 4;
      const cropType = _this.cropBox?.type ?? "rect";
      let disX, disY;
      if (angle === 0) {
        const angle0Left = curLeft / _this.fabricImg.scaleX;
        const angle0Top = curTop / _this.fabricImg.scaleY;
        const angle0Width = width / _this.fabricImg.scaleX;
        const angle0Height = height / _this.fabricImg.scaleY;
        if (cropType === "circle") {
          clippingRect = new fabric.Circle({
            radius: angle0Width / 2,
            left: angle0Left,
            top: angle0Top,
            originX: "center",
            originY: "center",
          });
        } else {
          clippingRect = new fabric.Rect({
            width: angle0Width,
            height: angle0Height,
            left: angle0Left,
            top: angle0Top,
            originX: "center",
            originY: "center",
          });
        }
        disX =
          (_this.fabricImg.width / 2 + angle0Left - angle0Width / 2) *
          _this.fabricImg.scaleX;
        disY =
          (_this.fabricImg.height / 2 + angle0Top - angle0Height / 2) *
          _this.fabricImg.scaleY;
      } else if (angle === 1) {
        const curWidth = width / _this.fabricImg.scaleX;
        const curHeight = height / _this.fabricImg.scaleY;
        const curLeftVal = curLeft / _this.fabricImg.scaleY;
        const curTopVal = curTop / _this.fabricImg.scaleX;
        if (cropType === "circle") {
          clippingRect = new fabric.Circle({
            radius: curHeight / 2,
            left: curTopVal,
            top: -curLeftVal,
            originX: "center",
            originY: "center",
          });
        } else {
          clippingRect = new fabric.Rect({
            width: curHeight,
            height: curWidth,
            left: curTopVal,
            top: -curLeftVal,
            originX: "center",
            originY: "center",
          });
        }
      } else if (angle === 2) {
        const curWidth = width / _this.fabricImg.scaleX;
        const curHeight = height / _this.fabricImg.scaleY;
        const curLeftVal = curLeft / _this.fabricImg.scaleY;
        const curTopVal = curTop / _this.fabricImg.scaleX;
        if (cropType === "circle") {
          clippingRect = new fabric.Circle({
            radius: curWidth / 2,
            left: -curLeftVal,
            top: -curTopVal,
            originX: "center",
            originY: "center",
          });
        } else {
          clippingRect = new fabric.Rect({
            width: curWidth,
            height: curHeight,
            left: -curLeftVal,
            top: -curTopVal,
            originX: "center",
            originY: "center",
          });
        }
      } else if (angle === 3) {
        const curWidth = width / _this.fabricImg.scaleX;
        const curHeight = height / _this.fabricImg.scaleY;
        const curLeftVal = curLeft / _this.fabricImg.scaleY;
        const curTopVal = curTop / _this.fabricImg.scaleX;
        if (cropType === "circle") {
          clippingRect = new fabric.Circle({
            radius: curHeight / 2,
            left: -curTopVal,
            top: curLeftVal,
            originX: "center",
            originY: "center",
          });
        } else {
          clippingRect = new fabric.Rect({
            width: curHeight,
            height: curWidth,
            left: -curTopVal,
            top: curLeftVal,
            originX: "center",
            originY: "center",
          });
        }
      }
      _this.offsetPos = {
        x: this.cropBox.left - this.fabricImg.left,
        y: this.cropBox.top - this.fabricImg.top,
        scaleX: _this.fabricImg.scaleX,
        scaleY: _this.fabricImg.scaleY,
        type: _this.cropBox?.type || "rect",
      };
      _this.fabricImg.set({
        clipPath: clippingRect,
      });
      _this.createNewCom();
      canvas.remove(_this.cropBox);
      _this.cropBox = null;
      canvas.renderAll();
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
    this.videoEl.style.width = `${
      this.background.width * this.background.scaleX - 34
    }px`;
    this.videoEl.style.height = `${
      this.background.height * this.background.scaleY - 34
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
        shadow: {
          color: "rgba(0, 0, 0, 0.2)",
          offsetX: 0,
          offsetY: 3,
          blur: 6,
        },
        rx: 8,
        ry: 8,
        type: "video",
        videoEl: _this.videoEl,
      });
      canvas.add(this.background);
      canvas.centerObject(this.background);
      this.background.on("removed", function (e) {
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
        link.download = "video.mp4";
        link.rel = "noopener noreferrer";
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
        audioEl: _this.audioEl,
        duration: formatTime(audioElement.duration),
        curObj: _this,
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
        _this.currentTime = "00:00";
        _this.playRatio = 0;
      });
      this.audio.addEventListener("timeupdate", () => {
        if (!_this.isPlay) return;
        qs(_this.audioEl, ".audio__time .audio__curTime").innerHTML =
          formatTime(this.audio.currentTime);
        qs(_this.audioEl, ".audio__process input").value = Math.ceil(
          (this.audio.currentTime / this.audio.duration) * 100
        );
        _this.currentTime = formatTime(this.audio.currentTime);
        _this.playRatio = Math.ceil(
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
