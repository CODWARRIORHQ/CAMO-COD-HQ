import os
from pathlib import Path

root = Path(__file__).resolve().parent
logo = root / 'MW 2019' / 'logo.png'
if not logo.exists():
    raise FileNotFoundError(f'Logo file not found: {logo}')

updated = []
for file in sorted(root.rglob('*.html')):
    text = file.read_text(encoding='utf-8')
    if '<div class="logo">CU</div>' not in text:
        # If the image is already present, only add CSS if missing.
        if '<div class="logo"><img' in text and '.logo-img' not in text:
            pass
        else:
            continue

    rel = os.path.relpath(logo, file.parent).replace('\\', '/')
    img_tag = f'<div class="logo"><img src="{rel}" alt="CAMO COD HQ logo" class="logo-img"'
    if file.name == 'index.html' and file.parent == root:
        img_tag += ' style="width: 34px; height: 34px; object-fit: cover;"'
    img_tag += '></div>'

    new_text = text.replace('<div class="logo">CU</div>', img_tag)
    if new_text == text and '<div class="logo"><img' not in text:
        continue

    if '.logo-img' not in new_text:
        idx = new_text.find('.logo {')
        if idx != -1:
            brace = new_text.find('{', idx)
            if brace != -1:
                depth = 1
                i = brace + 1
                while i < len(new_text) and depth:
                    if new_text[i] == '{':
                        depth += 1
                    elif new_text[i] == '}':
                        depth -= 1
                    i += 1
                if depth == 0:
                    insert_at = i
                    style = '\n        .logo-img {\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n            display: block;\n        }\n'
                    new_text = new_text[:insert_at] + style + new_text[insert_at:]
    if new_text != text:
        file.write_text(new_text, encoding='utf-8')
        updated.append(str(file))

print('Updated files:', len(updated))
for f in updated:
    print(f)
