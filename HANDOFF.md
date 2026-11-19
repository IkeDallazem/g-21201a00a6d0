# Handoff: reorganização do guia de GTA VI

Pedido do usuário: "o guia ficou muito confuso; reorganize e melhore".

## Qual versão é a mais recente

- `index.backup-2026-11-19.html` = o guia como estava na pasta local do usuário (1.992 linhas, dados embutidos em `window.__GUIA`, sem `guia.json`).
- `index.html` = o mesmo conteúdo com o app já ajustado (ver "Feito").
- Não comparei com o `main` do repositório (1.967 linhas + `guia.json`). Não sei qual das duas é mais nova: compare os dados antes de sobrescrever qualquer coisa.

## Diagnóstico

- 159 cards em 17 seções, lista plana, todos abertos. Coleções tinha 87.515 px de altura; Missões carregava 1.918 imagens de uma vez.
- Temas repetidos em seções diferentes (virada de ~30%, plano de dinheiro em fases, Ammu-Nation, perdíveis, "100%" em duas seções, fuga).
- Erros de dados: tags `ch` inválidas `cap1`/`cap2` em `inicio-dicas-ign` e `missoes-objetivos`; `fontes-pesquisas` sem `en.body`.

## Feito

1. Backup do original.
2. Ferramentas em `work/` (Node, sem dependências):
   - `split.js`: `original.html` -> `data/<secao>.json`, `data/big/<id>.json` (cards >12 KB e `cartas-*`; no arquivo da seção fica um stub com `$big` e `$info`), `data/_core.json`, `shell-head/tail.html`.
   - `build.js <saida.html>`: remonta. Campos do stub sobrescrevem o card grande (dá para mudar `sec`, `sub`, `title`, `ch` sem tocar no corpo).
   - `validate.js`: links `[[id]]`, imagens (defina `GUIA_IMG` = pasta que contém `img/`), paridade pt/en, tags, subgrupos, chaves de checklist preservadas, heurística de fatos perdidos. Linha de base: 5 erros (os de cima) e 6 falsos positivos em "fatos perdidos".
   - `patch-shell.js`: aplica as mudanças do app sobre `shell-*.orig.html`. Rodar de novo após editar.
   - `digest.js` -> `digest.md` (resumo de todos os cards). `serve.js <pasta> <porta>`: servidor estático.
3. App (já em `index.html`, testado em desktop e celular, sem erros no console):
   - Cards fechados por padrão; corpo e walkthroughs renderizados só ao abrir. Coleções: 3.697 px.
   - Contador de checklist no card fechado; "Abrir todos / Fechar todos"; preferência "Abrir todos os cards" (`state.expand`) no lugar de "Cards compactos".
   - Suporte a subgrupos: `section.subs = [{id, t, d?}]` (+ `section.en.subs = [{id, t}]`) e `card.sub`. Gera títulos, chips "Ir para" e trilho lateral agrupado. Âncora `#g-<secao>-<sub>`.
   - Suporte a renomear/fundir: `meta.alias = {idAntigo: idNovo}` (rotas e favoritos) e `meta.checkAlias = {"card:item": "card:item"}` (checklists marcados). Migração automática do estado salvo.
   - Filtro por "tipo" removido; bug do `title` dos pontos da navegação corrigido.

## Falta

1. Ler `audit/results.json` (8 de 9 auditorias; a de contradições transversais não terminou) e decidir a estrutura. Nada foi decidido ainda.
2. Minha intenção, não validada com o usuário: menos seções (fundir Configurações + Controles; separar "Troféus e perdíveis" de "Coleções e 100%"), 2 a 6 subgrupos por seção, um card como fonte única por tema e os outros reduzidos a 1 linha + link.
3. Aplicar por seção em `data/*.json` (pt e en), preservando ids de itens de checklist ou registrando em `meta.checkAlias`.
4. Corrigir as tags `cap1`/`cap2` e o `en.body` que falta.
5. Igualar `meta.baseline` a `meta.updated` (hoje quase todo card mostra o selo "Novo") e registrar a mudança em `change`.
6. `node validate.js` sem erros, `node build.js`, testar no navegador.

## Decisões do usuário

- Nenhuma sobre conteúdo. Pediu para pausar e continuar no ambiente em nuvem.
- Preferências dele (CLAUDE.md): respostas curtas e diretas, uma pergunta por vez, parágrafos de 2-3 frases, tabelas para comparações.
