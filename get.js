const { getLevenshteinDistance, parseAndFormatDate } = require("./search");

/**
 * Разбор текстового массива строк по полям БД
 * @param {string} rawTextFromOCR - Сырой текст от Tesseract
 */
function parseOcrTextToFields(rawTextFromOCR) {
  const lines = rawTextFromOCR
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const resultData = {
    name: null,
    surname: null,
    middleName: null,
    phone: null,
    gender: null,
    sid: null,
    uid: null,
    pid: null,
    wbDate: null,
    pdDate: null,
    edDate: null,
  };

  const fieldMap = {
    name: ["имя", "иня", "има"],
    surname: ["фамилия", "фанилия", "фам"],
    middleName: ["отчество", "отч"],
    phone: ["телефон", "тел", "тепефон"],
    gender: ["пол", "поп"],
    sid: ["sid", "сид", "s1d"],
    uid: ["uid", "уид", "u1d"],
    pid: ["pid", "пид", "p1d"],
    wbDate: ["др", "д.р.", "рождение"],
    pdDate: ["выдано", "рд"],
    edDate: ["окончание", "истекает", "конец", "ed"],
  };

  lines.forEach((line) => {
    const cleanLine = line.toLowerCase().replace(/\s*[-—–:]\s*/g, "—");
    const parts = cleanLine.split("—");

    if (parts.length >= 2) {
      const label = parts[0].trim();
      const value = parts.slice(1).join("—").trim();

      Object.keys(fieldMap).forEach((key) => {
        for (const target of fieldMap[key]) {
          // Разрешаем до 2 опечаток в названии поля штампа
          if (getLevenshteinDistance(label, target) <= 2) {
            if (["wbDate", "pdDate", "edDate"].includes(key)) {
              resultData[key] = parseAndFormatDate(value);
            } else if (["sid", "uid", "pid", "phone"].includes(key)) {
              resultData[key] = value.replace(/\D/g, ""); // Только цифры
            } else {
              resultData[key] = value.charAt(0).toUpperCase() + value.slice(1);
            }
            break;
          }
        }
      });
    }
  });

  return resultData;
}

module.exports = {
  parseOcrTextToFields,
};
