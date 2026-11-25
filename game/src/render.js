// Dapur Senja — everything the player sees, painted on one canvas. The renderer only
// reads `state`; it never changes a rule, so a screenshot is always a true frame.
import {
  CRATES,
  DISHES,
  FIELD,
  ITEMS,
  MAX_STRIKES,
  PALETTE,
  SHIFT_SECONDS,
  STATIONS,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_DONE = 'done';

const CARD = { x0: 120, gap: 220, y: 64, w: 204, h: 84 };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function heart(ctx, x, y, size, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.9);
  ctx.bezierCurveTo(x - size, y + size * 0.1, x - size * 0.4, y - size * 0.7, x, y - size * 0.1);
  ctx.bezierCurveTo(x + size * 0.4, y - size * 0.7, x + size, y + size * 0.1, x, y + size * 0.9);
  ctx.fill();
}

/** Draw one carried item or dish component, centred on (x, y), about `size` wide. */
function drawItem(ctx, item, x, y, size) {
  const s = size / 40;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineWidth = 2;
  switch (item) {
    case 'ayam-mentah':
      ctx.fillStyle = '#e8a0a0';
      ctx.beginPath(); ctx.arc(0, 2, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f2ead8'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(18, -14); ctx.stroke();
      break;
    case 'ayam-potong':
      ctx.fillStyle = '#e8b0b0';
      ctx.fillRect(-14, -10, 12, 12); ctx.fillRect(2, -10, 12, 12); ctx.fillRect(-6, 4, 12, 12);
      break;
    case 'sate':
      ctx.strokeStyle = '#d9b380'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-16, 14); ctx.lineTo(16, -14); ctx.stroke();
      ctx.fillStyle = '#a8622e';
      for (const [cx, cy] of [[-9, 7], [0, -1], [9, -9]]) {
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'telur':
      ctx.fillStyle = '#f5e6c8';
      ctx.beginPath(); ctx.ellipse(0, 0, 11, 14, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'telur-masak':
      ctx.fillStyle = '#fdf6e0';
      ctx.beginPath(); ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2c94c';
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
      break;
    case 'nasi':
      ctx.fillStyle = '#f2ead8';
      ctx.beginPath(); ctx.arc(0, 4, 14, Math.PI, 0); ctx.fill();
      ctx.fillRect(-14, 4, 28, 4);
      break;
    case 'nasi-masak':
      ctx.fillStyle = '#e08a3c';
      ctx.beginPath(); ctx.arc(0, 4, 14, Math.PI, 0); ctx.fill();
      ctx.fillRect(-14, 4, 28, 4);
      ctx.fillStyle = '#7dc383';
      ctx.fillRect(-8, -4, 3, 3); ctx.fillRect(2, -8, 3, 3); ctx.fillRect(6, -2, 3, 3);
      break;
    case 'mie':
      ctx.strokeStyle = '#f0d060'; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-14, i * 7);
        ctx.bezierCurveTo(-7, i * 7 - 5, 0, i * 7 + 5, 7, i * 7);
        ctx.bezierCurveTo(11, i * 7 - 3, 13, i * 7 + 2, 14, i * 7);
        ctx.stroke();
      }
      break;
    case 'mie-masak':
      ctx.strokeStyle = '#e8a83c'; ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-14, i * 7);
        ctx.bezierCurveTo(-7, i * 7 - 5, 0, i * 7 + 5, 7, i * 7);
        ctx.bezierCurveTo(11, i * 7 - 3, 13, i * 7 + 2, 14, i * 7);
        ctx.stroke();
      }
      ctx.fillStyle = '#7dc383'; ctx.fillRect(-4, -12, 4, 4); ctx.fillRect(5, 8, 4, 4);
      break;
    case 'bumbu':
      ctx.fillStyle = '#8a5a2e';
      ctx.beginPath(); ctx.arc(0, 2, 13, 0, Math.PI); ctx.fill();
      ctx.fillRect(-13, 2, 26, 8);
      ctx.fillStyle = '#c98a4b';
      ctx.beginPath(); ctx.arc(0, 2, 9, 0, Math.PI); ctx.fill();
      break;
    case 'teh':
      ctx.fillStyle = 'rgba(180,118,46,0.9)';
      ctx.fillRect(-8, -12, 16, 26);
      ctx.strokeStyle = '#f2ead8'; ctx.lineWidth = 2;
      ctx.strokeRect(-8, -12, 16, 26);
      ctx.strokeStyle = '#e5534b'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(4, -12); ctx.lineTo(8, -20); ctx.stroke();
      break;
    case 'es':
      ctx.fillStyle = '#bfe3f2';
      ctx.save(); ctx.rotate(0.4); ctx.fillRect(-9, -9, 13, 13); ctx.restore();
      ctx.fillStyle = '#dff2fa';
      ctx.save(); ctx.rotate(-0.3); ctx.fillRect(0, -2, 12, 12); ctx.restore();
      break;
    case 'gosong':
      ctx.fillStyle = '#2e2a26';
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8b93a3'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, -16); ctx.quadraticCurveTo(-10, -22, -6, -26); ctx.stroke();
      break;
    default:
      if (item.startsWith('dish-')) drawDish(ctx, item.slice(5), 0, 0, 40);
      break;
  }
  ctx.restore();
}

/** A finished dish on its plate. */
function drawDish(ctx, dishId, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath(); ctx.ellipse(0, 0, size * 0.52, size * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9bda6'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, size * 0.52, size * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
  const inner = { sate: 'sate', nasgor: 'nasi-masak', miegor: 'mie-masak', esteh: 'teh' }[dishId];
  if (inner) drawItem(ctx, inner, 0, -size * 0.08, size * 0.8);
  if (dishId === 'sate') drawItem(ctx, 'bumbu', size * 0.22, size * 0.12, size * 0.5);
  if (dishId === 'esteh') drawItem(ctx, 'es', size * 0.2, size * 0.12, size * 0.5);
  ctx.restore();
}

function drawCustomer(ctx, customer, x, y, r) {
  ctx.fillStyle = customer.shirt;
  roundRect(ctx, x - r, y + r * 0.4, r * 2, r * 1.1, r * 0.4);
  ctx.fill();
  ctx.fillStyle = customer.skin;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = customer.hair;
  ctx.beginPath(); ctx.arc(x, y - r * 0.25, r, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#2e2a26';
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.1, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.1, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2e2a26'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y + r * 0.25, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}

function drawCook(ctx, x, y, carrying, chopping) {
  ctx.save();
  ctx.translate(x, y);
  // Body and apron.
  ctx.fillStyle = '#c96a5a';
  roundRect(ctx, -16, -6, 32, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#f2ead8';
  roundRect(ctx, -12, 2, 24, 22, 6);
  ctx.fill();
  // Head and chef's hat.
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); ctx.arc(0, -18, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8f4ec';
  ctx.beginPath(); ctx.arc(-7, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-13, -30, 26, 8);
  ctx.fillStyle = '#2e2a26';
  ctx.beginPath(); ctx.arc(-5, -18, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -18, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2e2a26'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -14, 4, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
  // The knife, mid-chop.
  if (chopping > 0) {
    const lift = Math.sin(chopping * Math.PI * 6) * 8;
    ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(14, -6 - lift); ctx.lineTo(30, 6 - lift); ctx.stroke();
  }
  // What the cook carries, held high so it is easy to read.
  if (carrying) {
    ctx.fillStyle = 'rgba(23,16,33,0.75)';
    ctx.beginPath(); ctx.arc(0, -56, 22, 0, Math.PI * 2); ctx.fill();
    drawItem(ctx, carrying, 0, -56, 30);
  }
  ctx.restore();
}

function drawStationLabel(ctx, rect, label, hint, active) {
  ctx.fillStyle = active ? '#f2c94c' : PALETTE.muted;
  ctx.font = `bold 13px ${'system-ui, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.fillText(label.toUpperCase(), rect.x + rect.w / 2, rect.y + rect.h - 6);
  if (active && hint) {
    ctx.fillStyle = PALETTE.text;
    ctx.font = `12px ${'system-ui, sans-serif'}`;
    ctx.fillText(hint, rect.x + rect.w / 2, rect.y - 8);
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const W = FIELD.width;
  const H = FIELD.height;

  function drawFloor() {
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 12; col += 1) {
        ctx.fillStyle = (row + col) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
        ctx.fillRect(16 + col * 104, 252 + row * 84, 104, 84);
      }
    }
    ctx.strokeStyle = 'rgba(23,16,33,0.35)';
    ctx.lineWidth = 2;
    for (let row = 0; row <= 4; row += 1) {
      ctx.beginPath(); ctx.moveTo(16, 252 + row * 84); ctx.lineTo(1264, 252 + row * 84); ctx.stroke();
    }
  }

  function drawLights() {
    // A string of warm bulbs along the top of the kitchen, for the night-market feel.
    for (let x = 30; x <= 1250; x += 46) {
      const glow = 0.7 + 0.3 * Math.sin(x * 0.05);
      ctx.fillStyle = `rgba(242,201,76,${glow})`;
      ctx.beginPath(); ctx.arc(x, 158, 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawCrates(state, active) {
    const rect = STATIONS.crates;
    ctx.fillStyle = PALETTE.counterFront;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    roundRect(ctx, rect.x, rect.y, rect.w, 18, 8);
    ctx.fill();
    const slotW = rect.w / CRATES.length;
    for (let i = 0; i < CRATES.length; i += 1) {
      const cx = rect.x + slotW * i + slotW / 2;
      ctx.fillStyle = '#8a5f36';
      roundRect(ctx, cx - 30, rect.y + 22, 60, 40, 6);
      ctx.fill();
      ctx.strokeStyle = '#5d3f28'; ctx.lineWidth = 2;
      ctx.strokeRect(cx - 30, rect.y + 22, 60, 40);
      drawItem(ctx, CRATES[i].item, cx, rect.y + 40, 30);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `11px ${'system-ui, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.fillText(CRATES[i].label, cx, rect.y + 70);
    }
    // The station name sits on the counter's top strip, so it never covers a crate label.
    ctx.fillStyle = active === 'crates' ? PALETTE.gold : '#4a2c15';
    ctx.font = `bold 13px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText('BAHAN', rect.x + rect.w / 2, rect.y + 14);
  }

  function drawCooker(state, key, label, active) {
    const rect = STATIONS[key];
    const slot = state[key];
    ctx.fillStyle = PALETTE.counterFront;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    // The name sits at the top of the counter, clear of the cooking area.
    ctx.fillStyle = active === key ? PALETTE.gold : PALETTE.muted;
    ctx.font = `bold 12px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText(label.toUpperCase(), rect.x + rect.w / 2, rect.y + 14);
    ctx.fillStyle = key === 'grill' ? '#3a2a26' : '#2e2a33';
    roundRect(ctx, rect.x + 8, rect.y + 20, rect.w - 16, 32, 8);
    ctx.fill();
    if (key === 'grill') {
      ctx.fillStyle = '#e5534b';
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath(); ctx.arc(rect.x + 22 + i * 26, rect.y + 44, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#8b93a3'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath(); ctx.moveTo(rect.x + 14 + i * 34, rect.y + 26); ctx.lineTo(rect.x + 14 + i * 34, rect.y + 48); ctx.stroke();
      }
    } else {
      ctx.strokeStyle = '#8b93a3'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(rect.x + rect.w / 2, rect.y + 36, 20, 0, Math.PI * 2); ctx.stroke();
    }
    if (slot.item) {
      drawItem(ctx, slot.item, rect.x + rect.w / 2, rect.y + 36, 30);
      const done = slot.progress >= 1;
      const frac = done ? 1 - slot.burn / 7 : slot.progress;
      const barColour = done ? (slot.burn > 4 ? '#e5534b' : '#7dc383') : '#f2c94c';
      ctx.fillStyle = 'rgba(23,16,33,0.8)';
      roundRect(ctx, rect.x + 14, rect.y + 58, rect.w - 28, 12, 6);
      ctx.fill();
      ctx.fillStyle = barColour;
      roundRect(ctx, rect.x + 14, rect.y + 58, (rect.w - 28) * Math.max(0, frac), 12, 6);
      ctx.fill();
      if (done) {
        ctx.fillStyle = '#171021';
        ctx.font = `bold 10px ${'system-ui, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.fillText(slot.item === 'gosong' ? 'GOSONG!' : 'SIAP — AMBIL', rect.x + rect.w / 2, rect.y + 67);
      }
    }
    if (active === key) {
      ctx.fillStyle = PALETTE.text;
      ctx.font = `12px ${'system-ui, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.fillText(key === 'grill' ? 'panggang (E)' : 'goreng (E)', rect.x + rect.w / 2, rect.y - 8);
    }
  }

  function drawRacik(state, active) {
    const rect = STATIONS.racik;
    ctx.fillStyle = PALETTE.counterFront;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.boardTop;
    roundRect(ctx, rect.x, rect.y, rect.w, 20, 8);
    ctx.fill();
    // The plate, with whatever is on it so far.
    const px = rect.x + 90;
    const py = rect.y + 52;
    if (state.plateDish) {
      ctx.fillStyle = 'rgba(125,195,131,0.35)';
      ctx.beginPath(); ctx.arc(px, py, 40, 0, Math.PI * 2); ctx.fill();
      drawDish(ctx, state.plateDish, px, py, 56);
    } else {
      ctx.fillStyle = PALETTE.plate;
      ctx.beginPath(); ctx.ellipse(px, py, 42, 26, 0, 0, Math.PI * 2); ctx.fill();
      state.plate.forEach((item, i) => {
        drawItem(ctx, item, px - 24 + i * 24, py - 6, 26);
      });
    }
    // The recipe the plate is building toward, as a quiet reminder.
    ctx.fillStyle = PALETTE.text;
    ctx.font = `12px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'left';
    const lines = state.plateDish
      ? [DISHES[state.plateDish].name + ' — siap disajikan!']
      : ['Sate: sate + bumbu', 'Nasi Goreng: nasi + telur + bumbu', 'Mie Goreng: mie + telur + bumbu', 'Es Teh: teh + es'];
    lines.forEach((line, i) => ctx.fillText(line, rect.x + 168, rect.y + 34 + i * 15));
    // The station name sits on the counter's top strip, clear of the recipe list.
    ctx.fillStyle = active === 'racik' ? PALETTE.gold : '#4a2c15';
    ctx.font = `bold 13px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText('RACIK', rect.x + rect.w / 2, rect.y + 14);
  }

  function drawSaji(state, active) {
    const rect = STATIONS.saji;
    ctx.fillStyle = PALETTE.counterFront;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    roundRect(ctx, rect.x, rect.y, rect.w, 18, 8);
    ctx.fill();
    // The service bell.
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath(); ctx.arc(rect.x + 60, rect.y + 44, 16, Math.PI, 0); ctx.fill();
    ctx.fillRect(rect.x + 44, rect.y + 44, 32, 5);
    ctx.fillStyle = '#2e2a26';
    ctx.beginPath(); ctx.arc(rect.x + 60, rect.y + 24, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 14px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'left';
    ctx.fillText('Antar pesanan di sini', rect.x + 96, rect.y + 40);
    ctx.font = `12px ${'system-ui, sans-serif'}`;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('klik kartu pesanan atau tekan E', rect.x + 96, rect.y + 60);
    drawStationLabel(ctx, rect, 'Saji', 'antar pesanan (E)', active === 'saji');
  }

  function drawBoard(state, active) {
    const rect = STATIONS.board;
    ctx.fillStyle = PALETTE.counterFront;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.boardTop;
    roundRect(ctx, rect.x + 10, rect.y + 8, rect.w - 20, 38, 6);
    ctx.fill();
    const chopping = state.player.chop > 0;
    if (chopping) {
      drawItem(ctx, state.player.chopItem, rect.x + rect.w / 2, rect.y + 27, 30);
      ctx.fillStyle = 'rgba(23,16,33,0.8)';
      roundRect(ctx, rect.x + 14, rect.y + 52, rect.w - 28, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#f2c94c';
      roundRect(ctx, rect.x + 14, rect.y + 52, (rect.w - 28) * state.player.chop, 8, 4);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#8b93a3'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(rect.x + 60, rect.y + 16); ctx.lineTo(rect.x + 96, rect.y + 34); ctx.stroke();
      ctx.fillStyle = '#5a4632';
      ctx.fillRect(rect.x + 92, rect.y + 32, 14, 5);
    }
    drawStationLabel(ctx, rect, 'Talenan', 'potong (E)', active === 'board');
  }

  function drawTrash(state, active) {
    const rect = STATIONS.sampah;
    ctx.fillStyle = '#3a3f4a';
    roundRect(ctx, rect.x + 30, rect.y + 12, 60, 52, 8);
    ctx.fill();
    ctx.fillStyle = '#2e323c';
    roundRect(ctx, rect.x + 24, rect.y + 6, 72, 12, 6);
    ctx.fill();
    drawStationLabel(ctx, rect, 'Sampah', 'buang (E)', active === 'sampah');
  }

  function drawOrders(state) {
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 16px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'left';
    ctx.fillText('PESANAN', 16, 106);
    for (let i = 0; i < state.orders.length; i += 1) {
      const order = state.orders[i];
      const dish = DISHES[order.dish];
      const x = CARD.x0 + i * CARD.gap;
      const y = CARD.y;
      const frac = Math.max(0, order.patience / order.maxPatience);
      const urgent = frac < 0.3;
      ctx.fillStyle = urgent ? '#3d1f24' : '#2e2340';
      roundRect(ctx, x, y, CARD.w, CARD.h, 10);
      ctx.fill();
      ctx.strokeStyle = urgent ? '#e5534b' : '#4a3a63';
      ctx.lineWidth = urgent ? 3 : 2;
      ctx.stroke();
      drawCustomer(ctx, order.customer, x + 32, y + 30, 22);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `bold 14px ${'system-ui, sans-serif'}`;
      ctx.textAlign = 'left';
      ctx.fillText(dish.name, x + 62, y + 26);
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `11px ${'system-ui, sans-serif'}`;
      ctx.fillText(`${dish.price} koin`, x + 62, y + 44);
      drawDish(ctx, order.dish, x + 168, y + 30, 44);
      ctx.fillStyle = 'rgba(23,16,33,0.8)';
      roundRect(ctx, x + 12, y + 66, CARD.w - 24, 8, 4);
      ctx.fill();
      ctx.fillStyle = frac > 0.5 ? '#7dc383' : frac > 0.25 ? '#f2c94c' : '#e5534b';
      roundRect(ctx, x + 12, y + 66, (CARD.w - 24) * frac, 8, 4);
      ctx.fill();
    }
    if (state.orders.length === 0) {
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `13px ${'system-ui, sans-serif'}`;
      ctx.fillText('Belum ada pesanan — pelanggan pertama segera datang…', 130, 108);
    }
  }

  function drawHud(state) {
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, W, 56);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 22px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'left';
    ctx.fillText('DAPUR SENJA', 16, 26);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `12px ${'system-ui, sans-serif'}`;
    ctx.fillText('dapur pasar malam', 16, 44);
    // The shift clock.
    const remain = Math.max(0, SHIFT_SECONDS - state.time);
    const mm = String(Math.floor(remain / 60)).padStart(2, '0');
    const ss = String(Math.floor(remain % 60)).padStart(2, '0');
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 20px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Shift ${mm}:${ss}`, 640, 26);
    ctx.fillStyle = 'rgba(245,239,226,0.2)';
    roundRect(ctx, 490, 34, 300, 8, 4);
    ctx.fill();
    ctx.fillStyle = state.rush ? '#e5534b' : '#f2c94c';
    roundRect(ctx, 490, 34, 300 * (1 - state.time / SHIFT_SECONDS), 8, 4);
    ctx.fill();
    if (state.rush) {
      ctx.fillStyle = '#e5534b';
      ctx.font = `bold 13px ${'system-ui, sans-serif'}`;
      ctx.fillText('RUSH!', 640, 52);
    }
    // Coins, score and strikes.
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath(); ctx.arc(1010, 20, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5a10';
    ctx.font = `bold 12px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText('R', 1010, 24);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 18px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'left';
    ctx.fillText(`${state.coins}`, 1028, 26);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `12px ${'system-ui, sans-serif'}`;
    ctx.fillText(`Skor ${state.score}`, 1010, 46);
    for (let i = 0; i < MAX_STRIKES; i += 1) {
      heart(ctx, 1170 + i * 30, 22, 9, i < MAX_STRIKES - state.strikes ? '#e5534b' : 'rgba(245,239,226,0.25)');
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `11px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText('pelanggan pergi', 1200, 46);
  }

  function drawParticles(state) {
    for (const part of state.particles) {
      const frac = part.life / part.max;
      if (part.kind === 'steam') {
        ctx.fillStyle = PALETTE.steam;
        ctx.globalAlpha = 0.6 * (1 - frac);
        ctx.beginPath(); ctx.arc(part.x, part.y - frac * 30, 6 + frac * 8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = `rgba(245,239,226,${0.8 * (1 - frac)})`;
        ctx.beginPath(); ctx.arc(part.x, part.y, 4 + frac * 14, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (const f of state.floats) {
      const frac = f.life / f.max;
      ctx.globalAlpha = 1 - frac;
      ctx.fillStyle = f.colour;
      ctx.font = `bold 18px ${'system-ui, sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y - frac * 40);
      ctx.globalAlpha = 1;
    }
  }

  function overlay(title, lines, foot, best) {
    ctx.fillStyle = 'rgba(23,16,33,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 52px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 250);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `18px ${'system-ui, sans-serif'}`;
    lines.forEach((line, i) => ctx.fillText(line, W / 2, 300 + i * 30));
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `14px ${'system-ui, sans-serif'}`;
    ctx.fillText(foot, W / 2, 300 + lines.length * 30 + 24);
    if (best > 0) {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `bold 15px ${'system-ui, sans-serif'}`;
      ctx.fillText(`Skor terbaik: ${best}`, W / 2, 300 + lines.length * 30 + 52);
    }
  }

  function draw(state, screen, best, activeStation) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, W, H);
    drawHud(state);
    drawOrders(state);
    drawLights();
    drawFloor();
    drawCrates(state, activeStation);
    drawBoard(state, activeStation);
    drawCooker(state, 'grill', 'Panggangan', activeStation);
    drawCooker(state, 'wok', 'Wajan', activeStation);
    drawRacik(state, activeStation);
    drawSaji(state, activeStation);
    drawTrash(state, activeStation);
    drawParticles(state);
    // The cook, last so nothing hides them.
    drawCook(ctx, state.player.x, state.player.y, state.hand, state.player.chop);
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(229,83,75,${state.flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (screen === SCREEN_TITLE) {
      overlay('DAPUR SENJA', [
        'Dapur pasar malam: masak sate, nasi goreng, mie goreng dan es teh,',
        'sajikan sebelum pelanggan pergi. Tiga pelanggan pergi dan shift berakhir.',
        '',
        'Gerak: WASD / panah / klik — Pakai stasiun: E atau Spasi — Jeda: P',
      ], 'Tekan Enter atau klik untuk mulai', best);
    } else if (screen === SCREEN_PAUSED) {
      overlay('JEDA', ['Istirahat sebentar — kompor tetap menyala.'], 'Tekan P untuk lanjut', best);
    } else if (screen === SCREEN_OVER) {
      overlay('SHIFT BERAKHIR', [
        `Terlalu banyak pelanggan pergi. Disajikan: ${state.served} hidangan.`,
        `Koin: ${state.coins} — Skor: ${state.score}`,
      ], 'Tekan Enter untuk main lagi', best);
    } else if (screen === SCREEN_DONE) {
      overlay('SHIFT SELESAI!', [
        `Pasar malam tutup. Disajikan: ${state.served} hidangan, ${state.lost} pergi.`,
        `Koin: ${state.coins} — Skor: ${state.score}`,
      ], 'Tekan Enter untuk main lagi', best);
    }
  }

  return { draw };
}
