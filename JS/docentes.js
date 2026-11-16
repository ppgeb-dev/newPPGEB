// Arquivo: JS/docentes_final.js
let docentesData = {};

document.addEventListener('DOMContentLoaded', function () {
    
    // Carrega dados do JSON
    i18n.ready
        .then(() => i18n.fetchJSON("JSON/docentes.json"))
        .then(data => {
            docentesData = data;
            renderDocentes();
        })
        .catch(error => {
            console.error("Erro ao carregar dados dos docentes:", error);
        });

    function renderDocentes() {
        // Renderizar Docentes Permanentes
        renderDocentesByCategory('permanentes', 'docentes-permanentes-grid');
        
        // Renderizar Docentes Colaboradores
        renderDocentesByCategory('colaboradores', 'docentes-colaboradores-grid');

        // Renderizar Jovens Doutores Apadrinhados (JDP)
        renderDocentesByCategory('jdp', 'docentes-jdp-grid');
    }

    // Iniciais para quem ainda não tem foto (ignora "Dr."/"Dra." e preposições)
    function iniciais(nome) {
        const partes = nome.replace(/^Dra?\.\s*/, '').split(/\s+/)
            .filter(p => !/^(de|da|do|dos|das|e)$/i.test(p));
        if (partes.length === 0) return '';
        const primeira = partes[0][0];
        const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
        return (primeira + ultima).toUpperCase();
    }

    function renderDocentesByCategory(category, gridId) {
        const docentes = docentesData[category];
        if (!docentes || docentes.length === 0) return;

        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';

        // Ordenar docentes (coordenadores primeiro)
        const sortedDocentes = [...docentes].sort((a, b) => {
            const order = { 'coordenador': 1, 'vice-coordenador': 2, 'docente': 3, 'colaborador': 4, 'jdp': 5 };
            return (order[a.status] || 9) - (order[b.status] || 9);
        });

        sortedDocentes.forEach(docente => {
            const card = createDocenteCard(docente);
            grid.appendChild(card);
        });
    }

function createDocenteCard(docente) {
    const card = document.createElement('div');
    card.className = 'docente-card moderno-com-email';
    
    // Determina o badge baseado no status
    let badgeHTML = '';
    if (docente.status === 'coordenador') {
        badgeHTML = `<div class="status-badge coordenador">${i18n.t('docentes.coordenador', 'Coordenador')}</div>`;
    } else if (docente.status === 'vice-coordenador') {
        badgeHTML = `<div class="status-badge vice-coordenador">${i18n.t('docentes.vice_coordenador', 'Vice-coordenador')}</div>`;
    }
    
    const fotoHTML = docente.foto
        ? `<img src="${docente.foto}" alt="${docente.nome}" class="docente-foto-modern">`
        : `<div class="docente-foto-modern docente-foto-iniciais" role="img" aria-label="${docente.nome}">${iniciais(docente.nome)}</div>`;

    const emailHTML = docente.email
        ? `<div class="docente-email-inferior">
            <p class="botao-email-completo-inferior">
                ${docente.email}
            </p>
        </div>`
        : '';

    card.innerHTML = `
        <div class="docente-card-superior">
            <div class="docente-foto-wrapper">
                ${fotoHTML}
                ${badgeHTML}
            </div>
            <div class="docente-conteudo">
                <h3 class="docente-nome-modern">${docente.nome}</h3>
                <a href="${docente.lattes}" target="_blank" class="botao-cv-outline">${i18n.t('docentes.lattes', 'Ver Currículo Lattes')}</a>
            </div>
        </div>
        ${emailHTML}
    `;
    
    return card;
}
});