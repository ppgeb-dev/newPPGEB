// JavaScript para a página de Autoavaliação
let autoavaliacaoData = {};

document.addEventListener('DOMContentLoaded', function () {
    
    const select = document.getElementById("periodoSelect");
    const container = document.getElementById("comissaoDocumentosContainer");

    function formatPeriodo(key) {
        // Formato: "2021-2024" ou similar
        return key;
    }

    // Carregar JSON
    fetch("JSON/autoavaliacao.json")
        .then(response => response.json())
        .then(data => {
            autoavaliacaoData = data;
            select.innerHTML = "";

            // Ordenar períodos (mais recente primeiro)
            const keys = Object.keys(data).sort().reverse();

            // Preencher dropdown
            keys.forEach(key => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = formatPeriodo(key);
                select.appendChild(option);
            });

            // Carregar primeiro período
            updateContent(select.value);
        })
        .catch(error => {
            console.error("Erro ao carregar JSON:", error);
            container.innerHTML = `<div class="error-message"><p>Erro ao carregar dados da comissão.</p></div>`;
        });

    // Atualizar quando mudar seleção
    select.addEventListener("change", () => {
        updateContent(select.value);
    });

    function updateContent(periodo) {
        const dados = autoavaliacaoData[periodo];
        if (!dados) return;

        // Atualizar título do período
        const periodoTitle = document.getElementById("periodoTitle");
        if (periodoTitle) {
            periodoTitle.textContent = periodo;
        }

        let html = '';

        // Seção de Membros da Comissão
        html += `
            <div class="autoavaliacao-category">
                <div class="category-header">
                    <div class="header-container-docs">
                        <img src="imgs/icons/professors.png" class="icon-docs" alt="">
                        <h2>${dados.titulo}</h2>
                    </div>
                </div>
                <div class="members-list">
        `;

        dados.membros.forEach(membro => {
            html += `
                <div class="member-item">
                    <div class="member-content">
                        <h4>${membro.nome}</h4>
                        <p>${membro.cargo}</p>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        // Seção de Documentos
        html += `
            <div class="autoavaliacao-category">
                <div class="category-header">
                    <div class="header-container-docs">
                        <img src="imgs/icons/docs.png" class="icon-docs" alt="">
                        <h2>Documentos</h2>
                    </div>
                </div>
                <div class="documents-list">
        `;

        dados.documentos.forEach(doc => {
            html += `
                <a href="${doc.arquivo}" class="document-item" target="_blank">
                    <div class="document-content">
                        <h4>${doc.titulo}</h4>
                        <p>${doc.descricao}</p>
                    </div>
                    <div class="document-year">${doc.ano}</div>
                </a>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Re-aplicar animações após inserir novo conteúdo
        initAnimations();
    }

    function initAnimations() {
        // Animações de entrada para os cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observar todos os cards
        document.querySelectorAll('.autoavaliacao-category').forEach(el => {
            observer.observe(el);
        });

        // Efeitos de hover para os cards das etapas
        document.querySelectorAll('.etapa-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Efeitos para os objetivos
        document.querySelectorAll('.objetivo-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.objetivo-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.objetivo-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });

        // Adiciona classe para animações CSS
        setTimeout(() => {
            document.querySelectorAll('.autoavaliacao-category').forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('animate-in');
                }, index * 100);
            });
        }, 100);
    }

    // Inicializar animações na primeira carga
    initAnimations();

    // Scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contador animado para os números das etapas
    const animateNumbers = () => {
        const numbers = document.querySelectorAll('.etapa-number');
        
        numbers.forEach((number, index) => {
            const targetNumber = parseInt(number.textContent);
            let currentNumber = 0;
            
            const increment = () => {
                if (currentNumber < targetNumber) {
                    currentNumber++;
                    number.textContent = currentNumber;
                    setTimeout(increment, 100);
                }
            };
            
            // Inicia a animação com delay baseado no índice
            setTimeout(increment, index * 200);
        });
    };

    // Inicia animação dos números quando a seção fica visível
    const etapasSection = document.querySelector('.etapas-grid');
    if (etapasSection) {
        const etapasObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateNumbers();
                    etapasObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        etapasObserver.observe(etapasSection);
    }

    // Log para debug
    console.log('Página de Autoavaliação carregada com sucesso!');
});