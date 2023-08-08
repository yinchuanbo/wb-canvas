window.addEventListener("resize", handleResize);
document.addEventListener("keydown", deleteComponent);
$id('exportImage').onclick = () => {
	canvas.discardActiveObject();
	setTimeout(() => {
		exportImageFun()
	}, 100)
};
$id('color').onclick = getColor;
$id('pencil').onclick = pencilFun;
$id('link').onclick = linkFun;