# Catalog numbers with no matching catalog item

From the official discography list at https://www.domeofdoom.org/artists,
these 18 releases have a real Bandcamp album link but no matching
`DomeOfDoomCatalogItem` in Strapi at all (checked by URL slug, not a
fuzzy/text match - confirmed genuinely absent, not a matching bug). They'd
need to be scraped/added to the catalog before a catalog number could
attach to anything - `backfillCatalogNumbersFromDiscography.js` only ever
writes onto items that already exist.

(DOD_015 - Wylie Vasquez Cable - How Can You Be In Two Places At Once When
You Aren't Anywhere At All - added manually, removed from this list.)

| Catalog # | Artist | Title |
|---|---|---|
| DODLP_006 | Speak | Singularity |
| DOD_079 | Odd Nosdam | Plan 9... Meat Your Hypnotis |
| DOD_071 | Lealani | Fantastic Planet |
| DOD_067 | Speak | A Man + His Plants |
| DOD_061 | Kenny Segal | Kenstrumentals Vol. 3: Travelog |
| DOD_057 | Space Gang | Return of the Goon |
| DOD_048 | Speak & Dream Panther | Speakpanther |
| DOD_043 | Los & Swisha | JBW2K16 |
| DOD_042 | Wylie Cable | Lunatic Bard |
| DOD_041 | Kenny Segal | Kenstrumentals Vol.2 |
| DOD_040 | Gnome Beats | Gnome Lyfe |
| DOD_039 | Elusive | French Toasted |
| DOD_037 | Swisha | Perfecto |
| DOD_036 | Eureka The Butcher | Music For Mothers |
| DOD_035 | Elos | Limit Break |
| DOD_034 | Linafornia | Yung |
| DOD_026 | Eraserfase | Analog Rituals |
| DODLP_001 | The Deathmedicine Band | Quaking Aspen EP |
