# Character Loadout Builder

A modern, interactive character loadout builder for Warborne. Build and customize your drifter's equipment, skills, and abilities with an intuitive interface.

## ✨ Features

- **Drifter Selection**: Choose from various drifters with unique abilities and stats
- **Equipment System**: Equip weapons, armor (helm, chest, boots), and modifications
- **Skill Management**: View and manage core skills
- **Support Effects**: See how your drifter affects team performance
- **Real-time Stats**: View detailed stats and bonuses
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Data Structure

The application uses a modular JSON data structure:

| File/Directory | Description |
|---|---|
| `data/drifters.json` | Drifter information and abilities |
| `data/weapons.json` | Weapon data and skills |
| `data/skills.json` | Skill definitions and effects |
| `data/armor/` | Armor pieces (helmets, chests, boots) |
| `data/mods/` | Weapon and armor modifications |

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Local web server (for development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loadout-builder
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server -p 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

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

## 📄 License

MIT License - feel free to use and modify as needed.
