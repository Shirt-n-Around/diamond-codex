// Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Keys for localStorage
const KEYS = {
  title: "dc_title",
  tagline: "dc_tagline",
  footerAck: "dc_footer_ack",
  // notes
  quickRef: "dc_quickRef",
  seniorMentor: "dc_seniorMentor",
  actionPlan: "dc_actionPlan",
  coachingGrow: "dc_coachingGrow",
  // leader profile
  lp: "dc_leaderProfile"
};

// Toast
let toastTimer=null;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"), 1600); }

// Markdown-ish rendering
function renderContent(text){
  const lines = (text||"").split(/\r?\n/);
  let html="", listOpen=false;
  const closeList = ()=>{ if(listOpen){ html+="</ul>"; listOpen=false; } };
  for(const raw of lines){
    const line = raw.trimEnd();
    if(/^(\-|\*|•)\s+/.test(line)){
      if(!listOpen){ html+="<ul>"; listOpen=true; }
      html += `<li>${line.replace(/^(\-|\*|•)\s+/, "")}</li>`;
      continue;
    }
    if(/^###\s+/.test(line)){ closeList(); html+=`<h3>${line.replace(/^###\s+/, "")}</h3>`; continue; }
    if(/^##\s+/.test(line)){ closeList(); html+=`<h2>${line.replace(/^##\s+/, "")}</h2>`; continue; }
    if(/^#\s+/.test(line)){ closeList(); html+=`<h1>${line.replace(/^#\s+/, "")}</h1>`; continue; }
    if(line===""){ closeList(); html+="<br/>"; continue; }
    closeList();
    html += `<p>${line}</p>`;
  }
  closeList();
  return html;
}

// Load notes sections
function loadNotes() {
  const get = (k, fallback) => localStorage.getItem(k) ?? fallback;
  $("#quickRef-content").innerHTML   = renderContent(get(KEYS.quickRef, "Add your quick reference bullets in Home > Fast Edit."));
  $("#seniorMentor-content").innerHTML = renderContent(get(KEYS.seniorMentor, "Add Senior Mentor quotes/takeaways in Home > Fast Edit."));
  $("#actionPlan-content").innerHTML = renderContent(get(KEYS.actionPlan, "Add your Action Plan in Home > Fast Edit."));
  $("#coachingGrow-content").innerHTML = renderContent(get(KEYS.coachingGrow, "Add GROW prompts in Home > Fast Edit."));

  // Preload editors
  $("#quickRef-editor").value = localStorage.getItem(KEYS.quickRef) ?? "";
  $("#seniorMentor-editor").value = localStorage.getItem(KEYS.seniorMentor) ?? "";
  $("#actionPlan-editor").value = localStorage.getItem(KEYS.actionPlan) ?? "";
  $("#coachingGrow-editor").value = localStorage.getItem(KEYS.coachingGrow) ?? "";

  ["quickRef","seniorMentor","actionPlan","coachingGrow"].forEach(updateEditorMeta);
}

// Editor helpers
function autoresize(el){
  el.style.height = "auto";
  el.style.height = Math.min(800, el.scrollHeight) + "px";
}
function updateEditorMeta(key){
  const ta = $("#" + key + "-editor");
  if(!ta) return;
  const count = (ta.value || "").length;
  const lines = (ta.value || "").split(/\r?\n/).length;
  $("#" + key + "-count").textContent = `${count} chars • ${lines} lines`;
  autoresize(ta);
}

// Leader Profile helpers
function defaultLeaderProfile(){
  return {
    strengths: "",
    weaknesses: "",
    values: "",
    triggers: "",
    goalsShort: "",
    goalsLong: "",
    devActions: "",
    checkins: "",
    competencies: {
      communication: 5,
      accountability: 5,
      empathy: 5,
      decisiveness: 5,
      time: 5
    },
    updatedAt: new Date().toISOString()
  };
}
function loadLeaderProfile(){
  const raw = localStorage.getItem(KEYS.lp);
  const lp = raw ? JSON.parse(raw) : defaultLeaderProfile();
  // fields
  $("#lp-strengths").value = lp.strengths || "";
  $("#lp-weaknesses").value = lp.weaknesses || "";
  $("#lp-values").value = lp.values || "";
  $("#lp-triggers").value = lp.triggers || "";
  $("#lp-goals-short").value = lp.goalsShort || "";
  $("#lp-goals-long").value = lp.goalsLong || "";
  $("#lp-dev-actions").value = lp.devActions || "";
  $("#lp-checkins").value = lp.checkins || "";
  // sliders
  $("#cr-communication").value = lp.competencies?.communication ?? 5;
  $("#cr-accountability").value = lp.competencies?.accountability ?? 5;
  $("#cr-empathy").value = lp.competencies?.empathy ?? 5;
  $("#cr-decisiveness").value = lp.competencies?.decisiveness ?? 5;
  $("#cr-time").value = lp.competencies?.time ?? 5;
  // labels
  $("#cr-communication-val").textContent = $("#cr-communication").value;
  $("#cr-accountability-val").textContent = $("#cr-accountability").value;
  $("#cr-empathy-val").textContent = $("#cr-empathy").value;
  $("#cr-decisiveness-val").textContent = $("#cr-decisiveness").value;
  $("#cr-time-val").textContent = $("#cr-time").value;
  // summary
  renderLeaderSummary(lp);
}
function captureLeaderProfile(){
  const lp = {
    strengths: $("#lp-strengths").value,
    weaknesses: $("#lp-weaknesses").value,
    values: $("#lp-values").value,
    triggers: $("#lp-triggers").value,
    goalsShort: $("#lp-goals-short").value,
    goalsLong: $("#lp-goals-long").value,
    devActions: $("#lp-dev-actions").value,
    checkins: $("#lp-checkins").value,
    competencies: {
      communication: +$("#cr-communication").value,
      accountability: +$("#cr-accountability").value,
      empathy: +$("#cr-empathy").value,
      decisiveness: +$("#cr-decisiveness").value,
      time: +$("#cr-time").value
    },
    updatedAt: new Date().toISOString()
  };
  return lp;
}
function renderLeaderSummary(lp){
  const summary = `
## Snapshot (updated ${new Date(lp.updatedAt).toLocaleString()})
### Strengths
${lp.strengths || "-"}

### Weaknesses
${lp.weaknesses || "-"}

### Values
${lp.values || "-"}

### Triggers
${lp.triggers || "-"}

### Goals — Short Term
${lp.goalsShort || "-"}

### Goals — Long Term
${lp.goalsLong || "-"}

### Development Actions
${lp.devActions || "-"}

### Accountability / Check‑ins
${lp.checkins || "-"}

### Competencies (0–10)
• Communication: ${lp.competencies.communication}
• Accountability: ${lp.competencies.accountability}
• Empathy: ${lp.competencies.empathy}
• Decisiveness: ${lp.competencies.decisiveness}
• Time Management: ${lp.competencies.time}
  `;
  $("#lp-summary").innerHTML = renderContent(summary);
}

// Global load
function loadState() {
  const get = (k, fallback) => localStorage.getItem(k) ?? fallback;

  $("#app-title").textContent = get(KEYS.title, "The Diamond Codex");
  $("#app-tagline").textContent = get(KEYS.tagline, "Strength Through Self-Awareness");
  $("#footer-ack").textContent = get(KEYS.footerAck, "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate.");

  loadNotes();
  loadLeaderProfile();
}

// Save helpers
function setupEditors() {
  ["quickRef","seniorMentor","actionPlan","coachingGrow"].forEach(key => {
    const ta = $("#" + key + "-editor");
    ta.addEventListener("input", () => updateEditorMeta(key));
  });

  $("[data-save='quickRef']").addEventListener("click", () => {
    localStorage.setItem(KEYS.quickRef, $("#quickRef-editor").value);
    loadNotes(); toast("Saved");
  });
  $("[data-save='seniorMentor']").addEventListener("click", () => {
    localStorage.setItem(KEYS.seniorMentor, $("#seniorMentor-editor").value);
    loadNotes(); toast("Saved");
  });
  $("[data-save='actionPlan']").addEventListener("click", () => {
    localStorage.setItem(KEYS.actionPlan, $("#actionPlan-editor").value);
    loadNotes(); toast("Saved");
  });
  $("[data-save='coachingGrow']").addEventListener("click", () => {
    localStorage.setItem(KEYS.coachingGrow, $("#coachingGrow-editor").value);
    loadNotes(); toast("Saved");
  });
}

// Tabs
function setupTabs() {
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
      btn.classList.add("active"); btn.setAttribute("aria-selected","true");
      const tab = btn.dataset.tab;
      $$(".tab-pane").forEach(p => p.classList.remove("active"));
      $("#" + tab).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// Import/Export & Print
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
      if (typeof data.actionPlan === "string") localStorage.setItem(KEYS.actionPlan, data.actionPlan);
      if (typeof data.coachingGrow === "string") localStorage.setItem(KEYS.coachingGrow, data.coachingGrow);
      if (typeof data.leaderProfile === "object" && data.leaderProfile !== null) {
        localStorage.setItem(KEYS.lp, JSON.stringify(data.leaderProfile));
      }

      loadState();
      dlg.close();
      toast("Imported");
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
      leaderProfile: JSON.parse(localStorage.getItem(KEYS.lp) ?? JSON.stringify(defaultLeaderProfile())),
      quickRef: localStorage.getItem(KEYS.quickRef) ?? "",
      seniorMentor: localStorage.getItem(KEYS.seniorMentor) ?? "",
      actionPlan: localStorage.getItem(KEYS.actionPlan) ?? "",
      coachingGrow: localStorage.getItem(KEYS.coachingGrow) ?? ""
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "diamond-codex-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Exported");
  });

  $("#print-site").addEventListener("click", () => window.print());
}

// Leader Profile events
function setupLeaderProfile(){
  // Slider live labels
  ["communication","accountability","empathy","decisiveness","time"].forEach(key => {
    const input = $("#cr-" + key);
    const label = $("#cr-" + key + "-val");
    input.addEventListener("input", ()=> label.textContent = input.value);
  });

  $("#lp-save").addEventListener("click", () => {
    const lp = captureLeaderProfile();
    localStorage.setItem(KEYS.lp, JSON.stringify(lp));
    renderLeaderSummary(lp);
    toast("Profile saved");
  });

  $("#lp-copy-summary").addEventListener("click", () => {
    const text = $("#lp-summary").innerText;
    navigator.clipboard.writeText(text).then(()=> toast("Summary copied"));
  });
}

// Global init
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupEditors();
  setupImportExport();
  setupLeaderProfile();
  loadState();
});
