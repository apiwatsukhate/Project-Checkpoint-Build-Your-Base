(function () {
  const swatch = document.querySelector("#color-swatch");
  const colorNameEl = document.querySelector("#color-name");
  const statusBadge = document.querySelector("#color-status-badge");
  const historyContainer = document.querySelector("#color-history");
  const randomBtn = document.querySelector("#random-color-btn");
  const copyBtn = document.querySelector("#copy-color-btn");
  const applySkillBtn = document.querySelector("#apply-color-skill-btn");

  if (!swatch || !randomBtn) return;

  // รายการสีง่ายๆ (แก้ไขชื่อสีหรือรหัสสีได้ตามใจ)
  const SIMPLE_COLORS = [
    { name: "Red", hex: "#EF4444" },
    { name: "Orange", hex: "#F97316" },
    { name: "Yellow", hex: "#EAB308" },
    { name: "Green", hex: "#22C55E" },
    { name: "Cyan", hex: "#06B6D4" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Purple", hex: "#A855F7" },
    { name: "Pink", hex: "#EC4899" },
    { name: "Gray", hex: "#6B7280" },
    { name: "Black", hex: "#111827" }
  ];

  let currentColor = SIMPLE_COLORS[0];
  let recentColors = [];
  let statusTimer = null;

  function showStatus(text) {
    if (!statusBadge) return;
    statusBadge.textContent = text;
    statusBadge.style.display = "inline-block";
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      statusBadge.style.display = "none";
    }, 1600);
  }

  function renderHistory() {
    if (!historyContainer) return;
    historyContainer.innerHTML = "";

    recentColors.forEach((color) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.title = color.name;
      dot.style.width = "20px";
      dot.style.height = "20px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = color.hex;
      dot.style.border = color.name === currentColor.name
        ? "2px solid #111827"
        : "1px solid rgba(0,0,0,0.18)";
      dot.style.padding = "0";
      dot.style.cursor = "pointer";
      dot.style.transition = "transform 0.15s ease";

      dot.addEventListener("mouseenter", () => (dot.style.transform = "scale(1.18)"));
      dot.addEventListener("mouseleave", () => (dot.style.transform = "scale(1)"));
      dot.addEventListener("click", () => setColor(color, false));

      historyContainer.appendChild(dot);
    });
  }

  function getRandomSimpleColor() {
    if (SIMPLE_COLORS.length === 1) return SIMPLE_COLORS[0];

    let nextColor;
    do {
      const idx = Math.floor(Math.random() * SIMPLE_COLORS.length);
      nextColor = SIMPLE_COLORS[idx];
    } while (nextColor.name === currentColor.name);

    return nextColor;
  }

  function setColor(colorObj, recordHistory = true) {
    currentColor = colorObj;

    // เอฟเฟกต์เด้งเบาๆ ตอนเปลี่ยนสี
    swatch.style.transform = "scale(0.94)";
    setTimeout(() => {
      swatch.style.backgroundColor = colorObj.hex;
      swatch.style.transform = "scale(1)";
    }, 90);

    if (colorNameEl) {
      colorNameEl.textContent = colorObj.name;
    }

    if (recordHistory) {
      recentColors = [colorObj, ...recentColors.filter((c) => c.name !== colorObj.name)].slice(0, 5);
    }
    renderHistory();
  }

  randomBtn.addEventListener("click", function () {
    setColor(getRandomSimpleColor(), true);
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(currentColor.name);
        showStatus("คัดลอก " + currentColor.name + " แล้ว ✓");
      } catch {
        showStatus("สีปัจจุบัน: " + currentColor.name);
      }
    });
  }

  if (applySkillBtn) {
    applySkillBtn.addEventListener("click", function () {
      // เจาะจงเฉพาะช่อง skills ในฟอร์มของ Challenge / Booth เท่านั้น
      const boothSkillInput = document.querySelector('#booth-generator-form input[name="skills"]');
      if (!boothSkillInput) return;

      const tag = "Color " + currentColor.name;
      const current = boothSkillInput.value.trim();

      if (!current) {
        boothSkillInput.value = tag;
      } else if (!current.includes(tag)) {
        boothSkillInput.value = current + ", " + tag;
      }

      showStatus("เติม " + tag + " ลงช่อง Skills ของ Challenge แล้ว ✓");
    });
  }

  setColor(getRandomSimpleColor(), true);
})();