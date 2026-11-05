const { formatDynamicLine } = require("./search");

function buildDynamicJson(rawLinesArray) {
  const outputResult = [];

  rawLinesArray.forEach((rawText) => {
    const formatted = formatDynamicLine(rawText);
    if (formatted) {
      outputResult.push(formatted);
    }
  });

  return {
    total_fields_found: outputResult.length,
    extracted_rows: outputResult,
  };
}

module.exports = { buildDynamicJson };
