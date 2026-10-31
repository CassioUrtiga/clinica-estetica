document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        // Modais e Drawer
        bookingModal: document.getElementById('booking-modal'),
        openModalBtn: document.getElementById('open-modal-btn'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        drawerOverlay: document.getElementById('treatments-drawer-overlay'),
        openDrawerBtn: document.getElementById('open-drawer-btn'),
        closeDrawerBtn: document.getElementById('close-drawer-btn'),
        openModalFromDrawer: document.getElementById('open-modal-from-drawer'),
        closeSessionBtn: document.getElementById('close-session-btn'),

        // Autenticação
        authSection: document.getElementById('auth-section'),
        treatmentsSection: document.getElementById('treatments-section'),
        drawerTitle: document.getElementById('drawer-title'),
        formStepEmail: document.getElementById('form-step-email'),
        formStepCode: document.getElementById('form-step-code'),
        userEmailInput: document.getElementById('user-email-input'),
        sentEmailLabel: document.getElementById('sent-email-label'),
        backToEmailBtn: document.getElementById('back-to-email-btn'),
        emailErrorMsg: document.getElementById('email-error-msg'),
        codeErrorMsg: document.getElementById('code-error-msg'),
        codeDigits: document.querySelectorAll('.code-digit'),

        // Inputs do Formulário Principal
        inputNome: document.getElementById('id_nome'),
        inputEmail: document.getElementById('id_email'),
        inputTelefone: document.getElementById('id_telefone'),
    };

    // -------------------------------------------------------------
    // Funções Utilitárias e Modulares
    // -------------------------------------------------------------
    
    // Alterna a classe 'open' em um elemento
    const toggleElement = (el, forceOpen) => el?.classList.toggle('open', forceOpen);

    // Formata o nome (caso necessário)
    const formatName = (name) => name ? name : 'Não informado';

    // Exibe mensagens temporárias de erro
    const showError = (element, message) => {
        if (!element) return;
        element.textContent = message;
        setTimeout(() => { element.textContent = ''; }, 4000);
    };

    // Função para requisições POST
    async function sendPostRequest(form, payload) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, val]) => formData.append(key, val));

        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]')?.value 
                       || document.querySelector('[name=csrfmiddlewaretoken]')?.value;

        const response = await fetch(form.action, {
            method: 'POST',
            headers: { 'X-CSRFToken': csrfToken },
            body: formData
        });

        const data = await response.json();
        return { ok: response.ok, data };
    }

    // Exibe o botão de encerrar sessão
    function renderizarBotaoEncerrar() {
        DOM.closeSessionBtn?.classList.remove('hidden');
    }

    // Preenche e oculta os campos Nome, E-mail e Telefone do formulário principal
    function sincronizarFormularioPrincipal(primeiroAgendamento, emailCliente) {
        if (!primeiroAgendamento && !emailCliente) return;

        if (DOM.inputNome) DOM.inputNome.value = primeiroAgendamento?.cliente_nome || '';
        if (DOM.inputEmail) DOM.inputEmail.value = emailCliente || DOM.sentEmailLabel?.textContent || '';
        if (DOM.inputTelefone) DOM.inputTelefone.value = primeiroAgendamento?.telefone || '';

        DOM.inputNome?.closest('.form-group')?.classList.add('hidden');
        (DOM.inputEmail?.closest('.form-row') || DOM.inputTelefone?.closest('.form-row'))?.classList.add('hidden');
    }

    // Atualiza o HTML do título do Drawer
    function atualizarTituloDrawer(clienteNome) {
        if (!DOM.drawerTitle || !clienteNome) return;

        DOM.drawerTitle.innerHTML = `
            <span style="display: block; font-size: 1.45rem; font-weight: 700; color: #1e293b;">
                Meus Tratamentos
            </span>
            <span style="display: block; font-size: 1rem; font-weight: 400; color: #64748b; margin-top: 2px;">
                ${formatName(clienteNome)}
            </span>
        `;
    }

    // Gera o HTML de um card individual de agendamento
    function criarCardAgendamentoHTML(item) {
        const statusLower = item.status.toLowerCase();
        let tagClass = 'drawer-card-tag';

        if (statusLower === 'confirmado') tagClass += ' confirmed';
        else if (statusLower === 'cancelado') tagClass += ' cancelled';
        else tagClass += ' pending';

        return `
            <div class="drawer-card">
                <div class="drawer-card-info">
                    <span class="${tagClass}">${item.status}</span>
                    <h4>${item.tratamento}</h4>
                    <p><i data-lucide="calendar"></i> ${item.data_hora}</p>
                    ${item.observacoes ? `
                        <p class="drawer-card-notes">
                            <span>${item.observacoes}</span>
                        </p>
                    ` : ''}
                </div>
                <span class="drawer-card-price">${item.preco}</span>
            </div>
        `;
    }

    // Renderiza a lista completa de cards no Drawer
    function renderizarListaAgendamentos(agendamentos) {
        if (!DOM.treatmentsSection) return;

        if (!agendamentos || agendamentos.length === 0) {
            DOM.treatmentsSection.innerHTML = '<p class="empty-state">Nenhum agendamento encontrado.</p>';
            return;
        }

        DOM.treatmentsSection.innerHTML = agendamentos.map(criarCardAgendamentoHTML).join('');
        if (window.lucide) lucide.createIcons();
    }

    // Função de interface autenticada
    function carregarInterfaceAutenticada(agendamentos, emailCliente) {
        if (!DOM.authSection || !DOM.treatmentsSection) return;

        renderizarBotaoEncerrar();

        DOM.authSection.classList.add('hidden');
        DOM.treatmentsSection.classList.remove('hidden');

        if (agendamentos && agendamentos.length > 0) {
            atualizarTituloDrawer(agendamentos[0].cliente_nome);
            sincronizarFormularioPrincipal(agendamentos[0], emailCliente);
        }

        renderizarListaAgendamentos(agendamentos);
    }

    // -------------------------------------------------------------
    // Handlers e Eventos da Interface
    // -------------------------------------------------------------
    
    // Controle do Modal
    DOM.openModalBtn?.addEventListener('click', () => toggleElement(DOM.bookingModal, true));
    DOM.closeModalBtn?.addEventListener('click', () => toggleElement(DOM.bookingModal, false));
    window.addEventListener('click', (e) => { if (e.target === DOM.bookingModal) toggleElement(DOM.bookingModal, false); });

    // Controle do Drawer
    DOM.openDrawerBtn?.addEventListener('click', () => toggleElement(DOM.drawerOverlay, true));
    DOM.closeDrawerBtn?.addEventListener('click', () => toggleElement(DOM.drawerOverlay, false));
    DOM.drawerOverlay?.addEventListener('click', (e) => { if (e.target === DOM.drawerOverlay) toggleElement(DOM.drawerOverlay, false); });

    DOM.openModalFromDrawer?.addEventListener('click', () => {
        toggleElement(DOM.drawerOverlay, false);
        toggleElement(DOM.bookingModal, true);
    });

    // Passo A: Envio de E-mail
    DOM.formStepEmail?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = DOM.userEmailInput?.value.trim();
        const submitBtn = document.getElementById('btn-submit-email');

        if (!email || !submitBtn) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando...';

        try {
            const { ok, data } = await sendPostRequest(DOM.formStepEmail, { emailConta: email });

            if (ok && data.success) {
                if (DOM.sentEmailLabel) DOM.sentEmailLabel.textContent = email;
                DOM.formStepEmail.classList.add('hidden');
                DOM.formStepCode.classList.remove('hidden');
                DOM.codeDigits[0]?.focus();
            } else {
                showError(DOM.emailErrorMsg, data.message);
            }
        } catch {
            showError(DOM.emailErrorMsg, 'Erro de conexão. Tente novamente.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Receber Código de Acesso';
        }
    });

    // Passo B: Validação do Código de 5 Dígitos
    DOM.formStepCode?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = Array.from(DOM.codeDigits).map(input => input.value).join('');

        if (code.length !== 5) {
            showError(DOM.codeErrorMsg, 'Digite o código de 5 dígitos.');
            return;
        }

        const submitBtn = DOM.formStepCode.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Validando...';
        }

        try {
            const { ok, data } = await sendPostRequest(DOM.formStepCode, { codigo: code });

            if (ok && data.success) {
                const emailUsado = DOM.sentEmailLabel?.textContent || '';
                carregarInterfaceAutenticada(data.data.agendamentos, emailUsado);
            } else {
                showError(DOM.codeErrorMsg, data.message || 'Código incorreto.');
            }
        } catch {
            showError(DOM.codeErrorMsg, 'Erro de conexão. Tente novamente.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Validar e Entrar';
            }
        }
    });

    // Voltar para a tela de E-mail
    DOM.backToEmailBtn?.addEventListener('click', () => {
        DOM.formStepCode.classList.add('hidden');
        DOM.formStepEmail.classList.remove('hidden');
        DOM.codeDigits.forEach(input => input.value = '');
    });

    // Navegação automática entre os inputs de código
    DOM.codeDigits.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && index < DOM.codeDigits.length - 1) {
                DOM.codeDigits[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                DOM.codeDigits[index - 1].focus();
            }
        });
    });

    // -------------------------------------------------------------
    // Checagem Automática da Sessão Inicial
    // -------------------------------------------------------------
    (async function checarSessaoInicial() {
        try {
            const response = await fetch('/checar-sessao/');
            const data = await response.json();

            if (data.autenticado && data.agendamentos) {
                carregarInterfaceAutenticada(data.agendamentos, data.email);
            }
        } catch (err) {
            console.error('Erro ao verificar sessão:', err);
        }
    })();
});
