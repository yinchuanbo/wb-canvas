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
      codeBg: this
    });
    canvas.add(this.codeBg);
    canvas.centerObject(this.codeBg);
    canvas.renderAll();
    this.setCodeEl();
    this.codeBg.on("scaling", () => {
      this.setCodeDomStyles();
    });
    this.codeBg.on("removed", () => {
      this.codeDom?.remove?.();
      if (this?.svgGroup) {
        canvas.remove(this.svgGroup)
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
    var allStr = ''
    for (var line = 0; line < lineCount; line++) {
      var tokens = this.editor.getLineTokens(line);
      var lineStr = '';
      for (var i = 0; i < tokens.length; i++) {
        var { string, type } = tokens[i];
        if (type) {
          lineStr += `<span class="${type}">${string}</span>`;
        } else {
          lineStr += `${string}`
        }
      }
      allStr += `<p>${lineStr}</p>`
    }
    this.createTempDom(allStr)
  }
  createTempDom(str = '') {
    const { width, scaleX } = this.codeBg;
    const curW = scaleX * width - 51 - 10;
    var curH = qs(this.codeDom, ".CodeMirror").offsetHeight;
    curH = curH > 112 ? curH : 112;
    let html = `
    <div class="code__el_temp" xmlns="http://www.w3.org/1999/xhtml">
      ${str}
    </div>`;
    this.setCodeTempSvg(html, curW, curH)
  }
  setCodeTempSvg(html, curW, curH) {
    const { top, left } = this.codeBg;
    curH = curH - 50;
    const data = `<svg xmlns='http://www.w3.org/2000/svg' width="${curW}" height="${curH}">
        <style>
        .code__el_temp .keyword {
          color: #ff79c6;
        }
        .code__el_temp .def {
          color: #50fa7b;
        }
        .code__el_temp .comment {
          color: #6272a4;
        }
        .code__el_temp .string, .code__el_temp .string-2 {
          color: #f1fa8c;
        }
        .code__el_temp .number {
          color: #bd93f9;
        }
        .code__el_temp .variable {
          color: #50fa7b;
        }
        .code__el_temp .variable-2 {
          color: white;
        }
        .code__el_temp .operator {
          color: #ff79c6;
        }
        .code__el_temp .atom {
          color: #bd93f9;
        }
        .code__el_temp .meta {
          color: #f8f8f2;
        }
        .code__el_temp .tag {
          color: #ff79c6;
        }
        .code__el_temp .attribute, .code__el_temp .qualifier, .code__el_temp .builtin {
          color: #50fa7b;
        }
        .code__el_temp .property {
          color: #66d9ef;
        }
        .code__el_temp .variable-3, .code__el_temp .type {
          color: #ffb86c;
        }
        .code__el_temp p {
          line-height: 18px;
          font-size: 14px;
          font-family: Roboto;
          color: white;
          margin: 0;
          word-wrap: break-word;
          white-space: pre-wrap;
          word-break: normal;
        }
        </style>
        <foreignObject width="${curW}" height="${curH}">
          ${html}
        </foreignObject>
      </svg>`;
    var url = `data:image/svg+xml;charset=utf-8,${data}`;
    url = url.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23');
    const img = new Image();
    img.src = url;
    img.onload = () => {
      var clonedRect = fabric.util.object.clone(this.codeBg);
      clonedRect.set({
        top: 0,
        left: 0,
      })
      const svgImg = new fabric.Image(img, {
        width: curW,
        height: curH,
        top: 25 + 1,
        left: 51 + 1
      });
      this.svgGroup = new fabric.Group([clonedRect, svgImg], {
        top,
        left,
        type: 'code'
      })
      canvas.add(this.svgGroup);
      canvas.renderAll();
      this.svgGroup.on("mousedown", () => {
        canvas.discardActiveObject();
      });
      this.svgGroup.on("mousemove", () => {
        canvas.discardActiveObject();
      });
      this.svgGroup.on('mouseup', () => {
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
      })
      this.svgGroup.on('remove', () => {
        this.codeDom.remove();
        canvas.remove(this.codeBg)
        this.codeBg = null;
      })
      this.setLineNumber();
    }
  }
  setLineNumber() {
    const lineCount = this.editor.lineCount();
    const lineNumerDoms = qsAll(this.codeDom, '.CodeMirror-gutter-wrapper .CodeMirror-linenumber');
    for (let i = 0; i < lineCount; i++) {
      const curTop = lineNumerDoms[i].getBoundingClientRect()['top']
      let countText = new fabric.Text(`${i + 1}`, {
        top: curTop,
        fill: "#6d8a88",
        fontFamily: "Roboto",
        fontSize: 14,
        width: 43,
      });
      countText.set({
        left: this.svgGroup.left + (43 - countText.width) / 2 + 5 + 0.1,
      });
      this.svgGroup.addWithUpdate(countText);
      canvas.renderAll()
    }
    this.codeDom.style.display = "none";
    this.codeBg.visible = false;
    canvas.renderAll()
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
      mode: { name: 'javascript', version: 3, singleLineStringErrors: false },
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      scrollbarStyle: null,
      lineWrapping: true,
      theme: 'dracula',
    });
    this.editor.on(
      "change",
      function () {
        var codeHeight = qs(this.codeDom, ".CodeMirror").offsetHeight;
        this.codeBg.set({
          height: codeHeight > this.height ? codeHeight : this.height,
        });
        canvas.renderAll();
      }.bind(this)
    );
    this.editor.refresh();
  }
}
