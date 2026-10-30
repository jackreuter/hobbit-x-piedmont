# The Hobbit Cube: project context

A single-page site for a friend group's Magic: The Gathering cube (Hobbit-set cards plus cards found at Piedmont Middle School). It shows deck standings, each deck's card list, a shared Best/Worst card list, and the full cube with search and color filters.

Owner: Jack. Players so far: Jack, Tim, Furf, Eric.

## How it runs

```
GitHub Pages (index.html, static)  ──fetch──►  Google Apps Script web app  ──►  Google Sheet
         │                                      (apps-script/Code.gs)          (owner's personal Google account)
         └── card images + mana symbols: Scryfall (hotlinked images; mana SVGs embedded as data URIs)
```

- **Live page:** `index.html` hosted on GitHub Pages from Jack's repo. GitHub republishes on every commit.
- **API:** `https://script.google.com/macros/s/AKfycbxFdb2bvsBVpN58jxoZFIOgIcxyCRuXZNTA7jNLoZF7BEgJUg7eMwhZ_LOj3IPB_h8/exec`
  - Changing `Code.gs` requires **Deploy → Manage deployments → pencil → New version → Deploy** (keeps the same URL). Saving alone does not change what's live.
- **Sheet** (created by the script's `setup()`, named "Hobbit x Piedmont Cube"). Tabs:
  - `Best & Worst`: Tier (Best/Worst) | Card | ID | Added. Editable by hand; the page reads it on every load.
  - `Decks`: Key | Deck | Pilot | Wins | Losses | Updated | Date | Colors | Splash | Cards | Sideboard. One row per deck; a **draft is every deck sharing a Date**. Colors/Splash are letters ("U R"), Cards (main deck) and Sideboard are space-separated card ids.
  - `Log`: every change made from the page.
  - `Cube YYYY-MM-DD`: one tab per cube version. Columns Name | Set | Number. **The page shows the newest-dated tab.** Name alone is enough; Set/Number pick a printing. Duplicate names are ignored (first row wins). New versions are made by duplicating the latest tab, renaming it with the date, and editing rows.
- There is also a private claude.ai artifact version of the page (uses the claude.ai `db` capability instead of the sheet). It is not the source of truth and does not read the sheet. GitHub + Sheet is canonical.

## API contract (Code.gs)

`GET` → `{ top: [cardId], bottom: [cardId], decks: { [deckKey]: {name, pilot, w, l, date, colors, splash, cards, sideboard} }, cube: { version: "YYYY-MM-DD", cards: [{name, set, num}] } | null }`

`POST` (body is JSON sent as text/plain to avoid a CORS preflight; Apps Script can't answer OPTIONS):
- Tier change: `{ id, tier: "top" | "bottom" | null, name }`
- Deck create/replace (deck form): `{ type: "deck", key, name, pilot, date: "YYYY-MM-DD", w, l, colors, splash, cards: [ids], sideboard: [ids] }`. Without `cards`, the saved colors/cards are kept.
- Record only (main-page steppers): `{ type: "record", key, w, l }`
- Delete: `{ type: "deleteDeck", key }`
- OCR (deck form photos): `{ type: "ocr", image: base64 JPEG ≤ 2 MB }` → `{ text }`, via Google Drive OCR; no lock.

Every POST returns the full GET state. The script takes about 3 s per request and uses a script lock (30 s wait). The page sends POSTs **one at a time** through a queue with one retry; firing them in parallel caused "couldn't save" errors before.

Script validation: ids/keys match `^[a-z0-9-]{1,40}$`; text cells that start with `= + - @` are prefixed with `'` to block formula injection.

## Identifiers

- **Card id**: `"{set}-{collector_number}"`, lowercase, from Scryfall (e.g. `hob-126` = Gigantic Big Bear). One odd one: `plst-dmr-118` (Empty the Warrens, set `plst`, number `DMR-118`).
- **Deck key**: Draft I decks are `d{draftId}-{player lowercased}` (e.g. `d1-jack`); decks made in the form get `k` + base-36 timestamp.
- Values saved in the sheet override the defaults built into the page. The page never shows built-in records while the sheet is loading: first visit shows "Loading…", repeat visits show the last state cached in localStorage (`cube-state`), and a failed load falls back to built-ins with a message.

## Repo layout (this export)

| Path | What |
|---|---|
| `index.html` | Built, deployable page (current). |
| `src/page.html` | Source page, including the Apps Script sync code (API URL hard-coded). Draft I data in `<script id="ledger">` (now only a fallback; the sheet is the source), cube in `<script id="cube">`, older cut cards in `<script id="catalog">`. Rackham art and mana symbols are inlined as data URIs. |
| `build.py` | `python3 build.py` → `index.html`. Embeds the cube and catalog with Scryfall image URLs and wraps the page in a document. |
| `apps-script/Code.gs` | Google Apps Script backend. |
| `data/cube-current.json` | Current cube, 371 cards (version 2026-10-16). Fields: id, name, ci (color identity), land?, img?. |
| `data/cube-2026-10-12.json` | The cube as drafted in Draft I (370 cards). |
| `data/catalog.json` | Every card ever in the cube (cut cards included, so old deck lists still render). |
| `data/hob-set.json` | Scryfall data for The Hobbit set (`hob`). |
| `data/draft1-pools.json` | Draft I card ids by player (each ~45 cards incl. sideboard). |
| `data/Cube 2026-10-12.csv`, `data/Cube 2026-10-16.csv` | Cube versions formatted for import as sheet tabs. |
| `art/` | Arthur Rackham illustrations (public domain, from Project Gutenberg #48214 and #49507), already converted to brown-ink PNGs. |

## Data model in the page

- `ledger.drafts[]`: `{id, date, status, decks: [{player, colors, splash?, archetype, colorName, cards: [ids], basics}], matches: [{winner, loser}], champion}`. Draft I is dated 2026-10-12. Sheet values (name, pilot, date, record) override these.
- Color grouping uses **color identity**, `land` from the front-face type line. Groups: W U B R G, M (2+ colors), C (no colors), L (lands). Known quirks the owner has accepted: My Precious // Allure of Power counts as black; Bagel and Schmear as white; Whirlwing Stormbrood as multicolor (GU).
- Bilbo, Luckwearer: the owner has two physical copies but it **counts once**.
- Current counts (2026-10-16): W 50, U 50, B 50, R 50, G 50, M 61, C 30, Lands 30 = 371.

## Draft I (2026-10-12)

| Deck | Pilot | Colors | Basics |
|---|---|---|---|
| Big Bear | Furf | G + splash W, U | 5 Forest, 2 Island, 1 Plains |
| Dwarf Control | Jack | U R | 8 Island, 5 Mountain |
| Goblins & Artifacts | Tim | R + splash W, U, B | none seen |
| Fliers & Sacrifice | Eric | W B | 3 Plains, 4 Swamp |

Draft I card lists and colors were copied into the sheet on 2026-10-29. Each deck's "cards" is the whole 45-card pool (no main/sideboard split recorded); pilots can split them with ⇄ in the form.

## Cube history

- **2026-10-12** (Draft I): 370 cards, built from photos of the owner's piles.
- **2026-10-16**: Cut Ruinous Rampage, Alexios, Goblin Tunneler, Hullcarver, Susurian Voidborn, Infectious Horror, The Revelations of Ezio, Fall of the First Civilization, Shoulder to Shoulder, Dual-Sun Technique, Supportive Parents, Timberland Guide, Sage of Lat-Nam, Faerie Mechanist, Shorikai. Added Stone-Giant of High Pass, Last Light of Durin's Day, Tidings of War, Head of the Hunt, Supper for Spiders, Gollum, Riddle Master, An Unexpected Party, Lake-town Toymaker, The Eagles Are Coming!, The Notary Hobbits, Down in the Valley, The Lord of the Eagles, Fateful Discovery, Bard's Company, Thranduil, the Elvenking. Colorless reworked: cut Gleaming Barrier, Inscribed Tablet, Iron Bully, Iron League Steed, Pyramid of the Pantheon, Roving Keep, Sandstone Oracle, Sisay's Ring, Traveler's Amulet, Vulshok Gauntlets; added Cathar's Shield, Goldvein Pick, Containment Construct, Myr Retriever, Swiftfoot Boots, Armory Automaton, Loxodon Warhammer, Bonehoard, Towashi Guide-Bot, Trading Post, Coat of Arms. (Hookblade and Restart Sequence were briefly cut, then kept.)

## Deploying

- Site: edit `src/page.html`, run `python3 build.py`, commit `index.html`, push to `main`.
- Apps Script: `apps-script/` is linked with clasp. `clasp push --force`, then `clasp create-deployment --deploymentId <live id>` (keeps the URL). Permissions are listed in `apps-script/appsscript.json`; adding one needs the owner to run an authorize function in the editor.
- `draft.html` + `cards.json`: deck form (add / edit / delete). Draft (existing or new date), pilot, name, record, then Main Deck and Sideboard piles filled from photos (Drive OCR, fuzzy-matched to card names; basic lands skipped) or by name. × removes, ⇄ moves between piles. Colors are read-only from the main deck: 4+ cards of a color = main, 1–3 = splash. `cards.json` is the cube + catalog; regenerate it when the cube data changes.

## Design decisions and owner preferences

- Title "The Hobbit Cube". Hobbit-hole door SVG was replaced by a framed Rackham dragon-hoard plate; there's no Piedmont crest.
- Fonts: IM Fell English SC (display), Alegreya (body), Alegreya Sans SC (labels). The owner **rejected** Uncial Antiqua + gold Cinzel and Almendra SC. Font changes need care; show options first.
- Colors: light parchment only (dark mode removed on purpose). Subtle canvas paper texture.
- Storybook embellishments: double-rule page frame with corner curls, illuminated first letters on h2, Rackham vignettes between sections, credit line at the end.
- Mana symbols are Scryfall SVGs (embedded). Color chips W U B R G are multi-select and match exact color identity (G + R shows only green-red cards); there is no multicolor chip. Colorless and "Lands" stand alone (selecting one clears the colors). There's no "All" chip: tap a selected filter again to clear it. The count label follows the filter ("16 green cards", "1 of 371 cards").
- Search ignores case, accents, punctuation and spaces.
- Decks section: a draft dropdown ("Draft I · 10/12/26", numbered by date, newest first) and an "Add deck" link to `draft.html?date=…`. Table columns Name (mana symbols, "N cards ▾" showing main deck then sideboard, "Edit" → `draft.html?deck=KEY`) | Pilot | Record. Tapping a record opens Wins/Losses steppers that save each tap. Sorted by win rate, then wins.
- Tiers change only from the opened card: tapping any card opens it large with Best / Worst buttons; a selected tier shows as a tinted, outlined button (no buttons under thumbnails, no × on tier cards). It stays open until you tap outside or press Escape. Tier cards that have been cut still show; the owner removes those rows from the sheet by hand.
- Phones (≤560px): 4 cards across in cube grid, deck lists and Best/Worst. Tap highlight disabled.
- Hover/focus shows a large card preview (desktop).

## Constraints to keep

- Don't use Tolkien's maps, movie logos or other copyrighted art. Rackham's illustrations (1910–1911) are public domain. Card images come from Scryfall under WotC's fan content policy.
- The owner can't share claude.ai artifacts outside their org, which is why the site moved to GitHub Pages.
- Be gentle with Scryfall: about 10 requests/s max, and send a descriptive User-Agent from scripts.
