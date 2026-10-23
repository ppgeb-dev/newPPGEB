// JavaScript para a página de Disciplinas
let ementasData = null;

// Converte string em Title Case respeitando preposições PT-BR
function toTitleCase(str) {
    const minor = ['e', 'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'em', 'para', 'com', 'por', 'na', 'no', 'nas', 'nos', 'à', 'ao', 'aos', 'às'];
    return str.toLowerCase().split(' ').map((word, i) => {
        if (i === 0 || !minor.includes(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');
}

async function loadEmentas() {
    try {
        await i18n.ready;
        ementasData = await i18n.fetchJSON('JSON/ementas.json');
        buildDisciplinas();
    } catch (e) {
        console.error('Erro ao carregar ementas:', e);
    }
}

// Em EN o JSON traz o campo opcional "nome"; em PT usa a chave do JSON
function nomeDisciplina(key) {
    const d = ementasData[key];
    return (d && d.nome) ? d.nome : toTitleCase(key);
}

function buildDisciplinas() {
    const container = document.getElementById('disciplinas-container');
    if (!container || !ementasData) return;

    const badge = i18n.t('disciplinas.badge_creditos', '60 horas aula - 4 créditos por disciplina');
    const tituloEletivas = i18n.t('disciplinas.eletivas_area', 'Disciplinas Eletivas - Área:');
    const nomeBioeng = i18n.t('disciplinas.area_bioengenharia', 'Bioengenharia');
    const nomeInstr = i18n.t('disciplinas.area_instrumentacao', 'Instrumentação Biomédica');

    const sections = [
        {
            tipo: 'obrigatoria',
            area: null,
            title: i18n.t('disciplinas.obrigatorias', 'Disciplinas Obrigatórias'),
            cssClasses: 'disciplina-category obligatory',
            headerExtra: 'category-header-orange',
            badge: badge
        },
        {
            tipo: 'niveladora',
            area: null,
            title: i18n.t('disciplinas.niveladoras', 'Disciplinas Niveladoras'),
            cssClasses: 'disciplina-category leveling',
            headerExtra: '',
            badge: badge
        },
        {
            tipo: 'eletiva',
            area: ['Bioengenharia', 'Bioengineering'],
            title: `${tituloEletivas} ${nomeBioeng}`,
            cssClasses: 'disciplina-category elective bioengenharia',
            headerExtra: 'category-header-green',
            badge: badge
        },
        {
            tipo: 'eletiva',
            area: ['Instrumentação Biomédica', 'Biomedical Instrumentation'],
            title: `${tituloEletivas} ${nomeInstr}`,
            cssClasses: 'disciplina-category elective instrumentacao',
            headerExtra: '',
            badge: badge
        }
    ];

    let html = '';

    for (const sec of sections) {
        // Filtrar disciplinas desta seção
        const disciplines = Object.entries(ementasData).filter(([, d]) => {
            if (d.tipo !== sec.tipo) return false;
            if (sec.area) return sec.area.some(a => (d.area_concentracao || '').includes(a));
            return true;
        });

        if (disciplines.length === 0) continue;

        // Ordenar alfabeticamente (PT pela chave; EN pelo nome em inglês)
        if (i18n.lang === 'en') {
            disciplines.sort((a, b) => nomeDisciplina(a[0]).localeCompare(nomeDisciplina(b[0]), 'en'));
        } else {
            disciplines.sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
        }

        const headerClass = `category-header${sec.headerExtra ? ' ' + sec.headerExtra : ''}`;

        const items = disciplines.map(([key]) => `
                            <li data-disciplina="${key}">
                                <div class="disciplina-row"><span>${nomeDisciplina(key)}</span><button class="ementa-btn" type="button">${i18n.t('disciplinas.ementa', 'Ementa')}</button></div>
                                <div class="ementa-details"></div>
                            </li>`).join('');

        html += `
                <div class="${sec.cssClasses}">
                    <div class="${headerClass}">
                        <div class="header-container-docs">
                            <h2>${sec.title}</h2>
                        </div>
                        <span class="credits-badge">${sec.badge}</span>
                    </div>
                    <div class="category-content">
                        <ul class="disciplinas-list">${items}
                        </ul>
                    </div>
                </div>`;
    }

    container.innerHTML = html;

    // Re-animar os novos cards
    container.querySelectorAll('.disciplina-category').forEach((el, index) => {
        setTimeout(() => el.classList.add('animate-in'), index * 100);
    });
}

function toggleEmenta(btn) {
    const li = btn.closest('li');
    const details = li.querySelector('.ementa-details');
    const key = li.dataset.disciplina;
    const isOpen = details.classList.contains('open');

    // Fechar todos os abertos
    document.querySelectorAll('.ementa-details.open').forEach(d => {
        d.classList.remove('open');
        d.closest('li').querySelector('.ementa-btn').classList.remove('active');
    });

    if (isOpen) return;

    if (ementasData && ementasData[key]) {
        const d = ementasData[key];
        const tituloOriginal = d.nome ? `
                <div class="ementa-section">
                    <span class="ementa-section-label">${i18n.t('disciplinas.titulo_original', 'Título original')}</span>
                    <p>${toTitleCase(key)}</p>
                </div>` : '';
        details.innerHTML = `
            <div class="ementa-content">${tituloOriginal}
                <div class="ementa-section">
                    <span class="ementa-section-label">${i18n.t('disciplinas.area_concentracao', 'Área de Concentração')}</span>
                    <p>${d.area_concentracao}</p>
                </div>
                <div class="ementa-section">
                    <span class="ementa-section-label">${i18n.t('disciplinas.ementa', 'Ementa')}</span>
                    <p>${d.ementa}</p>
                </div>
                <div class="ementa-section">
                    <span class="ementa-section-label">${i18n.t('disciplinas.bibliografia', 'Bibliografia')}</span>
                    <p>${d.bibliografia}</p>
                </div>
            </div>`;
    } else {
        details.innerHTML = `<p class="ementa-unavailable">${i18n.t('disciplinas.indisponivel', 'Informações não disponíveis.')}</p>`;
    }

    details.classList.add('open');
    btn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
    loadEmentas();

    // Delegação de eventos (funciona para elementos gerados dinamicamente)
    document.querySelector('.disciplinas-section').addEventListener('click', function (e) {
        const btn = e.target.closest('.ementa-btn');
        if (btn) toggleEmenta(btn);
    });

    // Animações para o card estático de info geral
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.disciplina-category').forEach(el => observer.observe(el));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset
                    - document.querySelector('.header').offsetHeight - 20;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });
});

