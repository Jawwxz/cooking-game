// Keyboard and mouse: WASD/arrows to walk, E/Space to use a station, Enter to start,
// P to pause. A mouse click on the floor walks the cook there; a click on a station
// walks there and uses it; a click on an order card serves the matching dish.
import { FIELD, STATIONS } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_ACT = 'act';

export function createInput(canvas, world) {
  const keys = new Set();
  const state = { moveX: 0, moveY: 0, act: false };
  let confirmPressed = false;
  let pausePressed = false;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  }

  function stationAt(x, y) {
    for (const [key, rect] of Object.entries(STATIONS)) {
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return key;
    }
    return null;
  }

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (event.repeat) return;
    keys.add(event.key.toLowerCase());
    if (event.key === 'Enter') confirmPressed = true;
    if (event.key.toLowerCase() === 'p') pausePressed = true;
    if (event.key.toLowerCase() === 'e' || event.key === ' ') state.act = true;
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });

  canvas.addEventListener('mousedown', (event) => {
    const point = toLogical(event);
    const station = stationAt(point.x, point.y);
    const player = world.state.player;
    if (station) {
      const rect = STATIONS[station];
      const topRow = rect.y < 400;
      player.target = {
        x: Math.max(rect.x + 20, Math.min(rect.x + rect.w - 20, point.x)),
        y: topRow ? rect.y + rect.h + 40 : rect.y - 40,
        station,
      };
      return;
    }
    // Clicking an order card serves the dish it asks for, when the cook carries it.
    const orders = world.state.orders;
    for (let i = 0; i < orders.length; i += 1) {
      const card = { x: 120 + i * 220, y: 64, w: 204, h: 84 };
      if (point.x >= card.x && point.x <= card.x + card.w && point.y >= card.y && point.y <= card.y + card.h) {
        const hand = world.state.hand;
        if (hand === `dish-${orders[i].dish}`) {
          player.target = { x: STATIONS.saji.x + STATIONS.saji.w / 2, y: STATIONS.saji.y - 40, station: 'saji' };
        }
        return;
      }
    }
    player.target = { x: point.x, y: point.y, station: null };
  });

  return {
    /** Read this frame's movement and consume one-shot actions. */
    read() {
      const left = keys.has('a') || keys.has('arrowleft');
      const right = keys.has('d') || keys.has('arrowright');
      const up = keys.has('w') || keys.has('arrowup');
      const down = keys.has('s') || keys.has('arrowdown');
      state.moveX = (right ? 1 : 0) - (left ? 1 : 0);
      state.moveY = (down ? 1 : 0) - (up ? 1 : 0);
      if (state.moveX !== 0 || state.moveY !== 0) world.state.player.target = null;
      const out = { moveX: state.moveX, moveY: state.moveY, act: state.act };
      state.act = false;
      return out;
    },
    takeConfirm() {
      const value = confirmPressed;
      confirmPressed = false;
      return value;
    },
    takePause() {
      const value = pausePressed;
      pausePressed = false;
      return value;
    },
  };
}
