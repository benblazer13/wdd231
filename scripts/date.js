// Dynamic Copyright Year
const yearSpan = document.getElementById('currentyear');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Last Modified Date
const lastModifiedEl = document.getElementById('lastModified');
if (lastModifiedEl) {
  lastModifiedEl.textContent = `Last Modified: ${document.lastModified}`;
}