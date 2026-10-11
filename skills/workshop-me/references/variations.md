# Making variations worth choosing between

A workshop page is only as good as the difference between its variations. Three versions of the same idea in different colours waste the user's time more politely than asking them twenty questions would have.

## Choose the axis first

The axis is the one decision the variations disagree about. Find it by asking what the user would have had to decide if they had specified this themselves, and which of those decisions changes the result most.

Axes that produce real choices:

| Axis | The variations answer |
|---|---|
| What leads | Which single thing does the screen say first? |
| How much at once | One thing, a handful, or everything? |
| Layout model | List, grid, split view, timeline, canvas, wizard? |
| Who it is for | The first-time user, the daily user, or the expert? |
| Where it lives | Its own page, a panel, inline where the work happens, a command? |
| How it is driven | Browsed, searched, asked for, or pushed to the user? |
| Scope | The smallest thing that helps, the expected thing, the ambitious thing? |
| For code: where the decision sits | Per call, per object, in configuration, by convention? |

Axes that do not, on their own: colour, corner radius, font, spacing, icon style, light or dark. Those are settings of one design, and three tints of one layout are one variation.

Visual direction is different, and it is a real axis in two cases: the user asked for style options, or the thing has no look yet (a landing page, a new app, a rebrand) so the look is part of what is being decided. Then each variation is a whole concept, with its own direction and its own structure. `mockup-craft.md` covers how to choose directions that truly differ. Inside an existing product with an existing look, hold style constant and vary structure.

Write the axis as one sentence and put it in `axis`. "What the page leads with: one number, a grid of numbers, or sentences." If you cannot write it, you are not ready to draw.

A test: describe how two variations differ. If the only words you have are adjectives ("cleaner", "more modern", "bolder"), they are the same variation. Real differences are nouns and verbs: "this one has no chart", "this one starts from search".

## Spread them along it

With three, a shape that works again and again:

1. **The expected one.** Closest to what the project already does or what the user probably pictured. It is the baseline the others are judged against, so draw it as well as the others.
2. **The one that commits.** Takes the axis seriously and goes to one end of it.
3. **The one that reframes.** Answers the request from a different starting point: the same need, met in a way they did not ask for.

With two, use them for a real either/or. With four or five, add the other end of the axis and one hybrid. Past five, people stop comparing and start skimming; split into two workshops or two rounds instead.

Every variation must be one you could recommend to some version of this user. A weak option included to make another look good is noticed, and it costs the page its credibility. If you can only think of two honest ones, make two.

## Hold everything else constant

A comparison is only readable when one thing changes.

- **Same content.** Every variation shows the same facts: the same week, the same user, the same twelve rows. If variation 2 has a feature the others lack, that is a difference in scope and belongs in the axis or in its trade-offs, in words.
- **Same sample data, and it must add up.** Totals equal the sum of their parts, percentages match the numbers beside them, a streak agrees with the days shown. People spot one impossible number and stop trusting the mockup. Decide the data once, write it down, and use it everywhere.
- **Same shell**, when the variations share a look: navigation, page chrome and tokens live in `shared.css` and are identical. When the variations are concepts with their own directions, `shared.css` holds only what is truly common and each fragment carries its own tokens.
- **Same fidelity.** Do not polish the one you prefer.

## Mockups

How good the mockups look and how well they are thought through is covered in `mockup-craft.md`; read it before drawing. This section is the mechanics.

Each mockup is a fragment of static HTML and CSS: no `<html>`, `<head>` or `<body>`, just a `<style>` block for what is specific to this variation, followed by markup. The page wraps it in a document, adds `shared.css`, and shows it in a sandboxed frame laid out at 1280px wide (scaled to fit) or 390px wide under the Phone switch.

**`shared.css`** holds what every variation has in common: the tokens as custom properties, the fonts, the base type styles and the app shell. When the look is the project's, read the values from its theme files and do not approximate them; if it loads a Google Font, import the same one. When the look is yours, this is where your direction and its tokens go.

Rules that keep mockups working:

- **No scripts.** The frame is sandboxed and scripts do not run. Show interaction with CSS (`:hover`, `:focus`, `:checked`, `<details>`), or draw the second state as its own region with a label.
- **Nothing from the network** except Google Fonts. No image URLs, icon CDNs or chart libraries: some hosts block them and the page must work offline. Draw charts and icons with inline SVG or plain elements; use initials or a tinted block where a photo would be.
- **Responsive.** It will be viewed at 1280 and at 390. Use a media query, or fluid layout that survives both. Check the Phone view before delivering.
- **Real words.** The project's own labels, plausible names, sentences a product would really say. No lorem ipsum: placeholder text hides whether a layout works.
- **One state, the main one.** Show the screen as it looks on a normal day. Empty, loading and error states go in the prompt as words, unless a state is the whole point of the variation.
- **Accessible enough to be honest.** Text alternatives on charts, real headings, sensible contrast. The implementing session copies what it sees.
- **Small.** Aim for under 15 KB each. The mockup is appended to the prompt and loaded twice on the page.
- **No `position: fixed`**, and nothing that depends on the frame's height: it is a preview window, not a device.
- Set `preview.height` so the frame shows the screen without a tall empty band or an early cut-off.

Spend the effort where the variations differ. The shell and the shared parts are written once; the region that changes is the part to draw with care.

## Variations that are not visual

Not every decision has a screen. The same page works for them with a different preview.

- **`code`**: for an API shape, a data model, a configuration format, a file layout. Show how each option reads at the place it is used: the call site, the query, the config file a person would write. Fifteen to forty lines. Use the same scenario in every variation, so that what differs is the design.
- **`text`**: for naming, microcopy, an error message, a tone of voice. Show the words in the order a person would meet them.
- An architecture choice is often clearest as an `html` preview containing a small inline-SVG diagram, with the same boxes arranged differently in each variation.

The rest holds unchanged: one axis, honest spread, same scenario throughout, a trade-off for each.

## The comparison

Choose two to four `criteria` the user would decide by. Good ones are specific to this decision and split the variations: "answer at a glance", "works with little data", "room for more numbers", "new parts to build". A criterion on which every variation scores the same is not a criterion; drop it.

Write each cell as a few plain words, not a score: "One second", "Scan four tiles", "Read a paragraph". Tone it `good`, `warn` or `bad`. No variation should be green in every column. If one is, either the others are strawmen or a criterion is missing.

## The recommendation

Say which one you would build and give the reason in terms of what they asked for. Prefer the reason that is about them ("the request was to show how much people write; this answers that and nothing else") over the reason that is about the design ("it is the cleanest").

It is fine, often right, to recommend the cheapest variation and note that it does not close off the others. If the choice turns on something only they know (who the users are, how soon it has to ship), say what it turns on and which variation follows from each answer.

## Later rounds

**"More like 2."** Variation 2's position on the first axis is now fixed. Pick a second axis inside it (density, what the secondary region holds, how it behaves with little data) and make two or three variations along that. Set `basedOn: ["2"]`.

**"2 with the header from 3."** If it needs to be seen before it is built, draw it as one new variation with `basedOn: ["2", "3"]`.

**"None of these."** The axis missed. Ask one question about what all of them got wrong, then choose a different axis. Do not reshuffle the same three ideas.

Keep earlier rounds on the page and keep counting ids upward, so "variation 5" never means two things. The page opens on the newest round and keeps the rest under "All".
