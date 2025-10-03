# Character Loadout Builder

A modern, interactive character loadout builder for Warborne. Build and customize your drifter's equipment, skills, and abilities with an intuitive interface.

## ✨ Features

### 🎯 Core Functionality
- **Drifter Selection**: Choose from various drifters with unique abilities and stats
- **Equipment System**: Equip weapons, armor (helm, chest, boots), and modifications
- **Skill Management**: View and manage core skills, passive skills, and weapon abilities
- **Real-time Stats**: View detailed stats and bonuses with mastery system

### 🔍 Advanced Features
- **Smart Search**: Search equipment and mods by name, skill tags, descriptions, and stats
- **Slot-Specific Mods**: Chest and boots mods with unique effects
- **Mod System**: 30+ weapon mods and 26+ armor mods with detailed descriptions
- **Loadout Sharing**: Export, import, and share loadouts with compact codes
- **Mastery System**: Level up drifters with stat bonuses and skill unlocks
- **Custom Tooltips**: Hover over equipment for detailed information

### 📱 User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Intuitive Interface**: Clean, modern UI with easy navigation
- **Real-time Updates**: Instant feedback when changing equipment
- **Keyboard Shortcuts**: Quick access to common functions

## 📁 Data Structure

The application uses a modular JSON data structure:

| File/Directory | Description | Content |
|---|---|---|
| `data/drifters.json` | Drifter information and abilities | 8+ drifters with unique stats |
| `data/weapons.json` | Weapon data and skills | 20+ weapons across 4 types |
| `data/skills.json` | Skill definitions and effects | 100+ skills with detailed effects |
| `data/armor/helmets.json` | Helmet pieces | 20+ helmets with passive skills |
| `data/armor/chests.json` | Chest pieces | 20+ chests with core skills |
| `data/armor/boots.json` | Boot pieces | 20+ boots with core skills |
| `data/mods/weapon-mods.json` | Weapon modifications | 30+ mods with unique effects |
| `data/mods/armor-mods.json` | Armor modifications | 26+ mods (universal + slot-specific) |

## 🎮 Weapon Types

- **Daggers**: Fast, agile weapons with critical hit bonuses
- **Maces**: Heavy weapons with crowd control effects
- **Axes**: Balanced weapons with area damage
- **Swords**: Versatile weapons with defensive capabilities

## 🛡️ Armor System

### Universal Mods (20)
Available for all armor slots with defensive and utility effects

### Slot-Specific Mods
- **Chest Mods (3)**: Intimidate, Charge Up, Pain Relief
- **Boots Mods (3)**: Protection, Deception, Divine Blessing

## 🚀 Quick Start

1. **Select a Drifter**: Choose your character from the drifter selection
2. **Equip Weapons**: Pick from daggers, maces, axes, or swords
3. **Choose Armor**: Select helmet, chest, and boots with unique skills
4. **Add Mods**: Enhance equipment with weapon and armor modifications
5. **Share Loadouts**: Export and share your builds with others

## 🔧 Development

### Adding New Content

| Content Type | File Location | Instructions |
|---|---|---|
| **Drifters** | `data/drifters.json` | Add new drifter entries with unique IDs |
| **Weapons** | `data/weapons.json` | Add weapon data and associated skills |
| **Skills** | `data/skills.json` | Define skill effects and descriptions |
| **Armor** | `data/armor/` | Add to appropriate armor category files |
| **Modifications** | `data/mods/` | Add weapon and armor mods |

### Data Format Standards

Each data entry follows a consistent structure:

- **Unique ID**: For referencing and relationships
- **Display Information**: Name and description
- **Statistics**: Numerical values in stats object
- **Visual Assets**: Icon path for representation
- **Relationships**: ID-based references between items

### Search System

The application includes a comprehensive search system:

- **Equipment Search**: Find weapons and armor by name or skill tags
- **Mod Search**: Search mods by name, description, or stats
- **Skill Tag Search**: Filter by skill categories (damage, control, etc.)
- **Real-time Filtering**: Instant results as you type

### Loadout Sharing

- **Compact Codes**: Optimized export format for easy sharing
- **URL Sharing**: Share loadouts via direct links
- **Import/Export**: Save and load custom builds
- **Backward Compatibility**: Supports old loadout formats

## 🎮 Credits

- **Game**: [Warborne](https://warborne.qoolandgames.com/) - All in-game assets belong to Qooland Games
- **Tool**: Fan-made loadout builder (not officially affiliated)

## 📄 License

MIT License - feel free to use and modify as needed.
