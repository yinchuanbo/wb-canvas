// 处理文件上传
$id("upload").addEventListener("change", (e) => {
	const file = e.target.files[0];
	const reader = new FileReader();
	reader.onload = (event) => {
		e.target.value = '';
		if (file.type.startsWith('video/')) {
			new VideoMedia(event)
		} else if (file.type.startsWith('audio/')) {
			// 上传的是音频文件
			console.log('音频文件')
		} else if (file.type.startsWith('image/')) {
			const imgObj = new Image();
			imgObj.src = event.target.result;
			imgObj.onload = () => {
				new ImgMedia(imgObj)
			};
		}
	};
	reader.readAsDataURL(file);
});

class ImgMedia {
	constructor(imgObj) {
		this.imgObj = imgObj;
		this.cropBox = null;
		this.originalImage = null;
		this.comScale = 1;
		this.init();
	}
	init() {
		this.createImageCom();
		this.setImageComEvents();
	}
	createImageCom() {
		this.fabricImg = new fabric.Image(this.imgObj);
		this.fabricImg.set({
			left: canvas.width / 2,
			top: canvas.height / 2,
			width: this.imgObj.width,
			height: this.imgObj.height,
			borderColor: "#1967d2",
			cornerColor: "#1967d2",
			cornerSize: 10,
			type: 'image'
		});
		canvas.add(this.fabricImg);
		canvas.centerObject(this.fabricImg);
		canvas.renderAll();
	}
	setImageComEvents() {
		let _this = this;
		this.fabricImg.on("scaling", function () {
			showToolBar();
		});
		this.fabricImg.on("moving", function (e) {
			if (_this.cropBox && _this.originalImage) {
				canvas.setActiveObject(_this.cropBox);
				var rectBounds = _this.cropBox.getBoundingRect();
				var imageBounds = _this.originalImage.getBoundingRect();
				canvas.setActiveObject(_this.cropBox);
				if (rectBounds.left < imageBounds.left) {
					_this.originalImage.set("left", rectBounds.left);
				}
				if (rectBounds.top < imageBounds.top) {
					_this.originalImage.set("top", rectBounds.top);
				}
				if (
					rectBounds.left + rectBounds.width >
					imageBounds.left + imageBounds.width
				) {
					_this.originalImage.set(
						"left",
						rectBounds.left + rectBounds.width - imageBounds.width
					);
				}
				if (
					rectBounds.top + rectBounds.height >
					imageBounds.top + imageBounds.height
				) {
					_this.originalImage.set(
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
		// 旋转
		$id("rotate").onclick = () => {
			if (this.originalImage) {
				this.originalImage.rotate(this.originalImage.angle + 90);
			} else {
				const activeObject = canvas.getActiveObject();
				activeObject?.rotate?.(activeObject.angle + 90);
			}
			canvas.renderAll();
		};
		// 缩放
		$id("scale").onclick = () => {
			const curActiveObject = this.originalImage || canvas.getActiveObject();
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
		// 裁剪
		$id("crop").onclick = () => {
			const cropTypeList = $id("crop").querySelector('.cropType__list');
			if (cropTypeList) {
				cropTypeList.classList.toggle('active');
			}
			var activeObject = canvas.getActiveObject();
			if (activeObject && activeObject?.type === "image") {
				this.originalImage = activeObject;
				this.originalImage.selectable = true;
			}
		};
		$id('original').onclick = (e) => {
			e.stopPropagation()
			document.querySelector('.cropType__list').classList.remove('active');
			if (this.initOriginalImage) {

			}
		}
		$id('rect1-1').onclick = (e) => {
			e.stopPropagation()
			document.querySelector('.cropType__list').classList.remove('active');
			let { width, height, left, top, scaleX, scaleY } = _this.originalImage;
			width = width * scaleX;
			height = height * scaleY;
			const minSize = Math.min(width, height);
			const curSize = minSize * 0.6;
			_this.startCrop({
				left: left + (width - curSize) / 2,
				top: top + (height - curSize) / 2,
				width: curSize,
				height: curSize
			})
		}
	}
	startCrop({
		left,
		top,
		width,
		height
	}) {
		let _this = this;
		if (this.originalImage) {
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
			});
			this.cropBox.on('scaling', () => {
				console.log('this.cropBox', this.cropBox)
			})
			canvas.add(this.cropBox);
			canvas.setActiveObject(this.cropBox);
			setControlsVisibility(this.cropBox);
			canvas.on("selection:cleared", function (event) {
				var pointer = canvas.getPointer(event.e);
				var target = canvas.findTarget(event.e);
				if (target && target.hasControls && target.containsPoint(pointer)) {
					canvas.setActiveObject(_this.cropBox);
				} else {
					_this.cropImage();
				}
			});
		}
	}
	cropImage() {
		let _this = this;
		if (this.cropBox) {
			var left = this.cropBox.left - this.originalImage.left;
			var top = this.cropBox.top - this.originalImage.top;
			var width = this.cropBox.width * this.cropBox.scaleX;
			var height = this.cropBox.height * this.cropBox.scaleY;
			// 原始图片信息
			if (!_this.initOriginalImage) {
				const originImg = this.originalImage.toDataURL({
					format: "png",
					quality: 1
				});
				_this.initOriginalImage = {
					left: _this.originalImage.left,
					top: _this.originalImage.top,
					width: _this.originalImage.width,
					height: _this.originalImage.height,
					src: originImg
				}
			}
			// 上一次 cropBox 信息
			_this.preCropBox = {
				left: _this.cropBox.left,
				top: _this.cropBox.top,
				width: _this.cropBox.width,
				height: _this.cropBox.height,
			}
			var croppedImage = new Image();
			croppedImage.src = this.originalImage.toDataURL({
				left: left,
				top: top,
				width: width,
				height: height,
				format: "png",
			});
			croppedImage.onload = function () {
				var imgInstance = new fabric.Image(croppedImage, {
					left: _this.originalImage.left + left,
					top: _this.originalImage.top + top,
					angle: 0,
					opacity: 1,
					cornerSize: 10,
					hasRotatingPoint: false,
					borderColor: "#1967d2",
					cornerColor: "#1967d2",
				});
				imgInstance.on('scaling', () => {
					showToolBar()
				})
				canvas.remove(_this.originalImage);
				canvas.remove(_this.cropBox);
				canvas.add(imgInstance);
				_this.originalImage = imgInstance;
				_this.cropBox = null;
				canvas.renderAll();
			};
		}
	}
}

class VideoMedia {
	constructor(data) {
		this.videoEvent = data;
		this.init();
	}
	init() {
		this.createVideo()
	}
	createVideo() {
		const videoObj = document.createElement("video");
		videoObj.src = this.videoEvent.target.result;
		videoObj.type = "video/mp4";
		videoObj.controls = true;
		videoObj.onloadedmetadata = () => {

		};
	}
}