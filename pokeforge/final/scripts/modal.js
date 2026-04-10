const MODAL_ID = 'pokemon-modal';

export function initModal() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  // Close when clicking the backdrop (the dialog element itself)
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Close button inside modal
  modal.addEventListener('click', e => {
    if (e.target.closest('.modal-close')) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.open) closeModal();
  });
}

export function openModal(contentHTML) {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;

  const body = modal.querySelector('.modal-body');
  if (body) body.innerHTML = contentHTML;

  modal.showModal();
  document.body.style.overflow = 'hidden';

  // Focus the close button for accessibility
  requestAnimationFrame(() => {
    modal.querySelector('.modal-close')?.focus();
  });
}

export function closeModal() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;
  modal.close();
  document.body.style.overflow = '';
}
