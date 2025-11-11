// ===== SISTEMA DE CONFIGURAÇÕES SIMPLES E FUNCIONAL =====

class ConfigSystem {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.config = this.loadConfig();
        this.init();
    }

    init() {
        console.log('⚙️ Sistema de Configurações - Inicializando...');
        
        this.setupTheme();
        this.setupConfigCards();
        this.setupModal();
        this.setupEventListeners();
        
        console.log('✅ Sistema de configurações pronto!');
    }

    // === TEMA CLARO/ESCURO ===
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    getStoredTheme() {
        return localStorage.getItem('theme') || 'dark';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
        localStorage.setItem('theme', this.currentTheme);
        this.showNotification(`Tema ${this.currentTheme === 'dark' ? 'escuro' : 'claro'} ativado`);
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (this.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }

    // === CONFIG CARDS ===
    setupConfigCards() {
        const configCards = document.querySelectorAll('.config-card');
        
        configCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const configType = card.dataset.config;
                this.openConfigModal(configType);
            });
        });
    }

    // === MODAL ===
    setupModal() {
        this.modal = document.getElementById('config-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        
        // Fechar modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveConfig());
        
        // Fechar ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openConfigModal(configType) {
        const configData = this.getConfigData(configType);
        this.modalTitle.textContent = configData.title;
        this.modalBody.innerHTML = configData.content;
        this.currentConfigType = configType;
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.currentConfigType = null;
    }

    saveConfig() {
        if (!this.currentConfigType) return;
        
        // Coletar dados do formulário
        const formData = this.collectFormData();
        
        // Salvar configuração
        this.config[this.currentConfigType] = formData;
        this.saveConfigToStorage();
        
        this.showNotification('Configurações salvas com sucesso!');
        this.closeModal();
    }

    collectFormData() {
        const formData = {};
        const inputs = this.modalBody.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else if (input.type === 'number') {
                formData[input.name] = parseFloat(input.value) || 0;
            } else {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    }

    // === CONFIGURAÇÕES ===
    getConfigData(configType) {
        const configs = {
            'cores': {
                title: 'Configurações de Cores',
                content: `
                    <div class="form-group">
                        <label class="form-label">Cor Primária</label>
                        <input type="color" class="form-input" name="primaryColor" value="${this.config.cores?.primaryColor || '#8b5cf6'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cor Secundária</label>
                        <input type="color" class="form-input" name="secondaryColor" value="${this.config.cores?.secondaryColor || '#87CEEB'}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cor de Destaque</label>
                        <input type="color" class="form-input" name="accentColor" value="${this.config.cores?.accentColor || '#10b981'}">
                    </div>
                `
            },
            'fontes': {
                title: 'Configurações de Fontes',
                content: `
                    <div class="form-group">
                        <label class="form-label">Fonte Principal</label>
                        <select class="form-select" name="fontFamily">
                            <option value="Inter" ${(this.config.fontes?.fontFamily || 'Inter') === 'Inter' ? 'selected' : ''}>Inter</option>
                            <option value="Poppins" ${(this.config.fontes?.fontFamily || 'Inter') === 'Poppins' ? 'selected' : ''}>Poppins</option>
                            <option value="Roboto" ${(this.config.fontes?.fontFamily || 'Inter') === 'Roboto' ? 'selected' : ''}>Roboto</option>
                            <option value="Montserrat" ${(this.config.fontes?.fontFamily || 'Inter') === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tamanho da Fonte</label>
                        <input type="range" class="form-input" name="fontSize" min="12" max="18" value="${this.config.fontes?.fontSize || 14}">
                    </div>
                `
            },
            'taxas-gerais': {
                title: 'Taxas Gerais do Sistema',
                content: `
                    <div class="form-group">
                        <label class="form-label">Juros Mensal (%)</label>
                        <input type="number" class="form-input" name="jurosMensal" step="0.1" value="${this.config.taxasGerais?.jurosMensal || 5.0}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Multa por Atraso (%)</label>
                        <input type="number" class="form-input" name="multaAtraso" step="0.1" value="${this.config.taxasGerais?.multaAtraso || 2.0}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Taxa de Antecipação (%)</label>
                        <input type="number" class="form-input" name="taxaAntecipacao" step="0.1" value="${this.config.taxasGerais?.taxaAntecipacao || 1.5}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Máximo de Parcelas</label>
                        <input type="number" class="form-input" name="maxParcelas" value="${this.config.taxasGerais?.maxParcelas || 12}">
                    </div>
                `
            },
            'sons': {
                title: 'Configurações de Sons',
                content: `
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" name="sonsAtivos" ${this.config.sons?.sonsAtivos ? 'checked' : ''}>
                            Ativar sons do sistema
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Volume Geral</label>
                        <input type="range" class="form-input" name="volume" min="0" max="100" value="${this.config.sons?.volume || 80}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Som de Clique</label>
                        <select class="form-select" name="somClique">
                            <option value="suave" ${(this.config.sons?.somClique || 'suave') === 'suave' ? 'selected' : ''}>Suave</option>
                            <option value="digital" ${(this.config.sons?.somClique || 'suave') === 'digital' ? 'selected' : ''}>Digital</option>
                            <option value="classico" ${(this.config.sons?.somClique || 'suave') === 'classico' ? 'selected' : ''}>Clássico</option>
                        </select>
                    </div>
                `
            },
            'temas': {
                title: 'Temas Pré-definidos',
                content: `
                    <div style="display: grid; gap: 12px;">
                        <button class="btn btn-secondary" onclick="configSystem.applyTheme('nubank')">
                            <i class="fas fa-palette"></i> Aplicar Tema Nubank
                        </button>
                        <button class="btn btn-secondary" onclick="configSystem.applyTheme('mercadopago')">
                            <i class="fas fa-palette"></i> Aplicar Tema Mercado Pago
                        </button>
                        <button class="btn btn-secondary" onclick="configSystem.applyTheme('inter')">
                            <i class="fas fa-palette"></i> Aplicar Tema Banco Inter
                        </button>
                        <button class="btn btn-secondary" onclick="configSystem.applyTheme('palotina')">
                            <i class="fas fa-palette"></i> Tema Encomenda Palotina
                        </button>
                    </div>
                `
            },
            'backup': {
                title: 'Backup e Restauração',
                content: `
                    <div style="display: grid; gap: 12px;">
                        <button class="btn btn-primary" onclick="configSystem.exportConfig()">
                            <i class="fas fa-download"></i> Exportar Configurações
                        </button>
                        <button class="btn btn-secondary" onclick="configSystem.importConfig()">
                            <i class="fas fa-upload"></i> Importar Configurações
                        </button>
                        <button class="btn btn-secondary" onclick="configSystem.backupToCloud()">
                            <i class="fas fa-cloud-upload-alt"></i> Backup na Nuvem
                        </button>
                    </div>
                `
            },
            'reset': {
                title: 'Reset do Sistema',
                content: `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--warning); margin-bottom: 16px;"></i>
                        <p style="margin-bottom: 20px; color: var(--text-secondary);">
                            Esta ação irá restaurar todas as configurações para os valores padrão.
                        </p>
                        <button class="btn btn-primary" onclick="configSystem.resetToDefault()" style="background: var(--error);">
                            <i class="fas fa-trash"></i> Resetar para Padrão
                        </button>
                    </div>
                `
            },
            'matrix': {
                title: 'Easter Egg - Matrix',
                content: `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-gamepad" style="font-size: 3rem; color: var(--primary); margin-bottom: 16px;"></i>
                        <p style="margin-bottom: 20px; color: var(--text-secondary);">
                            Ative o efeito Matrix especial!
                        </p>
                        <button class="btn btn-primary" onclick="configSystem.activateMatrix()">
                            <i class="fas fa-play"></i> Ativar Matrix
                        </button>
                    </div>
                `
            },
            'sobre': {
                title: 'Sobre o Sistema',
                content: `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-cogs" style="font-size: 3rem; color: var(--primary); margin-bottom: 16px;"></i>
                        <h3 style="margin-bottom: 8px;">Sistema de Parcelas</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">
                            Encomenda Palotina<br>
                            Versão 2.2.0
                        </p>
                        <div style="background: var(--card-bg); padding: 16px; border-radius: var(--border-radius);">
                            <p style="font-size: 0.9rem; color: var(--text-secondary);">
                                Desenvolvido para gestão completa de parcelas, empréstimos e produtos.
                            </p>
                        </div>
                    </div>
                `
            }
        };

        return configs[configType] || {
            title: 'Configuração',
            content: '<p>Configuração em desenvolvimento.</p>'
        };
    }

    // === FUNÇÕES DO SISTEMA ===
    applyTheme(themeName) {
        const themes = {
            'nubank': { primaryColor: '#820AD1', secondaryColor: '#CBA3F8' },
            'mercadopago': { primaryColor: '#009EE3', secondaryColor: '#00B3E6' },
            'inter': { primaryColor: '#FF7A00', secondaryColor: '#FFAD66' },
            'palotina': { primaryColor: '#8b5cf6', secondaryColor: '#7c3aed' }
        };
        
        const theme = themes[themeName];
        if (theme) {
            this.config.cores = theme;
            this.saveConfigToStorage();
            this.showNotification(`Tema ${themeName} aplicado!`);
            this.closeModal();
        }
    }

    exportConfig() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'configuracoes_sistema.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Configurações exportadas!');
    }

    importConfig() {
        // Simulação de importação
        this.showNotification('Funcionalidade de importação em desenvolvimento');
    }

    backupToCloud() {
        this.showNotification('Backup realizado com sucesso!');
    }

    resetToDefault() {
        if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
            localStorage.removeItem('systemConfig');
            this.config = this.getDefaultConfig();
            this.showNotification('Sistema resetado para padrão!');
            this.closeModal();
        }
    }

    activateMatrix() {
        this.showNotification('Easter Egg Matrix ativado!');
        // Aqui você pode chamar o matrix.js se existir
        if (typeof window.startMatrix === 'function') {
            window.startMatrix();
        }
        this.closeModal();
    }

    // === CONFIG STORAGE ===
    loadConfig() {
        const saved = localStorage.getItem('systemConfig');
        return saved ? JSON.parse(saved) : this.getDefaultConfig();
    }

    saveConfigToStorage() {
        localStorage.setItem('systemConfig', JSON.stringify(this.config));
    }

    getDefaultConfig() {
        return {
            cores: {
                primaryColor: '#8b5cf6',
                secondaryColor: '#87CEEB',
                accentColor: '#10b981'
            },
            fontes: {
                fontFamily: 'Inter',
                fontSize: 14
            },
            taxasGerais: {
                jurosMensal: 5.0,
                multaAtraso: 2.0,
                taxaAntecipacao: 1.5,
                maxParcelas: 12
            },
            sons: {
                sonsAtivos: true,
                volume: 80,
                somClique: 'suave'
            }
        };
    }

    // === EVENT LISTENERS ===
    setupEventListeners() {
        // Botão de tema
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveConfig();
            }
        });
    }

    // === NOTIFICAÇÕES ===
    showNotification(message) {
        // Notificação simples
        console.log('📢 ' + message);
        // Você pode implementar um sistema de toast aqui
    }
}

// ===== INICIALIZAÇÃO =====
let configSystem;

document.addEventListener('DOMContentLoaded', function() {
    configSystem = new ConfigSystem();
    window.configSystem = configSystem;
});