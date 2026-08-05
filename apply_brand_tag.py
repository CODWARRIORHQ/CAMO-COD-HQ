import os
import re
from pathlib import Path

root = Path.cwd()
root_index = root / 'index.html'
updated = []

for file in sorted(root.rglob('*.html')):
    if file.resolve() == root_index.resolve():
        continue
    text = file.read_text(encoding='utf-8')
    original = text
    # Replace static site-tag text in all files except root index.html.
    text = re.sub(r'(<small\s+class="site-tag">).*?(</small>)', r"\1Tu hub de camuflajes\2", text, flags=re.DOTALL)
    if file.name == 'Camos UEM.html' and 'data-i18n="brand.tag"' in text:
        text = re.sub(r"('brand.tag':\s*)'[^']*'", r"\1'Tu hub de camuflajes'", text)
        text = re.sub(r'("brand.tag":\s*)"[^"]*"', r'\1"Tu hub de camuflajes"', text)
        text = re.sub(r"('brand.tag':\s*)'[^']*'", r"\1'Tu hub de camuflajes'", text)
        # also update other languages to matching translations if present
        text = text.replace("'brand.tag': 'Example portal'", "'brand.tag': 'Your camouflage hub'")
        text = text.replace("'brand.tag': 'Portail d’exemples'", "'brand.tag': 'Votre hub de camouflages'")
    if text != original:
        file.write_text(text, encoding='utf-8')
        updated.append(str(file.relative_to(root)))

print('Updated files:', len(updated))
for f in updated:
    print(f)
