// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between five screens: title, play, paused, game over and shift done.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N) stages that
// scene instead of running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import { createWorld, EVENT_DONE, EVENT_OVER } from './world.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_DONE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const audio = createAudio();
const world = createWorld(createRandom(seed));
const input = createInput(canvas, world);
const renderer = createRenderer(canvas);
// A small handle for play-testing from a browser console (read-only from outside).
window.__dapurSenja = { world, screen: () => screen };

let screen = SCREEN_TITLE;
let best = readBest();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world, seed);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function startGame() {
  world.reset(createRandom(Math.floor(Math.random() * 4294967296)));
  screen = SCREEN_PLAY;
  audio.unlock();
  status.textContent = 'Shift dimulai. Sajikan pesanan sebelum pelanggan pergi.';
}

if (shot) {
  runShot(shot);
} else {
  canvas.addEventListener('mousedown', () => {
    if (screen !== SCREEN_PLAY && screen !== SCREEN_PAUSED) startGame();
  });
  let last = performance.now();
  let lag = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    if (input.takeConfirm() && screen !== SCREEN_PLAY && screen !== SCREEN_PAUSED) startGame();
    if (input.takePause() && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED)) {
      screen = screen === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
    }
    if (screen === SCREEN_PLAY) {
      lag += elapsed;
      while (lag >= STEP) {
        const events = world.step(STEP, input.read(), audio);
        lag -= STEP;
        if (events & EVENT_OVER) {
          screen = SCREEN_OVER;
          if (world.state.score > best) {
            best = world.state.score;
            saveBest(best);
          }
          status.textContent = `Shift berakhir. Skor ${world.state.score}.`;
        } else if (events & EVENT_DONE) {
          screen = SCREEN_DONE;
          if (world.state.score > best) {
            best = world.state.score;
            saveBest(best);
          }
          status.textContent = `Shift selesai! Skor ${world.state.score}.`;
        }
      }
    } else {
      input.read();
    }
    const active = screen === SCREEN_PLAY ? world.nearStation() : null;
    renderer.draw(world.state, screen, best, active);
  }
  requestAnimationFrame(frame);
}
