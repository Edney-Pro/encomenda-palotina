// === CONFIGURAÇÃO AVANÇADA DO SISTEMA ===
const APP_CONFIG = {
    version: '2.0.0',
    debug: false,
    cache: {
        enabled: true,
        duration: 24 * 60 * 60 * 1000 // 24 horas
    },
    features: {
        hapticFeedback: true,
        analytics: false,
        offlineSupport: true,
        appValidation: true
    }
};

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

// === GERENCIADOR PRINCIPAL ATUALIZADO ===
class HomePageManager {
    constructor() {
        this.appsGrid = document.getElementById('apps-grid');
        this.emptyState = document.getElementById('emptyState');
        this.themeToggle = document.getElementById('themeToggle');
        this.statusMessage = document.getElementById('status-message');
        this.splashScreen = document.getElementById('splash-screen');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        this.offlineIndicator = document.getElementById('offline-indicator');
        this.mainContent = document.getElementById('main-content');
        
        this.currentApps = [];
        this.filteredApps = [];
        this.currentTheme = this.getStoredTheme();
        this.selectedApp = null;
        this.lastClickTime = 0;
        this.clickDelay = 300; // Prevenir clique duplo
        
        this.init();
    }

    async init() {
        console.log(`🚀 Portal Profissional v${APP_CONFIG.version} - Inicializando...`);
        
        try {
            // Mostra loading indicator
            this.showLoading();
            
            await this.showSplashScreen();
            this.setupTheme();
            await this.setupServiceWorker();
            this.setupOfflineDetection();
            this.loadApps();
            this.setupEventListeners();
            this.setupAccessibility();
            this.setupResponsiveGrid();
            this.setupPerformanceMonitoring();
            
            setTimeout(() => {
                document.body.classList.add('loaded');
                this.hideLoading();
                this.announceStatus('Portal carregado com sucesso');
                this.trackEvent('portal_loaded');
                
                // Foco no conteúdo principal para acessibilidade
                if (this.mainContent) {
                    this.mainContent.focus();
                }
            }, 800);
            
            console.log('✅ Portal profissional inicializado!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.handleInitError(error);
        }
    }

    // === TRATAMENTO DE ERROS DE INICIALIZAÇÃO ===
    handleInitError(error) {
        this.hideLoading();
        
        // Fallback básico
        const errorHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-primary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--warning);"></i>
                <h2 style="margin-bottom: 1rem;">Erro no Carregamento</h2>
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                    O portal encontrou um problema. Tente recarregar a página.
                </p>
                <button onclick="window.location.reload()" style="
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    Recarregar Página
                </button>
            </div>
        `;
        
        if (this.appsGrid) {
            this.appsGrid.innerHTML = errorHTML;
        }
        
        this.trackEvent('init_error', { error: error.message });
    }

    // === MONITORAMENTO DE PERFORMANCE ===
    setupPerformanceMonitoring() {
        // Monitora erros não capturados
        window.addEventListener('error', (e) => {
            console.error('Erro não capturado:', e.error);
            this.trackEvent('error', { 
                message: e.error?.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Monitora promessas rejeitadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promessa rejeitada:', e.reason);
            this.trackEvent('promise_rejection', { reason: e.reason?.message });
        });

        // Monitora visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
            }
        });

        // Monitora performance de carregamento
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                this.trackEvent('performance_load', { loadTime });
            });
        }
    }

    // === LOADING INDICATOR CORRIGIDO ===
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
            this.loadingIndicator.style.animation = 'loading 2s ease-in-out';
        }
    }

    showQuickLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
            this.loadingIndicator.classList.add('quick');
            this.loadingIndicator.style.animation = 'loading 0.8s ease-in-out';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            setTimeout(() => {
                this.loadingIndicator.style.display = 'none';
                this.loadingIndicator.classList.remove('quick');
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
                        if (this.splashScreen.parentNode) {
                            this.splashScreen.remove();
                        }
                        resolve();
                    }, 500);
                }, 2000);
            } else {
                resolve();
            }
        });
    }

    // === SERVICE WORKER ATUALIZADO ===
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Verifica se estamos em localhost ou HTTPS
                if (location.hostname === 'localhost' || location.protocol === 'https:') {
                    const registration = await navigator.serviceWorker.register('./service-worker.js');
                    console.log('✅ Service Worker registrado:', registration.scope);
                    
                    // Verifica atualizações
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('🔄 Nova versão do Service Worker encontrada');
                        this.trackEvent('sw_update_found');
                    });
                } else {
                    console.warn('⚠️ Service Worker não suportado em HTTP');
                }
            } catch (error) {
                console.error('❌ Falha no Service Worker:', error);
                this.trackEvent('sw_error', { error: error.message });
            }
        }
    }

    // === DETECÇÃO DE OFFLINE ===
    setupOfflineDetection() {
        if (!APP_CONFIG.features.offlineSupport) return;

        window.addEventListener('online', () => {
            this.announceStatus('Conexão restaurada');
            document.body.classList.remove('offline');
            this.trackEvent('online');
        });

        window.addEventListener('offline', () => {
            this.announceStatus('Você está offline');
            document.body.classList.add('offline');
            this.trackEvent('offline');
        });

        // Verifica status inicial
        if (!navigator.onLine) {
            document.body.classList.add('offline');
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
        this.trackEvent('theme_toggle', { theme: this.currentTheme });
    }

    updateThemeIcon() {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-sun';
            icon.style.color = '#FFD700';
        } else {
            icon.className = 'fas fa-moon';
            icon.style.color = '#87CEEB';
        }
    }

    // === APPS COM CACHE INTELIGENTE ===
    loadApps() {
        try {
            const savedApps = localStorage.getItem('portalAppsOrder');
            const cacheTimestamp = localStorage.getItem('portalAppsCacheTime');
            const now = Date.now();
            
            // Verifica se o cache é válido
            if (savedApps && cacheTimestamp && 
                (now - parseInt(cacheTimestamp)) < APP_CONFIG.cache.duration) {
                this.currentApps = JSON.parse(savedApps);
                console.log('📦 Apps carregados do cache');
            } else {
                this.currentApps = [...appsConfig];
                this.saveAppsToCache();
                console.log('🔄 Apps carregados da configuração');
            }
            
            this.filteredApps = [...this.currentApps];
            this.renderApps();
            this.updateGridLayout();
            
        } catch (error) {
            console.error('❌ Erro ao carregar apps:', error);
            // Fallback para configuração padrão
            this.currentApps = [...appsConfig];
            this.filteredApps = [...this.currentApps];
            this.renderApps();
            this.updateGridLayout();
        }
    }

    saveAppsToCache() {
        try {
            localStorage.setItem('portalAppsOrder', JSON.stringify(this.currentApps));
            localStorage.setItem('portalAppsCacheTime', Date.now().toString());
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar cache dos apps:', error);
        }
    }

    renderApps() {
        if (!this.appsGrid) return;
        
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
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.style.setProperty('--card-index', index);
        
        card.innerHTML = `
            <div class="card-icon"><i class="${app.icon}" aria-hidden="true"></i></div>
            <div class="card-title">${app.title}</div>
            <div class="card-subtitle">${app.subtitle}</div>
            <div class="card-decoration ${app.animation}" aria-hidden="true">${app.decoration}</div>
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

    // === CLIQUE PREVENÇÃO DE DUPLO CLIQUE ===
    handleAppClick(e, app, card) {
        const now = Date.now();
        
        // Prevenir clique duplo
        if (now - this.lastClickTime < this.clickDelay) {
            e.preventDefault();
            return;
        }
        this.lastClickTime = now;
        
        e.preventDefault();
        
        // Mostra loading rápido
        this.showQuickLoading();
        
        // Feedback visual e háptico
        this.provideHapticFeedback();
        card.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
        
        this.selectApp(app.id, card);
        this.announceStatus(`Abrindo ${app.title}`);
        this.trackEvent('app_click', { app: app.id });
        
        // Navega após animação
        setTimeout(() => {
            if (APP_CONFIG.features.appValidation) {
                // Verifica se o app existe antes de navegar
                this.checkAppAvailability(app.url)
                    .then((available) => {
                        if (available) {
                            window.location.href = app.url;
                        } else {
                            this.showAppError(app);
                        }
                    })
                    .catch(() => {
                        this.showAppError(app);
                    });
            } else {
                // Navegação direta sem verificação
                window.location.href = app.url;
            }
        }, 300);
    }

    // === VERIFICA DISPONIBILIDADE DO APP ===
    async checkAppAvailability(url) {
        if (!APP_CONFIG.features.appValidation) return true;
        
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch (error) {
            console.warn(`❌ App não disponível: ${url}`, error);
            return false;
        }
    }

    showAppError(app) {
        this.hideLoading();
        this.announceStatus(`Erro: ${app.title} não disponível`);
        
        // Feedback visual
        const card = document.querySelector(`[data-app-id="${app.id}"]`);
        if (card) {
            card.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                card.style.animation = '';
            }, 500);
        }
        
        this.trackEvent('app_error', { app: app.id });
    }

    handleCardKeydown(e, app, card) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleAppClick(e, app, card);
        }
        
        // Navegação por teclado
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
            e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.handleKeyboardNavigation(e.key, card);
        }
    }

    // === NAVEGAÇÃO POR TECLADO ===
    handleKeyboardNavigation(key, currentCard) {
        const cards = Array.from(document.querySelectorAll('.home-card'));
        const currentIndex = cards.indexOf(currentCard);
        let nextIndex = currentIndex;

        switch (key) {
            case 'ArrowRight':
                nextIndex = (currentIndex + 1) % cards.length;
                break;
            case 'ArrowLeft':
                nextIndex = (currentIndex - 1 + cards.length) % cards.length;
                break;
            case 'ArrowDown':
                nextIndex = Math.min(currentIndex + 3, cards.length - 1);
                break;
            case 'ArrowUp':
                nextIndex = Math.max(currentIndex - 3, 0);
                break;
        }

        if (nextIndex !== currentIndex) {
            cards[nextIndex].focus();
            this.selectApp(cards[nextIndex].dataset.appId, cards[nextIndex]);
        }
    }

    // === LAYOUT RESPONSIVO MELHORADO ===
    updateGridLayout() {
        const appCount = this.filteredApps.length;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;
        
        let gridClass = 'grid-12'; // padrão
        
        if (isLandscape && height < 500) {
            // Modo paisagem com altura limitada
            if (appCount <= 8) gridClass = 'grid-8-landscape';
            else if (appCount <= 12) gridClass = 'grid-12-landscape';
            else gridClass = 'grid-15-landscape';
        } else {
            // Modo retrato ou paisagem normal
            if (appCount <= 4) gridClass = 'grid-4';
            else if (appCount <= 6) gridClass = 'grid-6';
            else if (appCount <= 9) gridClass = 'grid-9';
            else if (appCount <= 12) gridClass = 'grid-12';
            else if (appCount <= 15) gridClass = 'grid-15';
        }
        
        if (this.appsGrid) {
            this.appsGrid.className = `home-grid ${gridClass}`;
        }
    }

    setupResponsiveGrid() {
        let resizeTimeout;
        const updateGrid = () => {
            this.updateGridLayout();
            this.trackEvent('window_resize', { 
                width: window.innerWidth, 
                height: window.innerHeight 
            });
        };

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateGrid, 250);
        });

        // Atualiza também na mudança de orientação
        window.addEventListener('orientationchange', () => {
            setTimeout(updateGrid, 100);
        });
    }

    // === FEEDBACK HÁPTICO ===
    provideHapticFeedback() {
        if (APP_CONFIG.features.hapticFeedback && navigator.vibrate) {
            try {
                navigator.vibrate(50);
            } catch (error) {
                console.warn('Vibration API não suportada');
            }
        }
    }

    // === ESTADOS VISUAIS ===
    showEmptyState() {
        if (this.emptyState) {
            this.emptyState.hidden = false;
            this.emptyState.classList.add('visible');
        }
        if (this.appsGrid) {
            this.appsGrid.style.display = 'none';
        }
    }

    hideEmptyState() {
        if (this.emptyState) {
            this.emptyState.hidden = true;
            this.emptyState.classList.remove('visible');
        }
        if (this.appsGrid) {
            this.appsGrid.style.display = 'grid';
        }
    }

    // === ACESSIBILIDADE ===
    setupAccessibility() {
        this.detectAccessibilityPreferences();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
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
            // Atalho para tema (Alt + T)
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Anuncia navegação
            if (e.key === 'Tab' && document.activeElement.classList.contains('home-card')) {
                this.announceStatus('Navegando entre aplicativos');
            }
        });
    }

    setupFocusManagement() {
        // Gerencia foco para acessibilidade
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Volta o foco para o conteúdo principal
                if (this.mainContent) {
                    this.mainContent.focus();
                }
            }
        });
    }

    setupEventListeners() {
        // Tema toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
            this.themeToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }
        
        // Observador de tema do sistema
        const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        themeMedia.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.setupTheme();
                this.trackEvent('system_theme_change', { theme: this.currentTheme });
            }
        });

        // Previne comportamento padrão de arrastar
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('home-card')) {
                e.preventDefault();
            }
        });
    }

    // === FEEDBACK E ANÁLITICAS ===
    announceStatus(message) {
        if (this.statusMessage) {
            this.statusMessage.textContent = message;
            
            setTimeout(() => {
                if (this.statusMessage) {
                    this.statusMessage.textContent = '';
                }
            }, 3000);
        }
    }

    trackEvent(eventName, data = {}) {
        if (!APP_CONFIG.features.analytics) return;
        
        const eventData = {
            timestamp: new Date().toISOString(),
            event: eventName,
            theme: this.currentTheme,
            version: APP_CONFIG.version,
            userAgent: navigator.userAgent,
            ...data
        };
        
        console.log('📊 Evento:', eventData);
        
        try {
            // Salva no localStorage para análise posterior
            const analytics = JSON.parse(localStorage.getItem('portalAnalytics') || '[]');
            analytics.push(eventData);
            
            // Mantém apenas os últimos 100 eventos
            if (analytics.length > 100) {
                analytics.splice(0, analytics.length - 100);
            }
            
            localStorage.setItem('portalAnalytics', JSON.stringify(analytics));
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar analytics:', error);
        }
    }
}

// === POLYFILLS PARA COMPATIBILIDADE ===
// Suporte para vibrate em todos os dispositivos
if (!navigator.vibrate) {
    navigator.vibrate = function() { return false; };
}

// Suporte para safe-area-inset
if (!CSS.supports('padding-top: env(safe-area-inset-top)')) {
    const style = document.createElement('style');
    style.textContent = `
        :root {
            --safe-area-top: 0px;
            --safe-area-bottom: 0px;
        }
    `;
    document.head.appendChild(style);
}

// === INICIALIZAÇÃO SEGURA ===
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Adiciona classe de loading no body
        document.body.classList.add('loading');
        
        // Verifica se todos os elementos necessários existem
        const requiredElements = ['apps-grid', 'emptyState', 'themeToggle'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos não encontrados: ${missingElements.join(', ')}`);
        }
        
        // Inicializa o gerenciador
        window.homePageManager = new HomePageManager();
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        
        // Fallback básico
        const fallbackHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-primary);">
                <h1 style="margin-bottom: 1rem;">🐸 Portal de Cliente</h1>
                <p style="margin-bottom: 1rem; color: var(--text-secondary);">Encomenda Palotina</p>
                <p style="color: var(--error); margin-top: 1rem;">
                    Erro: ${error.message}. Recarregue a página.
                </p>
                <button onclick="window.location.reload()" style="
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-top: 1rem;
                ">
                    Recarregar Página
                </button>
            </div>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = fallbackHTML;
        }
    }
});

// === TRATAMENTO DE ERROS GLOBAIS ===
window.addEventListener('error', (e) => {
    console.error('Erro global no portal:', e.error);
    
    if (window.homePageManager) {
        window.homePageManager.trackEvent('global_error', { 
            message: e.error?.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    }
});

// === EXPORTAÇÃO PARA USO EXTERNO ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HomePageManager, appsConfig, APP_CONFIG };
}