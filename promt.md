# Projekt prompt összefoglaló

## USER promptok (eredeti nyelven) és értelmezés

1) USER prompt:
"Készíts egy sidepanel.js és a hozzá tartozó html-t az Ext-höz.  A panelen legyen 5 menüpont (5 gomb) felirata \"next feature 1\"... \"next feature 5\". Minden gomb egy \"menüt\" (tabot) nyit meg aminden a fejlécében a gomb felirata (menu title) . legyen és egy \"Start feature\", és egy \"Stop feature\" gomb. És egy \"Back to main menu\". Egyelőre a gombok mögött csak egy ext \"notifier\" legyen, a \"gomb megnyomva\" felirattal."
- Értelmezés: Hozzuk létre a Side Panel UI-t (5 gomb, tabok), a tabokban Start/Stop/Back gombokkal és egy egyszerű értesítővel.

2) USER prompt:
"a popup menyitása előtt nyissa meg a sidepanelt is,"
- Értelmezés: A popup használatakor automatikusan nyíljon a Side Panel (felhasználói gesztushoz kötötten).

3) USER prompt:
"a newIcon.png legyen az ext ikon"
- Értelmezés: Az extension és action ikon állítása `newIcon.png`-re.

4) USER prompt (hiba):
"de panel open failed: Error: `sidePanel.open()` may only be called in response to a user gesture."
- Értelmezés: A Side Panel megnyitása csak user gesture-re történhet; hívás áthelyezése kattintás eseményre.

5) USER prompt:
"legyen az első \"next feature 1\" felirata \"Run Feature1\"... a többi 4 gomb ... \"under develope\" ... szürke (nem kattinható)"
- Értelmezés: Az első gomb aktív (Run Feature1), a többi disabled stílus és csak notifiert mutat.

6) USER prompt:
"A sidepanel ... Start feature indítsa el a background.js-t ... Stop feature állítsa le"
- Értelmezés: Start/Stop üzenetek a háttérszolgáltatásnak, háttérciklus indítása/leállítása.

7) USER prompt:
"kérek"
- Értelmezés: Vizuális státusz (Running/Stopped) és gombok állapota, élő frissítéssel.

8) Egyéb
- Manifest név/ikon frissítések, háttér intervallum módosítás, Side Panel kiegészítések.

## Megoldás – fő pontok

- Side Panel
  - `sidepanel.html`: menü (Run Feature1 + 4 disabled), tab nézet címkével, Start/Stop/Back, notifier, státusz badge.
  - `sidepanel.js`: menü/tab logika; disabled gombok "under develope"; Start/Stop üzenetek; státusz badge + gombállapot; realtime státusz figyelés.

- Popup
  - `popup.js`: Side Panel nyitása csak user gesture-re (első kattintás/gombnyomás).

- Háttér
  - `background.js`: `isChecking`/`shouldContinue` flag; megszakítható `startChecking()`; `stopChecking()`; státusz broadcast (`runtime.sendMessage`), `getStatus` válasz.

- Manifest/ikon
  - `manifest.json`: `side_panel.default_path` → `sidepanel.html`; `icons` és `action.default_icon` → `newIcon.png`.

- Megjegyzés
  - Chrome korlátozás: Side Panel csak user gesture-re nyitható; ennek megfelelően lett implementálva.
