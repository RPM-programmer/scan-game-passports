const fs = require("fs");
const path = require("path");
const { scanGamePassportA7 } = require("./index");

async function runDirectTest() {
  // В файле test.js измените название на ваше актуальное расширение:
  const imagePath = path.join(__dirname, "passport.jpeg");

  console.log("=== Старт локального теста модуля scan-game-passports ===");
  console.log(`Загрузка файла: ${imagePath}`);

  if (!fs.existsSync(imagePath)) {
    console.error(
      `Ошибка: Положите тестовое фото 'passport.jpg' в папку со скриптом!`,
    );
    return;
  }

  // Читаем файл напрямую в бинарный буфер
  const fileBuffer = fs.readFileSync(imagePath);

  console.log("Файл успешно прочитан в память. Запуск распознавания...");
  console.time("Время работы OCR");

  // Внутри файла test.js замените вызов функции на этот:
  const result = await scanGamePassportA7(fileBuffer, { lang: "eng" });

  console.timeEnd("Время работы OCR");
  console.log("\n=== РЕЗУЛЬТАТ ОТВЕТА МОДУЛЯ ===");
  console.log(JSON.stringify(result, null, 2));
}

// Запускаем тест
runDirectTest();
