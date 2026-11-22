// usage: node validate.js  -> validates data/ against original.html
const fs=require('fs'),path=require('path');const W=__dirname;const {parse}=require('./lib.js');const {assemble}=require('./build.js');
const IMG=process.env.GUIA_IMG||path.join(W,".."); // pasta que contem img/
const orig=parse(path.join(W,'original.html')).data;let now;try{now=assemble()}catch(e){console.log('FATAL build: '+e.message);process.exit(1)}
const err=[],warn=[];const E=m=>err.push(m),Wn=m=>warn.push(m);
const cards=now.filter(x=>x.kind==='card'),secs=now.filter(x=>x.kind==='section'),stages=now.filter(x=>x.kind==='stage');
const meta=now.find(x=>x.kind==='meta')||{};const alias=meta.alias||{};const chkAlias=meta.checkAlias||{};
const CARD={},SEC={};for(const s of secs)SEC[s.id]=s;for(const c of cards){if(CARD[c.id])E('dup card id '+c.id);CARD[c.id]=c;}
const STG=new Set(stages.map(s=>s.id).concat('geral'));
const strs=(o,cb,p='')=>{if(typeof o==='string')cb(o,p);else if(Array.isArray(o))o.forEach((v,i)=>strs(v,cb,p+'['+i+']'));else if(o&&typeof o==='object')for(const k in o)strs(o[k],cb,p+'.'+k)};
const imgs=new Set(fs.readdirSync(path.join(IMG,'img')));
for(const r of now){strs(r,(s,p)=>{
  for(const m of s.matchAll(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g)){if(!CARD[m[1]]&&!SEC[m[1]])E(`broken link [[${m[1]}]] in ${r.id||r.kind}${p}`)}
  for(const m of s.matchAll(/!\[[^\]]*\]\(img\/([^\s)]+)\)/g)){if(!imgs.has(m[1]))E(`missing image ${m[1]} in ${r.id||r.kind}`)}
  if(/\[\[[^\]]*[A-Z_ ][^\]|]*(\||\]\])/.test(s)&&/\[\[[^a-z0-9-]/.test(s))Wn(`odd link syntax in ${r.id||r.kind}${p}`);
})}
for(const c of cards){
  if(!SEC[c.sec])E(`${c.id}: unknown sec ${c.sec}`);
  for(const k of ['tipo','conf','title','sum','src','kw','added','en'])if(c[k]==null)E(`${c.id}: missing ${k}`);
  if(!['dica','alerta','perdivel','plano','dado'].includes(c.tipo))E(`${c.id}: bad tipo ${c.tipo}`);
  if(!['oficial','jogo','previa','rumor','opiniao','div','inferencia'].includes(c.conf))E(`${c.id}: bad conf ${c.conf}`);
  if(!Array.isArray(c.ch)||!c.ch.length)E(`${c.id}: empty ch`);else for(const v of c.ch)if(!STG.has(v))E(`${c.id}: bad ch ${v}`);
  if(!c.body&&!c.table&&!c.check)E(`${c.id}: no content`);
  const s=SEC[c.sec];if(s&&s.subs){if(!c.sub)E(`${c.id}: missing sub (section ${c.sec} has subs)`);else if(!s.subs.some(x=>x.id===c.sub))E(`${c.id}: sub ${c.sub} not in section ${c.sec}`)}
  const en=c.en||{};
  if(!en.title||!en.sum)E(`${c.id}: en.title/sum missing`);
  if(!!c.body!==!!en.body)E(`${c.id}: body/en.body mismatch`);
  if(c.body&&en.body){const a=c.body.length,b=en.body.length;if(b<a*0.55||b>a*1.6)Wn(`${c.id}: en.body length ratio ${(b/a).toFixed(2)}`)}
  if(!!c.div!==!!en.div)E(`${c.id}: div/en.div mismatch`);
  if(c.table){if(!en.table)E(`${c.id}: en.table missing`);else{if(en.table.cols.length!==c.table.cols.length)E(`${c.id}: en.table cols differ`);if(en.table.rows.length!==c.table.rows.length)E(`${c.id}: en.table rows ${en.table.rows.length} vs ${c.table.rows.length}`);for(const t of [c.table,en.table])for(const r of t.rows)if(r.length!==t.cols.length)E(`${c.id}: table row width != cols`)}}
  if(c.check){const ids=c.check.map(i=>i.id);if(new Set(ids).size!==ids.length)E(`${c.id}: dup check ids`);if(!en.check)E(`${c.id}: en.check missing`);else{const e=en.check.map(i=>i.id);for(const i of ids)if(!e.includes(i))E(`${c.id}: en.check lacks ${i}`);for(const i of e)if(!ids.includes(i))E(`${c.id}: en.check extra ${i}`);for(const it of c.check){const ei=en.check.find(x=>x.id===it.id);if(ei&&!!it.d!==!!ei.d)E(`${c.id}:${it.id}: d/en.d mismatch`)}}}
}
for(const s of secs){if(!s.en||!s.en.title)E(`section ${s.id}: en missing`);if(s.subs){for(const x of s.subs){if(!x.id||!x.t||!(s.en.subs||[]).some(y=>y.id===x.id&&y.t))E(`section ${s.id}: bad sub ${JSON.stringify(x)}`);if(!cards.some(c=>c.sec===s.id&&c.sub===x.id))Wn(`section ${s.id}: sub ${x.id} empty`)}}
  if(s.id!=='glossario'&&!cards.some(c=>c.sec===s.id))E(`section ${s.id} has no cards`)}
// continuity with original
const ocards=orig.filter(x=>x.kind==='card');
for(const c of ocards){if(!CARD[c.id]){if(!alias[c.id])E(`original card ${c.id} gone without alias`);else if(!CARD[alias[c.id]]&&!SEC[alias[c.id]])E(`alias ${c.id} -> ${alias[c.id]} unresolved`)}
  if(c.check)for(const it of c.check){const k=c.id+':'+it.id;const nk=chkAlias[k]||k;const [ci,ii]=[nk.slice(0,nk.lastIndexOf(':')),nk.slice(nk.lastIndexOf(':')+1)];if(!CARD[ci]||!CARD[ci].check||!CARD[ci].check.some(x=>x.id===ii))E(`check key lost: ${k}`)}}
for(const s of orig.filter(x=>x.kind==='section'))if(!SEC[s.id]&&!alias[s.id])E(`original section ${s.id} gone without alias`);
for(const s of orig.filter(x=>x.kind==='stage')){const n=stages.find(x=>x.id===s.id);if(!n)E('stage gone '+s.id);else for(const it of s.agora)if(!n.agora.some(x=>x.id===it.id)&&!chkAlias['stage:'+s.id+':'+it.id])E(`stage check lost stage:${s.id}:${it.id}`)}
// content-loss heuristic (pt): numbers and bold phrases of the original must survive somewhere
const corpus=l=>{let t='';for(const r of l)strs(l===orig?r:r,(s,p)=>{if(!/\.en\b/.test(p))t+='\n'+s});return t};
const N=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const newC=N(corpus(now));const lost=[];
for(const c of ocards){let t='';strs(c,(s,p)=>{if(!/^\.en\b/.test(p)&&!/^\.(kw|src|id|sec|added|tipo|conf)/.test(p))t+='\n'+s});
  const facts=new Set();for(const m of t.matchAll(/(?:US\$|R\$)\s?[\d.,]+(?:\s?(?:mil|milh[õo]es|milh[ãa]o))?|\b\d[\d.,]*\s?%|\*\*([^*]{4,60})\*\*|“([^”]{4,60})”/g))facts.add(m[0].replace(/^\*\*|\*\*$/g,'').replace(/[“”]/g,'').replace(/[.,:;]$/,''));
  const miss=[...facts].filter(f=>!newC.includes(N(f)));if(miss.length)lost.push(`${c.id}: ${miss.slice(0,12).join(' | ')}${miss.length>12?' …+'+(miss.length-12):''}`)}
console.log(`cards ${cards.length} (orig ${ocards.length}), sections ${secs.length}`);
console.log(`\nERRORS ${err.length}`);err.slice(0,150).forEach(e=>console.log('  E '+e));
console.log(`\nWARNINGS ${warn.length}`);warn.slice(0,60).forEach(e=>console.log('  W '+e));
console.log(`\nPOSSIBLY LOST FACTS (pt; numbers/bold/quoted from original not found anywhere in new data) ${lost.length} cards`);lost.slice(0,80).forEach(e=>console.log('  L '+e));
process.exit(err.length?1:0);
