# Browser prototype

[Play the current public build](https://newlimitstyler9.github.io/Project-Kingdom-Web/dunmere-living.html), or open `index.html` in a browser that executes local JavaScript. For local testing, run `python3 -m http.server 8000 --directory prototype` from the repository root and visit `http://localhost:8000/`.

Desktop controls: WASD or arrow keys to walk, E or left click near the character to interact, Space or right click to attack, I to open the bag, and Escape to close a panel. Use the mouse to select dialogue choices, inventory items, and menu buttons. On touch screens, the joystick and A/B buttons remain available.

This is a standalone HTML prototype, not a compiled app. The ChatGPT in-app file preview may not support interactive rendering. To host it, deploy the `prototype` directory to a static host.

The Character tab has a **Preview underwear base** button. Close the menu to view the body sheet; reopen Character to switch back to the starter outfit. The base sheet is ready for future clothing overlays.
