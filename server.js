const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { scanGamePassportA7 } = require("./index");

const router = express.Router();

router.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/scan-game", upload.single("passport_file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Файл изображения не передан." });
    }

    const ocrResult = await scanGamePassportA7(req.file.buffer, { lang: "en" });

    if (!ocrResult.success) {
      return res.status(400).json({ success: false, error: ocrResult.error });
    }

    res.json({
      success: true,
      detected_points_count: ocrResult.detected_points_count,
      payload: ocrResult.payload,
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

module.exports = router;
