"""Syntax checks for the existing static site; no network or publishing."""
import subprocess
from pathlib import Path
from html.parser import HTMLParser
root = Path(__file__).resolve().parents[1]
html = list(root.glob('*.html'))
assert html, 'No entry pages found'
for page in html:
    parser = HTMLParser(convert_charrefs=True)
    parser.feed(page.read_text())
    parser.close()
for script in sorted(root.glob('*.js')):
    subprocess.run(['node', '--check', str(script)], check=True)
print(f'PASS: parsed {len(html)} entry pages and checked JavaScript syntax')
