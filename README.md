# PPGEB – Site do Programa de Pós-Graduação em Engenharia Biomédica (UNIFESP/ICT)

Site estático (HTML, CSS e JavaScript puros), sem build e sem dependências.

Para testar localmente:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`. Os `fetch` não funcionam abrindo o arquivo direto (`file://`).

## Versão em inglês (i18n)

O site é um só: o português é a fonte principal e o inglês é uma camada por cima. O que não tem tradução aparece em português.

- O seletor **PT | EN** fica no header de todas as páginas e a escolha é lembrada (`localStorage`, chave `ppgeb_lang`).
- Link direto em inglês: `https://<site>/?lang=en` (e `?lang=pt` para voltar ao português).
- `JS/i18n.js` expõe `window.i18n` (`lang`, `ready`, `t`, `apply`, `setLang`, `fetchJSON`) e é o primeiro script de cada página.
- O dicionário dos textos fixos é `JSON/i18n/en.json` (objeto plano, chaves `pagina.secao.item`). Não existe `pt.json`.
- Conteúdo dinâmico traduzido fica em `JSON/en/<mesmo nome do JSON em PT>.json`, com a mesma estrutura do original. Hoje existem versões EN de `ementas.json`, `processo_seletivo_regulares_especiais.json` e `processo_seletivo_pos_doc.json`.
- A newsletter não tem versão em inglês (o header, o menu e o rodapé seguem o idioma escolhido).

### Como manter

- **Texto novo em HTML:** adicione `data-i18n="pagina.chave"` (ou `data-i18n-html` / `data-i18n-attr`) e a linha correspondente em `JSON/i18n/en.json`.
- **Texto novo em JS:** use `i18n.t('pagina.chave', 'Texto em PT')` e acrescente a chave em `JSON/i18n/en.json`.
- **Item novo no menu:** adicione o campo opcional `text_en` em `JSON/menu.json`.
- **Mudou um JSON de conteúdo que tem versão em `JSON/en/`:** atualize também a versão EN. Se esquecer, o site mostra a versão EN desatualizada. Na dúvida, apague o arquivo EN para cair no PT.
- **Nova disciplina em `ementas.json`:** na versão EN, traduza `ementa` e `area_concentracao` e inclua o campo opcional `nome` (título em inglês).
- Os JSONs em PT só podem receber campos novos e opcionais; não mude a estrutura deles.
- Use sempre os mesmos termos em inglês (ex.: Master's / PhD, Faculty, Admissions, Call for applications, Syllabus); nomes próprios, siglas e e-mails não são traduzidos.
