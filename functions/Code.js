$id('code').onclick = () => {
  new Code()
}

class Code {
  constructor() {
    this.width = 400;
    this.height = 112;
    this.init();
  }
  init() {
    this.createCodeBlock()
  }
  createCodeBlock() {
    this.background = new fabric.Rect({
      width: this.width,
      height: this.height,
      fill: '#282a36',
      rx: 8,
      ry: 8,
      type: 'code'
    });
    canvas.add(this.background);
    canvas.centerObject(this.background);
    this.setCodeDom();
    this.background.on('scaling', () => {
      if (!this.backgroundTop) {
        this.backgroundTop = this.background.top;
      }
      if (this?.timer) {
        clearTimeout(this.timer)
        this.timer = null;
      }
      this.background.set({
        scaleY: 1,
        top: this.backgroundTop
      })
      this.changeCodeDom()
      this.timer = setTimeout((() => {
        this.backgroundTop = null;
      }).bind(this), 1000)
    })
    this.background.on('removed', () => {
      this.codeDom?.remove?.()
    })
    canvas.on("selection:updated", () => {
      const activeObject = canvas.getActiveObject();
      const isBackground = activeObject === this?.background;
      if (!isBackground) {
        this.getEditorValue()
      }
    });
    canvas.on("selection:cleared", () => {
      this.getEditorValue()
    });
    canvas.renderAll();
  }
  setCodeDom() {
    const { width, height, top, left, scaleX, scaleY } = this.background;
    const curW = scaleX * width;
    const curH = scaleY * height;
    let html = `
		  <div class="code__el" style="width: ${curW}px;height: ${curH}px;top: ${top}px;left: ${left}px;">
        <textarea name="code" id="code" class="codemirror language-js"></textarea>
      </div>`;
    this.codeDom = html_to_element(html);
    qs(document, ".container").appendChild(this.codeDom);
    this.setDomMove();
    this.initCodeMirror()
  }
  initCodeMirror() {
    this.editor = CodeMirror.fromTextArea(qs(this.codeDom, 'textarea'), {
      lineNumbers: true,
      matchBrackets: true,
      continueComments: "Enter",
      extraKeys: { "Ctrl-Q": "toggleComment" }
    });
    this.editor.setOption('mode', 'javascript');
    this.editor.setOption('theme', 'dracula');
    this.editor.on(
      'change',
      function (instance, obj) {
        // console.log('instance', instance);
        // console.log('obj', obj);
        var codeHeight = qs(this.codeDom, '.CodeMirror').offsetHeight
        this.background.set({ height: codeHeight > 112 ? codeHeight : 112 })
        canvas.renderAll()
      }.bind(this)
    );
    this.editor.refresh();
  }
  getEditorValue() {
    const curVal = this.editor.getValue();
    this.renderEditValueToCanvas(curVal)
  }
  getEveryChatColor() {
    const CodeMirrorLines = qsAll(this.codeDom, '.CodeMirror-line');
    const lineInfo = {};
    if (CodeMirrorLines?.length) {
      CodeMirrorLines.forEach((item, index) => {
        const firstSpan = qs(item, 'span');
        var json = Array.from(firstSpan.childNodes).map(function (node) {
          var element = {
            content: getNodeContent(node),
            class: node.className
          };
          return element;
        });
        // json 是某一行的所有数据
        lineInfo[index] = json;
      })
    }
    console.log('lineInfo', lineInfo)
    // var json = Array.from(tempDiv.childNodes).map(function(node) {
    //   var element = {
    //     content: getNodeContent(node),
    //     class: node.className
    //   };
    //   return element;
    // });



    // var lineCount = this.editor.lineCount();
    // for (var i = 0; i < lineCount; i++) {
    //   var lineText = this.editor.getLine(i);
    //   console.log("Line " + i + ": " + lineText);
    //   var lineLength = lineText.length;
    //   for (var j = 0; j < lineLength; j++) {
    //     var token = this.editor.getTokenAt({ line: i, ch: j });
    //     var color = token.className;
    //     console.log("Color of char " + j + ": " + color);
    //   }
    // }
  }
  renderEditValueToCanvas(val) {
    if (this?.codeTemp) return;
    const { width, height, scaleX, scaleY, top, left } = this.background;
    const lineCount = this.editor.lineCount();
    this.getEveryChatColor();
    const editorTemp = new fabric.Textbox(val, {
      top: 25,
      width: width * scaleX - 51,
      left: 51 + 4,
      fontSize: 14,
      fontFamily: 'Roboto',
      fill: 'white',
      backgroundColor: 'transparent',
      textAlign: 'left',
      originX: 'left',
      type: 'editorTemp',
      lineHeight: 20 / 14 / 1.13,
      noWrap: true
    });
    const newBg = new fabric.Rect({
      width, height, scaleX, scaleY,
      fill: '#282a36',
      rx: 8,
      ry: 8,
    });
    this.codeTemp = new fabric.Group([newBg, editorTemp], {
      top,
      left,
      type: 'code'
    })
    for (let i = 0; i < lineCount; i++) {
      let countText = new fabric.Text(`${i + 1}`, {
        left: this.codeTemp.left,
        top: this.codeTemp.top + 25 + 20 * i,
        fill: "#6d8a88",
        fontFamily: 'Roboto',
        fontSize: 14,
        lineHeight: 20 / 14 / 1.13
      });
      countText.set({
        left: this.codeTemp.left + (51 - countText.width) / 2
      })
      this.codeTemp.addWithUpdate(countText);
    }
    canvas.add(this.codeTemp);
    // 隐藏元素
    this.background.visible = false;
    this.codeDom.style.display = 'none';
    this.codeTemp.on("mousedown", () => {
      canvas.discardActiveObject();
    });
    this.codeTemp.on("mousemove", () => {
      canvas.discardActiveObject();
    });
    this.codeTemp.on('mouseup', () => {
      this.background.visible = true;
      this.background.set({
        top: this.codeTemp.top,
        left: this.codeTemp.left
      })
      canvas.setActiveObject(this.background)
      this.changeCodeDom()
      this.codeDom.style.display = 'block';
      canvas.remove(this.codeTemp)
      this.codeTemp = null
      this.editor.focus()
    })
    canvas.renderAll()
  }
  setDomMove() {
    this.codeDom.onpointerdown = (event) => {
      const initialX = event.clientX;
      const initialY = event.clientY;
      let left = this.background.left,
        top = this.background.top;
      canvas.setActiveObject(this.background);
      canvas.renderAll();
      const handlePointerMove = (event) => {
        const deltaX = event.clientX - initialX;
        const deltaY = event.clientY - initialY;
        this.background.set({
          left: left + deltaX,
          top: top + deltaY,
        });
        this.changeCodeDom();
        canvas.renderAll();
      };
      const handlePointerUp = () => {
        this.codeDom.onpointermove = null;
        this.codeDom.onpointerup = null;
      };
      this.codeDom.onpointermove = handlePointerMove;
      this.codeDom.onpointerup = handlePointerUp;
    };
  }
  changeCodeDom(dom = this.background) {
    let width = dom.width * dom.scaleX;
    let height = dom.height * dom.scaleY;
    let left = dom.left;
    let top = dom.top;
    if (this?.codeDom) {
      this.codeDom.style.width = `${width}px`;
      this.codeDom.style.height = `${height}px`;
      this.codeDom.style.left = `${left}px`;
      this.codeDom.style.top = `${top}px`;
    }
  }
}