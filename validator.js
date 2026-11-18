function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function validatePortfolio(data) {
  if (!data || typeof data !== "object") return "Invalid portfolio payload.";
  const name = data.displayedName || data.name;
  if (!name || typeof name !== "string" || !name.trim()) {
    return "Displayed Name is required.";
  }
  if (!data.whatIEnjoy || typeof data.whatIEnjoy !== "string") {
    return "What I Enjoy is required.";
  }
  if (!data.whatIveTried || typeof data.whatIveTried !== "string") {
    return "What I've Tried is required.";
  }
  if (!data.whatImCuriousAbout || typeof data.whatImCuriousAbout !== "string") {
    return "What I'm Curious About is required.";
  }
  return null;
}

function validatePortfolioItem(item) {
  if (!item || typeof item !== "object") return "Invalid item payload.";

  const requiredStrings = ["title", "type", "date", "role", "description"];
  for (const field of requiredStrings) {
    if (!item[field] || typeof item[field] !== "string" || !item[field].trim()) {
      return `Field '${field}' is required and must be a non-empty string.`;
    }
  }

  if (!Array.isArray(item.skills) || item.skills.length === 0) {
    return "Field 'skills' must be a non-empty array of strings.";
  }

  if (!item.reflection || typeof item.reflection !== "object") {
    return "Field 'reflection' must be an object.";
  }

  const reflectionFields = ["whatIDid", "whatILearned", "challenge", "nextStep"];
  for (const rField of reflectionFields) {
    if (
      !item.reflection[rField] ||
      typeof item.reflection[rField] !== "string" ||
      !item.reflection[rField].trim()
    ) {
      return `Reflection field '${rField}' is required.`;
    }
  }

  if (!Array.isArray(item.evidence) || item.evidence.length === 0) {
    return "Field 'evidence' must be an array with at least one URL.";
  }

  for (const url of item.evidence) {
    if (typeof url !== "string" || !isValidHttpUrl(url)) {
      return `Invalid evidence URL: ${url}`;
    }
  }

  return null;
}

module.exports = {
  validatePortfolio,
  validatePortfolioItem,
  isValidHttpUrl,
};