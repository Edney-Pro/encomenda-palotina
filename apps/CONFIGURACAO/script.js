// ===== SCRIPT PRINCIPAL DE CONFIGURAÇÕES =====

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initializeConfigSystem();
});

function initializeConfigSystem() {
    // Verificar se o configManager já foi inicializado
    if (!window.configManager) {
        console.log('Inicializando ConfigManager...');
        window.configManager = new ConfigManager();
    }
    
    // Configurar listeners adicionais
    setupAdditionalListeners();
    setupKeyboardShortcuts();
}

function setupAdditionalListeners() {
    // Listeners para temas prontos
    document.addEventListener('click', function(e) {
        if (e.target.closest('.theme-card')) {
            const themeCard = e.target.closest('.theme-card');
            const themeName = themeCard.dataset.theme;
            applyPredefinedTheme(themeName);
        }
    });

    // Listener para busca de apps
    const appSelector = document.getElementById('appSelector');
    if (appSelector) {
        appSelector.addEventListener('input', function(e) {
            filterApps(e.target.value);
        });
    }

    // Listener para preview em tempo real
    document.addEventListener('input', function(e) {
        if (e.target.type === 'color' || e.target.type === 'range') {
            updateLivePreview();
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl + S para salvar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (window.configManager) {
                window.configManager.saveAllConfigs();
            }
        }
        
        // Escape para voltar
        if (e.key === 'Escape') {
            const backBtn = document.querySelector('.back-btn');
            if (backBtn) {
                backBtn.click();
            }
        }
        
        // Ctrl + 1-9 para navegação rápida
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            const navItems = document.querySelectorAll('.nav-item');
            if (navItems[tabIndex]) {
                navItems[tabIndex].click();
            }
        }
    });
}

// ===== GERENCIADOR DE TEMAS PRONTOS =====
async function loadPredefinedThemes() {
    try {
        const response = await fetch('temas.json');
        const themes = await response.json();
        displayThemes(themes);
    } catch (error) {
        console.error('Erro ao carregar temas:', error);
        loadDefaultThemes();
    }
}

function loadDefaultThemes() {
    const defaultThemes = {
        "nubank": {
            "name": "Nubank",
            "colors": {
                "primaryColor": "#820AD1",
                "secondaryColor": "#CBA3F8",
                "accentColor": "#00D4AA",
                "backgroundColor": "#0f172a",
                "headerColor": "#1a1a1a"
            },
            "font": "Poppins"
        },
        "mercadopago": {
            "name": "Mercado Pago",
            "colors": {
                "primaryColor": "#009EE3",
                "secondaryColor": "#00B3E6",
                "accentColor": "#FFE600",
                "backgroundColor": "#ffffff",
                "headerColor": "#009EE3"
            },
            "font": "Roboto"
        },
        "inter": {
            "name": "Banco Inter",
            "colors": {
                "primaryColor": "#FF7A00",
                "secondaryColor": "#FFAD66",
                "accentColor": "#00C2FF",
                "backgroundColor": "#ffffff",
                "headerColor": "#FF7A00"
            },
            "font": "Lato"
        },
        "palotina": {
            "name": "Encomenda Palotina",
            "colors": {
                "primaryColor": "#8b5cf6",
                "secondaryColor": "#7c3aed",
                "accentColor": "#10b981",
                "backgroundColor": "#0f172a",
                "headerColor": "#1e293b"
            },
            "font": "Inter"
        }
    };
    
    displayThemes(defaultThemes);
}

function displayThemes(themes) {
    const themesContainer = document.getElementById('themesContainer');
    if (!themesContainer) return;
    
    themesContainer.innerHTML = '';
    
    Object.entries(themes).forEach(([key, theme]) => {
        const themeCard = document.createElement('div');
        themeCard.className = 'theme-card';
        themeCard.dataset.theme = key;
        themeCard.innerHTML = `
            <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.colors.primaryColor}, ${theme.colors.secondaryColor})"></div>
            <div class="theme-info">
                <h4>${theme.name}</h4>
                <p>${theme.font} • ${Object.keys(theme.colors).length} cores</p>
            </div>
            <button class="theme-apply-btn">
                <i class="fas fa-check"></i>
                Aplicar
            </button>
        `;
        themesContainer.appendChild(themeCard);
    });
}

function applyPredefinedTheme(themeName) {
    if (!window.configManager) return;
    
    const themes = {
        "nubank": {
            "primaryColor": "#820AD1",
            "secondaryColor": "#CBA3F8",
            "accentColor": "#00D4AA",
            "backgroundColor": "#0f172a",
            "headerColor": "#1a1a1a",
            "fontFamily": "Poppins"
        },
        "mercadopago": {
            "primaryColor": "#009EE3",
            "secondaryColor": "#00B3E6",
            "accentColor": "#FFE600",
            "backgroundColor": "#ffffff",
            "headerColor": "#009EE3",
            "fontFamily": "Roboto"
        },
        "inter": {
            "primaryColor": "#FF7A00",
            "secondaryColor": "#FFAD66",
            "accentColor": "#00C2FF",
            "backgroundColor": "#ffffff",
            "headerColor": "#FF7A00",
            "fontFamily": "Lato"
        },
        "palotina": {
            "primaryColor": "#8b5cf6",
            "secondaryColor": "#7c3aed",
            "accentColor": "#10b981",
            "backgroundColor": "#0f172a",
            "headerColor": "#1e293b",
            "fontFamily": "Inter"
        }
    };
    
    const theme = themes[themeName];
    if (theme) {
        Object.assign(window.configManager.config.global.appearance, theme);
        window.configManager.applyCurrentConfig();
        window.configManager.updateUI();
        
        // Atualizar campos do formulário
        updateThemeFormFields(theme);
        
        showNotification(`Tema ${themeName} aplicado com sucesso!`, 'success');
    }
}

function updateThemeFormFields(theme) {
    for (const [key, value] of Object.entries(theme)) {
        const field = document.getElementById(`global-${key}`);
        if (field) {
            if (field.type === 'color') {
                field.value = value;
            } else if (field.tagName === 'SELECT') {
                field.value = value;
            }
        }
    }
}

// ===== GERENCIADOR DE TAXAS =====
async function loadTaxasConfig() {
    try {
        const response = await fetch('taxas.json');
        const taxas = await response.json();
        return taxas;
    } catch (error) {
        console.error('Erro ao carregar taxas:', error);
        return getDefaultTaxas();
    }
}

function getDefaultTaxas() {
    return {
        "global": {
            "jurosMensal": 5.0,
            "multaAtraso": 2.0,
            "taxaAntecipacao": 1.5,
            "carencia": 30,
            "maxParcelas": 12,
            "iofDiario": 0.0082,
            "iofAdicional": 0.38
        },
        "apps": {
            "EMPRESTIMOS": {
                "jurosMensal": 8.0,
                "multaAtraso": 5.0,
                "taxaAbertura": 2.0
            },
            "PRODUTOS": {
                "margemLucro": 30.0,
                "taxaCartao": 2.5,
                "descontoAvista": 10.0
            },
            "VEICULOS_AUTOMOTORES": {
                "jurosMensal": 4.5,
                "entradaMinima": 20.0,
                "parcelasMaximas": 36
            }
        }
    };
}

// ===== UTILITÁRIOS =====
function filterApps(searchTerm) {
    const appSelector = document.getElementById('appSelector');
    if (!appSelector) return;
    
    const options = appSelector.options;
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const text = option.textContent.toLowerCase();
        const shouldShow = text.includes(searchTerm.toLowerCase()) || searchTerm === '';
        option.style.display = shouldShow ? '' : 'none';
    }
}

function updateLivePreview() {
    // Atualizar elementos de preview em tempo real
    const previewElements = document.querySelectorAll('.preview-element');
    previewElements.forEach(element => {
        // Implementar preview visual das mudanças
    });
}

function showNotification(message, type = 'info') {
    if (window.configManager && window.configManager.showNotification) {
        window.configManager.showNotification(message, type);
    } else {
        // Fallback simples
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// ===== EXPORTAÇÃO E IMPORT