// ===== SISTEMA CENTRAL DE CONFIGURAÇÕES =====
class ConfigManager {
    constructor() {
        this.mode = 'global'; // 'global' ou 'app'
        this.currentApp = null;
        this.config = {
            global: this.loadGlobalConfig(),
            apps: this.loadAppsConfig()
        };
        this.init();
    }

    // ===== INICIALIZAÇÃO =====
    init() {
        this.loadAppsList();
        this.setupEventListeners();
        this.applyCurrentConfig();
        this.updateUI();
        this.hideLoading();
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingSection').style.display = 'none';
            document.getElementById('tabContent').style.display = 'block';
        }, 500);
    }

    // ===== CONFIGURAÇÕES GLOBAIS =====
    loadGlobalConfig() {
        const saved = localStorage.getItem('ep_global_config');
        if (saved) return JSON.parse(saved);
        
        return {
            appearance: {
                primaryColor: '#8b5cf6',
                secondaryColor: '#7c3aed',
                accentColor: '#10b981',
                backgroundColor: '#0f172a',
                headerColor: '#1e293b',
                fontFamily: 'Inter',
                fontSize: 16,
                borderRadius: 12,
                spacing: 1.5,
                enableAnimations: true,
                enableShadows: true
            },
            taxas: {
                jurosMensal: 5.0,
                multaAtraso: 2.0,
                taxaAntecipacao: 1.5,
                carencia: 30,
                maxParcelas: 12,
                iofDiario: 0.0082,
                iofAdicional: 0.38
            },
            sounds: {
                enabled: true,
                volume: 80,
                clickSound: 'soft',
                successSound: 'confirmation',
                errorSound: 'alert'
            },
            notifications: {
                enabled: true,
                duration: 5,
                position: 'bottom-right',
                sound: 'default',
                style: 'rounded'
            },
            security: {
                autoLogout: 30,
                passwordRequired: true,
                twoFactorAuth: false
            }
        };
    }

    saveGlobalConfig() {
        localStorage.setItem('ep_global_config', JSON.stringify(this.config.global));
        this.showNotification('Configurações globais salvas!', 'success');
    }

    // ===== CONFIGURAÇÕES POR APP =====
    loadAppsConfig() {
        const saved = localStorage.getItem('ep_apps_config');
        return saved ? JSON.parse(saved) : {};
    }

    saveAppsConfig() {
        localStorage.setItem('ep_apps_config', JSON.stringify(this.config.apps));
    }

    getAppConfig(appId) {
        if (!this.config.apps[appId]) {
            this.config.apps[appId] = this.createDefaultAppConfig(appId);
        }
        return this.config.apps[appId];
    }

    saveAppConfig(appId, config) {
        this.config.apps[appId] = config;
        this.saveAppsConfig();
        this.showNotification(`Configurações do ${appId} salvas!`, 'success');
    }

    createDefaultAppConfig(appId) {
        const appDefaults = {
            CADASTRO: {
                appearance: { theme: 'professional', primaryColor: '#3B82F6' },
                taxas: { taxaCadastro: 0.0, taxaManutencao: 0.0 },
                comportamento: { autoSave: true, validateData: true },
                permissoes: { canExport: true, canDelete: false }
            },
            EMPRESTIMOS: {
                appearance: { theme: 'financial', primaryColor: '#10B981' },
                taxas: { jurosMensal: 8.0, taxaAbertura: 2.0 },
                comportamento: { calculoAutomatico: true, simularAntes: true },
                permissoes: { canApprove: true, canReject: true }
            },
            PRODUTOS: {
                appearance: { theme: 'commercial', primaryColor: '#F59E0B' },
                taxas: { margemLucro: 30.0, taxaCartao: 2.5 },
                comportamento: { showImages: true, showStock: true },
                permissoes: { canAddProducts: true, canUpdatePrices: true }
            },
            CATALOGO: {
                appearance: { theme: 'catalog', primaryColor: '#8B5CF6' },
                taxas: { comissaoVenda: 5.0 },
                comportamento: { filterEnabled: true, searchRealTime: true },
                permissoes: { canPublish: true, canEditCatalog: true }
            },
            COMPRAMOS: {
                appearance: { theme: 'shopping', primaryColor: '#EF4444' },
                taxas: { taxaServico: 5.0, comissaoMinima: 10.0 },
                comportamento: { mostrarLojasParceiras: true, notificacoesOfertas: true },
                permissoes: { podeSolicitarOrcamento: true, acessoLojas: true }
            },
            FERRAMENTAS: {
                appearance: { theme: 'tools', primaryColor: '#6B7280' },
                taxas: {},
                comportamento: { saveHistory: true, exportResults: true },
                permissoes: { canUseTools: true, canSaveTemplates: true }
            },
            FERRAMENTAS_AVANCADAS: {
                appearance: { theme: 'advanced', primaryColor: '#8B5CF6' },
                taxas: { cetMensal: 6.5, taxaAntecipacao: 1.2 },
                comportamento: { advancedCalculations: true, multipleScenarios: true },
                permissoes: { canAccessAdvanced: true, canExportReports: true }
            },
            RENEGOCIACAO: {
                appearance: { theme: 'negotiation', primaryColor: '#F59E0B' },
                taxas: { descontoAvista: 15.0, descontoAntecipacao: 10.0 },
                comportamento: { simularPropostas: true, historicoNegociacoes: true },
                permissoes: { canMakeOffers: true, canApproveDeals: true }
            },
            VEICULOS_AUTOMOTORES: {
                appearance: { theme: 'vehicles', primaryColor: '#3B82F6' },
                taxas: { jurosMensal: 4.5, entradaMinima: 20.0 },
                comportamento: { calcularSeguro: true, calcularIPVA: true },
                permissoes: { canAddVehicles: true, canCalculateFinancing: true }
            },
            VEICULOS_ELETRICOS: {
                appearance: { theme: 'electric', primaryColor: '#10B981' },
                taxas: { jurosMensal: 3.0, descontoSustentabilidade: 5.0 },
                comportamento: { calcularEconomia: true, mostrarComparativo: true },
                permissoes: { canAddEV: true, canCalculateSavings: true }
            }
        };

        return {
            appearance: {
                useGlobal: true,
                ...appDefaults[appId]?.appearance
            },
            taxas: {
                useGlobal: true,
                ...appDefaults[appId]?.taxas
            },
            comportamento: {
                ...appDefaults[appId]?.comportamento
            },
            permissoes: {
                ...appDefaults[appId]?.permissoes
            }
        };
    }

    // ===== SISTEMA HÍBRIDO =====
    getMergedConfig(appId = null) {
        const globalConfig = JSON.parse(JSON.stringify(this.config.global));
        
        if (!appId || this.mode === 'global') {
            return globalConfig;
        }

        const appConfig = this.getAppConfig(appId);
        
        // Mesclar aparência
        if (!appConfig.appearance.useGlobal) {
            Object.assign(globalConfig.appearance, appConfig.appearance);
        }
        
        // Mesclar taxas
        if (!appConfig.taxas.useGlobal) {
            Object.assign(globalConfig.taxas, appConfig.taxas);
        }

        // Adicionar configurações específicas do app
        globalConfig.comportamento = appConfig.comportamento;
        globalConfig.permissoes = appConfig.permissoes;

        return globalConfig;
    }

    // ===== APLICAÇÃO DE CONFIGURAÇÕES =====
    applyCurrentConfig() {
        const config = this.getMergedConfig(this.currentApp);
        this.applyToSystem(config);
        
        if (this.mode === 'app' && this.currentApp) {
            this.applyToApp(this.currentApp, config);
        }
    }

    applyToSystem(config) {
        const root = document.documentElement;
        const appearance = config.appearance;
        
        // Aplicar variáveis CSS
        root.style.setProperty('--primary-color', appearance.primaryColor);
        root.style.setProperty('--secondary-color', appearance.secondaryColor);
        root.style.setProperty('--accent-color', appearance.accentColor);
        root.style.setProperty('--background-color', appearance.backgroundColor);
        root.style.setProperty('--bg-header', appearance.headerColor);
        root.style.setProperty('--font-family', appearance.fontFamily);
        root.style.setProperty('--border-radius', appearance.borderRadius + 'px');
        
        // Aplicar ao sistema principal
        if (window.applySystemConfig) {
            window.applySystemConfig(config);
        }
    }

    applyToApp(appId, config) {
        // Salvar configurações específicas do app
        localStorage.setItem(`ep_app_config_${appId}`, JSON.stringify(config));
        
        // Disparar evento para apps abertos
        window.dispatchEvent(new CustomEvent('ep_config_updated', {
            detail: { appId, config }
        }));
    }

    // ===== CARREGAMENTO DE APPS =====
    async loadAppsList() {
        try {
            const response = await fetch('../../apps.json');
            const apps = await response.json();
            this.populateAppSelector(apps);
        } catch (error) {
            console.error('Erro ao carregar apps:', error);
            this.populateAppSelector(this.getDefaultApps());
        }
    }

    getDefaultApps() {
        return {
            "CADASTRO": { "nome": "Cadastro", "categoria": "cadastro" },
            "EMPRESTIMOS": { "nome": "Empréstimos", "categoria": "financeiro" },
            "PRODUTOS": { "nome": "Produtos", "categoria": "vendas" },
            "CATALOGO": { "nome": "Catálogo", "categoria": "vendas" },
            "COMPRAMOS": { "nome": "Compramos", "categoria": "servicos" },
            "FERRAMENTAS": { "nome": "Ferramentas", "categoria": "utilidades" },
            "FERRAMENTAS_AVANCADAS": { "nome": "Ferramentas Avançadas", "categoria": "utilidades" },
            "RENEGOCIACAO": { "nome": "Renegociação", "categoria": "financeiro" },
            "VEICULOS_AUTOMOTORES": { "nome": "Veículos Automotores", "categoria": "veiculos" },
            "VEICULOS_ELETRICOS": { "nome": "Veículos Elétricos", "categoria": "veiculos" }
        };
    }

    populateAppSelector(apps) {
        const selector = document.getElementById('appSelector');
        selector.innerHTML = '<option value="">-- Escolha um App --</option>';
        
        Object.entries(apps).forEach(([id, app]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${this.getAppEmoji(app.categoria)} ${app.nome}`;
            selector.appendChild(option);
        });
    }

    getAppEmoji(categoria) {
        const emojis = {
            'cadastro': '👤',
            'financeiro': '💰',
            'vendas': '📦',
            'servicos': '🛒',
            'utilidades': '⚙️',
            'veiculos': '🚗'
        };
        return emojis[categoria] || '📁';
    }

    // ===== INTERFACE =====
    setupEventListeners() {
        // Modo Global/App
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.currentTarget.dataset.mode);
            });
        });

        // Seletor de App
        document.getElementById('appSelector').addEventListener('change', (e) => {
            this.selectApp(e.target.value);
        });

        // Navegação
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Configurações Globais
        this.setupGlobalConfigListeners();
        
        // Salvar
        document.getElementById('saveAll').addEventListener('click', () => {
            this.saveAllConfigs();
        });
    }

    setMode(mode) {
        this.mode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        document.getElementById('appSelectorSection').classList.toggle('hidden', mode === 'global');
        document.getElementById('globalNav').classList.toggle('hidden', mode === 'app');
        document.getElementById('appNav').classList.toggle('hidden', mode === 'global');
        
        this.updateUI();
        
        if (mode === 'global') {
            this.currentApp = null;
            this.switchTab('global-appearance');
        } else {
            this.switchTab('app-appearance');
        }
    }

    selectApp(appId) {
        this.currentApp = appId;
        this.updateUI();
        
        if (appId) {
            this.loadAppConfigurations(appId);
            this.showNotification(`${appId} selecionado para configuração`, 'info');
        }
    }

    switchTab(tabId) {
        // Esconder todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remover active de todos os itens
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Mostrar aba selecionada
        let targetTab = document.getElementById(tabId);
        if (!targetTab) {
            targetTab = this.createTabContent(tabId);
        }
        
        targetTab.classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    }

    createTabContent(tabId) {
        const tabContent = document.getElementById('tabContent');
        const content = document.createElement('div');
        content.id = tabId;
        content.className = 'tab-content';
        
        switch(tabId) {
            case 'global-appearance':
                content.innerHTML = this.getGlobalAppearanceContent();
                break;
            case 'global-taxas':
                content.innerHTML = this.getGlobalTaxasContent();
                break;
            case 'app-appearance':
                content.innerHTML = this.getAppAppearanceContent();
                break;
            case 'app-taxas':
                content.innerHTML = this.getAppTaxasContent();
                break;
            default:
                content.innerHTML = `<div class="config-section"><div class="section-content"><p>Conteúdo da aba ${tabId}</p></div></div>`;
        }
        
        tabContent.appendChild(content);
        return content;
    }

    updateUI() {
        const modeBadge = document.getElementById('modeBadge');
        const currentMode = document.getElementById('currentMode');
        const currentApp = document.getElementById('currentApp');
        const configStatus = document.getElementById('configStatus');

        if (this.mode === 'global') {
            modeBadge.textContent = 'Modo Geral';
            currentMode.textContent = 'Geral';
            currentApp.textContent = '-';
        } else {
            modeBadge.textContent = 'Modo App';
            currentMode.textContent = 'App Específico';
            currentApp.textContent = this.currentApp || 'Nenhum';
        }

        configStatus.textContent = '✓ Salvas';
    }

    // ===== CONTEÚDO DAS ABAS =====
    getGlobalAppearanceContent() {
        const appearance = this.config.global.appearance;
        return `
            <div class="config-section">
                <div class="section-header">
                    <h2><i class="fas fa-palette"></i> Aparência Geral do Sistema</h2>
                    <p>Configurações visuais que afetam todo o sistema</p>
                </div>
                <div class="section-content">
                    <div class="config-grid">
                        <div class="config-group">
                            <h3>🎨 Cores do Sistema</h3>
                            <div class="config-item">
                                <label class="config-label">Cor Primária</label>
                                <input type="color" id="global-primaryColor" value="${appearance.primaryColor}" class="config-input">
                            </div>
                            <div class="config-item">
                                <label class="config-label">Cor Secundária</label>
                                <input type="color" id="global-secondaryColor" value="${appearance.secondaryColor}" class="config-input">
                            </div>
                            <div class="config-item">
                                <label class="config-label">Cor de Destaque</label>
                                <input type="color" id="global-accentColor" value="${appearance.accentColor}" class="config-input">
                            </div>
                        </div>

                        <div class="config-group">
                            <h3>🔤 Fontes e Texto</h3>
                            <div class="config-item">
                                <label class="config-label">Fonte Principal</label>
                                <select id="global-fontFamily" class="config-select">
                                    <option value="Inter" ${appearance.fontFamily === 'Inter' ? 'selected' : ''}>Inter</option>
                                    <option value="Poppins" ${appearance.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins</option>
                                    <option value="Roboto" ${appearance.fontFamily === 'Roboto' ? 'selected' : ''}>Roboto</option>
                                </select>
                            </div>
                            <div class="config-item">
                                <label class="config-label">Tamanho da Fonte</label>
                                <div class="slider-container">
                                    <input type="range" id="global-fontSize" class="config-slider" min="12" max="20" value="${appearance.fontSize}">
                                    <div class="slider-info">
                                        <span class="slider-value" id="global-fontSizeValue">${appearance.fontSize}px</span>
                                        <span>12px</span>
                                        <span>20px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="config-group">
                            <h3>📐 Layout e Design</h3>
                            <div class="config-item">
                                <label class="config-label">Arredondamento de Bordas</label>
                                <div class="slider-container">
                                    <input type="range" id="global-borderRadius" class="config-slider" min="0" max="20" value="${appearance.borderRadius}">
                                    <div class="slider-info">
                                        <span class="slider-value" id="global-borderRadiusValue">${appearance.borderRadius}px</span>
                                        <span>0px</span>
                                        <span>20px</span>
                                    </div>
                                </div>
                            </div>
                            <div class="config-item">
                                <label class="config-checkbox">
                                    <input type="checkbox" id="global-enableAnimations" ${appearance.enableAnimations ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Ativar Animações
                                </label>
                            </div>
                            <div class="config-item">
                                <label class="config-checkbox">
                                    <input type="checkbox" id="global-enableShadows" ${appearance.enableShadows ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Ativar Sombras
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getGlobalTaxasContent() {
        const taxas = this.config.global.taxas;
        return `
            <div class="config-section">
                <div class="section-header">
                    <h2><i class="fas fa-chart-line"></i> Taxas Financeiras Gerais</h2>
                    <p>Configurações financeiras padrão para todo o sistema</p>
                </div>
                <div class="section-content">
                    <div class="config-grid">
                        <div class="config-group">
                            <h3>💰 Taxas Principais</h3>
                            <div class="config-item">
                                <label class="config-label">Juros Mensal Padrão (%)</label>
                                <input type="number" id="global-jurosMensal" value="${taxas.jurosMensal}" step="0.1" min="0" max="50" class="config-input">
                            </div>
                            <div class="config-item">
                                <label class="config-label">Multa por Atraso (%)</label>
                                <input type="number" id="global-multaAtraso" value="${taxas.multaAtraso}" step="0.1" min="0" max="100" class="config-input">
                            </div>
                            <div class="config-item">
                                <label class="config-label">Taxa de Antecipação (%)</label>
                                <input type="number" id="global-taxaAntecipacao" value="${taxas.taxaAntecipacao}" step="0.1" min="0" max="20" class="config-input">
                            </div>
                        </div>

                        <div class="config-group">
                            <h3>📅 Prazos e Limites</h3>
                            <div class="config-item">
                                <label class="config-label">Dias de Carência</label>
                                <input type="number" id="global-carencia" value="${taxas.carencia}" min="0" max="90" class="config-input">
                            </div>
                            <div class="config-item">
                                <label class="config-label">Máximo de Parcelas</label>
                                <input type="number" id="global-maxParcelas" value="${taxas.maxParcelas}" min="1" max="60" class="config-input">
                            </div>
                        </div>

                        <div class="config-group">
                            <h3>🏛️ Impostos e Taxas</h3>
                            <div class="config-item">
                                <label class="config-label">IOF Diário (%)</label>
                                <input type="number" id="global-iofDiario" value="${taxas.iofDiario}" step="0.0001" min="0" max="1" class="config-input">
                            </div>
                            <div class="config-item">
                                <label class="config-label">IOF Adicional (%)</label>
                                <input type="number" id="global-iofAdicional" value="${taxas.iofAdicional}" step="0.01" min="0" max="10" class="config-input">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAppAppearanceContent() {
        if (!this.currentApp) {
            return `
                <div class="config-section">
                    <div class="section-content text-center">
                        <div style="padding: 3rem;">
                            <i class="fas fa-mobile-alt" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                            <h3>Selecione um App</h3>
                            <p>Escolha um app específico no menu lateral para configurar sua aparência.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const appConfig = this.getAppConfig(this.currentApp);
        return `
            <div class="config-section">
                <div class="section-header">
                    <h2><i class="fas fa-paint-brush"></i> Aparência do ${this.currentApp}</h2>
                    <p>Configurações visuais específicas para este app</p>
                </div>
                <div class="section-content">
                    <div class="config-grid">
                        <div class="config-group">
                            <h3>🎨 Cores do App</h3>
                            <div class="config-item">
                                <label class="config-checkbox">
                                    <input type="checkbox" id="app-useGlobalAppearance" ${appConfig.appearance.useGlobal ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Usar cores globais do sistema
                                </label>
                            </div>
                            
                            <div class="app-specific-settings" style="${appConfig.appearance.useGlobal ? 'display: none;' : ''}">
                                <div class="config-item">
                                    <label class="config-label">Cor Primária do App</label>
                                    <input type="color" id="app-primaryColor" value="${appConfig.appearance.primaryColor || '#8b5cf6'}" class="config-input">
                                </div>
                                <div class="config-item">
                                    <label class="config-label">Tema do App</label>
                                    <select id="app-theme" class="config-select">
                                        <option value="professional" ${appConfig.appearance.theme === 'professional' ? 'selected' : ''}>Profissional</option>
                                        <option value="financial" ${appConfig.appearance.theme === 'financial' ? 'selected' : ''}>Financeiro</option>
                                        <option value="commercial" ${appConfig.appearance.theme === 'commercial' ? 'selected' : ''}>Comercial</option>
                                        <option value="modern" ${appConfig.appearance.theme === 'modern' ? 'selected' : ''}>Moderno</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="config-group">
                            <h3>⚙️ Comportamento Visual</h3>
                            ${this.generateAppBehaviorFields(appConfig.comportamento)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAppTaxasContent() {
        if (!this.currentApp) {
            return `
                <div class="config-section">
                    <div class="section-content text-center">
                        <div style="padding: 3rem;">
                            <i class="fas fa-percentage" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                            <h3>Selecione um App</h3>
                            <p>Escolha um app específico no menu lateral para configurar suas taxas.</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const appConfig = this.getAppConfig(this.currentApp);
        return `
            <div class="config-section">
                <div class="section-header">
                    <h2><i class="fas fa-percentage"></i> Taxas do ${this.currentApp}</h2>
                    <p>Configurações financeiras específicas para este app</p>
                </div>
                <div class="section-content">
                    <div class="config-grid">
                        <div class="config-group">
                            <h3>💰 Configurações de Taxas</h3>
                            <div class="config-item">
                                <label class="config-checkbox">
                                    <input type="checkbox" id="app-useGlobalTaxas" ${appConfig.taxas.useGlobal ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Usar taxas globais do sistema
                                </label>
                            </div>
                            
                            <div class="app-specific-taxas" style="${appConfig.taxas.useGlobal ? 'display: none;' : ''}">
                                ${this.generateAppTaxasFields(appConfig.taxas)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateAppBehaviorFields(comportamento) {
        let fields = '';
        for (const [key, value] of Object.entries(comportamento)) {
            const label = this.formatLabel(key);
            fields += `
                <div class="config-item">
                    <label class="config-checkbox">
                        <input type="checkbox" id="app-${key}" ${value ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        ${label}
                    </label>
                </div>
            `;
        }
        return fields;
    }

    generateAppTaxasFields(taxas) {
        let fields = '';
        for (const [key, value] of Object.entries(taxas)) {
            if (key === 'useGlobal') continue;
            const label = this.formatLabel(key);
            fields += `
                <div class="config-item">
                    <label class="config-label">${label}</label>
                    <input type="number" id="app-${key}" value="${value}" step="0.1" class="config-input">
                </div>
            `;
        }
        return fields;
    }

    formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    // ===== LISTENERS DE CONFIGURAÇÃO =====
    setupGlobalConfigListeners() {
        // Aparência Global
        document.addEventListener('input', (e) => {
            if (e.target.id === 'global-primaryColor') {
                this.config.global.appearance.primaryColor = e.target.value;
                this.applyCurrentConfig();
            }
            if (e.target.id === 'global-fontSize') {
                this.config.global.appearance.fontSize = parseInt(e.target.value);
                document.getElementById('global-fontSizeValue').textContent = e.target.value + 'px';
                this.applyCurrentConfig();
            }
            if (e.target.id === 'global-borderRadius') {
                this.config.global.appearance.borderRadius = parseInt(e.target.value);
                document.getElementById('global-borderRadiusValue').textContent = e.target.value + 'px';
                this.applyCurrentConfig();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'global-fontFamily') {
                this.config.global.appearance.fontFamily = e.target.value;
                this.applyCurrentConfig();
            }
            if (e.target.id === 'global-enableAnimations') {
                this.config.global.appearance.enableAnimations = e.target.checked;
            }
            if (e.target.id === 'global-enableShadows') {
                this.config.global.appearance.enableShadows = e.target.checked;
                this.applyCurrentConfig();
            }

            // Taxas Globais
            if (e.target.id.startsWith('global-')) {
                const field = e.target.id.replace('global-', '');
                if (this.config.global.taxas[field] !== undefined) {
                    this.config.global.taxas[field] = parseFloat(e.target.value) || 0;
                }
            }

            // Configurações do App
            if (e.target.id === 'app-useGlobalAppearance') {
                this.config.apps[this.currentApp].appearance.useGlobal = e.target.checked;
                document.querySelector('.app-specific-settings').style.display = 
                    e.target.checked ? 'none' : 'block';
                this.applyCurrentConfig();
            }
            if (e.target.id === 'app-useGlobalTaxas') {
                this.config.apps[this.currentApp].taxas.useGlobal = e.target.checked;
                document.querySelector('.app-specific-taxas').style.display = 
                    e.target.checked ? 'none' : 'block';
            }
            if (e.target.id.startsWith('app-') && this.currentApp) {
                this.handleAppConfigChange(e.target);
            }
        });
    }

    handleAppConfigChange(target) {
        const field = target.id.replace('app-', '');
        const value = target.type === 'checkbox' ? target.checked : parseFloat(target.value) || target.value;

        // Determinar a categoria da configuração
        if (field in this.config.apps[this.currentApp].appearance) {
            this.config.apps[this.currentApp].appearance[field] = value;
        } else if (field in this.config.apps[this.currentApp].taxas) {
            this.config.apps[this.currentApp].taxas[field] = value;
        } else if (field in this.config.apps[this.currentApp].comportamento) {
            this.config.apps[this.currentApp].comportamento[field] = value;
        } else if (field in this.config.apps[this.currentApp].permissoes) {
            this.config.apps[this.currentApp].permissoes[field] = value;
        }

        this.applyCurrentConfig();
    }

    // ===== AÇÕES DO SISTEMA =====
    saveAllConfigs() {
        this.saveGlobalConfig();
        if (this.currentApp) {
            this.saveAppConfig(this.currentApp, this.config.apps[this.currentApp]);
        }
        this.showNotification('Todas as configurações foram salvas!', 'success');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    loadAppConfigurations(appId) {
        // Recarregar conteúdo das abas quando um app é selecionado
        ['app-appearance', 'app-taxas', 'app-behavior', 'app-permissions'].forEach(tabId => {
            const existingTab = document.getElementById(tabId);
            if (existingTab) {
                existingTab.remove();
            }
        });
        
        if (document.querySelector('.nav-item.active')) {
            const activeTab = document.querySelector('.nav-item.active').dataset.tab;
            this.switchTab(activeTab);
        }
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    window.configManager = new ConfigManager();
});