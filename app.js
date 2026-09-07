(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  const DEFAULT = {
    role: "billing",
    mail: {
      senderName: "算定病歴係長",
      signature: "独立行政法人 国立病院機構\n神戸医療センター\n算定病歴係長"
    },
    events: [
      {id:1,date:"2026-09-07",title:"院長報告資料確認",start:"10:00",end:"11:00",category:"資料作成",memo:""},
      {id:2,date:"2026-09-07",title:"施設基準 打合せ",start:"15:00",end:"16:00",category:"会議",memo:""},
      {id:3,date:"2026-09-10",title:"月次実績締切",start:"09:00",end:"09:30",category:"提出・締切",memo:""}
    ],
    todos: [
      {id:11,title:"本部提出資料の最終確認",due:"2026-09-07",priority:"高",category:"本部報告",done:false},
      {id:12,title:"看護必要度 3か月平均確認",due:"2026-09-08",priority:"高",category:"施設基準",done:false},
      {id:13,title:"ICU月次集計",due:"2026-09-10",priority:"中",category:"月次集計",done:true},
      {id:14,title:"過年度資料の整理",due:"2026-09-18",priority:"低",category:"その他",done:false}
    ],
    mailLogs: []
  };

  function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function loadState(){
    try {
      const raw = localStorage.getItem("orbia-v01");
      return raw ? {...deepClone(DEFAULT), ...JSON.parse(raw)} : deepClone(DEFAULT);
    } catch { return deepClone(DEFAULT); }
  }
  let state = loadState();
  const save = () => localStorage.setItem("orbia-v01", JSON.stringify(state));

  let selectedDate = "2026-09-07";
  let viewYear = 2026, viewMonth = 8;

  function toast(msg){
    const el = $("#toast");
    el.textContent = "🐾 " + msg;
    el.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove("show"), 2100);
  }

  function showView(id){
    $$(".view").forEach(v => v.classList.toggle("active", v.id === id));
    $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === id));
    window.scrollTo({top:0, behavior:"smooth"});
  }

  $$(".nav-item").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
  $$("[data-jump]").forEach(b => b.addEventListener("click", () => showView(b.dataset.jump)));

  function roleName(){ return state.role === "billing" ? "算定病歴係長" : "経営企画係長"; }
  function syncRole(){
    $("#roleMode").value = state.role;
    $("#welcomeRole").textContent = roleName();
    $("#senderName").value = state.mail.senderName || roleName();
    $("#signature").value = state.mail.signature || "";
    $("#todayText").textContent = state.role === "billing"
      ? "施設基準・月次集計・提出期限をまとめて確認できます。"
      : "経営実績・院長資料・会議予定をまとめて確認できます。";
  }
  $("#roleMode").addEventListener("change", e => {
    state.role = e.target.value;
    if (!state.mail.senderName || ["算定病歴係長","経営企画係長"].includes(state.mail.senderName)) state.mail.senderName = roleName();
    save(); syncRole(); renderHome(); toast(roleName() + "モードに切り替えました");
  });

  function todayISO(){ return "2026-09-07"; }
  function priorityRank(p){ return p === "高" ? 0 : p === "中" ? 1 : 2; }
  function pClass(p){ return p === "高" ? "p-high" : p === "中" ? "p-mid" : "p-low"; }

  function renderHome(){
    const today = todayISO();
    const todayEvents = state.events.filter(e => e.date === today).length;
    const open = state.todos.filter(t => !t.done);
    const high = open.filter(t => t.priority === "高").length;
    const done = state.todos.filter(t => t.done).length;
    $("#statEvents").textContent = todayEvents;
    $("#statHigh").textContent = high;
    $("#statDone").textContent = Math.round(done / Math.max(state.todos.length,1) * 100) + "%";

    const list = open.slice().sort((a,b) => priorityRank(a.priority)-priorityRank(b.priority) || a.due.localeCompare(b.due)).slice(0,5);
    $("#homePriority").innerHTML = list.length ? list.map(t => `
      <div class="stack-item ${pClass(t.priority)}">
        <b>${escapeHtml(t.title)}</b>
        <small>${escapeHtml(t.category)} ・ 期限 ${fmtDate(t.due)} ・ 優先度 ${t.priority}</small>
      </div>`).join("") : `<div class="stack-item">未完了のTODOはありません 🎉</div>`;
  }

  function fmtDate(iso){
    const [y,m,d] = iso.split("-").map(Number);
    return `${m}/${d}`;
  }
  function iso(y,m,d){ return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
  function escapeHtml(s=""){
    return String(s).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  }

  function renderCalendar(){
    $("#monthLabel").textContent = `${viewYear}年 ${viewMonth+1}月`;
    const grid = $("#calendarGrid");
    grid.innerHTML = "";
    const first = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
    const max = new Date(Date.UTC(viewYear, viewMonth+1, 0)).getUTCDate();
    for(let i=0;i<first;i++) grid.appendChild(document.createElement("div"));
    for(let d=1; d<=max; d++){
      const date = iso(viewYear, viewMonth, d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day-cell";
      if(date === selectedDate) btn.classList.add("selected");
      if(date === todayISO()) btn.classList.add("today");
      const events = state.events.filter(e => e.date === date);
      btn.innerHTML = `<span class="day-number">${d}</span>` + events.slice(0,2).map(e => `<span class="event-dot">● ${escapeHtml(e.title)}</span>`).join("");
      btn.addEventListener("click", () => { selectedDate = date; renderCalendar(); renderDayEvents(); });
      grid.appendChild(btn);
    }
    renderDayEvents();
  }
  function renderDayEvents(){
    $("#selectedDateText").textContent = selectedDate.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_,y,m,d)=>`${Number(m)}月${Number(d)}日`);
    const arr = state.events.filter(e => e.date === selectedDate).sort((a,b)=>a.start.localeCompare(b.start));
    $("#dayEvents").innerHTML = arr.length ? arr.map(e => `
      <div class="stack-item">
        <b>${escapeHtml(e.start)} ${escapeHtml(e.title)}</b>
        <small>${escapeHtml(e.category)} ・ ${escapeHtml(e.start)}〜${escapeHtml(e.end)}</small>
      </div>`).join("") : `<div class="stack-item"><small>予定はありません。</small></div>`;
  }
  $("#prevMonth").addEventListener("click",()=>{ if(--viewMonth<0){viewMonth=11;viewYear--;} renderCalendar(); });
  $("#nextMonth").addEventListener("click",()=>{ if(++viewMonth>11){viewMonth=0;viewYear++;} renderCalendar(); });
  $("#eventForm").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("#eventTitle").value.trim();
    if(!title) return;
    state.events.push({
      id:Date.now(), date:selectedDate, title,
      start:$("#eventStart").value || "09:00",
      end:$("#eventEnd").value || "10:00",
      category:$("#eventCategory").value,
      memo:$("#eventMemo").value.trim()
    });
    save(); e.target.reset(); $("#eventStart").value="09:00"; $("#eventEnd").value="10:00";
    renderCalendar(); renderHome(); toast("予定を登録しました");
  });

  function renderTodos(){
    const filter = $("#todoFilter").value;
    let arr = state.todos.slice().sort((a,b)=> Number(a.done)-Number(b.done) || priorityRank(a.priority)-priorityRank(b.priority) || a.due.localeCompare(b.due));
    if(filter === "open") arr = arr.filter(t=>!t.done);
    else if(["高","中","低"].includes(filter)) arr = arr.filter(t=>t.priority===filter);
    const wrap = $("#todoList");
    wrap.innerHTML = "";
    arr.forEach(t => {
      const row = document.createElement("div");
      row.className = "todo-row " + (t.done ? "done" : "");
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = !!t.done; cb.setAttribute("aria-label",`${t.title}を完了`);
      cb.addEventListener("change",()=>{ t.done=cb.checked; save(); renderTodos(); renderHome(); });
      const body = document.createElement("div");
      body.innerHTML = `<div class="todo-title"><b>${escapeHtml(t.title)}</b></div><div class="todo-meta">${escapeHtml(t.category)} ・ 期限 ${fmtDate(t.due)}</div>`;
      const badge = document.createElement("span");
      badge.className = `priority-badge ${pClass(t.priority)}`; badge.textContent = t.priority;
      row.append(cb,body,badge); wrap.appendChild(row);
    });
  }
  $("#todoFilter").addEventListener("change",renderTodos);
  $("#todoForm").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("#todoTitle").value.trim();
    if(!title) return;
    state.todos.push({
      id:Date.now(), title, due:$("#todoDue").value || todayISO(),
      priority:$("#todoPriority").value, category:$("#todoCategory").value, done:false
    });
    save(); e.target.reset(); renderTodos(); renderHome(); toast("TODOを追加しました");
  });

  const MAIL_TEMPLATES = {
    request:{subject:"【依頼】資料ご提出のお願い", body:"お世話になっております。\n\n標記の件につきまして、資料のご提出をお願いいたします。\nご確認のほどよろしくお願いいたします。"},
    remind:{subject:"【ご確認】提出期限のご案内", body:"お世話になっております。\n\n標記の件につきまして、提出期限が近づいておりますのでご案内いたします。\nご対応のほどよろしくお願いいたします。"},
    overdue:{subject:"【再依頼】提出期限超過のご連絡", body:"お世話になっております。\n\n標記の件につきまして、提出期限を過ぎておりますため、再度ご連絡いたしました。\nご対応のほどよろしくお願いいたします。"},
    thanks:{subject:"【御礼】資料ご提出ありがとうございました", body:"お世話になっております。\n\n標記の件につきまして、ご提出いただきありがとうございました。\n確かに受領いたしました。"}
  };
  function fillMailTemplate(){
    const t = MAIL_TEMPLATES[$("#mailTemplate").value];
    $("#mailSubject").value = t.subject;
    $("#mailBody").value = `${t.body}\n\n${state.mail.signature || ""}`;
  }
  $("#mailTemplate").addEventListener("change", fillMailTemplate);
  $("#mailSettingForm").addEventListener("submit", e => {
    e.preventDefault();
    state.mail.senderName = $("#senderName").value.trim();
    state.mail.signature = $("#signature").value;
    save(); fillMailTemplate(); toast("メール設定を保存しました");
  });
  $("#makeMailDraft").addEventListener("click",()=>{
    const to = $("#mailTo").value.trim();
    const subject = $("#mailSubject").value;
    const body = $("#mailBody").value;
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  });
  $("#saveMailLog").addEventListener("click",()=>{
    const to = $("#mailTo").value.trim();
    if(!to){ toast("宛先を入力してください"); return; }
    state.mailLogs.unshift({id:Date.now(),to,subject:$("#mailSubject").value,date:new Date().toLocaleString("ja-JP")});
    save(); renderMailLogs(); toast("送信履歴に登録しました");
  });
  function renderMailLogs(){
    const logs = state.mailLogs.slice(0,5);
    $("#mailLog").innerHTML = logs.length ? `<h3>最近の履歴</h3>` + logs.map(x=>`<div class="stack-item"><b>${escapeHtml(x.subject)}</b><small>${escapeHtml(x.to)} ・ ${escapeHtml(x.date)}</small></div>`).join("") : "";
  }

  const trend = [
    {m:"4月",v:74},{m:"5月",v:78},{m:"6月",v:80},{m:"7月",v:81.2},{m:"8月",v:82.4}
  ];
  function renderChart(){
    const max = 100;
    $("#barChart").innerHTML = trend.map(x=>`<div class="bar-item"><div class="bar" style="height:${Math.max(12,x.v/max*100)}%"></div><small>${x.m}<br>${x.v}%</small></div>`).join("");
  }
  $("#refreshDashboard").addEventListener("click",()=> toast($("#dashboardMonth").value + " の集計結果を表示しました"));

  function runSimulation(){
    const curHits = Number($("#currentHits").textContent);
    const curTotal = Number($("#currentTotal").textContent);
    const addHits = Number($("#simAddHits").value) || 0;
    const addTotal = Number($("#simAddTotal").value) || 0;
    const threshold = Number($("#simThreshold").value) || 0;
    const hits = Math.max(0, curHits + addHits);
    const total = Math.max(1, curTotal + addTotal);
    const rate = Math.min(100, hits / total * 100);
    const current = curHits / curTotal * 100;
    $("#simRate").textContent = rate.toFixed(1);
    const j = $("#simJudgement");
    const ok = rate >= threshold;
    j.textContent = ok ? "基準達成" : "基準未達";
    j.className = "judgement " + (ok ? "ok" : "ng");
    const diff = rate-current;
    $("#simDiff").textContent = `現在より ${diff>=0?"+":""}${diff.toFixed(1)}pt`;
  }
  $("#runSimulation").addEventListener("click",runSimulation);

  $("#csvFile").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if(!file) return;
    const text = await file.text();
    const lines = text.replace(/\r/g,"").split("\n").filter(Boolean).slice(0,11);
    const rows = lines.map(parseCSVLine);
    if(!rows.length) return;
    const head = rows[0], body = rows.slice(1);
    $("#csvPreview thead").innerHTML = `<tr>${head.map(x=>`<th>${escapeHtml(x)}</th>`).join("")}</tr>`;
    $("#csvPreview tbody").innerHTML = body.map(r=>`<tr>${head.map((_,i)=>`<td>${escapeHtml(r[i]??"")}</td>`).join("")}</tr>`).join("");
    $("#csvMeta").textContent = `${file.name} ・ プレビュー ${body.length}行`;
    toast("CSVを読み込みました");
  });
  function parseCSVLine(line){
    const out=[]; let cur="", q=false;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(c === '"'){
        if(q && line[i+1] === '"'){cur+='"';i++;}
        else q=!q;
      } else if(c === "," && !q){ out.push(cur); cur=""; }
      else cur+=c;
    }
    out.push(cur); return out;
  }

  $$("[data-demo]").forEach(b=>b.addEventListener("click",()=>toast(`${b.dataset.demo}は次版で詳細機能を追加します`)));

  function download(name, content, type="application/json"){
    const blob = new Blob([content], {type});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function exportBackup(){
    download(`orbia-backup-${todayISO()}.json`, JSON.stringify(state,null,2));
    toast("バックアップを書き出しました");
  }
  $("#backupBtn").addEventListener("click", exportBackup);
  $("#exportBtn").addEventListener("click", exportBackup);
  $("#restoreFile").addEventListener("change", async e => {
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const obj=JSON.parse(await f.text());
      state={...deepClone(DEFAULT),...obj}; save(); renderAll(); toast("バックアップを復元しました");
    }catch{ toast("JSONを読み込めませんでした"); }
  });
  $("#resetBtn").addEventListener("click",()=>{
    if(confirm("Orbiaの試作データを初期状態に戻しますか？")){
      state=deepClone(DEFAULT); save(); renderAll(); toast("初期状態へ戻しました");
    }
  });

  function renderAll(){
    syncRole(); renderHome(); renderCalendar(); renderTodos(); renderMailLogs(); renderChart(); fillMailTemplate(); runSimulation();
  }
  renderAll();
})();