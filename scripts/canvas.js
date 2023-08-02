// 监听组件移动
canvas.on("object:moving", (e) => {
  if (e?.transform?.action === 'remove') {
    return;
  }
  if (!e?.target?.setCoords) return;
  e.target.setCoords();
  showToolBar();
});
// 监听滚轮缩放画布
canvas.on("mouse:wheel", (event) => {
  if (event.e.ctrlKey) {
    event.e.preventDefault()
    // const delta = event.e.deltaY;
    // let zoom = canvas.getZoom();
    // zoom *= 0.999 ** delta;
    // if (zoom > 10) zoom = 10;
    // if (zoom < 0.01) zoom = 0.01;
    // canvas.zoomToPoint({
    //   x: event.e.offsetX,
    //   y: event.e.offsetY
    // }, zoom);
    // event.e.preventDefault();
    // event.e.stopPropagation();
    // curScale.innerHTML = `${Math.round(canvas.getZoom() * 100)}%`;
    // showToolBar();
  }
});
// 创建选择框
canvas.on("selection:created", () => {
  showToolBar();
});
canvas.on("selection:updated", () => {
  showToolBar();
});
// 监听取消选中
canvas.on("selection:cleared", function () {
  $id("toolbar").style.display = "none";
  document.querySelector('.cropType__list').classList.remove('active');
});
// 取色笔
canvas.on('mouse:down', function (event) {
  document.querySelector('.cropType__list').classList.remove('active');
  document.querySelector('#link').classList.remove('active');
  if (event.button === 1 && isColorPickerMode) {
    var pointer = canvas.getPointer(event.e);
    var color = canvas.getContext('2d').getImageData(pointer.x, pointer.y, 1, 1).data;
    var rgbaColor = 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + (color[3] / 255).toFixed(2) + ')';
    $id('topbar').style.backgroundColor = rgbaColor;
  }
});
canvas.on('mouse:up', function () {
  canvas.isDrawingMode = false;
  canvas.defaultCursor = 'default';
  if (isColorPickerMode) {
    isColorPickerMode = false;
    canvas.selection = true;
    canvas.skipTargetFind = false;
  }
});