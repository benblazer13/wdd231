import { initNav } from './nav.js';
import {
  getTeam, removeFromTeam, analyzeTeam, capitalize,
  typeBadgeHTML, TYPE_COLORS, showToast, SPRITE
} from './utils.js';

// ─── Render Team Slots ────────────────────────────────────
function renderTeam() {
  const grid    = document.getElementById('team-grid');
  const section = document.getElementById('team-section');
  const form    = document.getElementById('team-form-section');
  const coverage = document.getElementById('coverage-section');
  const emptyBanner = document.getElementById('empty-banner');

  const team = getTeam();

  // Show/hide sections
  const hasTeam = team.length > 0;
  if (emptyBanner) emptyBanner.style.display = hasTeam ? 'none' : 'block';
  if (coverage)    coverage.style.display    = hasTeam ? 'block' : 'none';
  if (form)        form.style.display        = hasTeam ? 'block' : 'none';

  if (!grid) return;

  // Build 6 slots (filled + empty)
  const slots = Array.from({ length: 6 }, (_, i) => team[i] || null);

  grid.innerHTML = slots.map((p, i) => {
    if (!p) {
      return `
        <div class="team-slot" aria-label="Empty slot ${i + 1}">
          <div class="slot-empty-icon" aria-hidden="true">◯</div>
          <span class="slot-empty-label">Empty</span>
        </div>`;
    }

    const primaryType = p.types[0];
    const borderColor = TYPE_COLORS[primaryType] || 'var(--border-bright)';

    return `
      <div class="team-slot filled" style="border-color:${borderColor}33" data-id="${p.id}">
        <div class="slot-img-wrap">
          <img
            src="${SPRITE(p.id)}"
            alt="${capitalize(p.name)}"
            loading="lazy"
            width="70"
            height="70"
          >
        </div>
        <span class="slot-num">#${String(p.id).padStart(3, '0')}</span>
        <span class="slot-name">${capitalize(p.name)}</span>
        <div class="types">${p.types.map(typeBadgeHTML).join('')}</div>
        <button
          class="btn btn-danger remove-btn"
          data-id="${p.id}"
          aria-label="Remove ${capitalize(p.name)} from team"
        >Remove</button>
      </div>`;
  }).join('');

  // Remove button events
  grid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const pokemon = team.find(p => p.id === id);
      removeFromTeam(id);
      showToast(`${capitalize(pokemon?.name || 'Pokémon')} removed from team.`, 'info');
      renderAll();
    });
  });

  // Update form select
  updateFavoriteSelect(team);
}

// ─── Type Coverage ────────────────────────────────────────
function renderCoverage() {
  const team = getTeam();
  if (!team.length) return;

  const { offensiveTypes, sharedWeaknesses } = analyzeTeam(team);

  // Offensive types
  const offEl = document.getElementById('offensive-types');
  if (offEl) {
    offEl.innerHTML = offensiveTypes.length
      ? offensiveTypes.map(type => {
          const color = TYPE_COLORS[type] || '#888';
          return `<span class="cov-tag" style="background:${color}">${capitalize(type)}</span>`;
        }).join('')
      : '<span class="no-coverage">No types yet</span>';
  }

  // Shared weaknesses
  const weakEl = document.getElementById('shared-weaknesses');
  if (weakEl) {
    weakEl.innerHTML = sharedWeaknesses.length
      ? sharedWeaknesses.map(([type, count]) => {
          const color = TYPE_COLORS[type] || '#888';
          return `
            <span class="cov-tag" style="background:${color}">
              ${capitalize(type)}
              <span class="cov-count">×${count}</span>
            </span>`;
        }).join('')
      : '<span class="no-coverage" style="color:#4caf50">✓ No shared weaknesses!</span>';
  }
}

// ─── Form Select ─────────────────────────────────────────
function updateFavoriteSelect(team) {
  const sel = document.getElementById('fav-pokemon');
  if (!sel) return;

  sel.innerHTML = '<option value="">— Choose a Pokémon —</option>' +
    team.map(p =>
      `<option value="${p.name}">${capitalize(p.name)} (#${String(p.id).padStart(3,'0')})</option>`
    ).join('');
}

// ─── Clear Team ───────────────────────────────────────────
function setupActions() {
  document.getElementById('clear-team-btn')?.addEventListener('click', () => {
    if (!confirm('Remove all Pokémon from your team?')) return;
    localStorage.removeItem('pokeforge-team');
    showToast('Team cleared!', 'info');
    renderAll();
  });

  document.getElementById('browse-btn')?.addEventListener('click', () => {
    window.location.href = 'pokedex.html';
  });
}

// ─── Render All ───────────────────────────────────────────
function renderAll() {
  renderTeam();
  renderCoverage();
}

// ─── Init ─────────────────────────────────────────────────
initNav();
setupActions();
renderAll();
