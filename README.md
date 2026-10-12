# Dojo Arena — coach panel prototype

Prototype of a coach panel for themed taekwondo tournaments run by a dojo club.
Built to show the idea to the client and collect feedback; it is not a production system yet.

**Live demo:** https://degreeofficer.github.io/dojo-arena/

## What it does
- Coach registration: coach, club, city, tournament name, date and venue.
- Number of participants set with a stepper in the header (add / remove).
- Roster of numbered shields; clicking a number opens the participant card.
- Participant card: name, date of birth, gender, height, weight, weight class, belt, rank, city, coach, medical clearance, insurance, note.
- Saving collapses the card, replaces the number with the participant's name and opens the next empty card.
- Filled cards can be ticked; **Print** builds an `.xlsx` entry form for the tournament committee (all filled cards if none are ticked).
- Switchable tournament theme: *Colosseum* (Roman / gladiator) and a neutral *Classic* — new themes are one entry in `js/themes.js`.

## Prototype limitations
- Data is stored only in the current browser (`localStorage`); there is no server, no login and no sync between devices.
- Do not enter real children's personal data into the demo.
- Parent-facing view (tournament progress) is not built yet.

## Run locally
Static site, no build step:

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765/.

## Structure
- `index.html` — page shell
- `css/style.css` — styles, theme values come from CSS variables
- `js/themes.js` — tournament themes (colours, fonts, wording, logo)
- `js/fields.js` — participant card fields, belts, ranks
- `js/export.js` — Excel entry form (xlsx-js-style)
- `js/store.js` — browser storage
- `js/app.js` — UI logic
