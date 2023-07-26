$id('netdisk').onclick = () => {
  new Netdisk()
}

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
      type: "netdisk"
    });
    this.netdiskTitle = new fabric.Text('Untitled', {
      left: 0,
      top: 10,
      fill: '#464646',
      fontSize: 16,
      fontFamily: 'Arial',
    });
    this.netdiskLogo = new fabric.Image(qs(document, '#netdiskLogo'), {
      left: 0,
      top: 70,
    });
    this.netdiskDesc = new fabric.Text('Drag files here, or click the “Select Files”', {
      left: 0,
      top: 200,
      fill: '#9A9A9A',
      fontSize: 14,
      fontFamily: 'Arial',
    });
    const netdiskTitleLeft = (this.netdiskBox.width - this.netdiskTitle.width) / 2;
    const netdiskLogoLeft = (this.netdiskBox.width - this.netdiskLogo.width) / 2;
    const netdiskDescLeft = (this.netdiskBox.width - this.netdiskDesc.width) / 2;
    this.netdiskTitle.set({
      left: netdiskTitleLeft
    })
    this.netdiskLogo.set({
      left: netdiskLogoLeft
    })
    this.netdiskDesc.set({
      left: netdiskDescLeft
    })
    this.buttonBox = new fabric.Rect({
      width: 140,
      height: 40,
      fill: "#fff",
      rx: 20,
      ry: 20,
      stroke: "#464646",
      strokeWidth: 1
    });
    this.addIcon = new fabric.Image(qs(document, '#addIcon'), {
      top: 7,
      left: 10
    });
    this.buttonText = new fabric.Text('Select Files', {
      left: 40,
      top: 10,
      fill: '#464646',
      fontSize: 16,
      fontFamily: 'Arial',
    });
    this.buttonGroup = new fabric.Group([this.buttonBox, this.addIcon, this.buttonText], {
      top: 270,
      type: 'buttonGroup'
    });
    const buttonGroupleft = (this.netdiskBox.width - this.buttonGroup.width) / 2;
    this.buttonGroup.set({
      left: buttonGroupleft
    })
    this.addGroup = new fabric.Group([this.netdiskBox, this.netdiskTitle, this.netdiskLogo, this.netdiskDesc, this.buttonGroup], {
      type: 'netdiskGroup'
    })
    canvas.add(this.addGroup);
    canvas.centerObject(this.addGroup);
    this.addGroup.on('mousedown', (e) => {
      const curX = e.pointer.x - this.addGroup.left;
      const curY = e.pointer.y - this.addGroup.top;
      if (curX > 190 && curX < 327 && curY > 270 && curY < 309) {
        canvas.discardActiveObject()
        setTimeout(() => {
          _this.openFile();
        }, 200)
      }
    })
    canvas.renderAll()
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
        // 生成 dom
        let itemHtml = `<div class="netdisk__el_item">
          <div class="netdisk__item_img">
            <img src="${imgObj.src}" />
          </div>
          <div class="netdisk__item_name">${file.name}</div>
        </div>`;
        this.editDom.insertAdjacentHTML('beforeend', itemHtml)
      };
    }
    reader.readAsDataURL(file);
  }
  changeCom() {
    let saveAddGroupInfo = {
      top: this.addGroup.top,
      left: this.addGroup.left,
      width: this.addGroup.width,
      height: this.addGroup.height,
    }
    this.addGroup.visible = false;
    // 新建一个结构
    this.netdiskNewBox = new fabric.Rect({
      ...saveAddGroupInfo, ...{
        fill: "#fff",
        rx: 8,
        ry: 8,
        stroke: "#b2b2b2",
        strokeWidth: 2,
        type: "newNetdisk"
      }
    });
    canvas.add(this.netdiskNewBox);
    this.netdiskNewBox.on('moving', () => {
      this.changeEditDom()
    })
    this.netdiskNewBox.on('scaling', () => {
      this.changeEditDom()
    })
    // 创建 DOM
    this.createEditDom();
    canvas.renderAll();
  }
  changeEditDom() {
    if (this?.editDom) {
      this.editDom.style.width = `${this.netdiskNewBox.width * this.netdiskNewBox.scaleX - 80}px`;
      this.editDom.style.height = `${this.netdiskNewBox.height * this.netdiskNewBox.scaleY - 80}px`;
      this.editDom.style.left = `${this.netdiskNewBox.left + 40}px`;
      this.editDom.style.top = `${this.netdiskNewBox.top + 40}px`;
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
    // 监听元素拖入
    this.editDom.ondragover = (e) => {
      e.preventDefault();
    }
    this.editDom.ondrop = (e) => {
      e.preventDefault();
      var fileList = e.dataTransfer.files;
      for (var i = 0; i < fileList.length; i++) {
        this.handleFile(fileList[i])
      }
    }
    this.editDom.onpointerdown = (event) => {
      const initialX = event.clientX;
      const initialY = event.clientY;
      let left = this.netdiskNewBox.left, top = this.netdiskNewBox.top;
      canvas.setActiveObject(this.netdiskNewBox);
      canvas.renderAll();
      const handlePointerMove = (event) => {
        const deltaX = event.clientX - initialX;
        const deltaY = event.clientY - initialY;
        this.netdiskNewBox.set({
          left: left + deltaX,
          top: top + deltaY
        })
        this.changeEditDom()
        canvas.renderAll();
      }
      const handlePointerUp = () => {
        this.editDom.onpointermove = null;
        this.editDom.onpointerup = null;
      }
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
            description: 'Image Files',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg'],
            },
          },
        ],
      };
      const handles = await window.showOpenFilePicker(options);
      for (const handle of handles) {
        const file = await handle.getFile();
        this.handleFile(file)
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }
}