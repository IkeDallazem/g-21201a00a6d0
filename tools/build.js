// data/*.json -> out index.html ; usage: node build.js <out.html>
const fs=require('fs'),path=require('path');const W=__dirname;
exports.assemble=function(){
  const core=JSON.parse(fs.readFileSync(path.join(W,'data/_core.json'),'utf8'));
  const out=[];const pre=core.filter(x=>['meta','section','stage','fuga'].includes(x.kind)),post=core.filter(x=>['term','change'].includes(x.kind));
  out.push(...pre);
  const seen=new Set();
  const files=fs.readdirSync(path.join(W,'data')).filter(f=>f.endsWith('.json')&&f!=='_core.json');
  const bySec={};
  for(const f of files){for(const c of JSON.parse(fs.readFileSync(path.join(W,'data',f),'utf8'))){
    let card=c;
    if(c.$big){const big=JSON.parse(fs.readFileSync(path.join(W,'data/big',c.id+'.json'),'utf8'));card=Object.assign({},big);
      for(const k of Object.keys(c)){if(k==='$big'||k==='$info')continue;if(k==='en')card.en=Object.assign({},big.en,c.en);else card[k]=c[k];}
      // keep key order sane
    }
    if(seen.has(card.id))throw new Error('dup id '+card.id);seen.add(card.id);
    (bySec[card.sec]=bySec[card.sec]||[]).push(card);
  }}
  for(const s of pre.filter(x=>x.kind==='section')){out.push(...(bySec[s.id]||[]));delete bySec[s.id];}
  if(Object.keys(bySec).length)throw new Error('cards in unknown sections: '+Object.keys(bySec));
  out.push(...post);return out;
};
if(require.main===module){
  const data=exports.assemble();
  const head=fs.readFileSync(path.join(W,'shell-head.html'),'utf8'),tail=fs.readFileSync(path.join(W,'shell-tail.html'),'utf8');
  const js='<script>window.__GUIA=[\n'+data.map(r=>JSON.stringify(r).replace(/<\/(script)/gi,'<\/$1').replace(/\u2028/g,'\u2028').replace(/\u2029/g,'\u2029')).join(',\n')+'\n]\n;</script>';
  fs.writeFileSync(process.argv[2],head+js+tail);console.log('built',process.argv[2],data.length,'records');
}
