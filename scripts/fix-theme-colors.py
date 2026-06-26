#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_colors(content):
    # Mapping of Emerald (Green) classes to Blue (Main Theme) classes
    replacements = {
        # Backgrounds
        'bg-emerald-950': 'bg-slate-950',
        'bg-emerald-900/20': 'bg-blue-900/20',
        'bg-emerald-900/30': 'bg-blue-900/30',
        'bg-emerald-900/50': 'bg-blue-900/50',
        'bg-emerald-800': 'bg-blue-800',
        'bg-emerald-700': 'bg-blue-700',
        'bg-emerald-600': 'bg-blue-600',
        'bg-emerald-500': 'bg-blue-500',
        'bg-emerald-400': 'bg-blue-400',
        
        # Text
        'text-emerald-500': 'text-blue-500',
        'text-emerald-400': 'text-blue-400',
        'text-emerald-300': 'text-blue-300',
        'text-emerald-200': 'text-blue-200',
        'text-emerald-100': 'text-blue-100',
        'text-emerald-50': 'text-blue-50',
        
        # Borders
        'border-emerald-800/30': 'border-blue-800/30',
        'border-emerald-700/50': 'border-blue-700/50',
        'border-emerald-500/20': 'border-blue-500/20',
        'border-emerald-800': 'border-blue-800',
        'border-emerald-700': 'border-blue-700',
        
        # Hover
        'hover:bg-emerald-800': 'hover:bg-blue-800',
        'hover:text-emerald-300': 'hover:text-blue-300',
        'hover:text-emerald-400': 'hover:text-blue-400',
        
        # Rings/Focus
        'focus:ring-emerald-500': 'focus:ring-blue-500',
        'ring-emerald-500/20': 'ring-blue-500/20',
        
        # Specific Hex Colors (if any)
        '#10b981': '#2563eb', # Success green to primary blue
        '#059669': '#1d4ed8',
        '#047857': '#1e40af',
        '#064e3b': '#1e3a8a',
        '#065f46': '#1e3a8a',
        '#022c22': '#0f172a',
        '#0d2e24': '#1e293b',
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Also handle the "emerald" string in complex class names
    content = re.sub(r'emerald-([0-9]+)', r'blue-\1', content)
    
    return content

def main():
    print("🎨 Starting Theme Color Fix (Green -> Blue)...")
    library_path = Path('html-code-library')
    updated_count = 0
    
    if not library_path.exists():
        print("❌ Error: html-code-library directory not found.")
        return

    for index_path in library_path.glob('**/index.html'):
        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = fix_colors(content)
            
            if new_content != content:
                with open(index_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ Fixed Theme: {index_path.relative_to(library_path)}")
                updated_count += 1
        except Exception as e:
            print(f"❌ Error processing {index_path}: {str(e)}")
            
    print(f"\n{'='*60}")
    print(f"✅ Theme Color Fix Complete!")
    print(f"📊 Total Library Tools Updated: {updated_count}")

if __name__ == '__main__':
    main()
