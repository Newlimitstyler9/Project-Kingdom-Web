# Browser prototype

[Play the current public build](https://newlimitstyler9.github.io/Project-Kingdom-Web/dunmere-living.html), or open `index.html` in a browser that executes local JavaScript. For local testing, run `python3 -m http.server 8000 --directory prototype` from the repository root and visit `http://localhost:8000/`.

Desktop controls: WASD or arrow keys to walk, E or left click near the character to interact, Space or right click to attack, I to open the bag, and Escape to close a panel. Use the mouse to select dialogue choices, inventory items, and menu buttons. On touch screens, the joystick and A/B buttons remain available.

New games begin in the Brooklands wilderness southwest of Dunmere. Follow the trail and cross the brook to reach town; interact near the large oak to enter the detailed village map. Walk south along the village's central lane to return to Brooklands. Existing saves resume at their saved location. The regional map includes Eastwood, Westfield, Brook Mill and the north ridge cave; their local jobs and interiors are still being developed.

This is a standalone HTML prototype, not a compiled app. The ChatGPT in-app file preview may not support interactive rendering. To host it, deploy the `prototype` directory to a static host.

The Character tab has a **Preview underwear base** button. Close the menu to view the body sheet; reopen Character to switch back to the starter outfit. The base sheet is ready for future clothing overlays.

Dunmere's twelve residents each have their own appearance, with different colors and job details. Their complete four-direction walking poses share the player's ground anchor. Residents now have distinct homes, work sites, and gathering spots in the village. The roster and source workflow are documented in `docs/architecture/npc-appearances.md`; the village plan and research are in `docs/architecture/dunmere-village-plan.md`.

After a game change is merged into `main`, run `python3 scripts/publish-web.py` from the repository root to mirror the static prototype to the public Pages repository. The live check is `bash scripts/check-live.sh`.
