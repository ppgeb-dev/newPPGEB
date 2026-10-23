let disciplinasData = {};
let ementasOferta = null;

// Normaliza string para comparação: minúsculas, sem acentos, sem pontuação
function normalizar(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ').trim();
}

// Retorna 0.0 a 1.0 de similaridade entre dois nomes de disciplina
function similaridade(a, b) {
    const na = normalizar(a).split(' ');
    const nb = normalizar(b).split(' ');
    const stopwords = new Set(['de', 'da', 'do', 'das', 'dos', 'a', 'o', 'e', 'em', 'para', 'com', 'por', 'na', 'no', 'nas', 'nos', 'ao', 'aos', 'as', 'os']);
    const wa = new Set(na.filter(w => w.length > 2 && !stopwords.has(w)));
    const wb = new Set(nb.filter(w => w.length > 2 && !stopwords.has(w)));
    if (wa.size === 0 || wb.size === 0) return 0;
    let match = 0;
    wa.forEach(w => { if (wb.has(w)) match++; });
    return match / Math.max(wa.size, wb.size);
}

// Busca a chave no ementas.json mais próxima do nome dado
function buscarEmenta(nome) {
    if (!ementasOferta) return null;
    // Tentativa exata (case-insensitive)
    const nomeUp = nome.toUpperCase().trim();
    if (ementasOferta[nomeUp]) return ementasOferta[nomeUp];
    // Busca aproximada
    let melhorChave = null;
    let melhorScore = 0;
    for (const chave of Object.keys(ementasOferta)) {
        const score = similaridade(nome, chave);
        if (score > melhorScore) {
            melhorScore = score;
            melhorChave = chave;
        }
    }
    return melhorScore >= 0.4 ? ementasOferta[melhorChave] : null;
}

function toggleEmentaOferta(btn) {
    const item = btn.closest('.discipline-item');
    const details = item.querySelector('.ementa-details-oferta');
    const isOpen = details.classList.contains('open');

    // Fechar todos
    document.querySelectorAll('.ementa-details-oferta.open').forEach(d => {
        d.classList.remove('open');
        d.closest('.discipline-item').querySelector('.ementa-link').classList.remove('active');
    });

    if (isOpen) return;

    // Preencher conteúdo se ainda vazio
    if (!details.dataset.loaded) {
        // O nome exibido pode estar traduzido; a busca usa sempre o nome em PT
        const nome = item.dataset.nome || item.querySelector('h4').textContent;
        const d = buscarEmenta(nome);
        if (d) {
            details.innerHTML = `
                <div class="ementa-content-oferta">
                    <div class="ementa-section">
                        <span class="ementa-section-label">${i18n.t('disciplinas.area_concentracao', 'Área de Concentração')}</span>
                        <p>${d.area_concentracao || '—'}</p>
                    </div>
                    <div class="ementa-section">
                        <span class="ementa-section-label">${i18n.t('disciplinas.ementa', 'Ementa')}</span>
                        <p>${d.ementa || '—'}</p>
                    </div>
                    <div class="ementa-section">
                        <span class="ementa-section-label">${i18n.t('disciplinas.bibliografia', 'Bibliografia')}</span>
                        <p>${d.bibliografia || '—'}</p>
                    </div>
                </div>`;
        } else {
            details.innerHTML = `<p class="ementa-unavailable">${i18n.t('oferta.ementa_indisponivel', 'Informações da ementa não disponíveis.')}</p>`;
        }
        details.dataset.loaded = '1';
    }

    details.classList.add('open');
    btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {

    // Carregar ementas.json e oferta_disciplinas.json em paralelo
    i18n.ready.then(() => Promise.all([
        i18n.fetchJSON('JSON/oferta_disciplinas.json'),
        i18n.fetchJSON('JSON/ementas.json')
    ])).then(([oferta, ementas]) => {
        disciplinasData = oferta;
        ementasOferta = ementas;

        const select = document.getElementById('semesterSelect');
        select.innerHTML = '';
        const keys = Object.keys(oferta).sort().reverse();
        keys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = formatSemester(key);
            select.appendChild(option);
        });
        updateContent(select.value);
    }).catch(error => {
        console.error('Erro ao carregar JSON:', error);
    });

    document.getElementById('semesterSelect').addEventListener('change', e => {
        updateContent(e.target.value);
    });

    // Delegação de eventos para o accordion
    document.querySelector('.disciplines-list') || document.addEventListener('click', handleClick);
    document.querySelector('.disciplines-section').addEventListener('click', handleClick);

    function handleClick(e) {
        const btn = e.target.closest('.ementa-link');
        if (btn) toggleEmentaOferta(btn);
    }
});

// Monta "Segundo Semestre de 2024" (PT) / "Second Semester of 2024" (EN)
function tituloSemestre(ano, semestre) {
    const nomes = {
        '1': i18n.t('oferta.primeiro', 'Primeiro'),
        '2': i18n.t('oferta.segundo', 'Segundo')
    };
    const ordinal = nomes[semestre] || semestre + 'º';
    return i18n.t('oferta.semestre_de', '{n} Semestre de {ano}')
        .replace('{n}', ordinal)
        .replace('{ano}', ano);
}

function formatSemester(key) {
    const [ano, semestre] = key.split('-');
    return `${ano}/${semestre} - ${tituloSemestre(ano, semestre)}`;
}

function updateContent(selectedSemester) {
    const dados = disciplinasData[selectedSemester];
    if (!dados) return;

    const [ano, semestre] = selectedSemester.split('-');
    document.getElementById('semesterTitle').textContent = tituloSemestre(ano, semestre);

    const listaDisciplinas = document.querySelector('.disciplines-list');
    listaDisciplinas.innerHTML = '';

    if (dados.disciplinas && dados.disciplinas.length > 0) {
        dados.disciplinas.forEach(disciplina => {
            const disciplineItem = document.createElement('div');
            disciplineItem.className = 'discipline-item';

            // Linha principal: info + botão
            const row = document.createElement('div');
            row.className = 'discipline-main-row';

            const disciplineContent = document.createElement('div');
            disciplineContent.className = 'discipline-content';

            const nameRow = document.createElement('div');
            nameRow.className = 'discipline-name-row';

            const disciplineName = document.createElement('h4');
            disciplineItem.dataset.nome = disciplina.nome;

            // Badge de tipo
            const emDados = buscarEmenta(disciplina.nome);
            // Em EN, o ementas.json traz o nome traduzido no campo opcional "nome"
            disciplineName.textContent = (emDados && emDados.nome) ? emDados.nome : disciplina.nome;
            if (emDados && emDados.tipo) {
                const tipoLabels = {
                    obrigatoria: i18n.t('oferta.tipo_obrigatoria', 'Obrigatória'),
                    niveladora: i18n.t('oferta.tipo_niveladora', 'Niveladora'),
                    eletiva: i18n.t('oferta.tipo_eletiva', 'Eletiva')
                };
                const tipoBadge = document.createElement('span');
                tipoBadge.className = `tipo-badge tipo-${emDados.tipo}`;
                tipoBadge.textContent = tipoLabels[emDados.tipo] || emDados.tipo;
                nameRow.appendChild(disciplineName);
                nameRow.appendChild(tipoBadge);
            } else {
                nameRow.appendChild(disciplineName);
            }

            const disciplineInfo = document.createElement('div');
            disciplineInfo.className = 'discipline-info';

            const docente = document.createElement('p');
            docente.className = 'docente';
            docente.textContent = `${i18n.t('oferta.docente', 'Docente')}: ${disciplina.docente}`;

            const unidade = document.createElement('p');
            unidade.className = 'unidade';
            unidade.textContent = `${i18n.t('oferta.unidade', 'Unidade')}: ${disciplina.unidade}`;

            const horario = document.createElement('p');
            horario.className = 'horario';
            horario.textContent = `${i18n.t('oferta.horario', 'Horário')}: ${disciplina.horario}`;

            disciplineInfo.appendChild(docente);
            disciplineInfo.appendChild(unidade);

            if (disciplina.local && disciplina.local.trim() !== '') {
                const local = document.createElement('p');
                local.className = 'local';
                local.textContent = `${i18n.t('oferta.local', 'Local')}: ${disciplina.local}`;
                disciplineInfo.appendChild(local);
            }

            disciplineInfo.appendChild(horario);
            disciplineContent.appendChild(nameRow);
            disciplineContent.appendChild(disciplineInfo);

            const ementaBtn = document.createElement('button');
            ementaBtn.className = 'ementa-link';
            ementaBtn.type = 'button';
            ementaBtn.textContent = i18n.t('disciplinas.ementa', 'Ementa');

            row.appendChild(disciplineContent);
            row.appendChild(ementaBtn);

            // Painel accordion
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'ementa-details-oferta';

            disciplineItem.appendChild(row);
            disciplineItem.appendChild(detailsDiv);
            listaDisciplinas.appendChild(disciplineItem);
        });
    } else {
        listaDisciplinas.innerHTML = `<div class="no-disciplines"><p>${i18n.t('oferta.sem_disciplinas', 'Não há disciplinas disponíveis para este período.')}</p></div>`;
    }
}