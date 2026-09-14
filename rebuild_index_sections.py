from pathlib import Path
import re

root = Path(r'c:\Users\Dell\OneDrive\Desktop\Company-Website')
index_path = root / 'index.html'
text = index_path.read_text(encoding='utf-8')

section_names = ['hero', 'stack', 'section3', 'section4', 'section5', 'section6']
section_classes = ['home-hero', 'home-stack', 'home-section3', 'home-section4', 'home-section5', 'home-section6']

patterns = [
    r'\n\s*\*\{[^}]*\}\n',
    r'\n\s*html\{[^}]*\}\n',
    r'\n\s*body\{[^}]*\}\n',
    r'\n\s*button,\s*a\{[^}]*\}\n',
    r'\n\s*a\{[^}]*\}\n',
]


def sanitize_style(style: str) -> str:
    cleaned = style
    for pattern in patterns:
        cleaned = re.sub(pattern, '\n', cleaned, flags=re.S)
    return cleaned


def extract_body(file_name: str) -> str:
    file_path = root / 'home' / f'{file_name}.html'
    html = file_path.read_text(encoding='utf-8')
    match = re.search(r'<body[^>]*>([\s\S]*?)</body>', html, re.I)
    if not match:
        raise RuntimeError(f'Could not find <body> in {file_path}')

    body = match.group(1).strip()
    body = body.replace('../assets/', 'assets/')

    body = re.sub(
        r'(?is)<style>([\s\S]*?)</style>',
        lambda m: f'<style>{sanitize_style(m.group(1))}</style>',
        body,
    )

    return body

start_marker = '<!-- ================= HOME SECTIONS (embedded as standalone files) ================= -->'
end_marker = '<!-- ================= FOOTER ================= -->'
start_index = text.index(start_marker)
end_index = text.index(end_marker)

sections_html = []
for file_name, section_class in zip(section_names, section_classes):
    body = extract_body(file_name)
    sections_html.append(f'<div class="home-section {section_class}">\n{body}\n</div>\n')

replacement = start_marker + '\n' + ''.join(sections_html) + '\n' + end_marker
new_text = text[:start_index] + replacement + text[end_index + len(end_marker):]
index_path.write_text(new_text, encoding='utf-8')
print('Rebuilt index.html with direct embedded home section bodies and cleaned style blocks.')