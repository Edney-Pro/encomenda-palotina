// CONFIGURAÇÃO PRINCIPAL DA HOME
class HomeMain {
    constructor() {
        this.ironManEffects = null;
        this.init();
    }

    init() {
        // Aguarda o DOM carregar completamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupHome());
        } else {
            this.setupHome();
        }
    }

    setupHome() {
        this.applyIronManTheme();
        this.initializeEffects();
        this.setupGlobalComponents();
        this.optimizeForAndroid();
        this.addLoadingAnimation();
    }

    // APLICA O TEMA HOMEM DE FERRO
    applyIronManTheme() {
        document.body.classList.add('home-ironman');
        
        // Remove o background do matrix se existir
        const matrixBg = document.getElementById('matrix-bg');
        if (matrixBg) {
            matrixBg.style.display = 'none';
        }

        // Adiciona título temático
        this.setThemedTitle();
    }

    setThemedTitle() {
        const header = document.getElementById('global-header');
        if (header) {
            const title = header.querySelector('h1');
            if (title) {
                title.innerHTML = '<i class="fas fa-robot" style="color: #ffd700; margin-right: 10px;"></i>JARVIS System';
                title.style.background = 'linear-gradient(45deg, #ffd700, #ff8c00)';
                title.style.webkitBackgroundClip = 'text';
                title.style.webkitTextFillColor = 'transparent';
                title.style.backgroundClip = 'text';
            }
        }
    }

    // INICIALIZA OS EFEITOS ESPECIAIS
    initializeEffects() {
        this.ironManEffects = new IronManEffects();
        
        // Efeito de inicialização do sistema
        this.playBootSequence();
    }

    playBootSequence() {
        // Simula inicialização do JARVIS
        setTimeout(() => {
            this.createBootParticles();
        }, 500);

        // Ativa todos os cards sequencialmente
        setTimeout(() => {
            this.activateCards();
        }, 1000);
    }

    createBootParticles() {
        const container = document.querySelector('.home-ironman');
        const centerX = 50;
        const centerY = 50;

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            
            particle.style.left = `${centerX}%`;
            particle.style.top = `${centerY}%`;
            
            container.appendChild(particle);

            const radius = 100;
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;

            particle.animate([
                { 
                    opacity: 1, 
                    transform: 'scale(1) translate(0, 0)',
                    background: '#ffd700'
                },
                { 
                    opacity: 0, 
                    transform: `scale(0.5) translate(${endX - centerX}px, ${endY - centerY}px)`,
                    background: '#ff4500'
                }
            ], {
                duration: 800,
                easing: 'ease-out'
            });

            setTimeout(() => particle.remove(), 800);
        }
    }

    activateCards() {
        const cards = document.querySelectorAll('.home-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animationPlayState = 'running';
            }, index * 80);
        });
    }

    // CONFIGURA COMPONENTES GLOBAIS
    setupGlobalComponents() {
        // Configura header global se existir
        if (typeof loadGlobalHeaderFooter === 'function') {
            loadGlobalHeaderFooter("JARVIS System", "fas fa-robot");
        }

        // Remove footer da home para mais imersão
        const footer = document.getElementById('global-footer');
        if (footer) {
            footer.style.display = 'none';
        }
    }

    // OTIMIZAÇÕES ESPECÍFICAS PARA ANDROID
    optimizeForAndroid() {
        // Previne zoom indesejado
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });

        document.addEventListener('gesturechange', (e) => {
            e.preventDefault();
        });

        document.addEventListener('gestureend', (e) => {
            e.preventDefault();
        });

        // Otimiza performance de touch
        this.setupTouchOptimizations();
    }

    setupTouchOptimizations() {
        // Adiciona classe de touch para CSS específico
        document.body.classList.add('touch-device');

        // Previne highlight azul no touch
        const style = document.createElement('style');
        style.textContent = `
            .home-card {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ANIMAÇÃO DE CARREGAMENTO
    addLoadingAnimation() {
        const loader = document.createElement('div');
        loader.id = 'jarvis-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #8B0000 0%, #1a0505 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: #ffd700;
            font-family: 'Inter', sans-serif;
        `;

        loader.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-robot" style="font-size: 3rem; margin-bottom: 20px; color: #ffd700;"></i>
                <h2 style="margin: 0 0 10px 0; background: linear-gradient(45deg, #ffd700, #ff8c00); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">JARVIS</h2>
                <p style="margin: 0; color: #ffa07a; font-size: 0.9rem;">Initializing System...</p>
            </div>
        `;

        document.body.appendChild(loader);

        // Remove o loader após 2 segundos
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 2000);
    }
}

// INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    new HomeMain();
});

// OTIMIZAÇÕES DE PERFORMANCE PARA ANDROID
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW Registered'))
            .catch(() => console.log('SW Registration Failed'));
    });
}

// PREVENÇÃO DE EFEITOS INDESEJADOS NO SCROLL
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;
    
    // Suaviza o scroll
    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}, { passive: false });