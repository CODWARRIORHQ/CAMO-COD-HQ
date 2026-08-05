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
    new_text = re.sub(r'(<span\s+class="site-name">).*?(</span>)', r"\1CAMO COD HQ\2", text)
    if new_text != text:
        file.write_text(new_text, encoding='utf-8')
        updated.append(str(file.relative_to(root)))

print('Updated files:', len(updated))
for f in updated:
    print(f)
