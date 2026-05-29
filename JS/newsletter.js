// Parser customizado para converter Markdown com tags especiais em HTML
class NewsletterRenderer {
  constructor(basePath = '') {
    this.basePath = basePath;
    this.content = '';
    this.currentNewsletter = 'newsletter.md';
  }

  async fetchMarkdown(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Erro ao carregar ${filePath}`);
      return await response.text();
    } catch (error) {
      console.error('Erro ao buscar arquivo markdown:', error);
      return '';
    }
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = content.match(frontmatterRegex);
    
    if (!match) return { metadata: {}, content: content };
    
    const metadata = {};
    const frontmatterLines = match[1].split('\n');
    frontmatterLines.forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        metadata[key] = value.replace(/^["']|["']$/g, '');
      }
    });

    return {
      metadata,
      content: content.replace(frontmatterRegex, '')
    };
  }

  parseMarkdown(content) {
    // Remover linhas em branco duplicadas
    content = content.replace(/\n\n+/g, '\n\n');

    // Processar tags customizadas primeiro
    content = this.processNewsletterHeader(content);
    content = this.processImages(content);
    content = this.processAlerts(content);
    content = this.processCTAButtons(content);
    content = this.processBlockquotes(content);
    content = this.processInterviews(content);

    // Processar markdown padrão
    const sections = content.split('\n---\n').map(section => {
      return this.parseSection(section);
    });

    return `
      <section class="features pt-m">
        <div class="container">
          ${sections.join('')}
        </div>
      </section>
    `;
  }

  processNewsletterHeader(content) {
    return content.replace(/\[NEWSLETTER_HEADER\]([\s\S]*?)\[\/NEWSLETTER_HEADER\]/g, (match, text) => {
      return `<div class="titles">
        <div class="newsletter-header-container">
          <div class="header-top-row">
            <div class="edition-selector-container">
              <span class="edition-label">Edição:</span>
              <div class="custom-select-wrapper">
                <select id="newsletterSelect" class="semester-select">
                  <option disabled selected>Carregando...</option>
                </select>
              </div>
            </div>
          </div>
          <div class="header-bottom-row">
            <div class="newsletter-title-block">
              <h1>Newsletter PPG Engenharia Biomédica - UNIFESP</h1>
            </div>
          </div>
        </div>
      </div>`;
    });
  }

  processImages(content) {
    // IMAGE_LARGE
    content = content.replace(/\[IMAGE_LARGE\|(.*?)\|(.*?)\]([\s\S]*?)\[\/IMAGE_LARGE\]/g, (match, src, alt, caption) => {
      return `<div class="newsletter-image-container">
        <img src="${src}" alt="${alt}" class="newsletter-image-large">
        <p class="newsletter-image-caption">${caption.trim()}</p>
      </div>`;
    });

    // IMAGE_MEDIUM
    content = content.replace(/\[IMAGE_MEDIUM\|(.*?)\|(.*?)\]([\s\S]*?)\[\/IMAGE_MEDIUM\]/g, (match, src, alt, caption) => {
      return `<div class="newsletter-image-container">
        <img src="${src}" alt="${alt}" class="newsletter-image-medium">
        <p class="newsletter-image-caption">${caption.trim()}</p>
      </div>`;
    });

    // IMAGE_SMALL
    content = content.replace(/\[IMAGE_SMALL\|(.*?)\|(.*?)\]([\s\S]*?)\[\/IMAGE_SMALL\]/g, (match, src, alt, caption) => {
      return `<div class="newsletter-image-container">
        <img src="${src}" alt="${alt}" class="newsletter-image-small">
        ${caption.trim() ? `<p class="newsletter-image-caption">${caption.trim()}</p>` : ''}
      </div>`;
    });

    return content;
  }

  processAlerts(content) {
    return content.replace(/\[ALERT\|(.*?)\]([\s\S]*?)\[\/ALERT\]/g, (match, type, text) => {
      return `<div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); border-left: 5px solid #ea580c; padding: 1.5rem; margin: 2rem 0; border-radius: 12px; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.2);">
        <p style="margin: 0; font-size: 1.1rem; color: #856404; text-align: center;">
          <strong>${text.trim().split('\n')[0]}</strong>
        </p>
        ${text.trim().split('\n').slice(1).map(line => `<p style="margin: 0.5rem 0 0 0; font-size: 1rem; color: #856404; text-align: center;">${line.trim()}</p>`).join('')}
      </div>`;
    });
  }

  processCTAButtons(content) {
    return content.replace(/\[CTA\|(.*?)\|(.*?)\|(.*?)\]/g, (match, style, url, text) => {
      const btnClass = style === 'primary' ? 'btn btn-primary' : 'btn btn-secondary';
      return `<div class="cta-buttons" style="justify-content: center; margin-top: 2rem;">
        <a href="${url}" target="_blank" class="${btnClass}" style="color: #ffffff !important;">
          ${text}
        </a>
      </div>`;
    });
  }

  processMeetingAlert(content) {
    return content.replace(/\[MEETING_ALERT\|(.*?)\|(.*?)\|(.*?)\]/g, (match, title, date, time) => {
      return `
        <section class="features" style="background-color: #f8fafc; padding: 2rem 0;">
          <div class="container">
            <div style="background-color: #FFFBF0; border-left: 6px solid #ea580c; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); text-align: center;">
              <div style="margin-bottom: 1.5rem;">
                <span style="font-size: 40px;">📋</span>
              </div>
              <h3 style="color: #92600A; margin: 0 0 1.5rem 0; font-size: 1.6rem; font-weight: 800; letter-spacing: 0.5px;">${title.trim()}</h3>
              <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: #92600A; font-size: 1.2rem; font-weight: 600;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span>📅</span> <strong>Data:</strong> ${date.trim()}
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span>🕒</span> <strong>Horário:</strong> ${time.trim()}
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    });
  }

  processBlockquotes(content) {
    return content.replace(/\[BLOCKQUOTE\]([\s\S]*?)\[\/BLOCKQUOTE\]/g, (match, text) => {
      return `<blockquote style="border-left: 5px solid var(--primary-blue); padding: 1rem 2rem; margin: 2rem 0; background: var(--light-bg); font-style: italic; font-size: 1.1rem;">
        <p>${text.trim()}</p>
      </blockquote>`;
    });
  }

  processInterviews(content) {
    // Converter P: para classe de pergunta e Thiago: para resposta
    content = content.replace(/\*\*P:\s+(.*?)\*\*/g, '<p class="interview-question">$1</p>');
    content = content.replace(/\*\*Thiago:\s+(.*?)\*\*/g, '<p><span class="interview-answer-name">Thiago:</span> $1</p>');
    return content;
  }

  parseSection(section) {
    const lines = section.split('\n');
    let html = '';
    let currentParagraph = [];
    let inFeatureCard = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pular linhas vazias
      if (!line.trim()) {
        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        continue;
      }

      // Heading nivel 1
      if (line.startsWith('# ')) {
        const title = line.replace(/^#\s+/, '').trim();
        
        // Pular títulos estruturais que agora estão no header dinâmico
        if (title.toLowerCase() === 'seção principal' || title.toLowerCase() === 'cabeçalho') {
          continue;
        }

        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        
        html += `<div class="selection-header"><h2>${title}</h2></div>`;
        if (!inFeatureCard) {
          html += '<div class="feature-card mt-m">';
          inFeatureCard = true;
        }
        continue;
      }

      // Heading nivel 2
      if (line.startsWith('## ')) {
        const title = line.replace(/^##\s+/, '').trim();
        
        // Pular títulos estruturais
        if (title.toLowerCase() === 'cabeçalho' || title.toLowerCase() === 'seção principal') {
          continue;
        }

        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }

        if (!inFeatureCard) {
          html += '<div class="feature-card mt-m">';
          inFeatureCard = true;
        }
        
        // Extrair emoji se estiver no início
        const emojiMatch = title.match(/^[\u{1F300}-\u{1F9FF}]\s+/u);
        if (emojiMatch) {
          const emoji = emojiMatch[0].trim();
          const titleText = title.replace(emojiMatch[0], '').trim();
          html += `<div class="display-flex-align-items-center">
            <span style="font-size: 48px; margin-right: 1rem;">${emoji}</span>
            <h3>${titleText}</h3>
          </div>`;
        } else {
          html += `<h3>${title}</h3>`;
        }
        continue;
      }

      // Heading nivel 3 (Casos de Sucesso, etc)
      if (line.startsWith('### ')) {
        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        const title = line.replace(/^###\s+/, '').trim();
        html += `<h4>${title}</h4>`;
        continue;
      }

      // Linhas com tags HTML customizadas
      if (line.includes('<div') || line.includes('<img') || line.includes('<blockquote') || line.includes('<a href')) {
        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        html += line;
        continue;
      }

      // Linhas que começam com <
      if (line.trim().startsWith('<')) {
        if (currentParagraph.length > 0) {
          html += `<p>${currentParagraph.join(' ')}</p>`;
          currentParagraph = [];
        }
        html += line;
        continue;
      }

      // Processar linhas de parágrafo
      if (line.trim()) {
        // Processar markdown inline
        let processedLine = this.processInlineMarkdown(line);
        currentParagraph.push(processedLine);
      }
    }

    if (currentParagraph.length > 0) {
      html += `<p>${currentParagraph.join(' ')}</p>`;
    }

    if (inFeatureCard) {
      html += '</div>';
    }

    // Adicionar <hr> entre seções
    if (html.includes('<h2') || html.includes('<h3')) {
      html += '<hr>';
    }

    return html;
  }

  processInlineMarkdown(text) {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(/\_(.*?)\_/g, '<em>$1</em>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="feature-link">$1</a>');
    
    return text;
  }

  async render(filePath = 'newsletter.md') {
    this.currentNewsletter = filePath;
    const markdownContent = await this.fetchMarkdown(filePath);
    
    if (!markdownContent) {
      return '<p>Erro ao carregar o conteúdo da newsletter.</p>';
    }

    let { metadata, content } = this.parseFrontmatter(markdownContent);
    content = this.processMeetingAlert(content);
    content = this.processAlerts(content);
    content = this.processCTAButtons(content);
    content = this.processBlockquotes(content);

    const html = this.parseMarkdown(content);

    return html;
  }
}

class MenuManager {
  constructor(basePath = '') {
    this.basePath = basePath;
    this.renderer = new NewsletterRenderer(basePath);
    this.menuData = null;
    this.currentFilePath = null;
  }

  async loadMenuData() {
    try {
      // Se basePath estiver vazio, estamos na subpasta e precisamos subir um nível para achar a pasta JSON
      // Se basePath tiver valor (ex: 'newslatter/'), estamos na raiz e a pasta JSON está aqui
      const jsonPath = this.basePath === '' ? '../JSON/newsletters.json' : 'JSON/newsletters.json';
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error(`Erro ao carregar ${jsonPath}`);
      this.menuData = await response.json();
      return this.menuData;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.menuData = { newsletters: [], usefulLinks: [] };
      return this.menuData;
    }
  }

  populateSelector() {
    const selector = document.getElementById('newsletterSelect');
    if (!selector || !this.menuData.newsletters) return;

    selector.innerHTML = '';
    
    const sortedNewsletters = [...this.menuData.newsletters].sort((a, b) => b.edition - a.edition);

    sortedNewsletters.forEach(newsletter => {
      const option = document.createElement('option');
      option.value = newsletter.file;
      option.textContent = newsletter.title;
      if (newsletter.file === this.currentFilePath) {
        option.selected = true;
      }
      selector.appendChild(option);
    });

    selector.addEventListener('change', (e) => {
      this.loadNewsletter(e.target.value);
    });
  }

  renderMenu() {
    if (!this.menuData) return;

    const menuContent = document.getElementById('menu-content');
    if (!menuContent) return;

    let html = '';

    // Seção de Edições Disponíveis
    if (this.menuData.newsletters && this.menuData.newsletters.length > 0) {
      html += '<div class="menu-section">';
      html += '<h3>📅 Edições Disponíveis</h3>';
      
      const sortedNewsletters = [...this.menuData.newsletters].sort((a, b) => b.edition - a.edition);
      sortedNewsletters.forEach(newsletter => {
        const activeClass = newsletter.file === this.currentFilePath ? 'active' : '';
        html += `
          <button class="menu-item ${activeClass}" 
                  data-newsletter="${newsletter.file}" 
                  data-month="${newsletter.month}"
                  data-id="${newsletter.id}">
            ${newsletter.title}
          </button>
        `;
      });
      
      html += '</div>';
    }

    // Seção de Links Úteis
    if (this.menuData.usefulLinks && this.menuData.usefulLinks.length > 0) {
      html += '<div class="menu-section">';
      html += '<h3>🔗 Links Úteis</h3>';
      
      this.menuData.usefulLinks.forEach(link => {
        html += `<a href="${link.url}" class="menu-item">${link.title}</a>`;
      });
      
      html += '</div>';
    }

    menuContent.innerHTML = html;
  }

  attachEventListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = document.querySelectorAll('.menu-item[data-newsletter]');

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebarMenu.classList.add('active');
        menuOverlay.classList.add('active');
      });
    }

    if (closeMenu) {
      closeMenu.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    if (menuOverlay) {
      menuOverlay.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Selecionar newsletter via menu lateral (se existir)
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const newsletter = item.getAttribute('data-newsletter');
        this.loadNewsletter(newsletter);
        
        this.closeMenu();
        window.scrollTo(0, 0);
      });
    });
  }

  closeMenu() {
    const sidebarMenu = document.getElementById('sidebar-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    if (sidebarMenu) sidebarMenu.classList.remove('active');
    if (menuOverlay) menuOverlay.classList.remove('active');
  }

  async loadNewsletter(filePath) {
    const container = document.getElementById('newsletter-content');
    if (!container) return;
    
    this.currentFilePath = filePath;
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Carregando newsletter...</p>';
    
    const html = await this.renderer.render(`${this.basePath}${filePath}`);
    container.innerHTML = html;
    
    // Repopular e atualizar menu após renderizar
    this.populateSelector();
    this.renderMenu();
    this.attachEventListeners();
  }

  async init() {
    const data = await this.loadMenuData();
    
    // Carregar a newsletter com a edição mais recente inicialmente
    const activeNewsletters = data.newsletters.filter(n => n.active);
    const activeNewsletter = activeNewsletters.sort((a, b) => b.edition - a.edition)[0] || data.newsletters[0];
    if (activeNewsletter) {
      await this.loadNewsletter(activeNewsletter.file);
    }
  }
}

// A inicialização agora deve ser feita manualmente no HTML para permitir passar o basePath
// Exemplo: const menuManager = new MenuManager('newslatter/');
// await menuManager.init();
