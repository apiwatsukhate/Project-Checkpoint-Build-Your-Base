let portfolios = [];

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]
  );
}

// โหลดข้อมูลจาก Server
async function loadPortfolios() {
  try {
    const res = await fetch("/api/portfolios");
    if (!res.ok) throw new Error("Failed to fetch portfolios");
    portfolios = await res.json();
    renderPortfolios();
  } catch (err) {
    console.error(err);
    alert("ไม่สามารถโหลดข้อมูลจาก Server ได้");
  }
}

// สร้าง Portfolio ใหม่ผ่าน Server
document.querySelector("#portfolio-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const data = new FormData(this);

  const payload = {
    displayedName: data.get("displayedName"),
    whatIEnjoy: data.get("whatIEnjoy"),
    whatIveTried: data.get("whatIveTried"),
    whatImCuriousAbout: data.get("whatImCuriousAbout"),
  };

  try {
    const res = await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      alert("Error: " + result.error);
      return;
    }

    this.reset();
    await loadPortfolios();
    alert("Portfolio Created on Server!");
  } catch (err) {
    alert("Network error while creating portfolio.");
  }
});

// เพิ่ม Portfolio Item ปกติผ่าน Server
document.querySelector("#item-form").addEventListener("submit", async function (event) {
  event.preventDefault();
  const data = new FormData(this);
  const portfolioId = data.get("portfolioId");

  if (!portfolioId) {
    alert("Please select a Portfolio");
    return;
  }

  const payload = {
    title: data.get("title"),
    type: data.get("type"),
    date: data.get("date"),
    role: data.get("role"),
    description: data.get("description"),
    skills: data
      .get("skills")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== ""),
    reflection: {
      whatIDid: data.get("whatIDid"),
      whatILearned: data.get("whatILearned"),
      challenge: data.get("challenge"),
      nextStep: data.get("nextStep"),
    },
    evidence: [data.get("evidence").trim()],
  };

  try {
    const res = await fetch(`/api/portfolios/${portfolioId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      alert("Validation Error: " + result.error);
      return;
    }

    this.reset();
    await loadPortfolios();
    alert("Portfolio Item Saved to Server!");
  } catch (err) {
    alert("Network error while saving item.");
  }
});

// แสดงผลรายการ Portfolio และอัปเดต Dropdown ทั้งหมด
function renderPortfolios() {
  const list = document.querySelector("#portfolio-list");
  const selects = document.querySelectorAll(".portfolio-select");

  list.innerHTML = "";
  selects.forEach((select) => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select Portfolio</option>';
    portfolios.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.displayedName || p.name;
      select.appendChild(option);
    });
    if (currentVal) select.value = currentVal;
  });

  portfolios.forEach((portfolio) => {
    const card = document.createElement("div");
    card.className = "card p-3 mb-3";

    const headerRow = document.createElement("div");
    headerRow.className = "d-flex justify-content-between align-items-start mb-2";

    const heading = document.createElement("h4");
    heading.className = "m-0 border-0 pb-0";
    heading.textContent = portfolio.displayedName || portfolio.name;

    // ปุ่ม Export เฉพาะ Portfolio นี้เป็น my-portfolio.json
    const exportBtn = document.createElement("a");
    exportBtn.href = `/api/portfolios/${portfolio.id}/export`;
    exportBtn.className = "btn btn-sm btn-outline-success";
    exportBtn.innerHTML = '<i class="fa-solid fa-download"></i> Export JSON';
    exportBtn.title = "Download my-portfolio.json";

    headerRow.append(heading, exportBtn);

    const enjoy = document.createElement("p");
    enjoy.innerHTML = `<strong>Enjoy:</strong> ${escapeHTML(portfolio.whatIEnjoy)}`;

    const tried = document.createElement("p");
    tried.innerHTML = `<strong>Tried:</strong> ${escapeHTML(portfolio.whatIveTried)}`;

    const curious = document.createElement("p");
    curious.innerHTML = `<strong>Curious:</strong> ${escapeHTML(portfolio.whatImCuriousAbout)}`;

    card.append(headerRow, enjoy, tried, curious);

    (portfolio.items || []).forEach((item) => {
      const itemCard = document.createElement("div");
      itemCard.className = "border rounded p-3 mb-3";

      const badgeHtml = item.hostGroup
        ? `<span class="badge bg-warning text-dark ms-2">Booth: ${escapeHTML(item.hostGroup)}</span>`
        : "";

      const title = document.createElement("h5");
      title.innerHTML = `<i class="fa-solid fa-folder-open"></i> ${escapeHTML(item.title)} ${badgeHtml}`;

      const meta = document.createElement("p");
      meta.innerHTML = `<strong>Type:</strong> ${escapeHTML(item.type)} | <strong>Date:</strong> ${escapeHTML(item.date)} | <strong>Role:</strong> ${escapeHTML(item.role)}`;

      const description = document.createElement("p");
      description.innerHTML = `<strong>Description:</strong> ${escapeHTML(item.description)}`;

      const skills = document.createElement("p");
      skills.innerHTML = `<strong>Skills:</strong> ${escapeHTML((item.skills || []).join(", "))}`;

      const reflectionTitle = document.createElement("h6");
      reflectionTitle.innerHTML = '<i class="fa-solid fa-lightbulb"></i> Reflection';

      const reflection = document.createElement("div");
      reflection.innerHTML = `
        <p class="mb-1"><strong>What I did:</strong> ${escapeHTML(item.reflection?.whatIDid)}</p>
        <p class="mb-1"><strong>What I learned:</strong> ${escapeHTML(item.reflection?.whatILearned)}</p>
        <p class="mb-1"><strong>Challenge:</strong> ${escapeHTML(item.reflection?.challenge)}</p>
        <p class="mb-1"><strong>Next step:</strong> ${escapeHTML(item.reflection?.nextStep)}</p>
      `;

      const evidenceTitle = document.createElement("p");
      evidenceTitle.className = "mt-2 mb-0";
      evidenceTitle.innerHTML = "<strong>Evidence:</strong> ";

      if (Array.isArray(item.evidence) && item.evidence.length > 0) {
        const evidence = document.createElement("a");
        evidence.href = item.evidence[0];
        evidence.textContent = "View Evidence";
        evidence.target = "_blank";
        evidence.rel = "noopener noreferrer";
        evidenceTitle.appendChild(evidence);
      }

      itemCard.append(title, meta, description, skills, reflectionTitle, reflection, evidenceTitle);
      card.appendChild(itemCard);
    });

    list.appendChild(card);
  });
}

document.querySelector("#refresh-btn").addEventListener("click", loadPortfolios);

// เริ่มต้นโหลดข้อมูลจาก Server
loadPortfolios();