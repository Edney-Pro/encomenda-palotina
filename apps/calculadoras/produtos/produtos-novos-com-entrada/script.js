// --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const TAXA_PADRAO = 0.15;
const PIN_ADMIN = "68366836";
const TOTAL_TELAS = 6;
const GARANTIAS = [
    { meses: 6, percentual: 5, nome: "Básica" }, { meses: 12, percentual: 9, nome: "Standard" },
    { meses: 18, percentual: 12, nome: "Plus" }, { meses: 24, percentual: 15, nome: "Premium" },
    { meses: 30, percentual: 18, nome: "Extendida" }, { meses: 36, percentual: 20, nome: "Master" },
];

let taxaAtual = TAXA_PADRAO;
let telaAtual = 1, produtos = [], garantiaSelecionada = GARANTIAS[1];
let dataPrimeiraParcela = null;
let clientStatus = '', clientSituation = '', sourceInfo = '', indicadoName = '';
let entrada = { tipo: 'percentual', valor: 15 };

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    setupCPFFormatting();
    criarBotoesGarantia();
    gerarOpcoesDePagamento();
    setupAjuda();
});

// --- FUNÇÃO DE HOME ---
function goHome() {
    window.location.href = '../../index.html';
}

// --- CONFIGURAÇÕES E TEMA ---
function carregarConfiguracoes() {
    const temaSalvo = localStorage.getItem('calculadora_tema') || 'dark';
    definirTema(temaSalvo);
    const taxaSalva = parseFloat(localStorage.getItem('calculadora_taxa'));
    if (taxaSalva && !isNaN(taxaSalva)) { 
        taxaAtual = taxaSalva / 100; 
    }
}

function abrirModalConfig() { 
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
        const temaAtual = document.documentElement.getAttribute('data-theme');
        document.querySelectorAll('#settingsView .btn-option').forEach(b => b.classList.remove('active'));
        document.getElementById(temaAtual === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    } else { 
        mostrarAlerta('PIN incorreto!', 'error'); 
    }
}

function definirTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('calculadora_tema', tema);
    if(!document.getElementById('settingsView').classList.contains('hidden')){
        document.querySelectorAll('#settingsView .btn-option').forEach(b => b.classList.remove('active'));
        document.getElementById(tema === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    }
}

function salvarConfig() {
    const novaTaxa = parseFloat(document.getElementById('taxaInput').value);
    if (novaTaxa && !isNaN(novaTaxa) && novaTaxa > 0) {
        localStorage.setItem('calculadora_taxa', novaTaxa);
        taxaAtual = novaTaxa / 100;
        mostrarAlerta('Configurações salvas!', 'success');
        fecharModalConfig();
        if(telaAtual === 5) atualizarVisorPrincipal();
    } else { 
        mostrarAlerta('Por favor, insira um valor de taxa válido.', 'error'); 
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

// --- OPÇÕES DE PAGAMENTO ---
function gerarOpcoesDePagamento() {
    const container = document.getElementById('opcoesDiaPagamentoContainer'); 
    container.innerHTML = '';
    const hoje = new Date(); 
    hoje.setHours(0, 0, 0, 0);

    const MAX_OPCOES = 6;
    const diasFixos = [5, 10, 15, 20, 25, 30];
    const datasGeradas = [];

    diasFixos.forEach(diaFixo => {
        let dataOpcao = new Date(hoje);
        dataOpcao.setDate(diaFixo);
        
        if (dataOpcao <= hoje) {
            dataOpcao.setMonth(dataOpcao.getMonth() + 1);
        }
        
        const diffDays = Math.ceil((dataOpcao - hoje) / (1000 * 60 * 60 * 24));
        if (diffDays <= 33 && datasGeradas.length < MAX_OPCOES) {
            datasGeradas.push(dataOpcao);
        }
    });

    datasGeradas.sort((a, b) => a.getTime() - b.getTime());

    datasGeradas.forEach(dataOpcao => {
        const diaDoVencimento = dataOpcao.getDate().toString().padStart(2, '0');
        const dataCompleta = dataOpcao.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const button = document.createElement('button');
        button.className = 'btn-option';
        button.setAttribute('data-date-iso', dataOpcao.toISOString());
        button.onclick = () => selectDiaPagamento(button); 
        button.innerHTML = `
            <div class="date-option">
                <span class="date-day">Dia ${diaDoVencimento}</span>
                <span class="date-full">${dataCompleta}</span>
            </div>
        `;

        container.appendChild(button);
    });
}

function selectDiaPagamento(element) { 
    dataPrimeiraParcela = new Date(element.getAttribute('data-date-iso')); 
    document.querySelectorAll('#opcoesDiaPagamentoContainer .btn-option').forEach(btn => btn.classList.remove('active')); 
    element.classList.add('active'); 
}

// --- PRODUTOS ---
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
    lista.innerHTML = produtos.map(p => `
        <div class="produto-card">
            <span>${p.nome} - ${formatBRL(p.valor)}</span>
            <button type="button" class="btn btn-error btn-sm" onclick="removerProduto(${p.id})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `).join(''); 
    totalVisor.textContent = `Total: ${formatBRL(calcularValorTotalProdutos())}`; 
}

// --- GARANTIA ---
function criarBotoesGarantia() { 
    const container = document.getElementById('garantiaBotoesContainer'); 
    container.innerHTML = GARANTIAS.map((g, index) => `
        <button type="button" class="btn-option" id="garantia-btn-${g.meses}" onclick="selectGarantia(${index})">
            ${g.meses} Meses
        </button>
    `).join(''); 
}

function atualizarLogicaGarantia() { 
    const mesesPagamento = parseInt(document.getElementById('mesesPagamento').value); 
    document.getElementById('mesesPagamentoDisplay').textContent = `${mesesPagamento} ${mesesPagamento === 1 ? 'mês' : 'meses'}`; 
    let primeiroValidoEncontrado = false; 
    GARANTIAS.forEach((g, index) => { 
        const btn = document.getElementById(`garantia-btn-${g.meses}`); 
        if (g.meses >= mesesPagamento) { 
            btn.disabled = false; 
            if (!primeiroValidoEncontrado) { 
                if (garantiaSelecionada.meses < mesesPagamento) { 
                    selectGarantia(index); 
                } 
                primeiroValidoEncontrado = true; 
            } 
        } else { 
            btn.disabled = true; 
        } 
    }); 
    document.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active')); 
    document.getElementById(`garantia-btn-${garantiaSelecionada.meses}`).classList.add('active'); 
    atualizarVisorPrincipal(); 
}

function selectGarantia(index) { 
    garantiaSelecionada = GARANTIAS[index]; 
    document.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active')); 
    document.getElementById(`garantia-btn-${garantiaSelecionada.meses}`).classList.add('active'); 
    atualizarVisorPrincipal(); 
}

// --- ENTRADA ---
function atualizarBotoesDeEntrada() {
    const valorTotal = calcularValorTotalProdutos();
    const entrada15 = valorTotal * 0.15; 
    const entrada25 = valorTotal * 0.25; 
    const entrada35 = valorTotal * 0.35;
    document.getElementById('btn-entrada-15').innerHTML = formatBRL(entrada15);
    document.getElementById('btn-entrada-25').innerHTML = formatBRL(entrada25);
    document.getElementById('btn-entrada-35').innerHTML = formatBRL(entrada35);
    document.querySelectorAll('.btn-option').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-entrada-15').classList.add('active');
}

function selectEntrada(tipo, valor, element) {
    entrada.tipo = tipo; 
    entrada.valor = valor;
    document.querySelectorAll('.btn-option').forEach(btn => btn.classList.remove('active')); 
    element.classList.add('active');
    const personalizadaContainer = document.getElementById('entradaPersonalizadaContainer');
    if (tipo === 'fixo') { 
        personalizadaContainer.classList.remove('hidden'); 
        document.getElementById('entradaPersonalizadaValor').focus(); 
        atualizarEntradaPersonalizada();
    } else { 
        personalizadaContainer.classList.add('hidden'); 
        atualizarVisorPrincipal(); 
    }
}

function atualizarEntradaPersonalizada() {
    const valorInput = parseFloat(document.getElementById('entradaPersonalizadaValor').value) || 0;
    const valorTotalComGarantia = calcularValorTotalProdutos() * (1 + garantiaSelecionada.percentual / 100);
    if (valorInput > valorTotalComGarantia) { 
        document.getElementById('entradaPersonalizadaValor').value = valorTotalComGarantia.toFixed(2); 
        entrada.valor = valorTotalComGarantia;
    } else { 
        entrada.valor = valorInput; 
    }
    atualizarVisorPrincipal();
}

function atualizarVisorPrincipal() {
    const mesesPagamento = parseInt(document.getElementById('mesesPagamento').value); 
    const valorProdutos = calcularValorTotalProdutos();
    if (valorProdutos <= 0) { 
        document.getElementById('valorParcelaPrincipal').textContent = formatBRL(0); 
        return; 
    }
    
    // CALCULA COM GARANTIA MAS NÃO MOSTRA (mantém a lógica)
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
    const valorAFinanciar = valorComGarantia - valorDaEntrada;
    
    if (valorAFinanciar <= 0) { 
        document.getElementById('valorParcelaPrincipal').textContent = formatBRL(0); 
        return; 
    }
    
    const valorParcela = calcularValorParcela(valorAFinanciar, mesesPagamento); 
    document.getElementById('valorParcelaPrincipal').textContent = formatBRL(valorParcela);
}

// --- NAVEGAÇÃO ---
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

function atualizarExibicaoTela() {
    document.querySelectorAll('.etapa').forEach(el => el.classList.remove('active')); 
    document.getElementById(`tela${telaAtual}`).classList.add('active');
    if (telaAtual === 5) { 
        atualizarBotoesDeEntrada(); 
        atualizarLogicaGarantia(); 
    }
    if (telaAtual === TOTAL_TELAS) { 
        atualizarResumo(); 
    }
    document.getElementById('progressBar').style.width = `${(telaAtual / TOTAL_TELAS) * 100}%`; 
    document.querySelector('.content-area').scrollTo(0, 0);
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
            const valorComGarantia = calcularValorTotalProdutos() * (1 + garantiaSelecionada.percentual / 100); 
            let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor; 
            if (valorDaEntrada <= 0) { 
                mostrarAlerta('O valor da entrada deve ser maior que zero.', 'warning'); 
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

// --- RESUMO ---
function atualizarResumo() {
    document.getElementById('dataOrcamento').textContent = `Orçamento gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
    const meses = parseInt(document.getElementById('mesesPagamento').value); 
    const valorProdutos = calcularValorTotalProdutos();
    
    // CALCULA COM GARANTIA MAS NÃO MOSTRA
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
    const valorAFinanciar = valorComGarantia - valorDaEntrada;
    const valorParcela = calcularValorParcela(valorAFinanciar > 0 ? valorAFinanciar : 0, meses);
    const diasAtePagamento = Math.ceil((dataPrimeiraParcela - new Date()) / (1000 * 60 * 60 * 24));
    let mensagemStatusHTML = '';
    
    if (clientStatus === 'yes') { 
        mensagemStatusHTML = clientSituation === 'no' ? 
            '<div class="summary-alert alert-success"><strong>✓ PROBABILIDADE ALTA:</strong> Cliente com parcelas em dia tem alta chance de aprovação.</div>' : 
            '<div class="summary-alert alert-warning"><strong><i class="bi bi-lock-fill me-2"></i>OPERAÇÃO BLOQUEADA:</strong> O sistema identificou parcelas em aberto no seu cadastro. Novas contratações estão temporariamente suspensas até a quitação da dívida.</div>'; 
    } else { 
        mensagemStatusHTML = '<div class="summary-alert alert-info"><strong>📋 NOVO CLIENTE:</strong> Simulação sujeita à nossa política de análise de crédito.</div>'; 
    }
    
    const ultimaParcelaData = new Date(dataPrimeiraParcela); 
    ultimaParcelaData.setMonth(ultimaParcelaData.getMonth() + meses - 1);
    
    document.getElementById('dadosPessoaisBlock').innerHTML = `
        <h6 class="summary-block-title"><i class="bi bi-person me-2"></i>Dados do Cliente</h6>
        <p><strong>Cliente:</strong> ${document.getElementById('clientName').value}<br>
           <strong>CPF:</strong> ${document.getElementById('clientCPF').value}</p>
        ${mensagemStatusHTML}
    `;
    
    document.getElementById('produtosBlock').innerHTML = `
        <h6 class="summary-block-title"><i class="bi bi-cart me-2"></i>Produtos</h6>
        ${produtos.map(p => `
            <div class="d-flex justify-content-between">
                <span>${p.nome}</span> 
                <span>${formatBRL(p.valor)}</span>
            </div>
        `).join('')}
        <hr>
        <p class="d-flex justify-content-between">
            <strong>Total:</strong> 
            <strong>${formatBRL(valorProdutos)}</strong>
        </p>
    `;
    
    // REMOVIDO: Bloco da garantia
    
    document.getElementById('pagamentoBlock').innerHTML = `
        <h6 class="summary-block-title"><i class="bi bi-credit-card me-2"></i>Pagamento</h6>
        <p><strong>Valor Total:</strong> ${formatBRL(valorComGarantia)}<br>
           <strong>Entrada:</strong> ${formatBRL(valorDaEntrada)}<br>
           <strong>Valor a Financiar:</strong> ${formatBRL(valorAFinanciar)}<br>
           <strong>Parcelamento:</strong> ${meses}x de <strong>${formatBRL(valorParcela)}</strong></p>
    `;
    
    document.getElementById('cronogramaBlock').innerHTML = `
        <h6 class="summary-block-title"><i class="bi bi-calendar-month me-2"></i>Cronograma</h6>
        <p><strong>Prazo para 1ª parcela:</strong> ${diasAtePagamento} dias<br>
           <strong>1º Vencimento:</strong> ${dataPrimeiraParcela.toLocaleDateString('pt-BR')}<br>
           <strong>Último Vencimento:</strong> ${ultimaParcelaData.toLocaleDateString('pt-BR')}</p>
    `;
}

// --- WHATSAPP ---
function enviarWhatsApp() {
    if (telaAtual !== TOTAL_TELAS) { 
        mostrarAlerta("Por favor, complete a simulação até o resumo para compartilhar.", "warning"); 
        return; 
    }
    const nome = document.getElementById('clientName').value.trim(); 
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorProdutos = calcularValorTotalProdutos(); 
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
    const valorAFinanciar = valorComGarantia - valorDaEntrada; 
    const valorParcela = calcularValorParcela(valorAFinanciar > 0 ? valorAFinanciar : 0, meses);
    let statusMsg = '';
    
    if (clientStatus === 'yes') { 
        statusMsg = clientSituation === 'no' ? 'Cliente (parcelas em dia)' : 'Cliente (com pendência)';
    } else { 
        statusMsg = sourceInfo === 'indicado' ? `Novo Cliente (indicado por: ${indicadoName})` : `Novo Cliente (fonte: ${sourceInfo})`; 
    }
    
    const produtosMsg = produtos.map(p => `\n• ${p.nome} - ${formatBRL(p.valor)}`).join('');
    
    const message = `*🛒 SIMULAÇÃO DE PRODUTOS NOVOS (COM ENTRADA)*\n\n` +
                  `*Cliente:* ${nome}\n` + 
                  `*Status:* ${statusMsg}\n\n` + 
                  `*Produtos Selecionados:*${produtosMsg}\n` +
                  `*Total Produtos:* ${formatBRL(valorProdutos)}\n\n` + 
                  `*Garantia Escolhida:*\n` + 
                  `Plano ${garantiaSelecionada.nome} (${garantiaSelecionada.meses} meses)\n\n` +
                  `*Condições de Pagamento:*\n` + 
                  `Valor Total (c/ garantia): ${formatBRL(valorComGarantia)}\n` + 
                  `Entrada: *${formatBRL(valorDaEntrada)}*\n` +
                  `Valor a Financiar: ${formatBRL(valorAFinanciar)}\n` + 
                  `Parcelamento: *${meses}x de ${formatBRL(valorParcela)}*\n` +
                  `Prazo para 1ª parcela: ${Math.ceil((dataPrimeiraParcela - new Date()) / (1000 * 60 * 60 * 24))} dias\n` +
                  `Primeiro Vencimento em: *${dataPrimeiraParcela.toLocaleDateString('pt-BR')}*\n\n` +
                  `_Simulação gerada em ${new Date().toLocaleDateString('pt-BR')} e sujeita à análise de crédito._`;
    
    const numeroWhatsApp = '5544998408460'; 
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// --- SIMULAÇÃO DE ATRASO ---
function abrirModalAtraso() {
    if (!garantiaSelecionada) { 
        mostrarAlerta('Finalize a simulação principal primeiro.', 'warning'); 
        return; 
    }
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorComGarantia = calcularValorTotalProdutos() * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
    const valorAFinanciar = valorComGarantia - valorDaEntrada;
    const valorParcela = calcularValorParcela(valorAFinanciar > 0 ? valorAFinanciar : 0, meses);
    document.getElementById('atrasoValorOriginal').textContent = formatBRL(valorParcela);
    document.getElementById('atrasoModal').classList.remove('hidden');
    calcularSimulacaoAtraso();
}

function fecharModalAtraso() { 
    document.getElementById('atrasoModal').classList.add('hidden'); 
}

function calcularSimulacaoAtraso() {
    const valorParcelaStr = document.getElementById('atrasoValorOriginal').textContent;
    const valorParcela = parseFloat(valorParcelaStr.replace('R$', '').trim().replace(/\./g, '').replace(',', '.'));
    const diasAtraso = parseInt(document.getElementById('diasAtrasoInput').value) || 0;
    
    const multa = valorParcela * 0.12;
    const juros = (valorParcela * 0.008) * diasAtraso;
    const total = valorParcela + multa + juros;
    
    document.getElementById('atrasoValorMulta').textContent = formatBRL(multa);
    document.getElementById('atrasoValorJuros').textContent = formatBRL(juros);
    document.getElementById('atrasoValorTotal').textContent = formatBRL(total);
}

// --- AJUDA ---
function setupAjuda() {
    document.getElementById('btnAjuda').addEventListener('click', function() {
        mostrarAlerta('Em cada tela, preencha as informações solicitadas e use os botões "Voltar" e "Avançar" para navegar. Na última tela, você pode compartilhar o resumo via WhatsApp.', 'success');
    });
}

// --- UTILITÁRIOS ---
function mostrarAlerta(mensagem, tipo = 'warning') { 
    const alerta = document.createElement('div'); 
    alerta.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3`; 
    alerta.style.zIndex = '9999'; 
    alerta.innerHTML = `<span>${mensagem}</span>`; 
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