// --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const PIN_ADMIN = "68366836";
const TOTAL_TELAS = 5;

// Valores padrão que podem ser alterados nas configurações
const TAXA_INICIAL_PADRAO = 0.30; // 30%
const TAXA_FINAL_PADRAO = 1.00;   // 100%
const MULTA_ATRASO_PADRAO = 0.20; // 20%
const JUROS_DIARIO_ATRASO_PADRAO = 0.008; // 0.8% ao dia

let taxaInicial = TAXA_INICIAL_PADRAO;
let taxaFinal = TAXA_FINAL_PADRAO;
let multaAtraso = MULTA_ATRASO_PADRAO;
let jurosDiarioAtraso = JUROS_DIARIO_ATRASO_PADRAO;

// Estado da aplicação
let telaAtual = 1;
const dataInicio = new Date(); // Empréstimo sempre começa hoje
let totalDiasPeriodo = 0;
let pixType = '', selectedBanco = '';
let clientStatus = '', clientSituation = '', sourceInfo = '', indicadoName = '';

// --- INICIALIZAÇÃO E CONFIGURAÇÕES ---
document.addEventListener('DOMContentLoaded', () => {
    dataInicio.setHours(0, 0, 0, 0); // Zera a hora para evitar bugs de contagem de dias
    carregarConfiguracoes();
    setupCPFFormatting();
    setupPixFormatting();
    inicializarSliderData();
    atualizarVisores();
});

function carregarConfiguracoes() {
    const temaSalvo = localStorage.getItem('diaria_tema') || 'dark';
    definirTema(temaSalvo);
    
    taxaInicial = parseFloat(localStorage.getItem('diaria_taxa_inicial')) / 100 || TAXA_INICIAL_PADRAO;
    taxaFinal = parseFloat(localStorage.getItem('diaria_taxa_final')) / 100 || TAXA_FINAL_PADRAO;
    multaAtraso = parseFloat(localStorage.getItem('diaria_multa')) / 100 || MULTA_ATRASO_PADRAO;
    jurosDiarioAtraso = parseFloat(localStorage.getItem('diaria_juros_diario')) / 100 || JUROS_DIARIO_ATRASO_PADRAO;
    
    document.getElementById('multaPercent').textContent = `${(multaAtraso * 100).toFixed(0)}%`;
    document.getElementById('jurosPercent').textContent = `${(jurosDiarioAtraso * 100).toFixed(1)}%`;
}

function abrirModalConfig() { document.getElementById('configModal').classList.remove('hidden'); }
function fecharModalConfig() { document.getElementById('configModal').classList.add('hidden'); }
function abrirModalBanco() { document.getElementById('bancoModal').classList.remove('hidden'); }
function fecharModalBanco() { document.getElementById('bancoModal').classList.add('hidden'); }
function abrirModalAjuda() { document.getElementById('helpModal').classList.remove('hidden'); }
function fecharModalAjuda() { document.getElementById('helpModal').classList.add('hidden'); }

function verificarPIN() {
    if (document.getElementById('pinInput').value === PIN_ADMIN) {
        document.getElementById('pinView').classList.add('hidden');
        document.getElementById('settingsView').classList.remove('hidden');
        document.getElementById('taxaInicialInput').value = taxaInicial * 100;
        document.getElementById('taxaFinalInput').value = taxaFinal * 100;
        document.getElementById('multaInput').value = multaAtraso * 100;
        document.getElementById('jurosInput').value = jurosDiarioAtraso * 100;
        
        const temaAtual = document.documentElement.getAttribute('data-theme');
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(temaAtual === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    } else { alert('PIN incorreto!'); }
}

function definirTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('diaria_tema', tema);
    if (!document.getElementById('settingsView').classList.contains('hidden')) {
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(temaAtual === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    }
}

function salvarConfig() {
    const novaTaxaInicial = parseFloat(document.getElementById('taxaInicialInput').value);
    const novaTaxaFinal = parseFloat(document.getElementById('taxaFinalInput').value);
    const novaMulta = parseFloat(document.getElementById('multaInput').value);
    const novosJuros = parseFloat(document.getElementById('jurosInput').value);

    if (!isNaN(novaTaxaInicial)) localStorage.setItem('diaria_taxa_inicial', novaTaxaInicial);
    if (!isNaN(novaTaxaFinal)) localStorage.setItem('diaria_taxa_final', novaTaxaFinal);
    if (!isNaN(novaMulta)) localStorage.setItem('diaria_multa', novaMulta);
    if (!isNaN(novosJuros)) localStorage.setItem('diaria_juros_diario', novosJuros);
    
    alert('Configurações salvas!');
    fecharModalConfig();
    carregarConfiguracoes();
    inicializarSliderData(); // Reinicia o slider com as novas taxas
    if(telaAtual === 4) atualizarVisores();
}

// --- LÓGICA DE CÁLCULO E FORMATAÇÃO ---
const formatBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const calcularTaxaDiaria = (diasCorridos) => {
    if (totalDiasPeriodo <= 1) return taxaInicial;
    if (diasCorridos <= 1) return taxaInicial;
    
    const incrementoDiario = (taxaFinal - taxaInicial) / (totalDiasPeriodo - 1);
    return taxaInicial + ((diasCorridos - 1) * incrementoDiario);
};

// --- LÓGICA DAS TELAS ---
function inicializarSliderData() {
    const dataFinal = new Date(dataInicio);
    dataFinal.setMonth(dataFinal.getMonth() + 1);

    // Calcula a diferença em dias
    const diffTime = Math.abs(dataFinal - dataInicio);
    totalDiasPeriodo = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const slider = document.getElementById('diasPagamento');
    slider.min = 1;
    slider.max = totalDiasPeriodo;
    slider.value = 1;
}

function selectPixType(type, el) {
    pixType = type;
    document.querySelectorAll('.btn-pix').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('clientPix').placeholder = `Digite sua chave: ${type}`;
    document.getElementById('clientPix').focus();
}

function selectBanco(banco, el) {
    selectedBanco = banco;
    document.querySelectorAll('.btn-banco').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById('btnOutroBanco').innerHTML = '<i class="bi bi-search"></i> Outro Banco';
    document.getElementById('btnOutroBanco').classList.remove('active');
}

function selectBancoModal(banco) {
    selectedBanco = banco;
    document.querySelectorAll('.btn-banco').forEach(b => b.classList.remove('active'));
    document.getElementById('btnOutroBanco').innerHTML = `<i class="bi bi-bank"></i> ${banco}`;
    document.getElementById('btnOutroBanco').classList.add('active');
    fecharModalBanco();
}

function atualizarVisores() {
    const valor = parseFloat(document.getElementById('loanValue').value);
    document.getElementById('loanValueDisplay').textContent = formatBRL(valor);

    const sliderDias = document.getElementById('diasPagamento');
    const diasCorridos = parseInt(sliderDias.value);

    // Calcula a data de pagamento
    const dataPagamento = new Date(dataInicio);
    dataPagamento.setDate(dataInicio.getDate() + diasCorridos - 1);
    
    const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    document.getElementById('diasPagamentoDisplay').textContent = dataPagamento.toLocaleDateString('pt-BR', options);

    const taxaDiaria = calcularTaxaDiaria(diasCorridos);
    const valorFinal = valor * (1 + taxaDiaria);

    document.getElementById('valorFinalDisplay').textContent = formatBRL(valorFinal);
}


// --- NAVEGAÇÃO E VALIDAÇÃO ---
function avancarTela() { if (!validarTelaAtual()) return; if (telaAtual < TOTAL_TELAS) telaAtual++; atualizarExibicaoTela(); }
function voltarTela() { if (telaAtual > 1) telaAtual--; atualizarExibicaoTela(); }

function atualizarExibicaoTela() {
    document.querySelectorAll('.etapa').forEach(el => el.classList.remove('active'));
    document.getElementById(`tela${telaAtual}`).classList.add('active');
    if (telaAtual === TOTAL_TELAS) atualizarResumo();
    document.getElementById('progressBar').style.width = `${(telaAtual / TOTAL_TELAS) * 100}%`;
    document.querySelector('.content-wrapper').scrollTo(0, 0);
}

function validarTelaAtual() {
    indicadoName = sourceInfo === 'indicado' ? document.getElementById('clientIndicado').value.trim() : '';
    switch (telaAtual) {
        case 1:
            if (!document.getElementById('clientName').value.trim() || document.getElementById('clientCPF').value.replace(/\D/g, '').length !== 11) { mostrarAlerta('Nome e CPF são obrigatórios.', 'warning'); return false; }
            if (!pixType || !document.getElementById('clientPix').value.trim()) { mostrarAlerta('Selecione o tipo e preencha sua chave PIX.', 'warning'); return false; }
            if (!selectedBanco) { mostrarAlerta('Selecione seu banco.', 'warning'); return false; }
            return true;
        case 2: if (!clientStatus) { mostrarAlerta('Selecione seu status.', 'warning'); return false; } return true;
        case 3:
            if (clientStatus === 'yes' && !clientSituation) { mostrarAlerta('Selecione sua situação.', 'warning'); return false; }
            if (clientStatus === 'no' && !sourceInfo) { mostrarAlerta('Selecione como nos conheceu.', 'warning'); return false; }
            if (sourceInfo === 'indicado' && !indicadoName) { mostrarAlerta('Informe quem indicou.', 'warning'); return false; }
            return true;
        default: return true;
    }
}

function selectClientStatus(status, el) { clientStatus = status; document.querySelectorAll('#tela2 .btn-selection').forEach(b => b.classList.remove('active')); el.classList.add('active'); document.getElementById('clientStatusOptions').classList.toggle('hidden', status !== 'yes'); document.getElementById('nonClientForm').classList.toggle('hidden', status !== 'no'); setTimeout(avancarTela, 200); }
function selectClientSituation(situation, el) { clientSituation = situation; document.querySelectorAll('#clientStatusOptions .btn-selection').forEach(b => b.classList.remove('active')); el.classList.add('active'); setTimeout(avancarTela, 200); }
function selectSource(source, el) { sourceInfo = source; document.querySelectorAll('#nonClientForm .btn-selection').forEach(b => b.classList.remove('active')); el.classList.add('active'); document.getElementById('indicadoField').classList.toggle('hidden', source !== 'indicado'); if (source !== 'indicado') setTimeout(avancarTela, 200); }

// --- TELA FINAL: RESUMO E WHATSAPP ---
function atualizarResumo() {
    document.getElementById('dataOrcamento').textContent = `Orçamento gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
    const valor = parseFloat(document.getElementById('loanValue').value);
    const diasCorridos = parseInt(document.getElementById('diasPagamento').value);
    const taxaAplicada = calcularTaxaDiaria(diasCorridos);
    const valorFinal = valor * (1 + taxaAplicada);
    
    const dataPagamento = new Date(dataInicio);
    dataPagamento.setDate(dataInicio.getDate() + diasCorridos - 1);

    let mensagemStatusHTML = '';
    if (clientStatus === 'yes') { mensagemStatusHTML = clientSituation === 'no' ? '<div class="summary-alert alert-success"><strong>✓ PROBABILIDADE ALTA:</strong> Cliente com parcelas em dia tem alta chance de aprovação.</div>' : '<div class="summary-alert alert-warning"><strong>⚠️ ATENÇÃO:</strong> Análise de crédito necessária devido a pendências.</div>'; } else { mensagemStatusHTML = '<div class="summary-alert alert-info"><strong>📋 NOVO CLIENTE:</strong> Simulação sujeita à análise de crédito.</div>'; }

    document.getElementById('dadosPessoaisBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-person me-2"></i>Dados do Cliente</h6><p><strong>Cliente:</strong> ${document.getElementById('clientName').value}<br><strong>CPF:</strong> ${document.getElementById('clientCPF').value}<br><strong>PIX:</strong> ${document.getElementById('clientPix').value}<br><strong>Banco:</strong> ${selectedBanco}</p>${mensagemStatusHTML}`;
    document.getElementById('emprestimoBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-cash-coin me-2"></i>Detalhes do Empréstimo</h6><p><strong>Valor Solicitado:</strong> ${formatBRL(valor)}<br><strong>Data de Início:</strong> ${dataInicio.toLocaleDateString('pt-BR')}</p>`;
    document.getElementById('pagamentoBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-credit-card me-2"></i>Pagamento</h6><p><strong>Data do Pagamento:</strong> ${dataPagamento.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}<br><strong>VALOR TOTAL A PAGAR:</strong> <strong>${formatBRL(valorFinal)}</strong></p>`;
}

function enviarWhatsApp() {
    if (telaAtual !== TOTAL_TELAS) { mostrarAlerta("Complete a simulação até o resumo.", 'warning'); return; }
    const nome = document.getElementById('clientName').value.trim();
    const valor = parseFloat(document.getElementById('loanValue').value);
    const diasCorridos = parseInt(document.getElementById('diasPagamento').value);
    const valorFinal = valor * (1 + calcularTaxaDiaria(diasCorridos));
    const dataPagamento = new Date(dataInicio);
    dataPagamento.setDate(dataInicio.getDate() + diasCorridos - 1);
    let statusMsg = '';
    if (clientStatus === 'yes') { statusMsg = clientSituation === 'no' ? 'Cliente (parcelas em dia)' : 'Cliente (com pendência)'; } else { statusMsg = sourceInfo === 'indicado' ? `Novo Cliente (indicado por: ${indicadoName})` : `Novo Cliente (fonte: ${sourceInfo})`; }
    const message = `*🗓️ SIMULAÇÃO DE EMPRÉSTIMO DIÁRIO*\n\n*Cliente:* ${nome}\n*Status:* ${statusMsg}\n\n*Resumo da Solicitação:*\n• Valor do Empréstimo: *${formatBRL(valor)}*\n• Data de Início: *${dataInicio.toLocaleDateString('pt-BR')}*\n• Data de Pagamento: *${dataPagamento.toLocaleDateString('pt-BR')}*\n\n• VALOR FINAL A PAGAR: *${formatBRL(valorFinal)}*\n\n_Simulação gerada em ${new Date().toLocaleDateString('pt-BR')}._`;
    const numeroWhatsApp = '5544998408460';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`, '_blank');
}

// --- MODAL DE ATRASO E UTILITÁRIOS ---
function abrirModalAtraso() {
    if (telaAtual < 4) { mostrarAlerta('Finalize a simulação principal primeiro.', 'warning'); return; }
    const valor = parseFloat(document.getElementById('loanValue').value);
    const diasCorridos = parseInt(document.getElementById('diasPagamento').value);
    const valorFinal = valor * (1 + calcularTaxaDiaria(diasCorridos));

    document.getElementById('atrasoValorOriginal').textContent = formatBRL(valorFinal);
    document.getElementById('atrasoMultaPercent').textContent = (multaAtraso * 100).toFixed(0);
    document.getElementById('atrasoJurosPercent').textContent = (jurosDiarioAtraso * 100).toFixed(1);
    document.getElementById('atrasoModal').classList.remove('hidden');
    calcularSimulacaoAtraso();
}

function fecharModalAtraso() { document.getElementById('atrasoModal').classList.add('hidden'); }

function calcularSimulacaoAtraso() {
    const valorOriginalStr = document.getElementById('atrasoValorOriginal').textContent;
    const valorOriginal = parseFloat(valorOriginalStr.replace(/[^0-9,]/g, '').replace(',', '.'));
    const diasAtraso = parseInt(document.getElementById('diasAtrasoInput').value) || 0;
    const multa = valorOriginal * multaAtraso;
    const juros = valorOriginal * jurosDiarioAtraso * diasAtraso;
    const total = valorOriginal + multa + juros;
    document.getElementById('atrasoValorMulta').textContent = formatBRL(multa);
    document.getElementById('atrasoValorJuros').textContent = formatBRL(juros);
    document.getElementById('atrasoValorTotal').textContent = formatBRL(total);
}

function mostrarAlerta(mensagem, tipo = 'warning') {
    const icons = { warning: 'exclamation-triangle-fill', success: 'check-circle-fill' };
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3`;
    alerta.style.zIndex = '9999';
    alerta.innerHTML = `<i class="bi bi-${icons[tipo]} me-2"></i><span>${mensagem}</span>`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

function setupCPFFormatting() { document.getElementById('clientCPF').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').substring(0, 11); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); e.target.value = v; }); }
function setupPixFormatting() {
    document.getElementById('clientPix').addEventListener('input', e => {
        if (pixType === 'cpf') {
            let v = e.target.value.replace(/\D/g, '').substring(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        } else if (pixType === 'telefone') {
            let v = e.target.value.replace(/\D/g, '').substring(0, 11);
            v = v.replace(/^(\d{2})(\d)/, '($1) $2'); v = v.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = v;
        }
    });
}