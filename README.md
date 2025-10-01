# Character Loadout Builder

A modern, interactive character loadout builder for Warborne. Build and customize your drifter's equipment, skills, and abilities with an intuitive interface.

## Features

- **Drifter Selection**: Choose from various drifters with unique abilities and stats
- **Equipment System**: Equip weapons, armor (helm, chest, boots), and modifications
- **Skill Management**: View and manage core skills and passive abilities
- **Support Effects**: See how your drifter affects team performance
- **Real-time Stats**: View detailed statistics and bonuses
- **Responsive Design**: Works on desktop and mobile devices

## Data Structure

The application uses a modular JSON data structure:

- `data/drifters.json` - Drifter information and abilities
- `data/weapons.json` - Weapon data and skills
- `data/skills.json` - Skill definitions and effects
- `data/armor/` - Armor pieces (helmets, chests, boots)
- `data/mods/` - Weapon and armor modifications

## Development

### Local Development

1. Clone the repository
2. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server -p 8000
   ```
3. Open `http://localhost:8000` in your browser

### Adding New Content

1. **Drifters**: Add entries to `data/drifters.json`
2. **Weapons**: Add entries to `data/weapons.json`
3. **Skills**: Add entries to `data/skills.json`
4. **Armor**: Add entries to the appropriate files in `data/armor/`
5. **Mods**: Add entries to the appropriate files in `data/mods/`

### Data Format

Each data type follows a consistent structure with:
- Unique `id` for referencing
- `name` and `description` for display
- `stats` object for numerical values
- `icon` path for visual representation
- Relationships via ID references

## Deployment

This project is configured for GitHub Pages deployment. Simply push to the `main` branch and the site will be automatically deployed.

## License

MIT License - feel free to use and modify as needed.
