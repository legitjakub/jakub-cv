"""Validate every static page, local destination, language pair and FAQ. No network."""
import json
import re
import subprocess
import sys
from collections import Counter
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ORIGIN = 'https://jhrncir.xyz'
def normal(value):
    return ' '.join(unescape(value).split())

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs, self.alternates = path, [], [], []
        self.canonical, self.noindex, self.redirect, self.h1 = None, False, False, 0
        self.schemas, self.json_buffer, self.in_json = [], '', False
        self.details, self.detail, self.in_summary = {}, None, False
        self.lang, self.redirect_url = None, None
        self.section_depth, self.faq_depth, self.faq_questions = 0, None, set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html': self.lang = attrs.get('lang', '').split('-')[0]
        if tag == 'section':
            self.section_depth += 1
            if attrs.get('id') == 'faq': self.faq_depth = self.section_depth
        if attrs.get('id'): self.ids.append(attrs['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'meta':
            self.noindex |= attrs.get('name') == 'robots' and 'noindex' in attrs.get('content', '')
            self.redirect |= attrs.get('http-equiv', '').lower() == 'refresh'
            if attrs.get('http-equiv', '').lower() == 'refresh':
                match = re.search(r'url\s*=\s*[\"\x27]?([^\"\x27]+)', attrs.get('content', ''), re.I)
                self.redirect_url = match[1].strip() if match else None
        if tag == 'link':
            if attrs.get('rel') == 'canonical': self.canonical = attrs.get('href')
            if attrs.get('rel') == 'alternate' and attrs.get('hreflang') in ('cs', 'en'):
                self.alternates.append((attrs['hreflang'], attrs.get('href', '')))
            if attrs.get('rel') in ('stylesheet', 'icon', 'apple-touch-icon', 'preload', 'manifest') and attrs.get('href'):
                self.refs.append(attrs['href'])
        if tag == 'a' and attrs.get('href'): self.refs.append(attrs['href'])
        for key in ('src', 'poster'):
            if attrs.get(key): self.refs.append(attrs[key])
        for key in ('srcset', 'imagesrcset'):
            if attrs.get(key) and not attrs[key].startswith('data:'):
                self.refs.extend(candidate.strip().split()[0] for candidate in attrs[key].split(',') if candidate.strip())
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.in_json, self.json_buffer = True, ''
        if tag == 'details': self.detail = {'question': '', 'answer': '', 'faq': self.faq_depth is not None}
        if tag == 'summary' and self.detail is not None: self.in_summary = True

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json:
            try: self.schemas.append(json.loads(self.json_buffer))
            except ValueError as error: raise ValueError(f'JSON-LD: {error}')
            self.in_json = False
        if tag == 'summary': self.in_summary = False
        if tag in ('p', 'li', 'br') and self.detail is not None and not self.in_summary:
            self.detail['answer'] += ' '
        if tag == 'details' and self.detail is not None:
            question = normal(self.detail['question']).rstrip('+− ').strip()
            self.details[question] = normal(self.detail['answer'])
            if self.detail['faq']: self.faq_questions.add(question)
            self.detail = None
        if tag == 'section':
            if self.faq_depth == self.section_depth: self.faq_depth = None
            self.section_depth -= 1

    def handle_data(self, value):
        if self.in_json: self.json_buffer += value
        elif self.detail is not None:
            self.detail['question' if self.in_summary else 'answer'] += value


def objects(value):
    if isinstance(value, dict):
        yield value
        for child in value.values(): yield from objects(child)
    elif isinstance(value, list):
        for child in value: yield from objects(child)


def check(root):
    errors, pages = [], {}
    for path in sorted(root.rglob('*.html')):
        if any(part in ('.git', 'node_modules', '.worktrees', '.superpowers', 'tmp') for part in path.relative_to(root).parts): continue
        page = Page(path)
        try: page.feed(path.read_text()); page.close()
        except (ValueError, OSError) as error: errors.append(f'{path.relative_to(root)}: {error}'); continue
        pages[path] = page
    if not pages: errors.append('No HTML pages found')

    def destination(source, value, anchor=True):
        url = urlsplit(value)
        if url.scheme and (url.scheme not in ('http', 'https') or url.netloc != 'jhrncir.xyz'): return None
        if url.netloc and url.netloc != 'jhrncir.xyz': return None
        path = unquote(url.path)
        target = ((root / path.lstrip('/')) if path.startswith('/') else source.parent / path).resolve() if path else source
        if target.is_dir(): target /= 'index.html'
        if not target.exists(): errors.append(f'{source.relative_to(root)}: missing {value}'); return None
        if anchor and url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{source.relative_to(root)}: missing anchor {value}')
        return target

    for path, page in pages.items():
        label = path.relative_to(root)
        if not page.redirect and page.h1 != 1: errors.append(f'{label}: expected one H1, got {page.h1}')
        duplicate = [value for value, count in Counter(page.ids).items() if count > 1]
        if duplicate: errors.append(f'{label}: duplicate IDs {duplicate}')
        if not page.canonical: errors.append(f'{label}: missing canonical')
        elif not page.redirect and destination(path, page.canonical) != path: errors.append(f'{label}: canonical does not identify this page')
        if page.redirect:
            target = destination(path, page.redirect_url) if page.redirect_url else None
            canonical_target = destination(path, page.canonical) if page.canonical else None
            if not target or target != canonical_target: errors.append(f'{label}: redirect destination and canonical do not match')
        for value in page.refs: destination(path, value)
        for lang, url in page.alternates:
            target = destination(path, url)
            other = pages.get(target)
            if other is None or other.lang != lang:
                errors.append(f'{label}: invalid language target for {lang}: {url}')
            if other and not any(link == page.canonical for _, link in other.alternates):
                errors.append(f'{label}: language link is not reciprocal: {url}')
        schema_questions = set()
        for schema in page.schemas:
            for obj in objects(schema):
                for key in ('url', 'item', 'mainEntityOfPage', 'contentUrl', 'thumbnailUrl', 'embedUrl'):
                    if isinstance(obj.get(key), str): destination(path, obj[key], anchor=False)
                if obj.get('@type') == 'FAQPage':
                    for question in obj.get('mainEntity', []):
                        name = normal(question.get('name', ''))
                        schema_questions.add(name)
                        answer = normal(question.get('acceptedAnswer', {}).get('text', ''))
                        if page.details.get(name) != answer:
                            errors.append(f'{label}: FAQ does not match visible answer: {name}')
        if page.faq_questions and page.faq_questions != schema_questions:
            errors.append(f'{label}: FAQ schema must cover every visible FAQ question')
    sitemap = root / 'sitemap.xml'
    if not sitemap.exists(): errors.append('Missing sitemap.xml')
    if sitemap.exists():
        listed = {item.text for item in ET.parse(sitemap).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
        expected = {page.canonical for page in pages.values() if not page.redirect and not page.noindex and page.canonical}
        if listed != expected: errors.append(f'Sitemap mismatch: missing {sorted(expected-listed)}, extra {sorted(listed-expected)}')
    for script in sorted(root.glob('*.js')):
        result = subprocess.run(['node', '--check', str(script)], capture_output=True, text=True)
        if result.returncode: errors.append(result.stderr)
    if errors:
        print('\n'.join(errors)); return 1
    print(f'PASS: {len(pages)} HTML pages, {sum(len(p.schemas) for p in pages.values())} JSON-LD blocks, local links/assets, language pairs, FAQ and JavaScript syntax')
    return 0

if __name__ == '__main__':
    sys.exit(check(Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]))
