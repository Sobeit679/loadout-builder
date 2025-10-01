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
import { loadDataSets, renderCards, updateSummary, bindCopy } from './scripts/utils.js';

const STATE = {
  drifters: [],
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
  }
};

const CARD_TEMPLATE = document.getElementById('card-template');
const drifterGrid = document.getElementById('drifterGrid');
const gearGrid = document.getElementById('gearGrid');
const summaryEl = document.getElementById('summary');
const gearCategorySelect = document.getElementById('gearCategory');
const loadoutSlots = document.querySelectorAll('.slot');
const avatarArt = document.querySelector('.avatar-art');
const avatarName = document.querySelector('.avatar-name');
const avatarRole = document.querySelector('.avatar-role');
const avatarTitle = document.getElementById('avatarTitle');
const drifterTrigger = document.getElementById('drifterTrigger');
const selectionOverlay = document.getElementById('selectionOverlay');
const selectionGrid = document.getElementById('selectionGrid');
const selectionTitle = document.getElementById('selection-title');
const closeSelectionBtn = document.getElementById('closeSelection');
const abilitySlots = document.querySelectorAll('.ability-slot');
let activeSelection = null;
const overlayContent = selectionOverlay.querySelector('.selection-dialog');

function resolvePortraitPath(drifter) {
  return ''; // No external images
}

async function init() {
  const toast = createToast();
  document.body.appendChild(toast.element);

  const data = await loadDataSets(toast.notify);
  STATE.drifters = data.drifters;
  STATE.gear = data.gear;
  STATE.mods = data.mods;
  STATE.selected = data.selected;

  bindSlotTriggers();
  clearGearSlots();
  disableEquipmentSlots(true); // Start with equipment slots disabled

  // Ensure overlay can close and never sticks
  closeSelectionBtn?.addEventListener('click', () => hideOverlay());
  selectionOverlay?.addEventListener('click', (e) => {
    if (e.target === selectionOverlay || e.target === overlayContent) hideOverlay();
  });
}

function renderDrifters() {
  renderCards({
    items: STATE.drifters,
    grid: drifterGrid,
    template: CARD_TEMPLATE,
    isSelected: (item) => STATE.selected.drifters.some((sel) => sel.gameId === item.gameId),
    onToggle: (item) => {
      const existing = STATE.selected.drifters.findIndex((sel) => sel.gameId === item.gameId);
      if (existing >= 0) {
        STATE.selected.drifters.splice(existing, 1);
      } else {
        STATE.selected.drifters.length = 0;
        STATE.selected.drifters.push(item);
      }
      updateAvatar();
      clearGearSlots();
      revealSlots();
    }
  });
}

function renderGear() {
  const key = gearCategorySelect.value;
  const items = key === 'weapons'
    ? [...STATE.gear[key], ...STATE.mods.weapon]
    : [...STATE.gear[key], ...STATE.mods.armor];
  renderCards({
    items,
    grid: gearGrid,
    template: CARD_TEMPLATE,
    isSelected: (item) => STATE.selected.gear[key]?.gameId === item.gameId,
    onToggle: (item) => {
      if (STATE.selected.gear[key]?.gameId === item.gameId) {
        delete STATE.selected.gear[key];
      } else {
        STATE.selected.gear[key] = item;
        if (item.slot) {
          STATE.selected.mods[resolveSlotKey(item)] = item;
        }
      }
      populateLoadoutBoard();
    }
  });
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
  
  // Clear ability slot W
  const wSlot = document.querySelector('[data-key="W"]');
  const wIcon = wSlot.querySelector('.ability-icon');
  wIcon.style.backgroundImage = '';
  wSlot.classList.add('empty');
  
  populateLoadoutBoard();
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
  });

  // Update ability slot W with weapon skill
  updateWeaponSkill();
}

function updateWeaponSkill() {
  const weapon = STATE.selected.gear['weapons'];
  const wSlot = document.querySelector('[data-key="W"]');
  const wIcon = wSlot.querySelector('.ability-icon');
  
  // Handle weapon skill icons
  if (weapon && weapon.skill && weapon.skill.icon) {
    wIcon.style.backgroundImage = `url(${weapon.skill.icon})`;
    wSlot.classList.remove('empty');
  } else if (weapon && weapon.skillIcon) {
    wIcon.style.backgroundImage = `url(${weapon.skillIcon})`;
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

function updateAvatar() {
  const drifter = STATE.selected.drifters[0];
  const loadoutLayout = document.getElementById('loadoutLayout');
  const avatarTitle = document.getElementById('avatarTitle');
  const avatarText = document.getElementById('avatarText');
  
  if (!drifter) {
    loadoutLayout.style.backgroundImage = '';
    avatarTitle.textContent = '';
    avatarText.textContent = 'Select Drifter';
    avatarText.style.display = 'grid';
    clearDrifterAbilities();
    disableEquipmentSlots(true);
    return;
  }

  // Handle drifter background - use icon (full body) for background
  const imageUrl = drifter.icon || drifter.portrait || drifter.cardIcon;
  if (imageUrl) {
    loadoutLayout.style.backgroundImage = `url(${imageUrl})`;
    loadoutLayout.style.backgroundSize = '175% auto';
    loadoutLayout.style.backgroundPosition = 'center bottom';
    loadoutLayout.style.backgroundRepeat = 'no-repeat';
  } else {
    loadoutLayout.style.backgroundImage = '';
    loadoutLayout.style.backgroundSize = '';
    loadoutLayout.style.backgroundPosition = '';
    loadoutLayout.style.backgroundRepeat = '';
  }
  
  avatarTitle.textContent = drifter.name;
  avatarText.style.display = 'none';
  updateDrifterAbilities(drifter);
  disableEquipmentSlots(false);
}

function updateDrifterAbilities(drifter) {
  const passiveSlot = document.querySelector('.drifter-passive .ability-icon');
  const eSlot = document.querySelector('[data-key="E"] .ability-icon');
  
  // Handle passive skill
  if (drifter.passive && drifter.passive.icon) {
    passiveSlot.style.backgroundImage = `url(${drifter.passive.icon})`;
    passiveSlot.parentElement.classList.remove('empty');
  } else {
    passiveSlot.style.backgroundImage = '';
    passiveSlot.parentElement.classList.add('empty');
  }
  
  // Handle active skill in E slot
  if (drifter.skill && drifter.skill.icon) {
    eSlot.style.backgroundImage = `url(${drifter.skill.icon})`;
    eSlot.parentElement.classList.remove('empty');
  } else {
    eSlot.style.backgroundImage = '';
    eSlot.parentElement.classList.add('empty');
  }
  
  // Update tooltips
  updateAbilityTooltips(drifter);
}

function updateAbilityTooltips(drifter) {
  // Update E slot tooltip (drifter active skill)
  const eSlot = document.querySelector('[data-key="E"]');
  let eTooltip = eSlot.querySelector('.ability-tooltip');
  if (!eTooltip) {
    eTooltip = document.createElement('div');
    eTooltip.className = 'ability-tooltip';
    eSlot.appendChild(eTooltip);
  }
  if (drifter.skill) {
    const category = getAbilityCategory(drifter.skill);
    const formattedDescription = drifter.skill.description.replace(/\n/g, '<br><br>');
    
    // Create additional effect tags
    let additionalTags = '';
    if (drifter.skill.tags && drifter.skill.tags.length > 1) {
      const otherTags = drifter.skill.tags
        .filter(tag => tag.toLowerCase() !== category)
        .map(tag => `<span class="ability-tag">${tag}</span>`)
        .join(' ');
      if (otherTags) {
        additionalTags = `<div class="ability-tags" style="margin-top: 8px;">${otherTags}</div>`;
      }
    }
    
    eTooltip.innerHTML = `<div class="ability-category ${category}">${category}</div><div style="margin-bottom: 12px;"><strong>${drifter.skill.name}</strong></div><div>${formattedDescription}</div>${additionalTags}`;
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
  if (drifter.passive) {
    const category = getAbilityCategory(drifter.passive);
    const formattedDescription = drifter.passive.description.replace(/\n/g, '<br><br>');
    
    // Create additional effect tags for passive
    let additionalTags = '';
    if (drifter.passive.tags && drifter.passive.tags.length > 1) {
      const otherTags = drifter.passive.tags
        .filter(tag => tag.toLowerCase() !== category)
        .map(tag => `<span class="ability-tag">${tag}</span>`)
        .join(' ');
      if (otherTags) {
        additionalTags = `<div class="ability-tags" style="margin-top: 8px;">${otherTags}</div>`;
      }
    }
    
    passiveTooltip.innerHTML = `<div class="ability-category ${category}">${category}</div><div style="margin-bottom: 12px;"><strong>${drifter.passive.name}</strong></div><div>${formattedDescription}</div>${additionalTags}`;
  } else {
    passiveTooltip.textContent = 'No passive available';
  }
  
  // Update weapon skill tooltip (W slot)
  const weapon = STATE.selected.gear['weapons'];
  const wSlot = document.querySelector('[data-key="W"]');
  let wTooltip = wSlot.querySelector('.ability-tooltip');
  if (!wTooltip) {
    wTooltip = document.createElement('div');
    wTooltip.className = 'ability-tooltip';
    wSlot.appendChild(wTooltip);
  }
  if (weapon) {
    const category = getAbilityCategory(weapon);
    wTooltip.innerHTML = `<div class="ability-category ${category}">${category}</div><div style="margin-bottom: 12px;"><strong>${weapon.sub || weapon.name}</strong></div><div>${weapon.description || 'Weapon skill'}</div>`;
  } else {
    wTooltip.textContent = 'No weapon equipped';
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

function addTooltipPositioning() {
  const abilitySlots = document.querySelectorAll('.ability-slot');
  
  abilitySlots.forEach(slot => {
    const tooltip = slot.querySelector('.ability-tooltip');
    if (!tooltip) return;
    
    slot.addEventListener('mouseenter', (e) => {
      const rect = slot.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Position tooltip above the slot
      let top = rect.top - tooltipRect.height - 10;
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      
      // Keep tooltip within viewport
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) {
        top = rect.bottom + 10; // Show below if no room above
      }
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    });
  });
}

function clearDrifterAbilities() {
  const passiveSlot = document.querySelector('.drifter-passive .ability-icon');
  const eSlot = document.querySelector('[data-key="E"] .ability-icon');
  
  passiveSlot.style.backgroundImage = '';
  passiveSlot.parentElement.classList.add('empty');
  eSlot.style.backgroundImage = '';
  eSlot.parentElement.classList.add('empty');
}

function disableEquipmentSlots(disabled) {
  loadoutSlots.forEach((slot) => {
    const card = slot.querySelector('.slot-card');
    if (disabled) {
      card.classList.add('disabled');
    } else {
      card.classList.remove('disabled');
    }
  });
}

function revealSlots() {
  loadoutSlots.forEach((slot, index) => {
    setTimeout(() => {
      slot.classList.add('slot--visible');
    }, index * 60);
  });
}

function showOverlay(title) {
  console.log('showOverlay called with title:', title);
  if (!selectionOverlay) {
    console.error('selectionOverlay not found');
    return;
  }
  selectionTitle.textContent = title || 'Select Item';
  selectionOverlay.hidden = false;
  console.log('Overlay should now be visible');
}

function hideOverlay() {
  if (!selectionOverlay) return;
  selectionOverlay.hidden = true;
  selectionGrid.innerHTML = '';
  activeSelection = null;
}

function bindSlotTriggers() {
  // Drifter trigger opens drifter selection
  drifterTrigger?.addEventListener('click', () => {
    console.log('Drifter trigger clicked');
    activeSelection = 'drifter';
    showOverlay('Select a Drifter');
    renderDrifterSelection();
  });

  // Equipment/mod slots
  loadoutSlots.forEach((slot) => {
    slot.addEventListener('click', () => {
      // Don't allow slot interaction if no drifter is selected
      if (!STATE.selected.drifters.length) return;
      
      const slotKey = slot.dataset.slot;
      const map = SLOT_MAPPINGS[slotKey];
      if (!map) return;
      activeSelection = slotKey;
      showOverlay(map.title);

      let items = [];
      if (map.type === 'weapon') items = STATE.gear['weapons'];
      else if (map.type === 'armor') items = STATE.gear[map.key];
      else if (map.type === 'weaponMod') items = STATE.mods.weapon;
      else if (map.type === 'armorMod') items = STATE.mods.armor;

      renderCards({
        items,
        grid: selectionGrid,
        template: CARD_TEMPLATE,
        isSelected: () => false,
        onToggle: (item) => {
          if (map.type === 'weapon') STATE.selected.gear['weapons'] = item;
          else if (map.type === 'armor') STATE.selected.gear[map.key] = item;
          else if (map.type === 'weaponMod') STATE.selected.mods['weaponMod'] = item;
          else if (map.type === 'armorMod') STATE.selected.mods[slotKey] = item;
          populateLoadoutBoard();
          hideOverlay();
        }
      });
    });
  });
}

function renderDrifterSelection() {
  console.log('renderDrifterSelection called, drifters count:', STATE.drifters.length);
  selectionGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  STATE.drifters.forEach((drifter) => {
    const card = document.createElement('article');
    card.className = 'drifter-select-card';

    const name = document.createElement('h4');
    name.className = 'drifter-select-name';
    name.textContent = drifter.name || '';
    card.appendChild(name);

    // Handle drifter selection images - use cardIcon for selection modal
    if (drifter.cardIcon) {
      const img = document.createElement('img');
      img.className = 'drifter-select-art';
      img.alt = drifter.name || 'Drifter';
      img.src = drifter.cardIcon;
      card.appendChild(img);
    }

    card.addEventListener('click', () => {
      STATE.selected.drifters = [drifter];
      updateAvatar();
      hideOverlay();
    });

    fragment.appendChild(card);
  });

  selectionGrid.appendChild(fragment);
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

init();


