document.addEventListener('DOMContentLoaded', function () {

    carregarFooter();

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;

            document.querySelectorAll('.faq-question').forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                    btn.nextElementSibling.style.maxHeight = null;
                }
            });

            button.classList.toggle('active');

            if (button.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });


    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.88)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }

        lastScrollTop = scrollTop;
        
    });

    // Animações com IntersectionObserver
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

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Disparo em cadeia na página
    window.addEventListener('load', () => {
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100);
        });
    });

    // MODAL
    const modalTriggers = document.querySelectorAll('.open-modal');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal-id');
            const modal = document.getElementById(modalId);

            if (!modal) return;

            modal.style.display = 'block';
            document.body.classList.add('modal-open'); // Previne scroll

            const closeBtn = modal.querySelector('.custom-close');
            closeBtn.addEventListener('click', function () {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });

            window.addEventListener('click', function (event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                }
            });
        });
    });

    // Previne zoom no iOS em inputs
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
    }

    // ===== SCROLL TO TOP BUTTON =====
    createScrollToTopButton();
    adjustScrollButtonForMobile();
    window.addEventListener('resize', adjustScrollButtonForMobile);

    // ===== MODAL DE AVISOS IMPORTANTES =====
    // Delay de 1.5 segundos para melhor UX (após scroll button)
    setTimeout(() => {
        createAnnouncementModal();
    }, 1500);

    // Função para carregar o footer automaticamente
    function carregarFooter() {
        fetch('footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar footer: ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                // Procura por um elemento com id "footer-placeholder" ou adiciona no final do body
                const footerPlaceholder = document.getElementById('footer-placeholder');

                if (footerPlaceholder) {
                    footerPlaceholder.outerHTML = html;
                } else {
                    // Se não encontrar placeholder, adiciona antes do final do body
                    document.body.insertAdjacentHTML('beforeend', html);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar footer:', error);
            });
    }
});

// ===== FUNÇÕES DO SCROLL TO TOP BUTTON =====

// Criar e adicionar o botão Scroll to Top
function createScrollToTopButton() {
    // Verificar se o botão já existe para evitar duplicação
    if (document.getElementById('scrollToTopBtn')) {
        return;
    }

    // Criar o botão
    const scrollButton = document.createElement('button');
    scrollButton.id = 'scrollToTopBtn';
    scrollButton.innerHTML = '↑';
    scrollButton.setAttribute('aria-label', 'Voltar ao topo');
    scrollButton.setAttribute('title', 'Voltar ao topo');
    
    // Adicionar estilos inline (para não depender de CSS externo)
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    `;

    // Adicionar o botão ao body
    document.body.appendChild(scrollButton);

    // Função para mostrar/esconder o botão baseado no scroll
    function toggleScrollButton() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.visibility = 'visible';
            scrollButton.style.transform = 'translateY(0)';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.visibility = 'hidden';
            scrollButton.style.transform = 'translateY(20px)';
        }
    }

    // Função para scroll suave ao topo
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Event listeners
    window.addEventListener('scroll', toggleScrollButton);
    scrollButton.addEventListener('click', scrollToTop);

    // Efeitos de hover
    scrollButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(0) scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.4)';
    });

    scrollButton.addEventListener('mouseleave', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 300) {
            this.style.transform = 'translateY(0) scale(1)';
        } else {
            this.style.transform = 'translateY(20px) scale(1)';
        }
        this.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
    });

    // Efeito de clique
    scrollButton.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0) scale(0.95)';
    });

    scrollButton.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(0) scale(1.1)';
    });
}

// Responsividade - ajustar posição em mobile
function adjustScrollButtonForMobile() {
    const scrollButton = document.getElementById('scrollToTopBtn');
    if (!scrollButton) return;

    if (window.innerWidth <= 768) {
        scrollButton.style.bottom = '20px';
        scrollButton.style.right = '20px';
        scrollButton.style.width = '45px';
        scrollButton.style.height = '45px';
        scrollButton.style.fontSize = '18px';
    } else {
        scrollButton.style.bottom = '30px';
        scrollButton.style.right = '30px';
        scrollButton.style.width = '50px';
        scrollButton.style.height = '50px';
        scrollButton.style.fontSize = '20px';
    }
}

// ===== SISTEMA DE MODAL DE AVISOS IMPORTANTES =====

// CONFIGURAÇÃO DO MODAL - EDITE AQUI PARA CONTROLAR
const ANNOUNCEMENT_CONFIG = {
    enabled: false, // true = ativo, false = desabilitado
    showOnlyOnHomepage: true, // true = só na home, false = em todas as páginas
    showOnce: false, // true = mostra só uma vez por sessão, false = sempre
    autoCloseAfter: 0, // 0 = não fecha automaticamente, ou tempo em ms (ex: 10000 = 10 segundos)
    
    // CONTEÚDO DO MODAL - EDITE AQUI
    content: {
        icon: "📢", // Emoji ou HTML
        title: "Atenção Candidatos!",
        subtitle: "Processo Seletivo 2025/02",
        message: "Não perca o prazo! As inscrições para o processo seletivo de alunos regulares do segundo semestre de 2025 estão abertas.",
        highlight: "Inscrições até 17/07/2025",
        primaryButton: {
            text: "Mais Informações",
            link: "processoSeletivo.html",
            external: false
        }
    }
};

// FUNÇÃO PRINCIPAL PARA CRIAR O MODAL
function createAnnouncementModal() {
    // Verificar se modal deve ser exibido
    if (!shouldShowModal()) {
        return;
    }

    // Verificar se modal já existe
    if (document.getElementById('announcementModal')) {
        return;
    }

    // Criar estrutura do modal
    const modal = document.createElement('div');
    modal.id = 'announcementModal';
    modal.className = 'announcement-modal';
    
    const config = ANNOUNCEMENT_CONFIG.content;
    
    modal.innerHTML = `
        <div class="announcement-content">
            <button class="announcement-close" onclick="closeAnnouncementModal()" aria-label="Fechar aviso">
                ×
            </button>
            
            <div class="announcement-icon">
                ${config.icon}
            </div>
            
            <h2 class="announcement-title">${config.title}</h2>
            <div class="announcement-subtitle">${config.subtitle}</div>
            <div class="announcement-message">${config.message}</div>
            <div class="announcement-highlight">${config.highlight}</div>
            
            <div class="announcement-actions">
                ${config.primaryButton ? `
                    <a href="${config.primaryButton.link}" 
                       class="announcement-btn announcement-btn-primary" 
                       ${config.primaryButton.external ? 'target="_blank"' : ''}
                       onclick="closeAnnouncementModal()">
                        ${config.primaryButton.text}
                    </a>
                ` : ''}
                
                ${config.secondaryButton ? `
                    <a href="${config.secondaryButton.link}" 
                       class="announcement-btn announcement-btn-secondary"
                       ${config.secondaryButton.external ? 'target="_blank"' : ''}
                       onclick="closeAnnouncementModal()">
                        ${config.secondaryButton.text}
                    </a>
                ` : ''}
                
                <button class="announcement-btn announcement-btn-secondary" 
                        onclick="closeAnnouncementModal()">
                    Fechar
                </button>
            </div>
        </div>
    `;

    // Adicionar ao body
    document.body.appendChild(modal);

    // Mostrar modal com delay para animação
    setTimeout(() => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Previne scroll
    }, 100);

    // Auto-close se configurado
    if (ANNOUNCEMENT_CONFIG.autoCloseAfter > 0) {
        setTimeout(() => {
            closeAnnouncementModal();
        }, ANNOUNCEMENT_CONFIG.autoCloseAfter);
    }

    // Marcar como visto se configurado
    if (ANNOUNCEMENT_CONFIG.showOnce) {
        localStorage.setItem('announcementModalSeen', 'true');
    }

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAnnouncementModal();
        }
    });

    // Fechar clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAnnouncementModal();
        }
    });
}

// FUNÇÃO PARA FECHAR O MODAL
function closeAnnouncementModal() {
    const modal = document.getElementById('announcementModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restaura scroll
        
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// FUNÇÃO PARA VERIFICAR SE DEVE MOSTRAR O MODAL
function shouldShowModal() {
    // Verificar se está habilitado
    if (!ANNOUNCEMENT_CONFIG.enabled) {
        return false;
    }

    // Verificar se deve mostrar apenas na homepage
    if (ANNOUNCEMENT_CONFIG.showOnlyOnHomepage) {
        const isHomepage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('/') || 
                          window.location.pathname === '';
        if (!isHomepage) {
            return false;
        }
    }

    // Verificar se deve mostrar apenas uma vez
    if (ANNOUNCEMENT_CONFIG.showOnce) {
        const hasSeenModal = localStorage.getItem('announcementModalSeen');
        if (hasSeenModal) {
            return false;
        }
    }

    return true;
}

// FUNÇÕES PÚBLICAS PARA CONTROLE MANUAL
window.showAnnouncementModal = function() {
    createAnnouncementModal();
};

window.closeAnnouncementModal = closeAnnouncementModal;

window.resetAnnouncementModal = function() {
    localStorage.removeItem('announcementModalSeen');
    console.log('Modal de avisos resetado - será exibido novamente na próxima visita');
};

window.toggleAnnouncementModal = function(enabled) {
    ANNOUNCEMENT_CONFIG.enabled = enabled;
    console.log(`Modal de avisos ${enabled ? 'habilitado' : 'desabilitado'}`);
};
