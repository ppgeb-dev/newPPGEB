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
    
    // CORREÇÃO: Adiciona data attribute para identificar se tem children
    if (hasChildren) {
        a.setAttribute('data-has-children', 'true');
    } else {
        a.setAttribute('data-has-children', 'false');
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
    
    // CORREÇÃO: Adiciona data attribute para identificar se tem children
    if (hasChildren) {
        a.setAttribute('data-has-children', 'true');
    } else {
        a.setAttribute('data-has-children', 'false');
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

// CORREÇÃO: Nova função para configurar dropdowns mobile após carregamento
function setupMobileDropdownsAfterLoad() {
    if (window.innerWidth <= 768) {
        // Remove todos os event listeners antigos
        const allLinks = document.querySelectorAll('.nav a');
        allLinks.forEach(link => {
            // Cria uma nova referência do elemento para remover todos os listeners
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
        });

        // Adiciona novos event listeners apenas para mobile
        const dropdowns = document.querySelectorAll('.dropdown');
        const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu');

        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const menu = dropdown.querySelector('.dropdown-menu');

            if (link && menu) {
                link.addEventListener('click', function(e) {
                    // CORREÇÃO: Verifica explicitamente se tem children
                    const hasChildren = this.getAttribute('data-has-children') === 'true';
                    
                    if (hasChildren) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // CORREÇÃO: Verifica se já está ativo para fazer toggle correto
                        const isCurrentlyActive = dropdown.classList.contains('active');
                        
                        // Fecha outros dropdowns do mesmo nível
                        dropdowns.forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                otherDropdown.classList.remove('active');
                                const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                                if (otherMenu) otherMenu.classList.remove('active');
                            }
                        });
                        
                        // CORREÇÃO: Toggle baseado no estado atual
                        if (isCurrentlyActive) {
                            dropdown.classList.remove('active');
                            menu.classList.remove('active');
                        } else {
                            dropdown.classList.add('active');
                            menu.classList.add('active');
                        }
                    }
                    // Se não tem children, deixa o comportamento padrão (navegar para o link)
                });
            }
        });

        dropdownSubmenus.forEach(submenu => {
            const link = submenu.querySelector('a');
            const menu = submenu.querySelector('.dropdown-menu');

            if (link && menu) {
                link.addEventListener('click', function(e) {
                    // CORREÇÃO: Verifica explicitamente se tem children
                    const hasChildren = this.getAttribute('data-has-children') === 'true';
                    
                    if (hasChildren) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // CORREÇÃO: Verifica se já está ativo para fazer toggle correto
                        const isCurrentlyActive = submenu.classList.contains('active');
                        
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
                        
                        // CORREÇÃO: Toggle baseado no estado atual
                        if (isCurrentlyActive) {
                            submenu.classList.remove('active');
                            menu.classList.remove('active');
                        } else {
                            submenu.classList.add('active');
                            menu.classList.add('active');
                        }
                    }
                    // Se não tem children, deixa o comportamento padrão (navegar para o link)
                });
            }
        });
    }
}

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

            // CORREÇÃO: Reconfigura dropdowns após carregar o menu
            setupMobileDropdownsAfterLoad();
            
            // NOVO: Configurar navegação após carregar o menu
            setupNavigationAfterLoad();
        })
        .catch(error => console.error("Erro ao montar menu:", error));
}

// NOVA FUNÇÃO: Configurar navegação após carregamento do menu
function setupNavigationAfterLoad() {
    // Função para forçar scroll ao topo absoluto
    function forceScrollToTop() {
        // Cancelar qualquer scroll em andamento
        window.cancelAnimationFrame(window.currentScrollAnimation);
        
        // Scroll imediato para garantir
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Scroll suave para melhor UX
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        
        // Verificação adicional após um delay
        setTimeout(() => {
            if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }
        }, 100);
        
        // Verificação final após animação completa
        setTimeout(() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 1000);
    }

    // Configurar todos os links de navegação
    document.querySelectorAll('.nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Tratamento específico para links Home/Inicio
            if (href === 'index.html#inicio' || 
                href === 'index.html' || 
                href === '#inicio' ||
                this.textContent.trim() === 'Home') {
                
                e.preventDefault();
                e.stopPropagation();
                
                // Se estivermos na página principal
                if (window.location.pathname.endsWith('index.html') || 
                    window.location.pathname.endsWith('/') || 
                    window.location.pathname === '' ||
                    window.location.href.includes('index.html')) {
                    
                    forceScrollToTop();
                    
                    // Fecha menu mobile
                    if (window.innerWidth <= 768 && document.getElementById('nav').classList.contains('active')) {
                        closeMenu();
                    }
                    return;
                } else {
                    // Se estivermos em outra página, navegar normalmente
                    window.location.href = 'index.html';
                    return;
                }
            }
            
            // Para outros links internos (#) - apenas se não for dropdown
            if (href && href.startsWith('#') && this.getAttribute('data-has-children') !== 'true') {
                const id = href.substring(1);
                const target = document.getElementById(id);
                
                if (target) {
                    e.preventDefault();
                    
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Fecha menu mobile
                    if (window.innerWidth <= 768 && document.getElementById('nav').classList.contains('active')) {
                        closeMenu();
                    }
                }
            }
        });
    });

    // Interceptar QUALQUER tentativa de scroll para #inicio
    window.addEventListener('hashchange', function() {
        if (window.location.hash === '#inicio') {
            forceScrollToTop();
        }
    });

    // Verificar se já estamos em #inicio ao carregar a página
    if (window.location.hash === '#inicio') {
        setTimeout(() => {
            forceScrollToTop();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('nav');

    // Fecha menu ao clicar fora
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            if (nav.classList.contains('active')) {
                closeMenu();
            }
        }
    });

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
        const dropdowns = document.querySelectorAll('.dropdown');
        const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu');
        
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

    // Torna as funções globais
    window.closeMenu = closeMenu;
    window.closeAllDropdowns = closeAllDropdowns;

    // Fecha menu mobile ao clicar em link que não seja dropdown
    document.addEventListener('click', function(e) {
        const link = e.target.closest('.nav a');
        if (link && window.innerWidth <= 768 && nav.classList.contains('active')) {
            // Só fecha se for um link normal (não dropdown) ou se não tem children
            if (link.getAttribute('data-has-children') !== 'true' && 
                link.getAttribute('href') !== '#' && 
                link.getAttribute('href') !== '') {
                closeMenu();
            }
        }
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
            setupMobileDropdownsAfterLoad();
        }, 250);
    });
});