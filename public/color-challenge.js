(function () {
  const swatch = document.querySelector("#color-swatch");
  const colorNameEl = document.querySelector("#color-name");
  const randomBtn = document.querySelector("#random-color-btn");
  const copyBtn = document.querySelector("#copy-color-btn");
  const applySkillBtn = document.querySelector("#apply-color-skill-btn");

  if (!swatch || !randomBtn) return;

  // แก้ไขชื่อสีและรหัสสีที่ต้องการสุ่มได้ที่นี่
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

  function getRandomSimpleColor() {
    if (SIMPLE_COLORS.length === 1) return SIMPLE_COLORS[0];

    let nextColor;
    do {
      const idx = Math.floor(Math.random() * SIMPLE_COLORS.length);
      nextColor = SIMPLE_COLORS[idx];
    } while (nextColor.name === currentColor.name);

    return nextColor;
  }

  function setColor(colorObj) {
    currentColor = colorObj;
    swatch.style.backgroundColor = colorObj.hex;
    if (colorNameEl) {
      colorNameEl.textContent = colorObj.name;
    }
  }

  randomBtn.addEventListener("click", function () {
    setColor(getRandomSimpleColor());
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(currentColor.name);
        alert("คัดลอกชื่อสี " + currentColor.name + " แล้ว!");
      } catch {
        alert("ชื่อสีคือ " + currentColor.name);
      }
    });
  }

  if (applySkillBtn) {
    applySkillBtn.addEventListener("click", function () {
      const skillInputs = document.querySelectorAll('input[name="skills"]');
      if (skillInputs.length === 0) return;

      const tag = "Color " + currentColor.name;
      skillInputs.forEach((input) => {
        const current = input.value.trim();
        if (!current) {
          input.value = tag;
        } else if (!current.includes(tag)) {
          input.value = current + ", " + tag;
        }
      });
    });
  }

  setColor(getRandomSimpleColor());
})();