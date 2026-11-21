# Classic Handbook data feed

> Classic Handbook data © 2026 nairck. Individual checks are welcome; automated, bulk or repeated collection, reuse in other projects, or AI training needs written consent: github.com/nairck/ClassicHandbook/issues. MapleClassic Wiki-derived drop rates and shop prices: CC BY-NC-SA 4.0. Game data: OSMS (CC BY 4.0), Nexon.

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
own parts, the snapshot as put together) is shared on the terms in
[LICENSE](https://github.com/nairck/ClassicHandbook/blob/main/LICENSE): individual checks are welcome; automated, bulk
or repeated collection, reuse in other projects, or AI training needs written consent (ask by opening an issue at
[github.com/nairck/ClassicHandbook/issues](https://github.com/nairck/ClassicHandbook/issues)). Copies published before
18 November 2026 remain [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Only a snapshot signed
with Classic Handbook's key is Classic Handbook's; anything else is not.

Parts that come from others keep their own licences, which apply to those parts instead:
- game data from [OSMS Data Explorer](https://osmsdataexplorer.com): CC BY 4.0;
- drop rates from [MapleClassic Wiki](https://mapleclassic.wiki)'s kill tests: CC BY-NC-SA 4.0 (the drop record
  built from them shares that licence);
- what the NPC shops sell and for how much (npcshops.json), from [MapleClassic Wiki](https://mapleclassic.wiki)'s
  shop pages: CC BY-NC-SA 4.0, each shop linked to its page;
- drop rates from [osmlib.com](https://osmlib.com) and [MapleStory Quest](https://maplestory.quest), and prices from
  public market sites, each credited in the app.

Unofficial fan tool, not affiliated with Nexon.
