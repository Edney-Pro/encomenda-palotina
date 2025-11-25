/**
 * KERNEL LOADER V2.2 - Com Suporte a Tipos de Página (Root, Categoria, App)
 */

function getRootPath() {
    const depth = window.location.pathname.split('/').length - 2;
    return "../".repeat(depth > 0 ? depth : 0);
}
const ROOT = getRootPath();

// 1. INJEÇÃO DE CSS
const coreStyle = document.createElement('link');
coreStyle.rel = 'stylesheet';
coreStyle.href = `${ROOT}core/styles/styles.css`;
document.head.appendChild(coreStyle);

// 2. LAYOUT FIXO
const fixedLayoutCSS = document.createElement('style');
fixedLayoutCSS.textContent = `
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden !important; background-color: var(--bg-primary, #111827); }
    #kernel-layout { display: flex; flex-direction: column; height: 100dvh; }
    #kernel-header { flex: 0 0 auto; z-index: 1000; }
    #kernel-content { flex: 1; overflow-y: auto; position: relative; -webkit-overflow-scrolling: touch; padding-bottom: 80px; }
    #kernel-footer { flex: 0 0 auto; position: fixed; bottom: 0; width: 100%; z-index: 1000; }
`;
document.head.appendChild(fixedLayoutCSS);

// 3. CARREGAMENTO INTELIGENTE
async function loadLayoutComponent(path, targetId) {
    try {
        const response = await fetch(`${ROOT}core/layouts/${path}`);
        if(!response.ok) throw new Error('Falha');
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
        if(targetId === 'kernel-header') setupThemeToggle();
        // Se carregou o footer de app, executa scripts dele
        if(path === 'footer-app.html') {
             const scripts = document.getElementById(targetId).querySelectorAll("script");
             scripts.forEach(oldScript => {
                 const newScript = document.createElement("script");
                 newScript.textContent = oldScript.textContent;
                 document.body.appendChild(newScript);
             });
        }
    } catch (e) {
        console.error(`Erro ao carregar ${path}:`, e);
    }
}

// 4. DETECTAR TIPO DE PÁGINA
function getPageType() {
    // Procura por uma meta tag ou atributo no body
    const type = document.body.getAttribute('data-page-type');
    if (type) return type;
    
    // Fallback baseado na URL
    const path = window.location.pathname;
    if (path === '/' || path.endsWith('index.html') && path.split('/').length < 3) return 'root';
    return 'category'; // Padrão seguro
}

// 5. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('kernel-layout')) {
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = `
            <div id="kernel-layout">
                <div id="kernel-header"></div>
                <main id="kernel-content">${originalContent}</main>
                <div id="kernel-footer"></div>
            </div>
        `;
    }

    const pageType = getPageType();
    console.log('Kernel detectou página:', pageType);

    // Carrega HEADER (Padrão para todos, mas podemos mudar o título via JS depois)
    await loadLayoutComponent('header.html', 'kernel-header');

    // Carrega FOOTER baseado no tipo
    if (pageType === 'root') {
        await loadLayoutComponent('footer-tabs.html', 'kernel-footer');
    } else if (pageType === 'app') {
        await loadLayoutComponent('footer-app.html', 'kernel-footer');
    } else {
        // Categorias e Grupos
        await loadLayoutComponent('footer-simple.html', 'kernel-footer');
    }

    // Ajusta Título do Header Automaticamente
    setTimeout(() => {
        const pageTitle = document.title.split('|')[0].trim();
        const headerTitle = document.querySelector('.header-title');
        const headerSubtitle = document.querySelector('.header-subtitle');
        
        if (headerTitle && pageType !== 'root') {
            headerTitle.textContent = pageTitle;
            // Tenta pegar subtítulo se existir
            if(headerSubtitle) headerSubtitle.textContent = 'Encomenda Palotina';
        }
    }, 100);
});

function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if(btn) {
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
        const saved = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
    }
}