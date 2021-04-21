const loadImage = (img_uri) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = img_uri;
  })
}
export default loadImage;