# Family Tree

This tenant follows the shared React Router SSR setup. It is served at
`familytree.shadowform.net` and locally at `http://familytree.localhost:3000`.
Run the repository's `npm run dev` with Node 22.22+.

## Editing the tree

Edit `data/family.json` and rebuild/redeploy with the other apps. No account,
database, or visitor editing is required. All information in this file is public.

- Each person needs a unique `id`, `name`, and `parentIds` array.
- `birth` uses numeric `month`, `day`, and `year`; unknown parts can be `null`.
- `living` records whether a person is living. Cards calculate current ages from
  birthdays in the America/Los_Angeles time zone when the page loads.
- `death` uses the same partial-date structure as `birth`. For deceased people,
  cards show age at death when known, otherwise "Deceased". `ageAtDeath` can
  record a known age when exact dates are unavailable.
- Optional `biography` and `notes` appear in the person details.
- `focusPersonId` marks the starting person with a Me label.
- `relationships` uses `{ "personIds": ["id1", "id2"], "type": "married" }`.
  `partner` and `divorced` render dotted and dashed connections, respectively.
  Parent-child connections come from `parentIds` independently of marriage.

Generation positions are calculated from parent links and relationships, keeping
spouses and former spouses in the same generation. Cards use HTML for accessible
names and keyboard focus, with SVG lines beneath them. Panning/zooming transforms
the entire scene rather than recomputing its layout. This is suited to normal
family trees; very large datasets may eventually need viewport culling.

Phones start around the focus person at a readable zoom; fit-to-screen shows
the whole tree.

Drag or use arrow keys with the canvas focused to pan. Scroll, pinch, or use
the controls to zoom. Press 0 or the fit button to show the whole tree. Select
a person for details; Escape closes the dialog. Search locates a person.

Build only this tenant: `npx react-router build src/familytree`.

Bernard’s November 1927 birth and April 2022 death are inferred from the family
remembrance posted April 10, 2022 (94th birthday the previous November). Exact
days remain unknown.

`siblingGroups` lists IDs of known siblings whose parents have not yet been
recorded, e.g. `["barbara", "elaine", "richard"]`. They share a generation and
a labeled sibling connector without creating placeholder parents.

## Photographs

Put optimized images in `src/familytree/public/photos/`, then add an optional
`photos` array to the person's record in `data/family.json`:

```json
"photos": [
  { "src": "/photos/jennifer-childhood.webp", "caption": "Childhood", "year": 1998 },
  { "src": "/photos/jennifer-vacation.webp", "caption": "Family vacation" }
]
```

`src` is required; `caption` and `year` are optional. Array order controls display
order. This is separate from the existing `photo` field used for the avatar.
Absent or empty arrays hide the section. Three thumbnails are shown; additional
images are accessible in the lightbox, with a +N overlay on thumbnail three.
Arrow keys, previous/next buttons, and horizontal touch swipes navigate with
wraparound. Escape, the close button, or the backdrop dismiss the lightbox and
return focus to its thumbnail. The underlying person record remains open.
No gallery dependencies or placeholder family photographs were added.

## Shared photo collection and tagging

Gallery photos now live in `data/photos.json`. Each photo needs a unique `id` and
`src`. Optional `caption`, `year`, `people` (person IDs), and `tags` (strings) add
context. For example:

```json
{
  "id": "bernard-elizabeth-vacation",
  "src": "/photos/elizabeth-berger-02.webp",
  "caption": "On vacation",
  "year": 2005,
  "people": ["bernard", "elizabeth"],
  "tags": ["vacation", "family"]
}
```

The caption, year and tags above are examples, not facts added to the real photo.
Galleries are derived from `people`; a single record appears in both galleries.
Unknown person IDs are ignored when rendering links. Existing per-person `photos`
arrays remain supported and are merged without duplicate image sources. Shared
records take precedence. Missing/invalid tags and blank image sources are ignored.
The lightbox's tag buttons show all matching photos in the shared collection;
use the back button to return to the filtered grid or original person gallery.
The two Elizabeth photos were migrated without invented dates or captions. The
latest photograph is associated with both Bernard and Elizabeth.

### Positions within a photograph

A shared photo may include optional `positions`, measured as percentages from
its top-left corner (x: left to right, y: top to bottom):

```json
"people": ["bernard", "elizabeth"],
"positions": [
  { "personId": "bernard", "x": 36, "y": 32 },
  { "personId": "elizabeth", "x": 67, "y": 67 }
]
```

Keep each positioned person in `people` too, so their gallery includes the photo.
Invalid coordinates, unknown people, and duplicate markers are ignored. The
lightbox's “Show people in photo” button reveals markers; hover, keyboard focus,
or tap reveals names. The existing names below the photo still navigate to the
tree. Positions scale with the displayed image and do not modify the photo.
The latest Bernard/Elizabeth photograph has approximate face positions to start.

The Overview spouse summary shows only the last `married` relationship for that
person. Keep relationships in chronological order (oldest first). The Family tab
retains all partners and former relationships.

## Gallery and navigation

`/gallery` browses the central photo collection once per image source, reusing
person-modal lightbox behavior. `?person=bernard`, `?tag=vacation`, and `?q=beach`
can be combined and shared. Filter changes use React Router URL state. Lightbox
tags open the Gallery with that tag; person labels navigate to `/?person=<id>`.
Tree camera position is retained in session storage between views. Desktop has
Tree/Gallery links; mobile uses a compact, dismissible navigation dropdown.

## Direct links

`/?person=elizabeth` opens that person's record and centers their node.
`/?person=elizabeth&photo=elizabeth-02` additionally opens the shared photograph
whose `id` matches `photo`. `/gallery?photo=elizabeth-02` opens it from Gallery;
existing `q`, `tag`, and `person` Gallery filters are preserved. Use the IDs in
`data/photos.json`; legacy embedded photos fall back to their image path.
Opening a record/photo adds history; moving between photos replaces the current
photo parameter. Closing removes the corresponding parameter. Browser back and
forward restore the selected record/photo; invalid IDs don't open an overlay.
