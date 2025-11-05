class IronManEffects {
    constructor() {
        this.particles = [];
        this.init();
    }

    init() {
        this.createEnergyParticles();
        this.addCardHoverEffects();
        this.addTouchEffects();
    }

    // PARTÍCULAS DE ENERGIA FLUTUANTE
    createEnergyParticles() {
        const container = document.querySelector('.home-ironman');
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                this.createParticle(container);
            }, i * 200);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'energy-particle';
        
        // Posição aleatória
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0';
        
        container.appendChild(particle);
        
        // Animação da partícula
        this.animateParticle(particle);
    }

    animateParticle(particle) {
        const keyframes = [
            { 
                opacity: 0, 
                transform: 'scale(0) translate(0, 0)',
                background: '#ffd700'
            },
            { 
                opacity: 1, 
                transform: 'scale(1) translate(-20px, -30px)',
                background: '#ff4500'
            },
            { 
                opacity: 0, 
                transform: 'scale(0.5) translate(20px, -60px)',
                background: '#ff8c00'
            }
        ];

        const options = {
            duration: 3000 + Math.random() * 2000,
            iterations: Infinity,
            delay: Math.random() * 2000
        };

        particle.animate(keyframes, options);
    }

    // EFEITOS DE HOVER NOS CARDS
    addCardHoverEffects() {
        const cards = document.querySelectorAll('.home-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createRippleEffect(card);
            });
            
            card.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.createRippleEffect(card);
            }, { passive: false });
        });
    }

    createRippleEffect(card) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            width: 100px;
            height: 100px;
            top: 50%;
            left: 50%;
            margin-top: -50px;
            margin-left: -50px;
        `;

        card.style.position = 'relative';
        card.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // EFEITOS DE TOUCH PARA ANDROID
    addTouchEffects() {
        let touchStartY;
        const container = document.querySelector('.container');

        container.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            // Efeito de swipe suave
            if (Math.abs(diff) > 50) {
                this.createSwipeParticles(diff > 0 ? 'up' : 'down');
            }
        }, { passive: true });
    }

    createSwipeParticles(direction) {
        const container = document.querySelector('.home-ironman');
        const count = 8;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            
            const startX = 20 + (Math.random() * 60);
            const startY = direction === 'up' ? 80 : 20;
            
            particle.style.left = `${startX}%`;
            particle.style.top = `${startY}%`;
            
            container.appendChild(particle);

            const moveY = direction === 'up' ? -100 : 100;
            
            particle.animate([
                { 
                    opacity: 1, 
                    transform: 'scale(1) translate(0, 0)',
                    background: '#ffd700'
                },
                { 
                    opacity: 0, 
                    transform: `scale(0.5) translate(${Math.random() * 40 - 20}px, ${moveY}px)`,
                    background: '#ff4500'
                }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });

            setTimeout(() => particle.remove(), 1000);
        }
    }
}

// ESTILOS DINÂMICOS PARA ANIMAÇÃO RIPPLE
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes rippleExpand {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);