// JavaScript para Menu Mobile e Interações - VERSÃO MELHORADA
document.addEventListener('DOMContentLoaded', function () {

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('nav');
    const dropdowns = document.querySelectorAll('.dropdown');
    const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu');



    // document.querySelectorAll('.dropdown > a').forEach(link => {
    //     link.addEventListener('click', function (e) {
    //         e.preventDefault();
    //         const parent = this.parentElement;

    //         // Fecha todos os outros dropdowns abertos
    //         document.querySelectorAll('.dropdown').forEach(drop => {
    //             if (drop !== parent) {
    //                 drop.classList.remove('active');
    //             }
    //         });

    //         // Alterna o dropdown atual
    //         parent.classList.toggle('active');
    //     });
    // });




    // Carrega o footer automaticamente
    carregarFooter();

    // Toggle menu mobile com melhorias
    mobileMenuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        nav.classList.toggle('active');
        document.body.classList.toggle('menu-open'); // Previne scroll do body
        
        // Anima o ícone do menu
        const icon = this.querySelector('span');
        if (nav.classList.contains('active')) {
            icon.innerHTML = '✕';
            icon.style.fontSize = '1.2rem';
        } else {
            icon.innerHTML = '☰';
            icon.style.fontSize = '1.5rem';
            // Fecha todos os dropdowns quando fecha o menu
            closeAllDropdowns();
        }
    });

    // Fecha menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            if (nav.classList.contains('active')) {
                closeMenu();
            }
        }
    });

    // Função para fechar o menu
    function closeMenu() {
        nav.classList.remove('active');
        document.body.classList.remove('menu-open');
        const icon = mobileMenuBtn.querySelector('span');
        icon.innerHTML = '☰';
        icon.style.fontSize = '1.5rem';
        closeAllDropdowns();
    }

    // Função para fechar todos os dropdowns
    function closeAllDropdowns() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.classList.remove('active');
        });

        dropdownSubmenus.forEach(submenu => {
            submenu.classList.remove('active');
            const menu = submenu.querySelector('.dropdown-menu');
            if (menu) menu.classList.remove('active');
        });
    }

    // Funcionalidade melhorada para dropdowns em mobile
    function setupMobileDropdowns() {
        // Remove listeners antigos
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            if (link) {
                link.removeEventListener('click', handleDropdownClick);
            }
        });

        dropdownSubmenus.forEach(submenu => {
            const link = submenu.querySelector('a');
            if (link) {
                link.removeEventListener('click', handleSubmenuClick);
            }
        });

        // Adiciona novos listeners apenas para mobile
        if (window.innerWidth <= 768) {
            dropdowns.forEach(dropdown => {
                const link = dropdown.querySelector('a');
                const menu = dropdown.querySelector('.dropdown-menu');

                if (link && menu) {
                    link.addEventListener('click', handleDropdownClick);
                }
            });

            dropdownSubmenus.forEach(submenu => {
                const link = submenu.querySelector('a');
                const menu = submenu.querySelector('.dropdown-menu');

                if (link && menu) {
                    link.addEventListener('click', handleSubmenuClick);
                }
            });
        }
    }

    function handleDropdownClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = this.closest('.dropdown');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        // Fecha outros dropdowns do mesmo nível
        dropdowns.forEach(otherDropdown => {
            if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove('active');
                const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                if (otherMenu) otherMenu.classList.remove('active');
            }
        });
        
        // Toggle do dropdown atual
        dropdown.classList.toggle('active');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    function handleSubmenuClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const submenu = this.closest('.dropdown-submenu');
        const menu = submenu.querySelector('.dropdown-menu');
        
        // Fecha outros submenus do mesmo nível
        const parentDropdown = submenu.closest('.dropdown');
        const siblingSubmenus = parentDropdown.querySelectorAll('.dropdown-submenu');
        
        siblingSubmenus.forEach(otherSubmenu => {
            if (otherSubmenu !== submenu) {
                otherSubmenu.classList.remove('active');
                const otherMenu = otherSubmenu.querySelector('.dropdown-menu');
                if (otherMenu) otherMenu.classList.remove('active');
            }
        });
        
        // Toggle do submenu atual
        submenu.classList.toggle('active');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    // Configuração inicial
    setupMobileDropdowns();

    // Fecha menu mobile ao clicar em link que não seja dropdown
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Só fecha se for um link normal (não dropdown) e estiver em mobile
            if (window.innerWidth <= 768 && 
                !this.closest('.dropdown') && 
                !this.closest('.dropdown-submenu') &&
                this.getAttribute('href') !== '#' && 
                this.getAttribute('href') !== '') {
                closeMenu();
            }
        });
    });

    // Reconfiguração no resize com debounce
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                // Desktop: remove classes mobile e fecha menu
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
                const icon = mobileMenuBtn.querySelector('span');
                icon.innerHTML = '☰';
                icon.style.fontSize = '1.5rem';
                closeAllDropdowns();
            }
            setupMobileDropdowns();
        }, 250);
    });

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

    // Scroll suave com compensação do header fixo
    document.querySelectorAll('.nav a[href^="#"], .nav a[href*="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === "#") return;

            const id = href.includes('#') ? href.split('#')[1] : null;
            const target = id ? document.getElementById(id) : null;

            if (target) {
                e.preventDefault();

                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;

                if (id === "inicio") {
                    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    if (scrollTop > 10) {
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    } else {
                        window.scrollBy({
                            top: 1,
                            behavior: 'auto'
                        });
                        setTimeout(() => {
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        }, 10);
                    }
                } else {
                    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }

                // Fecha menu mobile se estiver aberto
                if (window.innerWidth <= 768 && nav.classList.contains('active')) {
                    closeMenu();
                }
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
});

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

// carrega o menu via json
function carregarMenu(tipoMenu) {
    const caminho = `JSON/menu.json`;

    fetch(caminho)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar o arquivo JSON: " + caminho);
            return response.json();
        })
        .then(menuData => {
            const nav = document.querySelector("nav.nav#nav");
            if (!nav) {
                console.error("Elemento <nav class='nav' id='nav'> não encontrado.");
                return;
            }

            nav.innerHTML = ''; // Limpa conteúdo anterior

            // Filtra os itens do menu baseado no tipo solicitado
            const itensFiltrados = menuData.filter(item => {
                return item.tipo === tipoMenu || item.tipo === "A"; // Inclui tipo específico + tipo "A" (Ambos)
            });

            itensFiltrados.forEach(item => {
                nav.appendChild(criarItemPrincipal(item));
            });

            // Reconfigura dropdowns após carregar o menu
            setupMobileDropdownsAfterLoad();
        })
        .catch(error => console.error("Erro ao montar menu:", error));
}

// Função auxiliar para reconfigurar dropdowns após carregamento do menu
function setupMobileDropdownsAfterLoad() {
    if (window.innerWidth <= 768) {
        const dropdowns = document.querySelectorAll('.dropdown');
        const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu');

        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (link && menu) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdown = this.closest('.dropdown');
                    const menu = dropdown.querySelector('.dropdown-menu');
                    
                    dropdown.classList.toggle('active');
                    if (menu) {
                        menu.classList.toggle('active');
                    }
                });
            }
        });

        dropdownSubmenus.forEach(submenu => {
            const link = submenu.querySelector('a');
            const menu = submenu.querySelector('.dropdown-menu');

            if (link && menu) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const submenu = this.closest('.dropdown-submenu');
                    const menu = submenu.querySelector('.dropdown-menu');
                    
                    submenu.classList.toggle('active');
                    if (menu) {
                        menu.classList.toggle('active');
                    }
                });
            }
        });
    }
}

function criarItemPrincipal(item) {
    const li = document.createElement('li');
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) li.classList.add('dropdown');

    const a = document.createElement('a');
    a.href = item.link || "#";
    a.className = item.class || "";
    a.innerHTML = item.text;
    if (item.target && item.target !== "") {
        a.target = item.target;
    }
    li.appendChild(a);

    if (hasChildren) {
        const ul = document.createElement('ul');
        ul.classList.add('dropdown-menu');

        item.children.forEach(child => {
            ul.appendChild(criarItemSubmenu(child));
        });

        li.appendChild(ul);
    }

    return li;
}

function criarItemSubmenu(item) {
    const li = document.createElement('li');
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;

    if (hasChildren) li.classList.add('dropdown-submenu');

    const a = document.createElement('a');
    a.href = item.link || "#";
    a.className = item.class || "";
    a.innerHTML = item.text;
    if (item.target && item.target !== "") {
        a.target = item.target;
    }
    li.appendChild(a);

    if (hasChildren) {
        const ul = document.createElement('ul');
        ul.classList.add('dropdown-menu');

        item.children.forEach(grandchild => {
            const subLi = document.createElement('li');
            const subA = document.createElement('a');
            subA.href = grandchild.link || "#";
            subA.className = grandchild.class || "";
            subA.innerHTML = grandchild.text;
            if (grandchild.target && grandchild.target !== "") {
                subA.target = grandchild.target;
            }
            subLi.appendChild(subA);
            ul.appendChild(subLi);
        });

        li.appendChild(ul);
    }

    return li;
}