# cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Jawwxz/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Jawwxz/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Dapur Senja — an original Indonesian night-market cooking game. You are the cook at a
dusk market stall: customers arrive with orders on the board, and you chop, grill and
fry at the stations, build each dish on the plating counter, and serve it before the
customer's patience runs out. Three walk-outs end the shift; survive the whole shift
and it is complete. The last half-minute is a rush.

The menu: Sate Ayam (grilled chicken + peanut sauce), Nasi Goreng and Mie Goreng
(fried rice or noodles with egg + spice), and Es Teh (sweet tea + ice). Food left
too long on the grill or in the wok burns and has to be thrown away.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Play with keyboard (WASD or arrows to move, E or Space to use a station, P to pause,
Enter to start) or mouse (click the floor to walk, click a station to walk there and
use it, click an order card to serve the dish it asks for). The game is plain static
files under `game/` — no build step, no network request, no library — and plays
offline in a desktop browser. `?shot=start|play|serve|end&seed=1` renders the fixed
scenes the screenshots in `screenshots/` were taken from.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xzsdsyqa&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
