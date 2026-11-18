const { validatePortfolioItem } = require("./validator");

function validateExchangeItem(rawJson) {
  let item;
  if (typeof rawJson === "string") {
    try {
      item = JSON.parse(rawJson);
    } catch (e) {
      return { valid: false, error: "รูปแบบ JSON ไม่ถูกต้อง (Invalid JSON syntax)" };
    }
  } else {
    item = rawJson;
  }

  const baseError = validatePortfolioItem(item);
  if (baseError) {
    return { valid: false, error: baseError };
  }

  if (!item.id || typeof item.id !== "string") {
    return { valid: false, error: "Item must have a valid string 'id'." };
  }

  return { valid: true, item };
}

module.exports = { validateExchangeItem };