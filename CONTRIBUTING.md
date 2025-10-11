# Contributing Guidelines

Thank you for your interest in contributing to the Loadout Builder project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [File Structure](#file-structure)
- [Data Format Guidelines](#data-format-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Questions and Support](#questions-and-support)

## Code of Conduct

This project follows a code of conduct that ensures a welcoming environment for all contributors. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Git
- A modern web browser
- Text editor or IDE of your choice

### Local Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/loadout-builder.git
cd loadout-builder

# Add the original repository as upstream
git remote add upstream https://github.com/Sobeit679/loadout-builder.git

# Create a new branch for your changes
git checkout -b feature/your-feature-name
```

## Contributing Process

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix issues in existing functionality
- **New features**: Add new skills, weapons, armor, or game mechanics
- **Data updates**: Update skill descriptions, stats, or other game data
- **UI/UX improvements**: Enhance the user interface or user experience
- **Documentation**: Improve or add documentation
- **Performance improvements**: Optimize code or data loading

### Workflow

1. **Check existing issues** - Look for existing issues or discussions about your intended change
2. **Create an issue** - If no relevant issue exists, create one to discuss your proposed changes
3. **Fork and branch** - Create a fork and a new branch for your work
4. **Make changes** - Implement your changes following our coding standards
5. **Test thoroughly** - Ensure your changes work as expected
6. **Update documentation** - Update relevant documentation if needed
7. **Submit PR** - Create a pull request with a clear description

## Coding Standards

### General Guidelines

- **Consistency**: Follow existing code patterns and conventions
- **Readability**: Write clear, self-documenting code
- **Comments**: Add comments for complex logic or non-obvious decisions
- **File naming**: Use kebab-case for file names (e.g., `skill-data.json`)

### JavaScript Standards

- Use modern JavaScript (ES6+)
- Use meaningful variable and function names
- Prefer `const` and `let` over `var`
- Use arrow functions where appropriate
- Follow consistent indentation (2 spaces)

### CSS Standards

- Use meaningful class names
- Follow BEM methodology when appropriate
- Use consistent spacing and formatting
- Group related styles together

## File Structure

```text
loadout-builder/
├── assets/
│   └── icons/           # Skill and item icons
├── data/
│   ├── armor/          # Armor data files
│   ├── mods/           # Mod data files
│   ├── skills.json     # Skills data
│   ├── weapons.json    # Weapons data
│   └── drifters.json   # Drifter data
├── scripts/
│   └── utils.js        # Utility functions
├── index.html          # Main HTML file
├── scripts.js          # Main JavaScript file
├── styles.css          # Main CSS file
└── mobile.css          # Mobile-specific styles
```

## Data Format Guidelines

### JSON Structure

All data files should follow consistent JSON formatting:

- **Indentation**: Use 2 spaces for indentation
- **Arrays**: Format arrays horizontally when possible (especially for tags)
- **Strings**: Use double quotes for all strings
- **Consistency**: Maintain consistent property ordering

### Skills Data (`skills.json`)

Each skill should include:

```json
{
  "id": "skill-name",
  "name": "Skill Name",
  "type": "core-skill|active|passive|basic-attack",
  "tags": ["tag1", "tag2", "tag3"],
  "mpCost": 25,
  "cooldown": "24s",
  "range": "18m",
  "description": "Skill description text",
  "icon": "./assets/icons/skill-icon.png"
}
```

### Required Properties

- `id`: Unique identifier (kebab-case)
- `name`: Display name (Title Case)
- `type`: Skill type category
- `tags`: Array of relevant tags
- `description`: Detailed skill description

### Optional Properties

- `mpCost`: Mana/MP cost (number)
- `cooldown`: Cooldown time (string with 's' suffix)
- `range`: Skill range (string with 'm' suffix)
- `icon`: Path to skill icon

### Data Validation

Before submitting changes:

1. **JSON Syntax**: Ensure all JSON files are valid
2. **Required Fields**: Verify all required properties are present
3. **Data Types**: Check that property types match expected formats
4. **Consistency**: Ensure naming conventions are followed
5. **No Duplicates**: Verify no duplicate IDs exist

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All JSON files are valid and properly formatted
- [ ] No duplicate skill/item IDs
- [ ] Changes are tested and working
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Data update
- [ ] UI/UX improvement
- [ ] Documentation update
- [ ] Performance improvement

## Changes Made
- List specific changes made
- Include any new files added
- Note any files modified

## Testing
- [ ] Tested locally
- [ ] All existing functionality still works
- [ ] New features work as expected

## Screenshots (if applicable)
Add screenshots for UI changes.

## Additional Notes
Any additional information or context.
```

### Review Process

1. **Automated Checks**: All PRs are checked for JSON validity and formatting
2. **Code Review**: At least one maintainer will review the changes
3. **Testing**: Changes are tested in the live environment
4. **Approval**: Once approved, changes are merged

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, and any relevant details
- **Screenshots**: If applicable

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the proposed feature
- **Use Case**: Why this feature would be useful
- **Proposed Implementation**: Any ideas on how to implement it
- **Alternatives**: Other solutions you've considered

## Questions and Support

- **GitHub Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for general questions and ideas
- **Code Review**: Ask questions in pull request comments

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the Loadout Builder project! Your contributions help make this tool better for everyone.
