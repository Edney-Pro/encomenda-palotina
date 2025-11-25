// Easter Egg - Efeito Matrix
class MatrixEffect {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.columns = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Criar canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'matrix-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar tamanho
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initialized = true;
    }

    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Reiniciar colunas
        this.setupColumns();
    }

    setupColumns() {
        const fontSize = 14;
        const columnCount = Math.floor(this.canvas.width / fontSize);
        
        this.columns = [];
        for (let i = 0; i < columnCount; i++) {
            this.columns[i] = {
                x: i * fontSize,
                y: Math.random() * -this.canvas.height,
                speed: 2 + Math.random() * 5,
                characters: this.generateRandomCharacters(20),
                fontSize: fontSize
            };
        }
    }

    generateRandomCharacters(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!%^&*()';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    start(speed = 5, intensity = 50) {
        this.init();
        this.stop();
        
        const adjustedSpeed = speed * 0.5;
        const opacity = intensity / 100;
        
        this.animationId = requestAnimationFrame(() => this.animate(adjustedSpeed, opacity));
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    animate(speed, opacity) {
        if (!this.ctx || !this.canvas) return;
        
        // Fundo semi-transparente para efeito de rastro
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.04 * opacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Cor dos caracteres (verde matrix)
        this.ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
        this.ctx.font = '14px monospace';
        
        // Desenhar colunas
        this.columns.forEach((column, index) => {
            // Caractere principal (mais brilhante)
            this.ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
            this.ctx.fillText(
                column.characters[0],
                column.x,
                column.y
            );
            
            // Caracteres secundários (mais escuros)
            for (let i = 1; i < 5; i++) {
                const charIndex = i % column.characters.length;
                const charOpacity = opacity * (1 - i * 0.2);
                
                this.ctx.fillStyle = `rgba(0, 255, 0, ${charOpacity})`;
                this.ctx.fillText(
                    column.characters[charIndex],
                    column.x,
                    column.y - i * column.fontSize
                );
            }
            
            // Mover coluna
            column.y += column.speed * speed * 0.1;
            
            // Resetar coluna se sair da tela
            if (column.y > this.canvas.height + 100) {
                column.y = Math.random() * -100;
                column.characters = this.generateRandomCharacters(20);
                column.speed = 2 + Math.random() * 5;
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate(speed, opacity));
    }

    destroy() {
        this.stop();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.initialized = false;
    }
}

// Instância global
const matrixEffect = new MatrixEffect();

// Funções globais para o ConfigManager acessar
window.startMatrixEffect = (speed, intensity) => {
    matrixEffect.start(speed, intensity);
};

window.stopMatrixEffect = () => {
    matrixEffect.stop();
};

// Atalho de teclado global
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'm') {
        e.preventDefault();
        if (matrixEffect.animationId) {
            matrixEffect.stop();
        } else {
            matrixEffect.start(5, 50);
        }
    }
});

// Easter Egg: Clique 10 vezes no logo
let clickCount = 0;
let lastClickTime = 0;

document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClickTime > 1000) {
        clickCount = 0; // Reset se passar mais de 1 segundo
    }
    
    lastClickTime = now;
    clickCount++;
    
    if (clickCount >= 10) {
        clickCount = 0;
        matrixEffect.start(5, 50);
        
        // Mostrar mensagem secreta
        if (window.configManager) {
            window.configManager.showNotification('🎮 Easter Egg ativado! Matrix iniciado.', 'success');
        }
    }
});