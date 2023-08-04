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
    canvas.renderAll();
  }
  async createDomSvg() {

  }
  backToShow() {

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
        setTimeout((
          () => {
            var codeHeight = qs(this.codeDom, '.CodeMirror').offsetHeight
            this.background.set({ height: codeHeight > 112 ? codeHeight : 112 })
            canvas.renderAll()
          }
        ).bind(this), 200)
      }.bind(this)
    );
    this.editor.refresh();
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