# Data sources

> **Status: provisional starter seed (N1).** `mock-server/db.seed.json` covers CSK and RCB only, their retained squads, and 21 players from the auction pool. It is replaced by the full, verified dataset later. `npm run db:reset` prints a reminder.

## Principle: data as of the auction date

Every value reflects what was true on **16 December 2025**, the day of the IPL 2026 Player Auction. Anything that changed afterwards is ignored. Examples: players released or withdrawn after the auction, replacement signings during the season, and BCCI central contracts announced after that date. Where sources disagree, the source closest to the auction date wins.

## Source precedence

| Field | Primary source | Fallback |
|---|---|---|
| Auction date, venue, squad rules, purses, retentions | iplt20.com retention and auction announcements | ESPNcricinfo |
| Pool players: name, role, capped status, base price | Official BCCI auction list (9 Dec 2025) | none |
| Auction results (sold to, price) | ESPNcricinfo sold-players page (archived 23 Dec 2025) | none |
| Unsold players | Olympics.com and myKhel unsold lists | ipl.com (fan site) |
| Retained players: name, role | iplt20.com pages as of the auction: squad page first, then player page | Cricbuzz |
| Date of birth, nationality | iplt20.com / ESPNcricinfo, cross-checked with Cricbuzz | none |
| Batting hand, bowling style | Cricbuzz | ESPNcricinfo (for players missing on Cricbuzz) |
| Retained players' capped status | Derived from the IPL rule (see below) | none |
| Team colours | CSS of the official club websites | none |

## Auction and rules

| Fact | Value | Source |
|---|---|---|
| Auction | IPL 2026 Player Auction (official: "TATA IPL 2026 Player Auction"), 2025-12-16, Etihad Arena, Abu Dhabi | [iplt20 news 4248](https://www.iplt20.com/news/4248/tata-ipl-2026-player-auction-list-announced), [iplt20 news 4247](https://www.iplt20.com/news/4247/tata-ipl-2026-player-retentions-announced) |
| Squad size | Minimum 18, maximum 25, overseas maximum 8 | [ESPNcricinfo FAQ](https://africa.espn.com/cricket/story/_/id/47290249/ipl-auction-2026-faqs-where-how-much) |
| Lowest base price | 30 lakh | [Official auction list (PDF, archived)](https://web.archive.org/web/2025/https://documents.iplt20.com/bcci/documents/1765197869375_TATA-IPL-2026-Auction-List-8.12.25.pdf) |

## Franchises

| Team | Purse before auction | Retained (overseas) | Open slots (overseas) | Source |
|---|---|---|---|---|
| CSK | ₹43.40 Cr | 16 (4) | 9 (4) | [iplt20 news 4247](https://www.iplt20.com/news/4247/tata-ipl-2026-player-retentions-announced), [ESPNcricinfo](https://africa.espn.com/cricket/story/_/id/46973801/ipl-2026-how-squads-stack-up) |
| RCB | ₹16.40 Cr | 17 (6) | 8 (2) | same |

CSK's retained squad includes Sanju Samson, traded in from RR before the auction ([ESPNcricinfo](https://africa.espn.com/cricket/story/_/id/46971443/ipl-2026-rr-trade-samson-csk-jadeja-curran)). RCB made no trades.

**Team colours.** All pairs are checked by `npm run db:validate` (WCAG AA, 4.5:1).

| Team | Primary / text | Secondary / text | Source |
|---|---|---|---|
| CSK | `#FFCB05` / `#1A1A1A` (11.43:1) | `#0066B3` / `#FFFFFF` (5.91:1) | chennaisuperkings.com homepage styles |
| RCB | `#C90C13` / `#FFFFFF` (5.92:1) | `#E7C641` / `#101612` (10.96:1) | royalchallengers.com stylesheets |

Brand blue on CSK yellow is only 3.88:1, so CSK yellow carries near-black text.

## Capped status (retained players)

Official rule, from the [IPL Player Regulations 2025–27](https://www.iplt20.com/news/4109/ipl-governing-council-announces-tata-ipl-player-regulations-2025-27) (iplt20.com, 28 Sep 2024):

> "A capped Indian player will become uncapped, if the player has in the last five calendar years preceding the year in which the relevant Season is held, not played in the starting XI in International Cricket (Test match, ODI, Twenty20 International) or does not have a Central Contract with BCCI."

ESPNcricinfo quotes the IPL's statement with **"and"** instead of "or" ([29 Sep 2024](https://www.espn.com/cricket/story/_/id/41502988/ipl-2025-rule-change-allows-csk-option-retaining-ms-dhoni-uncapped-player)). The official auction list follows the "and" reading. Venkatesh Iyer and Rahul Chahar have no central contract, but played internationals within the window, and the list classes both as capped.

**Applied rule.** An Indian player who has played international cricket is uncapped only when **both** conditions hold:
- no starting-XI international in 2021–2025;
- no BCCI central contract.

Overseas internationals are capped. Players who have never played international cricket are uncapped.

**Central contracts applied:** the BCCI senior men's list for 2024–25 (1 Oct 2024 to 30 Sep 2025, announced 21 Apr 2025; [DD News](https://ddnews.gov.in/en/bcci-central-contracts-2024-25-rohit-and-kohli-retain-a-contracts-iyer-and-kishan-mark-their-return/)). It was the latest list published on the auction date. The 2025–26 list was announced on 10 Feb 2026, after the auction, so it is ignored.

How the rule was applied to retained Indian players with international caps:

| Player | Last starting-XI international (before 16 Dec 2025) | Central contract 2024–25 | Classification |
|---|---|---|---|
| MS Dhoni | 2019-07-09, ODI v NZ (World Cup semi-final) | No | **Uncapped** (both conditions hold) |
| Krunal Pandya | 2021-07-25, T20I v SL | No | Capped |
| Bhuvneshwar Kumar | 2022-11-22, T20I v NZ | No | Capped |
| Khaleel Ahmed | 2024-07-30, T20I v SL | No | Capped |
| Devdutt Padikkal | 2024-11-22, Test v AUS | No | Capped |
| Anshul Kamboj | 2025-07-23, Test v ENG (debut) | No | Capped |
| Jitesh Sharma | 2025-12-14, T20I v SA | No | Capped |
| Virat Kohli, Ruturaj Gaikwad, Shivam Dube, Sanju Samson, Rajat Patidar | Within 2021–2025 | Yes | Capped |

Sources: player pages on Wikipedia and ESPNcricinfo stories, plus the 2024–25 contract list above. The ESPNcricinfo scorecards themselves could not be read (blocked), so these dates rest on Wikipedia and news reports. That is enough for the classification: every capped player's latest match is well inside the window except Krunal Pandya's (July 2021), and even his is inside it.

The other retained Indian players have never played international cricket and are uncapped.

## Bowling style mapping (N19)

| Source label | Stored value |
|---|---|
| Right-arm fast, fast-medium | `right-arm-fast` |
| Right-arm medium-fast, medium | `right-arm-medium` |
| Left-arm fast, fast-medium | `left-arm-fast` |
| Left-arm medium-fast, medium | `left-arm-medium` |
| Right-arm offbreak | `off-spin` |
| Legbreak, legbreak googly | `leg-spin` |
| Slow left-arm orthodox | `left-arm-orthodox` |
| Left-arm wrist spin | `left-arm-wrist-spin` |
| No style listed | `none` |

Part-time bowlers keep their listed style.

## Exceptions

Values that differ from the primary source.

| Player | Official / primary value | Value used | Reason |
|---|---|---|---|
| Auqib Nabi | Name "Auqib Dar" (official auction list) | Auqib Nabi | The name used in match coverage and by DC |
| Tim David | Nationality "Singaporean" (iplt20.com) | AUS | Has played for Australia since 2022 |
| Liam Livingstone | Bowling "right-arm offbreak, legbreak" (ESPNcricinfo); "right-arm legbreak" (Cricbuzz) | `off-spin` | Bowls both; one style stored, owner chose off-break |
| Khaleel Ahmed | "Syed Khaleel Ahmed" (iplt20 retention announcement) | Khaleel Ahmed | iplt20.com squad and player pages use this name |

## Known limitations

- Jake Fraser-McGurk and Spencer Johnson rest on ESPNcricinfo only; neither has a Cricbuzz profile.
- Batting hand for Swapnil Singh, Josh Hazlewood and Yash Dayal comes from Cricbuzz only.
- Pool players' names follow the official auction list. They were not cross-checked with iplt20.com, whose redesigned player pages were unavailable.
- Retained players' roles (Kamboj, Bethell, Bhuvneshwar) differ between iplt20.com pages. The pre-auction page is used.
- Bowling style wording differs between Cricbuzz and ESPNcricinfo. After mapping, this changes the stored value for Ramakrishna Ghosh, Anshul Kamboj and Bhuvneshwar Kumar: Cricbuzz's "fast-medium" gives `right-arm-fast`, where other sources give medium. It also changes Rahmanullah Gurbaz: Cricbuzz lists none, where ESPNcricinfo lists right-arm medium.
