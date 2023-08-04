$id("netdisk").onclick = () => {
  new Netdisk();
};
class Netdisk {
  constructor() {
    this.init();
    this.isHasChild = false;
  }
  init() {
    this.initCanvas();
  }
  initCanvas() {
    let _this = this;
    this.netdiskBox = new fabric.Rect({
      width: 518,
      height: 363,
      fill: "#fff",
      rx: 8,
      ry: 8,
      stroke: "#b2b2b2",
      strokeWidth: 2,
      type: "netdisk",
    });
    this.netdiskTitle = new fabric.Text("Untitled", {
      left: 0,
      top: 20,
      fill: "#464646",
      fontSize: 16,
      fontFamily: "Arial",
    });
    this.netdiskLogo = new fabric.Image(qs(document, "#netdiskLogo"), {
      left: 0,
      top: 70,
    });
    this.netdiskDesc = new fabric.Text(
      "Drag files here, or click the “Select Files”",
      {
        left: 0,
        top: 200,
        fill: "#9A9A9A",
        fontSize: 14,
        fontFamily: "Arial",
      }
    );
    const netdiskTitleLeft =
      (this.netdiskBox.width - this.netdiskTitle.width) / 2;
    const netdiskLogoLeft =
      (this.netdiskBox.width - this.netdiskLogo.width) / 2;
    const netdiskDescLeft =
      (this.netdiskBox.width - this.netdiskDesc.width) / 2;
    this.netdiskTitle.set({
      left: netdiskTitleLeft,
    });
    this.netdiskLogo.set({
      left: netdiskLogoLeft,
    });
    this.netdiskDesc.set({
      left: netdiskDescLeft,
    });
    this.buttonBox = new fabric.Rect({
      width: 140,
      height: 40,
      fill: "#fff",
      rx: 20,
      ry: 20,
      stroke: "#464646",
      strokeWidth: 1,
    });
    this.addIcon = new fabric.Image(qs(document, "#addIcon"), {
      top: 7,
      left: 10,
    });
    this.buttonText = new fabric.Text("Select Files", {
      left: 40,
      top: 10,
      fill: "#464646",
      fontSize: 16,
      fontFamily: "Arial",
    });
    this.buttonGroup = new fabric.Group(
      [this.buttonBox, this.addIcon, this.buttonText],
      {
        top: 270,
        type: "buttonGroup",
      }
    );
    const buttonGroupleft =
      (this.netdiskBox.width - this.buttonGroup.width) / 2;
    this.buttonGroup.set({
      left: buttonGroupleft,
    });
    this.addGroup = new fabric.Group(
      [
        this.netdiskBox,
        this.netdiskTitle,
        this.netdiskLogo,
        this.netdiskDesc,
        this.buttonGroup,
      ],
      {
        type: "netdiskGroup",
      }
    );
    canvas.add(this.addGroup);
    canvas.centerObject(this.addGroup);
    this.addGroup.on("mousedown", (e) => {
      const curX = e.pointer.x - this.addGroup.left;
      const curY = e.pointer.y - this.addGroup.top;
      if (curX > 190 && curX < 327 && curY > 270 && curY < 309) {
        canvas.discardActiveObject();
        setTimeout(() => {
          _this.openFile();
        }, 200);
      }
    });
    canvas.renderAll();
  }
  handleImg({
    src,
    name
  }, type = '') {
    let itemHtml = `<div class="netdisk__el_item">
      <div class="netdisk__item_img">
        <img src="${src}"/>
      </div>
      <div class="netdisk__item_name">${name}</div>
      <div class="netdisk__item_process">
        <div class="process__bar"></div>
      </div>
      <div class="netdisk__tool">
        <button type="button">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24">
            <defs>
              <clipPath id="clip-path">
                <rect id="矩形_3667" data-name="矩形 3667" width="24" height="24" transform="translate(870 406)" fill="currentColor" opacity="0"/>
              </clipPath>
            </defs>
            <g id="btn_toolbar_delete_normal" transform="translate(-870 -406)" clip-path="url(#clip-path)">
              <path id="路径_2028" data-name="路径 2028" d="M14.556,1045.556v-.711a4.432,4.432,0,0,0-.194-1.876,1.791,1.791,0,0,0-.777-.773,4.379,4.379,0,0,0-1.874-.2H10.289a4.379,4.379,0,0,0-1.874.2,1.791,1.791,0,0,0-.777.773,4.432,4.432,0,0,0-.194,1.876v.711m1.778,4.889v4.444m3.556-4.444v4.444M3,1045.556H19m-1.778,0v9.956a6.612,6.612,0,0,1-.291,2.809,2.605,2.605,0,0,1-1.165,1.164,6.568,6.568,0,0,1-2.811.293H9.044a6.568,6.568,0,0,1-2.811-.293,2.606,2.606,0,0,1-1.165-1.164,6.612,6.612,0,0,1-.291-2.809v-9.956" transform="translate(871 -632.798)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </g>
          </svg>
        </button>
      </div>
    </div>`;
    itemHtml = html_to_element(itemHtml);
    this.editDom.appendChild(itemHtml);
    qs(itemHtml, ".netdisk__tool").onclick = () => {
      itemHtml.remove()
      const childsLen = this.editDom.children.length;
      if (!childsLen) {
        this.editDom.remove();
        this.editDom = null;
        this.addGroup.visible = true
        canvas.remove(this.netdiskNewBox);
        this.netdiskNewBox = null
        if (this?.newGroup) {
          canvas.remove(this.newGroup);
          this.newGroup = null;
        }
        if (this?.svgGroup) {
          canvas.remove(this.svgGroup);
          this.svgGroup = null;
        }
        canvas.renderAll()
      }
    }
    if (type === 'process') {
      const processDom = qs(itemHtml, ".netdisk__item_process");
      const processBar = qs(processDom, ".process__bar");
      incrementValue(1500, processDom, processBar);
    }
  }
  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        if (!this?.netdiskNewBox) {
          this.changeCom();
        }
        this.handleImg({ src: imgObj.src, name: file.name }, 'process')
      };
    };
    reader.readAsDataURL(file);
  }
  async handleEditDom() {
    if (this?.editDom) {
      if (this?.curLock) return;
      this.curLock = true
      let cloneDom = this.editDom.cloneNode(true);
      cloneDom.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      let outerHTML = cloneDom.outerHTML;
      outerHTML = outerHTML.replace(
        /<img([^>]+)>/g,
        "<img$1/>"
      );
      let curWidth = this.netdiskNewBox.width * this.netdiskNewBox.scaleX;
      const curHeight = this.netdiskNewBox.height * this.netdiskNewBox.scaleY;
      const scrollPosition = parseFloat(this.editDom.scrollTop);
      const scrollHeight = this.editDom.scrollHeight;
      const offsetHeight = this.editDom.offsetHeight;
      const isHasScrollBar = scrollHeight > offsetHeight;
      const data = `<svg xmlns='http://www.w3.org/2000/svg' width='${curWidth}' height='${curHeight}'>
        <style>
          .netdisk__el {
            display: flex;
            flex-wrap: wrap;
            overflow-x: hidden;
            overflow-y: auto;
            user-select: none;
            height: ${curHeight - 80 + scrollPosition}px!important;
          }
          .netdisk__el::-webkit-scrollbar {
            width: 6px;
          }
          .netdisk__el::-webkit-scrollbar-thumb {
            background: transparent;
            border-radius: 4px;
          }
          .netdisk__el .netdisk__el_item {
            width: 100px;
            height: 100px;
            padding: 10px 8px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .netdisk__el .netdisk__el_item .netdisk__tool {
            display: none;
          }
          .netdisk__el .netdisk__el_item + .netdisk__el_item {
            margin-left: 10px;
          }
          .netdisk__el .netdisk__el_item:nth-child(4n - 3) {
            margin-left: 0;
          }
          .netdisk__el .netdisk__el_item .netdisk__item_process {
            position: absolute;
            left: 0;
            bottom: 5px;
            width: calc(100% - 16px);
            height: 4px;
            background-color: #f2f2f2;
            border-radius: 4px;
            margin-left: 8px;
            display: none;
          }
          .netdisk__el .netdisk__el_item .netdisk__item_process .process__bar {
            position: absolute;
            left: 0;
            top: 0;
            width: 0;
            height: 100%;
            background-color: #1967d2;
            border-radius: 4px;
          }
          .netdisk__el .netdisk__el_item:hover {
            background-color: #f2f2f2;
            border-radius: 5px;
          }
          .netdisk__el .netdisk__el_item .netdisk__item_img {
            margin-bottom: 5px;
          }
          .netdisk__el .netdisk__el_item .netdisk__item_img img {
            max-width: 100%;
            max-height: 55px;
            user-select: none;
            -webkit-user-drag: none;
          }
          .netdisk__el .netdisk__el_item .netdisk__item_name {
            font-size: 12px;
            text-align: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            width: 100%;
            transform: translateZ(0);
          }
        </style>
        <foreignObject width='${curWidth}' height='${curHeight + scrollPosition}' y='-${scrollPosition}'>
          ${outerHTML}
        </foreignObject>
      </svg>`;
      var url = `data:image/svg+xml;charset=utf-8,${data}`;
      url = url.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23');
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.editDom.style.display = "none";
        this.netdiskNewBox.visible = false;
        const wrapperW = this.netdiskNewBox.width * this.netdiskNewBox.scaleX;
        const wrapperH = this.netdiskNewBox.height * this.netdiskNewBox.scaleY;
        const svgImg = new fabric.Image(img, {
          width: wrapperW - 80,
          height: wrapperH - 80,
          left: 40,
          top: 40
        });
        const clonedRect = new fabric.Rect({
          width: wrapperW,
          height: wrapperH,
          left: 0,
          top: 0,
          fill: "#fff",
          rx: 8,
          ry: 8,
          stroke: "#b2b2b2",
          strokeWidth: 2,
          type: "netdisk",
        });
        const scrollbarRect = new fabric.Rect({
          width: 6,
          height: offsetHeight / scrollHeight * offsetHeight,
          left: wrapperW - 40 - 6 - 0.5,
          top: (offsetHeight - (offsetHeight / scrollHeight * offsetHeight)) * (scrollPosition / (scrollHeight - offsetHeight)) + 40 - 0.5,
          fill: "#e0e2e2",
          rx: 4,
          ry: 4
        });
        let groupArr = [clonedRect, svgImg];
        if (isHasScrollBar) {
          groupArr = [clonedRect, svgImg, scrollbarRect];
        }
        this.svgGroup = new fabric.Group(groupArr, {
          top: this.netdiskNewBox.top,
          left: this.netdiskNewBox.left,
          type: 'svgGroup'
        });
        this.svgGroup.on("scaling", () => {
          this.changeEditDom(this.svgGroup);
          this.netdiskNewBox.set({
            scaleX: this.svgGroup.scaleX,
            scaleY: this.svgGroup.scaleY,
          });
        });
        this.svgGroup.on("moving", () => {
          this.changeEditDom(this.svgGroup);
          this.netdiskNewBox.set({
            left: this.svgGroup.left,
            top: this.svgGroup.top,
          });
        });
        this.svgGroup.on("mousedown", () => {
          canvas.discardActiveObject();
        });
        this.svgGroup.on("mousemove", () => {
          canvas.discardActiveObject();
        });
        this.svgGroup.on("mouseup", () => {
          if (this?.svgGroup) {
            canvas.remove(this.svgGroup);
            this.svgGroup = null;
          }
          if (this?.editDom) {
            this.editDom.style.display = "flex";
          }
          if (this?.netdiskNewBox) {
            this.netdiskNewBox.visible = true;
            canvas.setActiveObject(this.netdiskNewBox);
          }
        });
        this.svgGroup.on('dragover', (e) => {
          e.e.preventDefault()
        })
        this.svgGroup.on('drop', (e) => {
          e.e.preventDefault()
          var fileList = e.e.dataTransfer.files;
          if (this?.svgGroup) {
            canvas.remove(this.svgGroup);
            this.svgGroup = null;
          }
          if (this?.editDom) {
            this.editDom.style.display = "flex";
          }
          if (this?.netdiskNewBox) {
            this.netdiskNewBox.visible = true;
            canvas.setActiveObject(this.netdiskNewBox);
          }
          for (var i = 0; i < fileList.length; i++) {
            this.handleFile(fileList[i]);
          }
        })
        canvas.add(this.svgGroup);
        canvas.renderAll();
        setTimeout((() => {
          this.curLock = false
        }).bind(this), 2000)
      };
    }
  }
  changeCom() {
    let saveAddGroupInfo = {
      top: this.addGroup.top,
      left: this.addGroup.left,
      width: this.addGroup.width,
      height: this.addGroup.height,
    };
    this.addGroup.visible = false;
    this.netdiskNewBox = new fabric.Rect({
      ...saveAddGroupInfo,
      ...{
        fill: "#fff",
        rx: 8,
        ry: 8,
        stroke: "#b2b2b2",
        strokeWidth: 2,
        type: "newNetdisk",
        newNetdisk: this,
      },
    });
    canvas.add(this.netdiskNewBox);
    this.netdiskNewBox.on("moving", () => {
      this.changeEditDom();
    });
    this.netdiskNewBox.on("scaling", () => {
      this.changeEditDom();
    });
    this.netdiskNewBox.on("removed", () => {
      if (this.editDom) {
        this.editDom.remove();
      }
    });
    this.createEditDom();
    canvas.on("selection:updated", () => {
      const activeObject = canvas.getActiveObject();
      const isNewBox = activeObject === this?.netdiskNewBox;
      if (!isNewBox) {
        if (this?.netdiskNewBox?.visible) {
          this.handleEditDom();
        }
      }
    });
    canvas.on("selection:created", () => {
      const activeObject = canvas.getActiveObject();
      const isNewBox = activeObject === this?.netdiskNewBox;
      if (!isNewBox) {
        if (this?.netdiskNewBox?.visible) {
          this.handleEditDom();
        }
      }
    });
    canvas.on("selection:cleared", (e) => {
      if (!this?.netdiskNewBox?.visible || !this?.netdiskNewBox) return;
      this.handleEditDom();
    });
    canvas.setActiveObject(this.netdiskNewBox);
    canvas.renderAll();
  }
  changeEditDom(dom = this.netdiskNewBox) {
    let width = dom.width * dom.scaleX - 80;
    let height = dom.height * dom.scaleY - 80;
    let left = dom.left + 40;
    let top = dom.top + 40;
    if (dom?.type === 'svgGroup') {
      width -= 2;
      height -= 2;
    }
    if (this?.editDom) {
      this.editDom.style.width = `${width}px`;
      this.editDom.style.height = `${height}px`;
      this.editDom.style.left = `${left}px`;
      this.editDom.style.top = `${top}px`;
    }
  }
  createEditDom() {
    let html = `<div class="netdisk__el"></div>`;
    this.editDom = html_to_element(html);
    this.editDom.style.width = `${this.netdiskNewBox.width - 80}px`;
    this.editDom.style.height = `${this.netdiskNewBox.height - 80}px`;
    this.editDom.style.left = `${this.netdiskNewBox.left + 40}px`;
    this.editDom.style.top = `${this.netdiskNewBox.top + 40}px`;
    qs(document, ".container").appendChild(this.editDom);
    this.editDom.ondragover = (e) => {
      e.preventDefault();
    };
    this.editDom.ondrop = (e) => {
      e.preventDefault();
      var fileList = e.dataTransfer.files;
      for (var i = 0; i < fileList.length; i++) {
        this.handleFile(fileList[i]);
      }
    };
    this.editDom.onpointerdown = (event) => {
      const initialX = event.clientX;
      const initialY = event.clientY;
      let left = this.netdiskNewBox.left,
        top = this.netdiskNewBox.top;
      canvas.setActiveObject(this.netdiskNewBox);
      canvas.renderAll();
      const handlePointerMove = (event) => {
        const deltaX = event.clientX - initialX;
        const deltaY = event.clientY - initialY;
        this.netdiskNewBox.set({
          left: left + deltaX,
          top: top + deltaY,
        });
        this.changeEditDom();
        canvas.renderAll();
      };
      const handlePointerUp = () => {
        this.editDom.onpointermove = null;
        this.editDom.onpointerup = null;
      };
      this.editDom.onpointermove = handlePointerMove;
      this.editDom.onpointerup = handlePointerUp;
    };
  }
  async openFile() {
    try {
      const options = {
        multiple: true,
        types: [
          {
            description: "Image Files",
            accept: {
              "image/*": [".png", ".jpg", ".jpeg"],
            },
          },
        ],
      };
      const handles = await window.showOpenFilePicker(options);
      for (const handle of handles) {
        const file = await handle.getFile();
        this.handleFile(file);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }
}
