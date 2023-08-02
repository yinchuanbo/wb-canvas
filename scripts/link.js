$id('linkAdd').onclick = () => {
	let val = (linkContent.value || '').trim()
	if (!val) return;
	if (isYoutubeUrl(val)) {
		new YoutubeLink({
			url: val,
			width: 742,
			height: 420
		})
	} else if (isSpotifyUrl(val)) {
		let src = val.split('?')[0];
		src = src.split('/');
		let id = src.pop();
		const spotifyParam = val.includes('track')
			? 'track'
			: val.includes('episode')
				? 'episode'
				: val.includes('show')
					? 'show'
					: val.includes('playlist')
						? 'playlist'
						: '';
		src = `https://open.spotify.com/embed/${spotifyParam}/${id}?utm_source=generator`;
		new SpotifyLink({
			url: val,
			width: 330,
			height: 352,
			src
		})
	} else {
		alert('Link Invalid')
	}
	$id('link').classList.remove('active');
}

class YoutubeLink {
	constructor(data = {}) {
		this.url = data?.url || '';
		this.width = data?.width || 0;
		this.height = data?.height || 0;
		this.init();
	}
	init() {
		this.getYoutubeId();
		this.getYoutubeData();
	}
	getYoutubeId() {
		if (this.url.includes('v=')) {
			this.youtubeId = this.url.split('v=')[1];
		} else {
			this.youtubeId = this.url.split('/').pop();
		}
	}
	async getYoutubeData() {
		try {
			const response = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${this.youtubeId}&key=AIzaSyBGzMeSJJBYYbjS2P2UkWa8tV2kL3e1wNM`);
			const data = await response.json();
			console.log('data: ', data);
			const items = data.items;
			if (!items.length) return;
			const curVideoInfo = items[0];
			const snippet = curVideoInfo.snippet;
			const thumbnails = snippet.thumbnails;
			const maxres = thumbnails.maxres;
			this.title = snippet.title;
			this.poster = maxres?.url || thumbnails?.standard?.url || '';
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
			type: "frame"
		});
		const youtubeLogo = new fabric.Image(qs(document, '#youtubeLogo'), {
			width: 32,
			height: 32,
			top: 4,
			left: 14,
		})
		const youtubeTitle = new fabric.Text(this.title, {
			left: 51,
			top: 13,
			fill: "#464646",
			fontSize: 14,
			fontFamily: "Arial",
		});
		fabric.Image.fromURL(this.poster, (poster) => {
			const curImg = poster.getElement();
			console.log('curImg', curImg.width, curImg.height)
			poster.set({
				left: 14,
				top: 40,
				scaleX: this.width / curImg.width,
				scaleY: this.height / curImg.height,
				originX: 'left',
				originY: 'top'
			})
			const youtubePlayBtn = new fabric.Image(qs(document, '#playButton'), {
				width: 80,
				height: 80,
				top: (this.height - 80) / 2 + 40,
				left: (this.width + 14 + 14 - 80) / 2,
			})
			this.group = new fabric.Group([background, youtubeLogo, youtubeTitle, poster, youtubePlayBtn], {
				type: 'frame'
			});
			canvas.add(this.group);
			canvas.centerObject(this.group);
			this.group.on("moving", () => {
				this.changeYoutubeDom();
			});
			this.group.on("mousedown", (e) => {
				e.e.preventDefault()
				const curX = e.pointer.x - this.group.left;
				const curY = e.pointer.y - this.group.top;
				const { scaleX, scaleY } = this.group;
				if (curX > 345 * scaleX && curX < 425 * scaleX && curY > 212 * scaleY && curY < 291 * scaleY) {
					setTimeout((() => {
						this.loadYoutube()
					}).bind(this), 200)
				}
			});
			canvas.renderAll()
		})
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
		  <div class="youtube__el" style="width: ${curW - 14 - 14}px;height: ${curH - 14 - 40}px;top: ${top + 40}px;left: ${left + 14}px;">
			 <div id="youtube__${this.youtubeId}"></div>
			</div>
		`;
		this.youtubeDom = html_to_element(html);
		qs(document, '.container').appendChild(this.youtubeDom);
		this.requestForYoutube()
	}
	requestForYoutube() {
		const { width, height, scaleX, scaleY } = this.group;
		this.youtubeObj = new YT.Player('youtube__' + this.youtubeId, {
			height: height * scaleY - 14 - 40,
			width: width * scaleX - 14 - 14,
			videoId: this.youtubeId,
			playerVars: {
				enablejsapi: 1,
				fs: 0,
				controls: 2,
				autoplay: 1
			}
		});
		canvas.on("selection:updated", () => {
			const activeObject = canvas.getActiveObject();
			const isBackground = activeObject === this?.group;
			if (!isBackground) {
				this?.youtubeDom?.remove?.()
			}
		});
		canvas.on("selection:cleared", () => {
			this?.youtubeDom?.remove?.()
		});
	}
}

class SpotifyLink {
	constructor(data = {}) {
		this.url = data?.url || '';
		this.width = data?.width || 0;
		this.height = data?.height || 0;
		this.src = data?.src || '';
		this.init()
	}
	init() {
		console.log('data', data)
	}
}