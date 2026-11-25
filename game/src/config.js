// Dapur Senja — every tuning number, colour, recipe and station in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One shift lasts this long; survive it and the shift is complete. */
export const SHIFT_SECONDS = 150;
/** The last seconds of a shift are a rush: orders arrive twice as fast. */
export const RUSH_SECONDS = 30;
/** A failed order (or a burnt dish served) costs one strike; three end the shift. */
export const MAX_STRIKES = 3;

export const PLAYER = { radius: 20, speed: 330 };

/** How long each order waits before the customer walks out. */
export const ORDER = {
  patienceBase: 48,
  patienceMin: 30,
  spawnBase: 13,
  spawnMin: 7,
  maxActive: 4,
};

/** Seconds a chop takes, and how long food may cook before it burns. */
export const PREP = {
  chopSeconds: 1.1,
  grillSeconds: 3.2,
  wokSeconds: 2.6,
  burnSeconds: 7,
};

/** The menu: each dish is a set of components, a price in coins and a colour. */
export const DISHES = {
  sate: {
    name: 'Sate Ayam',
    recipe: ['sate', 'bumbu'],
    price: 25,
    colour: '#c97b3d',
    blurb: 'ayam dipanggang + bumbu kacang',
  },
  nasgor: {
    name: 'Nasi Goreng',
    recipe: ['nasi-masak', 'telur-masak', 'bumbu'],
    price: 30,
    colour: '#e08a3c',
    blurb: 'nasi + telur digoreng + bumbu',
  },
  miegor: {
    name: 'Mie Goreng',
    recipe: ['mie-masak', 'telur-masak', 'bumbu'],
    price: 30,
    colour: '#e8b93c',
    blurb: 'mie + telur digoreng + bumbu',
  },
  esteh: {
    name: 'Es Teh',
    recipe: ['teh', 'es'],
    price: 15,
    colour: '#b4762e',
    blurb: 'teh manis + es batu',
  },
};

/** Every thing a cook can carry, and what it looks like. */
export const ITEMS = {
  'ayam-mentah': { name: 'Ayam', kind: 'raw', chop: 'ayam-potong', colour: '#e8a0a0' },
  'ayam-potong': { name: 'Ayam Potong', kind: 'chopped', grill: 'sate', colour: '#e8b0b0' },
  sate: { name: 'Sate', kind: 'cooked', colour: '#a8622e' },
  telur: { name: 'Telur', kind: 'raw', wok: 'telur-masak', colour: '#f5e6c8' },
  'telur-masak': { name: 'Telur Goreng', kind: 'cooked', colour: '#f2c94c' },
  nasi: { name: 'Nasi', kind: 'raw', wok: 'nasi-masak', colour: '#f2ead8' },
  'nasi-masak': { name: 'Nasi Goreng', kind: 'cooked', colour: '#e08a3c' },
  mie: { name: 'Mie', kind: 'raw', wok: 'mie-masak', colour: '#f0d060' },
  'mie-masak': { name: 'Mie Goreng', kind: 'cooked', colour: '#e8b93c' },
  bumbu: { name: 'Bumbu', kind: 'ready', colour: '#8a5a2e' },
  teh: { name: 'Teh', kind: 'ready', colour: '#b4762e' },
  es: { name: 'Es Batu', kind: 'ready', colour: '#bfe3f2' },
  gosong: { name: 'Gosong!', kind: 'burnt', colour: '#2e2a26' },
};

/** The ingredient crates on the counter, left to right. */
export const CRATES = [
  { item: 'ayam-mentah', label: 'Ayam' },
  { item: 'telur', label: 'Telur' },
  { item: 'mie', label: 'Mie' },
  { item: 'nasi', label: 'Nasi' },
  { item: 'bumbu', label: 'Bumbu' },
  { item: 'teh', label: 'Teh' },
  { item: 'es', label: 'Es' },
];

/** Stations: fixed counters the cook walks between. x/y/w/h in logical pixels. */
export const STATIONS = {
  crates: { x: 16, y: 168, w: 560, h: 72, label: 'Bahan', hint: 'ambil bahan' },
  board: { x: 600, y: 168, w: 150, h: 84, label: 'Talenan', hint: 'potong (E)' },
  grill: { x: 774, y: 168, w: 150, h: 84, label: 'Panggangan', hint: 'panggang (E)' },
  wok: { x: 948, y: 168, w: 150, h: 84, label: 'Wajan', hint: 'goreng (E)' },
  racik: { x: 16, y: 592, w: 300, h: 84, label: 'Racik', hint: 'rakit hidangan (E)' },
  saji: { x: 964, y: 592, w: 300, h: 84, label: 'Saji', hint: 'antar pesanan (E)' },
  sampah: { x: 600, y: 592, w: 120, h: 84, label: 'Sampah', hint: 'buang (E)' },
};

/** The floor the cook may walk on. */
export const FLOOR = { x: 16, y: 252, w: 1248, h: 324 };

export const PALETTE = {
  wall: '#241a33',
  wallDark: '#1b1226',
  hud: '#171021',
  floorA: '#6b4a2f',
  floorB: '#5d3f28',
  counterTop: '#c98d4b',
  counterFront: '#7a4a26',
  counterEdge: '#4a2c15',
  boardTop: '#d9b380',
  plate: '#f2ead8',
  text: '#f5efe2',
  muted: '#b9a98f',
  gold: '#f2c94c',
  green: '#7dc383',
  red: '#e5534b',
  blue: '#7db8e8',
  steam: 'rgba(245,239,226,0.55)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'dapur-senja.best';
