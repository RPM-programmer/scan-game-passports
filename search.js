/**
 * Функция вычисления расстояния Левенштейна (поиск опечаток)
 */
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // замена
          Math.min(
            matrix[i][j - 1] + 1, // вставка
            matrix[i - 1][j] + 1,
          ), // удаление
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Умный очиститель дат (переводит ГГГГММДД или ДДММГГГГ в стандарт ДД.ММ.ГГГГ)
 */
function parseAndFormatDate(rawDateStr) {
  const digits = rawDateStr.replace(/\D/g, "");
  if (digits.length === 8) {
    if (digits.startsWith("19") || digits.startsWith("20")) {
      const yyyy = digits.substring(0, 4);
      const mm = digits.substring(4, 6);
      const dd = digits.substring(6, 8);
      return `${dd}.${mm}.${yyyy}`;
    } else {
      const dd = digits.substring(0, 2);
      const mm = digits.substring(2, 4);
      const yyyy = digits.substring(4, 8);
      return `${dd}.${mm}.${yyyy}`;
    }
  }
  return rawDateStr;
}

module.exports = {
  getLevenshteinDistance,
  parseAndFormatDate,
};
