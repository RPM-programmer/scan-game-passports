const express = require("express");
const multer = require("multer");
// Подключаем точку входа нашего собранного модуля
const { scanGamePassportA7 } = require("./index");

const router = express.Router();

// Конфигурируем multer для работы с оперативной памятью (Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение на размер снимка — 10 МБ
});

// Эндпоинт сканирования игрового паспорта
router.post("/scan-game", upload.single("passport_file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Файл изображения не передан." });
    }

    // Запуск конвейера обработки документа
    const ocrResult = await scanGamePassportA7(req.file.buffer);

    if (!ocrResult.success) {
      return res.status(400).json({ success: false, error: ocrResult.error });
    }

    // Возвращаем отфильтрованный JSON в основное приложение CMS
    res.json({
      success: true,
      anchor: ocrResult.anchorFound,
      payload: ocrResult.data,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        error: "Ошибка обработки роута: " + err.message,
      });
  }
});

// Экспортируем только роутер по стандарту CommonJS
module.exports = router;
