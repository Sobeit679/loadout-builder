
console.log('Script loading...');

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
// import { loadDataSets, renderCards, updateSummary, bindCopy } from './scripts/utils.js';

// Imported functions from utils.js
async function loadDataSets(notify) {
  try {
    console.log('Loading data sets on GitHub Pages...');
    const [driftersData, weaponsData, skillsData, helmetsData, chestsData, bootsData, weaponModsData, armorModsData] = await Promise.all([
      fetch(`./data/drifters.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load drifters: ${r.status}`);
        return r.json();
      }),
      fetch('./data/weapons.json').then(r => {
        if (!r.ok) throw new Error(`Failed to load weapons: ${r.status}`);
        return r.json();
      }),
      fetch(`./data/skills.json?v=${Date.now()}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load skills: ${r.status}`);
        return r.json();
      }),
      fetch('./data/armor/helmets.json').then(r => {
        if (!r.ok) throw new Error(`Failed to load helmets: ${r.status}`);
        return r.json();
      }),
      fetch('./data/armor/chests.json').then(r => {
        if (!r.ok) throw new Error(`Failed to load chests: ${r.status}`);
        return r.json();
      }),
      fetch('./data/armor/boots.json').then(r => {
        if (!r.ok) throw new Error(`Failed to load boots: ${r.status}`);
        return r.json();
      }),
      fetch('./data/mods/weapon-mods.json').then(r => {
        if (!r.ok) throw new Error(`Failed to load weapon mods: ${r.status}`);
        return r.json();
      }),
      fetch('./data/mods/armor-mods.json').then(r => {
        if (!r.ok) throw new Error(`Failed to load armor mods: ${r.status}`);
        return r.json();
      })
    ]);
    console.log('Data loaded successfully on GitHub Pages');

    // Process drifters to add gameId field
    const processedDrifters = (driftersData.drifters || []).map(drifter => ({
      ...drifter,
      gameId: drifter.id // Add gameId field for click handler
    }));
    

    return {
      drifters: processedDrifters,
      skills: skillsData.skills || [],
      gear: {
        weapons: weaponsData.weapons || [],
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
    const card = document.createElement('div');
    card.className = 'selector-card';
    if (isSelected(item)) {
      card.classList.add('selected');
    }
    
    // Check if this is a weapon with core skill or helmet with passive skill
    if (item.coreSkill || item.passiveSkill) {
      const skill = STATE.skills.find(s => s.id === (item.coreSkill || item.passiveSkill));
      
      // Make the card itself the weapon bar - completely horizontal flow
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.padding = '12px 16px';
      card.style.borderBottom = '1px solid var(--border)';
      card.style.backgroundColor = 'var(--card-bg)';
      card.style.transition = 'background-color 0.2s';
      card.style.margin = '0';
      card.style.borderRadius = '0';
      card.style.gap = '16px';
      card.style.width = '100%';
      card.style.minWidth = '100%';
      card.style.minHeight = 'auto';
      card.style.maxHeight = 'none';
      card.style.overflow = 'visible';
      card.style.gridColumn = '1 / -1';
      card.style.gridRow = 'auto';
      
      console.log('=== CARD CONTAINER DEBUG ===');
      console.log('Card element created:', card);
      console.log('Card classes:', card.className);
      
      // Item image
      const itemImg = document.createElement('img');
      itemImg.src = item.icon || '';
      itemImg.alt = item.name;
      itemImg.className = 'item-icon';
      itemImg.style.width = '40px';
      itemImg.style.height = '40px';
      itemImg.style.objectFit = 'contain';
      itemImg.style.flexShrink = '0';
      itemImg.onerror = () => { itemImg.style.display = 'none'; };
      
      // Item name and type container
      const itemInfo = document.createElement('div');
      itemInfo.style.display = 'flex';
      itemInfo.style.flexDirection = 'column';
      itemInfo.style.marginRight = '16px';
      
      const itemName = document.createElement('div');
      itemName.textContent = item.name;
      itemName.style.fontSize = '1rem';
      itemName.style.fontWeight = 'bold';
      itemName.style.color = 'var(--text)';
      itemName.style.marginBottom = '2px';
      
      const itemType = document.createElement('div');
      if (item.weaponType && item.range) {
        itemType.textContent = `${item.weaponType} • ${item.range}`;
      } else if (item.armorType) {
        itemType.textContent = item.armorType;
      }
      itemType.style.fontSize = '0.8rem';
      itemType.style.color = 'var(--text-muted)';
      
      itemInfo.appendChild(itemName);
      itemInfo.appendChild(itemType);
      
      // Skill image
      const skillImg = document.createElement('img');
      skillImg.src = skill?.icon || '';
      skillImg.alt = skill?.name || 'Skill';
      skillImg.className = 'skill-icon';
      skillImg.style.width = '40px';
      skillImg.style.height = '40px';
      skillImg.style.objectFit = 'contain';
      skillImg.style.flexShrink = '0';
      skillImg.onerror = () => { skillImg.style.display = 'none'; };
      
      // Core skill info container
      const skillInfo = document.createElement('div');
      skillInfo.style.display = 'flex';
      skillInfo.style.flexDirection = 'column';
      skillInfo.style.flex = '1';
      
      // Skill name
      const skillName = document.createElement('div');
      skillName.textContent = skill?.name || 'No skill';
      skillName.style.fontWeight = 'bold';
      skillName.style.fontSize = '0.95rem';
      skillName.style.color = 'var(--text)';
      skillName.style.marginBottom = '4px';
      
      // Skill tags
      const skillTags = document.createElement('div');
      skillTags.style.display = 'flex';
      skillTags.style.gap = '4px';
      skillTags.style.marginBottom = '4px';
      
      if (skill?.tags) {
        skill.tags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.textContent = tag;
          tagElement.className = `skill-tag ${getTagClass(tag)}`;
          skillTags.appendChild(tagElement);
        });
      }
      
      // Skill description
      const skillDesc = document.createElement('div');
      skillDesc.textContent = skill?.description || '';
      skillDesc.style.fontSize = '0.8rem';
      skillDesc.style.color = 'var(--text-muted)';
      skillDesc.style.lineHeight = '1.3';
      skillDesc.style.width = '100%';
      skillDesc.style.minWidth = '0';
      skillDesc.style.overflow = 'visible';
      skillDesc.style.whiteSpace = 'normal';
      
      // Debug logging
      console.log('=== ITEM CARD DEBUG ===');
      console.log('Card element:', card);
      console.log('Card computed styles:', window.getComputedStyle(card));
      console.log('SkillInfo element:', skillInfo);
      console.log('SkillInfo computed styles:', window.getComputedStyle(skillInfo));
      console.log('SkillDesc element:', skillDesc);
      console.log('SkillDesc computed styles:', window.getComputedStyle(skillDesc));
      console.log('Description text length:', skill?.description?.length);
      console.log('Description text:', skill?.description);
      
      skillInfo.appendChild(skillName);
      skillInfo.appendChild(skillTags);
      skillInfo.appendChild(skillDesc);
      
      // Add all elements in horizontal order
      card.appendChild(itemImg);
      card.appendChild(itemInfo);
      card.appendChild(skillImg);
      card.appendChild(skillInfo);
      
      // Debug parent container
      console.log('=== PARENT CONTAINER DEBUG ===');
      console.log('Parent container:', container);
      console.log('Parent computed styles:', window.getComputedStyle(container));
      console.log('Parent width:', container.offsetWidth);
      console.log('Card width after append:', card.offsetWidth);
      console.log('Card height after append:', card.offsetHeight);
      console.log('Card computed width:', window.getComputedStyle(card).width);
      console.log('Card computed min-width:', window.getComputedStyle(card).minWidth);
      console.log('Card computed max-width:', window.getComputedStyle(card).maxWidth);
      console.log('ItemInfo computed width:', window.getComputedStyle(itemInfo).width);
      console.log('SkillInfo computed width:', window.getComputedStyle(skillInfo).width);
      console.log('SkillDesc computed width:', window.getComputedStyle(skillDesc).width);
    } else {
      // Regular item rendering
      const img = document.createElement('img');
      img.src = item.icon || '';
      img.alt = item.name;
      img.onerror = () => { img.style.display = 'none'; };
      
      const name = document.createElement('div');
      name.className = 'card-name';
      name.textContent = item.name;
      
      const sub = document.createElement('div');
      sub.className = 'card-sub';
      sub.textContent = item.sub || '';
      
      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(sub);
    }
    
    card.addEventListener('click', () => onToggle(item));
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
let globalTooltip = null;

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
  
  if (selectionTitle) {
    selectionTitle.textContent = title;
  }
  
  if (key === 'drifters') {
    renderDrifterSelection();
  } else if (key === 'basic-attacks' || key === 'weapon-skills') {
    // These are handled by the calling functions directly
    // Just show the overlay, content is already rendered
  } else {
    renderGear(key);
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
    name.style.color = 'var(--text)';
    name.style.fontSize = '1rem';
    
    const role = document.createElement('div');
    role.textContent = drifter.role;
    role.style.fontSize = '0.9rem';
    role.style.color = 'var(--text-muted)';
    role.style.textAlign = 'center';
    role.style.marginTop = '0.25rem';
    
    card.appendChild(name);
    card.appendChild(img);
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
    
    console.log('Loadout builder initialized successfully');
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
      console.log('Ability slot A clicked');
      e.stopPropagation();
      e.preventDefault();
      showBasicAttackSelection();
    });
  }
  
  if (qSlot) {
    qSlot.addEventListener('click', (e) => {
      console.log('Ability slot Q clicked');
      e.stopPropagation();
      e.preventDefault();
      showWeaponSkillSelection();
    });
  }
}


function renderGear(key) {
  const gearKey = SLOT_MAPPINGS[key].key;
  
  // For weapons and helmets, only show actual items, not mods
  const items = (gearKey === 'weapons' || gearKey === 'armors/head')
    ? STATE.gear[gearKey]
    : [...STATE.gear[gearKey], ...STATE.mods.armor];
    
  console.log('Rendering gear for key:', key, 'Items:', items);
  console.log('Weapons in STATE.gear[weapons]:', STATE.gear[gearKey]);
    
  renderCards(
    items,
    selectionGrid,
    (item) => STATE.selected.gear[gearKey]?.gameId === item.gameId,
           (item) => {
             console.log('Weapon selection clicked:', item);
             if (STATE.selected.gear[gearKey]?.gameId === item.gameId) {
               console.log('Deselecting weapon');
               delete STATE.selected.gear[gearKey];
             } else {
               console.log('Selecting weapon:', item.name);
               STATE.selected.gear[gearKey] = item;
               if (item.slot) {
                 STATE.selected.mods[resolveSlotKey(item)] = item;
               }
               // Auto-fill ability slots with weapon skills
               if (item.basicAttacks && item.basicAttacks.length > 0) {
                 const firstBasicAttack = STATE.skills.find(s => s.id === item.basicAttacks[0]);
                 if (firstBasicAttack) {
                   STATE.selected.gear['basic-attack'] = firstBasicAttack;
                 }
               }
               
               if (item.weaponSkills && item.weaponSkills.length > 0) {
                 const firstWeaponSkill = STATE.skills.find(s => s.id === item.weaponSkills[0]);
                 if (firstWeaponSkill) {
                   STATE.selected.gear['weapon-skill'] = firstWeaponSkill;
                 }
               }
               
               // Close the modal after selecting a weapon
               hideOverlay();
             }
             console.log('Selected weapon:', STATE.selected.gear[gearKey]);
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
  
  // Update weapon passive
  updateWeaponPassive();
  
  // Update helm passive
  updateHelmPassive();
  
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
      wIcon.style.backgroundImage = `url(${coreSkill.icon})`;
      wSlot.classList.remove('empty');
    } else {
      wIcon.style.backgroundImage = '';
      wSlot.classList.add('empty');
    }
  } else if (weapon && weapon.skill && weapon.skill.icon) {
    // Fallback for old weapon format
    wIcon.style.backgroundImage = `url(${weapon.skill.icon})`;
    wSlot.classList.remove('empty');
  } else if (weapon && weapon.skillIcon) {
    // Fallback for old weapon format
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

function updateWeaponPassive() {
  const weapon = STATE.selected.gear['weapons'];
  const weaponPassiveSlot = document.querySelector('[data-key="weapon-passive"]');
  const weaponPassiveIcon = weaponPassiveSlot.querySelector('.ability-icon');
  
  // Handle weapon passive skill
  if (weapon && weapon.passiveSkill) {
    const passiveSkill = STATE.skills.find(s => s.id === weapon.passiveSkill);
    if (passiveSkill && passiveSkill.icon) {
      weaponPassiveIcon.style.backgroundImage = `url(${passiveSkill.icon})`;
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
      helmPassiveIcon.style.backgroundImage = `url(${passiveSkill.icon})`;
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

function updateBasicAttackSkill() {
  const basicAttack = STATE.selected.gear['basic-attack'];
  const aSlot = document.querySelector('[data-key="A"]');
  const aIcon = aSlot.querySelector('.ability-icon');
  
  if (basicAttack && basicAttack.icon) {
    aIcon.style.backgroundImage = `url(${basicAttack.icon})`;
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
    qIcon.style.backgroundImage = `url(${weaponSkill.icon})`;
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
    console.log('No weapon selected or no basic attacks available');
    return;
  }
  
  // Get the basic attack skills
  const basicAttackSkills = weapon.basicAttacks.map(skillId => 
    STATE.skills.find(s => s.id === skillId)
  ).filter(skill => skill);
  
  if (basicAttackSkills.length === 0) {
    console.log('No basic attack skills found');
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
    console.log('No weapon selected or no weapon skills available');
    return;
  }
  
  // Get the weapon skills
  const weaponSkills = weapon.weaponSkills.map(skillId => 
    STATE.skills.find(s => s.id === skillId)
  ).filter(skill => skill);
  
  if (weaponSkills.length === 0) {
    console.log('No weapon skills found');
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
      background-image: url(${skill.icon});
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
    if (drifterInfoSection) drifterInfoSection.style.display = 'none';
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
      const imageName = drifterId === 'nyxa' ? 'nyxz' : drifterId;
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
  if (drifterInfoSection) drifterInfoSection.style.display = 'block';
  if (drifterName) drifterName.textContent = drifter.name;
  if (drifterDescription) drifterDescription.textContent = drifter.description || '';
  
  // Hide the "Select Drifter" text in the center
  if (avatarText) avatarText.style.display = 'none';
  updateDrifterAbilities(drifter);
  disableEquipmentSlots(false);
  
  // Show mastery section and update support effects
  console.log('About to call showMasterySection');
  showMasterySection();
  console.log('About to set mastery currentDrifter');
  STATE.mastery.currentDrifter = drifter;
  STATE.mastery.level = 1;
  console.log('About to call updateMasteryDisplay');
  updateMasteryDisplay();
  console.log('About to call updateSupportEffects with:', drifter);
  updateSupportEffects(drifter);
  console.log('updateSupportEffects call completed');
}

function updateDrifterAbilities(drifter) {
  console.log('Updating drifter abilities for:', drifter.name);
  
  // Debug panel removed
  
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
    case 'damage':
      return 'tag-damage';
    case 'shield':
      return 'tag-shield';
    case 'hard_control':
    case 'control':
      return 'tag-control';
    case 'buff':
      return 'tag-buff';
    case 'debuff':
      return 'tag-debuff';
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
    case 'hard_control':
      return 'tag-hard-control';
    case 'immobilize':
      return 'tag-immobilize';
    case 'pull':
      return 'tag-pull';
    case 'summon':
      return 'tag-summon';
    case 'stacking':
      return 'tag-stacking';
    case 'melee':
      return 'tag-melee';
    case 'elemental':
      return 'tag-elemental';
    case 'coordination':
      return 'tag-coordination';
    case 'illusion':
      return 'tag-illusion';
    case 'mp':
      return 'tag-mp';
    case 'dispel':
      return 'tag-dispel';
        case 'cleanse':
          return 'tag-cleanse';
        case 'dot':
          return 'tag-dot';
        case 'stacking':
          return 'tag-dot';
        case 'cooldown_reduction':
          return 'tag-cooldown';
        case 'cooldown':
          return 'tag-cooldown';
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
  console.log('=== updateSupportEffects called with:', drifter);
  if (!supportEffects || !supportList) {
    console.log('Support effects elements not found');
    return;
  }
  
  // Clear existing support effects
  supportList.innerHTML = '';
  
  if (!drifter || !drifter.support) {
    console.log('No drifter or support data, hiding support effects');
    supportEffects.style.display = 'none';
    updateSkillsVideo(null);
    return;
  }
  
  // Show support effects section
  console.log('Showing support effects for:', drifter.name);
  supportEffects.style.display = 'block';
  
  // Update skills video button
  console.log('About to call updateSkillsVideo');
  updateSkillsVideo(drifter);
  console.log('updateSkillsVideo call completed');
  
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
    skillsVideo.style.display = 'none';
    return;
  }
  
  // Always show the video section, but with different text based on whether there's a link
  skillsVideo.style.display = 'block';
  
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

// Initialize the application when DOM is ready
console.log('Script loaded on GitHub Pages');

// Fallback for older browsers
if (document.readyState === 'loading') {
  window.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded fired on GitHub Pages');
    init();
  });
} else {
  console.log('DOM already loaded, initializing immediately');
  init();
}

// Additional fallback
setTimeout(() => {
  if (!STATE.drifters || STATE.drifters.length === 0) {
    console.log('Fallback initialization triggered');
    init();
  }
}, 1000);
