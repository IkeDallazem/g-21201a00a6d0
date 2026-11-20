// split original.html -> data/*.json + shell
const fs=require('fs'),path=require('path');const {parse}=require('./lib.js');
const W=__dirname;const p=parse(path.join(W,'original.html'));
fs.mkdirSync(path.join(W,'data/big'),{recursive:true});
fs.writeFileSync(path.join(W,'shell-head.html'),p.head);fs.writeFileSync(path.join(W,'shell-tail.html'),p.tail);
const d=p.data;const BIG=12000;
const core=d.filter(x=>x.kind!=='card');
fs.writeFileSync(path.join(W,'data/_core.json'),JSON.stringify(core,null,1));
for(const s of d.filter(x=>x.kind==='section')){
  const cards=d.filter(x=>x.kind==='card'&&x.sec===s.id).map(c=>{
    if(JSON.stringify(c).length<BIG && !/^cartas-/.test(c.id)) return c;
    fs.writeFileSync(path.join(W,'data/big',c.id+'.json'),JSON.stringify(c,null,1));
    const stub={kind:'card',id:c.id,$big:true,sec:c.sec,tipo:c.tipo,conf:c.conf,ch:c.ch,title:c.title,sum:c.sum,src:c.src,kw:c.kw,added:c.added,en:{title:c.en.title,sum:c.en.sum,kw:c.en.kw}};
    stub.$info={sizeKB:Math.round(JSON.stringify(c).length/1024),checkItems:c.check?c.check.length:0,checkTitles:c.check?c.check.slice(0,14).map(i=>i.id+': '+i.t.replace(/ · \[.*$/,'').slice(0,90)):undefined,bodyStart:(c.body||'').replace(/!\[[^\]]*\]\([^)]*\)\s*/g,'').slice(0,700),tableCols:c.table?c.table.cols:undefined,tableRows:c.table?c.table.rows.length:undefined};
    return stub;
  });
  fs.writeFileSync(path.join(W,'data',s.id+'.json'),JSON.stringify(cards,null,1));
}
console.log('split ok');
