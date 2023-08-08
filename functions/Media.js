$id("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    e.target.value = "";
    if (file.type.startsWith("video/")) {
      new VideoMedia({ file });
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
      const curFabricImgScaleX = this.fabricImg.scaleX * this.imgCopy.scaleX;
      const curFabricImgScaleY = this.fabricImg.scaleY * this.imgCopy.scaleY;
      const curFabricImgLeft = (this.offsetPos.x / this.offsetPos.scaleX) * curFabricImgScaleX;
      const curFabricImgTop = (this.offsetPos.y / this.offsetPos.scaleY) * curFabricImgScaleY;
      this.fabricImg.set({
        scaleX: curFabricImgScaleX,
        scaleY: curFabricImgScaleY,
        left: this.imgCopy.left - curFabricImgLeft,
        top: this.imgCopy.top - curFabricImgTop,
      })
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
      const currentValue = e.target.value;
      const centerPoint = this.fabricImg.getCenterPoint();
      let scaleX = this.fabricImg.scaleX;
      let scaleY = this.fabricImg.scaleY;
      if (currentValue > this.rangeVal) {
        scaleX += 0.01;
        scaleY += 0.01;
      } else if (currentValue < this.rangeVal) {
        scaleX -= 0.01;
        scaleY -= 0.01;
      }
      scaleX = scaleX < 1 ? 1 : scaleX;
      scaleY = scaleY < 1 ? 1 : scaleY;
      const offsetX = (this.fabricImg.width * scaleX) / 2;
      const offsetY = (this.fabricImg.height * scaleY) / 2;
      this.fabricImg.scale(scaleX, scaleY);
      this.fabricImg.set({
        left: centerPoint.x - offsetX,
        top: centerPoint.y - offsetY,
      });

      this.rangeVal = currentValue;
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
    var _this = this;
    const scaleX = this.fabricImg.scaleX;
    const scaleY = this.fabricImg.scaleY;
    var cropped = new Image();
    cropped.src = canvas.toDataURL({
      left: _this.fabricImg.left + (_this.offsetPos.x / _this.offsetPos.scaleX) * scaleX,
      top: _this.fabricImg.top + (_this.offsetPos.y / _this.offsetPos.scaleY) * scaleY,
      width: _this.cropBox.width * _this.cropBox.scaleX,
      height: _this.cropBox.height * _this.cropBox.scaleY,
    });
    cropped.onload = function () {
      _this.imgCopy = new fabric.Image(cropped, {
        left:
          _this.fabricImg.left +
          (_this.offsetPos.x / _this.offsetPos.scaleX) * scaleX,
        top:
          _this.fabricImg.top +
          (_this.offsetPos.y / _this.offsetPos.scaleY) * scaleY,
        cornerSize: 10,
        hasRotatingPoint: false,
        borderColor: "#1967d2",
        cornerColor: "#1967d2",
        fabricImg: _this.fabricImg
      });
      canvas.add(_this.imgCopy);
      _this.originImgCopy = {
        left: _this.imgCopy.left,
        top: _this.imgCopy.top,
        width: _this.imgCopy.width,
        height: _this.imgCopy.height,
      }
      _this.fabricImg.visible = false;
      _this.imgCopy.on("moving", () => {

      });
      _this.imgCopy.on("scaling", () => {

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
  constructor(data = {}) {
    this.file = data.file;
    this.init();
  }
  init() {
    this.createVideo();
  }
  createVideo() {
    const video = document.createElement("video");
    this.videoObj = video;
    video.setAttribute('crossOrigin', 'anonymous');
    video.setAttribute('preload', 'auto');
    video.src = URL.createObjectURL(this.file);
    this.src = video.src;
    video.addEventListener("loadeddata", () => {
      this.videoW = video.videoWidth;
      this.videoH = video.videoHeight;
      video.currentTime = 1;
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      canvas.width = this.videoW;
      canvas.height = this.videoH;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      var imageData = canvas.toDataURL("image/jpeg", 0.8);
      this.createVideoCover(imageData);
    })
  }
  createVideoCover(src = '') {
    fabric.Image.fromURL(src, (img) => {
      img.set({
        width: this.videoW,
        height: this.videoH,
        top: 17,
        left: 17,
        type: 'videoPoster'
      })
      const videoBg = new fabric.Rect({
        width: this.videoW + 2 * 17,
        height: this.videoH + 2 * 17,
        fill: "#fff",
        shadow: {
          color: "rgba(0, 0, 0, 0.2)",
          offsetX: 0,
          offsetY: 3,
          blur: 6,
        },
        rx: 8,
        ry: 8,
        type: "video"
      });
      const playButton = qs(document, '#playButton');
      const playButtonImg = new fabric.Image(playButton, {
        left: (this.videoW + 17 * 2 - 80) / 2,
        top: (this.videoH + 17 * 2 - 80) / 2,
        type: 'videoPlayBtn'
      })
      this.videoGroup = new fabric.Group([videoBg, img, playButtonImg]);
      canvas.add(this.videoGroup);
      canvas.centerObject(this.videoGroup);
      canvas.renderAll();
      this.videoGroup.on('scaling', () => {
        showToolBar();
      })
      this.videoGroup.on("mouseup", (e) => {
        e.e.preventDefault();
        const curX = e.pointer.x;
        const curY = e.pointer.y;
        const childs = this.videoGroup._objects;
        const viewBtn = childs.filter(item => item?.type === "videoPlayBtn");
        const curRect = viewBtn[0].getBoundingRect();
        const { x, y } = this.videoGroup.getCenterPoint();
        const minX = x + curRect.left;
        const maxX = x + curRect.left + curRect.width;
        const minY = y + curRect.top;
        const maxY = y + curRect.top + curRect.height;
        if (
          curX > minX &&
          curX < maxX &&
          curY > minY &&
          curY < maxY
        ) {
          alert('暂时去掉了视频播放')
        }
      });
    })
  }
}
class AudioMedia {
  constructor(data) {
    this.audioFile = data;
    this.init();
  }
  init() {
    this.createAudio();
  }
  createAudio() {
    let _this = this;
    const url = URL.createObjectURL(this.audioFile);
    var audioElement = new Audio(url);
    audioElement.onloadedmetadata = () => {
      const audioBg = new fabric.Rect({
        width: 156,
        height: 156,
        fill: "#fff",
        shadow: {
          color: "rgba(0, 0, 0, 0.2)",
          offsetX: 0,
          offsetY: 3,
          blur: 6,
        },
        rx: 8,
        ry: 8,
      });
      const bgTop = new fabric.Rect({
        width: 156,
        height: 126,
        fill: "#f7f7f8",
        top: 0,
        left: 0,
        rx: 8,
        ry: 8,
      });
      const musicLogo = new fabric.Image(qs(document, '#musicLogo'))
      musicLogo.set({
        left: (audioBg.width - musicLogo.width) / 2,
        top: 20
      })
      const musicPlayBtn = new fabric.Image(qs(document, '#playButton'), {
        width: 80,
        height: 80,
        scaleX: 0.6,
        scaleY: 0.6,
        visible: false,
        type: 'musicPlayBtn',
      })
      musicPlayBtn.set({
        left: (audioBg.width - musicPlayBtn.width * musicPlayBtn.scaleX) / 2,
        top: 40
      })
      const fileName = new fabric.Text(this.audioFile.name, {
        top: 0,
        left: 0,
        fill: '#202124',
        fontSize: 12,
        fontFamily: "Arial",
      });
      fileName.set({
        left: (audioBg.width - fileName.width) / 2,
        top: bgTop.height + 8
      })
      const curTime = new fabric.Text('00:00', {
        top: 105,
        left: 8,
        fill: '#838383',
        fontSize: 12,
        fontFamily: "Arial",
      });
      const durTime = new fabric.Text(formatTime(audioElement.duration), {
        top: 105,
        left: 120,
        fill: '#838383',
        fontSize: 12,
        fontFamily: "Arial",
      });
      const processBar = new fabric.Rect({
        width: 156,
        height: 4,
        fill: '#eee',
        top: 123
      });
      const circleBall = new fabric.Rect({
        width: 12,
        height: 12,
        fill: '#1967d2',
        top: 0,
        left: 0,
        rx: 12,
        ry: 12,
        top: 119
      });
      this.audioGroup = new fabric.Group([audioBg, bgTop, musicLogo, musicPlayBtn, fileName, curTime, durTime, processBar, circleBall], {
        type: 'audio',
        curObj: _this
      });
      canvas.add(this.audioGroup);
      canvas.centerObject(this.audioGroup);
      this.audioGroup.on('mouseover', () => {
        const musicPlayBtnCom = this.audioGroup._objects.filter(item => item?.type === 'musicPlayBtn');
        if (musicPlayBtnCom?.length) {
          musicPlayBtnCom[0].visible = true;
          canvas.renderAll()
        }
      })
      this.audioGroup.on('mouseout', () => {
        const musicPlayBtnCom = this.audioGroup._objects.filter(item => item?.type === 'musicPlayBtn');
        if (musicPlayBtnCom?.length) {
          musicPlayBtnCom[0].visible = false;
          canvas.renderAll()
        }
      })
      this.audioGroup.on("mouseup", (e) => {
        e.e.preventDefault();
        const curX = e.pointer.x;
        const curY = e.pointer.y;
        const childs = this.audioGroup._objects;
        const viewBtn = childs.filter(item => item?.type === "musicPlayBtn");
        const curRect = viewBtn[0].getBoundingRect();
        const { x, y } = this.audioGroup.getCenterPoint();
        const minX = x + curRect.left;
        const maxX = x + curRect.left + curRect.width;
        const minY = y + curRect.top;
        const maxY = y + curRect.top + curRect.height;
        if (
          curX > minX &&
          curX < maxX &&
          curY > minY &&
          curY < maxY
        ) {
          alert('暂时去掉了音频播放')
        }
      });
      canvas.renderAll();
    };
  }
}
