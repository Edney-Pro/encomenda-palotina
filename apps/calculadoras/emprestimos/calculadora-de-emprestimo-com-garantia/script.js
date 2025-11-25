// --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const PIN_ADMIN = "68366836";
const TOTAL_TELAS = 5;

// Valores padrão que podem ser alterados nas configurações
const TAXA_PADRAO = 0.16; // 16% a.m.
const MULTA_ATRASO_PADRAO = 0.20; // 20%
const JUROS_DIARIO_ATRASO_PADRAO = 0.008; // 0.8% ao dia

let taxaAtual = TAXA_PADRAO;
let multaAtraso = MULTA_ATRASO_PADRAO;
let jurosDiarioAtraso = JUROS_DIARIO_ATRASO_PADRAO;

// Estado da aplicação
let telaAtual = 1;
let dataPrimeiraParcela = null;
let pixType = '', selectedBanco = '';
let clientStatus = '', clientSituation = '', sourceInfo = '', indicadoName = '';

// --- INICIALIZAÇÃO E CONFIGURAÇÕES ---
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    setupCPFFormatting();
    setupPixFormatting();
    gerarOpcoesDePagamento();
    atualizarVisores();
});

function carregarConfiguracoes() {
    const temaSalvo = localStorage.getItem('garantia_tema') || 'dark';
    definirTema(temaSalvo);
    
    taxaAtual = parseFloat(localStorage.getItem('garantia_taxa')) / 100 || TAXA_PADRAO;
    multaAtraso = parseFloat(localStorage.getItem('garantia_multa')) / 100 || MULTA_ATRASO_PADRAO;
    jurosDiarioAtraso = parseFloat(localStorage.getItem('garantia_juros_diario')) / 100 || JUROS_DIARIO_ATRASO_PADRAO;
    
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
        document.getElementById('taxaInput').value = taxaAtual * 100;
        document.getElementById('multaInput').value = multaAtraso * 100;
        document.getElementById('jurosInput').value = jurosDiarioAtraso * 100;
        
        const temaAtual = document.documentElement.getAttribute('data-theme');
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(temaAtual === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    } else {
        alert('PIN incorreto!');
    }
}

function definirTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('garantia_tema', tema);
    if(document.getElementById('settingsView').classList.contains('hidden') === false){
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(tema === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    }
}

function salvarConfig() {
    const novaTaxa = parseFloat(document.getElementById('taxaInput').value);
    const novaMulta = parseFloat(document.getElementById('multaInput').value);
    const novosJuros = parseFloat(document.getElementById('jurosInput').value);

    if (!isNaN(novaTaxa) && novaTaxa > 0) localStorage.setItem('garantia_taxa', novaTaxa);
    if (!isNaN(novaMulta) && novaMulta >= 0) localStorage.setItem('garantia_multa', novaMulta);
    if (!isNaN(novosJuros) && novosJuros >= 0) localStorage.setItem('garantia_juros_diario', novosJuros);
    
    alert('Configurações salvas!');
    fecharModalConfig();
    carregarConfiguracoes();
    if(telaAtual === 4) atualizarVisores();
}

// --- LÓGICA DE CÁLCULO E FORMATAÇÃO ---
const formatBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarDataSimples = (data) => data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const calcularValorParcela = (valor, meses) => {
    if (meses <= 0 || valor <= 0) return 0;
    const i = taxaAtual;
    const fator = (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1);
    return valor * fator;
};

// --- LÓGICA DAS TELAS ---
function gerarOpcoesDePagamento() {
    const container = document.getElementById('opcoesDiaPagamentoContainer');
    container.innerHTML = '';
    const diasDePagamentoFixos = [5, 10, 15, 20, 25, 30];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + 33);

    let opcoesEncontradas = [];
    let dataCorrente = new Date(hoje);
    while (opcoesEncontradas.length < 12 && dataCorrente <= dataLimite) {
        if (diasDePagamentoFixos.includes(dataCorrente.getDate())) {
            if (!opcoesEncontradas.some(d => d.getTime() === dataCorrente.getTime())) {
                opcoesEncontradas.push(new Date(dataCorrente));
            }
        }
        dataCorrente.setDate(dataCorrente.getDate() + 1);
    }
    
    opcoesEncontradas.forEach(dataOpcao => {
        const dia = dataOpcao.getDate();
        const div = document.createElement('div');
        div.className = 'col-4';
        const button = document.createElement('button');
        button.className = 'btn btn-selection-date';
        button.setAttribute('data-date-iso', dataOpcao.toISOString());
        button.onclick = () => selectDiaPagamento(button);
        button.innerHTML = `Dia ${dia} <span class="date-preview">Vence em ${formatarDataSimples(dataOpcao)}</span>`;
        div.appendChild(button);
        container.appendChild(div);
    });
}

function selectDiaPagamento(element) {
    dataPrimeiraParcela = new Date(element.getAttribute('data-date-iso'));
    document.querySelectorAll('.btn-selection-date').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
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

function selectBancoModal(banco, el) {
    selectedBanco = banco;
    document.querySelectorAll('.btn-banco').forEach(b => b.classList.remove('active'));
    document.getElementById('btnOutroBanco').innerHTML = `<i class="bi bi-bank"></i> ${banco}`;
    document.getElementById('btnOutroBanco').classList.add('active');
    fecharModalBanco();
}


function atualizarVisores() {
    const valor = parseInt(document.getElementById('loanValue').value);
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorProduto = valor * 2;
    const valorParcela = calcularValorParcela(valor, meses);

    document.getElementById('loanValueDisplay').textContent = formatBRL(valor);
    document.getElementById('productValueDisplay').textContent = formatBRL(valorProduto);
    document.getElementById('mesesPagamentoDisplay').textContent = `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    document.getElementById('valorParcelaPrincipal').textContent = formatBRL(valorParcela);
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
            if (!dataPrimeiraParcela) { mostrarAlerta('Escolha a data da 1ª parcela.', 'warning'); return false; }
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
    const valor = parseInt(document.getElementById('loanValue').value);
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorParcela = calcularValorParcela(valor, meses);

    let mensagemStatusHTML = '';
    if (clientStatus === 'yes') { mensagemStatusHTML = clientSituation === 'no' ? '<div class="summary-alert alert-success"><strong>✓ PROBABILIDADE ALTA:</strong> Cliente com parcelas em dia tem alta chance de aprovação.</div>' : '<div class="summary-alert alert-warning"><strong>⚠️ ATENÇÃO:</strong> Análise de crédito necessária devido a pendências.</div>'; } else { mensagemStatusHTML = '<div class="summary-alert alert-info"><strong>📋 NOVO CLIENTE:</strong> Simulação sujeita à análise de crédito.</div>'; }

    const ultimaParcelaData = new Date(dataPrimeiraParcela);
    ultimaParcelaData.setMonth(ultimaParcelaData.getMonth() + meses - 1);

    document.getElementById('dadosPessoaisBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-person me-2"></i>Dados do Cliente</h6><p><strong>Cliente:</strong> ${document.getElementById('clientName').value}<br><strong>CPF:</strong> ${document.getElementById('clientCPF').value}<br><strong>PIX:</strong> ${document.getElementById('clientPix').value}<br><strong>Banco:</strong> ${selectedBanco}</p>${mensagemStatusHTML}`;
    document.getElementById('emprestimoBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-cash-coin me-2"></i>Detalhes do Empréstimo</h6><p><strong>Valor Solicitado:</strong> ${formatBRL(valor)}<br><strong>Prazo:</strong> ${meses} meses</p>`;
    document.getElementById('garantiaBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-box-seam me-2"></i>Garantia</h6><p><strong>Valor do Produto:</strong> ${formatBRL(valor * 2)}<br><small class="text-muted">O produto com nota fiscal deve ser apresentado para análise.</small></p>`;
    document.getElementById('pagamentoBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-credit-card me-2"></i>Pagamento</h6><p><strong>Parcelamento:</strong> ${meses}x de <strong>${formatBRL(valorParcela)}</strong><br><strong>1º Vencimento:</strong> ${dataPrimeiraParcela.toLocaleDateString('pt-BR')}<br><strong>Último Vencimento:</strong> ${ultimaParcelaData.toLocaleDateString('pt-BR')}</p>`;
}

function enviarWhatsApp() {
    if (telaAtual !== TOTAL_TELAS) { mostrarAlerta("Complete a simulação até o resumo.", "warning"); return; }
    const nome = document.getElementById('clientName').value.trim();
    const valor = parseInt(document.getElementById('loanValue').value);
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorParcela = calcularValorParcela(valor, meses);
    const valorProduto = valor * 2;
    let statusMsg = '';
    if (clientStatus === 'yes') { statusMsg = clientSituation === 'no' ? 'Cliente (parcelas em dia)' : 'Cliente (com pendência)'; } else { statusMsg = sourceInfo === 'indicado' ? `Novo Cliente (indicado por: ${indicadoName})` : `Novo Cliente (fonte: ${sourceInfo})`; }
    const message = `*🛡️ SIMULAÇÃO DE EMPRÉSTIMO COM GARANTIA*\n\n*Cliente:* ${nome}\n*Status:* ${statusMsg}\n\n*Resumo da Solicitação:*\n• Valor do Empréstimo: *${formatBRL(valor)}*\n• Valor do Produto (Garantia): *${formatBRL(valorProduto)}*\n• Parcelamento: *${meses}x de ${formatBRL(valorParcela)}*\n• 1ª Parcela em: *${dataPrimeiraParcela.toLocaleDateString('pt-BR')}*\n\n_Simulação gerada em ${new Date().toLocaleDateString('pt-BR')}._`;
    const numeroWhatsApp = '5544998408460';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`, '_blank');
}

// --- MODAL DE ATRASO E UTILITÁRIOS ---
function abrirModalAtraso() {
    if (telaAtual < 4) { mostrarAlerta('Finalize a simulação principal primeiro.', 'warning'); return; }
    const valorParcela = calcularValorParcela(parseInt(document.getElementById('loanValue').value), parseInt(document.getElementById('mesesPagamento').value));
    document.getElementById('atrasoValorOriginal').textContent = formatBRL(valorParcela);
    document.getElementById('atrasoMultaPercent').textContent = (multaAtraso * 100).toFixed(0);
    document.getElementById('atrasoJurosPercent').textContent = (jurosDiarioAtraso * 100).toFixed(1);
    document.getElementById('atrasoModal').classList.remove('hidden');
    calcularSimulacaoAtraso();
}

function fecharModalAtraso() { document.getElementById('atrasoModal').classList.add('hidden'); }

function calcularSimulacaoAtraso() {
    const valorParcelaStr = document.getElementById('atrasoValorOriginal').textContent;
    const valorParcela = parseFloat(valorParcelaStr.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    const diasAtraso = parseInt(document.getElementById('diasAtrasoInput').value) || 0;
    const multa = valorParcela * multaAtraso;
    const juros = valorParcela * jurosDiarioAtraso * diasAtraso;
    const total = valorParcela + multa + juros;
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