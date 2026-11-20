const fs=require('fs'),path=require('path');const {assemble}=require('./build.js');const d=assemble();
const P=s=>String(s||'').replace(/!\[[^\]]*\]\([^)]*\)\s*/g,'').replace(/\n+/g,' ⏎ ');
let o='# Digest do guia (pt). Formato: id | seção | tipo/conf | ch | título — resumo, depois início do conteúdo.\n';
for(const s of d.filter(x=>x.kind==='section')){o+=`\n\n## SEÇÃO ${s.id} [grupo ${s.grp}] — ${s.title}\nIntro: ${s.intro}\n`;
 for(const c of d.filter(x=>x.kind==='card'&&x.sec===s.id)){const big=JSON.stringify(c).length>12000;
  o+=`\n### ${c.id} | ${c.tipo}/${c.conf} | ch=${c.ch.join(',')} | ${(JSON.stringify(c).length/1024).toFixed(0)}KB\nTÍTULO: ${c.title}\nRESUMO: ${c.sum}\n`;
  if(c.body)o+=`CORPO: ${P(c.body).slice(0,big?400:1100)}\n`;
  if(c.table)o+=`TABELA (${c.table.rows.length} linhas) colunas: ${c.table.cols.join(' | ')} ; linhas: ${c.table.rows.slice(0,big?2:6).map(r=>P(r.join(' / ')).slice(0,160)).join(' ;; ')}\n`;
  if(c.check)o+=`CHECKLIST (${c.check.length} itens): ${c.check.slice(0,big?6:12).map(i=>P(i.t).replace(/ · \[.*$/,'').slice(0,110)).join(' ;; ')}\n`;
  if(c.div)o+=`DIVERGÊNCIA: ${P(c.div).slice(0,300)}\n`;}}
o+='\n\n## ESTÁGIOS (painel "Onde você está")\n';for(const s of d.filter(x=>x.kind==='stage'))o+=`\n### stage ${s.id} — ${s.label}\nFAÇA AGORA: ${s.agora.map(i=>i.t).join(' ;; ')}\nLIBERA: ${s.libera.join(' ;; ')}\nEVITE: ${s.evite.join(' ;; ')}\nPRÓXIMO: ${s.proximo}\n`;
fs.writeFileSync(path.join(__dirname,'digest.md'),o);console.log('digest',o.length);
