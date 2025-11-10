document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIÁVEIS GLOBAIS E CONFIGURAÇÃO ---
    let currentStep = 1;
    const totalSteps = 8;
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const helpModal = document.getElementById('help-modal');

    // Mapeia quais campos pertencem a cada etapa para validação
    const stepFields = {
        1: ['fullName', 'cpf', 'rg', 'birthDate', 'phone', 'email'],
        2: ['cep', 'street', 'number', 'neighborhood', 'residenceTime'],
        3: ['isClient', 'paymentStatus', 'howMet', 'referrerName'], // Campos condicionais
        4: ['salaryRange'],
        5: ['profRefName', 'profRefPhone'], // Apenas os obrigatórios
        6: ['social1'] // Apenas o obrigatório
    };

    // Informações para atualizar o cabeçalho a cada etapa
    const headerInfo = {
        1: { i: 'fa-user-plus', t: 'Etapa 1: Pessoais', s: 'Seus dados de identificação.' },
        2: { i: 'fa-map-marker-alt', t: 'Etapa 2: Endereço', s: 'Onde você mora.' },
        3: { i: 'fa-question-circle', t: 'Etapa 3: Situação', s: 'Seu relacionamento conosco.' },
        4: { i: 'fa-dollar-sign', t: 'Etapa 4: Financeiro', s: 'Sua renda mensal.' },
        5: { i: 'fa-users', t: 'Etapa 5: Referências', s: 'Contatos para referência.' },
        6: { i: 'fa-share-alt', t: 'Etapa 6: Redes Sociais', s: 'Seus perfis online.' },
        7: { i: 'fa-check-circle', t: 'Etapa 7: Resumo', s: 'Revise seus dados.' },
        8: { i: 'fa-exclamation-triangle', t: 'Etapa 8: Aviso Final', s: 'Leia antes de enviar.' }
    };

    // --- 2. FUNÇÕES DE NAVEGAÇÃO E INTERFACE (UI) ---

    // Função principal para trocar de etapa
    window.goToStep = (step) => {
        if (step < 1 || step > totalSteps) return; // Limita a navegação
        document.querySelector('.form-step.active').classList.remove('active');
        document.getElementById(`step-${step}`).classList.add('active');
        currentStep = step;
        if (currentStep === 7) populateSummary(); // Se for a etapa de resumo, preenche os dados
        updateUI(); // Atualiza a aparência da tela
    };

    // Atualiza o cabeçalho, os botões e rola a tela para o topo
    const updateUI = () => {
        const info = headerInfo[currentStep];
        document.getElementById('header-icon').className = `fas ${info.i} logo-icon`;
        document.getElementById('header-title').textContent = info.t;
        document.getElementById('header-tagline').textContent = info.s;

        // Lógica de exibição e texto dos botões inferiores
        backBtn.style.display = (currentStep > 1 && currentStep < 8) ? 'block' : 'none'; // Mostra o "Voltar" a partir da etapa 2
        nextBtn.style.display = 'block';

        if (currentStep < 7) {
            nextBtn.textContent = 'Próximo';
            nextBtn.className = 'action-button primary';
        } else if (currentStep === 7) {
            nextBtn.textContent = 'Confirmar e Avançar';
            nextBtn.className = 'action-button primary full-width'; // Ocupa a tela toda
            backBtn.style.display = 'none'; // Oculta o "Voltar" na tela de resumo
        } else { // Etapa 8 (Aviso Final)
            nextBtn.textContent = '✅ Entendi, Enviar no WhatsApp';
            nextBtn.className = 'action-button whatsapp full-width';
            backBtn.style.display = 'none'; // Oculta o "Voltar" na tela final
        }
        document.querySelector('main').scrollTop = 0; // Garante que o topo da etapa seja exibido
    };

    // --- 3. FUNÇÕES DAS ETAPAS ESPECIAIS (RESUMO E ENVIO) ---

    // Preenche a Etapa 7 com os dados salvos no localStorage
    const populateSummary = () => {
        const summaryData = [
            { t: 'Dados Pessoais', s: 1, f: { 'Nome': 'fullName', 'CPF': 'cpf', 'RG': 'rg', 'Nascimento': 'birthDate', 'Telefone': 'phone', 'E-mail': 'email' } },
            { t: 'Endereço', s: 2, f: { 'Endereço': ['street', 'number'], 'Bairro': 'neighborhood', 'Cidade/UF': ['city', 'state'], 'CEP': 'cep' } },
            { t: 'Situação', s: 3, f: { 'Cliente?': 'isClient', 'Pagamentos': 'paymentStatus', 'Conheceu por': 'howMet', 'Indicado por': 'referrerName' } },
            { t: 'Financeiro', s: 4, f: { 'Faixa Salarial': 'salaryRange' } },
            { t: 'Referências', s: 5, f: { 'Profissional': ['profRefName', 'profRefPhone'], 'Pessoal': ['personalRefName', 'personalRefPhone'] } },
            { t: 'Redes Sociais', s: 6, f: { 'Instagram': 'social1', 'Facebook': 'social2' } }
        ];
        const container = document.getElementById('summary-content');
        container.innerHTML = summaryData.map(sec => {
            let items = Object.entries(sec.f).map(([lbl, key]) => {
                let val = Array.isArray(key) ? key.map(k => localStorage.getItem(k) || '').join(', ') : localStorage.getItem(key) || '';
                if (!val.trim() || val.trim() === ',') return ''; // Não mostra campos vazios
                return `<div class="summary-item"><span class="label">${lbl}:</span> <span class="value">${val}</span></div>`;
            }).join('');
            return items ? `<div class="summary-section"><div class="summary-title">${sec.t} <span class="summary-edit-btn" onclick="goToStep(${sec.s})">Editar</span></div>${items}</div>` : '';
        }).join('');
    };
    
    // Monta a mensagem final e abre o WhatsApp
    const submitToWhatsApp = () => {
        for (let i = 1; i < 7; i++) { if (!validateStep(i)) { goToStep(i); return; } } // Revalida tudo por segurança
        let msg = `*NOVO CADASTRO*\n\n*Pessoal:*\nNome: ${localStorage.getItem('fullName')}\nCPF: ${localStorage.getItem('cpf')}\nRG: ${localStorage.getItem('rg')}\n\n*Endereço:*\n${localStorage.getItem('street')}, ${localStorage.getItem('number')} - ${localStorage.getItem('neighborhood')}, ${localStorage.getItem('city')}/${localStorage.getItem('state')}\n\n*Situação:*\nCliente: ${localStorage.getItem('isClient')}\n` + (localStorage.getItem('isClient') === 'Sim' ? `Pagamentos: ${localStorage.getItem('paymentStatus')}\n\n` : `Conheceu: ${localStorage.getItem('howMet')} ${localStorage.getItem('referrerName') ? `(Indicado: ${localStorage.getItem('referrerName')})` : ''}\n\n`) + `*Referências:*\nProfissional: ${localStorage.getItem('profRefName')} - ${localStorage.getItem('profRefPhone')}\n` + (localStorage.getItem('personalRefName') ? `Pessoal: ${localStorage.getItem('personalRefName')} - ${localStorage.getItem('personalRefPhone')}` : '') + `\n\n*Redes Sociais:*\nInstagram: ${localStorage.getItem('social1')}`;
        window.open(`https://wa.me/5544998408460?text=${encodeURIComponent(msg)}`, '_blank');
        localStorage.clear();
    };

    // --- 4. FUNÇÕES DE VALIDAÇÃO ---
    const validateField = (id) => {
        const i = document.getElementById(id);
        if (!i) return true; // Se o campo não existe, considera válido
        let v = false;
        if (i.type === 'radio') {
            v = document.querySelector(`input[name="${i.name}"]:checked`) !== null;
        } else {
            v = i.checkValidity(); // Usa a validação nativa do navegador (required, type=email, etc.)
            // Adiciona validação por MÁSCARA para o RG
            if (i.id === 'rg' && v) v = /^\d{2}\.\d{3}\.\d{3}-\d$/.test(i.value);
        }
        i.classList.toggle('is-valid', v);
        i.classList.toggle('is-invalid', !v);
        return v;
    };
    const validateStep = (s) => {
        if (s >= 7) return true; // Etapas 7 e 8 não têm campos para validar
        return stepFields[s].every(id => {
            const el = document.getElementById(id);
            // Valida apenas campos visíveis (importante para a Etapa 3)
            return !el || el.offsetParent === null || validateField(id);
        });
    };

    // --- 5. INICIALIZAÇÃO E EVENT LISTENERS ---

    // Atribui funções aos botões
    nextBtn.onclick = () => { if (currentStep < 7) { if (validateStep(currentStep)) goToStep(currentStep + 1); } else if (currentStep === 7) { goToStep(8); } else { submitToWhatsApp(); } };
    backBtn.onclick = () => goToStep(currentStep - 1);
    document.getElementById('help-btn').onclick = () => helpModal.style.display = 'flex';
    document.getElementById('close-help-btn').onclick = () => helpModal.style.display = 'none';

    // Salva/Carrega dados do localStorage
    document.querySelectorAll('.form-control, input[type="radio"]').forEach(i => {
        const k = i.name || i.id, saved = localStorage.getItem(k);
        if (i.type === 'radio') { if (saved === i.value) i.checked = true; } else if (saved) i.value = saved;
        const eventType = i.type === 'radio' || i.tagName === 'SELECT' ? 'change' : 'input';
        i.addEventListener(eventType, () => localStorage.setItem(k, i.type === 'radio' ? document.querySelector(`input[name="${k}"]:checked`).value : i.value));
        if (i.type !== 'radio') i.addEventListener('blur', () => validateField(i.id));
    });

    // Listeners para os campos condicionais da Etapa 3
    document.querySelectorAll('input[name="isClient"]').forEach(r => r.addEventListener('change', e => {
        const isClient = e.target.value === 'Sim';
        document.getElementById('existingClientFields').style.display = isClient ? 'block' : 'none';
        document.getElementById('newClientFields').style.display = !isClient ? 'block' : 'none';
    }));
    document.getElementById('howMet').addEventListener('change', e => { document.getElementById('referrerField').style.display = e.target.value === 'Indicação' ? 'block' : 'none'; });
    
    // Ativa o avanço automático
    document.querySelectorAll('.form-control').forEach(i => {
        i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'blur', () => {
            setTimeout(() => {
                const fields = stepFields[currentStep] || [];
                if (fields.length > 0 && i.id === fields[fields.length - 1] && validateStep(currentStep)) goToStep(currentStep + 1);
            }, 100);
        });
    });

    // Dispara 'change' para mostrar/ocultar campos com base nos dados salvos ao carregar
    const savedIsClient = document.querySelector('input[name="isClient"]:checked'); if (savedIsClient) savedIsClient.dispatchEvent(new Event('change'));
    const savedHowMet = document.getElementById('howMet'); if (savedHowMet.value) savedHowMet.dispatchEvent(new Event('change'));
    
    // Máscaras de formatação
    const applyMask = (id, func) => { const el = document.getElementById(id); if (el) el.addEventListener('input', e => e.target.value = func(e.target.value)); };
    applyMask('cpf', v => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'));
    applyMask('rg', v => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)$/, '$1-$2'));
    applyMask('phone', v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'));
    applyMask('personalRefPhone', v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'));
    applyMask('profRefPhone', v => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'));
    applyMask('cep', v => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2'));
    
    // API de CEP
    document.getElementById('cep').addEventListener('blur', async (e) => {
        if (validateField('cep')) {
            const res = await fetch(`https://viacep.com.br/ws/${e.target.value.replace(/\D/g, '')}/json/`);
            if (res.ok) {
                const d = await res.json();
                if (!d.erro) {
                    ['street', 'neighborhood', 'city', 'state'].forEach(id => {
                        const k = {street: 'logradouro', neighborhood: 'bairro', city: 'localidade', state: 'uf'}[id];
                        document.getElementById(id).value = d[k]; localStorage.setItem(id, d[k]);
                    });
                    document.getElementById('number').focus();
                }
            }
        }
    });

    // Inicia a UI na primeira etapa
    updateUI();
});