# Jakub CV – pokyny pro agenty

Statický vícejazyčný web bez npm aplikace. Vstupní stránky jsou `index.html`, `cs.html`, `en.html`; další stránky a podklady jsou v `cv/`, `en/` a složkách jednotlivých služeb.

- JavaScript a CSS jsou samostatné soubory v kořeni. Zachovej stávající strukturu a přepínání jazyků.
- `CNAME`, sitemap, robots a workflow Pages ovlivňují skutečný veřejný web; neměň je bez konkrétního zadání.
- Pracuj na větvi `ai/...` a připrav draft PR. Push do main spouští veřejné nasazení; žádný automatický merge.
- Osobní údaje ani obsah CV nevymýšlej. Při překladu zachovej význam a ověř oba jazyky.
- Před commitem spusť `python3 scripts/check-static.py`. U UI změny zkontroluj desktop a mobil 390 px, navigaci, konzoli a přetečení.
- Nedoplňuj sledování, cookies ani identifikátory návštěvníků bez zadání; čti stávající `consent.js`.
- Větší změnu rozděl na návrh, akceptační kritéria a úkoly. Testy a screenshoty uváděj jen pokud byly opravdu provedeny.
