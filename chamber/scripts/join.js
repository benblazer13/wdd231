const timestampInput = document.getElementById('timestamp');
if (timestampInput) {
    timestampInput.value = new Date().toISOString();
}

const openModalButtons = document.querySelectorAll('.detail-link');
const modals = document.querySelectorAll('.modal');

function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

function openModal(targetId) {
    const modal = document.getElementById(targetId);
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const closeBtn = modal.querySelector('.btn-close');
    if (closeBtn) closeBtn.focus();
    function onEscape(event) {
        if (event.key === 'Escape') closeModal(modal);
    }
    modal.addEventListener('keydown', onEscape, { once: true });
}

openModalButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        const modalId = event.currentTarget.dataset.modal;
        if (modalId) openModal(modalId);
    });
});

modals.forEach((modal) => {
    const closeButton = modal.querySelector('.btn-close');
    closeButton?.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal);
    });
});

const joinForm = document.getElementById('joinForm');
if (joinForm) {
    joinForm.addEventListener('submit', (event) => {
        const orgTitle = document.getElementById('orgTitle');

        if (orgTitle) {
            if (orgTitle.value && !/^[A-Za-z\s-]{7,}$/.test(orgTitle.value)) {
                event.preventDefault();
                orgTitle.setCustomValidity('Organizational title must be at least 7 letters and may include hyphens/spaces only.');
                orgTitle.reportValidity();
                return;
            }
            orgTitle.setCustomValidity('');
        }

        if (!joinForm.checkValidity()) {
            event.preventDefault();
            joinForm.reportValidity();
            return;
        }

        // Form is valid. Let browser follow the action URL.
    });
}
