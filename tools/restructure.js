// One-off: applies the v3 section architecture to data/*.json.
// Sections, subgroups, card order and moves live in PLAN below. Cards marked with "<" are
// duplicates queued to be merged into the card right before them ($mergeInto).
const fs = require('fs'), path = require('path'); const W = __dirname, D = path.join(W, 'data');
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8')), wr = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));

const cartas = ['cartas-los-santos-corkers', 'cartas-vice-city-flamingos', 'cartas-liberty-swingers', 'cartas-los-santos-panic', 'cartas-liberty-city-penetrators', 'cartas-vice-city-narcos', 'cartas-vice-city-manatees', 'cartas-los-santos-pounders', 'cartas-liberty-city-wrath', 'cartas-vice-city-club-de-futbol', 'cartas-b-a-m-backyard-wrestling', 'cartas-america-s-next-top-hooker', 'cartas-jack-of-hearts', 'cartas-delights', 'cartas-nine1nine', 'cartas-right-wing-america-s-hero', 'cartas-ed-universe', 'cartas-legends-of-ratface'];

// [id, grp, grpEn, icon, title, titleEn, intro, introEn, [[subId, t, tEn, [cards...]]...]]
const PLAN = [
  ['inicio', 'Agora', 'Now', 'star', 'Comece aqui', 'Start here',
    'O essencial antes e durante as primeiras horas, sem spoilers. O painel “Onde você está” diz o que fazer no seu capítulo; aqui ficam as regras, os ajustes e o que esperar.',
    'The essentials before and during your first hours, spoiler-free. The “Where you are” panel tells you what to do in your chapter; here you get the rules, the settings and what to expect.', [
      ['fazer', 'Faça primeiro', 'Do first', ['inicio-regras', 'config-tela-inicial', 'config-recomendada', 'inicio-primeira-sessao']],
      ['saber', 'Bom saber', 'Good to know', ['inicio-ritmo', 'inicio-dicas-ign']],
      ['jogo', 'Sobre o jogo', 'About the game', ['inicio-status', '<config-desempenho', 'compras-edicoes']]]],
  ['roteiro', 'Agora', 'Now', 'route', 'Capítulo a capítulo', 'Chapter by chapter',
    'Cada capítulo em dois cards: o resumo (o que libera e o que fazer antes de avançar) e a lista completa de missões para marcar, com o passo a passo. As listas de missões têm spoilers.',
    'Each chapter in two cards: the summary (what unlocks and what to do before moving on) and the full mission checklist with walkthroughs. Mission lists contain spoilers.', [
      ['c1', 'Prólogo e Cap. 1', 'Prologue and Ch. 1', ['roteiro-prologo', 'roteiro-cap1', 'missoes-cap1']],
      ['c2', 'Cap. 2', 'Ch. 2', ['roteiro-cap2', 'missoes-cap2']],
      ['c3', 'Cap. 3', 'Ch. 3', ['roteiro-cap3', 'missoes-cap3']],
      ['c45', 'Caps. 4 e 5', 'Chs. 4 and 5', ['roteiro-cap4', 'missoes-cap4', 'missoes-cap5']],
      ['pos', 'Pós-história', 'Post-story', ['roteiro-pos', 'perdiveis-cheats']],
      ['sf', 'Strangers & Freaks', 'Strangers & Freaks', ['missoes-strangers']],
      ['consulta', 'Consulta', 'Reference', ['missoes-como', 'missoes-objetivos', 'roteiro-desbloqueios']]]],
  ['dinheiro', 'Como fazer', 'How to', 'cash', 'Dinheiro e compras', 'Money and purchases',
    'Na ordem em que você precisa: o plano geral, como proteger o dinheiro na virada do Cap. 1, como roubar e vender, e no que gastar.',
    'In the order you need it: the overall plan, protecting your money at the Ch. 1 turning point, how to rob and sell, and what to spend on.', [
      ['plano', 'Plano geral', 'Overall plan', ['dinheiro-fases', '<inicio-fases', 'dinheiro-bolsos']],
      ['inicio', 'Caps. 1 e 2: proteger', 'Chs. 1 and 2: protect', ['dinheiro-objetivos', '<dinheiro-trava', 'dinheiro-reset', '<roteiro-virada', 'dinheiro-illegal-ops']],
      ['roubar', 'Roubar e vender', 'Rob and sell', ['dinheiro-rotina-roubo', '<policia-assalto', 'dinheiro-notas', 'dinheiro-cofres', 'dinheiro-alvos', 'dinheiro-receptadores']],
      ['gastar', 'Gastar', 'Spend', ['compras-prioridade', '<compras-ordem', '<compras-evitar']],
      ['ref', 'Referência', 'Reference', ['dinheiro-fontes']]]],
  ['policia', 'Como fazer', 'How to', 'siren', 'Polícia e fuga', 'Police and escape',
    'Primeiro o que fazer com as estrelas na tela, depois como ler o que a polícia sabe e como não ser visto. O planejador de fuga no topo do guia resume a rotina.',
    'First what to do with stars on screen, then how to read what the police know and how to stay unseen. The escape planner at the top of the guide sums up the routine.', [
      ['fugir', 'Fugir agora', 'Escape now', ['policia-fuga-rotina', '<policia-por-nivel', '<policia-erros', 'policia-taticas', 'policia-dupla']],
      ['ler', 'Ler a tela', 'Read the screen', ['policia-estrelas', 'policia-heat']],
      ['antes', 'Antes do crime', 'Before the crime', ['policia-evitar', '<policia-gatilhos']],
      ['errado', 'Se der errado', 'If it goes wrong', ['policia-preso']],
      ['ref', 'Referência', 'Reference', ['policia-escala', '<policia-forcas']]]],
  ['veiculos', 'Como fazer', 'How to', 'car', 'Veículos e garagens', 'Vehicles and garages',
    'No fluxo de uso: escanear e roubar, vender, ficar com um carro (registro, garagem, Scooter Bros), escolher o veículo certo e manter.',
    'In order of use: scan and steal, sell, keep a car (registration, garage, Scooter Bros), pick the right vehicle and maintain it.', [
      ['roubar', 'Roubar', 'Steal', ['veiculos-waink', 'veiculos-roubo', 'veiculos-rastreador']],
      ['vender', 'Vender', 'Sell', ['veiculos-venda', 'veiculos-randy']],
      ['ficar', 'Ficar com um carro', 'Keep a car', ['veiculos-registro', 'compras-garagens', 'compras-scooter', 'veiculos-patio']],
      ['escolher', 'Escolher', 'Choose', ['veiculos-pessoal', 'veiculos-situacao', 'veiculos-gratis']],
      ['manter', 'Manter', 'Maintain', ['veiculos-combustivel', 'veiculos-oficinas']]]],
  ['armas', 'Como fazer', 'How to', 'target', 'Armas', 'Weapons',
    'O que comprar no começo, o que você carrega e o que fica guardado, a Ammu-Nation e o combate. A tabela das armas únicas está em 100% e coleções.',
    'What to buy early, what you carry and what stays stored, Ammu-Nation and combat. The unique weapons table lives in 100% and collections.', [
      ['comeco', 'No começo', 'Early on', ['armas-gear-up', 'armas-silenciador', 'armas-loadout']],
      ['guardar', 'Carregar e guardar', 'Carry and store', ['armas-porte', 'armas-tipos', 'armas-guardar']],
      ['loja', 'Ammu-Nation', 'Ammu-Nation', ['armas-personalizar', '<compras-ammunation']],
      ['combate', 'Combate', 'Combat', ['armas-mira']],
      ['conseguir', 'Conseguir mais', 'Get more', ['armas-gratis', 'armas-categorias']]]],
  ['personagens', 'Como fazer', 'How to', 'users', 'Jason e Lucia', 'Jason and Lucia',
    'Troca de personagem e dupla, Perfil Criminal, relacionamento e atributos.',
    'Character switching and the duo, Criminal Profile, relationship and stats.', [
      ['troca', 'Troca e dupla', 'Switching and duo', ['personagens-troca', 'personagens-dupla', 'personagens-diferencas']],
      ['perfil', 'Perfil Criminal', 'Criminal Profile', ['policia-perfil']],
      ['relacao', 'Relacionamento', 'Relationship', ['personagens-casa', 'personagens-relacao']],
      ['corpo', 'Corpo e treino', 'Body and training', ['personagens-treino', 'personagens-atributos']]]],
  ['perdiveis', 'Completar', 'Complete', 'shield', 'Perdíveis e saves', 'Missables and saves',
    'O que some para sempre se você avançar a história, e o plano de saves que protege disso. Troféus e 100% ficam na seção seguinte.',
    'What is gone for good if you advance the story, and the save plan that protects you. Trophies and 100% are in the next section.', [
      ['nao', 'Não perca', 'Do not miss', ['perdiveis-lista', '<missoes-perdiveis', 'perdiveis-saves', 'perdiveis-tranquilo']],
      ['vale', 'Vale fazer no Cap. 1', 'Worth doing in Ch. 1', ['perdiveis-cap1']]]],
  ['colecao', 'Completar', 'Complete', 'trophy', '100%, troféus e coleções', '100%, trophies and collections',
    'Comece pelo índice do que conta para os 100%. Cada coleção é um card com checklist; abra só a que você está fazendo.',
    'Start with the index of what counts toward 100%. Each collection is a card with a checklist; open only the one you are working on.', [
      ['geral', 'Visão geral', 'Overview', ['colecao-100', '<perdiveis-100', '<dinheiro-metas', '<armas-numeros', 'colecao-desafios']],
      ['trofeus', 'Troféus', 'Trophies', ['perdiveis-trofeus-faceis', 'perdiveis-trofeus-planejar']],
      ['stunts', 'Stunts e voo', 'Stunts and flying', ['colecao-stunts', 'colecao-knife', 'colecao-base', 'colecao-drones']],
      ['mapa', 'Pelo mapa', 'Around the map', ['colecao-waink', 'colecao-cestas', 'colecao-exploracao', 'colecao-kenton', '<mundo-mergulho', 'mundo-pesca']],
      ['jogos', 'Jogos', 'Games', ['mundo-jogos']],
      ['cartas', 'Cartas', 'Cards', ['colecao-cartas', ...cartas]],
      ['itens', 'Armas e carros', 'Weapons and cars', ['armas-unicas', 'veiculos-categorias', 'colecao-wyman']]]],
  ['controles', 'Consulta', 'Reference', 'pad', 'Controles e HUD', 'Controls and HUD',
    'Botões, o que cada cor e ícone da tela quer dizer, e o celular. O botão PS/Xbox troca os ícones do guia inteiro.',
    'Buttons, what each color and icon on screen means, and the phone. The PS/Xbox button swaps icons across the guide.', [
      ['botoes', 'Botões', 'Buttons', ['controles-cola', 'controles-atalhos']],
      ['tela', 'Ler a tela', 'Read the screen', ['controles-hud', 'controles-mapa', 'mundo-celular']],
      ['extras', 'Extras', 'Extras', ['controles-foto']]]],
  ['mundo', 'Consulta', 'Reference', 'palm', 'Mundo e atividades', 'World and activities',
    'O mapa de Leonida, como se deslocar e o que há para fazer fora das missões.',
    'The map of Leonida, getting around and what there is to do outside missions.', [
      ['mapa', 'Andar pelo mapa', 'Getting around', ['mundo-leonida', '<inicio-leonida', 'mundo-deslocamento']],
      ['fazer', 'O que fazer', 'Things to do', ['mundo-atividades', 'mundo-eventos', 'mundo-fauna', 'mundo-npcs']]]],
  ['veteranos', 'Consulta', 'Reference', 'rewind', 'Vindo do GTA V', 'Coming from GTA V',
    'O que mudou, o que não existe mais e as referências para quem joga a série há tempos.',
    'What changed, what no longer exists and the references for long-time players.', [
      ['mudou', 'O que mudou', 'What changed', ['veteranos-habitos', '<veteranos-dicas', 'veteranos-comparacao']],
      ['falta', 'O que não existe', 'What does not exist', ['dinheiro-nao-existe', '<config-nao-existe']],
      ['extras', 'Curiosidades', 'Trivia', ['veteranos-easter']]]],
  ['glossario', 'Consulta', 'Reference', 'book', null, null, null, null, null],
  ['fontes', 'Consulta', 'Reference', 'shield', 'Fontes e confiabilidade', 'Sources and reliability',
    'Como ler os selos de confiança, onde as fontes discordam, o que ainda é rumor e de onde vem cada informação.',
    'How to read the confidence badges, where sources disagree, what is still rumor and where each piece of information comes from.', [
      ['ler', 'Como confiar', 'How to trust', ['fontes-selos', 'fontes-divergencias', 'fontes-abertas', 'inicio-rumores']],
      ['links', 'De onde vem', 'Where it comes from', ['fontes-principais', '<fontes-pesquisas', 'fontes-evitar']]]],
];

// ---- load everything
const core = rd(path.join(D, '_core.json'));
const all = {};
for (const f of fs.readdirSync(D).filter(f => f.endsWith('.json') && f !== '_core.json')) for (const c of rd(path.join(D, f))) all[c.id] = c;
const oldSecs = Object.fromEntries(core.filter(r => r.kind === 'section').map(s => [s.id, s]));
const used = new Set(), files = {}, newSecs = [];
for (const [id, grp, grpEn, icon, title, titleEn, intro, introEn, subs] of PLAN) {
  const o = oldSecs[id];
  const s = { kind: 'section', id, grp, icon, title: title || o.title, intro: intro || o.intro };
  if (subs) s.subs = subs.map(([sid, t]) => ({ id: sid, t }));
  s.en = { grp: grpEn, title: titleEn || o.en.title, intro: introEn || o.en.intro };
  if (subs) s.en.subs = subs.map(([sid, , tEn]) => ({ id: sid, t: tEn }));
  newSecs.push(s); files[id] = [];
  let prev = null;
  for (const [sid, , , cards] of subs || []) for (let cid of cards) {
    const merge = cid[0] === '<'; if (merge) cid = cid.slice(1);
    const c = all[cid]; if (!c) throw new Error('unknown card ' + cid); if (used.has(cid)) throw new Error('dup ' + cid); used.add(cid);
    const n = {}; for (const k of Object.keys(c)) { n[k] = c[k]; if (k === 'sec') { n.sec = id; n.sub = sid; } }
    if (merge) n.$mergeInto = prev; else { delete n.$mergeInto; prev = cid; }
    files[id].push(n);
  }
}
const left = Object.keys(all).filter(k => !used.has(k)); if (left.length) throw new Error('cards not placed: ' + left);

// ---- data fixes
const fixCh = c => { c.ch = [...new Set(c.ch.map(v => v === 'cap1' ? 'c1' : v === 'cap2' ? 'c2' : v))]; };
Object.values(files).flat().forEach(fixCh);
for (const f of fs.readdirSync(path.join(D, 'big'))) { const p = path.join(D, 'big', f), c = rd(p); fixCh(c); wr(p, c); }

// ---- restore per-location photos that exist in the published guia.json but were dropped locally
const pub = path.join(W, '..', 'guia.json');
if (fs.existsSync(pub)) {
  const P = Object.fromEntries(rd(pub).filter(r => r.kind === 'card').map(c => [c.id, c]));
  const imgs = s => (s || '').match(/!\[[^\]]*\]\(img\/[^)]+\)/g) || [];
  let n = 0;
  const patch = (c, p) => { for (const [L, R] of [[c.check, p.check], [c.en && c.en.check, p.en && p.en.check]]) { if (!L || !R) continue;
    for (const it of L) { const r = R.find(x => x.id === it.id); if (!r) continue; const add = imgs(r.d).filter(m => !(it.d || '').includes(m.slice(m.indexOf('(')))); if (add.length) { it.d = (it.d ? it.d.trim() + '\n\n' : '') + add.join('\n'); n += add.length; } } } };
  for (const id of ['colecao-waink', 'colecao-kenton']) { const bp = path.join(D, 'big', id + '.json'); if (fs.existsSync(bp)) { const c = rd(bp); patch(c, P[id]); wr(bp, c); } else { const c = Object.values(files).flat().find(x => x.id === id); patch(c, P[id]); } }
  console.log('restored image refs:', n);
}

// ---- write
const order = PLAN.map(p => p[0]);
const meta = core.find(r => r.kind === 'meta');
meta.alias = Object.assign({ configuracoes: 'inicio', compras: 'dinheiro', missoes: 'roteiro' }, meta.alias || {});
const rest = core.filter(r => r.kind !== 'section' && r.kind !== 'meta');
wr(path.join(D, '_core.json'), [meta, ...newSecs, ...rest.filter(r => ['stage', 'fuga'].includes(r.kind)), ...rest.filter(r => !['stage', 'fuga'].includes(r.kind))]);
for (const f of fs.readdirSync(D).filter(f => f.endsWith('.json') && f !== '_core.json')) fs.unlinkSync(path.join(D, f));
for (const id of order) wr(path.join(D, id + '.json'), files[id]);
console.log('sections', order.length, 'cards', used.size);
