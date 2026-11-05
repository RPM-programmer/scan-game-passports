const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const path = require("path");
const { processAndCropSheet } = require("./format");
const { buildDynamicJson } = require("./get");

async function scanGamePassportA7(imageBuffer, options = { lang: "rus+eng" }) {
  try {
    const tesseractLang = options.lang || "rus+eng";

    const imageInfo = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rawImageData = {
      data: imageInfo.data,
      width: imageInfo.info.width,
      height: imageInfo.info.height,
    };

    const { foundPoints, lineBuffers } =
      await processAndCropSheet(rawImageData);

    if (lineBuffers.length === 0) {
      return {
        success: false,
        error:
          "Маркеры-точки не обнаружены. Не удалось локализовать строки бланка.",
      };
    }

    const recognizedTextLines = [];

    // Полностью автономный запуск: указываем путь к нашей локальной папке ./tessdata
    const worker = await Tesseract.createWorker(tesseractLang, 1, {
      langPath: path.join(__dirname, "tessdata"),
      cacheMethod: "none", // Отключаем кэширование в системные папки, работаем строго по месту
    });

    for (let i = 0; i < lineBuffers.length; i++) {
      const lineBuf = lineBuffers[i];

      const lineJpeg = await sharp(lineBuf.data, {
        raw: { width: lineBuf.width, height: lineBuf.height, channels: 4 },
      })
        .jpeg()
        .toBuffer();

      const ocrLineResult = await worker.recognize(lineJpeg, {
        tessedit_pageseg_mode: "7",
      });

      recognizedTextLines.push(ocrLineResult.data.text.trim());
    }

    await worker.terminate();

    const finalJsonData = buildDynamicJson(recognizedTextLines);

    return {
      success: true,
      detected_points_count: foundPoints.length,
      payload: finalJsonData,
    };
  } catch (error) {
    return {
      success: false,
      error: "Ошибка универсального сканирования: " + error.message,
    };
  }
}

module.exports = { scanGamePassportA7 };
