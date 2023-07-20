; (function () {
    const getCanvasSize = () => {
        const { innerWidth, innerHeight } = window;
        setCanvasSize(innerWidth, innerHeight);
    }
    const setCanvasSize = (width, height) => {
        myCanvas.width = width;
        myCanvas.height = height;
    }
    getCanvasSize()
})();

const $id = (selector = null) => {
    if (!selector) return;
    return document.getElementById(selector);
}

// 实例化 fabric 实例 
var canvas = new fabric.Canvas("myCanvas", {
    preserveObjectStacking: true
});