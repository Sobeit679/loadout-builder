

const SLOT_MAPPINGS = {
  weapon: { key: 'weapons', title: 'Select Weapon', type: 'weapon' },
  helm: { key: 'armors/head', title: 'Select Helm', type: 'armor' },
  chest: { key: 'armors/chest', title: 'Select Chest', type: 'armor' },
  boots: { key: 'armors/boots', title: 'Select Boots', type: 'armor' },
  weaponMod: { key: 'weaponMod', title: 'Select Weapon Mod', type: 'weaponMod' },
  helmMod: { key: 'helmMod', title: 'Select Helm Mod', type: 'armorMod' },
  chestMod: { key: 'chestMod', title: 'Select Chest Mod', type: 'armorMod' },
  bootsMod: { key: 'bootsMod', title: 'Select Boots Mod', type: 'armorMod' }
};

// DOM References - will be initialized in init()
let drifterTrigger, selectionOverlay, selectionGrid, selectionTitle, closeSelectionBtn, overlayContent, loadoutSlots;
// These will be initialized in init()
let drifterGrid, gearGrid, gearCategorySelect, avatarTitle, avatarDescription;
// These will be initialized in init()
let masterySection, supportEffects, supportList;
// Search elements
let searchContainer, searchInput, clearSearchBtn;
// import { loadDataSets, renderCards, updateSummary, bindCopy } from './scripts/utils.js';

// Imported functions from utils.js
async function loadDataSets(notify) {
  try {
    const [driftersData, weaponsData, skillsData, helmetsData, chestsData, bootsData, weaponModsData, armorModsData] = await Promise.all([
      fetch(`./data/drifters.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load drifters: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/weapons.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load weapons: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/skills.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load skills: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/armor/helmets.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load helmets: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/armor/chests.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load chests: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/armor/boots.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load boots: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/mods/weapon-mods.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load weapon mods: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/mods/armor-mods.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load armor mods: ${r.status}`);
        return r.json();
      })
    ]);

    // Process drifters to add gameId field
    const processedDrifters = (driftersData.drifters || []).map(drifter => ({
      ...drifter,
      gameId: drifter.id // Add gameId field for click handler
    }));
    

    const weapons = weaponsData.weapons || [];
    const bloodthirstWeapon = weapons.find(w => w.id === 'bloodthirst');
    
    return {
      drifters: processedDrifters,
      skills: skillsData.skills || [],
      gear: {
        weapons: weapons,
        'armors/head': helmetsData.helmets || [],
        'armors/chest': chestsData.chests || [],
        'armors/boots': bootsData.boots || []
      },
      mods: {
        weapon: weaponModsData.weaponMods || [],
        armor: armorModsData.armorMods || []
      },
      selected: {
        drifters: [],
        gear: {},
        mods: {}
      }
    };
  } catch (error) {
    console.error('Error loading data on GitHub Pages:', error);
    alert('Failed to load data: ' + error.message);
    return {
      drifters: [],
      gear: { weapons: [], 'armors/head': [], 'armors/chest': [], 'armors/boots': [] },
      mods: { weapon: [], armor: [] },
      selected: { drifters: [], gear: {}, mods: {} }
    };
  }
}

function renderCards(items, container, isSelected, onToggle) {
  container.innerHTML = '';
  
  items.forEach(item => {
    let card;
    
    // Check if this is a weapon mod
    if (item.type === 'weapon') {
      card = createModCard(item, isSelected, onToggle);
    } else if (item.type === 'armor') {
      card = createModCard(item, isSelected, onToggle);
    } else if (item.coreSkill || item.passiveSkill) {
      const skill = STATE.skills.find(s => s.id === (item.coreSkill || item.passiveSkill));
      card = createWeaponCard(item, isSelected, onToggle);
      
      // Add tooltip functionality for skill details
      if (skill) {
        addSkillTooltip(card, skill);
      }
    } else {
      card = createItemCard(item, isSelected, onToggle);
    }
    
    container.appendChild(card);
  });
}

function updateSummary() {
  // Placeholder for updateSummary function
}

function bindCopy() {
  // Placeholder for bindCopy function
}

const STATE = {
  drifters: [],
  skills: [],
  gear: {
    weapons: [],
    'armors/head': [],
    'armors/chest': [],
    'armors/boots': []
  },
  mods: {
    weapon: [],
    armor: []
  },
  selected: {
    drifters: [],
    gear: {},
    mods: {}
  },
  mastery: {
    level: 1,
    maxLevel: 50,
    currentDrifter: null
  }
};

// Global tooltip element

// Card creation helper functions
function createModCard(item, isSelected, onToggle) {
  const card = document.createElement('div');
  card.className = 'selector-card mod-card';
  card.dataset.itemId = item.id;
  
  if (isSelected(item)) {
    card.classList.add('selected');
  }
  
  // Create image
  const itemImg = document.createElement('img');
  itemImg.src = item.icon ? `${item.icon}?v=${Date.now()}` : '';
  itemImg.alt = item.name;
  itemImg.className = 'mod-card-image';
  itemImg.onerror = () => { itemImg.style.display = 'none'; };
  
  // Create info container
  const itemInfo = document.createElement('div');
  itemInfo.className = 'mod-card-info';
  
  const itemName = document.createElement('div');
  itemName.className = 'mod-card-name';
  itemName.textContent = item.name;
  
  const itemDesc = document.createElement('div');
  itemDesc.className = 'mod-card-description';
  
  // Build description with stats
  let descText = item.description || '';
  if (item.stats && Object.keys(item.stats).length > 0) {
    const statsText = Object.entries(item.stats)
      .map(([key, value]) => {
        const displayKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace(/_/g, ' ');
        return `${displayKey}: ${value}`;
      })
      .join(', ');
    
    if (descText) {
      descText += ` | ${statsText}`;
    } else {
      descText = statsText;
    }
  }
  
  itemDesc.textContent = descText;
  
  itemInfo.appendChild(itemName);
  itemInfo.appendChild(itemDesc);
  
  card.appendChild(itemImg);
  card.appendChild(itemInfo);
  card.addEventListener('click', () => onToggle(item));
  
  return card;
}

function createWeaponCard(item, isSelected, onToggle) {
  const card = document.createElement('div');
  card.className = 'selector-card weapon-card';
  card.dataset.itemId = item.id;
  
  if (isSelected(item)) {
    card.classList.add('selected');
  }
  
  // Create image
  const itemImg = document.createElement('img');
  itemImg.src = item.icon ? `${item.icon}?v=${Date.now()}` : '';
  itemImg.alt = item.name;
  itemImg.className = 'weapon-card-image';
  itemImg.onerror = () => { itemImg.style.display = 'none'; };
  
  // Create info container
  const itemInfo = document.createElement('div');
  itemInfo.className = 'weapon-card-info';
  
  const itemName = document.createElement('div');
  itemName.className = 'weapon-card-name';
  itemName.textContent = item.name;
  
  const itemType = document.createElement('div');
  itemType.className = 'weapon-card-type';
  if (item.type) {
    const weaponTypeDisplay = item.type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    itemType.textContent = weaponTypeDisplay;
  } else if (item.armorType) {
    itemType.textContent = item.armorType;
  }
  
  itemInfo.appendChild(itemName);
  itemInfo.appendChild(itemType);
  
  card.appendChild(itemImg);
  card.appendChild(itemInfo);
  card.addEventListener('click', () => onToggle(item));
  
  return card;
}

function createItemCard(item, isSelected, onToggle) {
  const card = document.createElement('div');
  card.className = 'selector-card item-card';
  card.dataset.itemId = item.id;
  
  if (isSelected(item)) {
    card.classList.add('selected');
  }
  
  const img = document.createElement('img');
  img.src = item.icon || '';
  img.alt = item.name;
  img.className = 'item-card-image';
  img.onerror = () => { img.style.display = 'none'; };
  
  const name = document.createElement('div');
  name.className = 'item-card-name';
  name.textContent = item.name;
  
  const sub = document.createElement('div');
  sub.className = 'item-card-sub';
  sub.textContent = item.sub || '';
  
  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(sub);
  card.addEventListener('click', () => onToggle(item));
  
  return card;
}

function createDrifterCard(drifter, index) {
  const card = document.createElement('div');
  card.className = 'drifter-select-card';
  card.dataset.gameId = drifter.gameId;
  
  // Create card content
  const img = document.createElement('img');
  img.src = drifter.cardIcon || drifter.icon;
  img.alt = drifter.name;
  img.className = 'drifter-card-image';
  
  const name = document.createElement('div');
  name.textContent = drifter.name;
  name.style.fontWeight = 'bold';
  name.style.textAlign = 'center';
  name.style.marginTop = '0.5rem';
  name.style.color = 'var(--text)';
  name.style.fontSize = '1rem';
  
  const role = document.createElement('div');
  role.textContent = drifter.description;
  role.style.fontSize = '0.9rem';
  role.style.color = 'var(--text-muted)';
  role.style.textAlign = 'center';
  role.style.marginTop = '0.25rem';
  
  card.appendChild(name);
  card.appendChild(img);
  card.appendChild(role);
  
  // Add support effects if drifter has support data
  if (drifter.support) {
    const supportEffect = document.createElement('div');
    supportEffect.className = 'support-effect';
    
    let effectText = '';
    
    // Handle effects array format
    if (drifter.support.effects && Array.isArray(drifter.support.effects)) {
      effectText = drifter.support.effects.map(effect => {
        return `${effect.name}: ${effect.value}`;
      }).join(', ');
    }
    // Handle other support properties (like starfallTokenBonus)
    else {
      const supportKeys = Object.keys(drifter.support);
      effectText = supportKeys.map(key => {
        const value = drifter.support[key];
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `${formattedKey}: ${value}`;
      }).join(', ');
    }
    
    if (effectText) {
      supportEffect.textContent = effectText;
      card.appendChild(supportEffect);
      card.classList.add('has-support-effects');
    }
  }
  
  return card;
}

function createSkillOption(skill, slotKey) {
  const skillOption = document.createElement('div');
  skillOption.className = 'skill-option';
  skillOption.style.backgroundImage = `url(${skill.icon}?v=${Date.now()})`;
  skillOption.style.border = `2px solid ${STATE.selected.gear[slotKey === 'A' ? 'basic-attack' : 'weapon-skill']?.id === skill.id ? 'var(--accent)' : 'transparent'}`;
  
  skillOption.addEventListener('click', () => {
    hideSkillCascade();
    onSelect(skill);
  });
  
  return skillOption;
}
let globalTooltip = null;


function addSkillTooltip(card, skill) {
  // Create skill tags exactly like ability tooltips
  let skillTags = '';
  if (skill.tags && skill.tags.length > 0) {
    const allTags = skill.tags.map(tag => {
      const tagClass = getTagClass(tag);
      let displayTag = tag;
      if (tag === 'cooldown_reduction') displayTag = 'cooldown';
      else if (tag === 'control_immunity') displayTag = 'control immunity';
      else if (tag === 'damage_immunity') displayTag = 'immunity';
      else if (tag === 'hard_control') displayTag = 'hard control';
      return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
    }).join(' ');
    skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
  }
  
  const formattedDescription = skill.description.replace(/\n/g, '<br><br>');
  
  const tooltipContent = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
      <img src="${skill.icon}?v=${Date.now()}" alt="${skill.name}" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border);">
      <div>
        <div style="font-weight: bold; color: var(--text); margin-bottom: 4px;">${skill.name}</div>
      </div>
    </div>
    ${skillTags}
    <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">${formattedDescription}</div>
  `;
  
  card.title = ''; // Clear default title
  card.setAttribute('data-tooltip', tooltipContent);
  
  // Add tooltip event listeners
  card.addEventListener('mouseenter', (e) => {
    const tooltip = createGlobalTooltip();
    tooltip.innerHTML = card.getAttribute('data-tooltip');
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
    
    // Position tooltip
    const cardRect = card.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top = cardRect.top - tooltipRect.height - 10;
    let left = cardRect.left + (cardRect.width / 2) - (tooltipRect.width / 2);
    
    // Keep within viewport
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) {
      top = cardRect.bottom + 10;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  });
  
  card.addEventListener('mouseleave', (e) => {
    const tooltip = createGlobalTooltip();
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
  });
}
const CARD_TEMPLATE = document.getElementById('card-template');
const summaryEl = document.getElementById('summary');
const abilitySlots = document.querySelectorAll('.ability-slot');
let activeSelection = null;

// Mastery system elements
const strengthValue = document.getElementById('strengthValue');
const agilityValue = document.getElementById('agilityValue');
const intelligenceValue = document.getElementById('intelligenceValue');
const strengthBonus = document.getElementById('strengthBonus');
const agilityBonus = document.getElementById('agilityBonus');
const intelligenceBonus = document.getElementById('intelligenceBonus');
const masteryLevel = document.getElementById('masteryLevel');
const masteryButton = document.getElementById('masteryButton');
const masteryResetButton = document.getElementById('masteryResetButton');

// Additional stat elements
const maxHpBonus = document.getElementById('maxHpBonus');
const attackSpeedBonus = document.getElementById('attackSpeedBonus');
const criticalRate = document.getElementById('criticalRate');
const castingSpeedBonus = document.getElementById('castingSpeedBonus');
const skillCooldownRateBonus = document.getElementById('skillCooldownRateBonus');
const damageBonusPvE = document.getElementById('damageBonusPvE');
const physicalDamageBonus = document.getElementById('physicalDamageBonus');
const magicDamageBonus = document.getElementById('magicDamageBonus');
const healingBonus = document.getElementById('healingBonus');
const armor = document.getElementById('armor');
const magicResistance = document.getElementById('magicResistance');
const controlResistance = document.getElementById('controlResistance');
const block = document.getElementById('block');
const tenacityPenetration = document.getElementById('tenacityPenetration');
const movementSpeed = document.getElementById('movementSpeed');

function resolvePortraitPath(drifter) {
  return ''; // No external images
}

function renderDrifters() {
  // Drifters are selected through a modal, not displayed in a grid
  // This function just ensures the UI is updated with any pre-selected drifter
  updateAvatar();
  updateSupportEffects(STATE.selected.drifters[0]);
}

function showOverlay(title, key) {
  if (!selectionOverlay) {
    console.error('selectionOverlay not found!');
    return;
  }
  selectionOverlay.style.display = 'grid';
  selectionOverlay.hidden = false;
  
  // Add data-selection-type attribute for mobile CSS targeting
  const selectionType = key === 'drifters' ? 'drifter' : 'equipment';
  selectionOverlay.setAttribute('data-selection-type', selectionType);
  
  // Also add to dialog and header elements
  const dialog = selectionOverlay.querySelector('.selection-dialog');
  const header = selectionOverlay.querySelector('.selection-header');
  const titleEl = selectionOverlay.querySelector('.selection-title');
  const closeBtn = selectionOverlay.querySelector('.ghost-btn');
  
  if (dialog) dialog.setAttribute('data-selection-type', selectionType);
  if (header) header.setAttribute('data-selection-type', selectionType);
  if (titleEl) titleEl.setAttribute('data-selection-type', selectionType);
  if (closeBtn) closeBtn.setAttribute('data-selection-type', selectionType);
  
  if (selectionTitle) {
    selectionTitle.textContent = title;
  }
  
  // Show/hide search container based on selection type
  if (searchContainer) {
    if (key === 'weapon' || key === 'chest' || key === 'boots' || key === 'helm' || key === 'weaponMod' || key === 'helmMod' || key === 'chestMod' || key === 'bootsMod') {
      showElement(searchContainer);
    } else {
      hideElement(searchContainer);
    }
  }
  
  if (key === 'drifters') {
    renderDrifterSelection();
  } else if (key === 'basic-attacks' || key === 'weapon-skills') {
    // These are handled by the calling functions directly
    // Just show the overlay, content is already rendered
  } else {
    renderGear(key);
    
    // For weapon selection, ensure all cards are visible by default
    if (key === 'weapon') {
      setTimeout(() => {
        const weaponCards = selectionGrid.querySelectorAll('.selector-card');
        weaponCards.forEach((card) => {
          card.style.display = 'flex'; // Use flex since that's how they're created
        });
      }, 100);
    }
  }
}

function hideOverlay() {
  if (selectionOverlay) {
    selectionOverlay.style.display = 'none';
    selectionOverlay.hidden = true;
  }
  // Clear search when hiding overlay
  if (searchInput) {
    searchInput.value = '';
  }
}

// Search functionality
function handleSearch() {
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // Get all item cards in the selection grid
  const itemCards = selectionGrid.querySelectorAll('.selector-card');
  
  // If search term is empty, show all cards and return early
  if (searchTerm === '') {
    itemCards.forEach(card => {
      card.style.display = 'flex';
    });
    return;
  }
  
    itemCards.forEach(card => {
      // Try different possible class names for item name
      const itemName = card.querySelector('.card-name, .mod-card-name, .weapon-card-name, .item-card-name')?.textContent?.toLowerCase() || '';
      const itemSub = card.querySelector('.card-sub, .item-card-sub')?.textContent?.toLowerCase() || '';
      const itemDesc = card.querySelector('.card-desc, .mod-card-description, .item-card-desc')?.textContent?.toLowerCase() || '';
    
    // Get item data to check skill tags
    const itemId = card.dataset.itemId;
    let item = null;
    
    // Find item in appropriate gear category
    if (STATE.gear.weapons) {
      item = STATE.gear.weapons.find(w => w.id === itemId);
    }
    if (!item && STATE.gear['armors/head']) {
      item = STATE.gear['armors/head'].find(h => h.id === itemId);
    }
    if (!item && STATE.gear['armors/chest']) {
      item = STATE.gear['armors/chest'].find(c => c.id === itemId);
    }
    if (!item && STATE.gear['armors/boots']) {
      item = STATE.gear['armors/boots'].find(b => b.id === itemId);
    }
    if (!item && STATE.mods.weapon) {
      item = STATE.mods.weapon.find(m => m.id === itemId);
    }
    if (!item && STATE.mods.armor) {
      item = STATE.mods.armor.find(m => m.id === itemId);
    }
    
    let matchesSearch = false;
    
    // Search by item name
    if (itemName.includes(searchTerm) || itemSub.includes(searchTerm)) {
      matchesSearch = true;
    }
    
    // Search by skill tags (for weapons, armor)
    if (item && item.type !== 'weapon') {
      const allSkills = [
        ...(item.basicAttacks || []),
        ...(item.weaponSkills || []),
        item.coreSkill,
        item.passiveSkill
      ].filter(Boolean);
      
      for (const skillId of allSkills) {
        const skill = STATE.skills.find(s => s.id === skillId);
        if (skill) {
          // Search by skill name
          const skillName = skill.name?.toLowerCase() || '';
          if (skillName.includes(searchTerm)) {
            matchesSearch = true;
            break;
          }
          
          // Search by skill tags
          if (skill.tags) {
            const skillTags = skill.tags.join(' ').toLowerCase();
            if (skillTags.includes(searchTerm)) {
              matchesSearch = true;
              break;
            }
          }
        }
      }
    }
    
    // Search by description and stats (for weapon and armor mods)
    if (item && (item.type === 'weapon' || item.type === 'armor')) {
      const description = item.description?.toLowerCase() || '';
      if (description.includes(searchTerm)) {
        matchesSearch = true;
      }
      
      // Search by stats
      if (item.stats) {
        const statsText = Object.entries(item.stats).map(([key, value]) => `${key}: ${value}`).join(' ').toLowerCase();
        if (statsText.includes(searchTerm)) {
          matchesSearch = true;
        }
      }
    }
    
    // Show/hide card based on search match
    card.style.display = matchesSearch ? 'flex' : 'none';
  });
}

function clearSearch() {
  if (searchInput) {
    searchInput.value = '';
    handleSearch();
    searchInput.focus();
  }
}

function renderDrifterSelection() {
  if (!selectionGrid) {
    return;
  }
  
  // Clear existing content
  selectionGrid.innerHTML = '';
  
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  STATE.drifters.forEach((drifter, index) => {
    const card = document.createElement('div');
    card.className = 'drifter-select-card';
    card.dataset.gameId = drifter.gameId;
    
    // Check if this drifter is unavailable for support selection
    const isAlreadySupport = isDrifterAlreadySelectedAsSupport(drifter.gameId);
    const isMainDrifter = isDrifterMainSelected(drifter.gameId);
    const isUnavailable = isAlreadySupport || isMainDrifter;
    
    if (isUnavailable) {
      card.classList.add('unavailable');
    }
    
    // Create card content
    const img = document.createElement('img');
    img.src = drifter.cardIcon || drifter.icon;
    img.alt = drifter.name;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '4px';
    
    const name = document.createElement('div');
    name.textContent = drifter.name;
    name.style.fontWeight = 'bold';
    name.style.textAlign = 'center';
    name.style.marginTop = '0.5rem';
    name.style.color = 'var(--text)';
    name.style.fontSize = '1rem';
    
    const role = document.createElement('div');
    role.textContent = drifter.description;
    role.style.fontSize = '0.9rem';
    role.style.color = 'var(--text-muted)';
    role.style.textAlign = 'center';
    role.style.marginTop = '0.25rem';
    
    card.appendChild(name);
    card.appendChild(img);
    card.appendChild(role);
    
    // Add unavailable indicator if needed
    if (isUnavailable) {
      const unavailableOverlay = document.createElement('div');
      unavailableOverlay.className = 'unavailable-overlay';
      unavailableOverlay.textContent = isAlreadySupport ? 'Already Selected' : 'Main Character';
      card.appendChild(unavailableOverlay);
    }
    
    // Add support effects if drifter has support data
    if (drifter.support) {
      const supportEffect = document.createElement('div');
      supportEffect.className = 'support-effect';
      
      let effectText = '';
      
      // Handle effects array format
      if (drifter.support.effects && Array.isArray(drifter.support.effects)) {
        effectText = drifter.support.effects.map(effect => {
          return `${effect.name}: ${effect.value}`;
        }).join(', ');
      }
      // Handle other support properties (like starfallTokenBonus)
      else {
        const supportKeys = Object.keys(drifter.support);
        effectText = supportKeys.map(key => {
          const value = drifter.support[key];
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return `${formattedKey}: ${value}`;
        }).join(', ');
      }
      
      if (effectText) {
        supportEffect.textContent = effectText;
        
        card.appendChild(supportEffect);
        // Add a class to indicate this card has support effects
        card.classList.add('has-support-effects');
      }
    }
    
    // Add click handler
    card.addEventListener('click', () => {
      // Check if this is for support card selection
      if (window.currentSupportSlot !== undefined) {
        // Check if this drifter is already selected as a support
        if (isDrifterAlreadySelectedAsSupport(drifter.gameId)) {
          showToast('This drifter is already selected as a support!', 'error');
          return;
        }
        // Check if this drifter is the main selected drifter
        if (isDrifterMainSelected(drifter.gameId)) {
          showToast('This drifter is already your main character!', 'error');
          return;
        }
        addSupportDrifter(drifter, window.currentSupportSlot);
        window.currentSupportSlot = undefined;
        hideOverlay();
        return;
      }
      
      const existing = STATE.selected.drifters.findIndex((sel) => sel.gameId === drifter.gameId);
      if (existing >= 0) {
        STATE.selected.drifters.splice(existing, 1);
        updateSupportEffects(null);
      } else {
        STATE.selected.drifters.length = 0;
        STATE.selected.drifters.push(drifter);
      }
      
      updateAvatar();
      updateSupportEffects(STATE.selected.drifters[0]);
      clearGearSlots();
      revealSlots();
      hideOverlay();
    });
    
    fragment.appendChild(card);
  });
  
  selectionGrid.appendChild(fragment);
}


function clearGearSlots() {
  loadoutSlots.forEach((slot) => {
    const card = slot.querySelector('.slot-card');
    card.classList.add('empty');
    card.innerHTML = '<span class="slot-empty-label">Empty Slot</span>';
    slot.classList.remove('slot--visible');
  });
  STATE.selected.gear = {};
  STATE.selected.mods = {};
}

function disableEquipmentSlots(disabled) {
  loadoutSlots.forEach(slot => {
    slot.style.pointerEvents = disabled ? 'none' : 'auto';
    slot.style.opacity = disabled ? '0.5' : '1';
  });
}

function revealSlots() {
  // Enable equipment slots when drifter is selected
  disableEquipmentSlots(false);
}

function bindSlotTriggers() {
  loadoutSlots.forEach((slot, index) => {
    slot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const key = slot.dataset.slot;
      if (key && SLOT_MAPPINGS[key]) {
        showOverlay(SLOT_MAPPINGS[key].title, key);
      } else {
      }
    }, true); // Use capture phase
  });
}

async function init() {
  
  // Initialize DOM references
  drifterTrigger = document.getElementById('drifterTrigger');
  selectionOverlay = document.getElementById('selectionOverlay');
  selectionGrid = document.getElementById('selectionGrid');
  selectionTitle = document.getElementById('selection-title');
  closeSelectionBtn = document.getElementById('closeSelection');
  overlayContent = document.getElementById('overlayContent');
  loadoutSlots = document.querySelectorAll('.slot[data-slot]');
  drifterGrid = document.getElementById('drifterGrid');
  gearGrid = document.getElementById('gearGrid');
  gearCategorySelect = document.getElementById('gearCategorySelect');
  avatarTitle = document.getElementById('avatarTitle');
  avatarDescription = document.getElementById('avatarDescription');
  masterySection = document.getElementById('masterySection');
  supportEffects = document.getElementById('supportEffects');
  supportList = document.getElementById('supportList');
  searchContainer = document.getElementById('searchContainer');
  searchInput = document.getElementById('searchInput');
  clearSearchBtn = document.getElementById('clearSearch');
  
  
  
  // Add mobile class for responsive behavior
  // Check multiple conditions for mobile detection
  const isMobile = window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   ('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0);
  
  if (isMobile) {
    document.body.classList.add('mobile-device');
    
    
  } else {
  }
  
  // Force mobile mode for testing if viewport is small (for device emulation)
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile-device');
    
    
    // Mobile CSS handles all layout - no JavaScript overrides needed
  }
  
  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  loadingDiv.innerHTML = 'Loading loadout builder...';
  document.body.appendChild(loadingDiv);

  try {
    const toast = createToast();
    document.body.appendChild(toast.element);

    const data = await loadDataSets(toast.notify);
    STATE.drifters = data.drifters;
    STATE.skills = data.skills;
    STATE.gear = data.gear;
    STATE.mods = data.mods;
    STATE.selected = data.selected;
    

    bindSlotTriggers();
    clearGearSlots();
    disableEquipmentSlots(true); // Start with equipment slots disabled
    renderDrifters();
    
    // Remove loading indicator
    if (loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
    }
    
  } catch (error) {
    console.error('Failed to initialize loadout builder:', error);
    loadingDiv.innerHTML = 'Failed to load. Please refresh the page.';
    loadingDiv.style.background = 'rgba(200,0,0,0.8)';
  }
  
  // Update UI with any pre-selected drifter
  updateAvatar();
  updateSupportEffects(STATE.selected.drifters[0]);

  // Bind drifter trigger
  if (drifterTrigger) {
    drifterTrigger.addEventListener('click', () => showOverlay('Select a Drifter', 'drifters'));
  }

  // Ensure overlay can close and never sticks
  if (closeSelectionBtn) {
    closeSelectionBtn.addEventListener('click', () => hideOverlay());
  }
  if (selectionOverlay) {
    selectionOverlay.addEventListener('click', (e) => {
      if (e.target === selectionOverlay || e.target === overlayContent) hideOverlay();
    });
  }
  
  // Bind ability slot click handlers
  const aSlot = document.querySelector('[data-key="A"]');
  const qSlot = document.querySelector('[data-key="Q"]');
  
  if (aSlot) {
    aSlot.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      showBasicAttackSelection();
    });
  }
  
  if (qSlot) {
    qSlot.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      showWeaponSkillSelection();
    });
  }

  // Bind loadout control buttons
  const exportLoadoutBtn = document.getElementById('exportLoadoutBtn');
  const importLoadoutBtn = document.getElementById('importLoadoutBtn');

  if (exportLoadoutBtn) {
    exportLoadoutBtn.addEventListener('click', exportLoadout);
  }
  if (importLoadoutBtn) {
    importLoadoutBtn.addEventListener('click', importLoadout);
  }
  
  const discordShareBtn = document.getElementById('discordShareBtn');
  if (discordShareBtn) {
    discordShareBtn.addEventListener('click', shareToDiscord);
  }
  
  const generateImageBtn = document.getElementById('generateImageBtn');
  if (generateImageBtn) {
    generateImageBtn.addEventListener('click', generateBuildImage);
  }
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', clearSearch);
  }

  // Check for shared loadout in URL
  checkForSharedLoadout();
  
  // Initialize support cards after a small delay to ensure DOM is ready
  setTimeout(() => {
    initializeSupportCards();
    window.supportCardsInitialized = true;
  }, 100);
  
  // Force correct positioning with inline styles
  const header = document.querySelector('.panel-header');
  if (header) {
    header.style.display = 'flex';
    header.style.flexDirection = 'column';
    header.style.alignItems = 'center';
    header.style.marginBottom = '24px';
    header.style.padding = '0 20px';
  }
  
  const title = document.querySelector('.game-title');
  if (title) {
    title.style.textAlign = 'center';
    title.style.width = '100%';
    title.style.marginBottom = '12px';
  }
  
  const controls = document.querySelector('.loadout-controls');
  if (controls) {
    controls.style.display = 'flex';
    controls.style.gap = '16px';
    controls.style.alignItems = 'center';
    controls.style.justifyContent = 'flex-end';
    controls.style.background = 'transparent';
    controls.style.padding = '0';
    controls.style.border = 'none';
    controls.style.boxShadow = 'none';
    controls.style.width = '100%';
  }
  
  // Add hover effects to text buttons
  const textButtons = document.querySelectorAll('.loadout-text-btn');
  textButtons.forEach((btn, index) => {
    
    // Add hover effect
    btn.addEventListener('mouseenter', () => {
      btn.style.color = 'var(--accent)';
      btn.style.backgroundColor = 'var(--bg-elev-2)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.color = 'var(--text)';
      btn.style.backgroundColor = 'transparent';
    });
  });
}


function renderGear(key) {
  const gearKey = SLOT_MAPPINGS[key].key;
  
  // Handle different types of items
  let items;
  if (gearKey === 'weapons' || gearKey === 'armors/head' || gearKey === 'armors/chest' || gearKey === 'armors/boots') {
    // For weapons, helmets, chests, and boots, only show actual items, not mods
    items = STATE.gear[gearKey];
  } else if (key === 'weaponMod') {
    // For weapon mods, show weapon mods
    items = STATE.mods.weapon;
  } else if (key === 'helmMod' || key === 'chestMod' || key === 'bootsMod') {
    // For armor mods, filter by slot
    if (key === 'chestMod') {
      // Show both universal armor mods and chest-specific mods
      items = STATE.mods.armor.filter(mod => mod.slot === 'armor' || mod.slot === 'chest');
    } else if (key === 'helmMod') {
      // Show only universal armor mods (no slot-specific mods)
      items = STATE.mods.armor.filter(mod => mod.slot === 'armor');
    } else if (key === 'bootsMod') {
      // Show both universal armor mods and boots-specific mods
      items = STATE.mods.armor.filter(mod => mod.slot === 'armor' || mod.slot === 'boots');
    } else {
      items = STATE.mods.armor;
    }
  } else {
    // Fallback
    items = [];
  }
    
  
    
  renderCards(
    items,
    selectionGrid,
    (item) => {
      if (key === 'weaponMod') {
        return STATE.selected.mods.weaponMod?.gameId === item.gameId;
      } else if (key === 'helmMod') {
        return STATE.selected.mods.helmMod?.gameId === item.gameId;
      } else if (key === 'chestMod') {
        return STATE.selected.mods.chestMod?.gameId === item.gameId;
      } else if (key === 'bootsMod') {
        return STATE.selected.mods.bootsMod?.gameId === item.gameId;
      } else {
        return STATE.selected.gear[gearKey]?.gameId === item.gameId;
      }
    },
    (item) => {
      if (key === 'weaponMod') {
        if (STATE.selected.mods.weaponMod?.gameId === item.gameId) {
          delete STATE.selected.mods.weaponMod;
        } else {
          STATE.selected.mods.weaponMod = item;
        }
      } else if (key === 'helmMod') {
        if (STATE.selected.mods.helmMod?.gameId === item.gameId) {
          delete STATE.selected.mods.helmMod;
        } else {
          STATE.selected.mods.helmMod = item;
        }
      } else if (key === 'chestMod') {
        if (STATE.selected.mods.chestMod?.gameId === item.gameId) {
          delete STATE.selected.mods.chestMod;
        } else {
          STATE.selected.mods.chestMod = item;
        }
      } else if (key === 'bootsMod') {
        if (STATE.selected.mods.bootsMod?.gameId === item.gameId) {
          delete STATE.selected.mods.bootsMod;
        } else {
          STATE.selected.mods.bootsMod = item;
        }
      } else {
        if (STATE.selected.gear[gearKey]?.gameId === item.gameId) {
          delete STATE.selected.gear[gearKey];
        } else {
          STATE.selected.gear[gearKey] = item;
          if (item.slot) {
            STATE.selected.mods[resolveSlotKey(item)] = item;
          }
        }
      }
      
      // Auto-fill ability slots with weapon skills (only for weapons, not mods)
      if (key !== 'weaponMod' && item.basicAttacks && item.basicAttacks.length > 0) {
        const firstBasicAttack = STATE.skills.find(s => s.id === item.basicAttacks[0]);
        if (firstBasicAttack) {
          STATE.selected.gear['basic-attack'] = firstBasicAttack;
        }
      }
      
      if (key !== 'weaponMod' && item.weaponSkills && item.weaponSkills.length > 0) {
        const firstWeaponSkill = STATE.skills.find(s => s.id === item.weaponSkills[0]);
        if (firstWeaponSkill) {
          STATE.selected.gear['weapon-skill'] = firstWeaponSkill;
        }
      }
      
      // Close the modal after selecting equipment or mods
      if (key === 'weapon' || key === 'weaponMod' || key === 'helm' || key === 'chest' || key === 'boots' || key === 'helmMod' || key === 'chestMod' || key === 'bootsMod') {
        hideOverlay();
      }
      
      populateLoadoutBoard();
    }
  );
}



function populateLoadoutBoard() {
  const mapping = {
    weapon: STATE.selected.gear['weapons'],
    helm: STATE.selected.gear['armors/head'],
    chest: STATE.selected.gear['armors/chest'],
    boots: STATE.selected.gear['armors/boots'],
    weaponMod: STATE.selected.mods.weaponMod,
    helmMod: STATE.selected.mods.helmMod,
    chestMod: STATE.selected.mods.chestMod,
    bootsMod: STATE.selected.mods.bootsMod
  };

  loadoutSlots.forEach((slot, index) => {
    const key = slot.dataset.slot;
    const card = slot.querySelector('.slot-card');
    const item = mapping[key];

    if (!item) {
      card.classList.add('empty');
      card.innerHTML = '<span class="slot-empty-label">Empty Slot</span>';
      // Clear item name
      const nameElement = card.querySelector('.item-name');
      if (nameElement) {
        nameElement.textContent = '';
      }
      // Remove any existing tooltip
      slot.removeAttribute('title');
      slot.removeAttribute('data-tooltip');
      // Remove tooltip event listeners without breaking click handlers
      slot.removeEventListener('mouseenter', slot._tooltipMouseEnter);
      slot.removeEventListener('mouseleave', slot._tooltipMouseLeave);
      delete slot._tooltipMouseEnter;
      delete slot._tooltipMouseLeave;
      return;
    }

    slot.classList.add('slot--visible');
    card.classList.remove('empty');
    card.innerHTML = '';

    // Handle item icons
    if (item.icon) {
      const img = document.createElement('img');
      img.src = item.icon;
      img.alt = item.name || 'Icon';
      card.appendChild(img);
    }
    
    // Add item name
    const nameElement = card.querySelector('.item-name');
    if (nameElement) {
      nameElement.textContent = item.name || '';
    }

    // Add custom tooltip functionality
    slot.removeAttribute('title'); // Remove default tooltip
    slot.setAttribute('data-tooltip', item.name || 'Unknown Item');
    
    // Remove existing tooltip event listeners if they exist
    if (slot._tooltipMouseEnter) {
      slot.removeEventListener('mouseenter', slot._tooltipMouseEnter);
    }
    if (slot._tooltipMouseLeave) {
      slot.removeEventListener('mouseleave', slot._tooltipMouseLeave);
    }
    
    // Create new tooltip event listeners
    slot._tooltipMouseEnter = (e) => {
      const tooltip = createGlobalTooltip();
      tooltip.textContent = item.name || 'Unknown Item';
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      
      // Position tooltip
      const slotRect = slot.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top = slotRect.top - tooltipRect.height - 10;
      let left = slotRect.left + (slotRect.width / 2) - (tooltipRect.width / 2);
      
      // Keep within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) {
        top = slotRect.bottom + 10;
      }
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    };
    
    slot._tooltipMouseLeave = (e) => {
      const tooltip = createGlobalTooltip();
      tooltip.style.display = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    };
    
    // Add the event listeners
    slot.addEventListener('mouseenter', slot._tooltipMouseEnter);
    slot.addEventListener('mouseleave', slot._tooltipMouseLeave);
  });

  // Update ability slot W with weapon skill
  updateWeaponSkill();
  
  // Update weapon passive
  updateWeaponPassive();
  
  // Update helm passive
  updateHelmPassive();
  
  // Update chest skill (D slot)
  updateChestSkill();
  
  // Update boots skill (F slot)
  updateBootsSkill();
  
  // Update ability slots A and Q with weapon skills
  updateBasicAttackSkill();
  updateWeaponAbilitySkill();
}

function updateWeaponSkill() {
  const weapon = STATE.selected.gear['weapons'];
  const wSlot = document.querySelector('[data-key="W"]');
  const wIcon = wSlot.querySelector('.ability-icon');
  
  // Handle weapon core skill
  if (weapon && weapon.coreSkill) {
    const coreSkill = STATE.skills.find(s => s.id === weapon.coreSkill);
    if (coreSkill && coreSkill.icon) {
      const iconUrl = `${coreSkill.icon}?v=${Date.now()}`;
      wIcon.style.backgroundImage = `url(${iconUrl})`;
      wSlot.classList.remove('empty');
    } else {
      wIcon.style.backgroundImage = '';
      wSlot.classList.add('empty');
    }
  } else if (weapon && weapon.skill && weapon.skill.icon) {
    // Fallback for old weapon format
    const iconUrl = `${weapon.skill.icon}?v=${Date.now()}`;
    wIcon.style.backgroundImage = `url(${iconUrl})`;
    wSlot.classList.remove('empty');
  } else if (weapon && weapon.skillIcon) {
    // Fallback for old weapon format
    const iconUrl = `${weapon.skillIcon}?v=${Date.now()}`;
    wIcon.style.backgroundImage = `url(${iconUrl})`;
    wSlot.classList.remove('empty');
  } else {
    wIcon.style.backgroundImage = '';
    wSlot.classList.add('empty');
  }
  
  // Update weapon tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function updateWeaponPassive() {
  const weapon = STATE.selected.gear['weapons'];
  const weaponPassiveSlot = document.querySelector('[data-key="weapon-passive"]');
  const weaponPassiveIcon = weaponPassiveSlot.querySelector('.ability-icon');
  
  // Handle weapon passive skill
  if (weapon && weapon.passiveSkill) {
    const passiveSkill = STATE.skills.find(s => s.id === weapon.passiveSkill);
    if (passiveSkill && passiveSkill.icon) {
      const passiveIconUrl = `${passiveSkill.icon}?v=${Date.now()}`;
      weaponPassiveIcon.style.backgroundImage = `url(${passiveIconUrl})`;
      weaponPassiveSlot.classList.remove('empty');
    } else {
      weaponPassiveIcon.style.backgroundImage = '';
      weaponPassiveSlot.classList.add('empty');
    }
  } else {
    weaponPassiveIcon.style.backgroundImage = '';
    weaponPassiveSlot.classList.add('empty');
  }
  
  // Update weapon passive tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function updateHelmPassive() {
  const helm = STATE.selected.gear['armors/head'];
  const helmPassiveSlot = document.querySelector('[data-key="helm-passive"]');
  const helmPassiveIcon = helmPassiveSlot.querySelector('.ability-icon');
  
  // Handle helm passive skill
  if (helm && helm.passiveSkill) {
    const passiveSkill = STATE.skills.find(s => s.id === helm.passiveSkill);
    if (passiveSkill && passiveSkill.icon) {
      const helmPassiveIconUrl = `${passiveSkill.icon}?v=${Date.now()}`;
      helmPassiveIcon.style.backgroundImage = `url(${helmPassiveIconUrl})`;
      helmPassiveSlot.classList.remove('empty');
    } else {
      helmPassiveIcon.style.backgroundImage = '';
      helmPassiveSlot.classList.add('empty');
    }
  } else {
    helmPassiveIcon.style.backgroundImage = '';
    helmPassiveSlot.classList.add('empty');
  }
  
  // Update helm passive tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function updateChestSkill() {
  const chest = STATE.selected.gear['armors/chest'];
  const dSlot = document.querySelector('[data-key="D"]');
  const dIcon = dSlot.querySelector('.ability-icon');
  
  // Handle chest core skill
  if (chest && chest.coreSkill) {
    const coreSkill = STATE.skills.find(s => s.id === chest.coreSkill);
    if (coreSkill && coreSkill.icon) {
      const iconUrl = `${coreSkill.icon}?v=${Date.now()}`;
      dIcon.style.backgroundImage = `url(${iconUrl})`;
      dSlot.classList.remove('empty');
    } else {
      dIcon.style.backgroundImage = '';
      dSlot.classList.add('empty');
    }
  } else {
    dIcon.style.backgroundImage = '';
    dSlot.classList.add('empty');
  }
  
  // Update chest skill tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function updateBootsSkill() {
  const boots = STATE.selected.gear['armors/boots'];
  const fSlot = document.querySelector('[data-key="F"]');
  const fIcon = fSlot.querySelector('.ability-icon');
  
  // Handle boots core skill
  if (boots && boots.coreSkill) {
    const coreSkill = STATE.skills.find(s => s.id === boots.coreSkill);
    if (coreSkill && coreSkill.icon) {
      const iconUrl = `${coreSkill.icon}?v=${Date.now()}`;
      fIcon.style.backgroundImage = `url(${iconUrl})`;
      fSlot.classList.remove('empty');
    } else {
      fIcon.style.backgroundImage = '';
      fSlot.classList.add('empty');
    }
  } else {
    fIcon.style.backgroundImage = '';
    fSlot.classList.add('empty');
  }
  
  // Update boots skill tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function updateBasicAttackSkill() {
  const basicAttack = STATE.selected.gear['basic-attack'];
  const aSlot = document.querySelector('[data-key="A"]');
  const aIcon = aSlot.querySelector('.ability-icon');
  
  if (basicAttack && basicAttack.icon) {
    const iconUrl = `${basicAttack.icon}?v=${Date.now()}`;
    aIcon.style.backgroundImage = `url(${iconUrl})`;
    aSlot.classList.remove('empty');
  } else {
    aIcon.style.backgroundImage = '';
    aSlot.classList.add('empty');
  }
  
  // Update tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function updateWeaponAbilitySkill() {
  const weaponSkill = STATE.selected.gear['weapon-skill'];
  const qSlot = document.querySelector('[data-key="Q"]');
  const qIcon = qSlot.querySelector('.ability-icon');
  
  if (weaponSkill && weaponSkill.icon) {
    const weaponSkillIconUrl = `${weaponSkill.icon}?v=${Date.now()}`;
    qIcon.style.backgroundImage = `url(${weaponSkillIconUrl})`;
    qSlot.classList.remove('empty');
  } else {
    qIcon.style.backgroundImage = '';
    qSlot.classList.add('empty');
  }
  
  // Update tooltip
  const drifter = STATE.selected.drifters[0];
  if (drifter) {
    updateAbilityTooltips(drifter);
  }
}

function showBasicAttackSelection() {
  const weapon = STATE.selected.gear['weapons'];
  if (!weapon || !weapon.basicAttacks) {
    return;
  }
  
  // Get the basic attack skills
  const basicAttackSkills = weapon.basicAttacks.map(skillId => 
    STATE.skills.find(s => s.id === skillId)
  ).filter(skill => skill);
  
  if (basicAttackSkills.length === 0) {
    return;
  }
  
  // Create a vertical cascade of skill images
  showSkillCascade('A', basicAttackSkills, (skill) => {
    STATE.selected.gear['basic-attack'] = skill;
    updateBasicAttackSkill();
  });
}

function showWeaponSkillSelection() {
  const weapon = STATE.selected.gear['weapons'];
  if (!weapon || !weapon.weaponSkills) {
    return;
  }
  
  // Get the weapon skills
  const weaponSkills = weapon.weaponSkills.map(skillId => 
    STATE.skills.find(s => s.id === skillId)
  ).filter(skill => skill);
  
  if (weaponSkills.length === 0) {
    return;
  }
  
  // Create a vertical cascade of skill images
  showSkillCascade('Q', weaponSkills, (skill) => {
    STATE.selected.gear['weapon-skill'] = skill;
    updateWeaponAbilitySkill();
  });
}

function showSkillCascade(slotKey, skills, onSelect) {
  const slot = document.querySelector(`[data-key="${slotKey}"]`);
  if (!slot) return;
  
  // Check if cascade is already open for this slot
  const existingCascade = slot.querySelector('.skill-cascade');
  if (existingCascade) {
    hideSkillCascade();
    return;
  }
  
  // Remove any existing cascades from other slots
  hideSkillCascade();
  
  // Hide any existing tooltips when cascade opens
  const tooltip = createGlobalTooltip();
  tooltip.style.display = 'none';
  tooltip.style.opacity = '0';
  tooltip.style.visibility = 'hidden';
  
  // Create cascade container
  const cascade = document.createElement('div');
  cascade.className = 'skill-cascade';
  cascade.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    z-index: 1000;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column-reverse;
    gap: 4px;
    min-width: 60px;
  `;
  
  // Add skill images
  skills.forEach(skill => {
    const skillOption = document.createElement('div');
    skillOption.className = 'skill-option';
    skillOption.style.cssText = `
      width: 50px;
      height: 50px;
      background-image: url(${skill.icon}?v=${Date.now()});
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      border: 2px solid ${STATE.selected.gear[slotKey === 'A' ? 'basic-attack' : 'weapon-skill']?.id === skill.id ? 'var(--accent)' : 'transparent'};
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    // Add hover effect
    skillOption.addEventListener('mouseenter', () => {
      skillOption.style.borderColor = 'var(--accent)';
      skillOption.style.transform = 'scale(1.1)';
    });
    
    skillOption.addEventListener('mouseleave', () => {
      if (STATE.selected.gear[slotKey === 'A' ? 'basic-attack' : 'weapon-skill']?.id !== skill.id) {
        skillOption.style.borderColor = 'transparent';
      }
      skillOption.style.transform = 'scale(1)';
    });
    
    // Add click handler
    skillOption.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(skill);
      hideSkillCascade();
    });
    
    // No tooltip on cascade skills to prevent interference
    
    cascade.appendChild(skillOption);
  });
  
  // Position the cascade relative to the slot
  slot.style.position = 'relative';
  slot.appendChild(cascade);
  
  // Add click outside to close
  const closeCascade = (e) => {
    if (!cascade.contains(e.target) && e.target !== slot) {
      hideSkillCascade();
      document.removeEventListener('click', closeCascade);
    }
  };
  
  // Delay adding the click listener to avoid immediate closure
  setTimeout(() => {
    document.addEventListener('click', closeCascade);
  }, 10);
}

function hideSkillCascade() {
  const existingCascades = document.querySelectorAll('.skill-cascade');
  existingCascades.forEach(cascade => cascade.remove());
}

function updateAvatar() {
  const drifter = STATE.selected.drifters[0];
  
  const loadoutLayout = document.getElementById('loadoutLayout');
  const avatarText = document.getElementById('avatarText');
  const drifterInfoSection = document.getElementById('drifterInfoSection');
  const drifterName = document.getElementById('drifterName');
  const drifterDescription = document.getElementById('drifterDescription');
  
  
  if (!drifter) {
    loadoutLayout.style.backgroundImage = '';
    if (avatarText) avatarText.textContent = 'Select Drifter';
    if (avatarText) avatarText.style.display = 'grid';
    if (drifterInfoSection) hideElement(drifterInfoSection);
    clearDrifterAbilities();
    disableEquipmentSlots(true);
    hideMasterySection();
    updateSupportEffects(null);
    return;
  }
  

  // Handle drifter background - different images for mobile vs desktop
  let imageUrl;
  const isMobile = window.innerWidth <= 768 || document.body.classList.contains('mobile-device');
  
  if (isMobile) {
    // Mobile: use card images
    const mobileImageUrl = drifter.cardIcon || drifter.card || drifter.icon || drifter.portrait;
    // Add cache-busting parameter to force reload
    imageUrl = mobileImageUrl ? `${mobileImageUrl}?v=${Date.now()}` : mobileImageUrl;
  } else {
    // Desktop: use regular drifter images
    const drifterId = drifter.id || drifter.gameId;
    if (drifterId) {
      // Special case for Nyxa (typo in filename)
      const imageName = drifterId;
      // Add cache-busting parameter to force reload
      imageUrl = `./assets/icons/drifter-${imageName}.png?v=${Date.now()}`;
    } else {
      // Fallback to existing properties
      imageUrl = drifter.icon || drifter.portrait;
    }
  }
  
  if (imageUrl) {
    loadoutLayout.style.backgroundImage = `url(${imageUrl})`;
    // Use different background sizes for mobile vs desktop
    if (isMobile) {
      loadoutLayout.style.backgroundSize = 'contain';
      loadoutLayout.style.backgroundPosition = 'center center';
    } else {
      // Desktop: let CSS handle the sizing (cover from styles.css)
      loadoutLayout.style.backgroundSize = '';
      loadoutLayout.style.backgroundPosition = '';
    }
    loadoutLayout.style.backgroundRepeat = 'no-repeat';
    
    
    
  } else {
    loadoutLayout.style.backgroundImage = '';
    loadoutLayout.style.backgroundSize = '';
    loadoutLayout.style.backgroundPosition = '';
    loadoutLayout.style.backgroundRepeat = '';
  }
  
  
  // Update the drifter info section below header
  if (drifterInfoSection) showElement(drifterInfoSection);
  if (drifterName) drifterName.textContent = drifter.name;
  if (drifterDescription) drifterDescription.textContent = drifter.description || '';
  
  // Hide the "Select Drifter" text in the center
  if (avatarText) avatarText.style.display = 'none';
  updateDrifterAbilities(drifter);
  disableEquipmentSlots(false);
  
  // Show mastery section and update support effects
  showMasterySection();
  STATE.mastery.currentDrifter = drifter;
  STATE.mastery.level = 1;
  updateMasteryDisplay();
  updateSupportEffects(drifter);
}

function updateDrifterAbilities(drifter) {
  
  
  const passiveSlot = document.querySelector('.drifter-passive .ability-icon');
  const eSlot = document.querySelector('[data-key="E"] .ability-icon');
  
  
  // Get skill data
  const passiveSkillId = drifter.skills?.passive;
  const coreSkillId = drifter.skills?.core;
  const passiveSkill = passiveSkillId ? STATE.skills?.find(s => s.id === passiveSkillId) : null;
  const coreSkill = coreSkillId ? STATE.skills?.find(s => s.id === coreSkillId) : null;
  
  // Handle passive skill - look up by ID from skills data
  
  if (passiveSkill && passiveSkill.icon) {
    const iconUrl = `${passiveSkill.icon}?v=${Date.now()}`;
    passiveSlot.style.backgroundImage = `url(${iconUrl})`;
    passiveSlot.parentElement.classList.remove('empty');
  } else {
    passiveSlot.style.backgroundImage = '';
    passiveSlot.parentElement.classList.add('empty');
  }
  
  // Handle active skill in E slot - look up by ID from skills data
  
  if (coreSkill && coreSkill.icon) {
    const iconUrl = `${coreSkill.icon}?v=${Date.now()}`;
    eSlot.style.backgroundImage = `url(${iconUrl})`;
    eSlot.parentElement.classList.remove('empty');
  } else {
    eSlot.style.backgroundImage = '';
    eSlot.parentElement.classList.add('empty');
  }
  
  // Update tooltips
  updateAbilityTooltips(drifter);
}

function updateAbilityTooltips(drifter) {
  // Get skill data from STATE.skills
  const coreSkillId = drifter.skills?.core;
  const passiveSkillId = drifter.skills?.passive;
  const coreSkill = coreSkillId ? STATE.skills?.find(s => s.id === coreSkillId) : null;
  const passiveSkill = passiveSkillId ? STATE.skills?.find(s => s.id === passiveSkillId) : null;
  
  // Update E slot tooltip (drifter active skill)
  const eSlot = document.querySelector('[data-key="E"]');
  let eTooltip = eSlot.querySelector('.ability-tooltip');
  if (!eTooltip) {
    eTooltip = document.createElement('div');
    eTooltip.className = 'ability-tooltip';
    eSlot.appendChild(eTooltip);
  }
  if (coreSkill) {
    const category = getAbilityCategory(coreSkill);
    const formattedDescription = coreSkill.description.replace(/\n/g, '<br><br>');
    
    // Create skill tags
    let skillTags = '';
    if (coreSkill.tags && coreSkill.tags.length > 0) {
      const allTags = coreSkill.tags.map(tag => {
        const tagClass = getTagClass(tag);
        let displayTag = tag;
        if (tag === 'cooldown_reduction') displayTag = 'cooldown';
        else if (tag === 'control_immunity') displayTag = 'control immunity';
        else if (tag === 'damage_immunity') displayTag = 'immunity';
        else if (tag === 'hard_control') displayTag = 'hard control';
        return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
      }).join(' ');
      skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
    }
    
    eTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${coreSkill.name}</strong></div><div>${formattedDescription}</div>`;
  } else {
    eTooltip.textContent = 'No skill available';
  }
  
  // Update drifter passive tooltip
  const passiveSlot = document.querySelector('.drifter-passive');
  let passiveTooltip = passiveSlot.querySelector('.ability-tooltip');
  if (!passiveTooltip) {
    passiveTooltip = document.createElement('div');
    passiveTooltip.className = 'ability-tooltip';
    passiveSlot.appendChild(passiveTooltip);
  }
  if (passiveSkill) {
    const category = getAbilityCategory(passiveSkill);
    const formattedDescription = passiveSkill.description.replace(/\n/g, '<br><br>');
    
    // Create skill tags for passive
    let skillTags = '';
    if (passiveSkill.tags && passiveSkill.tags.length > 0) {
      const allTags = passiveSkill.tags.map(tag => {
        const tagClass = getTagClass(tag);
        let displayTag = tag;
        if (tag === 'cooldown_reduction') displayTag = 'cooldown';
        else if (tag === 'control_immunity') displayTag = 'control immunity';
        else if (tag === 'damage_immunity') displayTag = 'immunity';
        else if (tag === 'hard_control') displayTag = 'hard control';
        return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
      }).join(' ');
      skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
    }
    
    passiveTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${passiveSkill.name}</strong></div><div>${formattedDescription}</div>`;
  } else {
    passiveTooltip.textContent = 'No passive available';
  }
  
  // Update weapon passive tooltip
  const weapon = STATE.selected.gear['weapons'];
  const weaponPassiveSlot = document.querySelector('[data-key="weapon-passive"]');
  let weaponPassiveTooltip = weaponPassiveSlot.querySelector('.ability-tooltip');
  if (!weaponPassiveTooltip) {
    weaponPassiveTooltip = document.createElement('div');
    weaponPassiveTooltip.className = 'ability-tooltip';
    weaponPassiveSlot.appendChild(weaponPassiveTooltip);
  }
  if (weapon && weapon.passiveSkill) {
    const weaponPassiveSkill = STATE.skills.find(s => s.id === weapon.passiveSkill);
    if (weaponPassiveSkill) {
      const formattedDescription = weaponPassiveSkill.description.replace(/\n/g, '<br><br>');
      
      // Create skill tags for weapon passive
      let skillTags = '';
      if (weaponPassiveSkill.tags && weaponPassiveSkill.tags.length > 0) {
        const allTags = weaponPassiveSkill.tags.map(tag => {
          const tagClass = getTagClass(tag);
          let displayTag = tag;
          if (tag === 'cooldown_reduction') displayTag = 'cooldown';
          else if (tag === 'control_immunity') displayTag = 'control immunity';
          else if (tag === 'damage_immunity') displayTag = 'immunity';
          else if (tag === 'hard_control') displayTag = 'hard control';
          return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
        }).join(' ');
        skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
      }
      
      weaponPassiveTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${weaponPassiveSkill.name}</strong></div><div>${formattedDescription}</div>`;
    } else {
      weaponPassiveTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${weapon.name}</strong></div><div>Weapon passive not found</div>`;
    }
  } else {
    weaponPassiveTooltip.textContent = 'No weapon passive available';
  }
  
  // Update helm passive tooltip
  const helm = STATE.selected.gear['armors/head'];
  const helmPassiveSlot = document.querySelector('[data-key="helm-passive"]');
  let helmPassiveTooltip = helmPassiveSlot.querySelector('.ability-tooltip');
  if (!helmPassiveTooltip) {
    helmPassiveTooltip = document.createElement('div');
    helmPassiveTooltip.className = 'ability-tooltip';
    helmPassiveSlot.appendChild(helmPassiveTooltip);
  }
  if (helm && helm.passiveSkill) {
    const helmPassiveSkill = STATE.skills.find(s => s.id === helm.passiveSkill);
    if (helmPassiveSkill) {
      const formattedDescription = helmPassiveSkill.description.replace(/\n/g, '<br><br>');
      
      // Create skill tags for helm passive
      let skillTags = '';
      if (helmPassiveSkill.tags && helmPassiveSkill.tags.length > 0) {
        const allTags = helmPassiveSkill.tags.map(tag => {
          const tagClass = getTagClass(tag);
          let displayTag = tag;
          if (tag === 'cooldown_reduction') displayTag = 'cooldown';
          else if (tag === 'control_immunity') displayTag = 'control immunity';
          else if (tag === 'damage_immunity') displayTag = 'immunity';
          else if (tag === 'hard_control') displayTag = 'hard control';
          return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
        }).join(' ');
        skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
      }
      
      helmPassiveTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${helmPassiveSkill.name}</strong></div><div>${formattedDescription}</div>`;
    } else {
      helmPassiveTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${helm.name}</strong></div><div>Helm passive not found</div>`;
    }
  } else {
    helmPassiveTooltip.textContent = 'No helm passive available';
  }
  
  // Update weapon skill tooltip (W slot)
  const wSlot = document.querySelector('[data-key="W"]');
  let wTooltip = wSlot.querySelector('.ability-tooltip');
  if (!wTooltip) {
    wTooltip = document.createElement('div');
    wTooltip.className = 'ability-tooltip';
    wSlot.appendChild(wTooltip);
  }
  if (weapon) {
    if (weapon.coreSkill) {
      // New weapon system with core skill
      const coreSkill = STATE.skills.find(s => s.id === weapon.coreSkill);
      if (coreSkill) {
        const formattedDescription = coreSkill.description.replace(/\n/g, '<br><br>');
        
        // Create skill tags
        let skillTags = '';
        if (coreSkill.tags && coreSkill.tags.length > 0) {
          const allTags = coreSkill.tags.map(tag => {
            const tagClass = getTagClass(tag);
            let displayTag = tag;
            if (tag === 'cooldown_reduction') displayTag = 'cooldown';
            else if (tag === 'control_immunity') displayTag = 'control immunity';
            else if (tag === 'damage_immunity') displayTag = 'immunity';
            else if (tag === 'hard_control') displayTag = 'hard control';
            return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
          }).join(' ');
          skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
        }
        
        wTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${coreSkill.name}</strong></div><div>${formattedDescription}</div>`;
      } else {
        wTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${weapon.name}</strong></div><div>Core skill not found</div>`;
      }
    } else {
      // Fallback for old weapon format
    wTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${weapon.sub || weapon.name}</strong></div><div>${weapon.description || 'Weapon skill'}</div>`;
    }
  } else {
    wTooltip.textContent = 'No weapon equipped';
  }
  
  // Update chest skill tooltip (D slot)
  const chest = STATE.selected.gear['armors/chest'];
  const dSlot = document.querySelector('[data-key="D"]');
  let dTooltip = dSlot.querySelector('.ability-tooltip');
  if (!dTooltip) {
    dTooltip = document.createElement('div');
    dTooltip.className = 'ability-tooltip';
    dSlot.appendChild(dTooltip);
  }
  if (chest) {
    if (chest.coreSkill) {
      // New chest system with core skill
      const coreSkill = STATE.skills.find(s => s.id === chest.coreSkill);
      if (coreSkill) {
        const formattedDescription = coreSkill.description.replace(/\n/g, '<br><br>');
        
        // Create skill tags
        let skillTags = '';
        if (coreSkill.tags && coreSkill.tags.length > 0) {
          const allTags = coreSkill.tags.map(tag => {
            const tagClass = getTagClass(tag);
            let displayTag = tag;
            if (tag === 'cooldown_reduction') displayTag = 'cooldown';
            else if (tag === 'control_immunity') displayTag = 'control immunity';
            else if (tag === 'damage_immunity') displayTag = 'immunity';
            else if (tag === 'hard_control') displayTag = 'hard control';
            return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
          }).join(' ');
          skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
        }
        
        dTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${coreSkill.name}</strong></div><div>${formattedDescription}</div>`;
      } else {
        dTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${chest.name}</strong></div><div>Core skill not found</div>`;
      }
    } else {
      // Fallback for old chest format
      dTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${chest.sub || chest.name}</strong></div><div>${chest.description || 'Chest skill'}</div>`;
    }
  } else {
    dTooltip.textContent = 'No chest equipped';
  }
  
  // Update boots skill tooltip (F slot)
  const boots = STATE.selected.gear['armors/boots'];
  const fSlot = document.querySelector('[data-key="F"]');
  let fTooltip = fSlot.querySelector('.ability-tooltip');
  if (!fTooltip) {
    fTooltip = document.createElement('div');
    fTooltip.className = 'ability-tooltip';
    fSlot.appendChild(fTooltip);
  }
  if (boots) {
    if (boots.coreSkill) {
      // New boots system with core skill
      const coreSkill = STATE.skills.find(s => s.id === boots.coreSkill);
      if (coreSkill) {
        const formattedDescription = coreSkill.description.replace(/\n/g, '<br><br>');
        
        // Create skill tags
        let skillTags = '';
        if (coreSkill.tags && coreSkill.tags.length > 0) {
          const allTags = coreSkill.tags.map(tag => {
            const tagClass = getTagClass(tag);
            let displayTag = tag;
            if (tag === 'cooldown_reduction') displayTag = 'cooldown';
            else if (tag === 'control_immunity') displayTag = 'control immunity';
            else if (tag === 'damage_immunity') displayTag = 'immunity';
            else if (tag === 'hard_control') displayTag = 'hard control';
            return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
          }).join(' ');
          skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
        }
        
        fTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${coreSkill.name}</strong></div><div>${formattedDescription}</div>`;
      } else {
        fTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${boots.name}</strong></div><div>Core skill not found</div>`;
      }
    } else {
      // Fallback for old boots format
      fTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${boots.sub || boots.name}</strong></div><div>${boots.description || 'Boots skill'}</div>`;
    }
  } else {
    fTooltip.textContent = 'No boots equipped';
  }
  
  // Update ability slot A tooltip (basic attack)
  const aSlot = document.querySelector('[data-key="A"]');
  let aTooltip = aSlot.querySelector('.ability-tooltip');
  if (!aTooltip) {
    aTooltip = document.createElement('div');
    aTooltip.className = 'ability-tooltip';
    aSlot.appendChild(aTooltip);
  }
  const basicAttack = STATE.selected.gear['basic-attack'];
  if (basicAttack) {
    const formattedDescription = basicAttack.description.replace(/\n/g, '<br><br>');
    
    // Create skill tags
    let skillTags = '';
    if (basicAttack.tags && basicAttack.tags.length > 0) {
      const allTags = basicAttack.tags.map(tag => {
        const tagClass = getTagClass(tag);
        let displayTag = tag;
        if (tag === 'cooldown_reduction') displayTag = 'cooldown';
        else if (tag === 'control_immunity') displayTag = 'control immunity';
        else if (tag === 'damage_immunity') displayTag = 'immunity';
        else if (tag === 'hard_control') displayTag = 'hard control';
        return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
      }).join(' ');
      skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
    }
    
    aTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${basicAttack.name}</strong></div><div>${formattedDescription}</div>`;
  } else {
    aTooltip.textContent = 'No basic attack selected';
  }
  
  // Update ability slot Q tooltip (weapon skill)
  const qSlot = document.querySelector('[data-key="Q"]');
  let qTooltip = qSlot.querySelector('.ability-tooltip');
  if (!qTooltip) {
    qTooltip = document.createElement('div');
    qTooltip.className = 'ability-tooltip';
    qSlot.appendChild(qTooltip);
  }
  const weaponSkill = STATE.selected.gear['weapon-skill'];
  if (weaponSkill) {
    const formattedDescription = weaponSkill.description.replace(/\n/g, '<br><br>');
    
    // Create skill tags
    let skillTags = '';
    if (weaponSkill.tags && weaponSkill.tags.length > 0) {
      const allTags = weaponSkill.tags.map(tag => {
        const tagClass = getTagClass(tag);
        let displayTag = tag;
        if (tag === 'cooldown_reduction') displayTag = 'cooldown';
        else if (tag === 'control_immunity') displayTag = 'control immunity';
        else if (tag === 'damage_immunity') displayTag = 'immunity';
        else if (tag === 'hard_control') displayTag = 'hard control';
        return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
      }).join(' ');
      skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
    }
    
    qTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${weaponSkill.name}</strong></div><div>${formattedDescription}</div>`;
  } else {
    qTooltip.textContent = 'No weapon skill selected';
  }
  
  // Add hover positioning for all ability slots
  addTooltipPositioning();
}

function getAbilityCategory(ability) {
  if (!ability) return 'skill';
  
  // First check if ability has a category field
  if (ability.category) {
    return ability.category.toLowerCase();
  }
  
  // Check tags for category hints
  if (ability.tags && Array.isArray(ability.tags)) {
    const tags = ability.tags.map(tag => tag.toLowerCase());
    
    // Count different category types
    let categoryCounts = {
      damage: 0,
      healing: 0,
      support: 0,
      control: 0,
      defense: 0
    };
    
    // Damage tags
    if (tags.includes('damage') || tags.includes('attack') || tags.includes('strike') || 
        tags.includes('blast') || tags.includes('explosion')) {
      categoryCounts.damage++;
    }
    
    // Healing tags
    if (tags.includes('heal') || tags.includes('healing') || tags.includes('restore') || 
        tags.includes('recovery') || tags.includes('regeneration') || tags.includes('cure')) {
      categoryCounts.healing++;
    }
    
    // Support tags
    if (tags.includes('support') || tags.includes('buff') || tags.includes('debuff') || 
        tags.includes('shield') || tags.includes('protection') || tags.includes('boost') || 
        tags.includes('enhance') || tags.includes('utility')) {
      categoryCounts.support++;
    }
    
    // Control tags
    if (tags.includes('control') || tags.includes('slow') || tags.includes('stun') || 
        tags.includes('silence') || tags.includes('knockback') || tags.includes('root') || 
        tags.includes('fear') || tags.includes('charm')) {
      categoryCounts.control++;
    }
    
    // Defense tags
    if (tags.includes('defense') || tags.includes('defensive') || tags.includes('dodge') || 
        tags.includes('block') || tags.includes('parry') || tags.includes('resist')) {
      categoryCounts.defense++;
    }
    
    // Return the category with the most tags, or 'damage' if tied
    const maxCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b
    );
    
    // If we have multiple categories, prioritize damage > control > support > healing > defense
    if (categoryCounts.damage > 0 && categoryCounts.control > 0) {
      return 'damage'; // Damage + Control = Damage (primary)
    }
    if (categoryCounts.damage > 0) return 'damage';
    if (categoryCounts.control > 0) return 'control';
    if (categoryCounts.support > 0) return 'support';
    if (categoryCounts.healing > 0) return 'healing';
    if (categoryCounts.defense > 0) return 'defense';
  }
  
  // Fallback to description analysis
  const description = (ability.description || '').toLowerCase();
  const name = (ability.name || '').toLowerCase();
  
  // Check for healing keywords
  if (description.includes('heal') || description.includes('restore') || description.includes('recovery') || 
      description.includes('regeneration') || description.includes('cure') || name.includes('heal')) {
    return 'healing';
  }
  
  // Check for damage keywords
  if (description.includes('damage') || description.includes('attack') || description.includes('strike') || 
      description.includes('blast') || description.includes('explosion') || description.includes('pulse') ||
      name.includes('damage') || name.includes('attack') || name.includes('strike')) {
    return 'damage';
  }
  
  // Check for control keywords
  if (description.includes('slow') || description.includes('stun') || description.includes('silence') || 
      description.includes('knockback') || description.includes('root') || description.includes('fear') || 
      description.includes('charm') || description.includes('control') || name.includes('slow') || 
      name.includes('stun') || name.includes('silence')) {
    return 'control';
  }
  
  // Check for support keywords
  if (description.includes('buff') || description.includes('debuff') || description.includes('shield') || 
      description.includes('protection') || description.includes('boost') || description.includes('enhance') ||
      description.includes('support') || name.includes('buff') || name.includes('shield')) {
    return 'support';
  }
  
  // Check for defense keywords
  if (description.includes('dodge') || description.includes('block') || description.includes('parry') || 
      description.includes('resist') || description.includes('defense') || name.includes('dodge') || 
      name.includes('block') || name.includes('defense')) {
    return 'defense';
  }
  
  // Default to skill
  return 'skill';
}

function getTagClass(tag) {
  const tagLower = tag.toLowerCase();
  switch (tagLower) {
    // New simplified tag system
    case 'physical damage':
      return 'tag-physical-damage';
    case 'magic damage':
      return 'tag-magic-damage';
    case 'dot':
      return 'tag-dot';
    case 'immunity':
      return 'tag-immunity';
    case 'slow':
      return 'tag-slow';
    case 'aoe':
      return 'tag-aoe';
    case 'passive':
      return 'tag-passive';
    case 'crit':
      return 'tag-crit';
    case 'bleed':
      return 'tag-bleed';
    case 'stealth':
      return 'tag-stealth';
    case 'mobility':
      return 'tag-mobility';
    case 'dodge':
      return 'tag-dodge';
    case 'mp':
      return 'tag-mp';
    case 'disarm':
      return 'tag-disarm';
    case 'debuff':
      return 'tag-debuff';
    case 'heal':
      return 'tag-heal';
    case 'buff':
      return 'tag-buff';
    case 'attack speed':
      return 'tag-attack-speed';
    case 'lifesteal':
      return 'tag-lifesteal';
    case 'movement speed':
      return 'tag-movement-speed';
    case 'shield':
      return 'tag-shield';
    case 'damage increase':
      return 'tag-damage-increase';
    case 'cooldown':
      return 'tag-cooldown';
    case 'stun':
      return 'tag-stun';
    case 'resistance':
      return 'tag-resistance';
    case 'cc':
      return 'tag-cc';
    case 'channeling':
      return 'tag-channeling';
    
    // Legacy support for old tag names
    case 'damage':
      return 'tag-physical-damage';
    case 'healing':
      return 'tag-heal';
    case 'critical':
      return 'tag-crit';
    case 'hard_control':
    case 'control':
      return 'tag-cc';
    case 'debuff':
      return 'tag-default';
    case 'teleport':
      return 'tag-mobility';
    case 'defense':
    case 'defensive':
      return 'tag-resistance';
    case 'utility':
      return 'tag-default';
    case 'cooldown_reduction':
      return 'tag-cooldown';
    case 'control_immunity':
      return 'tag-immunity';
    case 'damage_immunity':
      return 'tag-immunity';
    case 'knockback':
      return 'tag-cc';
    case 'silence':
      return 'tag-cc';
    case 'dodge':
      return 'tag-mobility';
    case 'armor':
      return 'tag-resistance';
    case 'area':
      return 'tag-aoe';
    case 'magic':
      return 'tag-magic-damage';
    case 'physical':
      return 'tag-physical-damage';
    case 'support':
      return 'tag-buff';
    case 'tank':
      return 'tag-resistance';
    case 'skill':
      return 'tag-default';
    case 'immobilize':
      return 'tag-cc';
    case 'pull':
      return 'tag-cc';
    case 'summon':
      return 'tag-default';
    case 'stacking':
      return 'tag-dot';
    case 'melee':
      return 'tag-physical-damage';
    case 'elemental':
      return 'tag-magic-damage';
    case 'coordination':
      return 'tag-buff';
    case 'illusion':
      return 'tag-stealth';
    case 'mp':
      return 'tag-default';
    case 'dispel':
      return 'tag-default';
    case 'cleanse':
      return 'tag-default';
    default:
      return 'tag-default';
  }
}

function createGlobalTooltip() {
  if (globalTooltip) return globalTooltip;
  
  globalTooltip = document.createElement('div');
  globalTooltip.id = 'global-tooltip';
  globalTooltip.style.cssText = `
    position: fixed;
    background: var(--bg-elev);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px 24px;
    font-size: 0.9rem;
    color: var(--text);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    z-index: 9999;
    display: none;
    max-width: 400px;
    white-space: normal;
    text-align: left;
    line-height: 1.6;
    pointer-events: none;
  `;
  document.body.appendChild(globalTooltip);
  return globalTooltip;
}

// Helper functions for showing/hiding elements with CSS classes
function showElement(element) {
  if (element) {
    element.classList.remove('hidden');
  }
}

function hideElement(element) {
  if (element) {
    element.classList.add('hidden');
  }
}

function toggleElement(element, show) {
  if (element) {
    if (show) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  }
}

function addTooltipPositioning() {
  const abilitySlots = document.querySelectorAll('.ability-slot');
  const tooltip = createGlobalTooltip();
  
  abilitySlots.forEach((slot, index) => {
    const slotTooltip = slot.querySelector('.ability-tooltip');
    if (!slotTooltip) return;
    
    slot.addEventListener('mouseenter', (e) => {
      // Check if any cascade is open
      const openCascade = document.querySelector('.skill-cascade');
      if (openCascade) return; // Don't show tooltip if cascade is open
      
      // Copy content from slot tooltip to global tooltip
      tooltip.innerHTML = slotTooltip.innerHTML;
      
      // Show global tooltip
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      
      // Position above slot
      const slotRect = slot.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top = slotRect.top - tooltipRect.height - 10;
      let left = slotRect.left + (slotRect.width / 2) - (tooltipRect.width / 2);
      
      // Keep within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) {
        top = slotRect.bottom + 10;
      }
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    });
    
    slot.addEventListener('mouseleave', (e) => {
      tooltip.style.display = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });
  });
}

function clearDrifterAbilities() {
  // Clear drifter passive slot
  const passiveSlot = document.querySelector('.drifter-passive .ability-icon');
  passiveSlot.style.backgroundImage = '';
  passiveSlot.parentElement.classList.add('empty');
  
  // Clear all ability slots (A, Q, W, E, D, F)
  const abilitySlots = document.querySelectorAll('.ability-slot');
  abilitySlots.forEach(slot => {
    const icon = slot.querySelector('.ability-icon');
    if (icon) {
      icon.style.backgroundImage = '';
      slot.classList.add('empty');
    }
  });
}

// Loadout Save/Load/Export/Import/Share Functions
function exportLoadout(event) {
  // Create compact loadout object with only essential data
  const loadout = {
    v: '1.0', // version
    d: STATE.selected.drifters[0]?.gameId || null, // drifter
    s: selectedSupports.map(support => support?.gameId || null), // support drifters
    g: {}, // gear
    m: {}, // mods
    l: parseInt(document.getElementById('masteryLevel')?.textContent || '1') // mastery level
  };
  
  // Only include selected gear
  Object.keys(STATE.selected.gear).forEach(key => {
    if (STATE.selected.gear[key]) {
      // Skills use .id, other items use .gameId
      if (key === 'basic-attack' || key === 'weapon-skill') {
        loadout.g[key] = STATE.selected.gear[key].id;
      } else {
        loadout.g[key] = STATE.selected.gear[key].gameId;
      }
    }
  });
  
  // Only include selected mods
  Object.keys(STATE.selected.mods).forEach(key => {
    if (STATE.selected.mods[key]) {
      loadout.m[key] = STATE.selected.mods[key].gameId;
    }
  });
  
  const dataStr = JSON.stringify(loadout);
  const encodedData = btoa(dataStr);
  
  // Show modal with the code string near the clicked button
  showLoadoutCodeModal(encodedData, 'Export Loadout', false, event.target);
}

function importLoadout(event) {
  // Show modal for entering loadout code near the clicked button
  showLoadoutCodeModal('', 'Import Loadout', true, event.target);
}

function shareToDiscord(event) {
  // Create Discord-friendly build text (text-only)
  const drifter = STATE.selected.drifters[0];
  if (!drifter) {
    showToast('Please select a drifter first', 'error');
    return;
  }

  let buildText = `**${drifter.name} Build**\n\n`;
  
  // Add drifter info
  buildText += `**Drifter:** ${drifter.name}\n`;
  
  // Add support drifters
  if (selectedSupports.length > 0) {
    const supportNames = selectedSupports
      .filter(support => support)
      .map(support => support.name)
      .join(', ');
    if (supportNames) {
      buildText += `**Supports:** ${supportNames}\n`;
    }
  }
  
  buildText += `\n**Equipment:**\n`;
  
  // Add weapon
  const weapon = STATE.selected.gear['weapons'];
  if (weapon) {
    buildText += `• **Weapon:** ${weapon.name}\n`;
  }
  
  // Add armor pieces
  const helm = STATE.selected.gear['armors/head'];
  const chest = STATE.selected.gear['armors/chest'];
  const boots = STATE.selected.gear['armors/boots'];
  
  if (helm) buildText += `• **Helm:** ${helm.name}\n`;
  if (chest) buildText += `• **Chest:** ${chest.name}\n`;
  if (boots) buildText += `• **Boots:** ${boots.name}\n`;
  
  // Add mods
  const weaponMod = STATE.selected.mods.weaponMod;
  const helmMod = STATE.selected.mods.helmMod;
  const chestMod = STATE.selected.mods.chestMod;
  const bootsMod = STATE.selected.mods.bootsMod;
  
  if (weaponMod || helmMod || chestMod || bootsMod) {
    buildText += `\n**Mods:**\n`;
    if (weaponMod) buildText += `• **Weapon Mod:** ${weaponMod.name}\n`;
    if (helmMod) buildText += `• **Helm Mod:** ${helmMod.name}\n`;
    if (chestMod) buildText += `• **Chest Mod:** ${chestMod.name}\n`;
    if (bootsMod) buildText += `• **Boots Mod:** ${bootsMod.name}\n`;
  }
  
  // Add skills
  const basicAttack = STATE.selected.gear['basic-attack'];
  const weaponSkill = STATE.selected.gear['weapon-skill'];
  
  if (basicAttack || weaponSkill) {
    buildText += `\n**Skills:**\n`;
    if (basicAttack) buildText += `• **Basic Attack:** ${basicAttack.name}\n`;
    if (weaponSkill) buildText += `• **Weapon Skill:** ${weaponSkill.name}\n`;
  }
  
  buildText += `\n*Generated with Warborne Loadout Builder*`;
  
  // Show modal with Discord-friendly text (text-only by default)
  showDiscordShareModal(buildText, event.target, false);
}

function generateBuildImage(event) {
  const drifter = STATE.selected.drifters[0];
  if (!drifter) {
    showToast('Please select a drifter first', 'error');
    return;
  }

  showToast('Generating build image...', 'info');
  
  // Target the main loadout section up to skills (excluding mastery section)
  const loadoutSection = document.querySelector('.loadout-layout');
  const abilityBar = document.querySelector('.ability-bar');
  
  // Create a container that includes loadout + ability bar
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.background = '#2a2a2a';
  container.style.padding = '20px';
  container.style.borderRadius = '8px';
  // Let the content determine the width naturally
  
  // Clone the sections we want
  const loadoutClone = loadoutSection.cloneNode(true);
  const abilityClone = abilityBar.cloneNode(true);
  
  // Ensure item names are populated in the cloned elements
  populateItemNames(loadoutClone);
  
  container.appendChild(loadoutClone);
  container.appendChild(abilityClone);
  document.body.appendChild(container);
  
  // Generate the image
  html2canvas(container, {
    backgroundColor: '#2a2a2a',
    scale: 2,
    useCORS: true,
    allowTaint: true
    // Let html2canvas determine the natural dimensions
  }).then(canvas => {
    // Create download link
    const link = document.createElement('a');
    link.download = `${drifter.name}-build.png`;
    link.href = canvas.toDataURL();
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    document.body.removeChild(container);
    
    showToast('Build image downloaded!', 'success');
  }).catch(error => {
    console.error('Error generating image:', error);
    showToast('Failed to generate image', 'error');
    document.body.removeChild(container);
  });
}

function populateItemNames(container) {
  // Get all slot cards in the container
  const slotCards = container.querySelectorAll('.slot-card');
  
  slotCards.forEach(card => {
    const slot = card.closest('.slot');
    const slotKey = slot.dataset.slot;
    
    // Find the corresponding item
    let item = null;
    if (slotKey === 'weapon') {
      item = STATE.selected.gear['weapons'];
    } else if (slotKey === 'helm') {
      item = STATE.selected.gear['armors/head'];
    } else if (slotKey === 'chest') {
      item = STATE.selected.gear['armors/chest'];
    } else if (slotKey === 'boots') {
      item = STATE.selected.gear['armors/boots'];
    } else if (slotKey === 'weaponMod') {
      item = STATE.selected.mods.weaponMod;
    } else if (slotKey === 'helmMod') {
      item = STATE.selected.mods.helmMod;
    } else if (slotKey === 'chestMod') {
      item = STATE.selected.mods.chestMod;
    } else if (slotKey === 'bootsMod') {
      item = STATE.selected.mods.bootsMod;
    }
    
    // Update the name element
    const nameElement = card.querySelector('.item-name');
    if (nameElement && item) {
      nameElement.textContent = item.name || '';
    } else if (nameElement) {
      nameElement.textContent = '';
    }
  });
}


function shareLoadout() {
  // Create compact loadout object with only essential data
  const loadout = {
    v: '1.0', // version
    d: STATE.selected.drifters[0]?.gameId || null, // drifter
    s: selectedSupports.map(support => support?.gameId || null), // support drifters
    g: {}, // gear
    m: {}, // mods
    l: parseInt(document.getElementById('masteryLevel')?.textContent || '1') // mastery level
  };
  
  // Only include selected gear
  Object.keys(STATE.selected.gear).forEach(key => {
    if (STATE.selected.gear[key]) {
      // Skills use .id, other items use .gameId
      if (key === 'basic-attack' || key === 'weapon-skill') {
        loadout.g[key] = STATE.selected.gear[key].id;
      } else {
        loadout.g[key] = STATE.selected.gear[key].gameId;
      }
    }
  });
  
  // Only include selected mods
  Object.keys(STATE.selected.mods).forEach(key => {
    if (STATE.selected.mods[key]) {
      loadout.m[key] = STATE.selected.mods[key].gameId;
    }
  });
  
  const dataStr = JSON.stringify(loadout);
  const encodedData = btoa(dataStr);
  const shareUrl = `${window.location.origin}${window.location.pathname}?loadout=${encodedData}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    showToast('Loadout link copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Loadout link copied to clipboard!', 'success');
  });
}

function loadLoadoutData(loadout) {
  try {
    // Validate loadout structure
    if (!loadout || typeof loadout !== 'object') {
      throw new Error('Invalid loadout data');
    }
    
    // Handle both old and new format
    const isNewFormat = loadout.v !== undefined;
    
    // Load drifter
    const drifterId = isNewFormat ? loadout.d : loadout.drifter;
    if (drifterId) {
      const drifter = STATE.drifters.find(d => d.gameId === drifterId);
      if (drifter) {
        STATE.selected.drifters = [drifter];
        updateAvatar();
      }
    }
    
    // Load support drifters
    const supportDrifters = isNewFormat ? loadout.s : loadout.supportDrifters;
    if (supportDrifters && Array.isArray(supportDrifters)) {
      // Clear existing support drifters
      selectedSupports = new Array(5).fill(null);
      
      // Load support drifters
      supportDrifters.forEach((supportId, index) => {
        if (supportId && index < 5) {
          const supportDrifter = STATE.drifters.find(d => d.gameId === supportId);
          if (supportDrifter) {
            selectedSupports[index] = supportDrifter;
            addSupportDrifter(supportDrifter, index);
          }
        }
      });
    } else {
      // Clear support drifters if none in loadout
      selectedSupports = new Array(5).fill(null);
      updateSupportDescriptions();
    }
    
    // Load gear
    const gearData = isNewFormat ? loadout.g : loadout.gear;
    if (gearData) {
      Object.keys(gearData).forEach(key => {
        const gameId = gearData[key];
        if (gameId) {
          // Find the item in the appropriate gear category
          let item = null;
          if (key === 'weapons') {
            item = STATE.gear.weapons.find(w => w.gameId === gameId);
          } else if (key === 'armors/head') {
            item = STATE.gear['armors/head'].find(h => h.gameId === gameId);
          } else if (key === 'armors/chest') {
            item = STATE.gear['armors/chest'].find(c => c.gameId === gameId);
          } else if (key === 'armors/boots') {
            item = STATE.gear['armors/boots'].find(b => b.gameId === gameId);
            } else if (key === 'basic-attack' || key === 'weapon-skill') {
              // Handle weapon ability slots (A and Q)
              item = STATE.skills.find(s => s.id === gameId);
            }
            
            if (item) {
              STATE.selected.gear[key] = item;
            }
        }
      });
    }
    
    // Load mods
    const modsData = isNewFormat ? loadout.m : loadout.mods;
    if (modsData) {
      Object.keys(modsData).forEach(key => {
        const gameId = modsData[key];
        if (gameId) {
          // Find the mod in weapon or armor mods
          let mod = STATE.mods.weapon.find(m => m.gameId === gameId);
          if (!mod) {
            mod = STATE.mods.armor.find(m => m.gameId === gameId);
          }
          
          if (mod) {
            STATE.selected.mods[key] = mod;
          }
        }
      });
    }
    
    // Load mastery level
    const masteryLevel = isNewFormat ? loadout.l : loadout.masteryLevel;
    if (masteryLevel) {
      const masteryLevelEl = document.getElementById('masteryLevel');
      if (masteryLevelEl) {
        masteryLevelEl.textContent = masteryLevel.toString();
      }
    }
    
    // Update the UI
    populateLoadoutBoard();
    updateSupportEffects(STATE.selected.drifters[0]);
    
  } catch (error) {
    console.error('Error loading loadout:', error);
    showToast('Error loading loadout data', 'error');
  }
}

function saveLoadout() {
  const loadoutName = prompt('Enter a name for this loadout:');
  if (!loadoutName || loadoutName.trim() === '') return;
  
  const loadout = {
    id: Date.now().toString(),
    name: loadoutName.trim(),
    version: '1.0',
    timestamp: new Date().toISOString(),
    drifter: STATE.selected.drifters[0] || null,
    supportDrifters: selectedSupports.map(support => support || null),
    gear: STATE.selected.gear || {},
    mods: STATE.selected.mods || {},
    masteryLevel: parseInt(document.getElementById('masteryLevel')?.textContent || '1')
  };
  
  // Get existing saved loadouts
  const savedLoadouts = JSON.parse(localStorage.getItem('warborneLoadouts') || '[]');
  
  // Check if loadout with this name already exists
  const existingIndex = savedLoadouts.findIndex(l => l.name === loadout.name);
  if (existingIndex !== -1) {
    if (!confirm(`A loadout named "${loadout.name}" already exists. Overwrite it?`)) {
      return;
    }
    savedLoadouts[existingIndex] = loadout;
  } else {
    savedLoadouts.push(loadout);
  }
  
  // Save to localStorage
  localStorage.setItem('warborneLoadouts', JSON.stringify(savedLoadouts));
  showToast(`Loadout "${loadout.name}" saved!`, 'success');
}

function loadLoadout(event) {
  const savedLoadouts = JSON.parse(localStorage.getItem('warborneLoadouts') || '[]');
  
  if (savedLoadouts.length === 0) {
    showToast('No saved loadouts found', 'info');
    return;
  }
  
  showLoadoutModal(savedLoadouts, event?.target);
}

function showLoadoutModal(loadouts, clickedButton) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'loadout-modal';
  modal.innerHTML = `
    <div class="loadout-modal-content">
      <div class="loadout-modal-header">
        <h3 class="loadout-modal-title">Load Saved Loadout</h3>
        <button class="loadout-modal-close" onclick="this.closest('.loadout-modal').remove()">×</button>
      </div>
      <div class="loadout-list" id="loadoutList">
        ${loadouts.map(loadout => `
          <div class="loadout-item" data-loadout-id="${loadout.id}">
            <div>
              <div class="loadout-name">${loadout.name}</div>
              <div class="loadout-date">${new Date(loadout.timestamp).toLocaleDateString()}</div>
            </div>
            <div class="loadout-actions">
              <button class="loadout-action-btn" onclick="loadSelectedLoadout('${loadout.id}')">Load</button>
              <button class="loadout-action-btn delete" onclick="deleteLoadout('${loadout.id}')">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="loadout-modal-actions">
        <button class="loadout-modal-btn secondary" onclick="this.closest('.loadout-modal').remove()">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Position modal near the clicked button
  if (clickedButton) {
    const buttonRect = clickedButton.getBoundingClientRect();
    const modalContent = modal.querySelector('.loadout-modal-content');
    
    // Position modal to the right of the button, or below if not enough space
    const spaceRight = window.innerWidth - buttonRect.right;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    
    if (spaceRight > 300) {
      // Position to the right
      modalContent.style.position = 'fixed';
      modalContent.style.left = `${buttonRect.right + 10}px`;
      modalContent.style.top = `${buttonRect.top}px`;
      modalContent.style.transform = 'none';
    } else if (spaceBelow > 200) {
      // Position below
      modalContent.style.position = 'fixed';
      modalContent.style.left = `${buttonRect.left}px`;
      modalContent.style.top = `${buttonRect.bottom + 10}px`;
      modalContent.style.transform = 'none';
    } else {
      // Center if no space
      modalContent.style.position = 'fixed';
      modalContent.style.left = '50%';
      modalContent.style.top = '50%';
      modalContent.style.transform = 'translate(-50%, -50%)';
    }
  }
  
  // Add click handlers
  modal.querySelectorAll('.loadout-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('loadout-action-btn')) {
        loadSelectedLoadout(item.dataset.loadoutId);
      }
    });
  });
}

function showLoadoutCodeModal(code, title, isImport = false, clickedButton = null) {
  // Create modal with proper z-index and background
  const modal = document.createElement('div');
  modal.className = 'loadout-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  modal.innerHTML = `
    <div class="loadout-modal-content" style="
      max-width: 500px; 
      width: 90vw; 
      background: var(--bg-elev-2);
      border: 1px solid var(--border);
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 10001;
    ">
      <div class="loadout-modal-header" style="
        padding: 15px 20px;
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h3 class="loadout-modal-title" style="margin: 0; color: #ffffff; font-size: 1.1em;">${title}</h3>
        <button class="loadout-modal-close" onclick="this.closest('.loadout-modal').remove()" style="
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1.5em;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        " onmouseover="this.style.backgroundColor='var(--border)'" onmouseout="this.style.backgroundColor='transparent'">×</button>
      </div>
      <div style="padding: 20px;">
        ${isImport ? `
          <label for="loadoutCodeInput" style="display: block; margin-bottom: 10px; font-weight: bold; font-size: 0.9em; color: #ffffff;">Paste your loadout code:</label>
          <textarea id="loadoutCodeInput" placeholder="Paste your loadout code here..." 
            style="width: 100%; height: 120px; padding: 10px; border: 1px solid #666; 
                   background: #1a1a1a; color: #ffffff !important; border-radius: 4px; 
                   font-family: monospace; resize: vertical; font-size: 0.8em;
                   box-sizing: border-box; outline: none;"></textarea>
        ` : `
          <label for="loadoutCodeDisplay" style="display: block; margin-bottom: 10px; font-weight: bold; font-size: 0.9em; color: #ffffff;">Your loadout code:</label>
          <textarea id="loadoutCodeDisplay" readonly 
            style="width: 100%; height: 120px; padding: 10px; border: 1px solid #666; 
                   background: #1a1a1a; color: #ffffff !important; border-radius: 4px; 
                   font-family: monospace; resize: vertical; font-size: 0.8em;
                   box-sizing: border-box; cursor: text; outline: none;">${code}</textarea>
        `}
      </div>
      <div class="loadout-modal-actions" style="
        padding: 0 20px 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      ">
        ${isImport ? `
          <button class="loadout-modal-btn secondary" onclick="this.closest('.loadout-modal').remove()" style="
            padding: 8px 16px;
            border: 1px solid var(--border);
            background: var(--bg-elev-2);
            color: #ffffff;
            border-radius: 4px;
            cursor: pointer;
          ">Cancel</button>
          <button class="loadout-modal-btn" onclick="importFromCode()" style="
            padding: 8px 16px;
            border: 1px solid var(--accent);
            background: var(--accent);
            color: white;
            border-radius: 4px;
            cursor: pointer;
          ">Import Loadout</button>
        ` : `
          <button class="loadout-modal-btn" onclick="copyLoadoutCode()" style="
            padding: 8px 16px;
            border: 1px solid var(--accent);
            background: var(--accent);
            color: white;
            border-radius: 4px;
            cursor: pointer;
          ">Copy Code</button>
          <button class="loadout-modal-btn secondary" onclick="this.closest('.loadout-modal').remove()" style="
            padding: 8px 16px;
            border: 1px solid var(--border);
            background: var(--bg-elev-2);
            color: #ffffff;
            border-radius: 4px;
            cursor: pointer;
          ">Close</button>
        `}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close modal with Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
        // Focus on input if importing
        if (isImport) {
          setTimeout(() => {
            const input = modal.querySelector('#loadoutCodeInput');
            if (input) input.focus();
          }, 100);
        } else {
          // Select all text if exporting
          setTimeout(() => {
            const textarea = modal.querySelector('#loadoutCodeDisplay');
            if (textarea) {
              textarea.value = code;
              textarea.style.color = '#ffffff';
              textarea.style.backgroundColor = '#1a1a1a';
              textarea.select();
              textarea.focus();
            }
          }, 100);
        }
}

function copyLoadoutCode() {
  const textarea = document.querySelector('#loadoutCodeDisplay');
  if (textarea) {
    textarea.select();
    document.execCommand('copy');
    showToast('Loadout code copied to clipboard!', 'success');
  }
}

function showDiscordShareModal(buildText, clickedButton = null, hasImages = false) {
  // Create modal with proper z-index and background
  const modal = document.createElement('div');
  modal.className = 'loadout-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  modal.innerHTML = `
    <div class="loadout-modal-content" style="
      max-width: 600px; 
      width: 90vw; 
      background: var(--bg-elev-2);
      border: 1px solid var(--border);
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 10001;
    ">
      <div class="loadout-modal-header" style="
        padding: 15px 20px;
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h3 class="loadout-modal-title" style="margin: 0; color: #ffffff; font-size: 1.1em;">Share to Discord</h3>
        <button class="loadout-modal-close" onclick="this.closest('.loadout-modal').remove()" style="
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1.5em;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        " onmouseover="this.style.backgroundColor='var(--border)'" onmouseout="this.style.backgroundColor='transparent'">×</button>
      </div>
      <div style="padding: 20px;">
        <label for="discordBuildText" style="display: block; margin-bottom: 10px; font-weight: bold; font-size: 0.9em; color: #ffffff;">Copy this text to share your build in Discord:</label>
        <textarea id="discordBuildText" readonly 
          style="width: 100%; height: 300px; padding: 10px; border: 1px solid #666; 
                 background: #1a1a1a; color: #ffffff !important; border-radius: 4px; 
                 font-family: monospace; resize: vertical; font-size: 0.8em;
                 box-sizing: border-box; cursor: text; outline: none; white-space: pre-wrap;">${buildText}</textarea>
      </div>
      <div class="loadout-modal-actions" style="
        padding: 0 20px 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      ">
        <button class="loadout-modal-btn" onclick="copyDiscordBuild()" style="
          padding: 8px 16px;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: white;
          border-radius: 4px;
          cursor: pointer;
        ">Copy to Clipboard</button>
        <button class="loadout-modal-btn secondary" onclick="this.closest('.loadout-modal').remove()" style="
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: var(--bg-elev-2);
          color: #ffffff;
          border-radius: 4px;
          cursor: pointer;
        ">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const textarea = modal.querySelector('#discordBuildText');
  
  // Focus and select text
  setTimeout(() => {
    if (textarea) {
      textarea.value = buildText;
      textarea.style.color = '#ffffff';
      textarea.style.backgroundColor = '#1a1a1a';
      textarea.select();
      textarea.focus();
    }
  }, 100);
}

function copyDiscordBuild() {
  const textarea = document.querySelector('#discordBuildText');
  if (textarea) {
    textarea.select();
    document.execCommand('copy');
    showToast('Build text copied to clipboard!', 'success');
  }
}


function importFromCode() {
  const textarea = document.querySelector('#loadoutCodeInput');
  if (!textarea) return;
  
  const code = textarea.value.trim();
  if (!code) {
    showToast('Please enter a loadout code', 'error');
    return;
  }
  
  try {
    const decodedData = atob(code);
    const loadout = JSON.parse(decodedData);
    loadLoadoutData(loadout);
    showToast('Loadout imported successfully!', 'success');
    
    // Close modal
    const modal = document.querySelector('.loadout-modal');
    if (modal) modal.remove();
  } catch (error) {
    console.error('Error parsing loadout code:', error);
    showToast('Error: Invalid loadout code format', 'error');
  }
}

function loadSelectedLoadout(loadoutId) {
  const savedLoadouts = JSON.parse(localStorage.getItem('warborneLoadouts') || '[]');
  const loadout = savedLoadouts.find(l => l.id === loadoutId);
  
  if (loadout) {
    loadLoadoutData(loadout);
    document.querySelector('.loadout-modal')?.remove();
    showToast(`Loaded loadout: ${loadout.name}`, 'success');
  }
}

function deleteLoadout(loadoutId) {
  if (!confirm('Are you sure you want to delete this loadout?')) return;
  
  const savedLoadouts = JSON.parse(localStorage.getItem('warborneLoadouts') || '[]');
  const filteredLoadouts = savedLoadouts.filter(l => l.id !== loadoutId);
  
  localStorage.setItem('warborneLoadouts', JSON.stringify(filteredLoadouts));
  
  // Refresh the modal
  const modal = document.querySelector('.loadout-modal');
  if (modal) {
    modal.remove();
    loadLoadout();
  }
  
  showToast('Loadout deleted', 'success');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Check for loadout in URL parameters on page load
function checkForSharedLoadout() {
  const urlParams = new URLSearchParams(window.location.search);
  const loadoutData = urlParams.get('loadout');
  
  if (loadoutData) {
    try {
      const loadout = JSON.parse(atob(loadoutData));
      loadLoadoutData(loadout);
      showToast('Shared loadout loaded!', 'success');
      
      // Clean up URL
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } catch (error) {
      console.error('Error loading shared loadout:', error);
      showToast('Error loading shared loadout', 'error');
    }
  }
}








function createToast() {
  const element = document.createElement('div');
  element.className = 'toast';
  let timer;

  return {
    element,
    notify(message) {
      element.textContent = message;
      element.classList.add('visible');
      clearTimeout(timer);
      timer = setTimeout(() => element.classList.remove('visible'), 2000);
    }
  };
}

// Mastery system functions
function showMasterySection() {
  if (masterySection) {
    showElement(masterySection);
  }
}

function hideMasterySection() {
  if (masterySection) {
    hideElement(masterySection);
  }
}

function updateMasteryDisplay() {
  if (!STATE.mastery.currentDrifter) {
    hideMasterySection();
    return;
  }

  const drifter = STATE.mastery.currentDrifter;
  const level = STATE.mastery.level;
  
  // Calculate current attribute values with mastery bonuses
  
  const strengthBonusValue = (drifter.masteryBonuses?.strength || 0) * (level - 1);
  const agilityBonusValue = (drifter.masteryBonuses?.agility || 0) * (level - 1);
  const intelligenceBonusValue = (drifter.masteryBonuses?.intelligence || 0) * (level - 1);
  
  const strengthTotal = Math.round((drifter.basicAttributes.strength + strengthBonusValue) * 10) / 10;
  const agilityTotal = Math.round((drifter.basicAttributes.agility + agilityBonusValue) * 10) / 10;
  const intelligenceTotal = Math.round((drifter.basicAttributes.intelligence + intelligenceBonusValue) * 10) / 10;

  // Update basic attributes
  if (strengthValue) strengthValue.textContent = strengthTotal;
  if (agilityValue) agilityValue.textContent = agilityTotal;
  if (intelligenceValue) intelligenceValue.textContent = intelligenceTotal;

  // Update bonus values (green numbers) - show per-level bonus
  
  if (strengthBonus) {
    const perLevelBonus = drifter.masteryBonuses?.strength || 0;
    strengthBonus.textContent = `(+${perLevelBonus.toFixed(1)})`;
  }
  if (agilityBonus) {
    const perLevelBonus = drifter.masteryBonuses?.agility || 0;
    agilityBonus.textContent = `(+${perLevelBonus.toFixed(1)})`;
  }
  if (intelligenceBonus) {
    const perLevelBonus = drifter.masteryBonuses?.intelligence || 0;
    intelligenceBonus.textContent = `(+${perLevelBonus.toFixed(1)})`;
  }

  // Calculate derived stats based on attribute increases
  const strengthIncrease = strengthBonusValue;
  const agilityIncrease = agilityBonusValue;
  const intelligenceIncrease = intelligenceBonusValue;

  // Calculate stat bonuses from attribute increases
  const maxHpBonusIncrease = strengthIncrease * 0.25; // +0.25% per strength point
  const controlResistanceIncrease = strengthIncrease * 0.1; // +0.1 per strength point
  const blockIncrease = strengthIncrease * 0.5; // +0.5 per strength point
  const pveDamageIncrease = strengthIncrease * 0.1; // +0.1% per strength point

  const tenacityPenetrationIncrease = agilityIncrease * 0.15; // +0.15 per agility point
  const criticalRateIncrease = agilityIncrease * 0.05; // +0.05% per agility point
  const attackSpeedIncrease = agilityIncrease * 0.18; // +0.18% per agility point
  const armorIncrease = agilityIncrease * 0.15; // +0.15 per agility point
  const physicalDamageIncrease = agilityIncrease * 0.25; // +0.25% per agility point

  const healingBonusIncrease = intelligenceIncrease * 0.25; // +0.25% per intelligence point
  const cooldownRateIncrease = intelligenceIncrease * 0.06; // +0.06% per intelligence point
  const castingSpeedIncrease = intelligenceIncrease * 0.3; // +0.3% per intelligence point
  const magicResistanceIncrease = intelligenceIncrease * 0.15; // +0.15 per intelligence point
  const magicDamageIncrease = intelligenceIncrease * 0.25; // +0.25% per intelligence point

  // Calculate total stats (base from JSON + mastery increases)
  const totalMaxHpBonus = (parseFloat(drifter.stats?.maxHpBonus?.replace('%', '') || '0') + maxHpBonusIncrease).toFixed(2);
  const totalAttackSpeedBonus = (parseFloat(drifter.stats?.attackSpeedBonus?.replace('%', '') || '0') + attackSpeedIncrease).toFixed(2);
  const totalCriticalRate = (parseFloat(drifter.stats?.criticalRate?.replace('%', '') || '0') + criticalRateIncrease).toFixed(2);
  const totalCastingSpeedBonus = (parseFloat(drifter.stats?.castingSpeedBonus?.replace('%', '') || '0') + castingSpeedIncrease).toFixed(2);
  const totalSkillCooldownRateBonus = (parseFloat(drifter.stats?.skillCooldownRateBonus?.replace('%', '') || '0') + cooldownRateIncrease).toFixed(2);
  const totalDamageBonusPvE = (parseFloat(drifter.stats?.damageBonusPvE?.replace('%', '') || '0') + pveDamageIncrease).toFixed(2);
  const totalPhysicalDamageBonus = (parseFloat(drifter.stats?.physicalDamageBonus?.replace('%', '') || '0') + physicalDamageIncrease).toFixed(2);
  const totalMagicDamageBonus = (parseFloat(drifter.stats?.magicDamageBonus?.replace('%', '') || '0') + magicDamageIncrease).toFixed(2);
  const totalHealingBonus = (parseFloat(drifter.stats?.healingBonus?.replace('%', '') || '0') + healingBonusIncrease).toFixed(2);
  const totalArmor = (parseFloat(drifter.stats?.armor || '0') + armorIncrease).toFixed(2);
  const totalMagicResistance = (parseFloat(drifter.stats?.magicResistance || '0') + magicResistanceIncrease).toFixed(2);
  const totalControlResistance = (parseFloat(drifter.stats?.controlResistance || '0') + controlResistanceIncrease).toFixed(2);
  const totalBlock = (parseFloat(drifter.stats?.block || '0') + blockIncrease).toFixed(2);
  const totalTenacityPenetration = (parseFloat(drifter.stats?.tenacityPenetration || '0') + tenacityPenetrationIncrease).toFixed(2);

  // Update all other stats with calculated totals
  if (maxHpBonus) maxHpBonus.textContent = totalMaxHpBonus + '%';
  
  if (attackSpeedBonus) attackSpeedBonus.textContent = totalAttackSpeedBonus + '%';
  if (criticalRate) criticalRate.textContent = totalCriticalRate + '%';
  if (castingSpeedBonus) castingSpeedBonus.textContent = totalCastingSpeedBonus + '%';
  if (skillCooldownRateBonus) skillCooldownRateBonus.textContent = totalSkillCooldownRateBonus + '%';
  if (damageBonusPvE) damageBonusPvE.textContent = totalDamageBonusPvE + '%';
  if (physicalDamageBonus) physicalDamageBonus.textContent = totalPhysicalDamageBonus + '%';
  if (magicDamageBonus) magicDamageBonus.textContent = totalMagicDamageBonus + '%';
  if (healingBonus) healingBonus.textContent = totalHealingBonus + '%';
  if (armor) armor.textContent = totalArmor;
  if (magicResistance) magicResistance.textContent = totalMagicResistance;
  if (controlResistance) controlResistance.textContent = totalControlResistance;
  if (block) block.textContent = totalBlock;
  if (tenacityPenetration) tenacityPenetration.textContent = totalTenacityPenetration;
  if (movementSpeed) movementSpeed.textContent = drifter.stats?.movementSpeed || '0 m/sec';

  // Apply color directly via JavaScript as CSS is having encoding issues
  const statElements = document.querySelectorAll('.stat-value');
  statElements.forEach(el => {
    el.style.color = '#767676';
    el.style.fontSize = '0.9rem';
    el.style.fontWeight = '600';
  });

  // Update mastery level
  if (masteryLevel) masteryLevel.textContent = level;

  // Update button states
  if (masteryButton) {
    masteryButton.disabled = level >= STATE.mastery.maxLevel;
    masteryButton.textContent = level >= STATE.mastery.maxLevel ? 'MAX' : '+';
  }
  
  if (masteryResetButton) {
    masteryResetButton.disabled = level <= 1;
  }
}

function increaseMasteryLevel() {
  if (!STATE.mastery.currentDrifter || STATE.mastery.level >= STATE.mastery.maxLevel) {
    return;
  }

  STATE.mastery.level++;
  updateMasteryDisplay();
}

function resetMasteryLevel() {
  if (!STATE.mastery.currentDrifter) {
    return;
  }

  STATE.mastery.level = 1;
  updateMasteryDisplay();
}

// Bind mastery button events
if (masteryButton) {
  masteryButton.addEventListener('click', increaseMasteryLevel);
}

if (masteryResetButton) {
  masteryResetButton.addEventListener('click', resetMasteryLevel);
}











function updateSupportEffects(drifter) {
  if (!supportEffects || !supportList) {
    return;
  }
  
  // Clear existing support effects
  supportList.innerHTML = '';
  
  if (!drifter || !drifter.support) {
    hideElement(supportEffects);
    updateSkillsVideo(null);
    return;
  }
  
  // Show support effects section
  showElement(supportEffects);
  
  // Update skills video button
  updateSkillsVideo(drifter);
  
  // Add support effects
  if (drifter.support.effects && Array.isArray(drifter.support.effects)) {
    // Handle effects array structure
    drifter.support.effects.forEach(effect => {
      const supportItem = document.createElement('div');
      supportItem.className = 'support-item';
      
      const supportName = document.createElement('span');
      supportName.className = 'support-name';
      supportName.textContent = effect.name;
      
      const supportValue = document.createElement('span');
      supportValue.className = 'support-value';
      supportValue.textContent = effect.value;
      
      // Add type-based styling if needed
      if (effect.type === 'negative') {
        supportValue.style.color = '#ff6b6b'; // Red for negative effects
      } else if (effect.type === 'positive') {
        supportValue.style.color = '#51cf66'; // Green for positive effects
      }
      
      supportItem.appendChild(supportName);
      supportItem.appendChild(supportValue);
      supportList.appendChild(supportItem);
    });
  } else {
    // Handle simple key-value structure (fallback)
    Object.entries(drifter.support).forEach(([key, value]) => {
      const supportItem = document.createElement('div');
      supportItem.className = 'support-item';
      
      const supportName = document.createElement('span');
      supportName.className = 'support-name';
      supportName.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      const supportValue = document.createElement('span');
      supportValue.className = 'support-value';
      supportValue.textContent = typeof value === 'string' ? value : `+${value}%`;
      
      supportItem.appendChild(supportName);
      supportItem.appendChild(supportValue);
      supportList.appendChild(supportItem);
    });
  }
}

function updateSkillsVideo(drifter) {
  const skillsVideo = document.getElementById('skillsVideo');
  if (!skillsVideo) return;
  
  if (!drifter) {
    hideElement(skillsVideo);
    return;
  }
  
  // Always show the video section, but with different text based on whether there's a link
  showElement(skillsVideo);
  
  const videoButton = document.getElementById('playButton');
  if (videoButton) {
    if (drifter.youtubeLink) {
      videoButton.textContent = 'VIDEO INTRODUCTION';
      videoButton.style.opacity = '1';
      videoButton.style.cursor = 'pointer';
    } else {
      videoButton.textContent = 'VIDEO COMING SOON';
      videoButton.style.opacity = '0.5';
      videoButton.style.cursor = 'not-allowed';
    }
  }
}

function handlePlayButtonClick() {
  const selectedDrifter = STATE.selected.drifters[0];
  if (!selectedDrifter || !selectedDrifter.youtubeLink) return;
  
  // Open YouTube link in a new tab
  window.open(selectedDrifter.youtubeLink, '_blank');
}

// Bind mastery button events
if (masteryButton) {
  masteryButton.addEventListener('click', increaseMasteryLevel);
}

if (masteryResetButton) {
  masteryResetButton.addEventListener('click', resetMasteryLevel);
}

// Bind play button event
const playButton = document.getElementById('playButton');
if (playButton) {
  playButton.addEventListener('click', handlePlayButtonClick);
}

// Support card functionality
let selectedSupports = [];

// Helper function to check if a drifter is already selected as a support
function isDrifterAlreadySelectedAsSupport(gameId) {
  return selectedSupports.some(support => support && support.gameId === gameId);
}

// Helper function to check if a drifter is the main selected drifter
function isDrifterMainSelected(gameId) {
  return STATE.selected.drifters.some(drifter => drifter && drifter.gameId === gameId);
}

function initializeSupportCards() {
  const supportCards = document.querySelectorAll('.support-card');
  
  if (supportCards.length === 0) {
    setTimeout(() => {
      initializeSupportCards();
    }, 200);
    return;
  }
  
  supportCards.forEach((card, index) => {
    // Ensure cards start as empty
    card.classList.add('empty');
    
    // Remove any existing event listeners to prevent duplicates
    card.replaceWith(card.cloneNode(true));
    const newCard = document.querySelectorAll('.support-card')[index];
    
    // Add visual feedback on click
    newCard.addEventListener('mousedown', () => {
      newCard.style.transform = 'translateY(1px) scale(0.98)';
    });
    
    newCard.addEventListener('mouseup', () => {
      newCard.style.transform = '';
    });
    
    newCard.addEventListener('mouseleave', () => {
      newCard.style.transform = '';
    });
    
    newCard.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (newCard.classList.contains('empty')) {
        // Store the slot index for when a drifter is selected BEFORE showing overlay
        window.currentSupportSlot = index;
        // Show drifter selection overlay
        showOverlay('Select a Support Drifter', 'drifters');
      } else {
        // Remove the selected drifter
        removeSupportDrifter(index);
      }
    });
  });
  
}

function addSupportDrifter(drifter, slotIndex) {
  const supportCards = document.querySelectorAll('.support-card');
  const card = supportCards[slotIndex];
  
  if (!card) return;
  
  // Update the card
  card.classList.remove('empty');
  card.classList.add('selected');
  
  const portrait = card.querySelector('.support-card-portrait');
  const name = card.querySelector('.support-card-name');
  
  // Set the portrait background
  portrait.style.backgroundImage = `url(${drifter.portrait})`;
  portrait.style.backgroundSize = 'cover';
  portrait.style.backgroundPosition = 'center';
  
  // Set the name
  name.textContent = drifter.name;
  
  // Add to selected supports array
  selectedSupports[slotIndex] = drifter;
  
  // Add a subtle animation when adding
  card.style.transform = 'scale(1.05)';
  setTimeout(() => {
    card.style.transform = '';
  }, 150);
  
  // Update support effects display
  updateSupportEffects();
  
  // Update support descriptions
  updateSupportDescriptions();
  
  // Refresh drifter selection modal if it's open to update availability indicators
  if (selectionOverlay && selectionOverlay.style.display === 'grid') {
    renderDrifterSelection();
  }
}

function removeSupportDrifter(slotIndex) {
  const supportCards = document.querySelectorAll('.support-card');
  const card = supportCards[slotIndex];
  
  if (!card) return;
  
  // Add a subtle animation when removing
  card.style.transform = 'scale(0.95)';
  setTimeout(() => {
    card.style.transform = '';
  }, 150);
  
  // Reset the card
  card.classList.add('empty');
  card.classList.remove('selected');
  
  const portrait = card.querySelector('.support-card-portrait');
  const name = card.querySelector('.support-card-name');
  
  // Clear the portrait
  portrait.style.backgroundImage = '';
  
  // Reset the name
  name.textContent = 'Empty';
  
  // Remove from selected supports array
  selectedSupports[slotIndex] = null;
  
  // Update support effects display
  updateSupportEffects();
  
  // Update support descriptions
  updateSupportDescriptions();
  
  // Refresh drifter selection modal if it's open to update availability indicators
  if (selectionOverlay && selectionOverlay.style.display === 'grid') {
    renderDrifterSelection();
  }
}

function updateSupportEffects() {
  const supportEffectsContainer = document.querySelector('.support-effects');
  if (!supportEffectsContainer) return;
  
  // Clear existing effects
  supportEffectsContainer.innerHTML = '';
  
  // Add effects for selected supports
  selectedSupports.forEach((drifter, index) => {
    if (drifter && drifter.support) {
      let effectText = '';
      
      // Handle effects array format
      if (drifter.support.effects && Array.isArray(drifter.support.effects)) {
        effectText = drifter.support.effects.map(effect => {
          return `${effect.name}: ${effect.value}`;
        }).join(', ');
      }
      // Handle other support properties (like starfallTokenBonus)
      else {
        const supportKeys = Object.keys(drifter.support);
        effectText = supportKeys.map(key => {
          const value = drifter.support[key];
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return `${formattedKey}: ${value}`;
        }).join(', ');
      }
      
      if (effectText) {
        const effectDiv = document.createElement('div');
        effectDiv.className = 'support-effect';
        
        effectDiv.innerHTML = `
          <div class="support-effect-header">
            <span class="support-effect-name">${drifter.name}</span>
            <span class="support-effect-slot">Slot ${index + 1}</span>
          </div>
          <div class="support-effect-description">${effectText}</div>
        `;
        supportEffectsContainer.appendChild(effectDiv);
      }
    }
  });
}

function updateSupportDescriptions() {
  const supportDescriptionsContainer = document.getElementById('supportDescriptionsContainer');
  if (!supportDescriptionsContainer) return;
  
  // Clear existing descriptions
  supportDescriptionsContainer.innerHTML = '';
  
  // Add support effects for selected supports in order
  selectedSupports.forEach((drifter, index) => {
    if (drifter && drifter.support) {
      let effectText = '';
      
      // Handle effects array format
      if (drifter.support.effects && Array.isArray(drifter.support.effects)) {
        effectText = drifter.support.effects.map(effect => {
          return `${effect.name}: ${effect.value}`;
        }).join(', ');
      }
      // Handle other support properties (like starfallTokenBonus)
      else {
        const supportKeys = Object.keys(drifter.support);
        effectText = supportKeys.map(key => {
          const value = drifter.support[key];
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return `${formattedKey}: ${value}`;
        }).join(', ');
      }
      
      if (effectText) {
        const descriptionItem = document.createElement('div');
        descriptionItem.className = 'support-description-item';
        
        descriptionItem.innerHTML = `
          <div class="support-description-text">${effectText}</div>
        `;
        
        supportDescriptionsContainer.appendChild(descriptionItem);
      }
    }
  });
}

// Initialize the application when DOM is ready

// Fallback for older browsers
if (document.readyState === 'loading') {
  window.addEventListener("DOMContentLoaded", () => {
    init();
    // Additional fallback for support cards
    setTimeout(() => {
      if (document.querySelectorAll('.support-card').length > 0 && !window.supportCardsInitialized) {
        initializeSupportCards();
        window.supportCardsInitialized = true;
      }
    }, 500);
  });
} else {
  init();
  // Additional fallback for support cards
  setTimeout(() => {
    if (document.querySelectorAll('.support-card').length > 0 && !window.supportCardsInitialized) {
      initializeSupportCards();
      window.supportCardsInitialized = true;
    }
  }, 500);
}

// Additional fallback
setTimeout(() => {
  if (!STATE.drifters || STATE.drifters.length === 0) {
    init();
  }
}, 1000);
