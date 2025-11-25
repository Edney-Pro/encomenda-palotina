document.addEventListener('DOMContentLoaded', () => {
    // TEMA
    document.documentElement.dataset.theme = localStorage.getItem('tema') || 'dark';

    // ÍCONES
    const iconMap = { shield: 'fa-shield-alt', bolt: 'fa-bolt', sun: 'fa-sun', cog: 'fa-cog' };
    document.querySelectorAll('.home-card').forEach((card, i) => {
        const type = card.dataset.decoration;
        if (iconMap[type]) {
            const icon = document.createElement('i');
            icon.className = `fas ${iconMap[type]} card-decoration`;
            icon.style.animationDelay = `${i * 1.5}s`;
            card.appendChild(icon);
        }
    });
});