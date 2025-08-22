// Utilities
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Keys for localStorage
const KEYS = {
  title: "dc_title",
  tagline: "dc_tagline",
  footerAck: "dc_footer_ack",
  quickRef: "dc_quickRef",
  seniorMentor: "dc_seniorMentor",
  actionPlan: "dc_actionPlan",
  coachingGrow: "dc_coachingGrow",
  lp: "dc_leaderProfile",
  goals: "dc_goals"
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

// Load Notes
function loadNotes() {
  const get = (k, fallback) => localStorage.getItem(k) ?? fallback;
  $("#quickRef-content").innerHTML   = renderContent(get(KEYS.quickRef, "Add your quick reference bullets (Edit below)."));
  $("#seniorMentor-content").innerHTML = renderContent(get(KEYS.seniorMentor, "Add Senior Mentor quotes/takeaways (Edit below)."));
  $("#actionPlan-content").innerHTML = renderContent(get(KEYS.actionPlan, "Add your Action Plan (Edit below)."));
  $("#coachingGrow-content").innerHTML = renderContent(get(KEYS.coachingGrow, "Add GROW prompts (Edit below)."));

  // Editors preload
  $("#quickRef-editor").value = localStorage.getItem(KEYS.quickRef) ?? "";
  $("#seniorMentor-editor").value = localStorage.getItem(KEYS.seniorMentor) ?? "";
  $("#actionPlan-editor").value = localStorage.getItem(KEYS.actionPlan) ?? "";
  $("#coachingGrow-editor").value = localStorage.getItem(KEYS.coachingGrow) ?? "";

  ["quickRef","seniorMentor","actionPlan","coachingGrow"].forEach(updateEditorMeta);
}
function autoresize(el){ el.style.height="auto"; el.style.height=Math.min(900, el.scrollHeight)+"px"; }
function updateEditorMeta(key){
  const ta = $("#" + key + "-editor"); if(!ta) return;
  const count = (ta.value || "").length;
  const lines = (ta.value || "").split(/\r?\n/).length;
  $("#" + key + "-count").textContent = `${count} chars • ${lines} lines`;
  autoresize(ta);
}

// Leader Profile
function defaultLeaderProfile(){
  return {
    strengths:"", weaknesses:"", values:"", triggers:"",
    goalsShort:"", goalsLong:"", devActions:"", checkins:"",
    competencies:{communication:5,accountability:5,empathy:5,decisiveness:5,time:5},
    updatedAt:new Date().toISOString()
  };
}
function loadLeaderProfile(){
  const raw = localStorage.getItem(KEYS.lp);
  const lp = raw ? JSON.parse(raw) : defaultLeaderProfile();
  $("#lp-strengths").value = lp.strengths || "";
  $("#lp-weaknesses").value = lp.weaknesses || "";
  $("#lp-values").value = lp.values || "";
  $("#lp-triggers").value = lp.triggers || "";
  $("#lp-goals-short").value = lp.goalsShort || "";
  $("#lp-goals-long").value = lp.goalsLong || "";
  $("#lp-dev-actions").value = lp.devActions || "";
  $("#lp-checkins").value = lp.checkins || "";
  $("#cr-communication").value = lp.competencies.communication;
  $("#cr-accountability").value = lp.competencies.accountability;
  $("#cr-empathy").value = lp.competencies.empathy;
  $("#cr-decisiveness").value = lp.competencies.decisiveness;
  $("#cr-time").value = lp.competencies.time;
  $("#cr-communication-val").textContent = $("#cr-communication").value;
  $("#cr-accountability-val").textContent = $("#cr-accountability").value;
  $("#cr-empathy-val").textContent = $("#cr-empathy").value;
  $("#cr-decisiveness-val").textContent = $("#cr-decisiveness").value;
  $("#cr-time-val").textContent = $("#cr-time").value;
  renderLeaderSummary(lp);
}
function captureLeaderProfile(){
  return {
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

// Goals
function loadGoals(){
  const raw = localStorage.getItem(KEYS.goals);
  const arr = raw ? JSON.parse(raw) : [];
  const box = $("#g-list"); box.innerHTML="";
  arr.forEach((g, idx) => {
    const due = g.due ? new Date(g.due) : null;
    const now = new Date();
    const daysLeft = due ? Math.ceil((due - now)/86400000) : null;
    const status = g.done ? "✅ Done" : (daysLeft===null ? "" : (daysLeft<0 ? `⚠️ ${-daysLeft} days late` : `${daysLeft} days left`));
    const percent = Math.max(0, Math.min(100, g.percent||0));
    const el = document.createElement("div");
    el.className="goal-card";
    el.innerHTML = `
      <div class="goal-top">
        <strong>${g.title||"(untitled)"}</strong>
        <span class="muted">${due?due.toISOString().slice(0,10):""} ${status?("• "+status):""}</span>
      </div>
      <div class="progress"><div style="width:${percent}%"></div></div>
      <div class="goal-actions">
        <button data-act="toggle" data-idx="${idx}" class="btn mini">${g.done?"Mark Undone":"Mark Done"}</button>
        <button data-act="edit" data-idx="${idx}" class="btn mini">Edit</button>
        <button data-act="del" data-idx="${idx}" class="btn mini">Delete</button>
      </div>
    `;
    box.appendChild(el);
  });
}
function saveGoals(arr){ localStorage.setItem(KEYS.goals, JSON.stringify(arr)); loadGoals(); toast("Goals updated"); }

// Import/Export & Print
function setupImportExport() {
  const dlg = $("#import-dialog");
  $$("[id='import-json']").forEach(b=>b.addEventListener("click", () => dlg.showModal()));
  $$("[id='export-json']").forEach(b=>b.addEventListener("click", exportJSON));
  $$("[id='print-site']").forEach(b=>b.addEventListener("click", () => window.print()));

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
      if (typeof data.leaderProfile === "object" && data.leaderProfile) {
        localStorage.setItem(KEYS.lp, JSON.stringify(data.leaderProfile));
      }
      if (Array.isArray(data.goals)) {
        localStorage.setItem(KEYS.goals, JSON.stringify(data.goals));
      }
      if (typeof data.quickRef === "string") localStorage.setItem(KEYS.quickRef, data.quickRef);
      if (typeof data.seniorMentor === "string") localStorage.setItem(KEYS.seniorMentor, data.seniorMentor);
      if (typeof data.actionPlan === "string") localStorage.setItem(KEYS.actionPlan, data.actionPlan);
      if (typeof data.coachingGrow === "string") localStorage.setItem(KEYS.coachingGrow, data.coachingGrow);

      loadAll();
      dlg.close();
      toast("Imported");
    } catch (err) {
      alert("Invalid JSON. Please check and try again.");
    }
  });
}
function exportJSON(){
  const out = {
    app: {
      title: localStorage.getItem(KEYS.title) ?? "The Diamond Codex",
      tagline: localStorage.getItem(KEYS.tagline) ?? "Strength Through Self-Awareness"
    },
    footer: {
      acknowledgment: localStorage.getItem(KEYS.footerAck) ?? "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate."
    },
    leaderProfile: JSON.parse(localStorage.getItem(KEYS.lp) ?? "null"),
    goals: JSON.parse(localStorage.getItem(KEYS.goals) ?? "[]"),
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
}

// Header/Hash navigation
function activateTab(tabId, doScroll=true){
  $$(".tab-btn").forEach(b => {
    const match = b.dataset.tab === tabId;
    b.classList.toggle("active", match);
    b.setAttribute("aria-selected", match ? "true" : "false");
  });
  $$(".tab-pane").forEach(p => p.classList.toggle("active", p.id === tabId));
  if(doScroll){
    const el = document.getElementById(tabId);
    if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
  }
}
function setupHeaderNav(){
  $$(".tab-btn").forEach(a => {
    a.addEventListener("click", (e) => {
      // Allow default anchor hash change, but also activate tab immediately
      const tab = a.dataset.tab;
      activateTab(tab, true);
    });
  });
  function syncToHash(){
    const id = (location.hash || "#home").replace("#","");
    const exists = document.getElementById(id);
    activateTab(exists ? id : "home", false);
  }
  window.addEventListener("hashchange", syncToHash);
  // initial
  syncToHash();
}

// Save handlers
function setupSaves(){
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

// Leader profile events
function setupLeaderProfile(){
  ["communication","accountability","empathy","decisiveness","time"].forEach(key => {
    const input = $("#cr-" + key);
    const label = $("#cr-" + key + "-val");
    input.addEventListener("input", ()=> label.textContent = input.value);
  });
  $("#lp-save").addEventListener("click", () => {
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
    localStorage.setItem(KEYS.lp, JSON.stringify(lp));
    renderLeaderSummary(lp);
    toast("Profile saved");
  });
  $("#lp-copy-summary").addEventListener("click", () => {
    const text = $("#lp-summary").innerText;
    navigator.clipboard.writeText(text).then(()=> toast("Summary copied"));
  });
}

// Goals UI
function setupGoals(){
  const loadArr = ()=> JSON.parse(localStorage.getItem(KEYS.goals) ?? "[]");
  const writeArr = (arr)=> saveGoals(arr);

  $("#g-add").addEventListener("click", () => {
    const arr = loadArr();
    const title = $("#g-title").value.trim();
    const due = $("#g-due").value || null;
    const percent = +($("#g-percent").value || 0);
    if(!title){ toast("Title required"); return; }
    arr.push({title, due, percent, done:false});
    writeArr(arr);
    $("#g-title").value=""; $("#g-due").value=""; $("#g-percent").value="";
  });

  $("#g-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button"); if(!btn) return;
    const idx = +btn.dataset.idx;
    const arr = loadArr();
    if(btn.dataset.act === "del"){ arr.splice(idx,1); writeArr(arr); return; }
    if(btn.dataset.act === "toggle"){ arr[idx].done = !arr[idx].done; writeArr(arr); return; }
    if(btn.dataset.act === "edit"){
      const g = arr[idx];
      const title = prompt("Edit title", g.title) ?? g.title;
      const due = prompt("Edit due (YYYY-MM-DD)", g.due||"") || null;
      const percent = +prompt("Edit percent (0-100)", g.percent ?? 0);
      arr[idx] = {title, due, percent, done:g.done};
      writeArr(arr);
    }
  });
}

// Global load
function loadAll(){
  const get = (k, fallback) => localStorage.getItem(k) ?? fallback;
  $("#app-title").textContent = get(KEYS.title, "The Diamond Codex");
  $("#app-tagline").textContent = get(KEYS.tagline, "Strength Through Self-Awareness");
  $("#footer-ack").textContent = get(KEYS.footerAck, "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate.");
  loadNotes();
  loadLeaderProfile();
  loadGoals();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  setupHeaderNav();
  setupImportExport();
  setupSaves();
  setupLeaderProfile();
  setupGoals();
  loadAll();
});
