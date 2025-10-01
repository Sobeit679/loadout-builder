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

// DOM References
const drifterTrigger = document.getElementById('drifterTrigger');
const selectionOverlay = document.getElementById('selectionOverlay');
const selectionGrid = document.getElementById('selectionGrid');
const selectionTitle = document.getElementById('selectionTitle');
const closeSelectionBtn = document.getElementById('closeSelectionBtn');
const overlayContent = document.getElementById('overlayContent');
const loadoutSlots = document.querySelectorAll('.slot');
const drifterGrid = document.getElementById('drifterGrid'); // This might not exist
const gearGrid = document.getElementById('gearGrid'); // This might not exist
const gearCategorySelect = document.getElementById('gearCategorySelect');
const avatarTitle = document.getElementById('avatarTitle');
const avatarDescription = document.getElementById('avatarDescription');
const masterySection = document.getElementById('masterySection');
const supportEffects = document.getElementById('supportEffects');
const supportList = document.getElementById('supportList');
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
  },
  mastery: {
    level: 1,
    maxLevel: 50,
    currentDrifter: null
  }
};

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
  if (!selectionOverlay) return;
  
  selectionOverlay.style.display = 'grid';
  selectionOverlay.hidden = false;
  
  if (selectionTitle) selectionTitle.textContent = title;
  
  if (key === 'drifters') {
    renderDrifterSelection();
  } else {
    renderGear();
  }
}

function hideOverlay() {
  if (selectionOverlay) {
    selectionOverlay.style.display = 'none';
    selectionOverlay.hidden = true;
  }
}

function renderDrifterSelection() {
  if (!selectionGrid) return;
  
  // Clear existing content
  selectionGrid.innerHTML = '';
  
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  STATE.drifters.forEach((drifter, index) => {
    const card = document.createElement('div');
    card.className = 'drifter-select-card';
    card.dataset.gameId = drifter.gameId;
    
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
    
    const role = document.createElement('div');
    role.textContent = drifter.role;
    role.style.fontSize = '0.9rem';
    role.style.color = 'var(--text-muted)';
    role.style.textAlign = 'center';
    role.style.marginTop = '0.25rem';
    
    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(role);
    
    // Add click handler
    card.addEventListener('click', () => {
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
  loadoutSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      const key = slot.dataset.key;
      if (key && SLOT_MAPPINGS[key]) {
        showOverlay(SLOT_MAPPINGS[key].title, key);
      }
    });
  });
}

async function init() {
  const toast = createToast();
  document.body.appendChild(toast.element);

  const data = await loadDataSets(toast.notify);
  STATE.drifters = data.drifters;
  STATE.gear = data.gear;
  STATE.mods = data.mods;
  STATE.selected = data.selected;

  console.log('Loaded drifters:', STATE.drifters);
  console.log('Drifter count:', STATE.drifters.length);

  bindSlotTriggers();
  clearGearSlots();
  disableEquipmentSlots(true); // Start with equipment slots disabled
  renderDrifters();
  
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
    avatarDescription.textContent = '';
    avatarText.textContent = 'Select Drifter';
    avatarText.style.display = 'grid';
    clearDrifterAbilities();
    disableEquipmentSlots(true);
    hideMasterySection();
    updateSupportEffects(null);
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
  avatarDescription.textContent = drifter.description || '';
  avatarText.style.display = 'none';
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
    let skillTags = '';
    if (drifter.skill.tags && drifter.skill.tags.length > 0) {
      const allTags = drifter.skill.tags.map(tag => {
        const tagClass = getTagClass(tag);
        let displayTag = tag;
        if (tag === 'cooldown_reduction') displayTag = 'cooldown';
        else if (tag === 'control_immunity') displayTag = 'control immunity';
        else if (tag === 'damage_immunity') displayTag = 'immunity';
        return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
      }).join(' ');
      skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
    }
    
    eTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${drifter.skill.name}</strong></div><div>${formattedDescription}</div>`;
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
    
    // Create skill tags for passive
    let skillTags = '';
    if (drifter.passive.tags && drifter.passive.tags.length > 0) {
      const allTags = drifter.passive.tags.map(tag => {
        const tagClass = getTagClass(tag);
        let displayTag = tag;
        if (tag === 'cooldown_reduction') displayTag = 'cooldown';
        else if (tag === 'control_immunity') displayTag = 'control immunity';
        else if (tag === 'damage_immunity') displayTag = 'immunity';
        return `<span class="ability-tag ${tagClass}">${displayTag}</span>`;
      }).join(' ');
      skillTags = `<div class="ability-tags" style="margin-bottom: 8px;">${allTags}</div>`;
    }
    
    passiveTooltip.innerHTML = `${skillTags}<div style="margin-bottom: 12px;"><strong>${drifter.passive.name}</strong></div><div>${formattedDescription}</div>`;
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
    wTooltip.innerHTML = `<div style="margin-bottom: 12px;"><strong>${weapon.sub || weapon.name}</strong></div><div>${weapon.description || 'Weapon skill'}</div>`;
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

function getTagClass(tag) {
  const tagLower = tag.toLowerCase();
  switch (tagLower) {
    case 'damage':
      return 'tag-damage';
    case 'shield':
      return 'tag-shield';
    case 'hard_control':
    case 'control':
      return 'tag-control';
    case 'buff':
      return 'tag-buff';
    case 'teleport':
      return 'tag-teleport';
    case 'healing':
    case 'heal':
      return 'tag-healing';
    case 'defense':
    case 'defensive':
      return 'tag-defense';
    case 'utility':
      return 'tag-utility';
    case 'cooldown_reduction':
      return 'tag-cooldown';
    case 'cooldown':
      return 'tag-cooldown';
    case 'control_immunity':
      return 'tag-control-immunity';
    case 'damage_immunity':
      return 'tag-damage-immunity';
    case 'slow':
      return 'tag-slow';
    case 'knockback':
      return 'tag-knockback';
    case 'silence':
      return 'tag-silence';
    case 'stun':
      return 'tag-stun';
    case 'dodge':
      return 'tag-dodge';
    case 'armor':
      return 'tag-armor';
    case 'aoe':
      return 'tag-aoe';
    case 'area':
      return 'tag-area';
    case 'magic':
      return 'tag-magic';
    case 'physical':
      return 'tag-physical';
    case 'stealth':
      return 'tag-stealth';
    case 'critical':
      return 'tag-critical';
    case 'mobility':
      return 'tag-mobility';
    case 'support':
      return 'tag-support';
    case 'tank':
      return 'tag-tank';
    case 'immunity':
      return 'tag-immunity';
    case 'skill':
      return 'tag-skill';
    case 'passive':
      return 'tag-passive';
    case 'cooldown_reduction':
      return 'tag-cooldown';
    case 'cooldown':
      return 'tag-cooldown';
    default:
      return 'tag-default';
  }
}

// Global tooltip element
let globalTooltip = null;

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

function addTooltipPositioning() {
  const abilitySlots = document.querySelectorAll('.ability-slot');
  const tooltip = createGlobalTooltip();
  
  abilitySlots.forEach((slot, index) => {
    const slotTooltip = slot.querySelector('.ability-tooltip');
    if (!slotTooltip) return;
    
    slot.addEventListener('mouseenter', (e) => {
      // Copy content from slot tooltip to global tooltip
      tooltip.innerHTML = slotTooltip.innerHTML;
      
      // Show global tooltip
      tooltip.style.display = 'block';
      
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
    masterySection.style.display = 'block';
  }
}

function hideMasterySection() {
  if (masterySection) {
    masterySection.style.display = 'none';
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
  console.log('Drifter mastery bonuses:', drifter.masteryBonuses);
  console.log('Drifter data:', drifter);
  console.log('DOM elements:', { strengthBonus, agilityBonus, intelligenceBonus });
  
  if (strengthBonus) {
    const perLevelBonus = drifter.masteryBonuses?.strength || 0;
    strengthBonus.textContent = `(+${perLevelBonus.toFixed(1)})`;
    console.log('Strength bonus:', perLevelBonus, 'Element:', strengthBonus);
  } else {
    console.log('strengthBonus element not found');
  }
  if (agilityBonus) {
    const perLevelBonus = drifter.masteryBonuses?.agility || 0;
    agilityBonus.textContent = `(+${perLevelBonus.toFixed(1)})`;
    console.log('Agility bonus:', perLevelBonus, 'Element:', agilityBonus);
  } else {
    console.log('agilityBonus element not found');
  }
  if (intelligenceBonus) {
    const perLevelBonus = drifter.masteryBonuses?.intelligence || 0;
    intelligenceBonus.textContent = `(+${perLevelBonus.toFixed(1)})`;
    console.log('Intelligence bonus:', perLevelBonus, 'Element:', intelligenceBonus);
  } else {
    console.log('intelligenceBonus element not found');
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
  if (!supportEffects || !supportList) return;
  
  // Clear existing support effects
  supportList.innerHTML = '';
  
  if (!drifter || !drifter.support) {
    supportEffects.style.display = 'none';
    return;
  }
  
  // Show support effects section
  supportEffects.style.display = 'block';
  
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

// Bind mastery button events
if (masteryButton) {
  masteryButton.addEventListener('click', increaseMasteryLevel);
}

if (masteryResetButton) {
  masteryResetButton.addEventListener('click', resetMasteryLevel);
}

init();


