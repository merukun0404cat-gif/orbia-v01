(() => {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const WORK={
 planning:{
  label:"経営企画係長",
  categories:{
   "院内報告":["検査課","薬剤部"],
   "院外報告":["評価会資料報告","個別経営改善計画の進捗状況","経営改善報告","様式2","管理会計報告1","管理会計報告2"],
   "委員会":["クリニカルパス委員会","摂食嚥下サポート関係者会議"],
   "会議":["部長・医長会","評価会事前レク","毎週火曜日ミーティング"],
   "年次業務":["院長ミーティング","病院年報"],
   "その他業務":["病院機能評価"]
  }
 },
 billing:{
  label:"算定病歴係長",
  categories:{
   "報告":["病棟薬剤業務実施加算","給与係長へベースアップ","深夜加算の報告"],
   "委員会":["診療報酬委員会"],
   "検証":["施設基準検証（毎月）","人員配置（半年）","循環器検証（毎月）"],
   "算定チェック":["栄養（週2・月初）","がん患者","償還材料","特定薬剤","マススクリーニング","麻酔管理料"],
   "大型業務":["診療報酬改定","施設基準の届出"]
  }
 }
};
const D={
 role:"all",
 events:[
  {id:1,role:"planning",date:"2026-09-08",title:"毎週火曜日ミーティング",start:"09:00",end:"09:30",kind:"会議",memo:"",mail:{enabled:false}},
  {id:2,role:"planning",date:"2026-09-10",title:"評価会資料報告",start:"13:00",end:"14:00",kind:"報告",memo:"院長確認後に提出",mail:{enabled:true,to:"",timing:"3日前",template:"資料提出のお願い"}},
  {id:3,role:"billing",date:"2026-09-09",title:"施設基準検証",start:"10:00",end:"11:30",kind:"検証",memo:"",mail:{enabled:false}},
  {id:4,role:"billing",date:"2026-09-11",title:"病棟薬剤業務実施加算 報告",start:"15:00",end:"16:00",kind:"報告",memo:"",mail:{enabled:false}}
 ],
 todos:[
  {id:11,role:"planning",title:"評価会資料：院長確認",due:"2026-09-10",priority:"高",kind:"院外報告",progress:"データ集計済み",next:"院長確認後、本部へ提出",done:false},
  {id:12,role:"billing",title:"施設基準検証：医師配置確認",due:"2026-09-09",priority:"高",kind:"施設基準",progress:"看護配置まで確認済み",next:"医師勤務実績を確認",done:false},
  {id:13,role:"planning",title:"薬剤部 院内報告",due:"2026-09-15",priority:"中",kind:"院内報告",progress:"データ待ち",next:"薬剤部回答後に集計",done:false},
  {id:14,role:"billing",title:"栄養 算定チェック",due:"2026-09-08",priority:"中",kind:"算定チェック",progress:"今週1回目完了",next:"金曜日に2回目確認",done:false}
 ],
 manuals:[
  {id:1,role:"billing",title:"施設基準検証",summary:"毎月、届出済施設基準について実績・人員配置等を確認する。",steps:["対象月の実績データを取得","人員配置データを更新","各基準値と照合","要注意・未達項目を確認","必要に応じて届出変更を検討"],files:"SharePoint ＞ 算定病歴 ＞ 施設基準",contact:"必要に応じて担当部署へ照会"},
  {id:2,role:"planning",title:"評価会資料報告",summary:"評価会で使用する病院経営・統計資料を作成し報告する。",steps:["必要データを取り込む","集計結果を確認","登録様式で資料作成","プレビュー確認","院長確認後に提出"],files:"SharePoint ＞ 経営企画 ＞ 評価会",contact:"経営企画担当"}
 ],
 inquiries:[
  {id:1,role:"billing",title:"深夜加算の取扱い",kind:"診療報酬",question:"深夜帯の対象範囲について確認が必要となった。",person:"本部担当者（サンプル）",answer:"サンプル回答：正式な院内記録に置き換えてください。",future:"次回以降は確認済みの判定ルールで集計する。",related:"深夜加算の報告",date:"2026-09-01"},
  {id:2,role:"planning",title:"様式2の提出データ範囲",kind:"院外報告",question:"どの期間のデータを使用するか確認。",person:"提出先担当者（サンプル）",answer:"サンプル回答：実際の回答内容に置き換えてください。",future:"次回報告時の業務マニュアルへ反映。",related:"様式2",date:"2026-09-03"}
 ],
 external:{email:"",allowLeave:true,allowHandover:true,allowTodo:true}
};
const clone=x=>JSON.parse(JSON.stringify(x)); let state=(()=>{try{return {...clone(D),...JSON.parse(localStorage.getItem("orbia-v03")||"{}")}}catch{return clone(D)}})();
const save=()=>localStorage.setItem("orbia-v03",JSON.stringify(state));
let viewY=2026,viewM=8,selected="2026-09-07",workRole="planning",hTab="emergency";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(t){const e=$("#toast");e.textContent="🐾 "+t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1900)}
function show(v){$$(".view").forEach(x=>x.classList.toggle("active",x.id===v));$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.view===v));window.scrollTo({top:0,behavior:"smooth"})}
$$(".nav").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));$$("[data-jump]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.jump)));
function rLabel(r){return r==="planning"?"経営企画":"算定病歴"} function tag(r){return r==="planning"?"tag-planning":"tag-billing"} function pclass(p){return p==="高"?"p-high":p==="中"?"p-mid":"p-low"} function prank(p){return p==="高"?0:p==="中"?1:2}
$("#roleMode").addEventListener("change",e=>{state.role=e.target.value;save();renderHome();toast("表示を切り替えました")});
$$(".role-card").forEach(b=>b.addEventListener("click",()=>{$("#roleMode").value=b.dataset.role;state.role=b.dataset.role;save();renderHome();show("home")}));
function renderHome(){
 $("#roleMode").value=state.role||"all";
 const ev=state.events.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)).slice(0,8);
 $("#homeSchedule").innerHTML=ev.map(x=>`<div class="item"><div class="row"><b>${x.date.slice(5).replace("-","/")} ${esc(x.start)} ${esc(x.title)}</b><span class="role-tag ${tag(x.role)}">${rLabel(x.role)}</span></div><small>${esc(x.kind)}${x.mail?.enabled?" ・ ✉メール設定あり":""}</small></div>`).join("");
 const td=state.todos.filter(x=>!x.done).slice().sort((a,b)=>prank(a.priority)-prank(b.priority)||a.due.localeCompare(b.due)).slice(0,8);
 $("#homeTodo").innerHTML=td.map(x=>`<div class="item"><div class="row"><b>${esc(x.title)}</b><span class="status ${pclass(x.priority)}">${x.priority}</span></div><small>${rLabel(x.role)} ・ 期限 ${x.due} ・ ${esc(x.progress||"進捗未登録")}</small></div>`).join("");
 renderRoleDashboard();
}
function renderRoleDashboard(){
 const box=$("#roleDashboard"); const role=state.role;
 if(role==="planning"){
  box.innerHTML=`<div class="panel-head"><div><span class="eyebrow">PLANNING DASHBOARD</span><h2>経営企画係長｜病院経営・統計</h2></div><button class="linkbtn" data-open-work="planning">業務を見る</button></div>
  <div class="dash-cards"><div class="dash-card blue"><small>診療収益</small><b>¥512M</b><span>ダミー</span></div><div class="dash-card mintbg"><small>病床利用率</small><b>82.4%</b><span>前月比 +1.2pt</span></div><div class="dash-card lavbg"><small>新入院患者</small><b>438</b><span>人</span></div><div class="dash-card cream"><small>救急応需率</small><b>78.6%</b><span>実績</span></div></div><div class="note">数値はすべてUI確認用ダミーデータ。今後、院内Excelの集計結果へ置換します。</div>`;
 }else if(role==="billing"){
  box.innerHTML=`<div class="panel-head"><div><span class="eyebrow">BILLING DASHBOARD</span><h2>算定病歴係長｜施設基準・届出管理</h2></div><button class="linkbtn" data-open-work="billing">業務を見る</button></div>
  <div class="dash-cards"><div class="dash-card mintbg"><small>問題なし</small><b>32</b><span>項目</span></div><div class="dash-card cream"><small>要注意</small><b>5</b><span>項目</span></div><div class="dash-card pink"><small>対応必要</small><b>2</b><span>項目</span></div><div class="dash-card lavbg"><small>上位基準候補</small><b>3</b><span>項目</span></div></div><div class="note">施設基準検証結果を登録すると、基準値との差・要注意・上位基準取得可能性を判定する想定です。</div>`;
 }else{
  box.innerHTML=`<div class="panel-head"><div><span class="eyebrow">ALL WORK</span><h2>Orbia全体</h2></div></div><p>上の「経営企画係長」「算定病歴係長」を選ぶと、それぞれのダッシュボードへ切り替わります。</p>`;
 }
 $$("[data-open-work]",box).forEach(b=>b.addEventListener("click",()=>{workRole=b.dataset.openWork;renderWork();show("work")}));
}
function iso(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
function calRoles(){return $$(".calFilter:checked").map(x=>x.value)}
function renderCalendar(){
 $("#monthLabel").textContent=`${viewY}年 ${viewM+1}月`;const g=$("#calendarGrid");g.innerHTML="";const first=new Date(Date.UTC(viewY,viewM,1)).getUTCDay(),max=new Date(Date.UTC(viewY,viewM+1,0)).getUTCDate(),roles=calRoles(),showTodo=$("#showTodoCal").checked;
 for(let i=0;i<first;i++)g.appendChild(document.createElement("div"));
 for(let d=1;d<=max;d++){let date=iso(viewY,viewM,d),b=document.createElement("button");b.type="button";b.className="day"+(date===selected?" sel":"")+(date==="2026-09-07"?" today":"");let ev=state.events.filter(x=>x.date===date&&roles.includes(x.role));let td=showTodo?state.todos.filter(x=>!x.done&&x.due===date&&roles.includes(x.role)):[];b.innerHTML=`<b>${d}</b>`+ev.slice(0,2).map(x=>`<span class="ev ${x.role}">● ${esc(x.title)}</span>`).join("")+td.slice(0,2).map(x=>`<span class="ev todo">■ TODO ${esc(x.title)}</span>`).join("");b.addEventListener("click",()=>{selected=date;clearEventForm();renderCalendar()});g.appendChild(b)}
 const [y,m,d]=selected.split("-");$("#selectedDateText").textContent=`${Number(m)}月${Number(d)}日`;renderDayItems();
}
$$(".calFilter").forEach(x=>x.addEventListener("change",renderCalendar));$("#showTodoCal").addEventListener("change",renderCalendar);$("#prevMonth").addEventListener("click",()=>{if(--viewM<0){viewM=11;viewY--}renderCalendar()});$("#nextMonth").addEventListener("click",()=>{if(++viewM>11){viewM=0;viewY++}renderCalendar()});
function renderDayItems(){
 const roles=calRoles();let ev=state.events.filter(x=>x.date===selected&&roles.includes(x.role));let td=$("#showTodoCal").checked?state.todos.filter(x=>!x.done&&x.due===selected&&roles.includes(x.role)):[];
 $("#dayItems").innerHTML=ev.map(x=>`<div class="item"><div class="row"><b>${esc(x.start)} ${esc(x.title)}</b><span class="role-tag ${tag(x.role)}">${rLabel(x.role)}</span></div><small>${esc(x.kind)}${x.mail?.enabled?` ・ ✉ ${esc(x.mail.timing)}`:""}</small><div class="buttons"><button class="secondary editEvent" data-id="${x.id}">変更</button><button class="danger deleteEvent" data-id="${x.id}">削除</button></div></div>`).join("")+td.map(x=>`<div class="item"><div class="row"><b>TODO期限｜${esc(x.title)}</b><span class="status ${pclass(x.priority)}">${x.priority}</span></div><small>${rLabel(x.role)} ・ ${esc(x.progress||"")}</small></div>`).join("") || '<div class="item">予定・TODOはありません。</div>';
 $$(".editEvent",$("#dayItems")).forEach(b=>b.addEventListener("click",()=>editEvent(Number(b.dataset.id))));$$(".deleteEvent",$("#dayItems")).forEach(b=>b.addEventListener("click",()=>deleteEvent(Number(b.dataset.id))));
}
function editEvent(id){let x=state.events.find(e=>e.id===id);if(!x)return;$("#editingEventId").value=id;$("#eventFormTitle").textContent="予定を変更";$("#eventRole").value=x.role;$("#eventTitle").value=x.title;$("#eventStart").value=x.start;$("#eventEnd").value=x.end;$("#eventKind").value=x.kind;$("#eventMemo").value=x.memo||"";$("#eventMailEnabled").checked=!!x.mail?.enabled;$("#eventMailTo").value=x.mail?.to||"";$("#eventMailTiming").value=x.mail?.timing||"3日前";$("#eventMailTemplate").value=x.mail?.template||"資料提出のお願い";$("#cancelEdit").classList.remove("hidden")}
function clearEventForm(){$("#editingEventId").value="";$("#eventFormTitle").textContent="予定を登録";$("#eventForm").reset();$("#eventStart").value="09:00";$("#eventEnd").value="10:00";$("#cancelEdit").classList.add("hidden")}
$("#cancelEdit").addEventListener("click",clearEventForm);
$("#eventForm").addEventListener("submit",e=>{e.preventDefault();let id=Number($("#editingEventId").value),obj={role:$("#eventRole").value,date:selected,title:$("#eventTitle").value.trim(),start:$("#eventStart").value,end:$("#eventEnd").value,kind:$("#eventKind").value,memo:$("#eventMemo").value,mail:{enabled:$("#eventMailEnabled").checked,to:$("#eventMailTo").value,timing:$("#eventMailTiming").value,template:$("#eventMailTemplate").value}};if(!obj.title)return;if(id){Object.assign(state.events.find(x=>x.id===id),obj)}else state.events.push({id:Date.now(),...obj});save();clearEventForm();renderAll();toast(id?"予定を変更しました":"予定を登録しました")});
function deleteEvent(id){if(confirm("この予定を削除しますか？")){state.events=state.events.filter(x=>x.id!==id);save();renderAll();toast("予定を削除しました")}}
function renderTodo(){
 let f=$("#todoFilter").value,a=state.todos.slice().sort((a,b)=>Number(a.done)-Number(b.done)||prank(a.priority)-prank(b.priority)||a.due.localeCompare(b.due));if(f==="planning"||f==="billing")a=a.filter(x=>x.role===f);else if(f==="high")a=a.filter(x=>x.priority==="高");else if(f==="open")a=a.filter(x=>!x.done);
 const box=$("#todoList");box.innerHTML="";a.forEach(x=>{let d=document.createElement("div");d.className="item";let cb=document.createElement("input");cb.type="checkbox";cb.checked=x.done;cb.addEventListener("change",()=>{x.done=cb.checked;save();renderAll()});let content=document.createElement("div");content.innerHTML=`<div class="row"><b>${esc(x.title)}</b><span class="status ${pclass(x.priority)}">${x.priority}</span></div><small>${rLabel(x.role)} ・ ${esc(x.kind)} ・ 期限 ${x.due}</small><small>進捗：${esc(x.progress||"未登録")} ／ 次：${esc(x.next||"未登録")}</small>`;d.prepend(cb);d.append(content);box.append(d)})}
$("#todoFilter").addEventListener("change",renderTodo);$("#todoForm").addEventListener("submit",e=>{e.preventDefault();let t=$("#todoTitle").value.trim();if(!t)return;state.todos.push({id:Date.now(),role:$("#todoRole").value,title:t,due:$("#todoDue").value,priority:$("#todoPriority").value,kind:$("#todoKind").value,progress:$("#todoProgress").value,next:$("#todoNext").value,done:false});save();e.target.reset();renderAll();toast("TODOを追加しました。カレンダーにも反映されます")});
$$(".roleSwitch").forEach(b=>b.addEventListener("click",()=>{workRole=b.dataset.role;renderWork()}));
function renderWork(){
 $$(".roleSwitch").forEach(b=>b.classList.toggle("active",b.dataset.role===workRole));let data=WORK[workRole],html='<div class="category-grid">';
 for(const [cat,items] of Object.entries(data.categories)){html+=`<section class="category-card"><h3>${esc(cat)}</h3>${items.map(x=>`<button class="work-button" data-work="${esc(x)}" data-cat="${esc(cat)}"><span>${esc(x)}</span><span>›</span></button>`).join("")}</section>`}html+='</div>';$("#workContent").innerHTML=html;$$(".work-button").forEach(b=>b.addEventListener("click",()=>openWorkFlow(workRole,b.dataset.cat,b.dataset.work)));
}
function openWorkFlow(role,cat,name){
 let isBilling=role==="billing";openModal(`<span class="eyebrow">${rLabel(role)} / ${esc(cat)}</span><h2>${esc(name)}</h2>${isBilling?billingWorkflow(name):planningWorkflow(name)}`);
 $$("[data-action]",$("#modalBody")).forEach(b=>b.addEventListener("click",()=>workAction(b.dataset.action,name,role)));
}
function planningWorkflow(name){return `<div class="workflow"><div class="flow-step">📥<b>データ取込</b></div><div class="flow-step">📄<b>資料作成</b></div><div class="flow-step">👀<b>プレビュー</b></div><div class="flow-step">✅<b>保存・登録</b></div></div><div class="buttons"><button class="primary" data-action="import">データ取り込み</button><button class="primary" data-action="create">会議・報告資料作成</button><button class="secondary" data-action="manual">デスクトップで作成</button><button class="secondary" data-action="upload">あとで資料を登録</button></div><div id="workResult" class="preview-box">まだ処理していません。</div>`}
function billingWorkflow(name){return `<div class="workflow"><div class="flow-step">📥<b>検証結果登録</b></div><div class="flow-step">⚠<b>要注意判定</b></div><div class="flow-step">⭐<b>上位基準候補</b></div><div class="flow-step">📅<b>届出予定</b></div></div><div class="buttons"><button class="primary" data-action="verify">検証結果を登録</button><button class="secondary" data-action="notice">届出予定を登録</button></div><div id="workResult" class="preview-box">検証結果を登録すると判定イメージを表示します。</div>`}
function workAction(a,name,role){let r=$("#workResult");if(a==="import")r.innerHTML=`✅ 「${esc(name)}」用データを取り込む画面（β版ではダミー）。<br>本番ではSharePoint/Excelへ接続。`;if(a==="create")r.innerHTML=`<b>資料プレビュー</b><p>${esc(name)}｜2026年9月</p><div class="dash-cards"><div class="dash-card blue"><small>入院患者</small><b>1,284</b></div><div class="dash-card mintbg"><small>病床利用率</small><b>82.4%</b></div><div class="dash-card cream"><small>手術件数</small><b>312</b></div><div class="dash-card lavbg"><small>救急応需率</small><b>78.6%</b></div></div><div class="buttons"><button class="primary">ダウンロード（次版）</button><button class="secondary" data-action="errorDemo">エラー時を確認</button></div>`;if(a==="manual")r.innerHTML="🖥 デスクトップで作成中として記録しました。完成後「あとで資料を登録」から登録する想定です。";if(a==="upload")r.innerHTML="📎 完成済み資料を登録するアップロード画面を本番版で接続します。";if(a==="verify")r.innerHTML=`<b>検証結果（サンプル）</b><div class="item"><b>⚠ 要注意：基準値との差 0.7pt</b><small>3か月平均の推移を継続確認してください。</small></div><div class="item"><b>⭐ 上位基準取得の可能性あり</b><small>別項目で上位基準の条件に近づいています。</small></div><div class="note">β版ではサンプル判定。本番では施設基準マスタの条件式で判定します。</div>`;if(a==="notice"){state.events.push({id:Date.now(),role:"billing",date:"2026-09-30",title:name+" 届出確認",start:"09:00",end:"09:30",kind:"届出",memo:"",mail:{enabled:false}});save();renderAll();r.innerHTML="📅 9/30に届出確認予定を登録しました（サンプル）。"}if(a==="errorDemo")r.innerHTML=`<div class="error-box"><b>資料を作成できませんでした</b><p>原因：必要データが不足しています。</p><div class="buttons"><button class="primary">データを確認</button><button class="secondary">もう一度作成</button><button class="secondary">デスクトップで作成</button></div></div>`}
function openModal(html){$("#modalBody").innerHTML=html;$("#modal").classList.remove("hidden");$("#modal").setAttribute("aria-hidden","false")}$("#modalClose").addEventListener("click",()=>$("#modal").classList.add("hidden"));$("#modal").addEventListener("click",e=>{if(e.target===$("#modal"))$("#modal").classList.add("hidden")});
$$(".hTab").forEach(b=>b.addEventListener("click",()=>{hTab=b.dataset.h;renderHandover()}));
function renderHandover(){
 $$(".hTab").forEach(b=>b.classList.toggle("active",b.dataset.h===hTab));let box=$("#handoverContent");
 if(hTab==="emergency"){let a=state.todos.filter(x=>!x.done).sort((a,b)=>a.due.localeCompare(b.due));box.innerHTML=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">IF I AM ABSENT TODAY</span><h2>今すぐ必要な引継ぎ</h2></div></div><div class="list">${a.map(x=>`<div class="item urgent"><div class="row"><b>${esc(x.title)}</b><span class="role-tag ${tag(x.role)}">${rLabel(x.role)}</span></div><small>現在：${esc(x.progress||"未登録")}</small><small>次：${esc(x.next||"未登録")} ／ 期限 ${x.due}</small></div>`).join("")}</div></section>`}
 if(hTab==="progress"){box.innerHTML=`<section class="panel"><h2>現在進捗</h2><table class="progress-table"><thead><tr><th>担当</th><th>業務</th><th>現在</th><th>次</th><th>期限</th></tr></thead><tbody>${state.todos.filter(x=>!x.done).map(x=>`<tr><td>${rLabel(x.role)}</td><td>${esc(x.title)}</td><td>${esc(x.progress||"未登録")}</td><td>${esc(x.next||"未登録")}</td><td>${x.due}</td></tr>`).join("")}</tbody></table></section>`}
 if(hTab==="manual"){box.innerHTML=`<div class="handover-grid">${state.manuals.map(m=>`<section class="manual-card"><span class="role-tag ${tag(m.role)}">${rLabel(m.role)}</span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><ol>${m.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><small>資料：${esc(m.files)}<br>照会先：${esc(m.contact)}</small></section>`).join("")}<section class="manual-card"><h3>＋ 新しい業務手順</h3><p>新規マニュアル登録フォームは次版で追加予定。</p></section></div>`}
 if(hTab==="document"){box.innerHTML=`<section class="panel"><div class="panel-head"><div><span class="eyebrow">LIVE HANDOVER DOCUMENT</span><h2>最新引継書</h2></div><button id="printHand" class="secondary">印刷</button></div><p>未完了：${state.todos.filter(x=>!x.done).length}件　｜　照会記録：${state.inquiries.length}件　｜　マニュアル：${state.manuals.length}件</p>${state.todos.filter(x=>!x.done).map((x,i)=>`<div class="item"><b>${i+1}. ${esc(x.title)}</b><small>${rLabel(x.role)}｜現在：${esc(x.progress||"未登録")}｜次：${esc(x.next||"未登録")}｜期限：${x.due}</small></div>`).join("")}</section>`;$("#printHand")?.addEventListener("click",()=>window.print())}
}
$("#inquirySearch").addEventListener("input",renderInquiry);
function renderInquiry(){
 let q=$("#inquirySearch").value.trim().toLowerCase(),a=q?state.inquiries.filter(x=>Object.values(x).join(" ").toLowerCase().includes(q)):[];let results=$("#inquiryResults");if(q&&!a.length)results.innerHTML=`<div class="empty-search"><img src="assets/orbia-cat-small.png"><b>Orbiaにはまだこの件の記録がないにゃ</b><p>新しい照会・調査として登録してください。</p></div>`;else results.innerHTML=a.map(k=>knowledgeHtml(k)).join("");
 $("#recentInquiry").innerHTML=state.inquiries.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(k=>knowledgeHtml(k)).join("")
}
function knowledgeHtml(k){return `<div class="item knowledge-card"><div class="row"><b>${esc(k.title)}</b><span class="role-tag ${tag(k.role)}">${rLabel(k.role)}</span></div><small>${esc(k.kind)} ・ ${esc(k.person)} ・ ${k.date}</small><div class="answer"><b>回答</b> ${esc(k.answer)}</div><small>今後：${esc(k.future)} ／ 関連：${esc(k.related)}</small></div>`}
$("#inquiryForm").addEventListener("submit",e=>{e.preventDefault();let t=$("#inqTitle").value.trim();if(!t)return;state.inquiries.unshift({id:Date.now(),role:$("#inqRole").value,title:t,kind:$("#inqKind").value,question:$("#inqQuestion").value,person:$("#inqPerson").value,answer:$("#inqAnswer").value,future:$("#inqFuture").value,related:$("#inqRelated").value,date:"2026-09-07"});save();e.target.reset();renderInquiry();toast("照会・調査を登録しました")});
$("#saveSettings").addEventListener("click",()=>{state.external={email:$("#externalEmail").value,allowLeave:$("#allowLeave").checked,allowHandover:$("#allowHandover").checked,allowTodo:$("#allowTodo").checked};save();toast("設定を保存しました")});
function loadSettings(){let x=state.external||{};$("#externalEmail").value=x.email||"";$("#allowLeave").checked=x.allowLeave!==false;$("#allowHandover").checked=x.allowHandover!==false;$("#allowTodo").checked=x.allowTodo!==false}
function download(name,text){let b=new Blob([text],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function backup(){download("orbia-v0.3-backup.json",JSON.stringify(state,null,2));toast("バックアップを書き出しました")}$("#backupTop").addEventListener("click",backup);$("#exportBtn").addEventListener("click",backup);$("#restoreFile").addEventListener("change",async e=>{try{state={...clone(D),...JSON.parse(await e.target.files[0].text())};save();renderAll();toast("復元しました")}catch{toast("復元できませんでした")}});$("#resetBtn").addEventListener("click",()=>{if(confirm("試作データを初期化しますか？")){state=clone(D);save();renderAll();toast("初期化しました")}});
function renderAll(){renderHome();renderCalendar();renderTodo();renderWork();renderHandover();renderInquiry();loadSettings()}
renderAll();
})();