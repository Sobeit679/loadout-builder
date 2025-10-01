// Data sources for GitHub Pages deployment
const DATA_SOURCES = {
          drifters: './data/drifters.json?v=30', // Force refresh for Auri support effects
  weapons: './data/weapons.json',
  skills: './data/skills.json?v=8', // Updated cache-busting for Auri skill icons
  helmets: './data/armor/helmets.json',
  chests: './data/armor/chests.json',
  boots: './data/armor/boots.json',
  weaponMods: './data/mods/weapon-mods.json',
  armorMods: './data/mods/armor-mods.json'
};

const slugPattern = /[^a-z0-9]+/g;

function slugify(text = '') {
  return text.toLowerCase().replace(slugPattern, '-').replace(/^-+|-+$/g, '');
}

export async function loadDataSets(notify) {
  // Load all data sources
  const data = {};
  for (const [key, url] of Object.entries(DATA_SOURCES)) {
    try {
      console.log(`Loading ${key} from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      data[key] = await response.json();
      console.log(`Successfully loaded ${key}:`, data[key]);
      if (key === 'drifters') {
        console.log(`Drifters array length:`, data[key].drifters?.length);
        console.log(`First few drifters:`, data[key].drifters?.slice(0, 3));
      }
    } catch (error) {
      console.error(`Failed to load ${key} from ${url}:`, error);
      notify?.(`Failed to load ${key}`);
      // Provide empty fallback structure
      data[key] = { [key.slice(0, -1)]: [] };
    }
  }

  // Process and link data
  console.log('Raw drifters data:', data.drifters);
  console.log('Raw skills data:', data.skills);
  const drifters = processDrifters(data.drifters?.drifters || [], data.skills?.skills || []);
  console.log('Processed drifters:', drifters);
  console.log('First drifter mastery bonuses:', drifters[0]?.masteryBonuses);
  const weapons = processWeapons(data.weapons?.weapons || [], data.skills?.skills || []);
  const gear = {
    weapons: weapons,
    'armors/head': processArmor(data.helmets?.helmets || [], 'helm'),
    'armors/chest': processArmor(data.chests?.chests || [], 'chest'),
    'armors/boots': processArmor(data.boots?.boots || [], 'boots')
  };
  const mods = {
    weapon: data.weaponMods?.weaponMods || [],
    armor: data.armorMods?.armorMods || []
  };

  return {
    drifters,
    gear,
    mods,
    selected: {
      drifters: [],
      gear: {},
      mods: {}
    }
  };
}

// Data processing functions
function processDrifters(drifters, skills) {
  return drifters.map(drifter => ({
    gameId: drifter.id,
    name: drifter.name,
    role: drifter.role || 'Support',
    description: drifter.description || buildDrifterDescription(drifter),
    stats: drifter.stats || {},
    basicAttributes: drifter.basicAttributes || {},
    baseHp: drifter.baseHp || 1000,
    masteryBonuses: drifter.masteryBonuses || {},
    icon: drifter.icon || '',
    portrait: drifter.portrait || '',
    cardIcon: drifter.cardIcon || '',
    skill: findSkillById(drifter.skills?.core, skills),
    passive: findSkillById(drifter.skills?.passive, skills),
    support: drifter.support || {}
  }));
}

function processWeapons(weapons, skills) {
  return weapons.map(weapon => ({
    gameId: weapon.id,
    type: 'weapon',
    name: weapon.name,
    sub: `${weapon.type || 'Weapon'} · ${weapon.rarity || 'Common'}`,
    description: weapon.description || '',
    stats: weapon.stats || {},
    icon: weapon.icon || '',
    skill: findSkillById(weapon.skill, skills),
    skillIcon: weapon.skillIcon || ''
  }));
}

function processArmor(armor, slot) {
  return armor.map(piece => ({
    gameId: piece.id,
    type: slot,
    name: piece.name,
    sub: `${piece.skill || 'Armor'} · ${piece.rarity || 'Common'}`,
    description: piece.description || '',
    stats: piece.stats || {},
    icon: piece.icon || ''
  }));
}

function findSkillById(skillId, skills) {
  if (!skillId || !skills) return null;
  return skills.find(skill => skill.id === skillId) || null;
}

function buildDrifterDescription(drifter) {
  if (drifter.description) return drifter.description;
  
  const parts = [];
  if (drifter.role) parts.push(`${drifter.role} class`);
  if (drifter.basicAttributes) {
    const attrs = Object.entries(drifter.basicAttributes)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join(', ');
    parts.push(`Attributes: ${attrs}`);
  }
  
  return parts.length > 0 ? parts.join('. ') : 'A skilled drifter ready for battle.';
}

export function renderCards({ items, grid, template, isSelected, onToggle }) {
  grid.innerHTML = '';
  if (!items?.length) {
    grid.innerHTML = '<p class="summary-empty">No data available.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.slug = item.gameId;
    card.querySelector('.item-name').textContent = item.name || 'Unknown';
    card.querySelector('.item-sub').textContent = item.sub || item.role || '';
    card.querySelector('.item-desc').textContent = item.description || 'No description available.';
    card.querySelector('.item-meta').textContent = summarizeStats(item.stats);

    const thumb = card.querySelector('.item-thumb');
    if (thumb) {
      thumb.hidden = true; // Hide thumbnails since no external images
    }

    const overlay = card.querySelector('.item-overlay');
    if (overlay) {
      overlay.hidden = true; // Hide overlays since no external images
    }

    if (isSelected?.(item)) {
      card.classList.add('selected');
    }

    const handle = () => {
      onToggle?.(item);
      renderCards({ items, grid, template, isSelected, onToggle });
    };

    card.addEventListener('click', handle);
    card.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handle();
      }
    });

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function summarizeStats(stats) {
  if (!stats || !Object.keys(stats).length) return '';
  return Object.entries(stats)
    .slice(0, 4)
    .map(([key, value]) => `${formatKey(key)}: ${value}`)
    .join(' · ');
}

function formatKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function updateSummary(container, selected) {
  const { drifters = [], gear = {} } = selected;
  container.innerHTML = '';

  if (!drifters.length && !Object.keys(gear).length) {
    container.innerHTML = '<div class="summary-empty">No loadout selected.</div>';
    return;
  }

  if (drifters.length) {
    container.appendChild(renderSummarySection('Drifters', drifters.map((d) => `${d.name} — ${d.role}`)));
  }

  const gearEntries = Object.entries(gear)
    .filter(([, item]) => item)
    .map(([slot, item]) => `${formatSlot(slot)}: ${item.name}`);

  if (gearEntries.length) {
    container.appendChild(renderSummarySection('Gear', gearEntries));
  }
}

function formatSlot(slot) {
  switch (slot) {
    case 'weapons':
      return 'Weapon';
    case 'armors/head':
      return 'Head';
    case 'armors/chest':
      return 'Chest';
    case 'armors/boots':
      return 'Boots';
    default:
      return slot;
  }
}

function renderSummarySection(title, items) {
  const wrapper = document.createElement('section');
  wrapper.className = 'summary-section';

  const heading = document.createElement('h3');
  heading.textContent = title;
  wrapper.appendChild(heading);

  const list = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });

  wrapper.appendChild(list);
  return wrapper;
}

export function bindCopy(button, summaryEl, notify) {
  button.addEventListener('click', async () => {
    const text = summaryEl.textContent.trim();
    if (!text) {
      notify?.('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      notify?.('Summary copied!');
    } catch (error) {
      console.error('Clipboard copy failed', error);
      notify?.('Copy failed');
    }
  });
}

