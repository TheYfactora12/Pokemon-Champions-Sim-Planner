# Champions Reg M-A Legality

**Format:** `champions-vgc-2026-regma`
**Active period:** April 8, 2026 - June 17, 2026
**Authoritative sources:**
- [Serebii Reg M-A](https://www.serebii.net/pokemonchampions/rankedbattle/regulationm-a.shtml)
- [Victory Road Regulations](https://victoryroad.pro/champions-regulations/)
- [Game8 Items List](https://game8.co/games/Pokemon-Champions/archives/588871)

---

## Ruleset Summary

| Parameter | Value |
|-----------|-------|
| Battle format | Doubles |
| Bring / pick | 4-6 / 4 |
| Level cap | 50 (auto-level) |
| Species Clause | Yes (no two Pokemon with same National Dex #) |
| Item Clause | Yes (no two Pokemon holding the same item) |
| Mega Evolution | Allowed (this is the Mega format) |
| Team preview | 90 seconds |
| Open team lists | Yes at TPCi events |
| Best-of format | Swiss = Bo1/Bo3; Top Cut = Bo3 |

---

## Stat Point Rules

Champion teams use **Stat Points (SPs)**, not Scarlet/Violet EVs.

Current simulator enforcement:

- Max **32 SP per stat**
- Max **66 SP total per Pokemon**
- SP values must be integers in an object with `hp`, `atk`, `def`, `spa`, `spd`, and `spe`
- Raw Showdown `EVs:` lines are rejected by Champion imports
- `IVs:` lines are rejected because Champions treats IVs as fixed/perfect for simulator purposes

Source truth:

- Pokemon Showdown's current Champions validator treats Champion sets as `Stat Points`, rejects more than `32` in a stat, and applies the Champion stat formula from the `champions` mod. Relevant source files: [`team-validator.ts`](https://github.com/smogon/pokemon-showdown/blob/master/sim/team-validator.ts) and [`data/mods/champions/scripts.ts`](https://github.com/smogon/pokemon-showdown/blob/master/data/mods/champions/scripts.ts).
- The repo follows Showdown behavior for simulator parity and uses `32/66` as the active guardrail.
- A public [GamesRadar hands-on preview](https://www.gamesradar.com/games/pokemon/i-made-a-competitively-viable-team-in-a-matter-of-minutes-in-pokemon-champions-and-im-confident-this-could-open-the-door-to-high-level-battles-for-newcomers-galore/) says Champion training has `66` Stat Points with a `31` per-stat cap. That conflicts with Showdown's current validator, so the repo tracks it as a source-review note instead of silently changing runtime behavior. If a stronger official Champion source confirms `31`, update `validateChampionsSpread()`, fixtures, seed tests, and the Overview source-truth note in the same change.

Known conversion policy for inferred archetype spreads:

- Showdown-style `252` investment maps to `32` Champion SP.
- Showdown-style `4` investment maps to `1` Champion SP.
- The conversion preserves the original archetype direction; it does not invent extra filler points merely to reach 66 total.

---

## Banned Pokemon Categories

Enforced by `CHAMPIONS_BANNED_POKEMON` in `legality.js`.

- **Paradox (Past):** Great Tusk, Scream Tail, Brute Bonnet, Flutter Mane, Slither Wing, Sandy Shocks, Roaring Moon, Walking Wake, Gouging Fire, Raging Bolt
- **Paradox (Future):** Iron Treads, Iron Bundle, Iron Hands, Iron Jugulis, Iron Moth, Iron Thorns, Iron Valiant, Iron Leaves, Iron Boulder, Iron Crown
- **Mythical:** Mew, Celebi, Jirachi, Deoxys, Phione, Manaphy, Darkrai, Shaymin, Arceus, Victini, Keldeo, Meloetta, Genesect, Diancie, Hoopa, Volcanion, Magearna, Marshadow, Zeraora, Meltan, Melmetal, Zarude
- **Restricted / Box Legendaries:** Mewtwo, Lugia, Ho-Oh, Kyogre, Groudon, Rayquaza, Dialga, Palkia, Giratina, Reshiram, Zekrom, Kyurem, Xerneas, Yveltal, Zygarde, Cosmog/Cosmoem, Solgaleo, Lunala, Necrozma, Zacian, Zamazenta, Eternatus, Calyrex, Koraidon, Miraidon, Terapagos
- **Sub-Legendary (non-Paradox):** Articuno/Zapdos/Moltres (all forms), Raikou/Entei/Suicune, Regis, Latias/Latios, Uxie/Mesprit/Azelf, Heatran, Regigigas, Cresselia, Cobalion/Terrakion/Virizion, Forces of Nature (all forms), Tapus, Ultra Beasts, Kubfu/Urshifu, Regieleki/Regidrago, Glastrier/Spectrier, Enamorus, Treasures of Ruin (Wo-Chien, Chien-Pao, Ting-Lu, Chi-Yu), Ogerpon, Loyal Three, Pecharunt

The `_stripForm()` helper strips regional/Mega/Therian/etc. suffixes so banned sub-legendary forms (e.g. `Urshifu-Rapid-Strike`) still match the base species ban list.

---

## Legal Item Pool

Enforced by `CHAMPIONS_LEGAL_ITEMS` in `legality.js`.

The validator now uses a positive allowlist from the Game8 Champions item list. Game8 marks that page as last updated April 10, 2026 and states that the listed items are the only ones available so far. Item effects still come from Showdown/generated runtime data; the allowlist only controls Champions availability.

Known absent SV carryovers are also kept in `CHAMPIONS_BANNED_ITEMS` so error messages stay clear. Examples include Life Orb, Choice Band, Choice Specs, Assault Vest, Rocky Helmet, Safety Goggles, Covert Cloak, Clear Amulet, Booster Energy, and Loaded Dice.

Any held item outside `CHAMPIONS_LEGAL_ITEMS` is a hard legality error until a stronger Champions source confirms it.

---

## Mega Stone Rules

Enforced by `CHAMPIONS_STONE_TO_SPECIES` (built from `CHAMPIONS_MEGAS` registry at load).

A Mega Stone can only be held by its matching base species. Example: Venusaurite requires `Venusaur`; held by `Charizard` yields `MEGA_STONE_MISMATCH`.

The stone index covers 59 stones across 60 Mega entries (Meowstic-M and Meowstic-F share Meowsticite).

---

## HOME-Transfer-Only Megas

These are **legal** in Reg M-A but can only be obtained via HOME transfer (not in Champions shop). Surfaced as a **warning**, not an error:

- Chesnaught-Mega (Chesnaughtite)
- Delphox-Mega (Delphoxite)
- Greninja-Mega (Greninjite)
- Floette-Mega and Floette-Mega-EF (Floettite)

---

## Violation Codes

Returned from `validateChampionsLegality(team)` in `{severity, code, message}` form.

| Code | Severity | Trigger |
|------|----------|---------|
| `BANNED` | error | Pokemon base species on `CHAMPIONS_BANNED_POKEMON` |
| `FAKEMON` | error | Pokemon name in `FAKEMON_BLOCKLIST` (currently empty) |
| `ITEM_ABSENT` | error | Held item is a known absent SV carryover |
| `ITEM_NOT_IN_CHAMPIONS_POOL` | error | Held item is outside `CHAMPIONS_LEGAL_ITEMS` |
| `MEGA_STONE_MISMATCH` | error | Mega Stone held by non-matching species |
| `HOME_TRANSFER` | warn | HOME-transfer-only Mega (legal but not shop-obtainable) |

Species Clause and Item Clause are enforced separately in `engine.js::validateTeam()`.

---

## UI Integration

- **Ladder Mode toggle** in `ui.js` gates battle start on a clean legality pass.
- Errors block simulation; warnings surface in the team card.
- `CHAMPIONS_FORMAT_LABEL` from `engine.js` is used as the format badge.

---

## Pending Work (Tracked in GitHub Issues)

Not enforced by `legality.js` yet; filed as follow-up tickets:

- Legal-item allowlist maintenance on patch notes
- Mewtwo X/Y, Latias, Latios — stones not in Game8 item list as of April 2026; may become Reg M-B content
- Mega Raichu — Beebom tier list reference unverified; stone not confirmed in item pool
