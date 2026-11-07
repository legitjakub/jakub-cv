"""Exercise the site checker against broken nested pages, not source strings."""
import subprocess
import tempfile
import unittest
from pathlib import Path

CHECKER = Path(__file__).with_name('check-static.py')

class StaticChecks(unittest.TestCase):
    def run_site(self, body, sitemap=True):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'nested').mkdir()
            (root / 'index.html').write_text('<html lang="cs"><head><link rel="canonical" href="https://jhrncir.xyz/"></head><body><h1>Home</h1></body></html>')
            (root / 'nested/index.html').write_text('<html lang="cs"><head><link rel="canonical" href="https://jhrncir.xyz/nested/"></head><body><h1>Nested</h1>' + body + '</body></html>')
            if sitemap:
                nested = '' if 'http-equiv="refresh"' in body else '<url><loc>https://jhrncir.xyz/nested/</loc></url>'
                (root / 'sitemap.xml').write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://jhrncir.xyz/</loc></url>' + nested + '</urlset>')
            return subprocess.run(['python3', str(CHECKER), str(root)], capture_output=True, text=True)

    def test_valid_nested_page_passes(self):
        self.assertEqual(self.run_site('<p>Content</p>').returncode, 0)

    def test_missing_asset_in_nested_page_fails(self):
        result = self.run_site('<img src="/missing.webp" alt="Preview">')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('missing.webp', result.stdout + result.stderr)

    def test_malformed_jsonld_fails(self):
        result = self.run_site('<script type="application/ld+json">{bad}</script>')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('JSON-LD', result.stdout + result.stderr)

    def test_broken_anchor_fails(self):
        result = self.run_site('<a href="/#missing">Home section</a>')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('missing', result.stdout + result.stderr)

    def test_schema_answer_must_match_visible_faq(self):
        result = self.run_site('<details><summary>A question?</summary><p>Visible answer.</p></details><script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"name":"A question?","acceptedAnswer":{"text":"Different answer."}}]}</script>')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('FAQ', result.stdout + result.stderr)

    def test_wrong_language_target_fails(self):
        result = self.run_site('<link rel="alternate" hreflang="en" href="https://jhrncir.xyz/nested/">')
        self.assertNotEqual(result.returncode, 0)

    def test_external_language_target_fails(self):
        result = self.run_site('<link rel="alternate" hreflang="en" href="https://example.com/">')
        self.assertNotEqual(result.returncode, 0)

    def test_omitted_faq_schema_entry_fails(self):
        result = self.run_site('<section id="faq"><details><summary>One?</summary><p>First.</p></details><details><summary>Two?</summary><p>Second.</p></details></section><script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"name":"One?","acceptedAnswer":{"text":"First."}}]}</script>')
        self.assertNotEqual(result.returncode, 0)

    def test_missing_sitemap_fails(self):
        self.assertNotEqual(self.run_site('<p>Content</p>', sitemap=False).returncode, 0)

    def test_missing_responsive_image_fails(self):
        self.assertNotEqual(self.run_site('<img alt="Portrait" srcset="/missing.webp 480w">').returncode, 0)

    def test_valid_redirect_passes(self):
        self.assertEqual(self.run_site('<link rel="canonical" href="https://jhrncir.xyz/"><meta http-equiv="refresh" content="0; url=/">').returncode, 0)

    def test_broken_redirect_destination_fails(self):
        self.assertNotEqual(self.run_site('<meta http-equiv="refresh" content="0; url=/missing/">').returncode, 0)

if __name__ == '__main__':
    unittest.main()
