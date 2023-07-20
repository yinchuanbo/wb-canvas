let INIT_SCALE = '100%'

// FABRIC 基本配置
// canvas.centeredScaling = true;
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = "#1967d2";
fabric.Object.prototype.set({
    cornerSize: 10,
    borderColor: '#1967d2'
});

// canvas.selection = true;
// canvas.allowTouchScrolling = true;

// 设置初始比例
curScale.innerHTML = `${INIT_SCALE}`;