"""
Atualiza JSON/publicacoes.json com os artigos dos docentes do PPGEB, buscados no OpenAlex.

- Docentes: todos de JSON/docentes.json que têm o campo "openalex_ids".
- Publicações: artigos e revisões em periódicos, de 2020 até o ano atual.
- Países: países de todos os coautores, exceto o Brasil (usados no mapa da página).
- Citações: número de citações de cada artigo segundo o OpenAlex (cited_by_count).

Uso (na raiz do projeto):
    macOS/Linux:  OPENALEX_API_KEY=SUA_CHAVE python3 scripts/atualizar_publicacoes.py
    Windows:      $env:OPENALEX_API_KEY="SUA_CHAVE"; python scripts/atualizar_publicacoes.py

Opções:
    --forcar   grava o arquivo mesmo se o número de publicações cair muito
               (por padrão, uma queda acima de 30% é tratada como erro do OpenAlex
               e o arquivo antigo é mantido).

Roda toda semana pela GitHub Action .github/workflows/publicacoes.yml.
Só usa a biblioteca padrão do Python.
"""
import datetime
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARQ_DOCENTES = RAIZ / "JSON" / "docentes.json"
ARQ_SAIDA = RAIZ / "JSON" / "publicacoes.json"

API = "https://api.openalex.org/works"
ANO_INICIAL = 2020
PAIS_SEDE = "BR"
MAX_AUTORES = 10        # autores mostrados antes de abreviar (docentes do PPGEB sempre aparecem)
QUEDA_MAXIMA = 0.30     # proteção contra respostas incompletas da API
FUSO_BRASILIA = datetime.timezone(datetime.timedelta(hours=-3))  # sem horário de verão desde 2019

CAMPOS = ",".join([
    "id", "doi", "title", "publication_year", "publication_date",
    "type", "primary_location", "authorships", "open_access", "cited_by_count",
])


def erro(msg):
    print(f"ERRO: {msg}", file=sys.stderr)
    sys.exit(1)


def requisitar(params, chave, tentativas=5):
    params = dict(params, api_key=chave)
    url = f"{API}?{urllib.parse.urlencode(params)}"
    for n in range(tentativas):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and n < tentativas - 1:
                time.sleep(2 ** n * 3)
                continue
            corpo = e.read().decode("utf-8", "replace")[:300]
            erro(f"OpenAlex respondeu HTTP {e.code}: {corpo}")
        except (urllib.error.URLError, TimeoutError) as e:
            if n < tentativas - 1:
                time.sleep(2 ** n * 3)
                continue
            erro(f"falha de conexão com o OpenAlex: {e}")


def carregar_docentes():
    dados = json.loads(ARQ_DOCENTES.read_text(encoding="utf-8"))
    mapa = {}
    for lista in dados.values():
        for d in lista:
            for oa_id in d.get("openalex_ids") or []:
                mapa[oa_id.strip().upper()] = d["id"]
    if not mapa:
        erro("nenhum docente com 'openalex_ids' em JSON/docentes.json")
    if len(mapa) > 50:
        erro("o OpenAlex aceita até 50 IDs por filtro; divida a consulta")
    return mapa


def limpar_texto(texto):
    texto = html.unescape(texto or "")
    texto = re.sub(r"<[^>]+>", "", texto)
    return re.sub(r"\s+", " ", texto).strip()


def id_curto(url):
    return (url or "").rsplit("/", 1)[-1]


def buscar_trabalhos(ids_autores, chave):
    ano_atual = datetime.date.today().year
    filtro = ",".join([
        "author.id:" + "|".join(ids_autores),
        f"publication_year:{ANO_INICIAL}-{ano_atual}",
        "type:article|review",
        "primary_location.source.type:journal",
        "is_retracted:false",
        "is_paratext:false",
    ])
    trabalhos, cursor = [], "*"
    while cursor:
        resp = requisitar({"filter": filtro, "per_page": 200, "cursor": cursor, "select": CAMPOS}, chave)
        trabalhos.extend(resp.get("results", []))
        cursor = resp.get("meta", {}).get("next_cursor")
        if not resp.get("results"):
            break
    return trabalhos


def converter(w, docentes_por_autor):
    autorias = w.get("authorships") or []
    docentes, paises, autores, extras = [], set(), [], []

    for i, a in enumerate(autorias):
        autor = a.get("author") or {}
        nome = limpar_texto(autor.get("display_name") or a.get("raw_author_name"))
        docente = docentes_por_autor.get(id_curto(autor.get("id")).upper())
        if docente and docente not in docentes:
            docentes.append(docente)

        codigos = set(a.get("countries") or [])
        if not codigos:
            codigos = {inst.get("country_code") for inst in a.get("institutions") or [] if inst.get("country_code")}
        paises.update(c.upper() for c in codigos if c)

        item = {"nome": nome}
        if docente:
            item["ppgeb"] = True
        if i < MAX_AUTORES:
            autores.append(item)
        elif docente:
            extras.append(item)

    fonte = ((w.get("primary_location") or {}).get("source") or {})
    doi = (w.get("doi") or "").replace("https://doi.org/", "")
    pub = {
        "id": id_curto(w.get("id")),
        "titulo": limpar_texto(w.get("title")),
        "ano": w.get("publication_year"),
        "data": w.get("publication_date"),
        "revista": limpar_texto(fonte.get("display_name")),
        "doi": doi or None,
        "acesso_aberto": bool((w.get("open_access") or {}).get("is_oa")),
        "citacoes": int(w.get("cited_by_count") or 0),
        "docentes": docentes,
        "autores": autores,
        "n_autores": len(autorias),
        "paises": sorted(paises - {PAIS_SEDE}),
    }
    if extras:
        pub["autores_ppgeb_extras"] = extras
    return pub


def deduplicar(pubs):
    vistos, saida = set(), []
    for p in pubs:
        chave = (p["doi"] or "").lower() or re.sub(r"\W+", "", p["titulo"].lower())
        if not chave or chave in vistos:
            continue
        vistos.add(chave)
        saida.append(p)
    return saida


def agora_brasilia():
    """Data e hora da execução do script, no horário de Brasília (ex.: 2026-11-25T14:32-03:00)."""
    return datetime.datetime.now(FUSO_BRASILIA).isoformat(timespec="minutes")


def gravar(pubs):
    linhas = ",\n".join("  " + json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in pubs)
    conteudo = (
        "{\n"
        f'"atualizado_em": "{agora_brasilia()}",\n'
        f'"fonte": "OpenAlex (openalex.org)",\n'
        f'"publicacoes": [\n{linhas}\n]\n'
        "}\n"
    )
    ARQ_SAIDA.write_text(conteudo, encoding="utf-8")


def main():
    chave = os.environ.get("OPENALEX_API_KEY", "").strip()
    if not chave:
        erro("defina a variável de ambiente OPENALEX_API_KEY")
    forcar = "--forcar" in sys.argv

    docentes_por_autor = carregar_docentes()
    print(f"Buscando artigos de {len(set(docentes_por_autor.values()))} docentes no OpenAlex...")

    trabalhos = buscar_trabalhos(list(docentes_por_autor), chave)
    pubs = deduplicar([converter(w, docentes_por_autor) for w in trabalhos])
    pubs = [p for p in pubs if p["titulo"] and p["ano"] and p["docentes"]]
    pubs.sort(key=lambda p: (p["data"] or "", p["titulo"]), reverse=True)

    if not pubs:
        erro("o OpenAlex não devolveu nenhuma publicação; arquivo mantido")

    anteriores = []
    if ARQ_SAIDA.exists():
        try:
            anteriores = json.loads(ARQ_SAIDA.read_text(encoding="utf-8")).get("publicacoes", [])
        except json.JSONDecodeError:
            anteriores = []

    if anteriores and pubs == anteriores:
        gravar(pubs)  # regrava só para registrar a data e hora desta execução
        print(f"Sem mudanças ({len(pubs)} publicações). Data e hora da atualização renovadas.")
        return

    if anteriores and len(pubs) < len(anteriores) * (1 - QUEDA_MAXIMA) and not forcar:
        erro(f"o número de publicações caiu de {len(anteriores)} para {len(pubs)}. "
             "Pode ser instabilidade do OpenAlex; arquivo mantido. Use --forcar para gravar mesmo assim.")

    gravar(pubs)
    paises = {c for p in pubs for c in p["paises"]}
    citacoes = sum(p["citacoes"] for p in pubs)
    print(f"Gravado JSON/publicacoes.json: {len(pubs)} publicações, {citacoes} citações, "
          f"{len(paises)} países de colaboração "
          f"(antes: {len(anteriores)} publicações).")


if __name__ == "__main__":
    main()
