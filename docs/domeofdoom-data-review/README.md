# Event inventory review — October 23, 2026

This file tracks remaining research and records promoted into the CMS.

## Remaining inventory

Radio appearances are excluded from Shows at the user's request (October 23, 2026). Four live CMS entries and five pending source candidates were removed; the Room 303 proposal is also excluded. Do not reimport radio broadcasts as shows.

Of the original 180 source events, 15 are published, nine radio appearances are excluded, and 156 remain in the review inventory. Three previously deleted legacy events remain excluded from import, leaving 153 active candidates. Three have corroborated core facts; 150 still require review.

Original source material remains historical evidence; the structured files here contain only active non-radio candidates.

## Japan tour — complete in CMS

All five known 2026 Japan club/in-store stops are published: ENTER Shibuya (September 17), heavysick ZERO (September 18), Solfa (September 23–24), OVERDUB Hamamatsu (September 25, 21:00), and LORE BEHIND THE STORE Osaka (September 26, 17:00–21:00). Client-supplied flyers resolved the Hamamatsu date and Osaka venue; both are uploaded and linked. Solfa now has its primary and lineup flyers and an individual page. Osaka also has an individual page with its supplied flyer; OVERDUB remains external-only. The Mayumikiller/Wylie Cable Room 303 recording is from September 18 in Tokyo and is not associated with Osaka.

## Added 2025 shows

Dabow at Maybe Forever, Denver (May 31–June 1) is published with a flyer, linked YouTube recording, and individual page. Hamdi: Abomination Club Tour at DEF, Atlanta (April 19–20), is published as an external-only listing with the supplied flyer and promoter-managed RA link. The Atlanta venue is displayed as TBA at the client’s request. Both retain only Dabow in the roster relation.

## Proposed next batch

Structured proposals are in [next-batch-proposals.json](next-batch-proposals.json). These are preparation records, not an import command.

| Source ID | Event | Date | What is resolved / remaining |
|---|---|---|---|
| DOD-P023-L01 | Dabow at Luna Lounge | April 26, 2025 | The artist listing specifies Cheektowaga, NY, rather than Buffalo metro. The [promoter archive](https://linktr.ee/lunapresentsbuffalo) corroborates the Dabow event. Store the precise municipality. |
| DOD-P021-L01 | Dabow at The Office | April 18, 2025 | Artist archive corroborates Nashville, venue and date. Event permalink remains preferable to the general artist archive, but no missing event time needs to be invented. |
| DOD-P039-L25 | An Intimate Evening w/ DMVU | January 21–22, 2023 | [Venue event page](https://events.blackboxdenver.co/e/dmvu-jan21) bills DMVU plus Shrimpnose, Wasabi Jackson and Sound Guy Josh, 21:00–02:00. The original inventory's Daedelus credit is not corroborated; replace it with DMVU. |

## Next research priorities / client-supplied material

- **Los Globos, October 16, 2026:** now added after client venue confirmation and listing corroboration. The supplied compilation artwork is associated with this show at client direction; its printed September 25 date is not the event date.
- **Meow Wolf, August 12, 2017:** supplied venue URL plus artist archive are promising; keep separate from the Las Cruces date.
- **Barricade Culture Shop, August 13, 2017:** preserve the user's provisional date. It is not independently verified; keep the flag until a flyer/promoter source surfaces.
- **Historical artist handling:** five Lealani-only entries have no current CMS artist relation. Live published artist lookup in this pass finds no Lealani record. A hidden historical artist record would preserve the relation-only index policy, but the existing hide_from_roster schema field is not yet used by frontend normalization/filtering; wire that behavior before relying on it. The other three unmatched entries require clarification of their Dome of Doom artist/label connection rather than blindly importing empty attribution.

## Other useful findings (not imported)

The fetched [Wylie Cable archive](https://www.wyliecable.com/shows) includes Red Room (December 31, 2025), Black Box (August 16, 2024), and 1720 (June 6, 2024), which are not in the 180-event source inventory. Keep these as separate discovery candidates rather than pretending the supplied document is a complete archive.

The artist archive also lists Nightfall on November 3, 2019. This is useful performance-day evidence for the already-published event; preserve the festival's November 1–3 range if a subsequent edit distinguishes performance dates from festival dates. No existing CMS record was edited in this research pass.
