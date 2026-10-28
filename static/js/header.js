// MODAL AGENDAMENTOS
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('booking-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.getElementById('close-modal-btn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('open');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    // Fechar ao clicar fora do modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('open');
        }
    });
});


// BARRA LATERAL
const drawerOverlay = document.getElementById('treatments-drawer-overlay');
const openDrawerBtn = document.getElementById('open-drawer-btn');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const openModalFromDrawer = document.getElementById('open-modal-from-drawer');

if (openDrawerBtn && drawerOverlay) {
    // Abrir o Drawer
    openDrawerBtn.addEventListener('click', () => {
        drawerOverlay.classList.add('open');
    });

    // Fechar pelo botão X
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', () => {
            drawerOverlay.classList.remove('open');
        });
    }

    // Fechar clicando na área escura (fora do drawer)
    drawerOverlay.addEventListener('click', (event) => {
        if (event.target === drawerOverlay) {
            drawerOverlay.classList.remove('open');
        }
    });

    // Abrir o modal de agendamento a partir do drawer (se clicado)
    if (openModalFromDrawer) {
        openModalFromDrawer.addEventListener('click', () => {
            drawerOverlay.classList.remove('open');
            const bookingModal = document.getElementById('booking-modal');
            if (bookingModal) {
                bookingModal.classList.add('open');
            }
        });
    }
}

// -------------------------------------------------------------
// Lógica de Autenticação de 5 Dígitos no Drawer
// -------------------------------------------------------------
const formStepEmail = document.getElementById('form-step-email');
const formStepCode = document.getElementById('form-step-code');
const userEmailInput = document.getElementById('user-email-input');
const sentEmailLabel = document.getElementById('sent-email-label');
const backToEmailBtn = document.getElementById('back-to-email-btn');

const authSection = document.getElementById('auth-section');
const treatmentsSection = document.getElementById('treatments-section');
const drawerTitle = document.getElementById('drawer-title');
const codeDigits = document.querySelectorAll('.code-digit');

// 1. Passo A: Enviar E-mail
if (formStepEmail) {
    formStepEmail.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = userEmailInput.value;
        if (email) {
            sentEmailLabel.textContent = email;
            formStepEmail.classList.add('hidden');
            formStepCode.classList.remove('hidden');
            // Foca no primeiro dígito automaticamente
            if (codeDigits[0]) codeDigits[0].focus();
        }
    });
}

// 2. Voltar para trocar e-mail
if (backToEmailBtn) {
    backToEmailBtn.addEventListener('click', () => {
        formStepCode.classList.add('hidden');
        formStepEmail.classList.remove('hidden');
    });
}

// 3. Comportamento inteligente dos 5 inputs de código (Pular pro próximo campo ao digitar)
codeDigits.forEach((digitInput, index) => {
    digitInput.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < codeDigits.length - 1) {
            codeDigits[index + 1].focus();
        }
    });

    // Permitir apagar com Backspace e voltar o foco
    digitInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            codeDigits[index - 1].focus();
        }
    });
});

// 4. Passo B: Validar o Código de 5 dígitos e Efetuar Login
if (formStepCode) {
    formStepCode.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Coleta os 5 dígitos
        let code = '';
        codeDigits.forEach(input => code += input.value);

        if (code.length === 5) {
            // Sucesso! Esconde formulário de login e exibe os tratamentos
            authSection.classList.add('hidden');
            treatmentsSection.classList.remove('hidden');
            if (drawerTitle) drawerTitle.textContent = 'Meus Tratamentos';
        } else {
            alert('Por favor, digite o código de 5 dígitos completo.');
        }
    });
}
