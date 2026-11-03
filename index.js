const Tesseract = require("tesseract.js");
const { findGreenAnchorCoordinates } = require("./format");
const { parseOcrTextToFields } = require("./get");

/**
 * Основная функция сканирования игрового паспорта А7
 * @param {Buffer} imageBuffer - Загруженный файл фотографии
 */
async function scanGamePassportA7(imageBuffer) {
  try {
    // Шаг 1: Ищем зеленую точку-ориентир для проверки валидности бланка
    const anchor = findGreenAnchorCoordinates(imageBuffer);
    if (!anchor) {
      return {
        success: false,
        error:
          "Зеленый маркер-якорь не обнаружен. Убедитесь, что бланк попал в кадр нужной стороной.",
      };
    }

    // Шаг 2: Прогоняем буфер через локальный OCR движок
    const ocrResult = await Tesseract.recognize(imageBuffer, "rus+eng", {
      tessedit_pageseg_mode: "6", // Обработка страницы как единого блока строк текста
    });

    // Шаг 3: Собираем текст в структурированный JSON с обработкой опечаток штампа
    const structuredFields = parseOcrTextToFields(ocrResult.data.text);

    return {
      success: true,
      anchorFound: anchor,
      data: structuredFields,
    };
  } catch (error) {
    return {
      success: false,
      error:
        "Внутренняя ошибка обработки scan-game-passports: " + error.message,
    };
  }
}

module.exports = {
  scanGamePassportA7,
};
