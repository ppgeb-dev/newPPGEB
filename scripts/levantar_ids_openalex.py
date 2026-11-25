"""
Confere no OpenAlex o perfil de cada docente a partir do ORCID
e conta os artigos em periódicos (artigos + revisões) de 2020 em diante.

Uso (no terminal do VS Code, em qualquer pasta):
    macOS/Linux:
        OPENALEX_API_KEY=SUA_CHAVE python3 levantar_ids_openalex.py
    Windows (PowerShell):
        $env:OPENALEX_API_KEY="SUA_CHAVE"; python levantar_ids_openalex.py

Os ORCIDs dos 18 docentes do site já estão na lista DOCENTES abaixo.
Gera conferencia_openalex.csv. Não altera nenhum arquivo do site.
Só usa a biblioteca padrão do Python (não precisa instalar nada).
"""
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.openalex.org"
KEY = os.environ.get("OPENALEX_API_KEY", "").strip()
ANO_INICIAL = 2020

DOCENTES = [
    ("thiago_martini",   "Thiago Martini Pereira",             "0009-0007-1101-5354"),
    ("matheus_cardoso",  "Matheus Cardoso Moraes",             "0000-0002-6019-6653"),
    ("adenauer_casali",  "Adenauer Girardi Casali",            "0000-0001-7024-9029"),
    ("fabio_aoki",       "Fabio Gava Aoki",                    "0000-0003-3387-5121"),
    ("federico_aletti",  "Federico Aletti",                    "0000-0003-1472-837X"),
    ("henrique_amorim",  "Henrique Alves de Amorim",           "0000-0003-0611-1118"),
    ("henrique_paiva",   "Henrique Mohallem Paiva",            "0000-0001-7081-8383"),
    ("karina_casali",    "Karina Rabello Casali",              "0000-0001-8281-0135"),
    ("luiz_martins",     "Luiz Eduardo Galvão Martins",        "0000-0002-7266-5840"),
    ("nirton_cristi",    "Nirton Cristi Silva Vieira",         "0000-0003-2095-674X"),
    ("roberson_polli",   "Roberson Saraiva Polli",             "0000-0002-5046-1732"),
    ("tatiana_cunha",    "Tatiana de Sousa da Cunha Uchiyama", "0000-0001-9070-1414"),
    ("eugenia_mattos",   "Eugenia Casella Tavares de Mattos",  "0009-0007-3349-9310"),
    ("jean_faber",       "Jean Faber Ferreira de Abreu",       "0000-0002-2129-8251"),
    ("rossano_lang",     "Rossano Lang Carvalho",              "0000-0001-6499-4700"),
    ("vinicius_guzzoni", "Vinicius Guzzoni",                   "0000-0003-1024-5952"),
    ("fernanda_tenorio", "Fernanda Silva Tenório",             "0000-0003-1966-3384"),
    ("fernando_porto",   "Fernando Garcez Porto",              "0000-0002-4744-7454"),
]

if not KEY:
    sys.exit("Defina a variável OPENALEX_API_KEY com a sua chave do OpenAlex.")


def get(caminho, **params):
    params["api_key"] = KEY
    url = f"{BASE}{caminho}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def contar_artigos(author_id):
    filtro = (
        f"author.id:{author_id},"
        f"publication_year:{ANO_INICIAL}-{time.localtime().tm_year},"
        "type:article|review,"
        "primary_location.source.type:journal"
    )
    return get("/works", filter=filtro, per_page=1)["meta"]["count"]


linhas = []
print(f"{'Docente':<38} {'ORCID':<20} {'OpenAlex':<13} {'Artigos ' + str(ANO_INICIAL) + '+':>12}  Nome no OpenAlex | Instituição")
print("-" * 130)

for docente_id, nome, orcid in DOCENTES:
    linha = {"docente_id": docente_id, "docente_nome": nome, "orcid": orcid or "",
             "openalex_id": "", "nome_openalex": "", "instituicao_atual": "",
             "trabalhos_total": "", f"artigos_{ANO_INICIAL}_em_diante": "", "situacao": ""}

    if not orcid:
        linha["situacao"] = "sem ORCID"
    else:
        try:
            a = get(f"/authors/orcid:{orcid}",
                    select="id,display_name,works_count,last_known_institutions")
            oa_id = a["id"].rsplit("/", 1)[-1]
            linha.update({
                "openalex_id": oa_id,
                "nome_openalex": a["display_name"],
                "instituicao_atual": "; ".join(i.get("display_name", "") for i in a.get("last_known_institutions") or []),
                "trabalhos_total": a.get("works_count", 0),
                f"artigos_{ANO_INICIAL}_em_diante": contar_artigos(oa_id),
                "situacao": "ok",
            })
        except urllib.error.HTTPError as e:
            linha["situacao"] = "ORCID não encontrado no OpenAlex" if e.code == 404 else f"erro HTTP {e.code}"
        except Exception as e:
            linha["situacao"] = f"erro: {e}"
        time.sleep(0.2)

    linhas.append(linha)
    if linha["situacao"] == "ok":
        print(f"{nome[:37]:<38} {orcid:<20} {linha['openalex_id']:<13} "
              f"{linha[f'artigos_{ANO_INICIAL}_em_diante']:>12}  {linha['nome_openalex']} | {linha['instituicao_atual']}")
    else:
        print(f"{nome[:37]:<38} {orcid or '-':<20} {'-':<13} {'-':>12}  ({linha['situacao']})")

with open("conferencia_openalex.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=list(linhas[0].keys()))
    w.writeheader()
    w.writerows(linhas)

print(f"\nPronto: conferencia_openalex.csv salvo ({len(linhas)} docentes).")