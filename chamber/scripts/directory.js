const DATA_URL = 'data/members.json';
const IMAGES_PATH = 'images/';
const PLACEHOLDER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80" fill="none" aria-hidden="true">
    <rect width="80" height="80" rx="8" fill="#e8f0fe"/>
    <path d="M20 55 l12-14 8 10 10-12 14 16" stroke="#1a2744" stroke-width="2.5" stroke-linejoin="round" fill="none"/>
    <circle cx="28" cy="30" r="6" fill="#1a2744" opacity="0.2"/>
    <rect x="10" y="10" width="60" height="60" rx="8" stroke="#1a2744" stroke-width="2" opacity="0.15" fill="none"/>
  </svg>`;

const BADGE_MAP = {
  1: { label: 'Member', cls: 'badge-member' },
  2: { label: 'Silver', cls: 'badge-silver' },
  3: { label: 'Gold', cls: 'badge-gold' },
};


let currentView = 'grid';
let membersData = [];


const output = document.getElementById('directory-output');
const statusEl = document.getElementById('directory-status');
const gridBtn = document.getElementById('grid-btn');
const listBtn = document.getElementById('list-btn');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const copyrightYear = document.getElementById('copyright-year');
const lastModified = document.getElementById('last-modified');


if (copyrightYear) {
  copyrightYear.textContent = new Date().getFullYear();
}

if (lastModified) {
  lastModified.textContent = document.lastModified;
}


hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

navMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});


if (gridBtn) {
  gridBtn.addEventListener('click', () => setView('grid'));
}
if (listBtn) {
  listBtn.addEventListener('click', () => setView('list'));
}

function setView(view) {
  if (view === currentView) return;
  currentView = view;

  gridBtn.classList.toggle('active', view === 'grid');
  listBtn.classList.toggle('active', view === 'list');
  gridBtn.setAttribute('aria-pressed', String(view === 'grid'));
  listBtn.setAttribute('aria-pressed', String(view === 'list'));

  renderMembers(membersData);
}


function getBadge(level) {
  const badge = BADGE_MAP[level] ?? BADGE_MAP[1];
  return `<span class="badge ${badge.cls}">${badge.label}</span>`;
}


function renderMembers(members) {
  output.innerHTML = '';

  if (!members || members.length === 0) {
    statusEl.textContent = 'No members found.';
    return;
  }

  statusEl.textContent = '';

  if (currentView === 'grid') {
    output.className = 'directory-grid';
    members.forEach(member => {
      output.appendChild(buildCard(member));
    });
  } else {
    output.className = 'directory-list';
    members.forEach(member => {
      output.appendChild(buildListItem(member));
    });
  }
}

function buildCard(member) {
  const article = document.createElement('article');
  article.className = 'member-card';

  const imgSrc = member.image
    ? `${IMAGES_PATH}${member.image}`
    : null;

  article.innerHTML = `
    <div class="card-img-wrap">
      ${imgSrc
      ? `<img
              src="${imgSrc}"
              alt="${member.name} business photo"
              loading="lazy"
              onerror="this.parentElement.innerHTML='${PLACEHOLDER_SVG.replace(/"/g, "'")}';"
            />`
      : PLACEHOLDER_SVG}
    </div>
    <div class="card-body">
      <h2 class="card-name">${member.name}</h2>
      ${member.tagline ? `<p class="card-tagline">${member.tagline}</p>` : ''}
      <ul class="card-info">
        <li>
          <span class="label">Address</span>
          <span>${member.address}</span>
        </li>
        <li>
          <span class="label">Phone</span>
          <a href="tel:${member.phone.replace(/\D/g, '')}">${member.phone}</a>
        </li>
        <li>
          <span class="label">URL</span>
          <a href="${member.website}" target="_blank" rel="noopener noreferrer">
            ${member.website.replace(/^https?:\/\//, '')}
          </a>
        </li>
      </ul>
    </div>
    <div class="card-footer">
      ${getBadge(member.membershipLevel)}
    </div>
  `;

  return article;
}

function buildListItem(member) {
  const article = document.createElement('article');
  article.className = 'member-list-item';

  const imgSrc = member.image
    ? `${IMAGES_PATH}${member.image}`
    : null;

  article.innerHTML = `
    <div class="list-img-wrap">
      ${imgSrc
      ? `<img
              src="${imgSrc}"
              alt="${member.name}"
              loading="lazy"
              onerror="this.parentElement.innerHTML='${PLACEHOLDER_SVG.replace(/"/g, "'")}';"
            />`
      : PLACEHOLDER_SVG}
    </div>
    <div class="list-info">
      <p class="list-name">${member.name}</p>
      <p class="list-address">${member.address}</p>
    </div>
    <div class="list-phone">
      <a href="tel:${member.phone.replace(/\D/g, '')}">${member.phone}</a>
    </div>
    <div class="list-badge">
      ${getBadge(member.membershipLevel)}
    </div>
  `;

  return article;
}


async function loadMembers() {
  statusEl.textContent = 'Loading members…';

  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    membersData = data.members ?? [];
    renderMembers(membersData);

  } catch (error) {
    console.error('Failed to load members:', error);
    statusEl.textContent = 'Unable to load member data. Please try again later.';
  }
}


loadMembers();