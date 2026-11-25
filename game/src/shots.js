// The screenshot scenes behind ?shot=start|play|serve|end. Each one sets the real world
// to a fixed, deterministic state — the same seed always gives the same frame — and the
// renderer paints it, so every screenshot is a true render of the game's own code.
import { createRandom } from './random.js';
import { SCREEN_DONE, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const SKINS = ['#f2c9a0', '#e8b088', '#c98d64', '#a06a42'];
const HAIRS = ['#2e2a26', '#5a3a22', '#8a8a8a', '#b4762e', '#3a2a4a'];
const SHIRTS = ['#c96a5a', '#5a8ac9', '#7dc383', '#c9a85a', '#9a6ac9', '#e8e8e8'];

function customer(random) {
  return { skin: random.pick(SKINS), hair: random.pick(HAIRS), shirt: random.pick(SHIRTS) };
}

function order(random, id, dish, patience, maxPatience) {
  return { id, dish, patience, maxPatience, customer: customer(random) };
}

/**
 * Set `world` to the named scene (start, play, serve or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world, seed) {
  const random = createRandom(seed);
  const s = world.state;
  s.time = 0;
  s.coins = 0;
  s.score = 0;
  s.served = 0;
  s.lost = 0;
  s.strikes = 0;
  s.orders = [];
  s.spawnIn = 4;
  s.hand = null;
  s.grill = { item: null, progress: 0, burn: 0 };
  s.wok = { item: null, progress: 0, burn: 0 };
  s.plate = [];
  s.plateDish = null;
  s.rush = false;
  s.over = false;
  s.done = false;
  s.flash = 0;
  s.particles = [];
  s.floats = [];
  s.player.x = 640;
  s.player.y = 420;
  s.player.target = null;
  s.player.chop = 0;
  s.player.chopItem = null;

  if (name === 'play') {
    // Mid-service: three orders on the board (one nearly out of patience), the wok
    // frying, the grill ready, and a nasi goreng one bumbu away from complete.
    s.time = 65;
    s.coins = 85;
    s.score = 85;
    s.served = 3;
    s.orders = [
      order(random, 1, 'nasgor', 14, 44),
      order(random, 2, 'sate', 30, 48),
      order(random, 3, 'esteh', 40, 48),
    ];
    s.grill = { item: 'sate', progress: 1, burn: 1.5 };
    s.wok = { item: 'mie', progress: 0.55, burn: 0 };
    s.plate = ['nasi-masak', 'telur-masak'];
    s.hand = 'bumbu';
    s.player.x = 200;
    s.player.y = 540;
    return { screen: SCREEN_PLAY, best: 0 };
  }

  if (name === 'serve') {
    // The plate is finished and in the cook's hands, on the way to the serving counter.
    s.time = 96;
    s.coins = 120;
    s.score = 120;
    s.served = 4;
    s.orders = [
      order(random, 1, 'nasgor', 18, 44),
      order(random, 2, 'miegor', 33, 48),
      order(random, 3, 'sate', 41, 48),
    ];
    s.grill = { item: 'ayam-potong', progress: 0.4, burn: 0 };
    s.hand = 'dish-nasgor';
    s.player.x = 900;
    s.player.y = 540;
    return { screen: SCREEN_PLAY, best: 120 };
  }

  if (name === 'end') {
    // Three customers walked out: the shift ends with the tally on screen.
    s.time = 118;
    s.coins = 150;
    s.score = 150;
    s.served = 6;
    s.lost = 3;
    s.strikes = 3;
    s.over = true;
    s.orders = [order(random, 1, 'esteh', 22, 48)];
    return { screen: SCREEN_OVER, best: 150 };
  }

  if (name === 'done') {
    s.time = 150;
    s.coins = 210;
    s.score = 210;
    s.served = 8;
    s.done = true;
    return { screen: SCREEN_DONE, best: 210 };
  }

  // start: the title over a kitchen that is already alive — orders on the board,
  // the grill working, a plate begun.
  s.time = 12;
  s.orders = [
    order(random, 1, 'sate', 38, 48),
    order(random, 2, 'esteh', 44, 48),
  ];
  s.grill = { item: 'ayam-potong', progress: 0.55, burn: 0 };
  s.plate = ['nasi-masak'];
  s.player.x = 640;
  s.player.y = 420;
  return { screen: SCREEN_TITLE, best: 0 };
}
