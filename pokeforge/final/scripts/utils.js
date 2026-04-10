// ─── Type Colors ────────────────────────────────────────
export const TYPE_COLORS = {
  normal:   '#9099A1', fire:     '#F77C23', water:    '#5D90D5',
  electric: '#F5C619', grass:    '#5DBD52', ice:      '#70CBD4',
  fighting: '#CE3F6A', poison:   '#AB5AC7', ground:   '#D97845',
  flying:   '#8FA9E5', psychic:  '#F55D7A', bug:      '#91BC23',
  rock:     '#BFAA6F', ghost:    '#5B6DAE', dragon:   '#0773C5',
  dark:     '#5B5369', steel:    '#5FA5A5', fairy:    '#E97EC7'
};

// Defensive weaknesses per type (what hits it for 2x)
export const TYPE_WEAKNESSES = {
  normal:   ['fighting'],
  fire:     ['water', 'ground', 'rock'],
  water:    ['electric', 'grass'],
  electric: ['ground'],
  grass:    ['fire', 'ice', 'poison', 'flying', 'bug'],
  ice:      ['fire', 'fighting', 'rock', 'steel'],
  fighting: ['flying', 'psychic', 'fairy'],
  poison:   ['ground', 'psychic'],
  ground:   ['water', 'grass', 'ice'],
  flying:   ['electric', 'ice', 'rock'],
  psychic:  ['bug', 'ghost', 'dark'],
  bug:      ['fire', 'flying', 'rock'],
  rock:     ['water', 'grass', 'fighting', 'ground', 'steel'],
  ghost:    ['ghost', 'dark'],
  dragon:   ['ice', 'dragon', 'fairy'],
  dark:     ['fighting', 'bug', 'fairy'],
  steel:    ['fire', 'fighting', 'ground'],
  fairy:    ['poison', 'steel']
};

// Immunities per type
export const TYPE_IMMUNITIES = {
  normal: ['ghost'], electric: ['ground'],
  ghost: ['normal', 'fighting'], ground: ['electric'],
  flying: ['ground'], dark: ['psychic'], steel: ['poison'],
  fairy: ['dragon'], psychic: ['dark'],
  fire: [], water: [], grass: [], ice: [], fighting: [],
  poison: [], rock: [], bug: [], dragon: []
};

// ─── API Helpers ─────────────────────────────────────────
export const API_BASE = 'https://pokeapi.co/api/v2';
export const SPRITE = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const THUMB = id =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

export function parsePokemon(data) {
  const stats = {};
  data.stats.forEach(s => { stats[s.stat.name] = s.base_stat; });
  return {
    id: data.id,
    name: data.name,
    types: data.types.map(t => t.type.name),
    sprite: SPRITE(data.id),
    thumb: THUMB(data.id),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map(a => a.ability.name),
    stats
  };
}

// ─── Team Storage ────────────────────────────────────────
const STORAGE_KEY = 'pokeforge-team';

export function getTeam() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveTeam(team) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
}

export function addToTeam(pokemon) {
  const team = getTeam();
  if (team.length >= 6) {
    return { success: false, msg: 'Your team is full! Remove a Pokémon first.' };
  }
  if (team.some(p => p.id === pokemon.id)) {
    return { success: false, msg: `${capitalize(pokemon.name)} is already on your team!` };
  }
  team.push(pokemon);
  saveTeam(team);
  return { success: true, msg: `${capitalize(pokemon.name)} added to your team! (${team.length}/6)` };
}

export function removeFromTeam(id) {
  const team = getTeam().filter(p => p.id !== id);
  saveTeam(team);
}

// ─── Type Coverage Analysis ──────────────────────────────
export function analyzeTeam(team) {
  // Offensive coverage: types the team can attack super-effectively
  const offensiveTypes = new Set(team.flatMap(p => p.types));

  // Defensive weaknesses: types that hit 2+ team members
  const weaknessCounts = {};
  team.forEach(p => {
    const weaknesses = computeWeaknesses(p.types);
    weaknesses.forEach(type => {
      weaknessCounts[type] = (weaknessCounts[type] || 0) + 1;
    });
  });

  const sharedWeaknesses = Object.entries(weaknessCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  return { offensiveTypes: [...offensiveTypes], sharedWeaknesses };
}

export function computeWeaknesses(types) {
  // Calculate combined weaknesses for dual-type Pokémon
  const multipliers = {};
  const allTypes = Object.keys(TYPE_COLORS);

  allTypes.forEach(attacker => {
    let mult = 1;
    types.forEach(defender => {
      if (TYPE_IMMUNITIES[defender]?.includes(attacker)) { mult *= 0; }
      else if (TYPE_WEAKNESSES[defender]?.includes(attacker)) { mult *= 2; }
      // Resistances aren't tracked here for simplicity
    });
    if (mult >= 2) multipliers[attacker] = mult;
  });

  return Object.keys(multipliers);
}

// ─── DOM Helpers ─────────────────────────────────────────
export function capitalize(str) {
  if (!str) return '';
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function typeBadgeHTML(type) {
  const color = TYPE_COLORS[type] || '#888';
  return `<span class="type-badge" style="background:${color}">${capitalize(type)}</span>`;
}

export function showToast(msg, kind = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast-${kind}`;
  void toast.offsetWidth; // reflow
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

export function formatHW(val, unit) {
  if (unit === 'height') return `${(val / 10).toFixed(1)} m`;
  return `${(val / 10).toFixed(1)} kg`;
}
