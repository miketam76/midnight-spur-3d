# Midnight Spur 3D

Midnight Spur 3D is an authentic, fast-paced arcade Western standoff game combining classic spaghetti-western dueling tension with a stylized 3D voxel aesthetic. Face off against an escalating roster of 19 dangerous outlaws across dusty frontier streets, time your draw with razor-sharp precision, and claim your place on the high-score ledger.

## Gameplay

- **Attract Mode & Title Screen:** Jump right into a showdown or let the arcade Attract Mode cycle between live gameplay demos and top county scores.
- **Wanted Poster Scout:** Study the 3D-rendered wanted poster before each duel to identify the target's mugshot, bounty reward, and reaction speed.
- **The Standoff & Tension Meter:** Steady your nerve as the countdown meter fills and rhythmic mechanical pocket-watch clicks escalate the tension.
- **The Draw:** Tap or strike the instant the metallic hammer cocking signal sounds. Fire early and you foul out; hesitate for even a fraction of a second, and you bite the dust.
- **Bounty Progression:** Outdraw your opponent to collect their bounty, build your win streak, and advance to faster, deadlier gunslingers.

## Features

- **3D Voxel Western Townscape:** Imposing frontier facades including the Grand Saloon with swinging batwing doors, Bank, Gunsmith, General Store, and Sheriff's Office—complete with overhanging awnings, hitching rails, supply crates, and rolling 3D tumbleweeds.
- **Authentic 1873 Single-Action Peacemaker:** Handcrafted voxel revolvers rendered with blued-steel barrels, fluted cylinders, under-barrel ejector rods, brass trigger guards, and dark walnut grips.
- **Dynamic 3D Wanted Posters:** Pixel-accurate mugshots sculpted on aged parchment textures matching the facial traits, hats, cigars, and facial hair of each outlaw archetype.
- **Atmospheric Visual & Lighting FX:**
  - *Dynamic 3-Tier Sky Progression:* Midday Frontier Blue (Rounds 1–5), Fiery Sunset Orange (Rounds 6–12), and Starlight Midnight (Rounds 13–19).
  - Drifting 3D desert dust motes, recoil snaps, dynamic point-light muzzle flashes, screen shake, and smooth knockback fall physics.
- **Acoustic Spaghetti Western Audio Engine:** Built using Web Audio API synthesis:
  - Multi-layered peacemaker gunshots with sub-bass powder blasts, whip-crack transients, and canyon reverb tails.
  - Leone-inspired melodic whistle motifs and syncopated Spanish guitar ostinatos.
  - Revolver cylinder spinning, pawl hammer locks, and pocket-watch ticks.
  - Zero-hum hard cuts on menu quits, pause, and screen transitions.
- **Arcade Leaderboard & 3-Letter Entry:** High-score ranking tracking cumulative bounties with arcade-style slot character selection.
- **Mobile Orientation Lock:** Built-in mobile orientation detection ensuring proper vertical framing during standoffs.
- **Comprehensive Controls:** Full support for Pause, Audio Mute, and Quit states.

## Controls

- **Draw / Shoot:** Click, tap, or press `Space` / `Enter`
- **Initials Entry:** `Left` / `Right` arrows or `A` / `D` to cycle letters, `SELECT` / `Space` / `Enter` to lock in
- **Pause / Resume:** `Pause` button or `P` key
- **Mute / Unmute:** `Mute` button or `M` key
- **Quit / Menu:** `Quit` button to return to title

## Project Structure

- `index.html` — Application shell, HUD overlays, 3D canvas mount, and responsive screen viewports
- `styles.css` — Retro arcade UI styling, tension bar overlays, and portrait orientation lock
- `src/main.js` — Input controller routing, keyboard shortcuts, and attraction mode interrupts
- `src/game.js` — Core game state machine, outlaw roster, difficulty scaling, cumulative bounty accounting, and initials entry
- `src/render.js` — Three.js voxel rendering pipeline, lighting, procedural western architecture, dynamic wanted posters, and character animations
- `src/audio.js` — Web Audio API acoustic sound generator (gunshots, cylinder spin, whistles, and soundtrack loops)

## Running Locally

No build steps or bundling tools are required. Serve the project using any standard static web server:

```bash
# Python 3
python -m http.server 8000