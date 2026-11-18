let pendingImportedItem = null;

// 1. ฝั่ง Host: สร้าง Portfolio Item JSON ให้เพื่อน Copy หรือ Download
document.querySelector("#booth-generator-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const data = new FormData(this);
  const today = new Date().toISOString().split("T")[0];

  const exchangeItem = {
    schemaVersion: "1.0",
    id: "item" + Date.now(),
    challengeId: data.get("challengeId").trim(),
    hostGroup: data.get("hostGroup").trim(),
    category: data.get("category"),
    title: data.get("title").trim(),
    type: "Challenge",
    date: today,
    role: data.get("role").trim(),
    description: data.get("description").trim(),
    skills: data
      .get("skills")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== ""),
    reflection: {
      whatIDid: "Completed the booth challenge activity.",
      whatILearned: "Learned new concepts through hands-on practice.",
      challenge: "Adapting to the time limit and requirements.",
      nextStep: "Apply this skill in future projects.",
    },
    evidence: [data.get("evidence").trim()],
  };

  document.querySelector("#generated-item-json").value = JSON.stringify(exchangeItem, null, 2);
});

// ปุ่ม Copy JSON
document.querySelector("#copy-json-btn").addEventListener("click", async function () {
  const textarea = document.querySelector("#generated-item-json");
  if (!textarea.value) {
    alert("กรุณากด Generate Item JSON ก่อน");
    return;
  }
  try {
    await navigator.clipboard.writeText(textarea.value);
    alert("Copied JSON to clipboard! ส่งให้เพื่อนนำไป Paste ได้เลย");
  } catch {
    textarea.select();
    document.execCommand("copy");
    alert("Copied JSON!");
  }
});

// ปุ่ม Download portfolio-item.json (สำหรับส่งไฟล์ให้เพื่อน)
document.querySelector("#download-item-json-btn").addEventListener("click", function () {
  const textarea = document.querySelector("#generated-item-json");
  if (!textarea.value) {
    alert("กรุณากด Generate Item JSON ก่อน");
    return;
  }
  const blob = new Blob([textarea.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "portfolio-item.json";
  a.click();
  URL.revokeObjectURL(url);
});

// ฟังก์ชันกลางสำหรับ Parse และแสดงฟอร์มตรวจสอบ Reflection
function loadAndPreviewJson(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    alert("รูปแบบ JSON ไม่ถูกต้อง (Invalid JSON): กรุณาตรวจสอบไฟล์หรือข้อความ JSON");
    return;
  }

  // รองรับกรณีเผลออัปโหลดไฟล์ Portfolio ทั้งชุดที่มี items array
  if (!parsed.id && Array.isArray(parsed.items) && parsed.items.length > 0) {
    alert("ตรวจพบไฟล์ Portfolio ทั้งชุด กรุณาใช้ไฟล์เฉพาะ Portfolio Item (.json)");
    return;
  }

  if (!parsed.id || !parsed.title || !parsed.reflection || !Array.isArray(parsed.evidence)) {
    alert("ข้อมูล JSON ขาดฟิลด์สำคัญ (ต้องมี id, title, reflection, และ evidence)");
    return;
  }

  pendingImportedItem = parsed;

  const form = document.querySelector("#import-confirm-form");
  const header = document.querySelector("#import-preview-header");

  header.innerHTML = `<strong>พร้อมนำเข้า:</strong> ${escapeHTML(parsed.title)} (ID: ${escapeHTML(parsed.id)})`;

  form.elements["whatIDid"].value = parsed.reflection.whatIDid || "";
  form.elements["whatILearned"].value = parsed.reflection.whatILearned || "";
  form.elements["challenge"].value = parsed.reflection.challenge || "";
  form.elements["nextStep"].value = parsed.reflection.nextStep || "";
  form.elements["evidence"].value = parsed.evidence[0] || "";

  form.style.display = "block";
}

// 2A. ฝั่ง Tester: อ่านไฟล์เมื่อเลือกไฟล์ .json
document.querySelector("#import-json-file").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    alert("กรุณาเลือกไฟล์นามสกุล .json เท่านั้น");
    this.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    document.querySelector("#import-json-input").value = content;
    loadAndPreviewJson(content.trim());
  };
  reader.onerror = function () {
    alert("ไม่สามารถอ่านไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
  };
  reader.readAsText(file, "UTF-8");
});

// 2B. ฝั่ง Tester: กดปุ่ม Load & Preview JSON จากช่อง Textarea
document.querySelector("#parse-json-btn").addEventListener("click", function () {
  const rawText = document.querySelector("#import-json-input").value.trim();
  if (!rawText) {
    alert("กรุณาเลือกไฟล์ .json หรือวางข้อความ JSON ในช่องก่อน");
    return;
  }
  loadAndPreviewJson(rawText);
});

// 3. ฝั่ง Tester: บันทึก Item ที่แก้ไข Reflection แล้วลง Server
document.querySelector("#import-confirm-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  if (!pendingImportedItem) return;

  const targetPortfolioId = this.elements["targetPortfolioId"].value;
  if (!targetPortfolioId) {
    alert("กรุณาเลือก Portfolio ปลายทางของคุณ");
    return;
  }

  const finalItem = {
    ...pendingImportedItem,
    reflection: {
      whatIDid: this.elements["whatIDid"].value.trim(),
      whatILearned: this.elements["whatILearned"].value.trim(),
      challenge: this.elements["challenge"].value.trim(),
      nextStep: this.elements["nextStep"].value.trim(),
    },
    evidence: [this.elements["evidence"].value.trim()],
  };

  try {
    const res = await fetch(`/api/portfolios/${targetPortfolioId}/import-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalItem),
    });

    const result = await res.json();
    if (!res.ok) {
      alert("Import ไม่สำเร็จ: " + result.error);
      return;
    }

    alert("นำเข้าและบันทึกข้อมูลลง Server เรียบร้อยแล้ว!");
    this.reset();
    this.style.display = "none";
    document.querySelector("#import-json-input").value = "";
    document.querySelector("#import-json-file").value = "";
    pendingImportedItem = null;

    await loadPortfolios();
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ Server");
  }
});