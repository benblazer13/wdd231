import { initNav } from './nav.js';
import { fetchJSON, parsePokemon, typeBadgeHTML, capitalize,
         SPRITE, TYPE_COLORS, showToast } from './utils.js';

// ─── Daily Seed ───────────────────────────────────────────
// Picks 6 unique Pokémon IDs deterministically for today's date
function getDailyTeamIds() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const ids = [];
  let s = seed;
  while (ids.length < 6) {
    // LCG pseudo-random
    s = Math.imul(s, 1664525) + 1013904223 | 0;
    const id = (Math.abs(s) % 151) + 1;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

// ─── Featured Team ────────────────────────────────────────
async function loadFeaturedTeam() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const ids = getDailyTeamIds();

  try {
    const pokemonList = await Promise.all(
      ids.map(id =>
        fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`)
          .then(parsePokemon)
      )
    );

    grid.innerHTML = pokemonList.map(p => {
      const primaryType = p.types[0];
      const barColor = TYPE_COLORS[primaryType] || '#e3000b';
      const hpPct = Math.min(100, Math.round((p.stats.hp / 255) * 100));

      return `
        <article class="featured-card">
          <img
            src="${SPRITE(p.id)}"
            alt="${capitalize(p.name)}"
            loading="lazy"
            width="120"
            height="120"
          >
          <div class="featured-card-info">
            <span class="pokemon-num">#${String(p.id).padStart(3, '0')}</span>
            <h3>${capitalize(p.name)}</h3>
            <div class="types">${p.types.map(typeBadgeHTML).join('')}</div>
            <div class="stat-row">
              <span class="stat-label">HP</span>
              <div class="stat-bar-wrap">
                <div class="stat-bar" style="width:${hpPct}%; background:${barColor}"></div>
              </div>
              <span class="stat-val">${p.stats.hp}</span>
            </div>
          </div>
        </article>`;
    }).join('');

  } catch (err) {
    grid.innerHTML = `
      <p class="error-msg" style="grid-column:1/-1">
        ⚠ Could not load featured team — please check your connection and refresh.
      </p>`;
    console.error('Featured team load error:', err);
  }
}

// ─── Type Reference List ──────────────────────────────────
function renderTypeList() {
  const container = document.getElementById('type-badges-list');
  if (!container) return;

  container.innerHTML = Object.entries(TYPE_COLORS)
    .map(([type, color]) =>
      `<span class="type-badge-lg" style="background:${color}">${capitalize(type)}</span>`
    )
    .join('');
}

// ─── Init ─────────────────────────────────────────────────
initNav();
loadFeaturedTeam();
renderTypeList();
