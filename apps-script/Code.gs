// Hobbit x Piedmont Cube: shared Best / Worst lists, saved to a Google Sheet.
//
// First time with this version:
//   1. Pick "setup" in the function menu at the top and click Run. Approve access when asked.
//      It creates the "Hobbit x Piedmont Cube" sheet in your Drive, copies in the current
//      lists, and prints the sheet's link in the execution log.
//   2. Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
//      The web app URL stays the same, so the page keeps working.

const TAB = "Best & Worst";
const LOG = "Log";
const DECKS = "Decks";
const DEFAULT_STATE = { top: ["hob-126", "hob-32"], bottom: [] };
// Names for cards already in the lists when the sheet is first created.
const NAMES_ = {
  "hob-1": "Long-Bodied Grey Dog",
  "hob-3": "Troop of Ponies",
  "hob-6": "Bofur, Reliable Guardian // Concerted Care",
  "hob-10": "Dwarven Shortsword",
  "hob-11": "Eagle of the Great Shelf",
  "hob-13": "Esgaroth Garrison",
  "hob-16": "Iron Hills Blacksmith",
  "hob-18": "Lake-town Lookout",
  "hob-22": "The Mountain-king's Return",
  "hob-23": "Ori, Keeper of Songs",
  "hob-26": "Settle the Wreckage",
  "hob-30": "Velvetwing Butterflies // Gaze in Wonder",
  "hob-32": "Bilbo, Luckwearer // Burglar's Plot",
  "hob-33": "Bilbo, Thief in the Night",
  "hob-35": "Confusticate and Bebother",
  "hob-39": "Enchanted River's Grasp",
  "hob-41": "Gandalf, Wandering Wizard",
  "hob-42": "Great Gilded Boat",
  "hob-43": "Lakeshore Apothecary",
  "hob-47": "Master's Councillors",
  "hob-48": "Mirkwood Meditator",
  "hob-50": "Old Fat Spider Can't See Me",
  "hob-51": "Plunder the Trollshaws",
  "hob-53": "Riddles in the Dark",
  "hob-55": "Sound the Trumpets",
  "hob-56": "Thranduil's Decree",
  "hob-58": "Uneasy Partings",
  "hob-63": "Crude Bent Blade",
  "hob-64": "Desolation Prowler",
  "hob-67": "Front Porch Sentries",
  "hob-69": "Gnashing of Teeth",
  "hob-71": "Gollum, Silent Slinker // Meager Meal",
  "hob-73": "Great Fierce Bee",
  "hob-83": "The Sackville-Bagginses",
  "hob-87": "Balin, Loremaster",
  "hob-88": "Bombur, Gentle Dreamer",
  "hob-90": "Burn, Burn, Tree and Fern",
  "hob-91": "Dáin Ironfoot",
  "hob-92": "Desert Were-Worm",
  "hob-95": "Dwarven Mauler",
  "hob-98": "Getaway Barrel",
  "hob-101": "Gundabad Opportunist",
  "hob-104": "The Misty Mountains Cold",
  "hob-112": "Snowslope Hunter",
  "hob-114": "Thorin, Mountain-king",
  "hob-116": "Attercop",
  "hob-120": "Beorn's Hospitality",
  "hob-121": "Boughside Wanderers",
  "hob-122": "Cantankerous Keepers",
  "hob-123": "Dancing from Dark to Dawn",
  "hob-126": "Gigantic Big Bear",
  "hob-127": "Guardian of the Halls",
  "hob-128": "Little Bear",
  "hob-130": "Nasty Little Rabbit",
  "hob-132": "Old Fat Spider",
  "hob-133": "Ordinary Bear",
  "hob-135": "Quarrel",
  "hob-137": "Through the Forest Gate",
  "hob-138": "Troll Negotiations",
  "hob-139": "Warg Tactics",
  "hob-140": "Wargling",
  "hob-144": "Bard, King of Dale",
  "hob-147": "Bifur, Melodic Rider",
  "hob-148": "Bolg of the North",
  "hob-150": "The Chief Warg",
  "hob-153": "Duskwatch Hunter",
  "hob-154": "Dwalin, Weaponmaster",
  "hob-156": "Fearsome Goblin Pair",
  "hob-157": "Goblin Plate Mail",
  "hob-158": "The Great Goblin",
  "hob-159": "Large Bear",
  "hob-160": "Mirkwood Nurturer",
  "hob-161": "Nori, Teller of Tales",
  "hob-162": "Patient Instructor",
  "hob-164": "Smaug, Wicked Worm",
  "hob-169": "Tom, Bert, and William",
  "hob-172": "Dwarven Mattock",
  "hob-173": "Giant's Boulder",
  "hob-176": "My Precious // Allure of Power",
  "hob-177": "Orcrist, Goblin-cleaver",
  "hob-178": "Sting, Bilbo's Sword",
  "hob-179": "Thrór's Map",
  "hob-180": "Well-Worn Spatula",
  "hob-181": "Elven Passage",
  "hob-182": "Elvenking's Halls",
  "hob-183": "Goblin-town",
  "hob-184": "Hobbit Hole",
  "hob-185": "Iron Hills",
  "hob-186": "Lake-town",
  "hob-187": "The Lonely Mountain",
  "hob-188": "Mirkwood"
};

function setup() {
  const ss = book_();
  Logger.log("Your sheet: " + ss.getUrl());
}

function book_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("sheetId");
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* sheet was deleted: make a new one */ }
  }
  const ss = SpreadsheetApp.create("Hobbit x Piedmont Cube");
  props.setProperty("sheetId", ss.getId());
  const t = ss.getSheets()[0];
  t.setName(TAB);
  t.appendRow(["Tier", "Card", "ID", "Added"]);
  t.setFrozenRows(1);
  t.getRange("A1:D1").setFontWeight("bold");
  t.setColumnWidth(2, 280);
  const l = ss.insertSheet(LOG);
  l.appendRow(["Time", "Change", "Card", "ID"]);
  l.setFrozenRows(1);
  l.getRange("A1:D1").setFontWeight("bold");
  l.setColumnWidth(3, 280);
  // Bring over the lists saved by the previous version of this script.
  const raw = props.getProperty("tiers");
  const s = raw ? JSON.parse(raw) : DEFAULT_STATE;
  const now = new Date();
  (s.top || []).forEach(x => t.appendRow(["Best", NAMES_[x] || "", x, now]));
  (s.bottom || []).forEach(x => t.appendRow(["Worst", NAMES_[x] || "", x, now]));
  return ss;
}

function read_() {
  const t = book_().getSheetByName(TAB);
  const n = t.getLastRow() - 1;
  const rows = n > 0 ? t.getRange(2, 1, n, 3).getValues() : [];
  const s = { top: [], bottom: [] };
  rows.forEach(r => {
    const tier = String(r[0]).trim().toLowerCase();
    const id = String(r[2]).trim();
    if (!id || s.top.indexOf(id) >= 0 || s.bottom.indexOf(id) >= 0) return;
    if (tier.indexOf("best") === 0) s.top.push(id);
    else if (tier.indexOf("worst") === 0) s.bottom.push(id);
  });
  return s;
}

// Decks tab: one row per deck. A draft is every deck that shares a Date.
// Colors / Splash are letters like "U R"; Cards (main deck) and Sideboard are card ids separated by spaces.
const DECK_COLS = ["Key", "Deck", "Pilot", "Wins", "Losses", "Updated", "Date", "Colors", "Splash", "Cards", "Sideboard"];
const ID = /^[a-z0-9-]{1,40}$/;

function deckTab_(ss) {
  let t = ss.getSheetByName(DECKS);
  if (!t) {
    t = ss.insertSheet(DECKS);
    t.appendRow(DECK_COLS);
    t.setFrozenRows(1);
    t.setColumnWidth(2, 240);
  }
  const head = t.getRange(1, 1, 1, DECK_COLS.length);
  if (head.getValues()[0].join("|") !== DECK_COLS.join("|")) head.setValues([DECK_COLS]).setFontWeight("bold");
  return t;
}

function letters_(v) {
  return String(v || "").toUpperCase().split(/[^WUBRG]+/).join("").split("").filter((c, i, a) => a.indexOf(c) === i);
}

const ids_ = v => String(v || "").split(/\s+/).filter(x => ID.test(x));
const idList_ = a => a.map(String).filter(x => ID.test(x)).slice(0, 200).join(" ");

function readDecks_(ss) {
  const t = deckTab_(ss);
  const n = t.getLastRow() - 1;
  const rows = n > 0 ? t.getRange(2, 1, n, DECK_COLS.length).getValues() : [];
  const out = {};
  rows.forEach(r => {
    const key = String(r[0]).trim();
    if (!key) return;
    const w = parseInt(r[3], 10), l = parseInt(r[4], 10);
    const dv = r[6];
    const date = dv instanceof Date ? Utilities.formatDate(dv, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(dv || "").trim().replace(/^'/, "");
    out[key] = {
      name: String(r[1]), pilot: String(r[2]), w: isNaN(w) ? null : w, l: isNaN(l) ? null : l,
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
      colors: letters_(r[7]), splash: letters_(r[8]),
      cards: ids_(r[9]), sideboard: ids_(r[10])
    };
  });
  return out;
}

function state_() {
  const s = read_();
  const ss = book_();
  s.decks = readDecks_(ss);
  s.cube = readCube_(ss);
  return s;
}

// Row number (2+) of a deck in the Decks tab, or -1
function findDeck_(t, key) {
  const n = t.getLastRow() - 1;
  if (n <= 0) return -1;
  const keys = t.getRange(2, 1, n, 1).getValues();
  for (let i = 0; i < keys.length; i++) if (String(keys[i][0]).trim() === key) return i + 2;
  return -1;
}

const num_ = v => { const n = parseInt(v, 10); return isNaN(n) ? 0 : Math.max(0, Math.min(99, n)); };

// Create or replace a deck. Requests without a cards list (older pages) keep the saved colors and cards.
function saveDeck_(op) {
  const key = String(op.key || "");
  if (!ID.test(key)) return json_({ error: "bad request" });
  const ss = book_();
  const t = deckTab_(ss);
  const found = findDeck_(t, key);
  const old = found > 0 ? t.getRange(found, 1, 1, DECK_COLS.length).getValues()[0] : [];
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(op.date || "")) ? "'" + op.date : "";
  const full = Array.isArray(op.cards);
  const cards = full ? idList_(op.cards) : (old[9] || "");
  const side = full ? idList_(Array.isArray(op.sideboard) ? op.sideboard : []) : (old[10] || "");
  const row = [key, safe_(String(op.name || "").slice(0, 40)), safe_(String(op.pilot || "").slice(0, 20)), num_(op.w), num_(op.l), new Date(), date,
    full ? letters_(op.colors).join(" ") : (old[7] || ""), full ? letters_(op.splash).join(" ") : (old[8] || ""), cards, side];
  if (found > 0) t.getRange(found, 1, 1, DECK_COLS.length).setValues([row]);
  else t.appendRow(row);
  ss.getSheetByName(LOG).appendRow([new Date(), (found > 0 ? "Deck edited: " : "Deck added: ") + row[1] + " (" + row[2] + ") " + row[3] + "-" + row[4], "", key]);
  return json_(state_());
}

// Just the win / loss record, from the steppers on the main page
function saveRecord_(op) {
  const key = String(op.key || "");
  if (!ID.test(key)) return json_({ error: "bad request" });
  const ss = book_();
  const t = deckTab_(ss);
  const found = findDeck_(t, key);
  if (found < 0) return json_({ error: "no such deck" });
  t.getRange(found, 4, 1, 3).setValues([[num_(op.w), num_(op.l), new Date()]]);
  ss.getSheetByName(LOG).appendRow([new Date(), "Record: " + t.getRange(found, 2).getValue() + " " + num_(op.w) + "-" + num_(op.l), "", key]);
  return json_(state_());
}

function deleteDeck_(op) {
  const key = String(op.key || "");
  if (!ID.test(key)) return json_({ error: "bad request" });
  const ss = book_();
  const t = deckTab_(ss);
  const found = findDeck_(t, key);
  if (found > 0) {
    const r = t.getRange(found, 1, 1, DECK_COLS.length).getValues()[0];
    t.deleteRow(found);
    ss.getSheetByName(LOG).appendRow([new Date(), "Deck deleted: " + r[1] + " (" + r[2] + ") " + r[6] + " cards: " + r[9] + " sideboard: " + r[10], "", key]);
  }
  return json_(state_());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function safe_(text) {
  const s = String(text || "").slice(0, 120);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doGet() {
  return json_(state_());
}

function doPost(e) {
  const op0 = JSON.parse(e.postData.contents);
  if (op0.type === "ocr") return ocr_(op0);   // reads nothing in the sheet, so no lock
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const op = JSON.parse(e.postData.contents);
    if (op.type === "deck") return saveDeck_(op);
    if (op.type === "record") return saveRecord_(op);
    if (op.type === "deleteDeck") return deleteDeck_(op);
    const id = String(op.id || "");
    const tier = op.tier;
    if (!ID.test(id) || (tier !== "top" && tier !== "bottom" && tier !== null)) {
      return json_({ error: "bad request" });
    }
    const name = safe_(op.name || NAMES_[id] || "");
    const ss = book_();
    const t = ss.getSheetByName(TAB);
    const n = t.getLastRow() - 1;
    if (n > 0) {
      const ids = t.getRange(2, 3, n, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]).trim() === id) t.deleteRow(i + 2);
      }
    }
    const now = new Date();
    if (tier) t.appendRow([tier === "top" ? "Best" : "Worst", name, id, now]);
    ss.getSheetByName(LOG).appendRow([now, tier === "top" ? "Added to Best" : tier === "bottom" ? "Added to Worst" : "Removed", name, id]);
    return json_(state_());
  } finally {
    lock.releaseLock();
  }
}

// ---- Cube versions ----------------------------------------------------------
// Each version of the cube is its own tab named "Cube YYYY-MM-DD". The page always shows the newest one.
// Columns: Name | Set | Number. Name alone is enough for a new card (Set and Number pick a specific printing).
// To make a new version: duplicate the latest tab, rename it with the new date, then add or delete rows.
const CUBE_TAB = /^Cube (\d{4}-\d{2}-\d{2})$/;

function readCube_(ss) {
  let best = null, bestDate = "";
  ss.getSheets().forEach(sh => {
    const m = sh.getName().match(CUBE_TAB);
    if (m && m[1] > bestDate) { bestDate = m[1]; best = sh; }
  });
  if (!best) return null;
  const n = best.getLastRow() - 1;
  const rows = n > 0 ? best.getRange(2, 1, n, 3).getDisplayValues() : [];
  const cards = [], seen = {};
  rows.forEach(r => {
    const name = String(r[0]).trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen[key]) return;          // each card appears once
    seen[key] = true;
    cards.push({ name: name, set: String(r[1]).trim().toLowerCase(), num: String(r[2]).trim() });
  });
  return { version: bestDate, cards: cards };
}

// ---- Deck photos -> text ------------------------------------------------------
// Uses Google Drive's free OCR: the photo is uploaded as a Google Doc (Drive turns the
// picture into text), the text is read, and the Doc goes to the trash.
// The Drive service and Drive/Docs permissions are listed in appsscript.json.
// Drive only OCRs images up to 2 MB, so the page shrinks photos before sending.
function ocr_(op) {
  const b64 = String(op.image || "");
  if (!b64 || b64.length > 2900000) return json_({ error: "image too big" });
  const blob = Utilities.newBlob(Utilities.base64Decode(b64), "image/jpeg", "deck.jpg");
  const file = Drive.Files.create({ name: "Deck photo OCR " + new Date().toISOString(), mimeType: MimeType.GOOGLE_DOCS }, blob, { ocrLanguage: "en" });
  try {
    return json_({ text: DocumentApp.openById(file.id).getBody().getText() });
  } finally {
    DriveApp.getFileById(file.id).setTrashed(true);
  }
}

// Run once from the editor after adding the code above, to approve Drive and Docs access.
function authorizeOcr() {
  const f = Drive.Files.create({ name: "OCR permission check", mimeType: MimeType.GOOGLE_DOCS }, Utilities.newBlob("ok", "text/plain"));
  Logger.log("Drive OK, Docs OK: " + DocumentApp.openById(f.id).getBody().getText());
  DriveApp.getFileById(f.id).setTrashed(true);
}

