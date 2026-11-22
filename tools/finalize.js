// After content merges: aliases for removed cards, link rewrite, meta/version/changelog.
const fs = require('fs'), path = require('path'); const W = __dirname, D = path.join(W, 'data');
const { parse } = require('./lib.js');
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8')), wr = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
const MERGED = { 'config-desempenho': 'inicio-status', 'inicio-fases': 'dinheiro-fases', 'dinheiro-trava': 'dinheiro-objetivos', 'roteiro-virada': 'dinheiro-reset', 'policia-assalto': 'dinheiro-rotina-roubo', 'compras-ordem': 'compras-prioridade', 'compras-evitar': 'compras-prioridade', 'policia-por-nivel': 'policia-fuga-rotina', 'policia-erros': 'policia-fuga-rotina', 'policia-gatilhos': 'policia-evitar', 'policia-forcas': 'policia-escala', 'compras-ammunation': 'armas-personalizar', 'missoes-perdiveis': 'perdiveis-lista', 'perdiveis-100': 'colecao-100', 'dinheiro-metas': 'colecao-100', 'armas-numeros': 'colecao-100', 'mundo-mergulho': 'colecao-kenton', 'inicio-leonida': 'mundo-leonida', 'veteranos-dicas': 'veteranos-habitos', 'config-nao-existe': 'dinheiro-nao-existe', 'fontes-pesquisas': 'fontes-principais' };
const SECS = { configuracoes: 'inicio', compras: 'dinheiro', missoes: 'roteiro' };
const files = [path.join(D, '_core.json'), ...fs.readdirSync(D).filter(f => f.endsWith('.json') && f !== '_core.json').map(f => path.join(D, f)), ...fs.readdirSync(path.join(D, 'big')).map(f => path.join(D, 'big', f))];
const ids = new Set(); for (const f of files.slice(1)) { const j = rd(f); for (const c of Array.isArray(j) ? j : [j]) ids.add(c.id); }
const alias = {}; for (const [a, b] of Object.entries(MERGED)) if (!ids.has(a)) alias[a] = b;
const pending = Object.keys(MERGED).filter(a => ids.has(a)); if (pending.length) console.log('NOT merged yet:', pending.join(', '));
const map = Object.assign({}, alias, SECS); let n = 0;
for (const f of files) { const s = fs.readFileSync(f, 'utf8'); const t = s.replace(/\[\[([a-z0-9-]+)(\||\]\])/g, (m, id, e) => map[id] ? (n++, '[[' + map[id] + e) : m); if (t !== s) fs.writeFileSync(f, t); }
console.log('links rewritten', n);
const core = rd(files[0]); const meta = core.find(r => r.kind === 'meta');
meta.version = '3.0'; meta.updated = '2026-11-19'; meta.baseline = '2026-11-19';
meta.alias = Object.assign({}, SECS, alias);
const caf = path.join(W, 'checkalias.json'); meta.checkAlias = fs.existsSync(caf) ? rd(caf) : {};
const title = 'Guia reorganizado';
if (!core.some(r => r.kind === 'change' && r.title === title)) core.push({ kind: 'change', date: '2026-11-19', title,
  text: 'As 17 seções viraram 14, em quatro grupos (Agora, Como fazer, Completar, Consulta), com subgrupos dentro de cada uma. Resumo e lista de missões de cada capítulo ficam lado a lado. Compras entrou em Dinheiro, Configurações em Comece aqui, troféus e 100% numa seção só. 21 cards repetidos foram fundidos e as contradições entre cards, corrigidas. Os cards abrem fechados; toque para abrir. Seu progresso e seus favoritos foram mantidos.',
  en: { title: 'Guide reorganized', text: 'The 17 sections became 14, in four groups (Now, How to, Complete, Reference), with subgroups inside each. Each chapter\'s summary and mission list now sit side by side. Purchases moved into Money, Settings into Start here, trophies and 100% into one section. 21 duplicate cards were merged and contradictions between cards fixed. Cards start collapsed; tap to open. Your progress and bookmarks were kept.' } });
wr(files[0], core);
// leftover internal markers
for (const f of files.slice(1)) { const j = rd(f); let ch = false; for (const c of Array.isArray(j) ? j : [j]) if (c.$mergeInto && !MERGED[c.id]) { delete c.$mergeInto; ch = true; } if (ch) wr(f, j); }
console.log('aliases', Object.keys(alias).length);
