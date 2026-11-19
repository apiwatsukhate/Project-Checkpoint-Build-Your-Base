(function () {
  const swatch = document.querySelector("#color-swatch");
  const randomBtn = document.querySelector("#random-color-btn");
  const copyBtn = document.querySelector("#copy-color-btn");
  const applySkillBtn = document.querySelector("#apply-color-skill-btn");

  if (!swatch || !randomBtn) return;

  let currentHex = "#6366F1";

  function getRandomHexColor() {
    const num = Math.floor(Math.random() * 0xffffff);
    return "#" + num.toString(16).padStart(6, "0").toUpperCase();
  }

  function setColor(hex) {
    currentHex = hex;
    swatch.style.backgroundColor = hex;
  }

  randomBtn.addEventListener("click", function () {
    setColor(getRandomHexColor());
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(currentHex);
        alert("คัดลอกสี " + currentHex + " แล้ว!");
      } catch {
        alert("คัดลอกสีเรียบร้อย: " + currentHex);
      }
    });
  }

  if (applySkillBtn) {
    applySkillBtn.addEventListener("click", function () {
      const skillInputs = document.querySelectorAll('input[name="skills"]');
      if (skillInputs.length === 0) return;

      const tag = "Color " + currentHex;
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

  setColor(getRandomHexColor());
})();