# Data sources

`mock-server/db.seed.json` holds the full IPL 2026 Player Auction:

- all 10 franchises, with their official pre-auction purses and 173 retained players;
- a pool of 98 players: the 77 who were sold, plus the 21 who were called at the auction and went unsold with a base price of ₹1 Cr or more;
- all 98 auction results.

That makes 271 players in total. It replaces the provisional two-team starter seed (N31).

## Principle: data as of the auction date

Every value reflects what was true on **16 December 2025**, the day of the IPL 2026 Player Auction. Anything that changed afterwards is ignored: players released or withdrawn after the auction, replacement signings during the season, and BCCI central contracts announced after that date. Where sources disagree, the source closest to the auction date wins.

## Source precedence

| Field | Primary source | Cross-checks and fallback |
|---|---|---|
| Auction date, venue, squad rules, purses, retention lists | [iplt20.com retention announcement](https://www.iplt20.com/news/4247/tata-ipl-2026-player-retentions-announced) | ESPNcricinfo |
| Pool players: name, role, capped status, base price | Official BCCI auction list (9 Dec 2025 version, 369 players; [PDF, archived](https://web.archive.org/web/2025/https://documents.iplt20.com/bcci/documents/1765197869375_TATA-IPL-2026-Auction-List-8.12.25.pdf)) | none |
| Auction results (sold to, price) | ESPNcricinfo sold-players page, archived 23 Dec 2025 (its embedded data covers all 250 squad players) | Totals: 29 overseas players for ₹128.05 Cr and 48 Indian players for ₹87.40 Cr, matching the published figures |
| Unsold players | [Wisden's complete unsold table](https://www.wisden.com/series/ipl-2026/cricket-news/ipl-2026-auction-complete-list-of-players-unsold): the 79 players called and not bought, with base price and round | ESPNcricinfo's unsold total (79); myKhel, which omits Will Sutherland |
| Retained players: name, role | iplt20.com squad pages, archived (see the snapshot table below) | the iplt20.com player page |
| Date of birth, nationality | ESPNcricinfo (archived 23 Dec 2025) and the official auction list | Cricbuzz. All 271 players were cross-checked. |
| Batting hand, bowling style | Cricbuzz. Every player has a profile, matched by profile ID and confirmed by date of birth. | ESPNcricinfo and the official list, used for conflict checks |
| Retained players' capped status | The IPL rule (see below), using Cricbuzz's debut and last-match dates for each format | none |
| Team colours | CSS of the official club websites (rule below) | none |

### iplt20.com squad snapshots used (N34)

For each team, the latest archived squad page on or before the auction is used. A post-auction snapshot fills in only players missing from it: players traded in, or players who missed the 2025 season. No player's role differs between snapshots.

| Team | Pre-auction snapshot | Filled from post-auction snapshot |
|---|---|---|
| CSK, RCB | (starter seed, reviewed earlier) | Devdutt Padikkal and Jacob Bethell use their iplt20.com player pages |
| DC | 2025-10-11 | Nitish Rana (2026-02-09) |
| GT | 2025-11-19 | none |
| KKR | 2025-11-16 | none |
| LSG | 2025-11-16 | none |
| MI | 2025-12-16 | none |
| PBKS | 2025-10-11 | none |
| RR | 2025-10-10 | Donovan Ferreira, Ravindra Jadeja, Sam Curran, Sandeep Sharma (2026-02-18) |
| SRH | 2025-09-09 | Brydon Carse (2026-01-18) |

## Auction and rules

| Fact | Value | Source |
|---|---|---|
| Auction | IPL 2026 Player Auction (official: "TATA IPL 2026 Player Auction"), 2025-12-16, Etihad Arena, Abu Dhabi | [iplt20 news 4248](https://www.iplt20.com/news/4248/tata-ipl-2026-player-auction-list-announced), [iplt20 news 4247](https://www.iplt20.com/news/4247/tata-ipl-2026-player-retentions-announced) |
| Squad size | Minimum 18, maximum 25, overseas maximum 8 | [ESPNcricinfo FAQ](https://africa.espn.com/cricket/story/_/id/47290249/ipl-auction-2026-faqs-where-how-much) |
| Lowest base price | 30 lakh | Official auction list |

## Franchises

| Team | Purse before auction | Retained (overseas) | Open slots (overseas) | Bought | Spent | Left after auction |
|---|---|---|---|---|---|---|
| CSK | ₹43.40 Cr | 16 (4) | 9 (4) | 9 | ₹41.00 Cr | ₹2.40 Cr |
| DC | ₹21.80 Cr | 17 (3) | 8 (5) | 8 | ₹21.45 Cr | ₹35 L |
| GT | ₹12.90 Cr | 20 (4) | 5 (4) | 5 | ₹10.95 Cr | ₹1.95 Cr |
| KKR | ₹64.30 Cr | 12 (2) | 13 (6) | 13 | ₹63.85 Cr | ₹45 L |
| LSG | ₹22.95 Cr | 19 (4) | 6 (4) | 6 | ₹18.40 Cr | ₹4.55 Cr |
| MI | ₹2.75 Cr | 20 (7) | 5 (1) | 5 | ₹2.20 Cr | ₹55 L |
| PBKS | ₹11.50 Cr | 21 (6) | 4 (2) | 4 | ₹8.00 Cr | ₹3.50 Cr |
| RCB | ₹16.40 Cr | 17 (6) | 8 (2) | 8 | ₹16.15 Cr | ₹25 L |
| RR | ₹16.05 Cr | 16 (7) | 9 (1) | 9 | ₹13.40 Cr | ₹2.65 Cr |
| SRH | ₹25.50 Cr | 15 (6) | 10 (2) | 10 | ₹20.05 Cr | ₹5.45 Cr |

Every team finished with 25 players, at most 8 of them overseas, and within its purse.

Trades before the auction are reflected in the retention lists. They are marked "(T)" in the announcement: Samson (to CSK); Jadeja, Curran and Ferreira (to RR); Nitish Rana (to DC); Arjun Tendulkar and Shami (to LSG); Markande, Shardul Thakur and Rutherford (to MI).

**Team colours (N36).** The primary colour is the club's main brand colour in its website CSS. The secondary is the most-used *second* brand colour, whatever name the CSS gives it. Text colours are white where white reaches 4.5:1; otherwise a dark colour from the same CSS, or black. All pairs are checked by `npm run db:validate` (WCAG AA, 4.5:1).

| Team | Primary / text | Secondary / text | Source |
|---|---|---|---|
| CSK | `#FFCB05` / `#1A1A1A` (11.43:1) | `#0066B3` / `#FFFFFF` (5.91:1) | chennaisuperkings.com homepage styles |
| DC | `#06245F` / `#FFFFFF` (14.73:1) | `#D71923` / `#FFFFFF` (5.18:1) | delhicapitals.in `main.css`, `home-page.css` (`--primary-900`, `--accent-900`) |
| GT | `#0B1D34` / `#FFFFFF` (16.94:1) | `#F3DC8A` / `#0B1D34` (12.44:1) | gujarattitansipl.com `main.css`, `home-page.css` (`--primary-color`, `--accent-color`) |
| KKR | `#3A225D` / `#FFFFFF` (13.40:1) | `#F2BF26` / `#3A225D` (7.82:1) | kkr.in `main.css`, `home-page.css` (the CSS names the gold "primary"; brand order used) |
| LSG | `#002352` / `#FFFFFF` (15.42:1) | `#A8003B` / `#FFFFFF` (7.70:1) | lucknowsupergiants.in `main.css`, `home-page.css` (`--primary-900`, `--accent`) |
| MI | `#001848` / `#FFFFFF` (17.15:1) | `#D1AB3E` / `#001848` (7.85:1) | mumbaiindians.com `main.css`, `common.css` (the site's navy; the familiar `#004BA0` is not used) |
| PBKS | `#ED1C24` / `#000000` (4.79:1) | `#3F62AE` / `#FFFFFF` (5.88:1) | punjabkingsipl.in `main.css` (`--primary-color`, `--tertiary-color`, `--black-color`) |
| RCB | `#C90C13` / `#FFFFFF` (5.92:1) | `#E7C641` / `#101612` (10.96:1) | royalchallengers.com stylesheets |
| RR | `#E50693` / `#000000` (4.78:1) | `#1226AB` / `#FFFFFF` (11.11:1) | rajasthanroyals.com `main.css`, `home-page.css` (`:root` light values) |
| SRH | `#EF4123` / `#171717` (4.65:1) | `#171717` / `#FFFFFF` (17.93:1) | sunrisershyderabad.in CSS chunk and homepage classes |

White text fails on four brand colours: CSK yellow (brand blue on it is only 3.88:1), PBKS red (4.38:1), RR pink (4.39:1) and SRH orange (3.85:1). Those teams use dark text.

## Capped status

Pool players use the official auction list, except where the list contradicts itself (none among the 98 in the pool).

Retained players are classified by the official rule from the [IPL Player Regulations 2025–27](https://www.iplt20.com/news/4109/ipl-governing-council-announces-tata-ipl-player-regulations-2025-27) (iplt20.com, 28 Sep 2024):

> "A capped Indian player will become uncapped, if the player has in the last five calendar years preceding the year in which the relevant Season is held, not played in the starting XI in International Cricket (Test match, ODI, Twenty20 International) or does not have a Central Contract with BCCI."

ESPNcricinfo quotes the IPL's statement with **"and"** instead of "or" ([29 Sep 2024](https://www.espn.com/cricket/story/_/id/41502988/ipl-2025-rule-change-allows-csk-option-retaining-ms-dhoni-uncapped-player)). The official auction list follows the "and" reading: Venkatesh Iyer and Rahul Chahar have no central contract, but played internationals within the window, and the list classes both as capped.

**Applied rule (N21).** An Indian player who has played international cricket is uncapped only when **both** conditions hold:
- no starting-XI international in 2021–2025;
- no BCCI central contract.

Overseas internationals are capped. Players who have never played international cricket are uncapped.

**Central contracts applied:** the BCCI senior men's list for 2024–25 (1 Oct 2024 to 30 Sep 2025, announced 21 Apr 2025; [DD News](https://ddnews.gov.in/en/bcci-central-contracts-2024-25-rohit-and-kohli-retain-a-contracts-iyer-and-kishan-mark-their-return/)). It was the latest list published on the auction date. The 2025–26 list was announced on 10 Feb 2026, after the auction, so it is ignored.

**Method (N35).** Each retained player's debut and last-match dates for Tests, ODIs and T20Is come from their Cricbuzz profile. A player whose debut came after the auction counts as having no international.

**Retained Indian internationals who are uncapped:**

| Player | Last international | Central contract 2024–25 |
|---|---|---|
| MS Dhoni (CSK) | 2019-07-09 | No |
| Mayank Markande (MI) | 2019-02-24 | No |
| Sandeep Sharma (RR) | 2015-07-19 | No |

**Capped only because their last international falls just inside the window** (none of them has a contract):
- Manish Pandey: 2021-07-23
- Krunal Pandya: 2021-07-25
- Nitish Rana: 2021-07-29
- T Natarajan: 2021-03-28
- Ishant Sharma: 2021-11-25

Every other capped retained Indian player last played an international in 2022 or later, or holds a 2024–25 contract.

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
| Left-arm wrist spin (the official list's "Slow Unorthodox") | `left-arm-wrist-spin` |
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
| Satvik Deswal | Batting "Left Handed Bat" (Cricbuzz) | right | ESPNcricinfo and the official auction list both say right-handed |
| Tilak Varma | "N. Tilak Varma" (iplt20.com); "Tilak Verma" (announcement) | Tilak Varma | Common usage (ESPNcricinfo, Cricbuzz, coverage) |
| Suryakumar Yadav | "Surya Kumar Yadav" (iplt20.com squad page) | Suryakumar Yadav | The announcement and common usage |
| T Natarajan | "T. Natarajan" (iplt20.com) | T Natarajan | Initials without full stops, matching "MS Dhoni" and "KL Rahul" |
| Digvesh Rathi | "Digvesh Singh" (iplt20.com) | Digvesh Rathi | The announcement, ESPNcricinfo and coverage |
| Manimaran Siddharth | "M. Siddharth" (iplt20.com) | Manimaran Siddharth | The announcement and ESPNcricinfo |
| Shahbaz Ahmed | "Shahbaz Ahamad" (iplt20.com) | Shahbaz Ahmed | The announcement, ESPNcricinfo and coverage |
| Mohammed Shami | "Mohammad Shami" (iplt20.com); "Md Shami" (announcement) | Mohammed Shami | ESPNcricinfo, BCCI and coverage; matches "Mohammed Siraj" |
| Arshad Khan | "Mohd. Arshad Khan" (iplt20.com) | Arshad Khan | ESPNcricinfo and coverage |
| Lungi Ngidi | "Lungisani Ngidi" (official list) | Lungi Ngidi | Common usage |
| Quinton de Kock | "Quinton De Kock" (official list) | Quinton de Kock | Common capitalisation |
| Tejasvi Singh Dahiya | "Tejasvi Singh" (official list); "Tejasvi Dahiya" (ESPNcricinfo) | Tejasvi Singh Dahiya | Widely reported full name (owner) |
| Mujeeb Ur Rahman | "Mujeeb Rahman" (official list) | Mujeeb Ur Rahman | ESPNcricinfo, Cricbuzz and ICC |
| Dan Lawrence | "Daniel Lawrence" (official list) | Dan Lawrence | Common usage (ECB, ESPNcricinfo) |
| Will Sutherland | "William Sutherland" (official list) | Will Sutherland | Common usage (Cricket Australia, ESPNcricinfo) |
| Waqar Salamkheil | "Mohammad Waqar Salamkheil" (official list) | Waqar Salamkheil | Common usage |

## Conflicts resolved by the precedence rules

These follow the documented order, so they are not exceptions. They are listed so anyone checking the data can see them.

- **Pace wording (44 players).** Cricbuzz has no "medium-fast" label. Where it says "fast-medium", ESPNcricinfo often says "medium-fast" or "medium", so the stored value is `*-fast` rather than `*-medium`. Examples: Bhuvneshwar Kumar, Arshdeep Singh, Mitchell Marsh. One case goes the other way: Arshad Khan (Cricbuzz "left-arm medium", ESPNcricinfo "left-arm fast-medium").
- **No style on Cricbuzz, a style on ESPNcricinfo.** Stored `none` for Rahmanullah Gurbaz, David Miller, Ishan Kishan and Akshat Raghuwanshi.
- **Spin type**, Cricbuzz used:
  - Angkrish Raghuvanshi: off-break (ESPNcricinfo: left-arm orthodox).
  - Sarthak Ranjan: off-break; the official list agrees (ESPNcricinfo: leg-break).
  - Satvik Deswal and Shivang Kumar: left-arm wrist spin; the official list agrees (ESPNcricinfo: orthodox).
  - Shreyas Iyer and Riyan Parag: leg-break (ESPNcricinfo lists off-break first).
- **Date of birth.** Yash Raj Punja: 2006-06-26 from ESPNcricinfo and Cricbuzz. The official list's 2006-01-26 is taken to be a typo.
- **Roles.** iplt20.com lists Sai Sudharsan as All-Rounder and Rahul Tewatia as Bowler. Both are kept (N20, N41).

## Known limitations

- **23 players on the final list were never called** because the auction ended first, so they have no result and are not in the pool (N32). They include Steve Smith, Shai Hope, Liam Dawson, Naveen-ul-Haq, Umesh Yadav, Kusal Perera and Kyle Verreynne. The official list wrongly marks Verreynne "Uncapped" next to his 31 Tests.
- **The capped rule's "starting XI" condition isn't checked match by match.** Cricbuzz's last-played dates may include appearances as a substitute.
- **Some retained roles come from pre-retention snapshots** (Sep–Oct 2025) or from the post-auction pages listed above, because no snapshot exists between 15 Nov and 16 Dec for those teams.
- **Batting hand and bowling style rest on Cricbuzz alone for the 21 unsold players.** ESPNcricinfo's archived page covers only squad players, but the official list agrees on hand for all of them.
- **Bowling-style wording differs between Cricbuzz and ESPNcricinfo** (see the conflicts above).
- **Team colours come from the clubs' 2026 websites**, which may have changed since the auction; there is no archive of the stylesheets. MI, DC, GT and LSG all use dark navy primaries, so their badges look alike.
