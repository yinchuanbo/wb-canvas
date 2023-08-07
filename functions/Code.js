$id("code").onclick = () => {
  new Code();
};
class Code {
  constructor() {
    this.width = 400;
    this.height = 112;
    this.bgColor = "#282a36";
    this.init();
  }
  init() {
    this.createCodeBlock();
  }
  createCodeBlock() {
    this.codeBg = new fabric.Rect({
      width: this.width,
      height: this.height,
      fill: this.bgColor,
      rx: 8,
      ry: 8,
      type: "code",
      codeBg: this,
    });
    canvas.add(this.codeBg);
    canvas.centerObject(this.codeBg);
    canvas.renderAll();
    this.setCodeEl();
    this.codeBg.on("scaling", () => {
      if (!this.backgroundTop) {
        this.backgroundTop = this.codeBg.top;
      }
      if (this?.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      // var codeHeight = qs(this.codeDom, ".CodeMirror").offsetHeight;
      this.codeBg.set({
        scaleY: 1,
        top: this.backgroundTop,
        // height: codeHeight
      });
      this.setCodeDomStyles();
      this.timer = setTimeout(
        (() => {
          this.backgroundTop = null;
        }).bind(this),
        1000
      );
    });
    this.codeBg.on("removed", () => {
      this.codeDom?.remove?.();
      if (this?.svgGroup) {
        canvas.remove(this.svgGroup);
        this.svgGroup = null;
      }
    });
    canvas.on("selection:updated", () => {
      const activeObject = canvas.getActiveObject();
      const isCodeBg = activeObject === this?.codeBg;
      if (!isCodeBg) {
        this.setCloneCodeBg();
      }
    });
    canvas.on("selection:cleared", () => {
      if (!this?.codeBg?.visible || !this?.codeBg || this?.svgGroup) return;
      this.setCloneCodeBg();
    });
  }
  async setCloneCodeBg() {
    var lineCount = this.editor.lineCount();
    var allStr = "";
    for (var line = 0; line < lineCount; line++) {
      var tokens = this.editor.getLineTokens(line);
      var lineStr = "";
      for (var i = 0; i < tokens.length; i++) {
        var { string, type } = tokens[i];
        if (type) {
          lineStr += `<span class="${type}">${string}</span>`;
        } else {
          lineStr += `${string}`;
        }
      }
      allStr += `<div><b>${line + 1}</b>${lineStr}</div>`;
    }
    this.createTempAllDom(allStr);
  }
  createTempAllDom(allStr) {
    const { width, height, left, top } = this.codeBg;
    let html = `<div class="codeEl__temp" style="width: ${width}px; height: ${height}px" xmlns="http://www.w3.org/1999/xhtml">
      ${allStr}
    </div>`;
    this.genSvg(html, width, height, left, top);
  }
  genSvg(html, width, height, left, top) {
    const data = `<svg xmlns='http://www.w3.org/2000/svg' width="${width}" height="${height}">
        <style>
          .codeEl__temp {
            font-family: Roboto;
            font-size: 14px;
            padding-left: 51px;
            padding-top: 25px;
            box-sizing: border-box;
            background-color: #282a36;
            border-radius: 8px;
            color: #fff
          }
          .codeEl__temp > div {
            line-height: 18px;
            min-height: 18px;
            padding-right: 10px;
            box-sizing: border-box;
            word-wrap: break-word;
            white-space: pre-wrap;
            word-break: normal;
            position: relative;
            font-weight: normal;
          }
          .codeEl__temp .keyword {
            color: #ff79c6;
          }
          .codeEl__temp .def {
            color: #50fa7b;
          }
          .codeEl__temp .comment {
            color: #6272a4;
          }
          .codeEl__temp .string, .codeEl__temp .string-2 {
            color: #f1fa8c;
          }
          .codeEl__temp .number {
            color: #bd93f9;
          }
          .codeEl__temp .variable {
            color: #50fa7b;
          }
          .codeEl__temp .variable-2 {
            color: white;
          }
          .codeEl__temp .operator {
            color: #ff79c6;
          }
          .codeEl__temp .atom {
            color: #bd93f9;
          }
          .codeEl__temp .meta {
            color: #f8f8f2;
          }
          .codeEl__temp .tag {
            color: #ff79c6;
          }
          .codeEl__temp .attribute, .codeEl__temp .qualifier, .codeEl__temp .builtin {
            color: #50fa7b;
          }
          .codeEl__temp .property {
            color: #66d9ef;
          }
          .codeEl__temp .variable-3, .codeEl__temp .type {
            color: #ffb86c;
          }
          .codeEl__temp > div > b {
            position: absolute;
            width: 43px;
            height: 17px;
            font-size: 14px;
            color: #6d8a88;
            left: -46px;
            line-height: 17px;
            text-align: center;
            font-weight: normal;
          }
        </style>
        <foreignObject width="${width}" height="${height}">
          ${html}
        </foreignObject>
      </svg>`;
    var url = `data:image/svg+xml;charset=utf-8,${data}`;
    url = url.replace(/\n/g, "").replace(/\t/g, "").replace(/#/g, "%23");
    const img = new Image();
    img.src = url;
    img.onload = () => {
      var clonedRect = fabric.util.object.clone(this.codeBg);
      clonedRect.set({
        top: 0,
        left: 0,
      });
      const svgImg = new fabric.Image(img, {
        width,
        height,
        top: 1,
        left: 1,
      });
      this.svgGroup = new fabric.Group([clonedRect, svgImg], {
        top,
        left,
        type: "code",
      });
      canvas.add(this.svgGroup);
      this.codeDom.style.display = "none";
      this.codeBg.visible = false;
      canvas.renderAll();
      this.svgGroup.on("mousedown", () => {
        canvas.discardActiveObject();
      });
      this.svgGroup.on("mousemove", () => {
        canvas.discardActiveObject();
      });
      this.svgGroup.on("mouseup", () => {
        this.codeBg.visible = true;
        this.codeBg.set({
          top: this.svgGroup.top,
          left: this.svgGroup.left,
        });
        canvas.setActiveObject(this.codeBg);
        this.codeDom.style.display = "unset";
        this.setCodeDomStyles();
        canvas.remove(this.svgGroup);
        this.svgGroup = null;
      });
      this.svgGroup.on("remove", () => {
        this.codeDom.remove();
        canvas.remove(this.codeBg);
        this.codeBg = null;
      });
    };
  }
  setCodeEl() {
    let domHtml = `
      <div class="code__el">
        <textarea name="code" id="code" class="codemirror language-js"></textarea>
      </div>
    `;
    this.codeDom = html_to_element(domHtml);
    qs(document, ".container").appendChild(this.codeDom);
    this.setCodeDomStyles();
    this.setCodeDomMoveEvent();
    this.initCodeMirror();
  }
  setCodeDomMoveEvent() {
    this.codeDom.onpointerdown = (event) => {
      var isFocused = this.editor.hasFocus();
      if (isFocused) return;
      const initialX = event.clientX;
      const initialY = event.clientY;
      const { left, top } = this.codeBg;
      canvas.setActiveObject(this.codeBg);
      canvas.renderAll();
      const handlePointerMove = (event) => {
        const deltaX = event.clientX - initialX;
        const deltaY = event.clientY - initialY;
        this.codeBg.set({
          left: left + deltaX,
          top: top + deltaY,
        });
        this.setCodeDomStyles();
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
  setCodeDomStyles() {
    let { width, height, scaleX, scaleY, top, left } = this.codeBg;
    if (this?.codeDom) {
      this.codeDom.style.width = `${width * scaleX - 1}px`;
      this.codeDom.style.height = `${height * scaleY - 1}px`;
      this.codeDom.style.left = `${left + 1}px`;
      this.codeDom.style.top = `${top + 1}px`;
    }
  }
  initCodeMirror() {
    const textareaDom = qs(this.codeDom, "textarea");
    this.editor = CodeMirror.fromTextArea(textareaDom, {
      mode: { name: "javascript", version: 3, singleLineStringErrors: false },
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      scrollbarStyle: null,
      lineWrapping: true,
      theme: "dracula",
    });
    this.editor.on(
      "change",
      function () {
        setTimeout((() => {
          this.setHeightByDomHeight();
        }).bind(this), 100)
      }.bind(this)
    );
    this.editor.refresh();
  }
  setHeightByDomHeight() {
    var codeHeight = qs(this.codeDom, ".CodeMirror").offsetHeight;
    this.codeBg.set({
      height: codeHeight > this.height ? codeHeight : this.height,
    });
    canvas.renderAll();
  }
}
