# Classic Handbook data feed

The data every copy of [Classic Handbook](https://nairck.github.io/ClassicHandbook/) shares: one snapshot, replaced
whole each time it's published (no history is kept here).

- `manifest.json`: what's in the snapshot, with each file's SHA-256 and when its source was last read.
- `manifest.json.sig`: its Ed25519 signature. The app and the web page check it before using anything.
- `blobs/`: the files, gzip-compressed, named by their SHA-256.

The manifest's `gamehistory` is the game data's history, kept for good: `base` is every OSMS game file (items,
monsters, maps and spawns, skills, quests, NPCs, quest chains) as it was when the history began, and `log` has one
JSON line for each OSMS update since, with what it added, removed and changed, field by field (`[path, old, new]`).
The two together rebuild the game data as it was after any update.

## Licence

Classic Handbook's own work here (the price record and its estimates, the site figures as compiled, the drop record's
own parts, and how the snapshot is put together) is licensed
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): you may share it and build on it, always
crediting Classic Handbook (nairck) with a link to this repository, not for commercial purposes, and sharing what you
build from it under this same licence. Only a snapshot signed with Classic Handbook's key is Classic Handbook's;
anything else is not.

Parts that come from others keep their own licences, which apply to those parts instead:
- game data from [OSMS Data Explorer](https://osmsdataexplorer.com): CC BY 4.0;
- drop rates from [MapleClassic Wiki](https://mapleclassic.wiki)'s kill tests: CC BY-NC-SA 4.0 (the drop record
  built from them shares that licence);
- drop rates from [osmlib.com](https://osmlib.com) and [MapleStory Quest](https://maplestory.quest), and prices from
  public market sites, each credited in the app.

Unofficial fan tool, not affiliated with Nexon.
