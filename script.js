// Simple SPA behavior with localStorage persistence
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const KEYS = {
  title: "dc_title",
  tagline: "dc_tagline",
  footerAck: "dc_footer_ack",
  quickRef: "dc_quickRef",
  seniorMentor: "dc_seniorMentor",
  coachingGrow: "dc_coachingGrow"
};

function loadState() {
  const get = (k, fallback) => localStorage.getItem(k) ?? fallback;
  $("#app-title").textContent = get(KEYS.title, "The Diamond Codex");
  $("#app-tagline").textContent = get(KEYS.tagline, "Strength Through Self-Awareness");
  $("#footer-ack").textContent = get(KEYS.footerAck, "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate.");
  $("#quickRef-content").textContent = get(KEYS.quickRef, "Add your quick reference bullets in Home > Fast Edit.");
  $("#seniorMentor-content").textContent = get(KEYS.seniorMentor, "Add Senior Mentor quotes/takeaways in Home > Fast Edit.");
  $("#coachingGrow-content").textContent = get(KEYS.coachingGrow, "Add GROW prompts in Home > Fast Edit.");
  // preload editors
  $("#quickRef-editor").value = localStorage.getItem(KEYS.quickRef) ?? "";
  $("#seniorMentor-editor").value = localStorage.getItem(KEYS.seniorMentor) ?? "";
  $("#coachingGrow-editor").value = localStorage.getItem(KEYS.coachingGrow) ?? "";
}

function saveField(key, value) {
  localStorage.setItem(key, value);
  loadState();
}

function setupTabs() {
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      $$(".tab-pane").forEach(p => p.classList.remove("active"));
      $("#" + tab).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function setupEditors() {
  $("[data-save='quickRef']").addEventListener("click", () => {
    saveField(KEYS.quickRef, $("#quickRef-editor").value);
  });
  $("[data-save='seniorMentor']").addEventListener("click", () => {
    saveField(KEYS.seniorMentor, $("#seniorMentor-editor").value);
  });
  $("[data-save='coachingGrow']").addEventListener("click", () => {
    saveField(KEYS.coachingGrow, $("#coachingGrow-editor").value);
  });
}

function setupImportExport() {
  const dlg = $("#import-dialog");
  $("#import-json").addEventListener("click", () => dlg.showModal());
  $("#import-apply").addEventListener("click", (e) => {
    e.preventDefault();
    try {
      const raw = $("#import-textarea").value.trim();
      if (!raw) { dlg.close(); return; }
      const data = JSON.parse(raw);

      if (data.app) {
        if (typeof data.app.title === "string") localStorage.setItem(KEYS.title, data.app.title);
        if (typeof data.app.tagline === "string") localStorage.setItem(KEYS.tagline, data.app.tagline);
      }
      if (data.footer && typeof data.footer.acknowledgment === "string") {
        localStorage.setItem(KEYS.footerAck, data.footer.acknowledgment);
      }
      if (typeof data.quickRef === "string") localStorage.setItem(KEYS.quickRef, data.quickRef);
      if (typeof data.seniorMentor === "string") localStorage.setItem(KEYS.seniorMentor, data.seniorMentor);
      if (typeof data.coachingGrow === "string") localStorage.setItem(KEYS.coachingGrow, data.coachingGrow);

      loadState();
      dlg.close();
    } catch (err) {
      alert("Invalid JSON. Please check and try again.");
    }
  });

  $("#export-json").addEventListener("click", () => {
    const out = {
      app: {
        title: localStorage.getItem(KEYS.title) ?? "The Diamond Codex",
        tagline: localStorage.getItem(KEYS.tagline) ?? "Strength Through Self-Awareness"
      },
      footer: {
        acknowledgment: localStorage.getItem(KEYS.footerAck) ?? "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate."
      },
      quickRef: localStorage.getItem(KEYS.quickRef) ?? "",
      seniorMentor: localStorage.getItem(KEYS.seniorMentor) ?? "",
      coachingGrow: localStorage.getItem(KEYS.coachingGrow) ?? ""
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "diamond-codex-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupEditors();
  setupImportExport();
  loadState();
});
