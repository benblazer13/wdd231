import { initNav } from './nav.js';
import { initModal, openModal, closeModal } from './modal.js';
import {
  fetchJSON, parsePokemon, typeBadgeHTML, capitalize,
  SPRITE, THUMB, TYPE_COLORS, addToTeam, getTeam,
  showToast, formatHW
} from './utils.js';

const API_LIST = 'https://pokeapi.co/api/v2/pokemon?limit=151&offset=0';
const PER_PAGE = 20;

// State
let allPokemon = [];   // full parsed list (cached after first load)
let filtered = [];   // after search/filter
let currentPage = 1;

// ─── Fetch Full Pokémon List ──────────────────────────────
async function loadAllPokemon() {
  const cached = sessionStorage.getItem('pf-pokedex');
  if (cached) {
    try { return JSON.parse(cached); } catch { /* fall through */ }
  }

  const listData = await fetchJSON(API_LIST);
  const entries = listData.results; // [{name, url}]

  // Fetch all 151 concurrently
  const pokemonData = await Promise.all(
    entries.map(e => fetchJSON(e.url).then(parsePokemon))
  );

  sessionStorage.setItem('pf-pokedex', JSON.stringify(pokemonData));
  return pokemonData;
}

// ─── Render Grid ─────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('pokemon-grid');
  const resultsLabel = document.getElementById('results-count');

  const start = (currentPage - 1) * PER_PAGE;
  const page = filtered.slice(start, start + PER_PAGE);

  if (resultsLabel) {
    resultsLabel.textContent = `${filtered.length} Pokémon`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="loading-msg">No Pokémon match your search.</p>';
    renderPagination();
    return;
  }

  grid.innerHTML = page.map((p, i) => {
    const primaryType = p.types[0];
    const barColor = TYPE_COLORS[primaryType] || '#888';
    const hpPct = Math.min(100, Math.round((p.stats.hp / 255) * 100));
    const delay = (i % PER_PAGE) * 0.03;

    return `
      <article
        class="pokemon-card"
        data-id="${p.id}"
        role="button"
        tabindex="0"
        aria-label="View details for ${capitalize(p.name)}"
        style="animation-delay:${delay}s"
      >
        <span class="card-num">#${String(p.id).padStart(3, '0')}</span>
        <img
          src="${SPRITE(p.id)}"
          alt="${capitalize(p.name)}"
          loading="lazy"
          width="96"
          height="96"
        >
        <span class="card-name">${capitalize(p.name)}</span>
        <div class="types">${p.types.map(typeBadgeHTML).join('')}</div>
        <span class="card-stat">HP ${p.stats.hp}</span>
      </article>`;
  }).join('');

  // Attach click + keyboard events
  grid.querySelectorAll('.pokemon-card').forEach(card => {
    const id = Number(card.dataset.id);
    card.addEventListener('click', () => showPokemonModal(id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPokemonModal(id); }
    });
  });

  renderPagination();
}

// ─── Pagination ───────────────────────────────────────────
function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  // Build page buttons: prev, up to 5 around current, next
  const pages = [];
  const delta = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= currentPage - delta && p <= currentPage + delta)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  container.innerHTML = `
    <button class="page-btn" id="prev-btn" aria-label="Previous page" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
    ${pages.map(p =>
    p === '…'
      ? `<span class="page-btn" style="cursor:default;opacity:.4">…</span>`
      : `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`
  ).join('')}
    <button class="page-btn" id="next-btn" aria-label="Next page" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
  `;

  container.querySelector('#prev-btn')?.addEventListener('click', () => goToPage(currentPage - 1));
  container.querySelector('#next-btn')?.addEventListener('click', () => goToPage(currentPage + 1));
  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => goToPage(Number(btn.dataset.page)));
  });
}

function goToPage(page) {
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Filtering ────────────────────────────────────────────
function applyFilters() {
  const query = document.getElementById('search-input')?.value.trim().toLowerCase() || '';
  const type = document.getElementById('type-filter')?.value || '';

  filtered = allPokemon.filter(p => {
    const matchName = !query || p.name.includes(query) || String(p.id) === query;
    const matchType = !type || p.types.includes(type);
    return matchName && matchType;
  });

  currentPage = 1;
  renderGrid();
}

// ─── Type Filter Dropdown ─────────────────────────────────
function populateTypeFilter() {
  const select = document.getElementById('type-filter');
  if (!select) return;

  const types = [...new Set(allPokemon.flatMap(p => p.types))].sort();
  types.forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = capitalize(type);
    select.appendChild(opt);
  });
}

// ─── Pokémon Modal ────────────────────────────────────────
function buildStatBar(statName, value) {
  const maxStat = 255;
  const pct = Math.min(100, Math.round((value / maxStat) * 100));
  const color = value >= 100 ? '#4caf50' : value >= 60 ? TYPE_COLORS.electric : '#e3000b';
  const display = statName.replace('special-', 'Sp.').replace('attack', 'Atk').replace('defense', 'Def');

  return `
    <div class="stat-row-full">
      <span class="stat-label">${capitalize(display)}</span>
      <div class="stat-bar-wrap-full">
        <div class="stat-bar" style="width:${pct}%; background:${color}"></div>
      </div>
      <span class="stat-val">${value}</span>
    </div>`;
}

function buildModalHTML(p) {
  const team = getTeam();
  const onTeam = team.some(t => t.id === p.id);
  const teamFull = team.length >= 6;

  const statOrder = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

  return `
    <div class="modal-poke-header">
      <div class="modal-sprite-wrap">
        <img src="${SPRITE(p.id)}" alt="${capitalize(p.name)}" width="96" height="96" loading="lazy">
      </div>
      <div class="modal-poke-title">
        <span class="pokemon-num">#${String(p.id).padStart(3, '0')}</span>
        <h2>${capitalize(p.name)}</h2>
        <div class="types">${p.types.map(typeBadgeHTML).join('')}</div>
      </div>
    </div>

    <div class="modal-meta">
      <div class="meta-item">
        <span class="meta-label">Height</span>
        <span class="meta-value">${formatHW(p.height, 'height')}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Weight</span>
        <span class="meta-value">${formatHW(p.weight, 'weight')}</span>
      </div>
      <div class="meta-item" style="grid-column:1/-1">
        <span class="meta-label">Abilities</span>
        <span class="meta-value">${p.abilities.map(capitalize).join(', ')}</span>
      </div>
    </div>

    <div class="stats-section">
      <p class="stats-label">Base Stats</p>
      <div class="stat-rows">
        ${statOrder.map(s => buildStatBar(s, p.stats[s] ?? 0)).join('')}
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-ghost modal-close">Close</button>
      <button
        class="btn ${onTeam ? 'btn-ghost' : (teamFull ? 'btn-ghost' : 'btn-secondary')}"
        id="add-to-team-btn"
        data-id="${p.id}"
        ${onTeam || teamFull ? 'disabled' : ''}
        aria-label="Add ${capitalize(p.name)} to team"
      >
        ${onTeam ? '✓ On Team' : (teamFull ? 'Team Full' : '+ Add to Team')}
      </button>
    </div>`;
}

function attachAddToTeamHandler(p) {
  const addBtn = document.getElementById('add-to-team-btn');
  if (!addBtn) return;

  addBtn.onclick = () => {
    const result = addToTeam(p);
    showToast(result.msg, result.success ? 'success' : 'error');
    if (result.success) {
      refreshModal(p);
    }
  };
}

function refreshModal(p) {
  const modal = document.getElementById('pokemon-modal');
  const body = modal?.querySelector('.modal-body');
  if (!body) return;

  body.innerHTML = buildModalHTML(p);
  attachAddToTeamHandler(p);
  requestAnimationFrame(() => {
    modal.querySelector('.modal-close')?.focus();
  });
}

function showPokemonModal(id) {
  const p = allPokemon.find(x => x.id === id);
  if (!p) return;

  openModal(buildModalHTML(p));
  attachAddToTeamHandler(p);
}

// ─── Init ─────────────────────────────────────────────────
async function init() {
  initNav();
  initModal();

  const grid = document.getElementById('pokemon-grid');
  if (grid) {
    grid.innerHTML = Array(PER_PAGE).fill(null)
      .map(() => '<div class="skeleton-card"></div>').join('');
  }

  try {
    allPokemon = await loadAllPokemon();
    filtered = [...allPokemon];

    populateTypeFilter();

    // Search and filter events
    document.getElementById('search-input')?.addEventListener('input', applyFilters);
    document.getElementById('type-filter')?.addEventListener('change', applyFilters);

    // Clear filters
    document.getElementById('clear-filters')?.addEventListener('click', () => {
      const search = document.getElementById('search-input');
      const typeEl = document.getElementById('type-filter');
      if (search) search.value = '';
      if (typeEl) typeEl.value = '';
      applyFilters();
    });

    renderGrid();
  } catch (err) {
    if (grid) {
      grid.innerHTML = `<p class="error-msg">⚠ Could not load Pokédex. Check your connection and refresh.</p>`;
    }
    console.error('Pokédex load error:', err);
  }
}

init();
