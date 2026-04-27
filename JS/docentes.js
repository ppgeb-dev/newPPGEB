// Arquivo: JS/docentes_final.js
let docentesData = {};

document.addEventListener('DOMContentLoaded', function () {
    
    // Carrega dados do JSON
    fetch("JSON/docentes.json")
        .then(response => response.json())
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
    }

    function renderDocentesByCategory(category, gridId) {
        const docentes = docentesData[category];
        if (!docentes || docentes.length === 0) return;

        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';

        // Ordenar docentes (coordenadores primeiro)
        const sortedDocentes = [...docentes].sort((a, b) => {
            const order = { 'coordenador': 1, 'vice-coordenador': 2, 'docente': 3, 'colaborador': 4 };
            return order[a.status] - order[b.status];
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
        badgeHTML = '<div class="status-badge coordenador">Coordenador</div>';
    } else if (docente.status === 'vice-coordenador') {
        badgeHTML = '<div class="status-badge vice-coordenador">Vice-coordenador</div>';
    }
    
    card.innerHTML = `
        <div class="docente-card-superior">
            <div class="docente-foto-wrapper">
                <img src="${docente.foto}" alt="${docente.nome}" class="docente-foto-modern">
                ${badgeHTML}
            </div>
            <div class="docente-conteudo">
                <h3 class="docente-nome-modern">${docente.nome}</h3>
                <a href="${docente.lattes}" target="_blank" class="botao-cv-outline">Ver Currículo Lattes</a>
            </div>
        </div>
        <div class="docente-email-inferior">
            <p class="botao-email-completo-inferior">
                ${docente.email}
            </p>
        </div>
    `;
    
    return card;
}
});