const fs=require('fs');
exports.parse=function(file){
  const html=fs.readFileSync(file,'utf8');
  const a=html.indexOf('<script>window.__GUIA=[');
  const b=html.indexOf('</script>',a);
  const head=html.slice(0,a), tail=html.slice(b+'</script>'.length);
  let js=html.slice(a+'<script>window.__GUIA='.length,b).trim().replace(/;\s*$/,'');
  return {head,tail,data:JSON.parse(js),raw:html.slice(a,b)};
};
