// --- CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const TAXA_PADRAO = 0.05;
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

// ATUALIZADO: A entrada padrão agora é de 15%
let entrada = { tipo: 'percentual', valor: 15 };

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    setupCPFFormatting();
    criarBotoesGarantia();
    gerarOpcoesDePagamento();
});

// --- LÓGICA DE CONFIGURAÇÕES (sem alterações) ---
function carregarConfiguracoes() {
    const temaSalvo = localStorage.getItem('calculadora_tema') || 'dark';
    definirTema(temaSalvo);
    const taxaSalva = parseFloat(localStorage.getItem('calculadora_taxa'));
    if (taxaSalva && !isNaN(taxaSalva)) { taxaAtual = taxaSalva / 100; }
}
function abrirModalConfig() { document.getElementById('configModal').classList.remove('hidden'); }
function fecharModalConfig() { document.getElementById('configModal').classList.add('hidden'); }
function verificarPIN() {
    if (document.getElementById('pinInput').value === PIN_ADMIN) {
        document.getElementById('pinView').classList.add('hidden');
        document.getElementById('settingsView').classList.remove('hidden');
        document.getElementById('taxaInput').value = taxaAtual * 100;
        const temaAtual = document.documentElement.getAttribute('data-theme');
        document.querySelectorAll('#settingsView .btn-selection').forEach(b => b.classList.remove('active'));
        document.getElementById(temaAtual === 'dark' ? 'btnThemeDark' : 'btnThemeLight').classList.add('active');
    } else { alert('PIN incorreto!'); }
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
    if (novaTaxa && !isNaN(novaTaxa) && novaTaxa > 0) {
        localStorage.setItem('calculadora_taxa', novaTaxa);
        taxaAtual = novaTaxa / 100;
        alert('Configurações salvas!');
        fecharModalConfig();
        if(telaAtual === 5) atualizarVisorPrincipal();
    } else { alert('Por favor, insira um valor de taxa válido.'); }
}

// --- LÓGICA DE CÁLCULO ---
const calcularValorParcela = (valor, meses) => { if (meses <= 0) return valor; const i = taxaAtual; const fator = (i * Math.pow(1 + i, meses)) / (Math.pow(1 + i, meses) - 1); return valor * fator; };
const calcularValorTotalProdutos = () => produtos.reduce((total, p) => total + p.valor, 0);
const formatBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarDataSimples = (data) => data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

// --- LÓGICA DAS TELAS ---
// (funções gerarOpcoesDePagamento, selectDiaPagamento, adicionar/remover/atualizarProduto, criarBotoesGarantia, atualizarLogicaGarantia, selectGarantia - sem alterações)
function gerarOpcoesDePagamento() {
    const container = document.getElementById('opcoesDiaPagamentoContainer'); container.innerHTML = '';
    const diasDePagamento = [5, 10, 15, 20, 25, 30]; const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const dataLimite = new Date(); dataLimite.setDate(hoje.getDate() + 33); let opcoesEncontradas = [];
    let dataCorrente = new Date(hoje); while (opcoesEncontradas.length < 12) { const diaDoMes = dataCorrente.getDate();
        if (diasDePagamento.includes(diaDoMes)) { if (!opcoesEncontradas.some(d => d.getTime() === dataCorrente.getTime())) { opcoesEncontradas.push(new Date(dataCorrente)); } }
        dataCorrente.setDate(dataCorrente.getDate() + 1); }
    opcoesEncontradas.forEach(dataOpcao => { const dia = dataOpcao.getDate(); const habilitado = dataOpcao <= dataLimite;
        const div = document.createElement('div'); div.className = 'col-4'; const button = document.createElement('button');
        button.className = 'btn btn-selection-date'; button.setAttribute('data-date-iso', dataOpcao.toISOString());
        button.onclick = () => selectDiaPagamento(button); button.disabled = !habilitado;
        button.innerHTML = `Dia ${dia} <span class="date-preview">Vence em ${formatarDataSimples(dataOpcao)}</span>`;
        div.appendChild(button); container.appendChild(div); });
}
function selectDiaPagamento(element) { dataPrimeiraParcela = new Date(element.getAttribute('data-date-iso')); document.querySelectorAll('.btn-selection-date').forEach(btn => btn.classList.remove('active')); element.classList.add('active'); }
function adicionarProduto() { const nomeInput = document.getElementById('produtoNome'); const valorInput = document.getElementById('produtoValor'); const nome = nomeInput.value.trim(); const valor = parseFloat(valorInput.value); if (!nome || !valor || valor <= 0) { mostrarAlerta('Preencha nome e valor válidos.', 'warning'); return; } produtos.push({ id: Date.now(), nome, valor }); atualizarListaProdutos(); nomeInput.value = ''; valorInput.value = ''; nomeInput.focus(); }
function removerProduto(id) { produtos = produtos.filter(p => p.id !== id); atualizarListaProdutos(); }
function atualizarListaProdutos() { const lista = document.getElementById('listaProdutos'); const totalVisor = document.getElementById('totalProdutos'); lista.innerHTML = produtos.map(p => `<div class="produto-card d-flex justify-content-between align-items-center"><span>${p.nome} - ${formatBRL(p.valor)}</span><button type="button" class="btn btn-sm btn-danger" onclick="removerProduto(${p.id})"><i class="bi bi-trash"></i></button></div>`).join(''); totalVisor.textContent = `Total: ${formatBRL(calcularValorTotalProdutos())}`; }
function criarBotoesGarantia() { const container = document.getElementById('garantiaBotoesContainer'); container.innerHTML = GARANTIAS.map((g, index) => `<div class="col-4"><button type="button" class="btn-garantia" id="garantia-btn-${g.meses}" onclick="selectGarantia(${index})">${g.meses} Meses</button></div>`).join(''); }
function atualizarLogicaGarantia() { const mesesPagamento = parseInt(document.getElementById('mesesPagamento').value); document.getElementById('mesesPagamentoDisplay').textContent = `${mesesPagamento} ${mesesPagamento === 1 ? 'mês' : 'meses'}`; let primeiroValidoEncontrado = false; GARANTIAS.forEach((g, index) => { const btn = document.getElementById(`garantia-btn-${g.meses}`); if (g.meses >= mesesPagamento) { btn.disabled = false; if (!primeiroValidoEncontrado) { if (garantiaSelecionada.meses < mesesPagamento) { selectGarantia(index); } primeiroValidoEncontrado = true; } } else { btn.disabled = true; } }); document.querySelectorAll('.btn-garantia').forEach(b => b.classList.remove('active')); document.getElementById(`garantia-btn-${garantiaSelecionada.meses}`).classList.add('active'); atualizarVisorPrincipal(); }
function selectGarantia(index) { garantiaSelecionada = GARANTIAS[index]; document.querySelectorAll('.btn-garantia').forEach(b => b.classList.remove('active')); document.getElementById(`garantia-btn-${garantiaSelecionada.meses}`).classList.add('active'); atualizarVisorPrincipal(); }

// --- LÓGICA DE ENTRADA (ATUALIZADA) ---

// NOVA FUNÇÃO: Atualiza o texto dos botões de entrada com os valores em R$
function atualizarBotoesDeEntrada() {
    const valorTotal = calcularValorTotalProdutos();
    
    // Calcula os valores para 15%, 25% e 35%
    const entrada15 = valorTotal * 0.15;
    const entrada25 = valorTotal * 0.25;
    const entrada35 = valorTotal * 0.35;

    // Atualiza o texto dos botões
    document.getElementById('btn-entrada-15').innerHTML = formatBRL(entrada15);
    document.getElementById('btn-entrada-25').innerHTML = formatBRL(entrada25);
    document.getElementById('btn-entrada-35').innerHTML = formatBRL(entrada35);

    // Garante que o botão de 15% (padrão) esteja ativo visualmente
    document.querySelectorAll('.btn-entrada').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-entrada-15').classList.add('active');
}

function selectEntrada(tipo, valor, element) {
    entrada.tipo = tipo;
    entrada.valor = valor;

    document.querySelectorAll('.btn-entrada').forEach(btn => btn.classList.remove('active'));
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
        document.getElementById('valorParcelaPrincipal').textContent = formatBRL(0); return;
    }

    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = 0;

    if (entrada.tipo === 'percentual') {
        valorDaEntrada = valorComGarantia * (entrada.valor / 100);
    } else if (entrada.tipo === 'fixo') {
        valorDaEntrada = entrada.valor;
    }

    const valorAFinanciar = valorComGarantia - valorDaEntrada;
    
    if (valorAFinanciar <= 0) {
        document.getElementById('valorParcelaPrincipal').textContent = formatBRL(0); return;
    }

    const valorParcela = calcularValorParcela(valorAFinanciar, mesesPagamento);
    document.getElementById('valorParcelaPrincipal').textContent = formatBRL(valorParcela);
}


// --- NAVEGAÇÃO E VALIDAÇÃO ---
function avancarTela() { if (!validarTelaAtual()) return; if (telaAtual < TOTAL_TELAS) { telaAtual++; atualizarExibicaoTela(); } }
function voltarTela() { if (telaAtual > 1) { telaAtual--; atualizarExibicaoTela(); } }

// ATUALIZADO: para chamar a função que atualiza os botões de entrada
function atualizarExibicaoTela() {
    document.querySelectorAll('.etapa').forEach(el => el.classList.remove('active'));
    document.getElementById(`tela${telaAtual}`).classList.add('active');
    
    if (telaAtual === 5) {
        // Primeiro, atualiza os textos dos botões com base no valor dos produtos
        atualizarBotoesDeEntrada(); 
        // Depois, executa a lógica de garantia e cálculo principal
        atualizarLogicaGarantia();
    }
    if (telaAtual === TOTAL_TELAS) {
        atualizarResumo();
    }

    document.getElementById('progressBar').style.width = `${(telaAtual / TOTAL_TELAS) * 100}%`;
    document.querySelector('.content-wrapper').scrollTo(0, 0);
}

// ATUALIZADO: para validar se a entrada é maior que zero
function validarTelaAtual() {
    indicadoName = sourceInfo === 'indicado' ? document.getElementById('clientIndicado').value.trim() : '';
    switch (telaAtual) {
        case 1:
            if (!document.getElementById('clientName').value.trim() || document.getElementById('clientCPF').value.replace(/\D/g, '').length !== 11) { mostrarAlerta('Nome e CPF são obrigatórios.', 'warning'); return false; }
            if (!dataPrimeiraParcela) { mostrarAlerta('Escolha o dia do vencimento.', 'warning'); return false; }
            return true;
        case 2: if (!clientStatus) { mostrarAlerta('Selecione seu status.', 'warning'); return false; } return true;
        case 3:
            if (clientStatus === 'yes' && !clientSituation) { mostrarAlerta('Selecione sua situação.', 'warning'); return false; }
            if (clientStatus === 'no' && !sourceInfo) { mostrarAlerta('Selecione como nos conheceu.', 'warning'); return false; }
            if (sourceInfo === 'indicado' && !indicadoName) { mostrarAlerta('Informe quem indicou.', 'warning'); return false; }
            return true;
        case 4: if (produtos.length === 0) { mostrarAlerta('Adicione um produto.', 'warning'); return false; } return true;
        case 5:
            const valorComGarantia = calcularValorTotalProdutos() * (1 + garantiaSelecionada.percentual / 100);
            let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
            if (valorDaEntrada <= 0) {
                mostrarAlerta('O valor da entrada deve ser maior que zero.', 'warning');
                return false;
            }
            return true;
        default: return true;
    }
}

function selectClientStatus(status, el) { clientStatus = status; document.querySelectorAll('#tela2 .btn-selection').forEach(b => b.classList.remove('active')); el.classList.add('active'); if (status === 'create') { if (confirm('Sair para criar cadastro?')) window.location.href = '#'; return; } document.getElementById('clientStatusOptions').classList.toggle('hidden', status !== 'yes'); document.getElementById('nonClientForm').classList.toggle('hidden', status !== 'no'); setTimeout(avancarTela, 200); }
function selectClientSituation(situation, el) { clientSituation = situation; document.querySelectorAll('#clientStatusOptions .btn-selection').forEach(b => b.classList.remove('active')); el.classList.add('active'); setTimeout(avancarTela, 200); }
function selectSource(source, el) { sourceInfo = source; document.querySelectorAll('#nonClientForm .btn-selection').forEach(b => b.classList.remove('active')); el.classList.add('active'); document.getElementById('indicadoField').classList.toggle('hidden', source !== 'indicado'); if (source !== 'indicado') setTimeout(avancarTela, 200); }


// --- TELA FINAL: RESUMO E WHATSAPP (Lógica já estava correta, apenas revisada) ---
function atualizarResumo() {
    document.getElementById('dataOrcamento').textContent = `Orçamento gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorProdutos = calcularValorTotalProdutos();
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
    const valorAFinanciar = valorComGarantia - valorDaEntrada;
    const valorParcela = calcularValorParcela(valorAFinanciar > 0 ? valorAFinanciar : 0, meses);
    const diasAtePagamento = Math.ceil((dataPrimeiraParcela - new Date()) / (1000 * 60 * 60 * 24));
    let mensagemStatusHTML = '';
    if (clientStatus === 'yes') { mensagemStatusHTML = clientSituation === 'no' ? '<div class="summary-alert alert-success"><strong>✓ PROBABILIDADE ALTA:</strong> Cliente com parcelas em dia tem alta chance de aprovação.</div>' : '<div class="summary-alert alert-warning"><strong><i class="bi bi-lock-fill me-2"></i>OPERAÇÃO BLOQUEADA:</strong> O sistema identificou parcelas em aberto no seu cadastro. Novas contratações estão temporariamente suspensas até a quitação da dívida.</div>';
    } else { mensagemStatusHTML = '<div class="summary-alert alert-info"><strong>📋 NOVO CLIENTE:</strong> Simulação sujeita à nossa política de análise de crédito.</div>'; }
    const ultimaParcelaData = new Date(dataPrimeiraParcela); ultimaParcelaData.setMonth(ultimaParcelaData.getMonth() + meses - 1);
    document.getElementById('dadosPessoaisBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-person me-2"></i>Dados do Cliente</h6><p><strong>Cliente:</strong> ${document.getElementById('clientName').value}<br><strong>CPF:</strong> ${document.getElementById('clientCPF').value}</p>${mensagemStatusHTML}`;
    document.getElementById('produtosBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-cart me-2"></i>Produtos</h6>` + produtos.map(p => `<div class="d-flex justify-content-between"><span>${p.nome}</span> <span>${formatBRL(p.valor)}</span></div>`).join('') + `<hr><p class="d-flex justify-content-between"><strong>Total:</strong> <strong>${formatBRL(valorProdutos)}</strong></p>`;
    document.getElementById('garantiaBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-shield-check me-2"></i>Garantia</h6><p><strong>Plano:</strong> ${garantiaSelecionada.nome}<br><strong>Duração:</strong> ${garantiaSelecionada.meses} meses</p>`;
    document.getElementById('pagamentoBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-credit-card me-2"></i>Pagamento</h6> <p><strong>Valor Total (c/ garantia):</strong> ${formatBRL(valorComGarantia)}<br> <strong>Entrada:</strong> ${formatBRL(valorDaEntrada)}<br> <strong>Valor a Financiar:</strong> ${formatBRL(valorAFinanciar)}<br> <strong>Parcelamento:</strong> ${meses}x de <strong>${formatBRL(valorParcela)}</strong></p>`;
    document.getElementById('cronogramaBlock').innerHTML = `<h6 class="summary-block-title"><i class="bi bi-calendar-month me-2"></i>Cronograma</h6><p><strong>Prazo para 1ª parcela:</strong> ${diasAtePagamento} dias<br><strong>1º Vencimento:</strong> ${dataPrimeiraParcela.toLocaleDateString('pt-BR')}<br><strong>Último Vencimento:</strong> ${ultimaParcelaData.toLocaleDateString('pt-BR')}</p>`;
}

function enviarWhatsApp() {
    if (telaAtual !== TOTAL_TELAS) { mostrarAlerta("Por favor, complete a simulação até o resumo para compartilhar.", "warning"); return; }
    const nome = document.getElementById('clientName').value.trim();
    const meses = parseInt(document.getElementById('mesesPagamento').value);
    const valorProdutos = calcularValorTotalProdutos();
    const valorComGarantia = valorProdutos * (1 + garantiaSelecionada.percentual / 100);
    let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor;
    const valorAFinanciar = valorComGarantia - valorDaEntrada;
    const valorParcela = calcularValorParcela(valorAFinanciar > 0 ? valorAFinanciar : 0, meses);
    let statusMsg = '';
    if (clientStatus === 'yes') { statusMsg = clientSituation === 'no' ? 'Cliente (parcelas em dia)' : 'Cliente (com pendência)';
    } else { statusMsg = sourceInfo === 'indicado' ? `Novo Cliente (indicado por: ${indicadoName})` : `Novo Cliente (fonte: ${sourceInfo})`; }
    const produtosMsg = produtos.map(p => `\n• ${p.nome} - ${formatBRL(p.valor)}`).join('');
    const message = `*🛒 SIMULAÇÃO DE PRODUTOS USADOS (COM ENTRADA)*\n\n` +
                  `*Cliente:* ${nome}\n` + `*Status:* ${statusMsg}\n\n` + `*Produtos Selecionados:*${produtosMsg}\n` +
                  `*Total Produtos:* ${formatBRL(valorProdutos)}\n\n` + `*Garantia Escolhida:*\n` + `Plano ${garantiaSelecionada.nome} (${garantiaSelecionada.meses} meses)\n\n` +
                  `*Condições de Pagamento:*\n` + `Valor Total (c/ garantia): ${formatBRL(valorComGarantia)}\n` + `Entrada: *${formatBRL(valorDaEntrada)}*\n` +
                  `Valor a Financiar: ${formatBRL(valorAFinanciar)}\n` + `Parcelamento: *${meses}x de ${formatBRL(valorParcela)}*\n` +
                  `Prazo para 1ª parcela: ${Math.ceil((dataPrimeiraParcela - new Date()) / (1000 * 60 * 60 * 24))} dias\n` +
                  `Primeiro Vencimento em: *${dataPrimeiraParcela.toLocaleDateString('pt-BR')}*\n\n` +
                  `_Simulação gerada em ${new Date().toLocaleDateString('pt-BR')} e sujeita à análise de crédito._`;
    const numeroWhatsApp = '5544998408460'; const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`;
    const link = document.createElement('a'); link.href = whatsappURL; link.target = '_blank';
    link.rel = 'noopener noreferrer'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

// --- MODAL DE SIMULAÇÃO DE ATRASO e UTILITÁRIOS (sem alterações) ---
function abrirModalAtraso() { if (!garantiaSelecionada) { mostrarAlerta('Finalize a simulação principal primeiro.', 'warning'); return; } const meses = parseInt(document.getElementById('mesesPagamento').value); const valorComGarantia = calcularValorTotalProdutos() * (1 + garantiaSelecionada.percentual / 100); let valorDaEntrada = (entrada.tipo === 'percentual') ? valorComGarantia * (entrada.valor / 100) : entrada.valor; const valorAFinanciar = valorComGarantia - valorDaEntrada; const valorParcela = calcularValorParcela(valorAFinanciar > 0 ? valorAFinanciar : 0, meses); document.getElementById('atrasoValorOriginal').textContent = formatBRL(valorParcela); document.getElementById('atrasoModal').classList.remove('hidden'); calcularSimulacaoAtraso(); }
function fecharModalAtraso() { document.getElementById('atrasoModal').classList.add('hidden'); }
function calcularSimulacaoAtraso() { const valorParcelaStr = document.getElementById('atrasoValorOriginal').textContent; const valorParcela = parseFloat(valorParcelaStr.replace('R$', '').replace(/\./g, '').replace(',', '.')); const diasAtraso = parseInt(document.getElementById('diasAtrasoInput').value) || 0; const multa = valorParcela * 0.05; const juros = (valorParcela * 0.001) * diasAtraso; const total = valorParcela + multa + juros; document.getElementById('atrasoValorMulta').textContent = formatBRL(multa); document.getElementById('atrasoValorJuros').textContent = formatBRL(juros); document.getElementById('atrasoValorTotal').textContent = formatBRL(total); }
function mostrarAlerta(mensagem, tipo = 'warning') { const icons = { warning: 'exclamation-triangle-fill', success: 'check-circle-fill' }; const alerta = document.createElement('div'); alerta.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3`; alerta.style.zIndex = '9999'; alerta.innerHTML = `<i class="bi bi-${icons[tipo]} me-2"></i><span>${mensagem}</span>`; document.body.appendChild(alerta); setTimeout(() => alerta.remove(), 3000); }
function setupCPFFormatting() { document.getElementById('clientCPF').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').substring(0, 11); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); e.target.value = v; }); }