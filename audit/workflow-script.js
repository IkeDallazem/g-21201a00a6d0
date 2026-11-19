export const meta = {
  name: 'audit-guia-gta6',
  description: 'Auditar o guia de GTA VI: sobreposições, contradições, ordem e agrupamento dos cards por seção',
  phases: [{ title: 'Auditoria', detail: 'um leitor por grupo de seções + dois leitores transversais' }],
}
const W = '<caminho absoluto da pasta work>'
const CONTEXT = `Contexto: um guia de fã de GTA VI (app de página única, em pt-BR com tradução en) ficou confuso para o dono, que tem TDAH e quer achar rápido "o que fazer agora". O guia tem 159 cards em 17 seções; hoje cada seção mostra todos os cards abertos numa lista plana (a seção "colecao" tem 87.000px de altura), e vários temas aparecem repetidos em seções diferentes.
Os dados foram separados em arquivos em ${W}/data/<secao>.json (array de cards; cards gigantes aparecem como stub com "$big":true e um "$info" resumindo o conteúdo — o conteúdo completo fica em ${W}/data/big/<id>.json, só abra se precisar). ${W}/data/_core.json tem meta, seções, estágios ("stage": painel "Onde você está"), o planejador de fuga ("fuga"), glossário ("term") e novidades. ${W}/digest.md é um resumo de TODOS os cards (150KB) — leia-o inteiro primeiro para conhecer o guia todo.
Campos do card: id, sec, tipo (dica|alerta|perdivel|plano|dado), conf (oficial|jogo|previa|rumor|opiniao), ch (estágios: pre,p,c1,c2,c3,c4,pos ou "geral"), title, sum, body (markdown leve; [[id]] ou [[id|rótulo]] linka outro card/seção), table, check (itens com id — o progresso do usuário é salvo por cardId:itemId), div (divergência entre fontes), src, kw, en (tradução).
NÃO edite nenhum arquivo. Só leia e reporte. Seja concreto: sempre cite ids de cards.`
const SCHEMA = {
  type: 'object',
  properties: {
    overlaps: { type: 'array', description: 'temas duplicados/sobrepostos entre cards (da mesma seção ou de seções diferentes)', items: { type: 'object', properties: {
      cards: { type: 'array', items: { type: 'string' } }, what: { type: 'string', description: 'o que está repetido' },
      recommendation: { type: 'string', description: 'ex.: fundir A em B; manter A como fonte única e reduzir B a 1 linha + link; mover A para a seção X' }, severity: { type: 'string', enum: ['alta', 'media', 'baixa'] } }, required: ['cards', 'what', 'recommendation', 'severity'] } },
    contradictions: { type: 'array', description: 'fatos/números que divergem entre cards sem estar sinalizados como divergência', items: { type: 'object', properties: {
      cards: { type: 'array', items: { type: 'string' } }, detail: { type: 'string' }, suggestion: { type: 'string' } }, required: ['cards', 'detail', 'suggestion'] } },
    misplaced: { type: 'array', description: 'cards na seção errada', items: { type: 'object', properties: { card: { type: 'string' }, moveTo: { type: 'string' }, why: { type: 'string' } }, required: ['card', 'moveTo', 'why'] } },
    sectionPlans: { type: 'array', description: 'para cada seção analisada: subgrupos propostos (2 a 6, nomes curtos de 1-3 palavras) com os cards em ordem de leitura (primeiro o que o jogador precisa FAZER, depois referência)', items: { type: 'object', properties: {
      section: { type: 'string' }, problems: { type: 'string', description: 'por que esta seção confunde hoje, em 1-3 frases' },
      subgroups: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, cards: { type: 'array', items: { type: 'string' } } }, required: ['name', 'cards'] } } }, required: ['section', 'problems', 'subgroups'] } },
    titleFixes: { type: 'array', description: 'títulos/resumos vagos, longos ou enganosos', items: { type: 'object', properties: { card: { type: 'string' }, problem: { type: 'string' }, newTitle: { type: 'string' }, newSum: { type: 'string' } }, required: ['card', 'problem'] } },
    splitOrTrim: { type: 'array', description: 'cards pequenos/médios longos demais ou que misturam assuntos (não inclua os walkthroughs gigantes)', items: { type: 'object', properties: { card: { type: 'string' }, suggestion: { type: 'string' } }, required: ['card', 'suggestion'] } },
    other: { type: 'array', items: { type: 'string' }, description: 'qualquer outro problema relevante de organização (tags ch erradas, links faltando, itens do painel de estágio que contradizem cards, etc.)' },
  },
  required: ['overlaps', 'contradictions', 'misplaced', 'sectionPlans', 'titleFixes', 'splitOrTrim', 'other'],
}
const GROUPS = [
  { key: 'comecar', secs: ['inicio', 'configuracoes', 'controles', 'roteiro'], extra: 'Olhe também os "stage" em _core.json: o painel "Onde você está" repete coisas dos cards de inicio/roteiro? Avalie se configuracoes+controles deveriam ser uma seção só e se "roteiro" duplica "missoes".' },
  { key: 'dinheiro', secs: ['dinheiro', 'compras'], extra: 'Avalie se "compras" deveria virar um subgrupo de "dinheiro" ou continuar separada; e a relação com inicio-fases, roteiro-virada, armas-silenciador, armas-gear-up.' },
  { key: 'policia', secs: ['policia'], extra: 'A seção tem também um planejador interativo "Fuga assistida" (registro "fuga" em _core.json). Vários cards (policia-fuga-rotina, policia-por-nivel, policia-taticas, policia-erros, policia-evitar, policia-assalto) parecem repetir o planejador e uns aos outros: diga exatamente o que fundir.' },
  { key: 'veiculos-armas', secs: ['veiculos', 'armas'], extra: 'Verifique sobreposição com compras-ammunation, compras-garagens, compras-scooter, dinheiro-receptadores, colecao-wyman.' },
  { key: 'pessoas-mundo', secs: ['personagens', 'mundo', 'veteranos'], extra: 'Verifique sobreposição de "veteranos" com os cards "o que não existe" (config-nao-existe, dinheiro-nao-existe), de mundo-eventos com missoes-strangers, de personagens-dupla com policia-dupla, de mundo-celular com o glossário.' },
  { key: 'completar', secs: ['missoes', 'perdiveis', 'colecao'], extra: 'Aqui o foco é ESTRUTURA, não o texto dos walkthroughs. Duas seções têm "100%" no título (perdiveis e colecao); há perdiveis-100 e colecao-100, missoes-perdiveis e perdiveis-lista. 18 cards "cartas-*" poluem a lista de colecao. Proponha a divisão ideal dessas 3 seções (pode propor renomear, fundir ou criar seção, ex.: separar "Troféus e perdíveis" de "100%: coleções").' },
  { key: 'referencia', secs: ['fontes', 'glossario'], extra: 'Leia os "term" (glossário), "stage", "change" e "meta" em _core.json. Verifique termos do glossário que duplicam cards inteiros, cards de fontes que poderiam ser fundidos, e itens dos estágios (agora/libera/evite) que contradizem ou repetem cards.' },
]
phase('Auditoria')
const perGroup = GROUPS.map(g => () => agent(`${CONTEXT}

Sua tarefa: auditar a(s) seção(ões) ${g.secs.join(', ')}. Leia ${W}/digest.md inteiro, depois leia por completo ${g.secs.map(s => `${W}/data/${s}.json`).join(', ')}.
${g.extra}
Reporte: sobreposições (inclusive com cards de OUTRAS seções), contradições de fatos/números, cards na seção errada, um plano de subgrupos+ordem para cada uma das suas seções (todos os cards da seção devem aparecer em algum subgrupo, a menos que você recomende fundi-lo/movê-lo — nesse caso diga em overlaps/misplaced), títulos a corrigir, cards a dividir/enxugar. Qualidade > quantidade: só reporte o que realmente atrapalha quem usa o guia.`, { label: `audit:${g.key}`, phase: 'Auditoria', schema: SCHEMA }))
const cross = [
  () => agent(`${CONTEXT}

Sua tarefa é TRANSVERSAL: achar TODAS as sobreposições de tema entre seções diferentes. Leia ${W}/digest.md inteiro com atenção. Para cada tema que aparece em 2+ cards de seções diferentes (ex.: a virada de ~30% e o dinheiro zerado; o plano de dinheiro em fases; Ammu-Nation; perdíveis; 100%; saves; Strangers & Freaks; fuga em dupla; "o que não existe"; Scooter Bros; garagens; receptadores; Key Cloner/Dye Pack Jammer; Perfil Criminal; cheats; edição Ultimate), abra os arquivos das seções envolvidas em ${W}/data/ para comparar o texto real e diga qual card deve ser a FONTE ÚNICA e o que os outros devem virar (fundir, encurtar para 1 linha + link, apagar). Também proponha, em sectionPlans, a arquitetura geral: quais seções devem existir (ids e títulos), em que grupos de navegação, pensando em quem pergunta "o que eu faço agora?" — hoje são 17 seções em 4 grupos (Começar, Estratégia, Completar, Referência). Em sectionPlans.subgroups liste os cards que ficariam em cada seção proposta (use o campo "section" com o id/título proposto).`, { label: 'audit:sobreposicoes', phase: 'Auditoria', schema: SCHEMA }),
  () => agent(`${CONTEXT}

Sua tarefa é TRANSVERSAL: achar CONTRADIÇÕES de fatos e números entre cards (pt), e entre os cards e os estágios/glossário. Leia ${W}/digest.md, depois leia por completo todos os arquivos pequenos de ${W}/data/*.json (não precisa abrir data/big). Procure: contagens que divergem (ex.: número de lojas Ammu-Nation, de armas/variantes, de receptadores, de bancos/cofres, de missões, de Strangers & Freaks, de coleções), preços diferentes para a mesma coisa, capítulo em que algo libera, nomes grafados de formas diferentes (Waink vs WAiNK etc.), conselhos opostos (ex.: usar ou não a poupança), tags ch inválidas ("cap1"), links [[...]] apontando para card errado. Para cada uma diga qual valor parece o correto (se o próprio guia já sinaliza a divergência num campo "div" ou no card fontes-divergencias, diga isso) e o que padronizar. Coloque tudo em "contradictions" e "other"; deixe os outros arrays vazios se não tiver nada.`, { label: 'audit:contradicoes', phase: 'Auditoria', schema: SCHEMA }),
]
const res = await parallel([...perGroup, ...cross])
const keys = [...GROUPS.map(g => g.key), 'sobreposicoes', 'contradicoes']
const out = {}
res.forEach((r, i) => { out[keys[i]] = r })
log(`auditorias concluídas: ${res.filter(Boolean).length}/${res.length}`)
return out
