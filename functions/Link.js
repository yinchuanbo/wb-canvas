$id("linkAdd").onclick = () => {
	let val = (linkContent.value || "").trim();
	if (!val) return;
	if (isYoutubeUrl(val)) {
		new YoutubeLink({
			url: val,
			width: 742,
			height: 420,
		});
	} else if (isSpotifyUrl(val)) {
		let src = val.split("?")[0];
		src = src.split("/");
		let id = src.pop();
		const spotifyParam = val.includes("track")
			? "track"
			: val.includes("episode")
				? "episode"
				: val.includes("show")
					? "show"
					: val.includes("playlist")
						? "playlist"
						: "";
		src = `https://open.spotify.com/embed/${spotifyParam}/${id}?utm_source=generator`;
		new SpotifyLink({
			url: val,
			width: 330,
			height: 352,
			src,
		});
	} else if (isMeetCodaUrl(val)) {
		new CodeLink({
			url: val,
			width: 750,
			height: 550,
		});
	} else {
		alert("Link Invalid");
	}
	$id("link").classList.remove("active");
	linkContent.value = '';
};
class YoutubeLink {
	constructor(data = {}) {
		this.url = data?.url || "";
		this.width = data?.width || 0;
		this.height = data?.height || 0;
		this.init();
	}
	init() {
		this.getYoutubeId();
		this.getYoutubeData();
	}
	getYoutubeId() {
		if (this.url.includes("v=")) {
			this.youtubeId = this.url.split("v=")[1];
		} else {
			this.youtubeId = this.url.split("/").pop();
		}
	}
	async getYoutubeData() {
		try {
			const response = await fetch(
				`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${this.youtubeId}&key=AIzaSyBGzMeSJJBYYbjS2P2UkWa8tV2kL3e1wNM`
			);
			const data = await response.json();
			console.log("data: ", data);
			const items = data.items;
			if (!items.length) return;
			const curVideoInfo = items[0];
			const snippet = curVideoInfo.snippet;
			const thumbnails = snippet.thumbnails;
			const maxres = thumbnails.maxres;
			this.title = snippet.title;
			this.poster = maxres?.url || thumbnails?.standard?.url || "";
			this.genYoutubeCom();
		} catch (error) {
			console.error(error);
		}
	}
	genYoutubeCom() {
		const background = new fabric.Rect({
			width: this.width + 14 + 14,
			height: this.height + 14 + 40,
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
		const youtubeLogo = new fabric.Image(qs(document, "#youtubeLogo"), {
			width: 32,
			height: 32,
			top: 4,
			left: 14,
		});
		const youtubeTitle = new fabric.Text(this.title, {
			left: 51,
			top: 13,
			fill: "#464646",
			fontSize: 14,
			fontFamily: "Arial",
		});
		fabric.Image.fromURL(this.poster, (poster) => {
			const curImg = poster.getElement();
			console.log("curImg", curImg.width, curImg.height);
			poster.set({
				left: 14,
				top: 40,
				scaleX: this.width / curImg.width,
				scaleY: this.height / curImg.height,
				originX: "left",
				originY: "top",
			});
			const youtubePlayBtn = new fabric.Image(qs(document, "#playButton"), {
				width: 80,
				height: 80,
				top: (this.height - 80) / 2 + 40,
				left: (this.width + 14 + 14 - 80) / 2,
				type: 'youtubePlayBtn'
			});
			this.group = new fabric.Group(
				[background, youtubeLogo, youtubeTitle, poster, youtubePlayBtn],
				{
					type: "youtube",
				}
			);
			canvas.add(this.group);
			canvas.centerObject(this.group);
			this.group.on("moving", () => {
				this.changeYoutubeDom();
			});
			this.group.on("mouseup", (e) => {
				e.e.preventDefault();
				const curX = e.pointer.x;
				const curY = e.pointer.y;
				const childs = this.group._objects;
				const viewBtn = childs.filter(item => item?.type === "youtubePlayBtn");
				const curRect = viewBtn[0].getBoundingRect();
				const { x, y } = this.group.getCenterPoint();
				const minX = x + curRect.left;
				const maxX = x + curRect.left + curRect.width;
				const minY = y + curRect.top;
				const maxY = y + curRect.top + curRect.height;
				console.log('minX', minX)
				if (
					curX > minX &&
					curX < maxX &&
					curY > minY &&
					curY < maxY
				) {
					this.loadYoutube();
				}
			});
			canvas.on('mouse:move', (e) => {
				const { x, y } = e.pointer;
				const { minX, maxX, minY, maxY } = this.getViewBtnArea();
				const childs = this.group._objects;
				const viewBtn = childs.filter(item => item?.type === "youtubePlayBtn");
				if (x > minX && x < maxX && y > minY && y < maxY) {
					viewBtn[0].set({
						opacity: 0.5
					})
				} else {
					viewBtn[0].set({
						opacity: 1
					})
				}
				canvas.renderAll()
			})
			canvas.renderAll();
		});
	}
	getViewBtnArea() {
		const childs = this.group._objects;
		const viewBtn = childs.filter(item => item?.type === "youtubePlayBtn");
		const curRect = viewBtn[0].getBoundingRect();
		const { x, y } = this.group.getCenterPoint();
		const minX = x + curRect.left;
		const maxX = x + curRect.left + curRect.width;
		const minY = y + curRect.top;
		const maxY = y + curRect.top + curRect.height;
		return {
			minX,
			maxX,
			minY,
			maxY
		}
	}
	changeYoutubeDom() {
		if (this?.youtubeDom) {
			const { width, height, top, left, scaleX, scaleY } = this.group;
			const curW = scaleX * width;
			const curH = scaleY * height;
			this.youtubeDom.style.top = `${top + 40}px`;
			this.youtubeDom.style.left = `${left + 14}px`;
			this.youtubeDom.style.width = `${curW - 14 - 14}px`;
			this.youtubeDom.style.height = `${curH - 14 - 40}px`;
		}
	}
	loadYoutube() {
		const { width, height, top, left, scaleX, scaleY } = this.group;
		const curW = scaleX * width;
		const curH = scaleY * height;
		let html = `
		  <div class="youtube__el" style="width: ${curW - 14 - 14}px;height: ${curH - 14 - 40
			}px;top: ${top + 40}px;left: ${left + 14}px;">
			 <div id="youtube__${this.youtubeId}"></div>
			</div>
		`;
		this.youtubeDom = html_to_element(html);
		qs(document, ".container").appendChild(this.youtubeDom);
		this.requestForYoutube();
	}
	requestForYoutube() {
		const { width, height, scaleX, scaleY } = this.group;
		this.youtubeObj = new YT.Player("youtube__" + this.youtubeId, {
			height: height * scaleY - 14 - 40,
			width: width * scaleX - 14 - 14,
			videoId: this.youtubeId,
			playerVars: {
				enablejsapi: 1,
				fs: 0,
				controls: 2,
				autoplay: 1,
			},
		});
		canvas.on("selection:updated", () => {
			const activeObject = canvas.getActiveObject();
			const isBackground = activeObject === this?.group;
			if (!isBackground) {
				this?.youtubeDom?.remove?.();
			}
		});
		canvas.on("selection:cleared", () => {
			this?.youtubeDom?.remove?.();
		});
	}
}
class SpotifyLink {
	constructor(data = {}) {
		this.url = data?.url || "";
		this.width = data?.width || 0;
		this.height = data?.height || 0;
		this.src = data?.src || "";
		this.init();
	}
	init() {
		this.setSpotifyCom();
	}
	async setSpotifyCom() {
		let { title, html, width, height, thumbnail_url } = await this.getSpotifyData();
		width = this.width;
		height = this.height
		html = html.replace(/width="[^"]+"/, `width="${width}"`);
		html = html.replace(/height="[^"]+"/, `height="${height}"`);
		this.frameHtml = html;
		const background = new fabric.Rect({
			width: width + 14 + 14,
			height: height + 14 + 40,
			fill: "#fff",
			shadow: {
				color: "rgba(0, 0, 0, 0.2)",
				offsetX: 0,
				offsetY: 3,
				blur: 6,
			},
			rx: 8,
			ry: 8
		});
		const spotifyLogo = new fabric.Image(qs(document, "#spotifyLogo"), {
			width: 32,
			height: 32,
			top: 4,
			left: 14,
		});
		const spotifyTitle = new fabric.Text(title, {
			left: 51,
			top: 13,
			fill: "#464646",
			fontSize: 14,
			fontFamily: "Arial"
		});
		fabric.Image.fromURL(thumbnail_url, (img) => {
			const curImg = img.getElement();
			const imgScaleX = width / curImg.width;
			const imgScaleY = height / curImg.height;
			const clippingRect = new fabric.Rect({
				width: 300,
				height: 300,
				top: -(300 / 2),
				left: -(300 / 2),
				rx: 10,
				ry: 10
			});
			img.set({
				left: 14,
				top: 40,
				width: curImg.width,
				height: curImg.height,
				type: 'thumbnail',
				scaleX: imgScaleX,
				scaleY: imgScaleY,
				clipPath: clippingRect,
			});
			const spotifyBtn = new fabric.Rect({
				width: 200,
				height: 40,
				fill: "#fff",
				shadow: {
					color: "rgba(0, 0, 0, 0.2)",
					offsetX: 0,
					offsetY: 3,
					blur: 6,
				},
				rx: 8,
				ry: 8,
				type: 'viewBtn'
			});
			const spotifyText = new fabric.Text('view', {
				fill: "#464646",
				fontSize: 14,
				fontFamily: "Arial",
				type: 'viewText'
			});
			const spotifyBtnLeft = (background.width - spotifyBtn.width) / 2;
			const spotifyBtnTop = (background.height - spotifyBtn.height) / 2 + 40 - 14 - 14;
			spotifyBtn.set({
				left: spotifyBtnLeft,
				top: spotifyBtnTop
			})
			const spotifyTextLeft = (background.width - spotifyText.width) / 2;
			const spotifyTextTop = (background.height - spotifyText.height) / 2 + 40 - 14 - 14;
			spotifyText.set({
				left: spotifyTextLeft,
				top: spotifyTextTop
			})
			this.group = new fabric.Group([background, spotifyLogo, spotifyTitle, img, spotifyBtn, spotifyText], {
				type: "spotify",
			});
			canvas.add(this.group);
			canvas.centerObject(this.group);
			this.group.on("moving", () => {
				this.changeSpotifyDom();
			});
			this.group.on("removed", () => {
				if (this.spotifyDom) {
					this.spotifyDom.remove();
				}
			});
			this.group.on("mouseup", (e) => {
				e.e.preventDefault();
				const curX = e.pointer.x;
				const curY = e.pointer.y;
				const childs = this.group._objects;
				const viewBtn = childs.filter(item => item?.type === "viewBtn");
				const curRect = viewBtn[0].getBoundingRect();
				const { x, y } = this.group.getCenterPoint();
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
					this.showOrHideItem()
					this.setSpotifyDom();
				}
			});
			canvas.on('mouse:move', (e) => {
				const { x, y } = e.pointer;
				const { minX, maxX, minY, maxY } = this.getViewBtnArea();
				const childs = this.group._objects;
				const viewBtn = childs.filter(item => item?.type === "viewBtn");
				if (x > minX && x < maxX && y > minY && y < maxY) {
					viewBtn[0].set({
						fill: '#f5f5f5',
						opacity: 0.9
					})
				} else {
					viewBtn[0].set({
						fill: '#fff',
						opacity: 1
					})
				}
				canvas.renderAll()
			})
			canvas.renderAll();
		})
	}
	getViewBtnArea() {
		const childs = this.group._objects;
		const viewBtn = childs.filter(item => item?.type === "viewBtn");
		const curRect = viewBtn[0].getBoundingRect();
		const { x, y } = this.group.getCenterPoint();
		const minX = x + curRect.left;
		const maxX = x + curRect.left + curRect.width;
		const minY = y + curRect.top;
		const maxY = y + curRect.top + curRect.height;
		return {
			minX,
			maxX,
			minY,
			maxY
		}
	}
	showOrHideItem(bool = false) {
		const childs = this.group._objects;
		const findThumbnailObj = childs.filter(item => item?.type === "thumbnail");
		const viewBtn = childs.filter(item => item?.type === "viewBtn");
		const viewText = childs.filter(item => item?.type === "viewText");
		if (findThumbnailObj?.length) {
			findThumbnailObj[0].visible = bool;
		}
		if (viewBtn?.length) {
			viewBtn[0].visible = bool;
		}
		if (viewText?.length) {
			viewText[0].visible = bool;
		}
	}
	getSpotifyData() {
		return new Promise((resolve, reject) => {
			const fetchUrl = `https://open.spotify.com/oembed?url=${this.url ?? ""
				}&format=json`;
			fetch(fetchUrl)
				.then((res) => res.json())
				.then((rel) => {
					console.log('res', rel)
					resolve(rel);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}
	setSpotifyDom() {
		const { width, height, top, left, scaleX, scaleY } = this.group;
		const curW = scaleX * width;
		const curH = scaleY * height;
		let html = `
		  <div class="spotify__el" style="width: ${curW - 14 - 14}px;height: ${curH - 14 - 40
			}px;top: ${top + 40}px;left: ${left + 14}px;">
			 ${this.frameHtml}
			</div>
		`;
		this.spotifyDom = html_to_element(html);
		qs(document, ".container").appendChild(this.spotifyDom);
	}
	changeSpotifyDom() {
		if (this?.spotifyDom) {
			const { width, height, top, left, scaleX, scaleY } = this.group;
			const curW = scaleX * width;
			const curH = scaleY * height;
			this.spotifyDom.style.top = `${top + 40}px`;
			this.spotifyDom.style.left = `${left + 14}px`;
			this.spotifyDom.style.width = `${curW - 14 - 14}px`;
			this.spotifyDom.style.height = `${curH - 14 - 40}px`;
		}
	}
}
class CodeLink {
	constructor(data = {}) {
		this.url = data?.url || "";
		this.width = data?.width || 0;
		this.height = data?.height || 0;
		this.init();
	}
	init() {
		this.setCodaCom();
	}
	async getCodaData() {
		const resId = this.url.split("_d")[1].split("/")[0];
		const url = `https://coda.io/apis/v1/docs/${resId}`;
		const token = "d0dcf091-54b7-42a4-8493-a14eabebaee1";
		const result = await fetchDataFromCoda(url, token);
		return result;
	}
	async setCodaCom() {
		const codaInfo = await this.getCodaData();
		const background = new fabric.Rect({
			width: this.width + 14 + 14,
			height: this.height + 14 + 40,
			fill: "#fff",
			shadow: {
				color: "rgba(0, 0, 0, 0.2)",
				offsetX: 0,
				offsetY: 3,
				blur: 6,
			},
			rx: 8,
			ry: 8,
			type: "frame",
		});
		const codaLogo = new fabric.Image(qs(document, "#codaLogo"), {
			width: 32,
			height: 32,
			top: 4,
			left: 14,
		});
		const codaTitle = new fabric.Text(codaInfo.name || "Coda", {
			left: 51,
			top: 13,
			fill: "#464646",
			fontSize: 14,
			fontFamily: "Arial",
		});
		const codaMain = new fabric.Rect({
			width: this.width,
			height: this.height,
			fill: "rgba(0,0,0,.1)",
			left: 14,
			top: 40
		});
		const codaViewBtn = new fabric.Rect({
			width: 200,
			height: 40,
			fill: "#fff",
			shadow: {
				color: "rgba(0, 0, 0, 0.2)",
				offsetX: 0,
				offsetY: 3,
				blur: 6,
			},
			rx: 8,
			ry: 8,
			type: 'viewBtn'
		});
		const codaViewText = new fabric.Text('view', {
			fill: "#464646",
			fontSize: 14,
			fontFamily: "Arial",
			type: 'viewText'
		});
		const codaViewBtnLeft = (background.width - codaViewBtn.width) / 2;
		const codaViewBtnTop = (background.height - codaViewBtn.height) / 2 + 40 - 14 - 14;
		codaViewBtn.set({
			left: codaViewBtnLeft,
			top: codaViewBtnTop
		})
		const codaViewTextLeft = (background.width - codaViewText.width) / 2;
		const codaViewTextTop = (background.height - codaViewText.height) / 2 + 40 - 14 - 14;
		codaViewText.set({
			left: codaViewTextLeft,
			top: codaViewTextTop
		})
		this.group = new fabric.Group([background, codaLogo, codaTitle, codaMain, codaViewBtn, codaViewText], {
			type: "coda",
		});
		canvas.add(this.group);
		canvas.centerObject(this.group);
		// this.setCodaDom();
		this.group.on("moving", () => {
			this.changeCodaDom();
		});
		this.group.on("removed", () => {
			if (this.codaDom) {
				this.codaDom.remove();
			}
		});
		this.group.on("mouseup", (e) => {
			e.e.preventDefault();
			const curX = e.pointer.x;
			const curY = e.pointer.y;
			const childs = this.group._objects;
			const viewBtn = childs.filter(item => item?.type === "viewBtn");
			const curRect = viewBtn[0].getBoundingRect();
			const { x, y } = this.group.getCenterPoint();
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
				this.showOrHideItem()
				this.setCodaDom();
			}
		});
		canvas.on('mouse:move', (e) => {
			const { x, y } = e.pointer;
			const { minX, maxX, minY, maxY } = this.getViewBtnArea();
			const childs = this.group._objects;
			const viewBtn = childs.filter(item => item?.type === "viewBtn");
			if (x > minX && x < maxX && y > minY && y < maxY) {
				viewBtn[0].set({
					fill: '#f2f2f2',
					opacity: 0.9
				})
			} else {
				viewBtn[0].set({
					fill: '#fff',
					opacity: 1
				})
			}
			canvas.renderAll()
		})
		canvas.on("selection:updated", () => {
			const activeObject = canvas.getActiveObject();
			const isBackground = activeObject === this?.group;
			if (!isBackground) {
				this.showOrHideItem(true)
				this.codaDom?.remove?.()
			}
		});
		canvas.on("selection:cleared", () => {
			this.showOrHideItem(true)
			this.codaDom?.remove?.()
		});
		canvas.renderAll();
	}
	getViewBtnArea() {
		const childs = this.group._objects;
		const viewBtn = childs.filter(item => item?.type === "viewBtn");
		const curRect = viewBtn[0].getBoundingRect();
		const { x, y } = this.group.getCenterPoint();
		const minX = x + curRect.left;
		const maxX = x + curRect.left + curRect.width;
		const minY = y + curRect.top;
		const maxY = y + curRect.top + curRect.height;
		return {
			minX,
			maxX,
			minY,
			maxY
		}
	}
	showOrHideItem(bool = false) {
		const childs = this.group._objects;
		const viewBtn = childs.filter(item => item?.type === "viewBtn");
		const viewText = childs.filter(item => item?.type === "viewText");
		if (viewBtn?.length) {
			viewBtn[0].visible = bool;
		}
		if (viewText?.length) {
			viewText[0].visible = bool;
		}
	}
	setCodaDom() {
		const { width, height, top, left, scaleX, scaleY } = this.group;
		const curW = scaleX * width;
		const curH = scaleY * height;
		const resId = this.url.split("_d")[1].split("/")[0];
		let getQuery = this.url.split("_d")[1].split("/")[1].split("_")[1];
		getQuery = getQuery.slice(0, getQuery.length - 1);
		const url = `https://coda.io/embed/${resId}/_${getQuery}?viewMode=embed`;
		let html = `
					<div class="coda__el" style="width: ${curW - 14 - 14}px;height: ${curH - 14 - 40
			}px;top: ${top + 40}px;left: ${left + 14}px;">
		<iframe src="${url}" width="${curW - 14 - 14}" height="${curH - 14 - 40
			}" style="max-width: 100%;display: block;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
						</div>
				`;
		this.codaDom = html_to_element(html);
		qs(document, ".container").appendChild(this.codaDom);
	}
	changeCodaDom() {
		if (this?.codaDom) {
			const { width, height, top, left, scaleX, scaleY } = this.group;
			const curW = scaleX * width;
			const curH = scaleY * height;
			this.codaDom.style.top = `${top + 40}px`;
			this.codaDom.style.left = `${left + 14}px`;
			this.codaDom.style.width = `${curW - 14 - 14}px`;
			this.codaDom.style.height = `${curH - 14 - 40}px`;
		}
	}
}
