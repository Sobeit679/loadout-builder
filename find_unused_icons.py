import os
import re
import json

# Get all icon files in assets/icons
icon_files = set()
for file in os.listdir('assets/icons'):
    if file.endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
        icon_files.add(file)

print(f"Total icon files: {len(icon_files)}")

# Get all referenced icon files from JSON data files
referenced_files = set()

# Check all JSON files in data directory
for root, dirs, files in os.walk('data'):
    for file in files:
        if file.endswith('.json'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Find all icon references
                    matches = re.findall(r'\./assets/icons/([^"]+)', content)
                    for match in matches:
                        referenced_files.add(match)
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

# Check JavaScript files
for file in ['scripts.js', 'scripts/utils.js']:
    if os.path.exists(file):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = re.findall(r'\./assets/icons/([^"]+)', content)
                for match in matches:
                    referenced_files.add(match)
        except Exception as e:
            print(f"Error reading {file}: {e}")

print(f"Referenced icon files: {len(referenced_files)}")

# Find unused files
unused_files = icon_files - referenced_files
print(f"Unused icon files: {len(unused_files)}")

if unused_files:
    print("\nUnused files:")
    for file in sorted(unused_files):
        print(f"  {file}")
else:
    print("\nAll icon files are referenced!")

# Find missing files (referenced but don't exist)
missing_files = referenced_files - icon_files
if missing_files:
    print(f"\nMissing files ({len(missing_files)}):")
    for file in sorted(missing_files):
        print(f"  {file}")
