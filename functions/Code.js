$id("code").onclick = () => {
  new Code();
};

class Code {
  constructor() {
    this.width = 400;
    this.height = 112;
    this.init();
  }
  init() {
    this.createCodeBlock();
  }
  createCodeBlock() {
    this.background = new fabric.Rect({
      width: this.width,
      height: this.height,
      // fill: "#282a36",
      fill: 'transparent',
      rx: 8,
      ry: 8,
      type: "code",
    });
    canvas.add(this.background);
    canvas.centerObject(this.background);
    this.background.set({
      left: this.background.left,
      top: this.background.top
    })
    this.setCodeDom();
    this.background.on("scaling", () => {
      if (!this.backgroundTop) {
        this.backgroundTop = this.background.top;
      }
      if (this?.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.background.set({
        scaleY: 1,
        top: this.backgroundTop,
      });
      this.changeCodeDom();
      this.timer = setTimeout(
        (() => {
          this.backgroundTop = null;
        }).bind(this),
        1000
      );
    });
    this.background.on("removed", () => {
      this.codeDom?.remove?.();
      if (this?.codeTemp) {
        canvas.remove(this.codeTemp);
        this.codeTemp = null;
      }
    });
    canvas.on("selection:updated", () => {
      const activeObject = canvas.getActiveObject();
      const isBackground = activeObject === this?.background;
      if (!isBackground) {
        this.getEditorValue();
      }
    });
    canvas.on("selection:cleared", () => {
      if (!this?.background?.visible || !this?.background) return;
      this.getEditorValue();
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
    this.initCodeMirror();
  }
  initCodeMirror() {
    this.editor = CodeMirror.fromTextArea(qs(this.codeDom, "textarea"), {
      lineNumbers: true,
      matchBrackets: true,
      continueComments: "Enter",
      extraKeys: { "Ctrl-Q": "toggleComment" },
    });
    this.editor.setOption("mode", "javascript");
    this.editor.setOption("theme", "dracula");
    this.editor.on(
      "change",
      function () {
        var codeHeight = qs(this.codeDom, ".CodeMirror").offsetHeight;
        this.background.set({ height: codeHeight > this.height ? codeHeight : this.height });
        canvas.renderAll();
      }.bind(this)
    );
    this.editor.refresh();
  }
  getEditorValue() {
    const curVal = this.editor.getValue();
    this.renderEditValueToCanvas(curVal);
  }
  getEveryCharColor() {
    var lineCount = this.editor.lineCount();
    var data = {};
    for (var line = 0; line < lineCount; line++) {
      var lineDataArrs = [];
      var tokens = this.editor.getLineTokens(line);
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        const str = token.string;
        const tokenType = token.type;
        for (let j = 0; j < str.length; j++) {
          lineDataArrs.push({
            char: str[j],
            colorType: tokenType,
          });
        }
      }
      data[line] = this.handleLineData(lineDataArrs, line);
    }
    return data;
  }
  handleLineData(arr = []) {
    var output = {};
    for (var i = 0; i < arr.length; i++) {
      var obj = arr[i];
      var colorType = obj.colorType;
      switch (colorType) {
        case "keyword":
          colorType = "#ff79c6";
          break;
        case "def":
          colorType = "#50fa7b";
          break;
        case "comment":
          colorType = "#6272a4";
          break;
        case "string":
          colorType = "#f1fa8c";
          break;
        case "string-2":
          colorType = "#f1fa8c";
          break;
        case "number":
          colorType = "#bd93f9";
          break;
        case "variable":
          colorType = "#50fa7b";
          break;
        case "variable-2":
          colorType = "white";
          break;
        case "operator":
          colorType = "#ff79c6";
          break;
        case "atom":
          colorType = "#bd93f9";
          break;
        case "meta":
          colorType = "#f8f8f2";
          break;
        case "tag":
          colorType = "#ff79c6";
          break;
        case "attribute":
          colorType = "#50fa7b";
          break;
        case "qualifier":
          colorType = "#50fa7b";
          break;
        case "property":
          colorType = "#66d9ef";
          break;
        case "builtin":
          colorType = "#50fa7b";
          break;
        case "variable-3":
          colorType = "#ffb86c";
          break;
        case "type":
          colorType = "#ffb86c";
          break;
        default:
          colorType = "#fff";
          break;
      }
      output[i] = { fill: colorType };
    }
    return output;
  }
  renderEditValueToCanvas(val) {
    if (this?.codeTemp) return;
    let { width, height, scaleX, scaleY, top, left } = this.background;
    const lineCount = this.editor.lineCount();
    const charColors = this.getEveryCharColor();
    const editorTemp = new fabric.Textbox(val, {
      top: 25,
      width: width * scaleX - 51,
      left: 51,
      fontSize: 14,
      fontFamily: "Roboto",
      backgroundColor: "transparent",
      textAlign: "left",
      originX: "left",
      type: "editorTemp",
      lineHeight: 16 / 14,
      styles: charColors,
    });
    const newBg = new fabric.Rect({
      width,
      height,
      scaleX,
      scaleY,
      fill: "#282a36",
      rx: 8,
      ry: 8,
    });
    this.codeTemp = new fabric.Group([newBg, editorTemp], {
      top,
      left,
      // top: 200,
      // left: 200,
      type: "code",
    });
    for (let i = 0; i < lineCount; i++) {
      let countText = new fabric.Text(`${i + 1}`, {
        left: this.codeTemp.left,
        top: this.codeTemp.top + 25 + 18 * i,
        fill: "#6d8a88",
        fontFamily: "Roboto",
        fontSize: 14,
      });
      countText.set({
        left: this.codeTemp.left + (51 - countText.width) / 2 + 1,
      });
      this.codeTemp.addWithUpdate(countText);
    }
    canvas.add(this.codeTemp);
    this.background.visible = false;
    this.codeDom.style.display = "none";
    this.codeTemp.on("mousedown", () => {
      canvas.discardActiveObject();
    });
    this.codeTemp.on("mousemove", () => {
      canvas.discardActiveObject();
    });
    this.codeTemp.on("mouseup", () => {
      this.background.visible = true;
      this.background.set({
        top: this.codeTemp.top,
        left: this.codeTemp.left,
      });
      canvas.setActiveObject(this.background);
      this.changeCodeDom();
      this.codeDom.style.display = "block";
      canvas.remove(this.codeTemp);
      this.codeTemp = null;
      this.editor.focus();
    });
    canvas.renderAll();
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
