# Midnight Spur

Midnight Spur is an authentic, fast-paced arcade Western standoff game inspired by classic 8-bit frontier showdowns. Face off against an escalating roster of 19 dangerous outlaws across dusty town streets, time your draw with razor-sharp precision, and climb the high-score ledger.

## Gameplay

- Start a showdown from the main menu or let the Attract Mode roll through live gameplay and leaderboards.
- Review the Wanted Poster to scout your target, bounty reward, and reaction speed.
- Hold your nerve during the tension-building countdown meter and audio ticks.
- Draw at the instant the signal sounds to claim the bounty and advance.
- Draw too early or hesitate a fraction of a second too long, and you will hit the dirt.

## Features

- **Progressive Sky & Weather Engine:** Dynamic 3-tier time-of-day progression across rounds:
  - *Tier 1 (Rounds 1–5):* Midday Frontier Blue
  - *Tier 2 (Rounds 6–12):* Fiery Sunset Orange
  - *Tier 3 (Rounds 13–19):* Starlight Midnight with twinkling stars and dust storms
- **Atmospheric Visual FX:** Dynamic wind-blown dust particle drifts, screen shake on heavy shots, expanding muzzle blasts with lingering smoke, and falling death animations with hat-drop physics.
- **Dynamic Frontier Environment:** Imposing two-story Western townscape featuring the Saloon, Sheriff's Office & Jail, Bank, General Store, and Grand Hotel, complete with rolling, boot-sized bushy tumbleweeds.
- **Custom Character & Outlaw Roster:** 19 unique outlaws spanning distinct speeds and colorways—culminating in legendary duels against archetypes like the Man in Black and Blondie.
- **Synthesized Web Audio Engine:** Mechanical 6-click revolver cylinder spins, tension-building countdown ticks, gunshots, rich victory/defeat stingers, and a looping spaghetti western soundtrack.
- **Arcade Attract Mode & Leaderboard:** Ephemeral high-score rankings tracking cumulative bounties with 3-letter initials entry.
- **Responsive Standoff Framing:** Native cinematic zoom scaling for mobile and desktop screens.
- **Full Game Controls:** Complete Pause, Mute, and Quit handling.

## Controls

- **Draw / Shoot:** Click, tap, or press `Space` / `Enter`
- **Initials Entry:** `Up` / `Down` arrow keys to cycle letters, `Enter` or `Space` to confirm
- **Pause / Resume:** Pause button or `P` key
- **Mute / Unmute:** Mute button or `M` key
- **Quit / Return:** Quit button from active duel screens

## Project Structure

- `index.html` — App shell, HUD overlays, high-score leaderboards, and canvas element
- `styles.css` — Retro arcade UI, responsive mobile framing, and typography
- `src/main.js` — Bootstrapping, input listeners, and attract mode bindings
- `src/game.js` — Core game state machine, outlaw roster, pause logic, timing engine, and high scores
- `src/render.js` — Canvas rendering engine, multi-tier sky palettes, 16-bit sprites, tumbleweed, dust particles, and town backdrops
- `src/audio.js` — Web Audio API sound synthesizer (revolver ratchet, gunshots, stingers, music loop)
- `src/storage.js` — Local persistence helpers

## Running Locally

No build step or external dependencies are required. Run the project from any simple static file server:

```bash
# Python 3
python -m http.server 8000