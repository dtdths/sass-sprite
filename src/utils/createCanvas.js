const createCanvas = (width, height) => {
  let canvas = window.document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};
export default createCanvas;