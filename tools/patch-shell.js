// applies the v3 app changes on top of the pristine shell. Idempotent: always starts from *.orig.html
const fs=require('fs'),path=require('path');const W=__dirname;
let head=fs.readFileSync(path.join(W,'shell-head.orig.html'),'utf8'),tail=fs.readFileSync(path.join(W,'shell-tail.orig.html'),'utf8');
let n=0;
const rep=(which,a,b)=>{let s=which==='h'?head:tail;if(!s.includes(a))throw new Error('patch anchor not found: '+a.slice(0,90));s=s.replace(a,()=>b);if(which==='h')head=s;else tail=s;n++;};

/* ---------- CSS */
const CSS=`
/* ---------- v3: cards fechados por padrão, subgrupos e atalhos da seção */
.exp-btn{display:inline-grid}
.card.open .exp-btn svg{transform:rotate(180deg)}
.card:not(.open) .card-b,.card:not(.open) .card-f{display:none}
.card-titles{cursor:pointer}
.card:not(.open){padding-top:13px;padding-bottom:12px;box-shadow:none}
.card:not(.open):hover{border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.card:not(.open) .card-t{font-size:17.5px;margin-bottom:2px}
.card:not(.open) .card-sum{font-size:15px}
.card:not(.open) .card-meta{margin-bottom:3px}
.card:not(.open) [data-copy]{display:none}
.card.open{margin:6px 0}
.cards{gap:10px}
.chk-mini{font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink-2);padding:0 8px;border-radius:999px;background:var(--surface-2);line-height:1.6}
.chk-mini.full{background:color-mix(in srgb,var(--good) 18%,var(--surface-2));color:var(--good)}
.subg{margin:0 0 30px;scroll-margin-top:20px}
.subg:last-child{margin-bottom:0}
.sub-h{display:flex;align-items:baseline;gap:10px;font-family:var(--font-display);font-weight:800;font-size:27px;line-height:1.05;letter-spacing:.01em;margin:0 0 4px;padding-top:12px;border-top:2px solid var(--ink)}
.sub-h span{font-family:var(--font-body);font-size:13px;font-weight:700;color:var(--ink-2);letter-spacing:0}
.sub-d{margin:0 0 12px;color:var(--ink-2);font-size:15px;max-width:62ch}
.sub-h+.cards{margin-top:12px}
.f-row .chip.jump{background:var(--surface-2);border-color:transparent}
.f-row .chip.jump:hover{border-color:var(--accent)}
.f-row .lnk{border:0;background:none;padding:0 2px;color:var(--accent);font-weight:700;font-size:13px;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.rail h3{font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--accent);margin:14px 0 5px}
@media (max-width:959px){.subg{scroll-margin-top:118px}.sub-h{font-size:24px}}
`;
rep('h','</style>',CSS+'</style>');

/* ---------- i18n */
rep('t','hideSpoilers: "Esconder spoilers leves", compact: "Cards compactos",','hideSpoilers: "Esconder spoilers leves", compact: "Abrir todos os cards", jump: "Ir para", openAll: "Abrir todos", closeAll: "Fechar todos",');
rep('t','hideSpoilers: "Hide light spoilers", compact: "Compact cards",','hideSpoilers: "Hide light spoilers", compact: "Expand all cards", jump: "Jump to", openAll: "Open all", closeAll: "Close all",');

/* ---------- state: expand + migração de ids antigos */
rep('t','spoiler: true, compact: false, wl: "pt" });','spoiler: true, compact: false, expand: false, wl: "pt" });');
rep('t','compact: s.compact === true,','compact: s.compact === true,\n    expand: s.expand === true,');
rep('t','function commit() { state.t = Date.now(); lsSet(); scheduleCloud(); }',`function commit() { state.t = Date.now(); lsSet(); scheduleCloud(); }
const openSet = new Set();
function migrateState() {
  const a = META.alias || {}, ca = META.checkAlias || {};
  let ch = false;
  for (const k of Object.keys(state.checks)) {
    let nk = ca[k];
    if (!nk) { const i = k.lastIndexOf(":"), cid = k.slice(0, i); if (a[cid] && CARD[a[cid]]) nk = a[cid] + k.slice(i); }
    if (nk && nk !== k) { state.checks[nk] = true; delete state.checks[k]; ch = true; }
  }
  for (const k of Object.keys(state.favs)) if (a[k] && CARD[a[k]]) { state.favs[a[k]] = 1; delete state.favs[k]; ch = true; }
  if (ch) lsSet();
}`);
rep('t','  for (const s of STAGES) for (const it of s.agora) ALLKEYS.push("stage:" + s.id + ":" + it.id);\n}','  for (const s of STAGES) for (const it of s.agora) ALLKEYS.push("stage:" + s.id + ":" + it.id);\n  migrateState();\n}');
rep('t','state = normalizeState(rs);\n        lsSet();','state = normalizeState(rs);\n        migrateState();\n        lsSet();');

/* ---------- linkTerms aceita uma caixa só */
rep('t','for (const box of root.querySelectorAll(".card-b, .agora")) {','for (const box of (root.matches && root.matches(".card-b, .agora, .how-b") ? [root] : root.querySelectorAll(".card-b, .agora"))) {');

/* ---------- nav: bug do title (template dentro de aspas simples nunca interpolava) */
rep('t',`\${now ? '<span class="nav-dot" title="\${T("hasNow")}"></span>' : ""}`,'${now ? `<span class="nav-dot" title="${T("hasNow")}"></span>` : ""}');
rep('t',`\${dot ? '<span class="dot" title="\${T("yourMoment")}"></span>' : ""}`,'${dot ? `<span class="dot" title="${T("yourMoment")}"></span>` : ""}');

/* ---------- checklist: walkthrough sob demanda */
rep('t','<div class="how-b"><div class="wl-sw" role="group" aria-label="${T("wlLang")}"><button type="button" data-wl="pt" aria-pressed="${state.wl !== "en"}">PT</button><button type="button" data-wl="en" aria-pressed="${state.wl === "en"}">EN</button></div>${block(it.d)}</div></details>','<div class="how-b" data-lazy="1"></div></details>');
rep('t','function renderTable(c) {',`function fillHow(d) {
  const b = d.querySelector(".how-b");
  if (!b || !b.dataset.lazy) return;
  const k = d.dataset.how, i = k.lastIndexOf(":"), c = CARD[k.slice(0, i)];
  const it = c && c.check && c.check.find((x) => x.id === k.slice(i + 1));
  delete b.dataset.lazy;
  if (!it || !it.d) return;
  b.innerHTML = \`<div class="wl-sw" role="group" aria-label="\${T("wlLang")}"><button type="button" data-wl="pt" aria-pressed="\${state.wl !== "en"}">PT</button><button type="button" data-wl="en" aria-pressed="\${state.wl === "en"}">EN</button></div>\${block(it.d)}\`;
  linkTerms(b);
}
document.addEventListener("toggle", (e) => { const d = e.target; if (d && d.matches && d.matches("details.how") && d.open) fillHow(d); }, true);
function renderTable(c) {`);

/* ---------- card: fechado por padrão, corpo sob demanda */
rep('t','  const fav = !!state.favs[c.id];\n  const now = c.ch.includes(state.stage);','  const fav = !!state.favs[c.id];\n  const open = state.expand || openSet.has(c.id);\n  const now = c.ch.includes(state.stage);');
rep('t','let h = `<article class="card k-${c.tipo}${now ? " now" : ""}" id="${c.id}" data-id="${c.id}">`;','let h = `<article class="card k-${c.tipo}${now ? " now" : ""}${open ? " open" : ""}" id="${c.id}" data-id="${c.id}">`;');
rep('t','  if (isUpd) h += `<span class="badge-new">${T("updated")}</span>`;','  if (isUpd) h += `<span class="badge-new">${T("updated")}</span>`;\n  if (c.check) { const dn = c.check.filter((i) => state.checks[c.id + ":" + i.id]).length; h += `<span class="chk-mini${dn === c.check.length ? " full" : ""}">${dn}/${c.check.length}</span>`; }');
rep('t','data-exp="${c.id}" aria-expanded="false"','data-exp="${c.id}" aria-expanded="${open}"');
rep('t',`  h += \`</div></div><div class="card-b">\`;
  if (c.table) { h += renderTable(c); if (c.body) h += \`<div class="after">\${block(c.body)}</div>\`; }
  else if (c.body) h += block(c.body);
  if (c.check) h += renderChecklist(c.id, c.check);
  if (c.div) h += \`<div class="callout div"><svg class="i" aria-hidden="true"><use href="#i-scale"/></svg><div><strong>\${T("diverge")}</strong> \${inline(c.div)}</div></div>\`;
  h += \`</div>\`;`,`  h += \`</div></div><div class="card-b"\${open ? "" : ' data-lazy="1"'}>\${open ? cardBody(c) : ""}</div>\`;`);
rep('t','function renderFilters(cards) {',`function cardBody(c) {
  let h = "";
  if (c.table) { h += renderTable(c); if (c.body) h += \`<div class="after">\${block(c.body)}</div>\`; }
  else if (c.body) h += block(c.body);
  if (c.check) h += renderChecklist(c.id, c.check);
  if (c.div) h += \`<div class="callout div"><svg class="i" aria-hidden="true"><use href="#i-scale"/></svg><div><strong>\${T("diverge")}</strong> \${inline(c.div)}</div></div>\`;
  return h;
}
function setCardOpen(el, open) {
  if (!el) return;
  const id = el.dataset.id, c = CARD[id];
  if (open && c) {
    const b = el.querySelector(".card-b");
    if (b && b.dataset.lazy) { delete b.dataset.lazy; b.innerHTML = cardBody(c); linkTerms(b); }
    openSet.add(id);
  } else openSet.delete(id);
  el.classList.toggle("open", open);
  const x = el.querySelector(".exp-btn"); if (x) x.setAttribute("aria-expanded", String(open));
}
function renderFilters(cards, subs) {`);

/* ---------- filtros: sem linha de "tipo"; atalhos de subgrupo; abrir/fechar tudo */
rep('t','const showCh = chs.length >= 2, showTipo = tipos.length >= 2 && cards.length >= 5;','const showCh = chs.length >= 2, showTipo = false;');
rep('t','  h += `<div class="f-row"><span class="count" id="count"></span></div></div>`;\n  return h;','  if (subs && subs.length > 1) h += `<div class="f-row"><span class="f-lbl">${T("jump")}</span>${subs.map((sb) => `<a class="chip jump" href="#g-${cards[0].sec}-${sb.id}">${esc(sb.t)}</a>`).join("")}</div>`;\n  h += `<div class="f-row"><span class="count" id="count"></span>${state.expand ? "" : `<button type="button" class="lnk" data-openall="1">${T("openAll")}</button><button type="button" class="lnk" data-openall="0">${T("closeAll")}</button>`}</div></div>`;\n  return h;');
rep('t','const els = $$("#cards > .card");','const els = $$("#cards .card");');
rep('t','  const cnt = $("#count");','  for (const g of $$("#cards .subg")) g.hidden = !$$(".card", g).some((x) => !x.hidden);\n  const cnt = $("#count");');

/* ---------- rail agrupado */
rep('t','rail.innerHTML = `<h2>${T("inSection")}</h2>` + cards.map((c) => `<a href="#${c.id}" data-rail="${c.id}">${esc(c.title)}</a>`).join("");',`{
    const s = SECTION[current], subs = s && s.subs;
    let rh = \`<h2>\${T("inSection")}</h2>\`, last = null;
    for (const c of cards) {
      if (subs && c.sub !== last) { last = c.sub; const sb = subs.find((x) => x.id === c.sub); if (sb) rh += \`<h3>\${esc(sb.t)}</h3>\`; }
      rh += \`<a href="#\${c.id}" data-rail="\${c.id}">\${esc(c.title)}</a>\`;
    }
    rail.innerHTML = rh;
  }`);

/* ---------- view com subgrupos */
rep('t','    cards = CARDS.filter((c) => c.sec === id);\n    h += secHeader(s.grp, s.title, s.intro);','    cards = CARDS.filter((c) => c.sec === id);\n    const subs = s.subs && s.subs.length ? s.subs.filter((sb) => cards.some((c) => c.sub === sb.id)) : null;\n    if (subs) { const ord = new Map(subs.map((sb, i) => [sb.id, i])); cards = cards.map((c, i) => [c, i]).sort((x, y) => ((ord.has(x[0].sub) ? ord.get(x[0].sub) : 99) - (ord.has(y[0].sub) ? ord.get(y[0].sub) : 99)) || (x[1] - y[1])).map((x) => x[0]); }\n    h += secHeader(s.grp, s.title, s.intro);');
rep('t','    if (cards.length) h += renderFilters(cards) + `<div class="cards" id="cards">${cards.map(renderCard).join("")}</div>`;',`    if (cards.length && subs) {
      h += renderFilters(cards, subs) + \`<div id="cards">\`;
      for (const sb of subs) { const cs = cards.filter((c) => c.sub === sb.id); h += \`<section class="subg" id="g-\${id}-\${sb.id}"><h2 class="sub-h">\${esc(sb.t)}<span>\${cs.length}</span></h2>\${sb.d ? \`<p class="sub-d">\${inline(sb.d)}</p>\` : ""}<div class="cards">\${cs.map(renderCard).join("")}</div></section>\`; }
      const rest = cards.filter((c) => !subs.some((sb) => sb.id === c.sub));
      if (rest.length) h += \`<section class="subg"><div class="cards">\${rest.map(renderCard).join("")}</div></section>\`;
      h += \`</div>\`;
    } else if (cards.length) h += renderFilters(cards) + \`<div class="cards" id="cards">\${cards.map(renderCard).join("")}</div>\`;`);
rep('t','  current = id;\n  linkTerms(view);','  current = id;\n  for (const b of $$(".card.open > .card-b, .agora", view)) linkTerms(b);');

/* ---------- rota: alias + subgrupos + abrir card */
rep('t','  let sec = "inicio", target = null;\n  if (SECTION[id]','  let sec = "inicio", target = null;\n  if (META.alias && META.alias[id]) id = META.alias[id];\n  const gm = /^g-/.test(id) ? SECTIONS.find((s) => (s.subs || []).some((sb) => id === "g-" + s.id + "-" + sb.id)) : null;\n  if (gm) { sec = gm.id; target = id; }\n  else if (SECTION[id]');
rep('t','if (el.classList.contains("card")) { el.classList.add("open"); const b = $(".exp-btn", el); if (b) b.setAttribute("aria-expanded", "true"); }','if (el.classList.contains("card")) setCardOpen(el, true);');

/* ---------- prefs */
rep('t','html.classList.toggle("compact", state.compact);','html.classList.toggle("expand-all", state.expand);');
rep('t','$("#pref-compact").checked = state.compact;','$("#pref-compact").checked = state.expand;');
rep('t','if (t.id === "pref-compact") { state.compact = t.checked; commit(); applyPrefs(); return; }','if (t.id === "pref-compact") { state.expand = t.checked; commit(); applyPrefs(); rerender(); return; }');

/* ---------- progresso mini */
rep('t','  const r = $(".chk-reset", box);\n  if (r) r.hidden = !done;','  const r = $(".chk-reset", box);\n  if (r) r.hidden = !done;\n  const card = box.closest(".card"), mini = card && $(".chk-mini", card);\n  if (mini) { mini.textContent = `${done}/${ins.length}`; mini.classList.toggle("full", done === ins.length); }');

/* ---------- cliques */
rep('t','  if (ex) { const card = ex.closest(".card"); const open = card.classList.toggle("open"); ex.setAttribute("aria-expanded", String(open)); return; }',`  if (ex) { const card = ex.closest(".card"); setCardOpen(card, !card.classList.contains("open")); return; }
  const oa = t.closest("[data-openall]");
  if (oa) { const on = oa.dataset.openall === "1"; for (const el of $$("#cards .card")) if (!on || !el.hidden) setCardOpen(el, on); return; }
  const ct = t.closest(".card-titles");
  if (ct && !t.closest("a,button,.term,.spoil") && !String(window.getSelection ? window.getSelection() : "").trim()) { const card = ct.closest(".card"); setCardOpen(card, !card.classList.contains("open")); return; }`);

fs.writeFileSync(path.join(W,'shell-head.html'),head);fs.writeFileSync(path.join(W,'shell-tail.html'),tail);
console.log('shell patched:',n,'replacements');
