// apps/GAMES/script.js
class GamesManager {
    constructor() {
        this.games = {
            action: { name: "Ação", count: 13, icon: "⚔️" },
            puzzle: { name: "Puzzle", count: 10, icon: "🧩" },
            racing: { name: "Corrida", count: 7, icon: "🏎️" },
            sports: { name: "Esportes", count: 9, icon: "⚽" },
            horror: { name: "Terror", count: 3, icon: "😱" },
            arcade: { name: "Arcade", count: 9, icon: "🕹️" },
            adventure: { name: "Aventura", count: 4, icon: "🌍" },
            strategy: { name: "Estratégia", count: 3, icon: "🧠" },
            idle: { name: "Idle", count: 4, icon: "💰" },
            simulation: { name: "Simulação", count: 9, icon: "🏗️" },
            platformer: { name: "Plataforma", count: 3, icon: "🪜" },
            todos: { name: "Todos os Jogos", count: 84, icon: "🌟" }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.applyDarkTheme();
        console.log('🎮 Games Manager iniciado - Tema Escuro Ativo');
    }

    applyDarkTheme() {
        // Força tema escuro
        document.body.classList.add('dark-theme');
        document.documentElement.style.setProperty('color-scheme', 'dark');
    }

    bindEvents() {
        // Navegação dos cards de games
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.openGameCategory(gameType);
            });
        });

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.goBack();
                    break;
                case 'h':
                case 'H':
                    goHome();
                    break;
                case 'f':
                case 'F':
                    goFavorites();
                    break;
                case '/':
                    e.preventDefault();
                    goSearch();
                    break;
            }
        });

        // Efeitos de hover com som
        this.addHoverEffects();
    }

    addHoverEffects() {
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    openGameCategory(category) {
        console.log(`Abrindo categoria: ${category}`);
        
        // Feedback visual
        const card = document.querySelector(`[data-game="${category}"]`);
        if (card) {
            card.style.background = 'var(--accent-primary)';
            setTimeout(() => {
                card.style.background = '';
            }, 300);
        }

        // Navegação (simulada por enquanto)
        if (category === 'todos') {
            window.location.href = 'categorias/todos/index.html';
        } else {
            window.location.href = `categorias/${category}/index.html`;
        }
    }

    goBack() {
        window.history.back();
    }
}

// Funções de navegação do footer
function goHome() {
    window.location.href = '../../index.html';
}

function goFavorites() {
    // Abrir modal ou página de favoritos
    alert('🚧 Favoritos em construção!');
}

function goSearch() {
    // Abrir busca
    const searchTerm = prompt('🔍 Digite o nome do jogo:');
    if (searchTerm) {
        alert(`Buscando por: ${searchTerm}`);
    }
}

function goConfig() {
    window.location.href = '../CONFIGURACAO/index.html';
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const gamesManager = new GamesManager();
    
    // Adicionar classe loaded para animações
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('SW registered: ', registration))
            .catch(registrationError => console.log('SW registration failed: ', registrationError));
    });
}