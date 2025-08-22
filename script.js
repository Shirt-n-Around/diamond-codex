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
  lp: "dc_leaderProfile",
  // goals
  goals: "dc_goals",
  // settings
  pinHash: "dc_pin_hash"
};

// Toast
let toastTimer=null;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"), 1600); }

// tiny hash (not cryptographically strong; just obfuscation)
async function hashText(text){
  if (window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  } else {
    // fallback: simple sum hash
    let h=0; for (let i=0;i<text.length;i++){ h=(h*31 + text.charCodeAt(i))|0; }
    return String(h);
  }
}

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
    competencies: { communication: 5, accountability: 5, empathy: 5, decisiveness: 5, time: 5 },
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

// Goals tracker
function defaultGoals(){ return []; }
function loadGoals(){
  const list = JSON.parse(localStorage.getItem(KEYS.goals) ?? "[]");
  const container = $("#goals-list");
  container.innerHTML = "";
  if (!list.length){
    container.innerHTML = `<p class="muted">No goals yet. Add one above.</p>`;
    return;
  }
  list.forEach((g, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "goal";
    const due = g.due ? new Date(g.due) : null;
    const daysLeft = due ? Math.ceil((due - new Date())/(1000*60*60*24)) : null;
    wrap.innerHTML = `
      <div>
        <div class="goal-title">${g.title || "(Untitled Goal)"} ${g.done ? "✅" : ""}</div>
        <small>${due ? "Due: " + due.toLocaleDateString() + (daysLeft!=null ? " (" + (daysLeft>=0? daysLeft + " days left" : Math.abs(daysLeft) + " days late") + ")" : "") : ""}</small>
        <div class="progress" aria-label="Progress"><div style="width:${g.percent||0}%"></div></div>
      </div>
      <div class="goal-meta">
        <input type="number" min="0" max="100" step="5" value="${g.percent||0}" aria-label="Percent complete"/>
        <div class="goal-actions">
          <button class="btn" data-act="toggle">${g.done ? "Mark Incomplete" : "Mark Done"}</button>
          <button class="btn secondary" data-act="edit">Edit</button>
          <button class="btn danger" data-act="del">Delete</button>
        </div>
      </div>
    `;
    // wire actions
    const pctInput = wrap.querySelector("input[type=number]");
    pctInput.addEventListener("change", ()=>{
      list[idx].percent = Math.min(100, Math.max(0, +pctInput.value||0));
      saveGoals(list);
    });
    wrap.querySelector("[data-act='toggle']").addEventListener("click", ()=>{
      list[idx].done = !list[idx].done;
      if (list[idx].done) list[idx].percent = 100;
      saveGoals(list);
    });
    wrap.querySelector("[data-act='edit']").addEventListener("click", ()=>{
      const title = prompt("Edit goal title:", list[idx].title);
      if (title===null) return;
      const due = prompt("Edit due date (YYYY-MM-DD):", list[idx].due || "");
      if (due===null) return;
      list[idx].title = title;
      list[idx].due = due || "";
      saveGoals(list);
    });
    wrap.querySelector("[data-act='del']").addEventListener("click", ()=>{
      if (confirm("Delete this goal?")){ list.splice(idx,1); saveGoals(list); }
    });
    container.appendChild(wrap);
  });
}
function saveGoals(list){
  localStorage.setItem(KEYS.goals, JSON.stringify(list));
  loadGoals();
  toast("Goals updated");
}
function setupGoals(){
  $("#goal-add").addEventListener("click", ()=>{
    const title = $("#goal-title").value.trim();
    if (!title){ toast("Enter a goal title"); return; }
    const due = $("#goal-due").value;
    const pct = Math.min(100, Math.max(0, +($("#goal-pct").value||0)));
    const list = JSON.parse(localStorage.getItem(KEYS.goals) ?? "[]");
    list.unshift({ title, due, percent: pct, done: pct>=100 });
    $("#goal-title").value=""; $("#goal-due").value=""; $("#goal-pct").value="";
    saveGoals(list);
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
  $("#import-apply").addEventListener("click", async (e) => {
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
      if (Array.isArray(data.goals)) {
        localStorage.setItem(KEYS.goals, JSON.stringify(data.goals));
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
  });

  $("#print-site").addEventListener("click", () => window.print());
}

// Settings / PIN
function setupSettings(){
  const dlg = $("#settings-dialog");
  $("#btn-settings").addEventListener("click", ()=> dlg.showModal());
  $("#pin-save").addEventListener("click", async (e)=>{
    e.preventDefault();
    const a = $("#pin-new").value.trim();
    const b = $("#pin-confirm").value.trim();
    if (!a || a!==b || a.length<4){ alert("PINs must match and be 4–8 digits."); return; }
    const h = await hashText(a);
    localStorage.setItem(KEYS.pinHash, h);
    dlg.close(); toast("PIN updated");
    $("#pin-new").value=""; $("#pin-confirm").value="";
  });

  $("#btn-lock").addEventListener("click", ()=> lockNow());
}
function lockNow(){
  const hasPin = !!localStorage.getItem(KEYS.pinHash);
  if (!hasPin){ toast("Set a PIN in Settings first"); return; }
  showLock();
}
async function checkPinEntry(){
  const stored = localStorage.getItem(KEYS.pinHash);
  const attempt = $("#pin-entry").value.trim();
  const h = await hashText(attempt);
  return stored && h===stored;
}
function showLock(){
  const dlg=$("#lock-dialog");
  dlg.showModal();
  $("#pin-entry").value="";
  $("#pin-enter").onclick = async (e)=>{
    e.preventDefault();
    if (await checkPinEntry()){ dlg.close(); toast("Unlocked"); }
    else { alert("Wrong PIN"); }
  };
}
function maybeLockOnLoad(){
  const hasPin = !!localStorage.getItem(KEYS.pinHash);
  if (hasPin){ showLock(); }
}

// Dossier
function openDossier(){
  const lp = JSON.parse(localStorage.getItem(KEYS.lp) ?? JSON.stringify(defaultLeaderProfile()));
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) ?? "[]");
  const doc = window.open("", "_blank", "width=900,height=1000");
  const css = `
    body{font-family:system-ui,Segoe UI,Roboto,sans-serif;margin:24px;line-height:1.4}
    h1{margin:0 0 6px 0;font-size:24px}
    h2{margin:18px 0 6px 0;font-size:18px}
    .muted{color:#555}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    @media print {.noprint{display:none}}
    hr{border:none;border-top:1px solid #ccc;margin:12px 0}
    ul{margin:6px 0 6px 20px}
  `;
  const goalsHtml = goals.slice(0,8).map(g => {
    const due = g.due ? new Date(g.due).toLocaleDateString() : "—";
    return `<li><strong>${g.title}</strong> — ${g.percent||0}% • Due: ${due} ${g.done?"✅":""}</li>`;
  }).join("");
  doc.document.write(`
    <html><head><title>Leader Dossier — The Diamond Codex</title><style>${css}</style></head>
    <body>
      <h1>Leader Dossier <span class="muted">— The Diamond Codex</span></h1>
      <div class="grid">
        <div>
          <h2>Strengths</h2><div>${(lp.strengths||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Values</h2><div>${(lp.values||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
        <div>
          <h2>Weaknesses</h2><div>${(lp.weaknesses||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Triggers</h2><div>${(lp.triggers||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
      </div>
      <hr/>
      <div class="grid">
        <div>
          <h2>Goals (Short)</h2><div>${(lp.goalsShort||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Development Actions</h2><div>${(lp.devActions||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
        <div>
          <h2>Goals (Long)</h2><div>${(lp.goalsLong||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Check‑ins</h2><div>${(lp.checkins||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
      </div>
      <hr/>
      <h2>Top Goals</h2>
      <ul>${goalsHtml||"<li>—</li>"}</ul>
      <hr/>
      <h2>Competencies</h2>
      <ul>
        <li>Communication: ${lp.competencies.communication}/10</li>
        <li>Accountability: ${lp.competencies.accountability}/10</li>
        <li>Empathy: ${lp.competencies.empathy}/10</li>
        <li>Decisiveness: ${lp.competencies.decisiveness}/10</li>
        <li>Time Management: ${lp.competencies.time}/10</li>
      </ul>
      <p class="muted">Updated ${new Date(lp.updatedAt).toLocaleString()}</p>
      <button class="noprint" onclick="window.print()">Print</button>
    </body></html>
  `);
  doc.document.close();
  // try auto print after load
  setTimeout(()=>{ try{ doc.print(); } catch(e){} }, 400);
}

// Global load
function loadState() {
  const get = (k, fallback) => localStorage.getItem(k) ?? fallback;

  $("#app-title").textContent = get(KEYS.title, "The Diamond Codex");
  $("#app-tagline").textContent = get(KEYS.tagline, "Strength Through Self-Awareness");
  $("#footer-ack").textContent = get(KEYS.footerAck, "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate.");

  loadNotes();
  loadLeaderProfile();
  loadGoals();
}

// Save helpers
function setupEditors() {
  ["quickRef","seniorMentor","actionPlan","coachingGrow"].forEach(key => {
    const ta = $("#" + key + "-editor");
    ta.addEventListener("input", () => updateEditorMeta(key));
  });

  $("[data-save='quickRef']").addEventListener("click", () => { localStorage.setItem(KEYS.quickRef, $("#quickRef-editor").value); loadNotes(); toast("Saved"); });
  $("[data-save='seniorMentor']").addEventListener("click", () => { localStorage.setItem(KEYS.seniorMentor, $("#seniorMentor-editor").value); loadNotes(); toast("Saved"); });
  $("[data-save='actionPlan']").addEventListener("click", () => { localStorage.setItem(KEYS.actionPlan, $("#actionPlan-editor").value); loadNotes(); toast("Saved"); });
  $("[data-save='coachingGrow']").addEventListener("click", () => { localStorage.setItem(KEYS.coachingGrow, $("#coachingGrow-editor").value); loadNotes(); toast("Saved"); });
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
  $("#import-apply").addEventListener("click", async (e) => {
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
      if (Array.isArray(data.goals)) {
        localStorage.setItem(KEYS.goals, JSON.stringify(data.goals));
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
      app: { title: localStorage.getItem(KEYS.title) ?? "The Diamond Codex", tagline: localStorage.getItem(KEYS.tagline) ?? "Strength Through Self-Awareness" },
      footer: { acknowledgment: localStorage.getItem(KEYS.footerAck) ?? "Inspired by the AFGSC Striker Leadership Course (SILC); created as a personal reference to help First Sergeants earn their diamond and never stagnate." },
      leaderProfile: JSON.parse(localStorage.getItem(KEYS.lp) ?? JSON.stringify(defaultLeaderProfile())),
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
  });

  $("#print-site").addEventListener("click", () => window.print());
}

// Settings / PIN
function setupSettings(){
  const dlg = $("#settings-dialog");
  $("#btn-settings").addEventListener("click", ()=> dlg.showModal());
  $("#pin-save").addEventListener("click", async (e)=>{
    e.preventDefault();
    const a = $("#pin-new").value.trim();
    const b = $("#pin-confirm").value.trim();
    if (!a || a!==b || a.length<4){ alert("PINs must match and be 4–8 digits."); return; }
    const h = await hashText(a);
    localStorage.setItem(KEYS.pinHash, h);
    dlg.close(); toast("PIN updated");
    $("#pin-new").value=""; $("#pin-confirm").value="";
  });

  $("#btn-lock").addEventListener("click", ()=> lockNow());
}
function lockNow(){
  const hasPin = !!localStorage.getItem(KEYS.pinHash);
  if (!hasPin){ toast("Set a PIN in Settings first"); return; }
  showLock();
}
async function checkPinEntry(){
  const stored = localStorage.getItem(KEYS.pinHash);
  const attempt = $("#pin-entry").value.trim();
  const h = await hashText(attempt);
  return stored && h===stored;
}
function showLock(){
  const dlg=$("#lock-dialog");
  dlg.showModal();
  $("#pin-entry").value="";
  $("#pin-enter").onclick = async (e)=>{
    e.preventDefault();
    if (await checkPinEntry()){ dlg.close(); toast("Unlocked"); }
    else { alert("Wrong PIN"); }
  };
}
function maybeLockOnLoad(){
  const hasPin = !!localStorage.getItem(KEYS.pinHash);
  if (hasPin){ showLock(); }
}

// Dossier
function openDossier(){
  const lp = JSON.parse(localStorage.getItem(KEYS.lp) ?? JSON.stringify(defaultLeaderProfile()));
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) ?? "[]");
  const doc = window.open("", "_blank", "width=900,height=1000");
  const css = `
    body{font-family:system-ui,Segoe UI,Roboto,sans-serif;margin:24px;line-height:1.4}
    h1{margin:0 0 6px 0;font-size:24px}
    h2{margin:18px 0 6px 0;font-size:18px}
    .muted{color:#555}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    @media print {.noprint{display:none}}
    hr{border:none;border-top:1px solid #ccc;margin:12px 0}
    ul{margin:6px 0 6px 20px}
  `;
  const goalsHtml = goals.slice(0,10).map(g => {
    const due = g.due ? new Date(g.due).toLocaleDateString() : "—";
    return `<li><strong>${g.title}</strong> — ${g.percent||0}% • Due: ${due} ${g.done?"✅":""}</li>`;
  }).join("");
  doc.document.write(`
    <html><head><title>Leader Dossier — The Diamond Codex</title><style>${css}</style></head>
    <body>
      <h1>Leader Dossier <span class="muted">— The Diamond Codex</span></h1>
      <div class="grid">
        <div>
          <h2>Strengths</h2><div>${(lp.strengths||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Values</h2><div>${(lp.values||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
        <div>
          <h2>Weaknesses</h2><div>${(lp.weaknesses||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Triggers</h2><div>${(lp.triggers||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
      </div>
      <hr/>
      <div class="grid">
        <div>
          <h2>Goals (Short)</h2><div>${(lp.goalsShort||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Development Actions</h2><div>${(lp.devActions||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
        <div>
          <h2>Goals (Long)</h2><div>${(lp.goalsLong||"").replace(/\\n/g,"<br/>")||"—"}</div>
          <h2>Check‑ins</h2><div>${(lp.checkins||"").replace(/\\n/g,"<br/>")||"—"}</div>
        </div>
      </div>
      <hr/>
      <h2>Top Goals</h2>
      <ul>${goalsHtml||"<li>—</li>"}</ul>
      <hr/>
      <h2>Competencies</h2>
      <ul>
        <li>Communication: ${lp.competencies.communication}/10</li>
        <li>Accountability: ${lp.competencies.accountability}/10</li>
        <li>Empathy: ${lp.competencies.empathy}/10</li>
        <li>Decisiveness: ${lp.competencies.decisiveness}/10</li>
        <li>Time Management: ${lp.competencies.time}/10</li>
      </ul>
      <p class="muted">Updated ${new Date(lp.updatedAt).toLocaleString()}</p>
      <button class="noprint" onclick="window.print()">Print</button>
    </body></html>
  `);
  doc.document.close();
  setTimeout(()=>{ try{ doc.print(); } catch(e){} }, 400);
}

// Leader Profile events
function setupLeaderProfile(){
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

  $("#lp-open-dossier").addEventListener("click", openDossier);
}

// Global init
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupEditors();
  setupImportExport();
  setupLeaderProfile();
  setupGoals();
  setupSettings();
  loadState();
  maybeLockOnLoad();
});
