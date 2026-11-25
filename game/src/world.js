// Dapur Senja — the kitchen itself: orders, stations, cooking, serving, scoring.
// The world is pure state plus a fixed-step update; it knows nothing about the canvas.
// Every rule the player feels lives here, so the renderer only ever paints `state`.
import {
  CRATES,
  DISHES,
  FLOOR,
  ITEMS,
  MAX_STRIKES,
  ORDER,
  PLAYER,
  PREP,
  RUSH_SECONDS,
  SHIFT_SECONDS,
  STATIONS,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_LOST = 2;
export const EVENT_OVER = 4;
export const EVENT_DONE = 8;
export const EVENT_BURNT = 16;

const SKINS = ['#f2c9a0', '#e8b088', '#c98d64', '#a06a42'];
const HAIRS = ['#2e2a26', '#5a3a22', '#8a8a8a', '#b4762e', '#3a2a4a'];
const SHIRTS = ['#c96a5a', '#5a8ac9', '#7dc383', '#c9a85a', '#9a6ac9', '#e8e8e8'];

/** A customer waiting on the order board. */
function makeOrder(random, id, level) {
  const weights = { sate: 3, esteh: 2, nasgor: 2 + level, miegor: 2 + level };
  const bag = [];
  for (const [dish, weight] of Object.entries(weights)) {
    for (let i = 0; i < weight; i += 1) bag.push(dish);
  }
  const dish = random.pick(bag);
  const patience = ORDER.patienceBase - (ORDER.patienceBase - ORDER.patienceMin) * Math.min(1, level / 3);
  return {
    id,
    dish,
    patience,
    maxPatience: patience,
    customer: {
      skin: random.pick(SKINS),
      hair: random.pick(HAIRS),
      shirt: random.pick(SHIRTS),
    },
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Distance from a point to a rectangle (0 when inside). */
function distToRect(x, y, rect) {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.w));
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}

export function createWorld(random) {
  function initialState() {
    return {
      time: 0,
      coins: 0,
      score: 0,
      served: 0,
      lost: 0,
      strikes: 0,
      player: { x: 640, y: 420, target: null, chop: 0, chopItem: null },
      hand: null,
      orders: [],
      spawnIn: 4,
      nextOrderId: 1,
      grill: { item: null, progress: 0, burn: 0 },
      wok: { item: null, progress: 0, burn: 0 },
      plate: [],
      plateDish: null,
      rush: false,
      over: false,
      done: false,
      flash: 0,
      particles: [],
      floats: [],
    };
  }

  const state = initialState();

  /** The station the cook is close enough to use, or null. */
  function nearStation() {
    let best = null;
    let bestDist = 70;
    for (const [key, rect] of Object.entries(STATIONS)) {
      const d = distToRect(state.player.x, state.player.y, rect);
      if (d < bestDist) {
        bestDist = d;
        best = key;
      }
    }
    return best;
  }

  /** Which crate slot the cook stands in front of. */
  function crateAt(x) {
    const rect = STATIONS.crates;
    const slot = Math.floor(((x - rect.x) / rect.w) * CRATES.length);
    return CRATES[clamp(slot, 0, CRATES.length - 1)];
  }

  /** Can this component join what is already on the plate? */
  function plateAccepts(item) {
    const contents = [...state.plate, item];
    return Object.values(DISHES).some((dish) =>
      contents.every((c) => dish.recipe.includes(c)) && contents.length <= dish.recipe.length,
    );
  }

  function addParticle(kind, x, y) {
    if (state.particles.length > 120) return;
    state.particles.push({ kind, x, y, life: 0, max: kind === 'steam' ? 1.1 : 0.7 });
  }

  function addFloat(x, y, text, colour) {
    state.floats.push({ x, y, text, colour, life: 0, max: 1.2 });
  }

  function serveDish(dishId) {
    const order = state.orders
      .filter((o) => o.dish === dishId)
      .sort((a, b) => a.patience - b.patience)[0];
    if (!order) return false;
    const dish = DISHES[dishId];
    const tip = Math.round((dish.price * (order.patience / order.maxPatience)) / 2);
    const earned = dish.price + tip;
    state.coins += earned;
    state.score += earned;
    state.served += 1;
    state.orders = state.orders.filter((o) => o !== order);
    state.hand = null;
    addFloat(1114, 580, `+${earned} koin`, '#f2c94c');
    return true;
  }

  /** One interaction at the station the cook stands at. Returns true when it did something. */
  function interact(audio) {
    const station = nearStation();
    if (!station) return false;
    const hand = state.hand;

    if (station === 'crates') {
      if (hand) return false;
      const crate = crateAt(state.player.x);
      state.hand = crate.item;
      audio?.pickup();
      return true;
    }

    if (station === 'board') {
      if (!hand || !ITEMS[hand].chop || state.player.chop > 0) return false;
      state.player.chop = 0.001;
      state.player.chopItem = hand;
      audio?.chop();
      return true;
    }

    if (station === 'grill' || station === 'wok') {
      const slot = station === 'grill' ? state.grill : state.wok;
      const wants = station === 'grill' ? 'grill' : 'wok';
      if (slot.item && !hand) {
        state.hand = slot.item;
        slot.item = null;
        slot.progress = 0;
        slot.burn = 0;
        audio?.pickup();
        return true;
      }
      if (!slot.item && hand && ITEMS[hand][wants]) {
        slot.item = hand;
        slot.progress = 0;
        slot.burn = 0;
        state.hand = null;
        audio?.sizzle();
        return true;
      }
      return false;
    }

    if (station === 'racik') {
      if (state.plateDish && !hand) {
        state.hand = `dish-${state.plateDish}`;
        state.plate = [];
        state.plateDish = null;
        audio?.pickup();
        return true;
      }
      if (hand && !state.plateDish && plateAccepts(hand) && !hand.startsWith('dish-')) {
        state.plate.push(hand);
        state.hand = null;
        audio?.pickup();
        const match = Object.entries(DISHES).find(([, dish]) =>
          dish.recipe.length === state.plate.length &&
          dish.recipe.every((c) => state.plate.includes(c)),
        );
        if (match) {
          state.plateDish = match[0];
          audio?.ding();
          addFloat(166, 580, `${match[1].name} siap!`, '#7dc383');
        }
        return true;
      }
      return false;
    }

    if (station === 'saji') {
      if (!hand || !hand.startsWith('dish-')) return false;
      const dishId = hand.slice(5);
      if (serveDish(dishId)) {
        audio?.coin();
        return true;
      }
      audio?.error();
      return false;
    }

    if (station === 'sampah') {
      if (!hand) return false;
      state.hand = null;
      addParticle('poof', state.player.x, state.player.y - 30);
      return true;
    }
    return false;
  }

  /** Advance the kitchen by `dt` seconds. `input` carries the move vector and clicks. */
  function step(dt, input, audio) {
    if (state.over || state.done) {
      state.flash = Math.max(0, state.flash - dt);
      return 0;
    }
    let events = 0;
    state.time += dt;
    state.flash = Math.max(0, state.flash - dt);
    const level = Math.min(3, Math.floor(state.time / 40));
    state.rush = state.time > SHIFT_SECONDS - RUSH_SECONDS;

    // The shift ends when the clock runs out.
    if (state.time >= SHIFT_SECONDS) {
      state.done = true;
      return EVENT_DONE;
    }

    // Chopping locks the cook in place until the knife work is done.
    const p = state.player;
    if (p.chop > 0) {
      p.chop += dt / PREP.chopSeconds;
      if (p.chop >= 1) {
        state.hand = ITEMS[p.chopItem].chop;
        p.chop = 0;
        p.chopItem = null;
        audio?.ding();
      }
    } else {
      // Click-to-move target, else the keys.
      let mx = input.moveX;
      let my = input.moveY;
      if (p.target) {
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 10) {
          const station = p.target.station;
          p.target = null;
          if (station) interact(audio);
        } else {
          mx = dx / d;
          my = dy / d;
        }
      }
      const len = Math.hypot(mx, my);
      if (len > 0) {
        p.x = clamp(p.x + (mx / len) * PLAYER.speed * dt, FLOOR.x, FLOOR.x + FLOOR.w);
        p.y = clamp(p.y + (my / len) * PLAYER.speed * dt, FLOOR.y, FLOOR.y + FLOOR.h);
      }
    }
    if (input.act) interact(audio);

    // The grill and the wok cook on their own; food left too long burns.
    for (const slot of [state.grill, state.wok]) {
      if (!slot.item) continue;
      const cooked = ITEMS[slot.item] && (ITEMS[slot.item].grill || ITEMS[slot.item].wok);
      if (slot.progress < 1) {
        slot.progress += dt / (slot.item === 'ayam-potong' ? PREP.grillSeconds : PREP.wokSeconds);
        if (random.next() < dt * 6) {
          const rect = slot.item === 'ayam-potong' ? STATIONS.grill : STATIONS.wok;
          addParticle('steam', rect.x + rect.w / 2, rect.y + 10);
        }
        if (slot.progress >= 1) {
          slot.item = cooked;
          slot.burn = 0;
          audio?.ding();
        }
      } else {
        slot.burn += dt;
        if (slot.burn > PREP.burnSeconds) {
          slot.item = 'gosong';
          slot.burn = 0;
          events |= EVENT_BURNT;
          audio?.error();
        }
      }
    }

    // New orders arrive; the rush doubles the pace.
    state.spawnIn -= dt * (state.rush ? 2 : 1);
    if (state.spawnIn <= 0 && state.orders.length < ORDER.maxActive) {
      state.orders.push(makeOrder(random, state.nextOrderId, level));
      state.nextOrderId += 1;
      const interval = ORDER.spawnBase - (ORDER.spawnBase - ORDER.spawnMin) * Math.min(1, level / 3);
      state.spawnIn = interval * (0.85 + random.next() * 0.3);
    }

    // Patience runs out: the customer leaves, and that is a strike.
    for (const order of [...state.orders]) {
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders = state.orders.filter((o) => o !== order);
        state.lost += 1;
        state.strikes += 1;
        state.flash = 0.5;
        events |= EVENT_LOST;
        audio?.lost();
        if (state.strikes >= MAX_STRIKES) {
          state.over = true;
          events |= EVENT_OVER;
        }
      }
    }

    // Particles and floating texts age out.
    for (const part of state.particles) part.life += dt;
    state.particles = state.particles.filter((part) => part.life < part.max);
    for (const f of state.floats) f.life += dt;
    state.floats = state.floats.filter((f) => f.life < f.max);
    return events;
  }

  return { state, step, interact, nearStation, reset };

  /** Start a fresh shift in place, so the loop and the renderer keep one state object. */
  function reset(newRandom) {
    random = newRandom;
    Object.assign(state, initialState());
  }
}
