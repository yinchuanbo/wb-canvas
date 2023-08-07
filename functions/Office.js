$id('officeFile').onchange = (e) => {
  // 获取上传文件的类型
  var file = e.target.files[0];
  var type = file.type;
  var name = file.name;
  if (type.includes('/pdf')) {
    new Pdf({
      file,
      name
    });
  }
}

class Pdf {
  constructor(data) {
    this.file = data.file;
    this.name = data.name;
    this.pdfPageList = [];
    this.width = 485;
    this.height = 615;
    this.init();
  }
  init() {
    this.renderPDF()
  }
  renderPDF() {
    this.pdfBg = new fabric.Rect({
      width: this.width,
      height: this.height,
      fill: "#fcfcfc",
      shadow: {
        color: "rgba(0, 0, 0, 0.2)",
        offsetX: 0,
        offsetY: 3,
        blur: 6,
      },
      rx: 8,
      ry: 8,
      stroke: "#d1d1d1",
      strokeWidth: 1,
      type: 'pdf'
    });
    canvas.add(this.pdfBg);
    canvas.centerObject(this.pdfBg)
    canvas.renderAll()
    this.pdfBg.on('scaling', () => {
      this.setPdfDomStyle()
    })
    this.pdfBg.on('removed', () => {
      this.pdfDom.remove();
    })
    canvas.on("selection:updated", () => {
      const activeObject = canvas.getActiveObject();
      const isPdfBg = activeObject === this?.pdfBg;
      if (!isPdfBg) {
        this.setDomToCanvas();
      }
    });
    canvas.on("selection:cleared", () => {
      if (!this?.pdfBg?.visible || !this?.pdfBg) return;
      this.setDomToCanvas();
    });
    this.setPdfDom()
    this.parseAndUploadPDF(this.file)
  }
  setPdfDom() {
    let html = `
      <div class="pdf__el">
        <div class="pdf__title">
          <img src="data:image/svg+xml;base64,PHN2ZyBpZD0iaWNvbl9saW5rX3BkZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMzIgMzIiPgogIDxkZWZzPgogICAgPGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgiPgogICAgICA8cmVjdCBpZD0i55+p5b2iXzM1NTAiIGRhdGEtbmFtZT0i55+p5b2iIDM1NTAiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzM2IDU2MikiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzcwNzA3MCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjI0Ii8+CiAgICA8L2NsaXBQYXRoPgogIDwvZGVmcz4KICA8ZyBpZD0i6JKZ54mI57uEXzE0MiIgZGF0YS1uYW1lPSLokpnniYjnu4QgMTQyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNzM2IC01NjIpIiBjbGlwLXBhdGg9InVybCgjY2xpcC1wYXRoKSI+CiAgICA8Y2lyY2xlIGlkPSLmpK3lnIZfMTkwNiIgZGF0YS1uYW1lPSLmpK3lnIYgMTkwNiIgY3g9IjEyIiBjeT0iMTIiIHI9IjEyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3NDAgNTY2KSIgZmlsbD0iI2ViNWU1ZSIvPgogICAgPGcgaWQ9Iui3r+W+hF8yMjA3MSIgZGF0YS1uYW1lPSLot6/lvoQgMjIwNzEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDc0NS42NzIgNTY5LjE1NSkiIGZpbGw9Im5vbmUiPgogICAgICA8cGF0aCBkPSJNMTEuMTkyLDEyLjIxN0E0LjYwNyw0LjYwNywwLDAsMSw4LjUyLDExLjEzNGEyNS44NTcsMjUuODU3LDAsMCwwLTQuMywxLjM3MmMtMS4xMTksMS45ODYtMi4xNjYsMy0zLjA2OSwzYS45NC45NCwwLDAsMS0uNTQyLS4xNDRBMS4wNjQsMS4wNjQsMCwwLDEsMCwxNC4zODNjMC0uMzI1LjA3Mi0xLjIyNywzLjUtMi43MDhBMjUuNywyNS43LDAsMCwwLDUuNDE1LDcuMmMtLjQzMy0uODY2LTEuMzcyLTMtLjcyMi00LjA4YTEuMTQ5LDEuMTQ5LDAsMCwxLDEuMTE5LS41NzgsMS4yLDEuMiwwLDAsMSwuOTM5LjQ2OWMuNDY5LjY1LjQzMywyLjAyMi0uMTgxLDQuMDQzQTEwLjg4OSwxMC44ODksMCwwLDAsOC44MDksOS45NDJhMTIuMTg5LDEyLjE4OSwwLDAsMSwyLjI3NC0uMjUzYzEuNy4wMzYsMS45NS44MywxLjkxMywxLjMsMCwxLjIyNy0xLjE5MSwxLjIyNy0xLjgwNSwxLjIyN1pNMS4wODMsMTQuNDU1bC4xMDgtLjAzNmEyLjMyNSwyLjMyNSwwLDAsMCwxLjE5MS0xLjAxMSwyLjg1MywyLjg1MywwLDAsMC0xLjMsMS4wNDdabTQuOC0xMC44MzFINS43NzZhLjIxNy4yMTcsMCwwLDAtLjE0NC4wMzZBMi45NDksMi45NDksMCwwLDAsNS44NDksNS41YTMuMDM0LDMuMDM0LDAsMCwwLC4wMzYtMS44NzdabS4yNTMsNS4yMzVMNi4xLDguOTMyLDYuMDY1LDguOWMtLjMyNS44My0uNjg2LDEuNjYxLTEuMDgzLDIuNDU1bC4wNzItLjAzNnYuMDcyYTIxLjAyNCwyMS4wMjQsMCwwLDEsMi40NTUtLjcyMmwtLjAzNi0uMDM2aC4xMDhBMTEuMDYzLDExLjA2MywwLDAsMSw2LjEzNyw4Ljg1OVptNC45MSwxLjkxM2E0LjExNyw0LjExNywwLDAsMC0uOTM5LjA3MiwzLjAyNiwzLjAyNiwwLDAsMCwxLjA4My4yODksMS42LDEuNiwwLDAsMCwuNzIyLS4wNzJjMC0uMTA4LS4xNDQtLjI4OS0uODY2LS4yODlaIiBzdHJva2U9Im5vbmUiLz4KICAgICAgPHBhdGggZD0iTSAxLjE1NTI3NjE3OTMxMzY2IDE1LjUwMjIxMzQ3ODA4ODM4IEMgMC45NzQ3NTYxODEyNDAwODE4IDE1LjUwMjIxMzQ3ODA4ODM4IDAuNzU4MTQ2MTY2ODAxNDUyNiAxNS40NjYxMTQwNDQxODk0NSAwLjYxMzczNjE1MjY0ODkyNTggMTUuMzU3ODEzODM1MTQ0MDQgQyAwLjIxNjYxNjE1MzcxNzA0MSAxNS4xNzcyODMyODcwNDgzNCAtMy44NDU2NzIzODE0MzA2MzJlLTA2IDE0Ljc4MDE2Mzc2NDk1MzYxIC0zLjg0NTY3MjM4MTQzMDYzMmUtMDYgMTQuMzgzMDMzNzUyNDQxNDEgQyAtMy44NDU2NzIzODE0MzA2MzJlLTA2IDE0LjA1ODExNDA1MTgxODg1IDAuMDcyMjA2MTU0NDY1Njc1MzUgMTMuMTU1NTUzODE3NzQ5MDIgMy41MDE5MjYxODM3MDA1NjIgMTEuNjc1MzYzNTQwNjQ5NDEgQyA0LjI5NjE3NTk1NjcyNjA3NCAxMC4yMzEyNjQxMTQzNzk4OCA0LjkwOTkwNjM4NzMyOTEwMiA4Ljc1MTA3MzgzNzI4MDI3MyA1LjQxNTM1NjE1OTIxMDIwNSA3LjE5ODY3MzcyNTEyODE3NCBDIDQuOTgyMTI2MjM1OTYxOTE0IDYuMzMyMjIzODkyMjExOTE0IDQuMDQzNDY2MDkxMTU2MDA2IDQuMjAyMTgzNzIzNDQ5NzA3IDQuNjkzMzA1OTY5MjM4MjgxIDMuMTE5MTEzNjgzNzAwNTYyIEMgNC45MDk5MDU5MTA0OTE5NDMgMi43MjE5ODM2NzExODgzNTQgNS4zNDMxNDA2MDIxMTE4MTYgMi41MDUzNzQ0MzE2MTAxMDcgNS44MTI0NzYxNTgxNDIwOSAyLjU0MTQ3MzYyNzA5MDQ1NCBDIDYuMTczNTA2MjU5OTE4MjEzIDIuNTQxNDczNjI3MDkwNDU0IDYuNTM0NTI2MzQ4MTE0MDE0IDIuNzIxOTgzNjcxMTg4MzU0IDYuNzUxMTM2MzAyOTQ3OTk4IDMuMDEwODAzNjk5NDkzNDA4IEMgNy4yMjA0NzYxNTA1MTI2OTUgMy42NjA2NDM4MTU5OTQyNjMgNy4xODQzNjYyMjYxOTYyODkgNS4wMzI1MzM2NDU2Mjk4ODMgNi41NzA2MjYyNTg4NTAwOTggNy4wNTQyNjM1OTE3NjYzNTcgQyA3LjE0ODI2NjMxNTQ2MDIwNSA4LjEzNzMzMzg2OTkzNDA4MiA3LjkwNjQwNTkyNTc1MDczMiA5LjExMjA5MzkyNTQ3NjA3NCA4LjgwODk3NjE3MzQwMDg3OSA5Ljk0MjQ2Mzg3NDgxNjg5NSBDIDkuNTY3MTI2Mjc0MTA4ODg3IDkuNzk4MDUzNzQxNDU1MDc4IDEwLjMyNTI4NTkxMTU2MDA2IDkuNjg5NzQzOTk1NjY2NTA0IDExLjA4MzQyNjQ3NTUyNDkgOS42ODk3NDM5OTU2NjY1MDQgQyAxMi43ODAyMzYyNDQyMDE2NiA5LjcyNTg0MzQyOTU2NTQzIDEzLjAzMjk1NjEyMzM1MjA1IDEwLjUyMDA5MzkxNzg0NjY4IDEyLjk5Njg1NTczNTc3ODgxIDEwLjk4OTQyMzc1MTgzMTA1IEMgMTIuOTk2ODU1NzM1Nzc4ODEgMTIuMjE2OTAzNjg2NTIzNDQgMTEuODA1NDc2MTg4NjU5NjcgMTIuMjE2OTAzNjg2NTIzNDQgMTEuMTkxNzQ1NzU4MDU2NjQgMTIuMjE2OTAzNjg2NTIzNDQgTCAxMS4xOTE3MjU3MzA4OTYgMTIuMjE2OTAzNjg2NTIzNDQgQyAxMC4yMTY5NTYxMzg2MTA4NCAxMi4xNDQ2OTMzNzQ2MzM3OSA5LjI3ODI5NjQ3MDY0MjA5IDExLjc4MzY3MzI4NjQzNzk5IDguNTIwMTQ2MzY5OTM0MDgyIDExLjEzMzgzMzg4NTE5Mjg3IEMgNy4wMzk5NTYwOTI4MzQ0NzMgMTEuNDU4NzUzNTg1ODE1NDMgNS42MzE5NTYxMDA0NjM4NjcgMTEuOTI4MDgzNDE5Nzk5OCA0LjIyMzk3NjEzNTI1MzkwNiAxMi41MDU3MjM5NTMyNDcwNyBDIDMuMTA0Nzk2MTcxMTg4MzU0IDE0LjQ5MTM0MzQ5ODIyOTk4IDIuMDU3ODI2MDQyMTc1MjkzIDE1LjUwMjIxMzQ3ODA4ODM4IDEuMTU1Mjc2MTc5MzEzNjYgMTUuNTAyMjEzNDc4MDg4MzggWiBNIDIuMzgyNzU2MjMzMjE1MzMyIDEzLjQwODI3MzY5Njg5OTQxIEMgMS44NDEyMTYyMDY1NTA1OTggMTMuNjI0ODgzNjUxNzMzNCAxLjQwNzk4NjE2NDA5MzAxOCAxMy45ODU5MTMyNzY2NzIzNiAxLjA4MzA2NjEwNTg0MjU5IDE0LjQ1NTI0NDA2NDMzMTA1IEwgMS4xOTEzNzYyMDkyNTkwMzMgMTQuNDE5MTM0MTQwMDE0NjUgQyAxLjY5NjgwNjE5MjM5ODA3MSAxNC4yMzg2MjM2MTkwNzk1OSAyLjA5MzkzNjIwNDkxMDI3OCAxMy44Nzc2MDM1MzA4ODM3OSAyLjM4Mjc1NjIzMzIxNTMzMiAxMy40MDgyNzM2OTY4OTk0MSBaIE0gNS4wNTQzMjYwNTc0MzQwODIgMTEuMzE0MzMzOTE1NzEwNDUgTCA1LjA1NDMyNjA1NzQzNDA4MiAxMS4zODY1MzM3MzcxODI2MiBDIDUuODQ4NTc2MDY4ODc4MTc0IDExLjA5NzcyMzk2MDg3NjQ2IDYuNzE1MDI2Mzc4NjMxNTkyIDEwLjg0NTAwNDA4MTcyNjA3IDcuNTA5Mjc2MzkwMDc1Njg0IDEwLjY2NDQ5MzU2MDc5MTAyIEwgNy40NzMxNzYwMDI1MDI0NDEgMTAuNjI4MzgzNjM2NDc0NjEgTCA3LjU4MTQ4NjIyNTEyODE3NCAxMC42MjgzODM2MzY0NzQ2MSBDIDcuMDM5OTQ2MDc5MjU0MTUgMTAuMDg2ODUzOTgxMDE4MDcgNi41MzQ1MTYzMzQ1MzM2OTEgOS40NzMxMTQwMTM2NzE4NzUgNi4xMzczODYzMjIwMjE0ODQgOC44NTkzNzQwNDYzMjU2ODQgTCA2LjEzNzM5NjMzNTYwMTgwNyA4Ljg1OTM3NDA0NjMyNTY4NCBMIDYuMTM3Mzg2MzIyMDIxNDg0IDguODU5Mzc0MDQ2MzI1Njg0IEwgNi4xMDEyODU5MzQ0NDgyNDIgOC45MzE1ODM0MDQ1NDEwMTYgTCA2LjA2NTE4NjAyMzcxMjE1OCA4Ljg5NTQ4Mzk3MDY0MjA5IEMgNS43NDAyNjYzMjMwODk2IDkuNzI1ODMzODkyODIyMjY2IDUuMzc5MjQ2MjM0ODkzNzk5IDEwLjU1NjE4MzgxNTAwMjQ0IDQuOTgyMTE2MjIyMzgxNTkyIDExLjM1MDQzMzM0OTYwOTM4IEwgNS4wNTQzMjYwNTc0MzQwODIgMTEuMzE0MzMzOTE1NzEwNDUgWiBNIDExLjA0NzMwNjA2MDc5MTAyIDEwLjc3MjgwMzMwNjU3OTU5IEMgMTAuNzIyMzg2MzYwMTY4NDYgMTAuNzcyODAzMzA2NTc5NTkgMTAuNDMzNTY2MDkzNDQ0ODIgMTAuNzcyODAzMzA2NTc5NTkgMTAuMTA4NjQ2MzkyODIyMjcgMTAuODQ1MDEzNjE4NDY5MjQgQyAxMC40Njk2NjY0ODEwMTgwNyAxMS4wMjU1MjQxMzk0MDQzIDEwLjgzMDY4NjU2OTIxMzg3IDExLjA5NzcyMzk2MDg3NjQ2IDExLjE5MTcxNjE5NDE1MjgzIDExLjEzMzgzMzg4NTE5Mjg3IEMgMTEuNDQ0NDIzNjc1NTM3MTEgMTEuMTY5OTMxNDExNzQzMTYgMTEuNjk3MTQ2NDE1NzEwNDUgMTEuMTMzODMyOTMxNTE4NTUgMTEuOTEzNzU2MzcwNTQ0NDMgMTEuMDYxNjIzNTczMzAzMjIgQyAxMS45MTM3NTYzNzA1NDQ0MyAxMC45NTMzMjMzNjQyNTc4MSAxMS43NjkzNDYyMzcxODI2MiAxMC43NzI4MDMzMDY1Nzk1OSAxMS4wNDczMDYwNjA3OTEwMiAxMC43NzI4MDMzMDY1Nzk1OSBaIE0gNS43NzYzNjYyMzM4MjU2ODQgMy42MjQ1NDM2NjY4Mzk2IEMgNS43NDAyNjYzMjMwODk2IDMuNjI0NTQzNjY2ODM5NiA1LjY2ODA2NjAyNDc4MDI3MyAzLjYyNDU0MzY2NjgzOTYgNS42MzE5NTYxMDA0NjM4NjcgMy42NjA2NDM4MTU5OTQyNjMgQyA1LjQ4NzU1NTk4MDY4MjM3MyA0LjI3NDM4MzU0NDkyMTg3NSA1LjU5NTg1NjE4OTcyNzc4MyA0LjkyNDIzMzkxMzQyMTYzMSA1Ljg0ODU3NjA2ODg3ODE3NCA1LjUwMTg3MzQ5MzE5NDU4IEMgNi4wNjUxODYwMjM3MTIxNTggNC44ODgxMzM1MjU4NDgzODkgNi4wNjUxODYwMjM3MTIxNTggNC4yMzgyOTM2NDc3NjYxMTMgNS44ODQ2NzU5Nzk2MTQyNTggMy42MjQ1NTM2ODA0MTk5MjIgTCA1Ljg4NDY3NTk3OTYxNDI1OCAzLjYyNDU0MzY2NjgzOTYgTCA1Ljc3NjM2NjIzMzgyNTY4NCAzLjYyNDU0MzY2NjgzOTYgWiIgc3Ryb2tlPSJub25lIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4=" />
          <span>${this.name}<span>
        </div>
        <div class="pdf__main">
          <div class="main__content"></div>
          <div class="main__sidebar"></div>
        </div>
      </div>
    `;
    this.pdfDom = html_to_element(html);
    qs(document, ".container").appendChild(this.pdfDom);
    this.setPdfDomStyle();
    this.setPdfDomMoveEvent();
    this.changePdfPage();
  }
  setDomToCanvas() {
    const { width, height, top, left, scaleX, scaleY } = this.pdfBg;
    const curWidth = width * scaleX;
    const curHeight = height * scaleY;
    let cloneDom = this.pdfDom.cloneNode(true);
    cloneDom.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    cloneDom.style.top = 0;
    cloneDom.style.left = 0;
    let outerHTML = cloneDom.outerHTML;
    outerHTML = outerHTML.replace(
      /<img([^>]+)>/g,
      "<img$1/>"
    );
    const sidebar = qs(this.pdfDom, '.main__sidebar');
    const scrollPosition = parseFloat(sidebar.scrollTop) * scaleY;
    const scrollHeight = sidebar.scrollHeight * scaleY;
    const offsetHeight = sidebar.offsetHeight * scaleY;
    const isHasScrollBar = scrollHeight > offsetHeight;
    const data = `<svg xmlns='http://www.w3.org/2000/svg' width='${curWidth}' height='${curHeight}'>
    <style>
      .pdf__el {
        position: absolute;
        padding: 18px 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      .pdf__el .pdf__title {
        width: 100%;
        height: 37px;
        margin-bottom: 17px;
        display: flex;
        align-items: center;
        font-size: 14px;
        color: rgb(70, 70, 70);
      }
      .pdf__el .pdf__title img {
        margin-right: 5px;
        display: block;
        width: 32px;
        height: 32px;
      }
      .pdf__main {
        width: 100%;
        flex: 1;
        display: flex;
        max-height: 525px;
      }
      .pdf__main .main__content {
        width: 370px;
        height: 100%;
        margin-right: 10px;
        border: 2px solid #d1d1d1;
        background-color: #fff;
        box-sizing: border-box;
        text-align: center;
      }
      .pdf__main .main__sidebar {
        flex: 1;
        overflow-x: hidden;
        overflow-y: auto;
        padding-right: 2px;
      }
      .pdf__main .main__sidebar::-webkit-scrollbar {
        width: 6px;
      }
      .pdf__main .main__sidebar::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 4px;
      }
      .pdf__main .main__sidebar .main__sidebar_item {
        height: 105px;
        border: 2px solid #e0e2e2;
        box-sizing: border-box;
        background-color: #fff;
        text-align: center;
        position: relative;
        top: -${scrollPosition}px
      }
      .pdf__main .main__sidebar .main__sidebar_item.active {
        border-color: #2b7afc;
      }
      .pdf__main .main__sidebar .main__sidebar_item + .main__sidebar_item {
        margin-top: 10px;
      }
      .pdf__main .main__content img,
      .main__sidebar_item img {
        max-width: 100%;
        max-height: 100%;
        position: relative;
        user-select: none;
        -webkit-user-drag: none;
      }
    </style>
    <foreignObject width='${curWidth}' height='${curHeight}'>
      ${outerHTML}
    </foreignObject>
  </svg>`;
    var url = `data:image/svg+xml;charset=utf-8,${data}`;
    url = url.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23');
    const img = new Image();
    img.src = url;
    img.onload = () => {
      var clonedRect = fabric.util.object.clone(this.pdfBg);
      clonedRect.set({
        top: 0,
        left: 0,
      });
      const svgImg = new fabric.Image(img);
      const scrollbarRect = new fabric.Rect({
        width: 6,
        height: (offsetHeight / scrollHeight * offsetHeight),
        left: (10 + 370 + 10 + 77 + 2 - 0.2),
        top: (offsetHeight - (offsetHeight / scrollHeight * offsetHeight)) * (scrollPosition / (scrollHeight - offsetHeight)) + (37 + 17 + 18),
        fill: "#e0e2e2",
        rx: 4,
        ry: 4
      });
      let groupArr = [clonedRect, svgImg];
      if (isHasScrollBar) {
        groupArr = [clonedRect, svgImg, scrollbarRect];
      }
      this.svgGroup = new fabric.Group(groupArr, {
        top,
        left,
        type: 'pdf'
      })
      this.pdfDom.style.display = "none";
      this.pdfBg.visible = false;
      canvas.add(this.svgGroup);
      canvas.renderAll()
      this.svgGroup.on("mousedown", () => {
        canvas.discardActiveObject();
      });
      this.svgGroup.on("mousemove", () => {
        canvas.discardActiveObject();
      });
      this.svgGroup.on('mouseup', () => {
        this.pdfBg.visible = true;
        this.pdfBg.set({
          top: this.svgGroup.top,
          left: this.svgGroup.left,
        });
        canvas.setActiveObject(this.pdfBg);
        this.pdfDom.style.display = "flex";
        this.setPdfDomStyle();
        canvas.remove(this.svgGroup);
        this.svgGroup = null;
      })
    };
  }
  changePdfPage() {
    qs(this.pdfDom, '.main__sidebar').onclick = (e) => {
      const target = e.target;
      if (target.tagName === 'IMG') {
        const index = getIndex(target.parentNode);
        const mainSidebarItems = qsAll(this.pdfDom, '.main__sidebar_item');
        const mainContentImgs = qsAll(this.pdfDom, '.main__content img');
        mainSidebarItems.forEach((item) => {
          item.classList.remove('active')
        })
        target.parentNode.classList.add('active')
        mainContentImgs.forEach((item) => {
          item.style.display = 'none'
        })
        mainContentImgs[index].style.display = 'block'
      }
    }
  }
  setPdfDomStyle() {
    let { width, height, scaleX, scaleY, top, left } = this.pdfBg;
    if (this?.pdfDom) {
      this.pdfDom.style.width = `${width}px`;
      this.pdfDom.style.height = `${height}px`;
      this.pdfDom.style.transform = `scale(${scaleX, scaleY})`;
      this.pdfDom.style.transformOrigin = `left top`;
      this.pdfDom.style.left = `${left}px`;
      this.pdfDom.style.top = `${top}px`;
    }
  }
  setPdfDomMoveEvent() {
    this.pdfDom.onpointerdown = (event) => {
      const initialX = event.clientX;
      const initialY = event.clientY;
      const { left, top } = this.pdfBg;
      canvas.setActiveObject(this.pdfBg);
      canvas.renderAll();
      const handlePointerMove = (event) => {
        // this.setDomToCanvas();
        const deltaX = event.clientX - initialX;
        const deltaY = event.clientY - initialY;
        this.pdfBg.set({
          left: left + deltaX,
          top: top + deltaY,
        });
        this.setPdfDomStyle();
        canvas.renderAll();
      };
      const handlePointerUp = () => {
        this.pdfDom.onpointermove = null;
        this.pdfDom.onpointerup = null;
      };
      this.pdfDom.onpointermove = handlePointerMove;
      this.pdfDom.onpointerup = handlePointerUp;
    };
  }
  parseAndUploadPDF(file) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var pdfData = new Uint8Array(e.target.result);
      pdfjsLib.getDocument(pdfData).promise.then((pdf) => {
        var numPages = pdf.numPages;
        for (let i = 1; i <= numPages; i++) {
          const curI = i;
          pdf.getPage(i).then((page) => {
            var viewport = page.getViewport({ scale: 1 });
            var canvasEl = document.createElement('canvas');
            var context = canvasEl.getContext('2d');
            canvasEl.height = viewport.height;
            canvasEl.width = viewport.width;
            page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
              var imgData = canvasEl.toDataURL('image/png');
              const curImgHtml = `<img src="${imgData}" style="display: ${curI === 1 ? 'block' : 'none'} " data-index="${curI}"/>`;
              qs(this.pdfDom, '.main__content').insertAdjacentHTML('beforeend', curImgHtml);
              qs(this.pdfDom, '.main__sidebar').insertAdjacentHTML('beforeend', `
                <div class="main__sidebar_item ${curI === 1 ? 'active' : ''}">
                  <img src="${imgData}" data-index="${curI}"/>
                </div>
              `);
            });
          });
        }
      });
    };
    reader.readAsArrayBuffer(file);
  }
}