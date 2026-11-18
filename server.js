const express = require("express");
const fs = require("fs");
const path = require("path");
const { validatePortfolio, validatePortfolioItem } = require("./validator");
const { validateExchangeItem } = require("./item-exchange-validator");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");

app.use(express.json());
// ให้บริการไฟล์ Frontend เฉพาะในโฟลเดอร์ public เท่านั้น (ป้องกันการเข้าถึง data/)
app.use(express.static(path.join(__dirname, "public")));

// ตรวจสอบและสร้างไฟล์ data/portfolio.json เริ่มต้นหากยังไม่มี
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    // โหลดข้อมูลตัวอย่างเริ่มต้นถ้ามี
    const sample1Path = path.join(DATA_DIR, "sample-portfolio-1.json");
    const sample2Path = path.join(DATA_DIR, "sample-portfolio-2.json");
    const initialData = [];
    if (fs.existsSync(sample1Path)) {
      initialData.push(JSON.parse(fs.readFileSync(sample1Path, "utf8")));
    }
    if (fs.existsSync(sample2Path)) {
      initialData.push(JSON.parse(fs.readFileSync(sample2Path, "utf8")));
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
  }
}

function readPortfolios() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw || "[]");
}

function writePortfolios(portfolios) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(portfolios, null, 2), "utf8");
}

// 1. ดึงข้อมูล Portfolio ทั้งหมด
app.get("/api/portfolios", (req, res) => {
  try {
    const portfolios = readPortfolios();
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ error: "Failed to read portfolios from server." });
  }
});

// 2. สร้าง Portfolio ใหม่
app.post("/api/portfolios", (req, res) => {
  const error = validatePortfolio(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const portfolios = readPortfolios();
  const newPortfolio = {
    id: "portfolio" + Date.now(),
    displayedName: (req.body.displayedName || req.body.name).trim(),
    whatIEnjoy: req.body.whatIEnjoy.trim(),
    whatIveTried: req.body.whatIveTried.trim(),
    whatImCuriousAbout: req.body.whatImCuriousAbout.trim(),
    items: [],
  };

  portfolios.push(newPortfolio);
  writePortfolios(portfolios);
  res.status(201).json(newPortfolio);
});

// 3. เพิ่ม Portfolio Item ปกติ
app.post("/api/portfolios/:id/items", (req, res) => {
  const portfolios = readPortfolios();
  const portfolio = portfolios.find((p) => p.id === req.params.id);
  if (!portfolio) {
    return res.status(404).json({ error: "Portfolio not found." });
  }

  const error = validatePortfolioItem(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const newItem = {
    id: "item" + Date.now(),
    title: req.body.title.trim(),
    type: req.body.type.trim(),
    date: req.body.date.trim(),
    role: req.body.role.trim(),
    description: req.body.description.trim(),
    skills: req.body.skills.map((s) => s.trim()).filter(Boolean),
    reflection: {
      whatIDid: req.body.reflection.whatIDid.trim(),
      whatILearned: req.body.reflection.whatILearned.trim(),
      challenge: req.body.reflection.challenge.trim(),
      nextStep: req.body.reflection.nextStep.trim(),
    },
    evidence: req.body.evidence.map((e) => e.trim()),
  };

  portfolio.items.push(newItem);
  writePortfolios(portfolios);
  res.status(201).json(newItem);
});

// 4. Import Portfolio Item จากบูธเพื่อน (Exchange)
app.post("/api/portfolios/:id/import-item", (req, res) => {
  const portfolios = readPortfolios();
  const portfolio = portfolios.find((p) => p.id === req.params.id);
  if (!portfolio) {
    return res.status(404).json({ error: "Target portfolio not found." });
  }

  const { valid, error, item } = validateExchangeItem(req.body);
  if (!valid) {
    return res.status(400).json({ error });
  }

  // ป้องกัน ID ซ้ำใน Portfolio เดียวกัน
  const isDuplicate = portfolio.items.some((existing) => existing.id === item.id);
  if (isDuplicate) {
    return res.status(409).json({
      error: `Duplicate Item ID (${item.id}): รายการนี้ถูกบันทึกใน Portfolio นี้แล้ว`,
    });
  }

  // คงโครงสร้างเดิมและเก็บ metadata เสริมของ Challenge ถ้ามี
  const importedItem = {
    id: item.id,
    title: item.title.trim(),
    type: item.type.trim(),
    date: item.date.trim(),
    role: item.role.trim(),
    description: item.description.trim(),
    skills: item.skills.map((s) => s.trim()).filter(Boolean),
    reflection: {
      whatIDid: item.reflection.whatIDid.trim(),
      whatILearned: item.reflection.whatILearned.trim(),
      challenge: item.reflection.challenge.trim(),
      nextStep: item.reflection.nextStep.trim(),
    },
    evidence: item.evidence.map((e) => e.trim()),
    ...(item.challengeId && { challengeId: item.challengeId }),
    ...(item.hostGroup && { hostGroup: item.hostGroup }),
    ...(item.category && { category: item.category }),
    ...(item.schemaVersion && { schemaVersion: item.schemaVersion }),
  };

  portfolio.items.push(importedItem);
  writePortfolios(portfolios);
  res.status(201).json(importedItem);
});

// 5. Export เฉพาะ Portfolio รายบุคคล (my-portfolio.json)
app.get("/api/portfolios/:id/export", (req, res) => {
  const portfolios = readPortfolios();
  const portfolio = portfolios.find((p) => p.id === req.params.id);
  if (!portfolio) {
    return res.status(404).json({ error: "Portfolio not found." });
  }
  res.setHeader("Content-Disposition", 'attachment; filename="my-portfolio.json"');
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(portfolio, null, 2));
});

app.listen(PORT, "localhost", () => {
  ensureDataFile();
  console.log(`Server is running on http://localhost:${PORT}`);
});