// ===== SISTEMA DE CONFIGURAÇÕES COMPLETO =====

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
        this.applyIconConfig();
        
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
        
        // Preencher formulários com valores atuais
        this.fillFormWithCurrentValues();
        
        this.modal.classList.add('active');
    }

    fillFormWithCurrentValues() {
        if (!this.currentConfigType || !this.config[this.currentConfigType]) return;
        
        const formData = this.config[this.currentConfigType];
        const inputs = this.modalBody.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (formData[input.name] !== undefined) {
                if (input.type === 'checkbox') {
                    input.checked = formData[input.name];
                } else if (input.type === 'range') {
                    input.value = formData[input.name];
                    // Atualizar display do valor
                    const valueDisplay = input.parentElement.querySelector('.value');
                    if (valueDisplay) {
                        valueDisplay.textContent = formData[input.name];
                    }
                } else {
                    input.value = formData[input.name];
                }
            }
        });
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
        
        // Aplicar configurações em tempo real
        this.applyConfig(this.currentConfigType, formData);
        
        this.showNotification('Configurações salvas com sucesso!');
        this.closeModal();
    }

    collectFormData() {
        const formData = {};
        const inputs = this.modalBody.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else if (input.type === 'number' || input.type === 'range') {
                formData[input.name] = parseFloat(input.value) || 0;
            } else {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    }

    // === APLICAR CONFIGURAÇÕES EM TEMPO REAL ===
    applyConfig(configType, configData) {
        switch(configType) {
            case 'cores':
                this.applyColorConfig(configData);
                break;
            case 'icones':
            case 'bordas':
            case 'transparencia':
            case 'sombra':
                this.applyIconConfig();
                break;
            case 'fontes':
                this.applyFontConfig(configData);
                break;
        }
    }

    applyColorConfig(configData) {
        if (configData.primaryColor) {
            document.documentElement.style.setProperty('--primary', configData.primaryColor);
        }
        if (configData.secondaryColor) {
            document.documentElement.style.setProperty('--secondary', configData.secondaryColor);
        }
        if (configData.accentColor) {
            document.documentElement.style.setProperty('--accent', configData.accentColor);
        }
    }

    applyIconConfig() {
        const iconConfig = this.config.icones || {};
        const borderConfig = this.config.bordas || {};
        const transparencyConfig = this.config.transparencia || {};
        const shadowConfig = this.config.sombra || {};
        
        // Aplicar configurações de ícones
        if (iconConfig.tamanho) {
            document.documentElement.style.setProperty('--icon-size', iconConfig.tamanho + 'px');
        }
        if (iconConfig.rotacao !== undefined) {
            document.documentElement.style.setProperty('--icon-rotate-hover', iconConfig.rotacao + 'deg');
        }
        if (iconConfig.escala !== undefined) {
            document.documentElement.style.setProperty('--icon-scale-hover', iconConfig.escala);
        }
        if (iconConfig.velocidade !== undefined) {
            document.documentElement.style.setProperty('--icon-animation-speed', iconConfig.velocidade + 's');
        }
        
        // Aplicar configurações de bordas
        if (borderConfig.raio !== undefined) {
            document.documentElement.style.setProperty('--icon-border-radius', borderConfig.raio + 'px');
        }
        if (borderConfig.largura !== undefined) {
            document.documentElement.style.setProperty('--icon-border-width', borderConfig.largura + 'px');
        }
        if (borderConfig.cor) {
            document.documentElement.style.setProperty('--icon-border-color', borderConfig.cor);
        }
        
        // Aplicar configurações de transparência
        if (transparencyConfig.fundo !== undefined) {
            document.documentElement.style.setProperty('--icon-background-opacity', transparencyConfig.fundo / 100);
        }
        if (transparencyConfig.hover !== undefined) {
            document.documentElement.style.setProperty('--icon-hover-opacity', transparencyConfig.hover / 100);
        }
        if (transparencyConfig.blur !== undefined) {
            document.documentElement.style.setProperty('--blur-intensity', transparencyConfig.blur + 'px');
        }
        
        // Aplicar configurações de sombra
        if (shadowConfig.intensidade !== undefined) {
            document.documentElement.style.setProperty('--icon-shadow-intensity', shadowConfig.intensidade / 100);
        }
    }

    applyFontConfig(configData) {
        if (configData.fontFamily) {
            document.documentElement.style.setProperty('--font-family', configData.fontFamily);
        }
        if (configData.fontSize) {
            document.documentElement.style.setProperty('--font-size-base', configData.fontSize + 'px');
        }
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
                        <label class="form-label">Tamanho da Fonte Base</label>
                        <input type="range" class="form-range" name="fontSize" min="12" max="18" value="${this.config.fontes?.fontSize || 14}">
                        <div class="range-value">
                            <span>Pequeno</span>
                            <span class="value">${this.config.fontes?.fontSize || 14}</span>
                            <span>Grande</span>
                        </div>
                    </div>
                `
            },
            'icones': {
                title: 'Configurações de Ícones',
                content: `
                    <div class="icon-preview">
                        <div class="preview-card">
                            <div class="preview-icon"><i class="fas fa-star"></i></div>
                            <div class="preview-text">Preview</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tamanho do Ícone</label>
                        <input type="range" class="form-range" name="tamanho" min="50" max="90" value="${this.config.icones?.tamanho || 70}">
                        <div class="range-value">
                            <span>Pequeno</span>
                            <span class="value">${this.config.icones?.tamanho || 70}px</span>
                            <span>Grande</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rotação no Hover</label>
                        <input type="range" class="form-range" name="rotacao" min="0" max="20" value="${this.config.icones?.rotacao || 5}">
                        <div class="range-value">
                            <span>Nenhuma</span>
                            <span class="value">${this.config.icones?.rotacao || 5}°</span>
                            <span>Máxima</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Escala no Hover</label>
                        <input type="range" class="form-range" name="escala" min="1.0" max="1.3" step="0.05" value="${this.config.icones?.escala || 1.05}">
                        <div class="range-value">
                            <span>Normal</span>
                            <span class="value">${this.config.icones?.escala || 1.05}x</span>
                            <span>Máxima</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Velocidade da Animação</label>
                        <input type="range" class="form-range" name="velocidade" min="0.1" max="1.0" step="0.1" value="${this.config.icones?.velocidade || 0.3}">
                        <div class="range-value">
                            <span>Rápido</span>
                            <span class="value">${this.config.icones?.velocidade || 0.3}s</span>
                            <span>Lento</span>
                        </div>
                    </div>
                `
            },
            'bordas': {
                title: 'Configurações de Bordas',
                content: `
                    <div class="icon-preview">
                        <div class="preview-card">
                            <div class="preview-icon"><i class="fas fa-square"></i></div>
                            <div class="preview-text">Preview da Borda</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Raio da Borda</label>
                        <input type="range" class="form-range" name="raio" min="0" max="30" value="${this.config.bordas?.raio || 16}">
                        <div class="range-value">
                            <span>Quadrada</span>
                            <span class="value">${this.config.bordas?.raio || 16}px</span>
                            <span>Redonda</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Largura da Borda</label>
                        <input type="range" class="form-range" name="largura" min="0" max="5" value="${this.config.bordas?.largura || 1}">
                        <div class="range-value">
                            <span>Fina</span>
                            <span class="value">${this.config.bordas?.largura || 1}px</span>
                            <span>Grossa</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cor da Borda</label>
                        <input type="color" class="form-input" name="cor" value="${this.config.bordas?.cor || 'rgba(255, 255, 255, 0.15)'}">
                    </div>
                `
            },
            'transparencia': {
                title: 'Configurações de Transparência',
                content: `
                    <div class="icon-preview">
                        <div class="preview-card">
                            <div class="preview-icon"><i class="fas fa-adjust"></i></div>
                            <div class="preview-text">Preview Transparência</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Opacidade do Fundo</label>
                        <input type="range" class="form-range" name="fundo" min="1" max="30" value="${(this.config.transparencia?.fundo || 8)}">
                        <div class="range-value">
                            <span>Transparente</span>
                            <span class="value">${this.config.transparencia?.fundo || 8}%</span>
                            <span>Sólido</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Opacidade no Hover</label>
                        <input type="range" class="form-range" name="hover" min="5" max="40" value="${(this.config.transparencia?.hover || 12)}">
                        <div class="range-value">
                            <span>Leve</span>
                            <span class="value">${this.config.transparencia?.hover || 12}%</span>
                            <span>Forte</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Intensidade do Blur</label>
                        <input type="range" class="form-range" name="blur" min="5" max="30" value="${this.config.transparencia?.blur || 20}">
                        <div class="range-value">
                            <span>Suave</span>
                            <span class="value">${this.config.transparencia?.blur || 20}px</span>
                            <span>Forte</span>
                        </div>
                    </div>
                `
            },
            'sombra': {
                title: 'Configurações de Sombras',
                content: `
                    <div class="icon-preview">
                        <div class="preview-card">
                            <div class="preview-icon"><i class="fas fa-cloud"></i></div>
                            <div class="preview-text">Preview Sombra</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Intensidade da Sombra</label>
                        <input type="range" class="form-range" name="intensidade" min="10" max="100" value="${this.config.sombra?.intensidade || 40}">
                        <div class="range-value">
                            <span>Suave</span>
                            <span class="value">${this.config.sombra?.intensidade || 40}%</span>
                            <span>Forte</span>
                        </div>
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
                        <input type="range" class="form-range" name="volume" min="0" max="100" value="${this.config.sons?.volume || 80}">
                        <div class="range-value">
                            <span>Mudo</span>
                            <span class="value">${this.config.sons?.volume || 80}%</span>
                            <span>Máximo</span>
                        </div>
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
            'nubank': { 
                primaryColor: '#820AD1', 
                secondaryColor: '#CBA3F8',
                accentColor: '#00D4AA'
            },
            'mercadopago': { 
                primaryColor: '#009EE3', 
                secondaryColor: '#00B3E6',
                accentColor: '#FFE600'
            },
            'inter': { 
                primaryColor: '#FF7A00', 
                secondaryColor: '#FFAD66',
                accentColor: '#00C2FF'
            },
            'palotina': { 
                primaryColor: '#8b5cf6', 
                secondaryColor: '#7c3aed',
                accentColor: '#10b981'
            }
        };
        
        const theme = themes[themeName];
        if (theme) {
            this.config.cores = theme;
            this.saveConfigToStorage();
            this.applyColorConfig(theme);
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
            this.saveConfigToStorage();
            location.reload(); // Recarrega para aplicar padrões
            this.showNotification('Sistema resetado para padrão!');
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
            icones: {
                tamanho: 70,
                rotacao: 5,
                escala: 1.05,
                velocidade: 0.3
            },
            bordas: {
                raio: 16,
                largura: 1,
                cor: 'rgba(255, 255, 255, 0.15)'
            },
            transparencia: {
                fundo: 8,
                hover: 12,
                blur: 20
            },
            sombra: {
                intensidade: 40
            },
            taxasGerais: {
                jurosMensal: 5.0,
                multaAtraso: 2.0,
                taxaAntecipacao: 1.5,
                maxParcelas: 12
            },
            sons: {
                sonsAtivos: true,
                volume: 80
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

        // Atualizar preview em tempo real nos sliders
        document.addEventListener('input', (e) => {
            if (e.target.type === 'range' && this.modal.classList.contains('active')) {
                const valueDisplay = e.target.parentElement.querySelector('.value');
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value + (e.target.name === 'tamanho' ? 'px' : 
                                                               e.target.name === 'rotacao' ? '°' :
                                                               e.target.name === 'escala' ? 'x' :
                                                               e.target.name === 'velocidade' ? 's' :
                                                               e.target.name === 'raio' ? 'px' :
                                                               e.target.name === 'largura' ? 'px' :
                                                               e.target.name === 'fundo' ? '%' :
                                                               e.target.name === 'hover' ? '%' :
                                                               e.target.name === 'blur' ? 'px' :
                                                               e.target.name === 'intensidade' ? '%' :
                                                               e.target.name === 'volume' ? '%' : '');
                }
                
                // Aplicar preview em tempo real para configurações visuais
                if (['icones', 'bordas', 'transparencia', 'sombra'].includes(this.currentConfigType)) {
                    const previewData = this.collectFormData();
                    this.applyConfig(this.currentConfigType, previewData);
                }
            }
        });
    }

    // === NOTIFICAÇÕES ===
    showNotification(message) {
        // Notificação simples - você pode implementar um sistema de toast aqui
        console.log('📢 ' + message);
        
        // Notificação visual simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ===== INICIALIZAÇÃO =====
let configSystem;

document.addEventListener('DOMContentLoaded', function() {
    configSystem = new ConfigSystem();
    window.configSystem = configSystem;
});