// CONFIGURAÇÃO DOS APPS - ESTILO WHATSAPP BUSINESS
const appsConfig = [
    {
        id: 'cadastro',
        title: 'Cadastro',
        subtitle: 'Clientes',
        icon: 'fas fa-users',
        color: '#8B5CF6',
        decoration: '✨',
        animation: 'decoration-float',
        delay: '0.2s'
    },
    {
        id: 'catalogo',
        title: 'Catálogo',
        subtitle: 'Produtos',
        icon: 'fas fa-box-open',
        color: '#06B6D4',
        decoration: '📦',
        animation: 'decoration-pulse',
        delay: '1.3s'
    },
    {
        id: 'emprestimos',
        title: 'Empréstimos',
        subtitle: 'Cálculos',
        icon: 'fas fa-hand-holding-usd',
        color: '#10B981',
        decoration: '💎',
        animation: 'decoration-rotate',
        delay: '0.8s'
    },
    {
        id: 'ferramentas',
        title: 'Ferramentas',
        subtitle: 'Utilitários',
        icon: 'fas fa-tools',
        color: '#F59E0B',
        decoration: '🛠️',
        animation: 'decoration-bounce',
        delay: '2.1s'
    },
    {
        id: 'ferramentas-avancadas',
        title: 'Ferramentas Av.',
        subtitle: 'Avançadas',
        icon: 'fas fa-chart-line',
        color: '#EF4444',
        decoration: '📊',
        animation: 'decoration-shake',
        delay: '1.7s'
    },
    {
        id: 'produtos',
        title: 'Produtos',
        subtitle: 'Vendas',
        icon: 'fas fa-shopping-cart',
        color: '#8B5CF6',
        decoration: '🛒',
        animation: 'decoration-fade',
        delay: '0.5s'
    },
    {
        id: 'renegociacao',
        title: 'Renegociação',
        subtitle: 'Dívidas',
        icon: 'fas fa-exchange-alt',
        color: '#06B6D4',
        decoration: '🔄',
        animation: 'decoration-float',
        delay: '2.5s'
    },
    {
        id: 'veiculos-automotores',
        title: 'Veículos',
        subtitle: 'Automotores',
        icon: 'fas fa-car',
        color: '#10B981',
        decoration: '🚗',
        animation: 'decoration-pulse',
        delay: '1.9s'
    },
    {
        id: 'veiculos-eletricos',
        title: 'Veículos Elétricos',
        subtitle: 'Elétricos',
        icon: 'fas fa-bolt',
        color: '#F59E0B',
        decoration: '⚡',
        animation: 'decoration-rotate',
        delay: '0.9s'
    },
    {
        id: 'compramos',
        title: 'Compramos',
        subtitle: 'Para Você',
        icon: 'fas fa-store',
        color: '#EF4444',
        decoration: '🏪',
        animation: 'decoration-bounce',
        delay: '2.8s'
    },
    {
        id: 'configuracao',
        title: 'Configurações',
        subtitle: 'Sistema',
        icon: 'fas fa-cogs',
        color: '#8B5CF6',
        decoration: '⚙️',
        animation: 'decoration-shake',
        delay: '1.2s'
    },
    {
        id: 'ajuda',
        title: 'Ajuda',
        subtitle: 'Suporte',
        icon: 'fas fa-question-circle',
        color: '#06B6D4',
        decoration: '❓',
        animation: 'decoration-fade',
        delay: '2.2s'
    }
];

// GERENCIADOR PRINCIPAL
class HomeManager {
    constructor() {
        this.appsGrid = document.getElementById('apps-grid');
        this.statusMessage = document.getElementById('status-message');
        this.themeToggle = document.getElementById('themeToggle');
        this.closeButton = document.getElementById('closeApp');
        this.currentApps = [];
        this.currentTheme = this.getStoredTheme() || 'dark';
        
        this.init();
    }

    init() {
        console.log('🎯 Portal Profissional - Iniciando...');
        
        this.applyTheme(this.currentTheme);
        this.loadApps();
        this.setupEventListeners();
        this.setupAccessibility();
        
        setTimeout(() => {
            document.body.classList.add('loaded');
            this.announceStatus('Portal carregado com sucesso');
        }, 800);
        
        console.log('✅ Portal profissional inicializado!');
    }

    // ===== SISTEMA DE TEMAS =====
    getStoredTheme() {
        return localStorage.getItem('app-theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('app-theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Atualizar ícone do botão de tema
        const themeIcon = this.themeToggle.querySelector('i');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        this.setStoredTheme(theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.announceStatus(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado`);
    }

    // ===== GERENCIAMENTO DE APPS =====
    loadApps() {
        this.currentApps = [...appsConfig];
        this.renderApps();
        this.updateGridLayout();
    }

    renderApps() {
        this.appsGrid.innerHTML = '';
        
        this.currentApps.forEach((app, index) => {
            const card = this.createAppCard(app, index);
            this.appsGrid.appendChild(card);
        });
    }

    createAppCard(app, index) {
        const card = document.createElement('button');
        card.className = 'home-card';
        card.setAttribute('aria-label', `${app.title} - ${app.subtitle}`);
        card.style.setProperty('--card-index', index);
        
        card.innerHTML = `
            <div class="card-icon" style="background: linear-gradient(135deg, ${app.color}, var(--secondary)); -webkit-background-clip: text;">
                <i class="${app.icon}"></i>
            </div>
            <div class="card-title">${app.title}</div>
            <div class="card-subtitle">${app.subtitle}</div>
            <div class="card-decoration ${app.animation}" style="animation-delay: ${app.delay};">${app.decoration}</div>
        `;

        card.addEventListener('click', () => this.handleAppClick(app));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.handleAppClick(app);
            }
        });

        return card;
    }

    handleAppClick(app) {
        this.announceStatus(`Abrindo ${app.title}`);
        
        // Simulação de navegação - você pode integrar com seu sistema de rotas
        console.log(`Navegando para: ${app.id}`);
        
        // Feedback visual
        const event = new CustomEvent('appNavigation', { 
            detail: { appId: app.id, appName: app.title }
        });
        window.dispatchEvent(event);
    }

    updateGridLayout() {
        const appCount = this.currentApps.length;
        let gridClass = 'grid-12'; // padrão
        
        if (appCount <= 4) gridClass = 'grid-4';
        else if (appCount <= 6) gridClass = 'grid-6';
        else if (appCount <= 9) gridClass = 'grid-9';
        else if (appCount <= 12) gridClass = 'grid-12';
        else if (appCount <= 15) gridClass = 'grid-15';
        
        this.appsGrid.className = 'home-grid ' + gridClass;
    }

    // ===== FECHAR APLICATIVO =====
    closeApplication() {
        this.announceStatus('Fechando aplicativo...');
        
        // Efeito visual de fechamento
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (window.close) {
                window.close();
            } else {
                // Fallback para mobile ou navegadores que não permitem window.close()
                window.history.back();
                this.announceStatus('Use o botão voltar do seu dispositivo para sair');
            }
        }, 300);
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    setupEventListeners() {
        // Tema
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Fechar aplicativo
        this.closeButton.addEventListener('click', () => this.closeApplication());
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeApplication();
            }
        });
        
        // Responsividade
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateGridLayout();
            }, 250);
        });
    }

    // ===== ACESSIBILIDADE =====
    setupAccessibility() {
        // Navegação por teclado entre cards
        document.addEventListener('keydown', (e) => {
            const focused = document.activeElement;
            const cards = Array.from(document.querySelectorAll('.home-card'));
            
            if (!cards.includes(focused)) return;
            
            const currentIndex = cards.indexOf(focused);
            
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    cards[(currentIndex + 1) % cards.length].focus();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    cards[(currentIndex - 1 + cards.length) % cards.length].focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    const nextRow = (currentIndex + 3) % cards.length;
                    cards[nextRow].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevRow = (currentIndex - 3 + cards.length) % cards.length;
                    cards[prevRow].focus();
                    break;
            }
        });

        // Detectar preferências de acessibilidade
        this.detectAccessibilityPreferences();
    }

    detectAccessibilityPreferences() {
        // Texto maior
        const highContrast = window.matchMedia('(prefers-contrast: high)');
        if (highContrast.matches) {
            document.body.classList.add('large-text');
        }

        // Redução de movimento
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches) {
            document.documentElement.style.setProperty('--transition', 'none');
        }
    }

    // ===== UTILITÁRIOS =====
    announceStatus(message) {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
            setTimeout(() => {
                this.statusMessage.textContent = '';
            }, 3000);
        }
    }

    navigateTo(appId) {
        this.announceStatus(`Navegando para ${appId}`);
        // Integre com seu sistema de rotas aqui
        console.log(`Navegação para: ${appId}`);
    }
}

// ===== INICIALIZAÇÃO =====
let appManager;

document.addEventListener('DOMContentLoaded', () => {
    appManager = new HomeManager();
    window.appManager = appManager;
});

// Tratamento de erros global
window.addEventListener('error', (e) => {
    console.error('Erro no portal:', e.error);
    if (appManager) {
        appManager.announceStatus('Ocorreu um erro inesperado');
    }
});