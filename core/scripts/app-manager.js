/**
 * APP MANAGER - ENCOMENDA PALOTINA
 * Configuração atualizada para 6 Categorias Principais
 */

// 1. LISTA MESTRA (Ordem solicitada: Cadastro, Catálogo, Calc, Jogos, Ferr, Config)
const appsConfig = [
    {
        id: 'cadastro',
        title: 'Cadastro',
        subtitle: 'Gestão de Clientes',
        icon: 'fas fa-user-plus',
        url: 'apps/cadastro/index.html',
        color: '#8B5CF6', // Roxo
        animation: 'decoration-float'
    },
    {
        id: 'catalogo',
        title: 'Catálogo',
        subtitle: 'Produtos e Vendas',
        icon: 'fas fa-store',
        url: 'apps/catalogo/index.html',
        color: '#10B981', // Verde
        animation: 'decoration-pulse'
    },
    {
        id: 'calculadoras',
        title: 'Calculadoras',
        subtitle: 'Financeiro e Veículos',
        icon: 'fas fa-calculator',
        url: 'apps/calculadoras/index.html', // Atenção: Você precisará criar este index
        color: '#F59E0B', // Laranja
        animation: 'decoration-rotate'
    },
    {
        id: 'jogos',
        title: 'Jogos',
        subtitle: 'Diversão',
        icon: 'fas fa-gamepad',
        url: 'apps/jogos/index.html',
        color: '#EC4899', // Rosa
        animation: 'decoration-bounce'
    },
    {
        id: 'ferramentas',
        title: 'Ferramentas',
        subtitle: 'Utilitários',
        icon: 'fas fa-tools',
        url: 'apps/ferramentas/index.html',
        color: '#3B82F6', // Azul
        animation: 'decoration-shake'
    },
    {
        id: 'configuracao',
        title: 'Configurações',
        subtitle: 'Sistema',
        icon: 'fas fa-sliders-h',
        url: 'apps/configuracoes/index.html',
        color: '#9CA3AF', // Cinza
        animation: 'decoration-rotate'
    }
];

// 2. LÓGICA DE GRID DINÂMICO
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('apps-grid');
    const emptyState = document.getElementById('emptyState');

    if (!grid) return;

    const count = appsConfig.length;

    // Define a classe CSS baseada na quantidade (Regra solicitada)
    grid.className = 'home-grid'; // Reseta classes
    if (count <= 4) grid.classList.add('grid-4');      // 2x2
    else if (count <= 6) grid.classList.add('grid-6'); // 2x3 (Atual)
    else if (count <= 9) grid.classList.add('grid-9'); // 3x3
    else if (count <= 12) grid.classList.add('grid-12');// 3x4
    else if (count <= 15) grid.classList.add('grid-15');// 3x5
    else grid.classList.add('grid-18');                // 3x6

    // Renderização
    grid.innerHTML = '';
    
    appsConfig.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'home-card';
        card.onclick = () => navigateToApp(app.url);
        
        card.innerHTML = `
            <div class="card-icon" style="color: ${app.color}">
                <i class="${app.icon}"></i>
            </div>
            <div class="card-title">${app.title}</div>
            <div class="card-subtitle">${app.subtitle}</div>
            <div class="card-decoration ${app.animation}">
                <i class="${app.icon}"></i>
            </div>
        `;
        card.style.animationDelay = `${index * 0.05}s`;
        grid.appendChild(card);
    });
});

function navigateToApp(url) {
    if (navigator.vibrate) navigator.vibrate(50);
    document.body.classList.add('navigating');
    setTimeout(() => { window.location.href = url; }, 150);
}