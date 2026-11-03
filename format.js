const cv = require("@techstark/opencv-js");

/**
 * Поиск координат зеленой точки-якоря через HSV-фильтрацию
 * @param {Buffer} imageBuffer - Бинарные данные картинки
 */
function findGreenAnchorCoordinates(imageBuffer) {
  let src = cv.matFromImageData(imageBuffer);
  let hsv = new cv.Mat();
  let mask = new cv.Mat();
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

  // Границы зеленого цвета (в диапазоне HSV отсекаем кляксы синего штампа, красный цвет и чернила)
  let lowGreen = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [35, 50, 50, 0]);
  let highGreen = new cv.Mat(
    hsv.rows,
    hsv.cols,
    hsv.type(),
    [85, 255, 255, 255],
  );

  cv.inRange(hsv, lowGreen, highGreen, mask);
  cv.findContours(
    mask,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE,
  );

  let anchorPoint = null;

  for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    let rect = cv.boundingRect(cnt);
    let aspectRatio = rect.width / rect.height;

    // Поиск зеленого маркера диаметром от 12 до 40 пикселей близкой к кругу формы
    if (
      rect.width >= 12 &&
      rect.width <= 40 &&
      aspectRatio >= 0.7 &&
      aspectRatio <= 1.3
    ) {
      let moments = cv.moments(cnt, false);
      anchorPoint = {
        x: Math.round(moments.m10 / moments.m00),
        y: Math.round(moments.m01 / moments.m00),
      };
      break;
    }
  }

  // Освобождение памяти матриц OpenCV
  src.delete();
  hsv.delete();
  mask.delete();
  contours.delete();
  hierarchy.delete();
  lowGreen.delete();
  highGreen.delete();

  return anchorPoint;
}

module.exports = {
  findGreenAnchorCoordinates,
};
