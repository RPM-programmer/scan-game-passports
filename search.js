function formatDynamicLine(rawLineText) {
  if (!rawLineText || rawLineText.trim().length === 0) return null;

  let cleanText = rawLineText.replace(/\s*[-—–:]\s*/g, " — ");

  let parts = cleanText.split("—");
  if (parts.length < 2) return cleanText.trim();

  let label = parts[0].trim();
  let value = parts.slice(1).join("—").trim();

  let digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length === 8) {
    if (digitsOnly.startsWith("19") || digitsOnly.startsWith("20")) {
      const yyyy = digitsOnly.substring(0, 4);
      const mm = digitsOnly.substring(4, 6);
      const dd = digitsOnly.substring(6, 8);
      value = `${dd}/${mm}/${yyyy}`;
    } else {
      const dd = digitsOnly.substring(0, 2);
      const mm = digitsOnly.substring(2, 4);
      const yyyy = digitsOnly.substring(4, 8);
      value = `${dd}/${mm}/${yyyy}`;
    }
  }

  return `${label} — ${value}`;
}

module.exports = { formatDynamicLine };
