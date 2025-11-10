// Ajusta dinamicamente o espaço da grid entre topo e footer
function ajustarAltura() {
    const header = document.getElementById('header').offsetHeight;
    const footer = document.getElementById('footer').offsetHeight;
    document.querySelector('.grid-container').style.height = `calc(100vh - ${header + footer}px)`;
}
window.addEventListener('resize', ajustarAltura);
window.addEventListener('load', ajustarAltura);

// Tema
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }
    init() {
        this.applyTheme();
        this.setupToggle();
    }
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    setupToggle() {
        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggle());
    }
    toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        localStorage.setItem('theme', this.currentTheme);
    }
}
new ThemeManager();

// Modal ajuda
function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}
window.addEventListener('click', (e) => {
    const modal = document.getElementById('helpModal');
    if (e.target === modal) modal.style.display = 'none';
});