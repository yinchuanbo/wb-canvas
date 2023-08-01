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
      top: 10,
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
  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        if (!this?.netdiskNewBox) {
          this.changeCom();
        }
        let itemHtml = `<div class="netdisk__el_item">
          <div class="netdisk__item_img">
            <img src="${imgObj.src}" crossOrigin="anonymous" />
          </div>
          <div class="netdisk__item_name">${file.name}</div>
          <div class="netdisk__item_process">
            <div class="process__bar"></div>
          </div>
        </div>`;
        itemHtml = html_to_element(itemHtml);
        this.editDom.appendChild(itemHtml);
        const processDom = qs(itemHtml, ".netdisk__item_process");
        const processBar = qs(processDom, ".process__bar");
        incrementValue(1500, processDom, processBar);
      };
    };
    reader.readAsDataURL(file);
  }
  newGroupSelected() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject === this.newGroup) {
      this.netdiskNewBox.visible = true;
      if (this?.editDom) {
        this.editDom.style.display = "grid";
      }
      if (this?.newGroup) {
        canvas.remove(this.newGroup);
        this.newGroup = null;
      }
    }
  }
  async handleEditDom() {
    if (this?.editDom) {
      let cloneDom = this.editDom.cloneNode(true);
      cloneDom.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      let outerHTML = cloneDom.outerHTML;
      outerHTML = outerHTML.replace(
        /<img([^>]+)>/g,
        "<img$1/>"
      );
      const curWidth = this.netdiskNewBox.width * this.netdiskNewBox.scaleX + 3;
      const curHeight = this.netdiskNewBox.height * this.netdiskNewBox.scaleY;
      const classnameTemp = generateRandomString(32);
      var distop = this.editDom.scrollTop;
      const data = `<svg xmlns='http://www.w3.org/2000/svg' crossorigin='anonymous' width='${curWidth}' height='${curHeight}' class="${classnameTemp}" data-top="${distop}">
        <style>
          .netdisk__el {
            display: grid;
            grid-template-columns: repeat(4, 100px);
            grid-gap: 11px;
            overflow-x: hidden;
            overflow-y: auto;
            user-select: none;
            background: #fff
          }
          .netdisk__el::-webkit-scrollbar {
            width: 6px;
          }
          .netdisk__el::-webkit-scrollbar-thumb {
            background: #e0e2e2 0% 0% no-repeat padding-box;
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
          }
        </style>
        <foreignObject width='${curWidth}' height='${curHeight}'>
          ${outerHTML}
        </foreignObject>
      </svg>`;
      var url = `data:image/svg+xml;charset=utf-8,${data}`;
      url = url.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23');
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous')
      img.src = url;
      img.onload = () => {
        this.editDom.style.display = "none";
        this.netdiskNewBox.visible = false;
        const svgImg = new fabric.Image(img, {
          left: 40,
          top: 40,
          width: this.netdiskNewBox.width * this.netdiskNewBox.scaleX - 80,
          height: this.netdiskNewBox.height * this.netdiskNewBox.scaleY - 80,
          crossOrigin: 'anonymous'
        });
        const clonedRect = new fabric.Rect({
          width: this.netdiskNewBox.width * this.netdiskNewBox.scaleX,
          height: this.netdiskNewBox.height * this.netdiskNewBox.scaleY,
          left: 0,
          top: 0,
          fill: "#fff",
          rx: 8,
          ry: 8,
          stroke: "#b2b2b2",
          strokeWidth: 2,
          type: "netdisk",
          crossOrigin: 'anonymous'
        });
        this.svgGroup = new fabric.Group([clonedRect, svgImg], {
          top: this.netdiskNewBox.top,
          left: this.netdiskNewBox.left,
          crossOrigin: 'anonymous'
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
            this.editDom.style.display = "grid";
          }
          if (this?.netdiskNewBox) {
            this.netdiskNewBox.visible = true;
            canvas.setActiveObject(this.netdiskNewBox);
          }
        });
        canvas.add(this.svgGroup);
        // DOMURL.revokeObjectURL(url);
        canvas.renderAll();
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
    if (this?.editDom) {
      this.editDom.style.width = `${dom.width * dom.scaleX - 80}px`;
      this.editDom.style.height = `${dom.height * dom.scaleY - 80}px`;
      this.editDom.style.left = `${dom.left + 40}px`;
      this.editDom.style.top = `${dom.top + 40}px`;
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
      console.log("111-2");
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
