// Responsive Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.textContent = isOpen ? '✕' : '☰';
    hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu when a nav link is clicked on mobile
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.textContent = '☰';
        hamburger.setAttribute('aria-expanded', 'false');
    });
});