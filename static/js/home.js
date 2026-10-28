// Lógica do Filtro de Categoria dos Tratamentos
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const treatmentCards = document.querySelectorAll('.treatment-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a classe 'active' de todos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona ao botão atual
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            treatmentCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// 3. Lógica do Comparador Antes & Depois
const slider = document.getElementById('comparison-slider');
const beforeWrapper = document.getElementById('before-wrapper');
const handle = document.getElementById('slider-handle');

if (slider && beforeWrapper && handle) {
    let isDragging = false;

    const moveSlider = (x) => {
        const rect = slider.getBoundingClientRect();
        let position = x - rect.left;
        if (position < 0) position = 0;
        if (position > rect.width) position = rect.width;

        const percentage = (position / rect.width) * 100;
        beforeWrapper.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
    };

    slider.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    slider.addEventListener('mousemove', (e) => {
        if (isDragging) moveSlider(e.clientX);
    });

    // Suporte para Touch (Celulares)
    slider.addEventListener('touchstart', () => isDragging = true);
    window.addEventListener('touchend', () => isDragging = false);
    slider.addEventListener('touchmove', (e) => {
        if (isDragging) moveSlider(e.touches[0].clientX);
    });
}

// 4. Lógica da Calculadora Dinâmica de Procedimentos
const checkboxes = document.querySelectorAll('.calc-checkbox');
const subtotalEl = document.getElementById('calc-subtotal');
const discountEl = document.getElementById('calc-discount');
const totalEl = document.getElementById('calc-total');

function updateCalculator() {
    let subtotal = 0;
    let count = 0;

    checkboxes.forEach(cb => {
        if (cb.checked) {
            subtotal += parseFloat(cb.getAttribute('data-price'));
            count++;
        }
    });

    // Aplica 10% de desconto se selecionar 2 ou mais itens
    const discountRate = count >= 2 ? 0.10 : 0;
    const discount = subtotal * discountRate;
    const total = subtotal - discount;

    const formatBRL = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (subtotalEl) subtotalEl.textContent = formatBRL(subtotal);
    if (discountEl) discountEl.textContent = `- ${formatBRL(discount)}`;
    if (totalEl) totalEl.textContent = formatBRL(total);
}

checkboxes.forEach(cb => cb.addEventListener('change', updateCalculator));

// Abrir modal a partir do Hero ou da Calculadora
const modal = document.getElementById('booking-modal');
['open-modal-hero', 'open-modal-calc'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn && modal) {
        btn.addEventListener('click', () => modal.classList.add('open'));
    }
});
