let etapaAtual = 1;
let dadosCalculo = {};

document.addEventListener('DOMContentLoaded', function() {
    atualizarPorcentagens();
    configurarEventos();
});

function configurarEventos() {
    // Atualizar porcentagens em tempo real
    document.getElementById('porcent1').addEventListener('input', atualizarPorcentagens);
    document.getElementById('porcent2').addEventListener('input', atualizarPorcentagens);
    
    // Formatação de moeda
    document.querySelectorAll('.money-input').forEach(input => {
        input.addEventListener('input', function() {
            formatarMoeda(this);
        });
    });
}

function atualizarPorcentagens() {
    const p1 = parseInt(document.getElementById('porcent1').value) || 0;
    const p2 = parseInt(document.getElementById('porcent2').value) || 0;
    const pEmpresa = 100 - p1 - p2;
    
    document.getElementById('porcentEmpresa').value = pEmpresa;
    document.getElementById('badge1').textContent = p1 + '%';
    document.getElementById('badge2').textContent = p2 + '%';
    document.getElementById('badgeEmpresa').textContent = pEmpresa + '%';
    
    const total = p1 + p2 + pEmpresa;
    const totalElement = document.getElementById('totalPorcentagem');
    totalElement.textContent = `Total: ${total}%`;
    
    if (total !== 100) {
        totalElement.style.color = 'var(--danger)';
    } else {
        totalElement.style.color = 'var(--success)';
    }
}

function formatarMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    valor = valor.replace(/(\d)(\d{3}),/g, "$1.$2,");
    input.value = 'R$ ' + valor;
}

function converterParaNumero(valorFormatado) {
    if (!valorFormatado || valorFormatado === 'R$ 0,00') return 0;
    let valor = valorFormatado.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    return parseFloat(valor) || 0;
}

function avancarEtapa(etapaDestino = null) {
    const novaEtapa = etapaDestino || etapaAtual + 1;
    
    // Validar etapa atual
    if (novaEtapa === 2 && !validarEtapa1()) return;
    if (novaEtapa === 3 && !validarEtapa2()) return;
    if (novaEtapa === 4) calcular();
    
    // Ocultar etapa atual
    document.getElementById(`etapa${etapaAtual}`).classList.remove('active');
    
    // Mostrar nova etapa
    document.getElementById(`etapa${novaEtapa}`).classList.add('active');
    
    // Atualizar progresso
    const progresso = (novaEtapa / 4) * 100;
    document.getElementById('progressFill').style.width = `${progresso}%`;
    
    // Atualizar steps
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 <= novaEtapa) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    etapaAtual = novaEtapa;
    atualizarBotoesNavegacao();
}

function voltarEtapa() {
    if (etapaAtual > 1) {
        avancarEtapa(etapaAtual - 1);
    }
}

function atualizarBotoesNavegacao() {
    const btnVoltar = document.getElementById('btnVoltar');
    const btnAvancar = document.getElementById('btnAvancar');
    
    btnVoltar.style.display = etapaAtual > 1 ? 'inline-flex' : 'none';
    
    if (etapaAtual === 4) {
        btnAvancar.textContent = 'Finalizar';
        btnAvancar.disabled = true;
    } else {
        btnAvancar.textContent = 'Avançar →';
        btnAvancar.disabled = false;
    }
}

function validarEtapa1() {
    const p1 = parseInt(document.getElementById('porcent1').value) || 0;
    const p2 = parseInt(document.getElementById('porcent2').value) || 0;
    const pEmpresa = parseInt(document.getElementById('porcentEmpresa').value) || 0;
    
    if (p1 + p2 + pEmpresa !== 100) {
        alert('A soma das porcentagens deve ser 100%!');
        return false;
    }
    
    return true;
}

function validarEtapa2() {
    const entradas = converterParaNumero(document.getElementById('entradas').value);
    const pendente = converterParaNumero(document.getElementById('pendente').value);
    const investimento = converterParaNumero(document.getElementById('investimento').value);
    
    if (entradas === 0 && pendente === 0 && investimento === 0) {
        alert('Informe pelo menos um valor financeiro!');
        return false;
    }
    
    return true;
}

function calcular() {
    const empresa = document.getElementById('empresa').value || 'Empresa';
    const socio1 = document.getElementById('socio1').value || 'Sócio 01';
    const socio2 = document.getElementById('socio2').value || 'Sócio 02';
    const p1 = parseInt(document.getElementById('porcent1').value) / 100;
    const p2 = parseInt(document.getElementById('porcent2').value) / 100;
    const pEmpresa = parseInt(document.getElementById('porcentEmpresa').value) / 100;
    
    const entradas = converterParaNumero(document.getElementById('entradas').value);
    const pendente = converterParaNumero(document.getElementById('pendente').value);
    const investimento = converterParaNumero(document.getElementById('investimento').value);
    
    // Cálculos
    const receitaTotal = entradas + pendente;
    const lucroLiquido = receitaTotal - investimento;
    
    const valEmpresa = lucroLiquido * pEmpresa;
    const valSocio1 = lucroLiquido * p1;
    const valSocio2 = lucroLiquido * p2;
    
    // Salvar dados
    dadosCalculo = {
        empresa, socio1, socio2,
        p1: p1 * 100, p2: p2 * 100, pEmpresa: pEmpresa * 100,
        entradas, pendente, investimento,
        receitaTotal, lucroLiquido,
        valEmpresa, valSocio1, valSocio2
    };
    
    // Atualizar interface
    atualizarResultados();
}

function atualizarResultados() {
    // Etapa 3 - Resumo
    document.getElementById('resumoFinanceiro').innerHTML = `
        <div class="resumo-item">
            <span>Entradas Recebidas:</span>
            <span class="valor">${formatarMoedaValor(dadosCalculo.entradas)}</span>
        </div>
        <div class="resumo-item">
            <span>Valores Pendentes:</span>
            <span class="valor">${formatarMoedaValor(dadosCalculo.pendente)}</span>
        </div>
        <div class="resumo-item">
            <span>Investimento:</span>
            <span class="valor negativo">${formatarMoedaValor(dadosCalculo.investimento)}</span>
        </div>
        <div class="resumo-item total">
            <span>Receita Total:</span>
            <span class="valor">${formatarMoedaValor(dadosCalculo.receitaTotal)}</span>
        </div>
    `;
    
    document.getElementById('lucroTotal').innerHTML = `
        <div class="lucro-valor ${dadosCalculo.lucroLiquido >= 0 ? 'positivo' : 'negativo'}">
            ${formatarMoedaValor(dadosCalculo.lucroLiquido)}
        </div>
        <div class="lucro-label">
            ${dadosCalculo.lucroLiquido >= 0 ? 'Lucro Líquido' : 'Prejuízo Líquido'}
        </div>
    `;
    
    // Etapa 4 - Divisão Final
    document.getElementById('valorEmpresa').textContent = formatarMoedaValor(dadosCalculo.valEmpresa);
    document.getElementById('porcentEmpresaFinal').textContent = dadosCalculo.pEmpresa.toFixed(1) + '%';
    
    document.getElementById('valorSocio1').textContent = formatarMoedaValor(dadosCalculo.valSocio1);
    document.getElementById('porcentSocio1Final').textContent = dadosCalculo.p1.toFixed(1) + '%';
    
    document.getElementById('valorSocio2').textContent = formatarMoedaValor(dadosCalculo.valSocio2);
    document.getElementById('porcentSocio2Final').textContent = dadosCalculo.p2.toFixed(1) + '%';
}

function formatarMoedaValor(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function zerarCalculadora() {
    if (confirm('Deseja zerar todos os dados?')) {
        document.getElementById('empresa').value = 'Minha Empresa LTDA';
        document.getElementById('socio1').value = 'Sócio 01';
        document.getElementById('socio2').value = 'Sócio 02';
        document.getElementById('porcent1').value = '15';
        document.getElementById('porcent2').value = '15';
        document.getElementById('entradas').value = 'R$ 0,00';
        document.getElementById('pendente').value = 'R$ 0,00';
        document.getElementById('investimento').value = 'R$ 0,00';
        
        atualizarPorcentagens();
        avancarEtapa(1);
    }
}

function compartilharWhatsApp() {
    const message = `*📊 DIVISÃO DE LUCROS - ${dadosCalculo.empresa.toUpperCase()}*\n\n` +
                   `*💵 VALORES:*\n` +
                   `Entradas: ${formatarMoedaValor(dadosCalculo.entradas)}\n` +
                   `Pendentes: ${formatarMoedaValor(dadosCalculo.pendente)}\n` +
                   `Investimento: ${formatarMoedaValor(dadosCalculo.investimento)}\n` +
                   `Lucro Líquido: ${formatarMoedaValor(dadosCalculo.lucroLiquido)}\n\n` +
                   `*👥 DIVISÃO:*\n` +
                   `Empresa (${dadosCalculo.pEmpresa.toFixed(1)}%): ${formatarMoedaValor(dadosCalculo.valEmpresa)}\n` +
                   `${dadosCalculo.socio1} (${dadosCalculo.p1.toFixed(1)}%): ${formatarMoedaValor(dadosCalculo.valSocio1)}\n` +
                   `${dadosCalculo.socio2} (${dadosCalculo.p2.toFixed(1)}%): ${formatarMoedaValor(dadosCalculo.valSocio2)}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

// Inicializar
atualizarBotoesNavegacao();