# Browser prototype

[Play the current public build](https://newlimitstyler9.github.io/Project-Kingdom-Web/dunmere-living.html), or open `index.html` in a browser that executes local JavaScript. For local testing, run `python3 -m http.server 8000 --directory prototype` from the repository root and visit `http://localhost:8000/`.

Desktop controls: WASD or arrow keys to walk, E or left click near the character to interact, Space or right click to swing the equipped tool or attack, C to toggle sneaking, I to open the bag, and Escape to close a panel. Use the mouse to select dialogue choices, inventory items, and menu buttons. On touch screens, the joystick, A/B buttons, and Sneak button remain available.

New games begin in the Brooklands wilderness southwest of Dunmere. Follow the trail and cross the brook to reach town; interact near the large oak to enter the detailed village map. Walk south along the village's central lane to return to Brooklands. Existing saves resume at their saved location. The regional inn, bakery, mill, and two cottages have doors that lead to their interior maps and return to the same exterior door.

This is a standalone HTML prototype, not a compiled app. The ChatGPT in-app file preview may not support interactive rendering. To host it, deploy the `prototype` directory to a static host.

The Character tab has a **Preview underwear base** button. Close the menu to view the body sheet; reopen Character to switch back to the starter outfit. The base sheet is ready for future clothing overlays.

Dunmere's twelve residents each have their own appearance, with different colors and job details. Their complete four-direction walking poses share the player's ground anchor. Residents now have distinct homes, work sites, and gathering spots in the village. The roster and source workflow are documented in `docs/architecture/npc-appearances.md`; the village plan and research are in `docs/architecture/dunmere-village-plan.md`.

After a game change is merged into `main`, run `python3 scripts/publish-web.py` from the repository root to mirror the static prototype to the public Pages repository. The live check is `bash scripts/check-live.sh`.

## Modular exteriors and wilderness camp

Dunmere houses, the inn, bakery, smithy, and Brook Mill now render from layered Kenney tiles instead of one full-building image. See `docs/architecture/modular-buildings.md` for the template, atlas spacing, door anchor, object layering, and visual validation workflow. The timber yard and north ridge cave remain distinct site art.

At the wilderness trail, interact with fallen branches, loose stones, and dry grasses to gather starting supplies. Open the bag and choose **Craft** to make a campfire kit, travel tent, and bedroll. Select the kit or tent in the bag and choose **Place** while facing open ground away from paths and trees. Interact with the pitched tent to sleep and save. New travelers carry salvaged cloth for their first shelter.

Walk over loose ground resources and press E to collect them. With a stone axe equipped, swing three times at a tree to fell it for wood and a stick. The stump and cleared space persist in the saved world. Tree crowns cover the player and camp objects and become translucent while the player walks under them. Inside Brook Mill, use the millstone to grind two grain into two flour.

Asset art is indexed in [asset-catalog.html](asset-catalog.html): 44 named crops, reviewed Greyford building tile roles, and a generated inventory of all raster/vector files. Run `python3 scripts/build-asset-index.py` after adding art. The registry in `dunmere-asset-registry.js` is used by the game and records whether crops belong indoors, outdoors, or both. Greyford is drawn directly in the Brooklands regional map; walk across the western bridge rather than interacting with a settlement marker.
