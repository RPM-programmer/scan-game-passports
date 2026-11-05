const cvModule = require("@techstark/opencv-js");

async function getOpenCV() {
  if (cvModule instanceof Promise) return await cvModule;
  if (cvModule.Mat) return cvModule;
  return new Promise((resolve) => {
    cvModule.onRuntimeInitialized = () => resolve(cvModule);
  });
}

async function processAndCropSheet(rawImageData) {
  const cv = await getOpenCV();

  let src = cv.matFromImageData({
    data: new Uint8ClampedArray(rawImageData.data),
    width: rawImageData.width,
    height: rawImageData.height,
  });

  let hsv = new cv.Mat();
  let mask = new cv.Mat();
  let anchorContours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

  let lowColor = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 0]);
  let highColor = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 65, 0]);

  cv.inRange(hsv, lowColor, highColor, mask);
  cv.findContours(
    mask,
    anchorContours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE,
  );

  let foundPoints = [];

  for (let i = 0; i < anchorContours.size(); ++i) {
    let cnt = anchorContours.get(i);
    let rect = cv.boundingRect(cnt);
    let aspectRatio = rect.width / rect.height;

    if (
      rect.width >= 2 &&
      rect.width <= 35 &&
      aspectRatio >= 0.4 &&
      aspectRatio <= 2.2
    ) {
      let moments = cv.moments(cnt, false);
      if (moments.m00 !== 0) {
        foundPoints.push({
          x: Math.round(moments.m10 / moments.m00),
          y: Math.round(moments.m01 / moments.m00),
        });
      }
    }
  }

  foundPoints.sort((a, b) => a.y - b.y);

  let lineBuffers = [];
  foundPoints.forEach((point) => {
    let startY = Math.max(0, point.y - 20);
    let startX = Math.max(0, point.x - 450);
    let width = Math.min(440, src.cols - startX);
    let height = Math.min(40, src.rows - startY);

    if (width > 50 && height > 10) {
      let rectRoi = new cv.Rect(startX, startY, width, height);
      let lineRoi = src.roi(rectRoi);

      let lineData = new Uint8Array(lineRoi.cols * lineRoi.rows * 4);
      let matData = lineRoi.data;
      for (let i = 0; i < matData.length; i++) lineData[i] = matData[i];

      lineBuffers.push({
        data: Buffer.from(lineData),
        width: lineRoi.cols,
        height: lineRoi.rows,
      });
      lineRoi.delete();
    }
  });

  src.delete();
  hsv.delete();
  mask.delete();
  anchorContours.delete();
  hierarchy.delete();
  lowColor.delete();
  highColor.delete();

  return { foundPoints, lineBuffers };
}

module.exports = { processAndCropSheet };
