// --- Sistema de Grid Dinâmico ---
function setGridColumns(columns, event) {
    const gridContainers = document.querySelectorAll('.grid-container');
    const gridButtons = document.querySelectorAll('.btn-grid');
    
    // Remove classe active de todos os botões
    gridButtons.forEach(btn => btn.classList.remove('active'));
    
    // Adiciona classe active ao botão clicado
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Atualiza todos os grids
    gridContainers.forEach(container => {
        container.setAttribute('data-columns', columns);
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    });
}

// --- Tema Escuro/Claro ---
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme');
    
    // Salva preferência no localStorage
    const isDarkTheme = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

// Carrega tema salvo
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Tema escuro por padrão
    document.body.classList.add(savedTheme + '-theme');
}

// --- Funções dos Módulos ---
function openModule(modulePath) {
    if (modulePath) {
        window.open(modulePath, '_blank');
    } else {
        alert('🚧 Módulo em desenvolvimento!');
    }
}

function openCatalog() {
    window.open('CATALOGO/catalog.html', '_blank');
}

function openSmartphones() {
    window.open('https://drive.google.com/drive/folders/1jxxnEERu7-7GfuncE7WjzMBr7nCSqMRj', '_blank');
}

function openSmartTV() {
    window.open('https://drive.google.com/drive/folders/1ZESu8IouTDy3eVrzUNx5n6KvDS7Ymosg?usp=drive_link', '_blank');
}

function openMoveis() {
    window.open('https://drive.google.com/drive/folders/1UHskb2lGqFPYuO1KEcz9h7AybUchxVV6', '_blank');
}

function refreshPage() {
    location.reload();
}

function showInfo() {
    alert('Sistema de Calculadora de Parcelas - Encomenda Palotina\n\nEste sistema oferece diversas ferramentas para cálculo de parcelamentos, empréstimos e renegociações.');
}

function contactWhatsApp() {
    const phone = '5544999999999';
    const message = 'Olá! Preciso de suporte com o sistema de calculadora de parcelas.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', function() {
    // Carrega tema
    loadTheme();
    
    // Define grid padrão (4 colunas)
    setGridColumns(4);
    
    // Ativa botão do grid padrão
    const defaultGridButton = document.querySelector('.btn-grid[onclick*="setGridColumns(4)"]');
    if (defaultGridButton) {
        defaultGridButton.classList.add('active');
    }
});