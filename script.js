// CONFIGURAÇÃO DOS APPS
const appsConfig = [
    {
        id: 'cadastro',
        title: 'Cadastro',
        subtitle: 'Clientes',
        icon: 'fas fa-users',
        url: 'apps/CADASTRO/index.html',
        decoration: '✨',
        animation: 'decoration-float',
        category: 'gestao',
        favorite: false,
        order: 0
    },
    {
        id: 'catalogo',
        title: 'Catálogo',
        subtitle: 'Produtos',
        icon: 'fas fa-box-open',
        url: 'apps/CATALOGO/index.html',
        decoration: '📦',
        animation: 'decoration-pulse',
        category: 'vendas',
        favorite: false,
        order: 1
    },
    {
        id: 'emprestimos',
        title: 'Empréstimos',
        subtitle: 'Cálculos',
        icon: 'fas fa-hand-holding-usd',
        url: 'apps/EMPRESTIMOS/index.html',
        decoration: '💎',
        animation: 'decoration-rotate',
        category: 'financeiro',
        favorite: false,
        order: 2
    },
    {
        id: 'ferramentas',
        title: 'Ferramentas',
        subtitle: 'Utilitários',
        icon: 'fas fa-tools',
        url: 'apps/FERRAMENTAS/index.html',
        decoration: '🛠️',
        animation: 'decoration-bounce',
        category: 'utilidades',
        favorite: false,
        order: 3
    },
    {
        id: 'ferramentas-avancadas',
        title: 'Ferramentas Av.',
        subtitle: 'Avançadas',
        icon: 'fas fa-chart-line',
        url: 'apps/FERRAMENTAS_AVANCADAS/index.html',
        decoration: '📊',
        animation: 'decoration-shake',
        category: 'utilidades',
        favorite: false,
        order: 4
    },
    {
        id: 'produtos',
        title: 'Produtos',
        subtitle: 'Vendas',
        icon: 'fas fa-shopping-cart',
        url: 'apps/PRODUTOS/index.html',
        decoration: '🛒',
        animation: 'decoration-fade',
        category: 'vendas',
        favorite: false,
        order: 5
    },
    {
        id: 'renegociacao',
        title: 'Renegociação',
        subtitle: 'Dívidas',
        icon: 'fas fa-exchange-alt',
        url: 'apps/RENEGOCIACAO/index.html',
        decoration: '🔄',
        animation: 'decoration-float',
        category: 'financeiro',
        favorite: false,
        order: 6
    },
    {
        id: 'veiculos-automotores',
        title: 'Veículos',
        subtitle: 'Automotores',
        icon: 'fas fa-car',
        url: 'apps/VEICULOS AUTOMOTORES/index.html',
        decoration: '🚗',
        animation: 'decoration-pulse',
        category: 'veiculos',
        favorite: false,
        order: 7
    },
    {
        id: 'veiculos-eletricos',
        title: 'Veículos Elétricos',
        subtitle: 'Elétricos',
        icon: 'fas fa-bolt',
        url: 'apps/VEICULOS ELETRICOS/index.html',
        decoration: '⚡',
        animation: 'decoration-rotate',
        category: 'veiculos',
        favorite: false,
        order: 8
    },
    {
        id: 'compramos',
        title: 'Compramos',
        subtitle: 'Para Você',
        icon: 'fas fa-store',
        url: 'apps/COMPRAMOS/index.html',
        decoration: '🏪',
        animation: 'decoration-bounce',
        category: 'vendas',
        favorite: false,
        order: 9
    },
    {
        id: 'configuracao',
        title: 'Configurações',
        subtitle: 'Sistema',
        icon: 'fas fa-cogs',
        url: 'apps/CONFIGURACAO/index.html',
        decoration: '⚙️',
        animation: 'decoration-shake',
        category: 'sistema',
        favorite: false,
        order: 10
    },
    {
        id: 'ajuda',
        title: 'Ajuda',
        subtitle: 'Suporte',
        icon: 'fas fa-question-circle',
        url: 'apps/AJUDA/ajuda.html',
        decoration: '❓',
        animation: 'decoration-fade',
        category: 'sistema',
        favorite: false,
        order: 11
    }
];

// GERENCIADOR PRINCIPAL ATUALIZADO
class HomePageManager {
    constructor() {
        this.appsGrid = document.getElementById('apps-grid');
        this.emptyState = document.getElementById('emptyState');
        this.themeToggle = document.getElementById('themeToggle');
        this.closeAppBtn = document.getElementById('closeApp');
        this.statusMessage = document.getElementById('status-message');
        this.splashScreen = document.getElementById('splash-screen');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        
        this.currentApps = [];
        this.filteredApps = [];
        this.currentTheme = this.getStoredTheme();
        this.selectedApp = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Portal Profissional - Inicializando...');
        
        // Mostra loading indicator
        this.showLoading();
        
        await this.showSplashScreen();
        this.setupTheme();
        this.setupServiceWorker();
        this.loadApps();
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupResponsiveGrid();
        
        setTimeout(() => {
            document.body.classList.add('loaded');
            this.hideLoading();
            this.announceStatus('Portal carregado com sucesso');
        }, 800);
        
        console.log('✅ Portal profissional inicializado!');
    }

    // === LOADING INDICATOR CORRIGIDO ===
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
            this.loadingIndicator.style.animation = 'loading 2s ease-in-out';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            setTimeout(() => {
                this.loadingIndicator.style.display = 'none';
            }, 2000);
        }
    }

    // === SPLASH SCREEN ===
    async showSplashScreen() {
        return new Promise((resolve) => {
            if (this.splashScreen) {
                setTimeout(() => {
                    this.splashScreen.classList.add('splash-hidden');
                    setTimeout(() => {
                        this.splashScreen.remove();
                        resolve();
                    }, 500);
                }, 2000);
            } else {
                resolve();
            }
        });
    }

    // === SERVICE WORKER ===
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('✅ Service Worker registrado:', registration);
            } catch (error) {
                console.error('❌ Falha no Service Worker:', error);
            }
        }
    }

    // === TEMA CLARO/ESCURO SIMPLIFICADO ===
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
        localStorage.setItem('theme', this.currentTheme);
    }

    getStoredTheme() {
        const stored = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return stored || (systemPrefersDark ? 'dark' : 'light');
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setupTheme();
        this.announceStatus(`Tema ${this.currentTheme === 'dark' ? 'escuro' : 'claro'} ativado`);
        this.provideHapticFeedback();
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            icon.style.color = '#FFD700'; // Amarelo para sol
        } else {
            icon.className = 'fas fa-moon';
            icon.style.color = '#87CEEB'; // Azul céu para lua
        }
    }

    // === FECHAR APP ===
    setupCloseApp() {
        this.closeAppBtn.addEventListener('click', () => {
            this.closeApplication();
        });
    }

    closeApplication() {
        this.announceStatus('Fechando aplicativo');
        this.provideHapticFeedback();
        
        // Feedback visual no botão
        this.closeAppBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.closeAppBtn.style.transform = '';
        }, 150);
        
        // Para PWA standalone
        if (window.navigator.standalone) {
            window.blur();
            document.body.style.display = 'none';
        } 
        // Para navegador normal
        else if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
        
        // Fallback
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 1000);
    }

    // === APPS COM SELEÇÃO ===
    loadApps() {
        const savedApps = localStorage.getItem('portalAppsOrder');
        if (savedApps) {
            this.currentApps = JSON.parse(savedApps);
        } else {
            this.currentApps = [...appsConfig];
        }
        
        this.filteredApps = [...this.currentApps];
        this.renderApps();
        this.updateGridLayout();
    }

    renderApps() {
        this.appsGrid.innerHTML = '';
        
        if (this.filteredApps.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        this.filteredApps.forEach((app, index) => {
            const card = this.createAppCard(app, index);
            this.appsGrid.appendChild(card);
        });
    }

    createAppCard(app, index) {
        const card = document.createElement('a');
        card.href = app.url;
        card.className = 'home-card';
        card.setAttribute('aria-label', `${app.title} - ${app.subtitle}`);
        card.setAttribute('data-app-id', app.id);
        card.style.setProperty('--card-index', index);
        
        card.innerHTML = `
            <div class="card-icon"><i class="${app.icon}"></i></div>
            <div class="card-title">${app.title}</div>
            <div class="card-subtitle">${app.subtitle}</div>
            <div class="card-decoration ${app.animation}">${app.decoration}</div>
        `;

        card.addEventListener('click', (e) => this.handleAppClick(e, app, card));
        card.addEventListener('keydown', (e) => this.handleCardKeydown(e, app, card));
        card.addEventListener('focus', () => this.selectApp(app.id, card));
        card.addEventListener('blur', () => this.deselectApp(app.id, card));

        return card;
    }

    selectApp(appId, card) {
        // Remove seleção anterior
        if (this.selectedApp) {
            const previousCard = document.querySelector(`[data-app-id="${this.selectedApp}"]`);
            if (previousCard) {
                previousCard.classList.remove('selected');
            }
        }
        
        // Aplica nova seleção
        this.selectedApp = appId;
        card.classList.add('selected');
    }

    deselectApp(appId, card) {
        if (this.selectedApp === appId) {
            card.classList.remove('selected');
            this.selectedApp = null;
        }
    }

    handleAppClick(e, app, card) {
        e.preventDefault();
        
        // Mostra loading antes de navegar
        this.showLoading();
        
        // Feedback visual e háptico
        this.provideHapticFeedback();
        card.classList.add('haptic-feedback');
        setTimeout(() => {
            card.classList.remove('haptic-feedback');
        }, 300);
        
        this.selectApp(app.id, card);
        this.announceStatus(`Abrindo ${app.title}`);
        
        // Navega após animação
        setTimeout(() => {
            window.location.href = app.url;
        }, 300);
    }

    handleCardKeydown(e, app, card) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleAppClick(e, app, card);
        }
    }

    // === LAYOUT RESPONSIVO ===
    updateGridLayout() {
        const appCount = this.filteredApps.length;
        let gridClass = 'grid-12'; // padrão
        
        if (appCount <= 4) gridClass = 'grid-4';
        else if (appCount <= 6) gridClass = 'grid-6';
        else if (appCount <= 9) gridClass = 'grid-9';
        else if (appCount <= 12) gridClass = 'grid-12';
        else if (appCount <= 15) gridClass = 'grid-15';
        
        this.appsGrid.className = `home-grid ${gridClass}`;
    }

    setupResponsiveGrid() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateGridLayout();
            }, 250);
        });
    }

    // === FEEDBACK HÁPTICO ===
    provideHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    // === ESTADOS VISUAIS ===
    showEmptyState() {
        this.emptyState.classList.add('visible');
        this.appsGrid.style.display = 'none';
    }

    hideEmptyState() {
        this.emptyState.classList.remove('visible');
        this.appsGrid.style.display = 'grid';
    }

    // === ACESSIBILIDADE ===
    setupAccessibility() {
        this.detectAccessibilityPreferences();
        this.setupKeyboardNavigation();
    }

    detectAccessibilityPreferences() {
        // Texto maior
        const largeText = window.matchMedia('(prefers-contrast: high)');
        if (largeText.matches) {
            document.body.classList.add('large-text');
        }

        // Reduzir movimento
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotion.matches) {
            document.documentElement.style.setProperty('--transition', 'none');
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && document.activeElement.classList.contains('home-card')) {
                this.announceStatus('Navegando entre aplicativos');
            }
        });
    }

    setupEventListeners() {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.setupCloseApp();
        
        // Observador de tema do sistema
        const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        themeMedia.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.setupTheme();
            }
        });
    }

    // === FEEDBACK ===
    announceStatus(message) {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
            
            setTimeout(() => {
                this.statusMessage.textContent = '';
            }, 3000);
        }
    }
}

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona splash screen se não existir
    if (!document.getElementById('splash-screen')) {
        const splashScreen = document.createElement('div');
        splashScreen.id = 'splash-screen';
        splashScreen.innerHTML = `
            <div class="splash-container">
                <div class="splash-logo">🦇</div>
                <h1 class="splash-title">Portal de Cliente</h1>
                <p class="splash-subtitle">Encomenda Palotina</p>
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
            </div>
        `;
        document.body.appendChild(splashScreen);
    }

    window.homePageManager = new HomePageManager();
});

// === TRATAMENTO DE ERROS ===
window.addEventListener('error', (e) => {
    console.error('Erro no portal:', e.error);
});