// --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const TAXA_PADRAO = 0.05; 
const PIN_ADMIN = "68366836"; 
const TOTAL_TELAS = 6;
const RESUMO_ETAPAS = {
    tela1: { titulo: "Etapa 1: Dados Pessoais", texto: "Informe nome, CPF e escolha o melhor dia de vencimento para a primeira parcela (até 33 dias). O avanço para a próxima etapa é automático após o preenchimento correto." },
    tela2: { titulo: "Etapa 2: Status do Cliente", texto: "Identifique se já é cliente. Isso define se você passará por uma análise de crédito simplificada ou um novo cadastro." },
    tela3: { titulo: "Etapa 3: Situação do Cliente", texto: "Informe se tem parcelas pendentes ou como conheceu o serviço, informações cruciais para a análise e liberação de crédito." },
    tela4: { titulo: "Etapa 4: Cadastro de Produtos", texto: "Cadastre todos os itens que deseja financiar, informando nome e preço de cada um. O valor total é somado na lista." },
    tela5: { titulo: "Etapa 5: Seleção de Parcelas", texto: "Escolha o número de parcelas desejado (entre 1 e 36). O valor da parcela é exibido abaixo do número de meses e o avanço é automático ao selecionar." },
    tela6: { titulo: "Etapa 6: Resumo", texto: "Tela final com todos os dados da simulação, cronograma de pagamentos e opções para compartilhamento via WhatsApp e simulação de atraso." }
};

let taxaAtual = TAXA_PADRAO;
let MULTA_ATRASO = 0.05; 
let JUROS_DIARIOS_ATRASO = 0.001; 

let telaAtual = 1, produtos = [], mesesSelecionados = 12; 
let dataPrimeiraParcela = null;
let clientStatus = '', clientSituation = '', sourceInfo = '', indicadoName = '';

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    setupCPFFormatting();
    gerarOpcoesDePagamento();
    setupQuickNavProtection(); 
    renderFooterActions(); 
});

// --- LÓGICA DE CONFIGURAÇÕES (PIN, TEMA, TAXA) ---
function carregarConfiguracoes() {
    const temaSalvo = localStorage.getItem('calculadora_tema') || 'dark';
    definirTema(temaSalvo);
    
    const taxaSalva = parseFloat(localStorage.getItem('calculadora_taxa'));
    if (taxaSalva && !isNaN(taxaSalva)) {
        taxaAtual = taxaSalva / 100;
    }

    const multaSalva = parseFloat(localStorage.getItem('multa_atraso'));
    if (multaSalva && !isNaN(multaSalva)) {
        MULTA_ATRASO = multaSalva / 100;
    }

    const jurosSalvos = parseFloat(localStorage.getItem('juros_diarios_atraso'));
    if (jurosSalvos && !isNaN(jurosSalvos)) {
        JUROS_DIARIOS_ATRASO = jurosSalvos / 100;
    }
}

function abrirModalConfig() { 
    document.getElementById('pinView').classList.remove('hidden');
    document.getElementById('settingsView').classList.add('hidden');
    document.getElementById('pinInput').value = '';
    document.getElementById('configModal').classList.remove('hidden'); 
}

function fecharModalConfig() { 
    document.getElementById('configModal').classList.add('hidden'); 
}

function verificarPIN() {
    if (document.getElementById('pinInput').value === PIN_ADMIN) {
        document.getElementById('pinView').classList.add('hidden');
        document.getElementById('settingsView').classList.remove('hidden');
        
        document.getElementById('taxaInput').value = taxaAtual * 100;
        document.getElementById('multaInput').value = MULTA_ATRASO * 100;
        document.getElementById('jurosAtrasoInput').value = JUROS_DIARIOS_ATRASO * 100;
        
        const temaAtual = document.documentElement.getAttribute('data-theme');
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(temaAtual === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    } else {
        alert('PIN incorreto!');
    }
}

function definirTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('calculadora_tema', tema);
    if(document.getElementById('settingsView').classList.contains('hidden') === false){
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(tema === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    }
}

function salvarConfig() {
    const novaTaxa = parseFloat(document.getElementById('taxaInput').value);
    const novaMulta = parseFloat(document.getElementById('multaInput').value);
    const novosJuros = parseFloat(document.getElementById('jurosAtrasoInput').value);

    if (novaTaxa > 0 && novaMulta >= 0 && novosJuros >= 0) {
        localStorage.setItem('calculadora_taxa', novaTaxa);
        taxaAtual = novaTaxa / 100;
        
        localStorage.setItem('multa_atraso', novaMulta);
        MULTA_ATRASO = novaMulta / 100;
        localStorage.setItem('juros_diarios_atraso', novosJuros);
        JUROS_DIARIOS_ATRASO = novosJuros / 100;
        
        alert('Configurações salvas!');
        fecharModalConfig();
        if(telaAtual === 5 || telaAtual === TOTAL_TELAS) gerarGruposParcelas(); 
        
        if(document.getElementById('atrasoModal').classList.contains('hidden') === false) {
            calcularSimulacaoAtraso();
        }
    } else {
        alert('Por favor, insira valores de taxa válidos (Juros mensal deve ser > 0, Multa/Juros diários >= 0).');
    }
}

// --- LÓGICA DE CÁLCULO ---
const calcularValorParcela = (valor, meses) => { 
    if (meses <= 0) return valor; 
    const i = taxaAtual; 
    const fator = (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1); 
    return valor * fator; 
};

const calcularValorTotalProdutos = () => produtos.reduce((total, p) => total + p.valor, 0);
const formatBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarDataSimples = (data) => data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

// --- LÓGICA DAS TELAS ---
function gerarOpcoesDePagamento() {
    const container = document.getElementById('opcoesDiaPagamentoContainer');
    container.innerHTML = '';
    const diasDePagamento = [5, 10, 15, 20, 25, 30];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 33);

    let opcoesEncontradas = [];
    let dataCorrente = new Date(hoje);
    let count = 0;

    while (count < 6) { 
        const diaDoMes = dataCorrente.getDate();
        if (diasDePagamento.includes(diaDoMes)) {
            if (!opcoesEncontradas.some(d => d.getTime() === dataCorrente.getTime())) {
                const dataOpcao = new Date(dataCorrente);
                const habilitado = dataOpcao <= dataLimite;
                
                const div = document.createElement('div');
                div.className = 'col-4';
                const button = document.createElement('button');
                button.className = 'btn btn-selection-date';
                button.setAttribute('data-date-iso', dataOpcao.toISOString());
                button.onclick = () => { selectDiaPagamento(button); checkTela1Ready(); }; 
                button.disabled = !habilitado;
                button.innerHTML = `Dia ${diaDoMes} <span class="date-preview">Vence em ${formatarDataSimples(dataOpcao)}</span>`;
                div.appendChild(button);
                container.appendChild(div);
                
                opcoesEncontradas.push(dataOpcao);
                count++;
            }
        }
        dataCorrente.setDate(dataCorrente.getDate() + 1);
        if (dataCorrente > dataLimite && count < 6) {
            break;
        }
    }
}

// NOVA FUNÇÃO: Gerar grupos de parcelas
function gerarGruposParcelas(isModal = false) {
    const containerId = isModal ? 'parcelasModalGrid' : 'gruposParcelas';
    const container = document.getElementById(containerId);
    const valorProdutos = calcularValorTotalProdutos();
    container.innerHTML = '';
    
    if (!isModal) {
        document.getElementById('valorTotalFinanciamento').textContent = formatBRL(valorProdutos);
    }

    if (valorProdutos <= 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted mt-3">Adicione produtos na Etapa 4 para calcular as parcelas.</div>';
        return;
    }

    // DEFINIR GRUPOS DIFERENTES PARA TELA PRINCIPAL E MODAL
    let grupos;
    if (isModal) {
        // MODAL: Todos os grupos (1-12, 13-24, 25-36)
        grupos = [
            { inicio: 1, fim: 12, titulo: 'Parcelas 1 a 12', expandido: true },
            { inicio: 13, fim: 24, titulo: 'Parcelas 13 a 24', expandido: false },
            { inicio: 25, fim: 36, titulo: 'Parcelas 25 a 36', expandido: false }
        ];
    } else {
        // TELA PRINCIPAL: Apenas parcelas 1-6
        grupos = [
            { inicio: 1, fim: 6, titulo: 'Parcelas 1 a 6', expandido: true }
        ];
    }

    grupos.forEach(grupo => {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = `grupo-parcelas ${grupo.expandido ? 'expandido' : 'recolhido'}`;
        
        // Header do grupo
        const header = document.createElement('div');
        header.className = 'grupo-parcelas-header';
        header.onclick = () => toggleGrupoParcelas(grupoDiv);
        header.innerHTML = `
            <h6><i class="bi bi-calendar-week"></i> ${grupo.titulo}</h6>
            <span class="icone-expandir">▼</span>
        `;
        
        // Content do grupo
        const content = document.createElement('div');
        content.className = 'grupo-parcelas-content';
        
        // Gerar botões de parcela para este grupo
        for(let meses = grupo.inicio; meses <= grupo.fim; meses++) {
            const valorParcela = calcularValorParcela(valorProdutos, meses);
            
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-parcela';
            button.setAttribute('data-meses', meses);
            button.onclick = () => selectParcela(meses, isModal);
            
            if (meses === mesesSelecionados) {
                button.classList.add('active');
            }
            
            button.innerHTML = `${meses}x de <span class="valor-parcela-display">${formatBRL(valorParcela)}</span>`;
            
            content.appendChild(button);
        }
        
        grupoDiv.appendChild(header);
        grupoDiv.appendChild(content);
        container.appendChild(grupoDiv);
    });

    // Adicionar botão "Ver Mais Opções de Parcelas" apenas na tela principal
    if (!isModal) {
        const oldBtn = container.parentNode.querySelector('.btn-ver-mais');
        if(oldBtn) oldBtn.remove();
        
        const verMaisBtn = document.createElement('button');
        verMaisBtn.className = 'btn-ver-mais mt-3 w-100';
        verMaisBtn.textContent = 'Ver Mais Opções de Parcelas';
        verMaisBtn.onclick = abrirModalParcelas;
        container.parentNode.appendChild(verMaisBtn);
    }
}

// Função para expandir/recolher grupos
function toggleGrupoParcelas(grupoElement) {
    grupoElement.classList.toggle('expandido');
    grupoElement.classList.toggle('recolhido');
}

// Seleção de parcela
function selectParcela(meses, isModal = false) {
    mesesSelecionados = meses;
    
    // Remover active de todos os botões
    document.querySelectorAll('.btn-parcela').forEach(b => b.classList.remove('active'));
    
    // Adicionar active ao botão selecionado
    const btnSelecionado = document.querySelector(`.btn-parcela[data-meses="${meses}"]`);
    if(btnSelecionado) btnSelecionado.classList.add('active');

    if(isModal) {
        fecharModalParcelas();
    }
    
    setTimeout(avancarTela, 200);
}

// Modal de Parcelas
function abrirModalParcelas() {
    document.getElementById('footerActions').classList.add('hidden');
    document.getElementById('quickNavBar').classList.add('hidden');
    
    gerarGruposParcelas(true);
    
    document.getElementById('parcelasModal').classList.remove('hidden');
}

function fecharModalParcelas() {
    document.getElementById('parcelasModal').classList.add('hidden');
    document.getElementById('quickNavBar').classList.remove('hidden');
    document.getElementById('footerActions').classList.remove('hidden');
    gerarGruposParcelas(false);
}

function selectDiaPagamento(element) {
    dataPrimeiraParcela = new Date(element.getAttribute('data-date-iso'));
    document.querySelectorAll('.btn-selection-date').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function adicionarProduto() {
    const nomeInput = document.getElementById('produtoNome'); 
    const valorInput = document.getElementById('produtoValor');
    const nome = nomeInput.value.trim(); 
    const valor = parseFloat(valorInput.value);
    if (!nome || !valor || valor <= 0) { 
        mostrarAlerta('Preencha nome e valor válidos.', 'warning'); 
        return; 
    }
    produtos.push({ id: Date.now(), nome, valor });
    atualizarListaProdutos();
    nomeInput.value = ''; 
    valorInput.value = ''; 
    nomeInput.focus();
}

function removerProduto(id) { 
    produtos = produtos.filter(p => p.id !== id); 
    atualizarListaProdutos(); 
}

function atualizarListaProdutos() {
    const lista = document.getElementById('listaProdutos');
    const totalVisor = document.getElementById('totalProdutos');
    lista.innerHTML = produtos.map(p => `<div class="produto-card d-flex justify-content-between align-items-center"><span>${p.nome} - ${formatBRL(p.valor)}</span><button type="button" class="btn btn-sm btn-danger" onclick="removerProduto(${p.id})"><i class="bi bi-trash"></i></button></div>`).join('');
    totalVisor.textContent = `Total: ${formatBRL(calcularValorTotalProdutos())}`;
}

// --- NAVEGAÇÃO E VALIDAÇÃO ---
function checkTela1Ready() {
    const nomeValido = document.getElementById('clientName').value.trim().length > 0;
    const cpfValido = document.getElementById('clientCPF').value.replace(/\D/g, '').length === 11;
    const dataValida = dataPrimeiraParcela !== null;

    if (telaAtual === 1 && nomeValido && cpfValido && dataValida) {
        setTimeout(avancarTela, 300); 
    }
}

function avancarTela() { 
    if (!validarTelaAtual()) return; 
    
    if (telaAtual < TOTAL_TELAS) { 
        telaAtual++; 
        atualizarExibicaoTela(); 
    } 
}

function voltarTela() { 
    if (telaAtual > 1) { 
        telaAtual--; 
        atualizarExibicaoTela(); 
    } 
}

function renderFooterActions() {
    const footer = document.getElementById('footerActions');
    
    if (telaAtual === TOTAL_TELAS) {
        footer.innerHTML = `
            <div class="row g-2">
                <div class="col-4">
                    <button class="btn btn-warning w-100" onclick="voltarTela()">
                        <span class="quick-nav-icon">⏪</span>
                    </button>
                </div>
                <div class="col-4">
                    <button class="btn btn-danger w-100" onclick="abrirModalAtraso()">
                        <span class="quick-nav-icon">⚠️</span>
                    </button>
                </div>
                <div class="col-4">
                    <button class="btn btn-success w-100" onclick="enviarWhatsApp()">
                        <span class="quick-nav-icon">📞</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        footer.innerHTML = `
            <div class="row g-2">
                <div class="col-4">
                    <button class="btn btn-home w-100" onclick="voltarParaTela1()">
                        <span class="quick-nav-icon">🔁</span> 
                    </button>
                </div>
                <div class="col-4">
                    <button class="btn btn-voltar w-100" onclick="voltarTela()">
                        <span class="quick-nav-icon">⏪</span>
                    </button>
                </div>
                <div class="col-4">
                    <button class="btn btn-avancar w-100" onclick="avancarTela()">
                        <span class="quick-nav-icon">⏩</span>
                    </button>
                </div>
            </div>
        `;
    }
}

function voltarParaTela1() {
    if (confirm("Deseja Recalcular (voltar para o início e zerar os dados da simulação)?")) {
        telaAtual = 1;
        produtos = [];
        mesesSelecionados = 12; 
        dataPrimeiraParcela = null;
        atualizarExibicaoTela();
        gerarOpcoesDePagamento(); 
    }
}

function atualizarExibicaoTela() {
    document.querySelectorAll('.etapa').forEach(el => el.classList.remove('active'));
    document.getElementById(`tela${telaAtual}`).classList.add('active');

    renderFooterActions();
    document.getElementById('quickNavBar').classList.remove('hidden');

    if (telaAtual === 5) {
        gerarGruposParcelas(false); 
    }
    if (telaAtual === TOTAL_TELAS) {
        atualizarResumo();
    }
    document.getElementById('progressBar').style.width = `${(telaAtual / TOTAL_TELAS) * 100}%`;
    document.querySelector('.content-wrapper').scrollTo(0, 0);
}

function validarTelaAtual() {
    indicadoName = sourceInfo === 'indicado' ? document.getElementById('clientIndicado').value.trim() : '';
    switch (telaAtual) {
        case 1:
            if (!document.getElementById('clientName').value.trim() || document.getElementById('clientCPF').value.replace(/\D/g, '').length !== 11) { 
                mostrarAlerta('Nome e CPF são obrigatórios.', 'warning'); 
                return false; 
            }
            if (!dataPrimeiraParcela) { 
                mostrarAlerta('Escolha o dia do vencimento.', 'warning'); 
                return false; 
            }
            return true;
        case 2: 
            if (!clientStatus) { 
                mostrarAlerta('Selecione seu status.', 'warning'); 
                return false; 
            } 
            return true;
        case 3:
            if (clientStatus === 'yes' && !clientSituation) { 
                mostrarAlerta('Selecione sua situação.', 'warning'); 
                return false; 
            }
            if (clientStatus === 'no' && !sourceInfo) { 
                mostrarAlerta('Selecione como nos conheceu.', 'warning'); 
                return false; 
            }
            if (sourceInfo === 'indicado' && !indicadoName) { 
                mostrarAlerta('Informe quem indicou.', 'warning'); 
                return false; 
            }
            return true;
        case 4: 
            if (produtos.length === 0) { 
                mostrarAlerta('Adicione um produto.', 'warning'); 
                return false; 
            } 
            return true;
        case 5: 
            if (calcularValorTotalProdutos() === 0) { 
                mostrarAlerta('Adicione produtos na Etapa 4.', 'warning'); 
                return false; 
            } 
            return true; 
        default: 
            return true;
    }
}

function selectClientStatus(status, el) { 
    clientStatus = status; 
    document.querySelectorAll('#tela2 .btn-selection').forEach(b => b.classList.remove('active')); 
    el.classList.add('active'); 
    if (status === 'create') { 
        if (confirm('Sair para criar cadastro?')) window.location.href = '#'; 
        return; 
    } 
    document.getElementById('clientStatusOptions').classList.toggle('hidden', status !== 'yes'); 
    document.getElementById('nonClientForm').classList.toggle('hidden', status !== 'no'); 
    setTimeout(avancarTela, 200); 
}

function selectClientSituation(situation, el) { 
    clientSituation = situation; 
    document.querySelectorAll('#clientStatusOptions .btn-selection').forEach(b => b.classList.remove('active')); 
    el.classList.add('active'); 
    setTimeout(avancarTela, 200); 
}

function selectSource(source, el) { 
    sourceInfo = source; 
    document.querySelectorAll('#nonClientForm .btn-selection').forEach(b => b.classList.remove('active')); 
    el.classList.add('active'); 
    document.getElementById('indicadoField').classList.toggle('hidden', source !== 'indicado'); 
    if (source !== 'indicado') setTimeout(avancarTela, 200); 
}

// --- TELA FINAL: RESUMO E WHATSAPP ---
function atualizarResumo() {
    document.getElementById('dataOrcamento').textContent = `Orçamento gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
    const meses = mesesSelecionados;
    const valorProdutos = calcularValorTotalProdutos();
    const valorParcela = calcularValorParcela(valorProdutos, meses);
    const diasAtePagamento = Math.ceil((dataPrimeiraParcela - new Date()) / (1000 * 60 * 60 * 24));
    let mensagemStatusHTML = '';
    
    if (clientStatus === 'yes') { 
        mensagemStatusHTML = clientSituation === 'no' 
            ? '<div class="summary-alert alert-success"><strong>✓ PROBABILIDADE ALTA:</strong> Cliente com parcelas em dia tem alta chance de aprovação.</div>' 
            : '<div class="summary-alert alert-warning"><strong><i class="bi bi-lock-fill me-2"></i>OPERAÇÃO BLOQUEADA:</strong> O sistema identificou parcelas em aberto no seu cadastro. Novas contratações estão temporariamente suspensas até a quitação da dívida.</div>'; 
    } else { 
        mensagemStatusHTML = '<div class="summary-alert alert-info"><strong>📋 NOVO CLIENTE:</strong> Simulação sujeita à nossa política de análise de crédito.</div>'; 
    }
    
    const ultimaParcelaData = new Date(dataPrimeiraParcela);
    ultimaParcelaData.setMonth(ultimaParcelaData.getMonth() + meses - 1);
    
    document.getElementById('dadosPessoaisBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-person me-2"></i>Dados do Cliente</h6><p><strong>Cliente:</strong> ${document.getElementById('clientName').value}<br><strong>CPF:</strong> ${document.getElementById('clientCPF').value}</p>${mensagemStatusHTML}`;
    document.getElementById('produtosBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-cart me-2"></i>Produtos</h6>` + produtos.map(p => `<div class="d-flex justify-content-between"><span>${p.nome}</span> <span>${formatBRL(p.valor)}</span></div>`).join('') + `<hr><p class="d-flex justify-content-between"><strong>Total:</strong> <strong>${formatBRL(valorProdutos)}</strong></p>`;
    
    document.getElementById('pagamentoBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-credit-card me-2"></i>Pagamento</h6><p><strong>Valor Financiado:</strong> ${formatBRL(valorProdutos)}<br><strong>Parcelamento:</strong> ${meses}x de <strong>${formatBRL(valorParcela)}</strong></p>`;
    document.getElementById('cronogramaBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-calendar-month me-2"></i>Cronograma</h6><p><strong>Prazo para 1ª parcela:</strong> ${diasAtePagamento} dias<br><strong>1º Vencimento:</strong> ${dataPrimeiraParcela.toLocaleDateString('pt-BR')}<br><strong>Último Vencimento:</strong> ${ultimaParcelaData.toLocaleDateString('pt-BR')}</p>`;
}

function enviarWhatsApp() {
    if (telaAtual !== TOTAL_TELAS) {
        mostrarAlerta("Por favor, complete a simulação até o resumo para compartilhar.", "warning");
        return;
    }

    const nome = document.getElementById('clientName').value.trim();
    const meses = mesesSelecionados;
    const valorProdutos = calcularValorTotalProdutos();
    const valorParcela = calcularValorParcela(valorProdutos, meses);
    const diasAtePagamento = Math.ceil((dataPrimeiraParcela - new Date()) / (1000 * 60 * 60 * 24));

    let statusMsg = '';
    if (clientStatus === 'yes') {
        statusMsg = clientSituation === 'no' ? 'Cliente (parcelas em dia)' : 'Cliente (com pendência)';
    } else {
        statusMsg = sourceInfo === 'indicado' ? `Novo Cliente (indicado por: ${indicadoName})` : `Novo Cliente (fonte: ${sourceInfo})`;
    }

    const produtosMsg = produtos.map(p => `\n• ${p.nome} - ${formatBRL(p.valor)}`).join('');

    const message = `*🛒 SIMULAÇÃO DE PRODUTOS USADOS (SEM ENTRADA)*\n\n` +
                  `*Cliente:* ${nome}\n` +
                  `*Status:* ${statusMsg}\n\n` +
                  `*Produtos Selecionados:*${produtosMsg}\n` +
                  `*Valor Financiado:* ${formatBRL(valorProdutos)}\n\n` +
                  `*Condições de Pagamento:*\n` +
                  `Parcelamento: *${meses}x de ${formatBRL(valorParcela)}*\n` +
                  `Prazo para 1ª parcela: ${diasAtePagamento} dias\n` +
                  `Primeiro Vencimento em: *${dataPrimeiraParcela.toLocaleDateString('pt-BR')}*\n\n` +
                  `_Simulação gerada em ${new Date().toLocaleDateString('pt-BR')} e sujeita à análise de crédito._`;
    
    const numeroWhatsApp = '5544998408460'; 
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`;

    const link = document.createElement('a');
    link.href = whatsappURL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- MODAL DE SIMULAÇÃO DE ATRASO ---
function abrirModalAtraso() {
    if (calcularValorTotalProdutos() === 0) { 
        mostrarAlerta('Adicione produtos para simular.', 'warning'); 
        return; 
    }
    
    document.getElementById('footerActions').classList.add('hidden');
    document.getElementById('quickNavBar').classList.add('hidden');

    const meses = mesesSelecionados;
    const valorParcela = calcularValorParcela(calcularValorTotalProdutos(), meses);
    
    document.getElementById('atrasoValorOriginal').textContent = formatBRL(valorParcela);
    document.getElementById('multaPercentDisplay').textContent = `${(MULTA_ATRASO * 100).toFixed(1).replace('.', ',')}%`;
    document.getElementById('jurosDiariosPercentDisplay').textContent = `${(JUROS_DIARIOS_ATRASO * 100).toFixed(1).replace('.', ',')}%`;

    document.getElementById('atrasoModal').classList.remove('hidden');
    calcularSimulacaoAtraso();
}

function fecharModalAtraso() { 
    document.getElementById('atrasoModal').classList.add('hidden'); 
    document.getElementById('quickNavBar').classList.remove('hidden');
    document.getElementById('footerActions').classList.remove('hidden');
}

function calcularSimulacaoAtraso() {
    const valorParcelaStr = document.getElementById('atrasoValorOriginal').textContent;
    const valorParcela = parseFloat(valorParcelaStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    const diasAtraso = parseInt(document.getElementById('diasAtrasoInput').value) || 0;
    
    const multa = valorParcela * MULTA_ATRASO; 
    const juros = (valorParcela * JUROS_DIARIOS_ATRASO) * diasAtraso; 
    
    const totalAtraso = valorParcela + multa + juros;
    
    let totalPagar = totalAtraso;
    let observacao = '';
    
    if (diasAtraso >= 30) {
        totalPagar += valorParcela; 
        observacao = '(Inclui a próxima parcela de ' + formatBRL(valorParcela) + ' que vence neste período.)';
    }

    document.getElementById('atrasoValorOriginal').textContent = formatBRL(valorParcela);
    document.getElementById('atrasoValorMulta').textContent = formatBRL(multa);
    document.getElementById('atrasoValorJuros').textContent = formatBRL(juros);
    
    const totalElement = document.getElementById('atrasoValorTotalComObservacao');
    totalElement.innerHTML = '';
    
    const valorSpan = document.createElement('span');
    valorSpan.className = 'fw-bold';
    valorSpan.textContent = formatBRL(totalPagar);
    
    totalElement.appendChild(valorSpan);
    
    if (observacao) {
        const obsSpan = document.createElement('small');
        obsSpan.className = 'text-muted';
        obsSpan.textContent = observacao;
        totalElement.appendChild(obsSpan);
    }
}

// --- UTILITÁRIOS ---
function mostrarAlerta(mensagem, tipo = 'warning') { 
    const icons = { warning: 'exclamation-triangle-fill', success: 'check-circle-fill' }; 
    const alerta = document.createElement('div'); 
    alerta.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3`; 
    alerta.style.zIndex = '9999'; 
    alerta.innerHTML = `<i class="bi bi-${icons[tipo]} me-2"></i><span>${mensagem}</span>`; 
    document.body.appendChild(alerta); 
    setTimeout(() => alerta.remove(), 3000); 
}

function setupCPFFormatting() { 
    document.getElementById('clientCPF').addEventListener('input', e => { 
        let v = e.target.value.replace(/\D/g, '').substring(0, 11); 
        v = v.replace(/(\d{3})(\d)/, '$1.$2'); 
        v = v.replace(/(\d{3})(\d)/, '$1.$2'); 
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); 
        e.target.value = v; 
    }); 
}

// ==========================================================
// LÓGICA DE AJUDA (MODAL) E PROTEÇÃO DO RODAPÉ
// ==========================================================
function abrirModalAjuda(event) {
    if (event) event.preventDefault();
    document.getElementById('footerActions').classList.add('hidden');
    document.getElementById('quickNavBar').classList.add('hidden');

    const ajudaBody = document.getElementById('ajudaBody');
    ajudaBody.innerHTML = ''; 
    
    Object.keys(RESUMO_ETAPAS).forEach((key) => {
        const data = RESUMO_ETAPAS[key];
        const div = document.createElement('div');
        div.className = 'ajuda-etapa';
        div.innerHTML = `<h6>${data.titulo}</h6><p>${data.texto}</p>`;
        ajudaBody.appendChild(div);
    });

    document.getElementById('ajudaModal').classList.remove('hidden');
}

function fecharModalAjuda() {
    document.getElementById('ajudaModal').classList.add('hidden');
    document.getElementById('quickNavBar').classList.remove('hidden');
    document.getElementById('footerActions').classList.remove('hidden');
}

function setupQuickNavProtection() {
    const navConfigTaxas = document.getElementById('navConfigTaxas');

    if (navConfigTaxas) {
        navConfigTaxas.addEventListener('click', (event) => {
            event.preventDefault(); 
            abrirModalConfig(); 
        });
    }
}