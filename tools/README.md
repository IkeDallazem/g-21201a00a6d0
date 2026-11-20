# Ferramentas do guia

O `index.html` da raiz é gerado. A fonte dos dados é `tools/data/`:

- `data/_core.json`: meta, seções (com subgrupos), estágios, planejador de fuga, glossário e novidades.
- `data/<secao>.json`: os cards da seção, na ordem em que aparecem.
- `data/big/<id>.json`: corpo dos cards grandes (no arquivo da seção fica um stub com `$big`).

Fluxo, sem dependências além do Node:

```bash
cd tools
node patch-shell.js        # aplica os ajustes do app sobre shell-*.orig.html
node validate.js           # links, imagens, pt/en, checklists, aliases
node build.js ../index.html
node serve.js .. 8765      # http://127.0.0.1:8765
```

Ao apagar ou renomear um card, registre em `meta.alias`; ao mover item de checklist, em `meta.checkAlias` (o progresso salvo depende disso). `original.html` é a versão anterior à reorganização, usada pelo validador para conferir que nada se perdeu. `restructure.js` e `finalize.js` são os scripts únicos que fizeram a reorganização de 19/11/2026.
