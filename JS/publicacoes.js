// Página de Publicações: lista de artigos dos docentes (OpenAlex) com filtro por ano
// e mapa-múndi dos países de coautoria. Dados: JSON/publicacoes.json (gerado toda
// semana por scripts/atualizar_publicacoes.py) e JSON/mapa_mundi.json (contornos pré-desenhados).

document.addEventListener('DOMContentLoaded', function () {
    const LIMITE_INICIAL = 15;
    const PAIS_SEDE = 'BR';
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Escala sequencial (um tom, do claro ao escuro) para o número de artigos por país
    const FAIXAS = [
        { min: 1, max: 1, cor: '#bfdbfe' },
        { min: 2, max: 3, cor: '#7cb3f7' },
        { min: 4, max: 7, cor: '#3b82f6' },
        { min: 8, max: 15, cor: '#1d4ed8' },
        { min: 16, max: Infinity, cor: '#1e3a8a' }
    ];

    const estado = {
        publicacoes: [],
        anoSelecionado: 'todos',
        mostrarTodas: false,
        paisesSvg: {}
    };

    const el = {
        filtro: document.getElementById('ano-filtro'),
        resumo: document.getElementById('pub-resumo'),
        lista: document.getElementById('pub-lista'),
        mais: document.getElementById('pub-mais'),
        mapa: document.getElementById('mapa'),
        mapaWrapper: document.getElementById('mapa-wrapper'),
        mapaSub: document.getElementById('mapa-sub'),
        tooltip: document.getElementById('mapa-tooltip'),
        legenda: document.getElementById('mapa-legenda'),
        paises: document.getElementById('paises-lista'),
        fonte: document.getElementById('pub-fonte'),
        atualizado: document.getElementById('pub-atualizado')
    };

    const t = (chave, padrao) => i18n.t('publicacoes.' + chave, padrao);
    const locale = () => (i18n.lang === 'en' ? 'en' : 'pt-BR');

    function escapar(texto) {
        return String(texto == null ? '' : texto)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function plural(n, chaveUm, padraoUm, chaveVarios, padraoVarios) {
        const molde = n === 1 ? t(chaveUm, padraoUm) : t(chaveVarios, padraoVarios);
        return molde.replace('{n}', n.toLocaleString(locale()));
    }

    let nomesRegioes = null;
    function nomePais(codigo) {
        try {
            if (!nomesRegioes) nomesRegioes = new Intl.DisplayNames([locale()], { type: 'region' });
            return nomesRegioes.of(codigo) || codigo;
        } catch (e) {
            return codigo;
        }
    }

    // ---------- Carregamento ----------

    function buscarJSON(caminho) {
        return fetch(caminho).then(resp => {
            if (!resp.ok) throw new Error('Erro ao carregar ' + caminho + ': ' + resp.status);
            return resp.json();
        });
    }

    i18n.ready
        .then(() => Promise.all([buscarJSON('JSON/publicacoes.json'), buscarJSON('JSON/mapa_mundi.json')]))
        .then(([dados, mapa]) => {
            estado.publicacoes = Array.isArray(dados.publicacoes) ? dados.publicacoes : [];
            desenharMapaBase(mapa);
            montarLegenda();
            mostrarAtualizacao(dados.atualizado_em);
            mostrarFonte(dados.atualizado_em);

            const anoUrl = (window.location.hash || '').replace('#', '');
            const anos = anosDisponiveis();
            if (anos.includes(Number(anoUrl))) estado.anoSelecionado = Number(anoUrl);

            montarFiltro(anos);
            atualizar();
        })
        .catch(erro => {
            console.error('Erro ao carregar publicações:', erro);
            el.lista.innerHTML = `<p class="pub-mensagem">${escapar(t('erro', 'Não foi possível carregar as publicações. Tente novamente mais tarde.'))}</p>`;
        });

    // ---------- Filtro por ano ----------

    function anosDisponiveis() {
        const anos = new Set(estado.publicacoes.map(p => p.ano).filter(Boolean));
        return [...anos].sort((a, b) => b - a);
    }

    function montarFiltro(anos) {
        el.filtro.innerHTML = '';
        const opcoes = [{ valor: 'todos', texto: t('todos_anos', 'Todos') }]
            .concat(anos.map(a => ({ valor: a, texto: String(a) })));

        opcoes.forEach(op => {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'ano-botao';
            botao.textContent = op.texto;
            botao.dataset.valor = op.valor;
            botao.addEventListener('click', () => {
                estado.anoSelecionado = op.valor;
                estado.mostrarTodas = false;
                const hash = op.valor === 'todos' ? '' : '#' + op.valor;
                history.replaceState(null, '', window.location.pathname + window.location.search + hash);
                atualizar();
            });
            el.filtro.appendChild(botao);
        });
    }

    function publicacoesFiltradas() {
        if (estado.anoSelecionado === 'todos') return estado.publicacoes;
        return estado.publicacoes.filter(p => p.ano === estado.anoSelecionado);
    }

    function atualizar() {
        el.filtro.querySelectorAll('.ano-botao').forEach(b => {
            const ativo = String(b.dataset.valor) === String(estado.anoSelecionado);
            b.classList.toggle('ativo', ativo);
            b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        });

        const pubs = publicacoesFiltradas();
        const contagem = contarPaises(pubs);
        renderResumo(pubs, contagem);
        renderLista(pubs);
        pintarMapa(contagem);
        renderPaises(contagem);
    }

    // ---------- Resumo ----------

    function renderResumo(pubs, contagem) {
        const internacionais = pubs.filter(p => (p.paises || []).length > 0).length;
        const citacoes = pubs.reduce((soma, p) => soma + (Number(p.citacoes) || 0), 0);
        const itens = [
            { valor: pubs.length, rotulo: pubs.length === 1 ? t('resumo_artigo', 'artigo') : t('resumo_artigos', 'artigos') },
            { valor: contagem.size, rotulo: contagem.size === 1 ? t('resumo_pais', 'país com coautores') : t('resumo_paises', 'países com coautores') },
            { valor: internacionais, rotulo: internacionais === 1 ? t('resumo_internacional', 'artigo com coautoria internacional') : t('resumo_internacionais', 'artigos com coautoria internacional') },
            { valor: citacoes, rotulo: citacoes === 1 ? t('resumo_citacao', 'citação') : t('resumo_citacoes', 'citações') }
        ];
        el.resumo.innerHTML = itens.map(i =>
            `<div class="pub-resumo-item"><span class="pub-resumo-valor">${i.valor.toLocaleString(locale())}</span>` +
            `<span class="pub-resumo-rotulo">${escapar(i.rotulo)}</span></div>`
        ).join('');
    }

    // ---------- Lista ----------

    function formatarAutores(p) {
        const autores = (p.autores || []).map(a =>
            a.ppgeb ? `<strong class="autor-ppgeb">${escapar(a.nome)}</strong>` : escapar(a.nome));
        const extras = (p.autores_ppgeb_extras || []).map(a => `<strong class="autor-ppgeb">${escapar(a.nome)}</strong>`);
        const mostrados = (p.autores || []).length + extras.length;
        let texto = autores.join(', ');
        if (extras.length) texto += ', …, ' + extras.join(', ');
        if ((p.n_autores || 0) > mostrados) texto += ' ' + escapar(t('et_al', 'et al.'));
        return texto;
    }

    function itemPublicacao(p) {
        const link = p.doi ? `https://doi.org/${encodeURI(p.doi)}` : `https://openalex.org/works/${encodeURIComponent(p.id)}`;
        const meta = [p.revista ? `<em>${escapar(p.revista)}</em>` : '', escapar(p.ano)].filter(Boolean).join(' · ');
        const nCitacoes = Number(p.citacoes) || 0;
        const citacoes = typeof p.citacoes === 'number'
            ? ` · <span class="pub-citacoes">${escapar(plural(nCitacoes, 'n_citacao', '{n} citação', 'n_citacoes', '{n} citações'))}</span>`
            : '';
        const selos = [];
        if (p.acesso_aberto) selos.push(`<span class="pub-selo selo-aberto">${escapar(t('acesso_aberto', 'Acesso aberto'))}</span>`);
        if ((p.paises || []).length) {
            const nomes = p.paises.map(nomePais).join(', ');
            selos.push(`<span class="pub-selo selo-internacional" title="${escapar(nomes)}">${escapar(t('coautoria_internacional', 'Coautoria internacional'))}: ${escapar(nomes)}</span>`);
        }
        return `<article class="pub-item">
            <h3 class="pub-titulo"><a href="${link}" target="_blank" rel="noopener">${escapar(p.titulo)}</a></h3>
            <p class="pub-autores">${formatarAutores(p)}</p>
            <p class="pub-meta">${meta}${citacoes}${p.doi ? ` · <span class="pub-doi">DOI ${escapar(p.doi)}</span>` : ''}</p>
            ${selos.length ? `<div class="pub-selos">${selos.join('')}</div>` : ''}
        </article>`;
    }

    function renderLista(pubs) {
        if (!estado.publicacoes.length) {
            el.lista.innerHTML = `<p class="pub-mensagem">${escapar(t('sem_dados', 'As publicações ainda estão sendo carregadas a partir do OpenAlex. Volte em breve.'))}</p>`;
            el.mais.hidden = true;
            return;
        }
        if (!pubs.length) {
            el.lista.innerHTML = `<p class="pub-mensagem">${escapar(t('sem_publicacoes_ano', 'Nenhuma publicação encontrada para este ano.'))}</p>`;
            el.mais.hidden = true;
            return;
        }

        const visiveis = estado.mostrarTodas ? pubs : pubs.slice(0, LIMITE_INICIAL);

        // Agrupa por ano (a lista já vem ordenada da mais recente para a mais antiga)
        const grupos = new Map();
        visiveis.forEach(p => {
            if (!grupos.has(p.ano)) grupos.set(p.ano, []);
            grupos.get(p.ano).push(p);
        });
        const totalPorAno = {};
        pubs.forEach(p => { totalPorAno[p.ano] = (totalPorAno[p.ano] || 0) + 1; });

        el.lista.innerHTML = [...grupos.entries()].map(([ano, itens]) =>
            `<div class="pub-grupo">
                <h3 class="pub-ano">${escapar(ano)} <span class="pub-ano-contagem">${escapar(plural(totalPorAno[ano], 'n_artigo', '{n} artigo', 'n_artigos', '{n} artigos'))}</span></h3>
                ${itens.map(itemPublicacao).join('')}
            </div>`
        ).join('');

        if (pubs.length > LIMITE_INICIAL) {
            el.mais.hidden = false;
            el.mais.textContent = estado.mostrarTodas
                ? t('mostrar_menos', 'Mostrar menos')
                : t('mostrar_todas', 'Mostrar todas as {n} publicações').replace('{n}', pubs.length.toLocaleString(locale()));
        } else {
            el.mais.hidden = true;
        }
    }

    el.mais.addEventListener('click', () => {
        const recolhendo = estado.mostrarTodas;
        estado.mostrarTodas = !estado.mostrarTodas;
        renderLista(publicacoesFiltradas());
        if (recolhendo) document.getElementById('titulo-lista').scrollIntoView({ behavior: 'smooth' });
    });

    // ---------- Mapa ----------

    function contarPaises(pubs) {
        const contagem = new Map();
        pubs.forEach(p => (p.paises || []).forEach(c => contagem.set(c, (contagem.get(c) || 0) + 1)));
        return contagem;
    }

    function corDaContagem(n) {
        const faixa = FAIXAS.find(f => n >= f.min && n <= f.max);
        return faixa ? faixa.cor : null;
    }

    function desenharMapaBase(mapa) {
        el.mapa.setAttribute('viewBox', `0 0 ${mapa.largura} ${mapa.altura}`);
        el.mapa.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        const grupo = document.createElementNS(SVG_NS, 'g');
        mapa.paises.forEach(p => {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', p.d);
            path.setAttribute('class', 'pais' + (p.iso2 === PAIS_SEDE ? ' pais-sede' : ''));
            path.dataset.iso = p.iso2;
            grupo.appendChild(path);
            estado.paisesSvg[p.iso2] = path;
        });
        el.mapa.appendChild(grupo);

        // Tooltip: hover no desktop, toque no celular
        el.mapa.addEventListener('pointermove', evento => {
            const alvo = evento.target.closest('.pais');
            if (alvo) mostrarTooltip(alvo, evento); else esconderTooltip();
        });
        el.mapa.addEventListener('pointerleave', esconderTooltip);
        el.mapa.addEventListener('click', evento => {
            const alvo = evento.target.closest('.pais');
            if (alvo) mostrarTooltip(alvo, evento);
        });
    }

    function textoTooltip(iso) {
        if (iso === PAIS_SEDE) return `<strong>${escapar(nomePais(iso))}</strong><span>${escapar(t('sede', 'Sede do Programa'))}</span>`;
        const n = Number(estado.paisesSvg[iso].dataset.contagem || 0);
        const detalhe = n > 0
            ? plural(n, 'tooltip_um', '{n} artigo em coautoria', 'tooltip_varios', '{n} artigos em coautoria')
            : t('tooltip_nenhum', 'Sem coautoria no período');
        return `<strong>${escapar(nomePais(iso))}</strong><span>${escapar(detalhe)}</span>`;
    }

    function mostrarTooltip(alvo, evento) {
        el.tooltip.innerHTML = textoTooltip(alvo.dataset.iso);
        el.tooltip.hidden = false;
        const caixa = el.mapaWrapper.getBoundingClientRect();
        const x = evento.clientX - caixa.left;
        const y = evento.clientY - caixa.top;
        const largura = el.tooltip.offsetWidth;
        const esquerda = Math.min(Math.max(x - largura / 2, 4), caixa.width - largura - 4);
        el.tooltip.style.left = esquerda + 'px';
        el.tooltip.style.top = Math.max(y - el.tooltip.offsetHeight - 14, 4) + 'px';
        el.mapa.querySelectorAll('.pais-destaque').forEach(p => p.classList.remove('pais-destaque'));
        alvo.classList.add('pais-destaque');
        alvo.parentNode.appendChild(alvo); // traz para frente para o contorno não ficar escondido
    }

    function esconderTooltip() {
        el.tooltip.hidden = true;
        el.mapa.querySelectorAll('.pais-destaque').forEach(p => p.classList.remove('pais-destaque'));
    }

    function pintarMapa(contagem) {
        Object.entries(estado.paisesSvg).forEach(([iso, path]) => {
            if (iso === PAIS_SEDE) return;
            const n = contagem.get(iso) || 0;
            path.dataset.contagem = n;
            path.style.fill = n > 0 ? corDaContagem(n) : '';
            path.classList.toggle('pais-ativo', n > 0);
        });

        const periodo = estado.anoSelecionado === 'todos'
            ? t('periodo_todos', 'em todos os anos')
            : t('periodo_ano', 'em {ano}').replace('{ano}', estado.anoSelecionado);
        el.mapaSub.textContent = t('mapa_sub', 'Países dos coautores dos artigos publicados {periodo}. A cor indica o número de artigos em coautoria com cada país.')
            .replace('{periodo}', periodo);
    }

    function montarLegenda() {
        const faixas = FAIXAS.map(f => {
            const rotulo = f.max === Infinity ? `${f.min}+` : (f.min === f.max ? `${f.min}` : `${f.min}–${f.max}`);
            return `<span class="legenda-item"><span class="legenda-cor" style="background:${f.cor}"></span>${rotulo}</span>`;
        }).join('');
        el.legenda.innerHTML =
            `<span class="legenda-titulo">${escapar(t('legenda', 'Artigos em coautoria'))}</span>` +
            `<span class="legenda-faixas">${faixas}</span>` +
            `<span class="legenda-item"><span class="legenda-cor legenda-sede"></span>${escapar(t('legenda_sede', 'Brasil (sede)'))}</span>` +
            `<span class="legenda-item"><span class="legenda-cor legenda-vazio"></span>${escapar(t('legenda_vazio', 'Sem coautoria'))}</span>`;
    }

    function renderPaises(contagem) {
        const ordenados = [...contagem.entries()]
            .map(([iso, n]) => ({ iso, n, nome: nomePais(iso) }))
            .sort((a, b) => b.n - a.n || a.nome.localeCompare(b.nome, locale()));

        if (!ordenados.length) {
            el.paises.innerHTML = `<li class="paises-vazio">${escapar(t('sem_paises', 'Nenhuma coautoria internacional neste período.'))}</li>`;
            return;
        }
        el.paises.innerHTML = ordenados.map(p =>
            `<li class="pais-chip"><span class="pais-chip-cor" style="background:${corDaContagem(p.n)}"></span>` +
            `<span class="pais-chip-nome">${escapar(p.nome)}</span><span class="pais-chip-n">${p.n.toLocaleString(locale())}</span></li>`
        ).join('');
    }

    // ---------- Rodapé da página ----------

    // "atualizado_em" vem do script Python: "2026-11-25T14:32-03:00" (data e hora da execução,
    // horário de Brasília) ou, em arquivos antigos, só a data "2026-11-25".
    function formatarAtualizacao(valor, formatoData) {
        if (!valor) return null;
        if (!valor.includes('T')) {
            const [a, m, d] = valor.split('-').map(Number);
            return { data: new Date(a, m - 1, d).toLocaleDateString(locale(), formatoData), hora: null };
        }
        const instante = new Date(valor);
        if (isNaN(instante)) return null;
        const fuso = { timeZone: 'America/Sao_Paulo' };
        return {
            data: instante.toLocaleDateString(locale(), Object.assign({}, formatoData, fuso)),
            hora: instante.toLocaleTimeString(locale(), Object.assign({ hour: '2-digit', minute: '2-digit' }, fuso))
        };
    }

    function mostrarAtualizacao(valor) {
        const f = formatarAtualizacao(valor, { day: '2-digit', month: '2-digit', year: 'numeric' });
        if (!f) return;
        el.atualizado.textContent = f.hora
            ? t('atualizado_em_hora', 'Atualizado em {data} às {hora} (horário de Brasília)')
                .replace('{data}', f.data).replace('{hora}', f.hora)
            : t('atualizado_em_data', 'Atualizado em {data}').replace('{data}', f.data);
        el.atualizado.hidden = false;
    }

    function mostrarFonte(dataIso) {
        let texto = t('fonte', 'Fonte: OpenAlex (openalex.org).');
        const f = formatarAtualizacao(dataIso, { day: '2-digit', month: 'long', year: 'numeric' });
        if (f) texto += ' ' + t('atualizado_em', 'Atualizado em {data}.').replace('{data}', f.data);
        texto += ' ' + t('nota_fonte', 'A lista é gerada automaticamente e pode não incluir artigos ainda não indexados.');
        el.fonte.textContent = texto;
    }
});
