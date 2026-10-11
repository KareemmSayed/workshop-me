# workshop.json

One JSON object holds everything on the page. `assets/example/` is a complete, working workshop to copy from. `scripts/build.mjs` checks the file before building and explains each problem.

## Files next to the JSON

Long content is easier to write, read and edit as its own file than as an escaped JSON string. Anywhere the tables below show a field with a `File` twin, give one or the other:

| Inline | Or a file | Holds |
|---|---|---|
| `preview.html`, `preview.code`, `preview.text` | `preview.file` | A variation's preview |
| `preview.css` | `preview.cssFile` | Extra CSS for one mockup (rarely needed: a `<style>` block in the fragment does the same) |
| `prompt` | `promptFile` | A variation's prompt |
| `previewCss` | `previewCssFile` | Styles shared by every mockup |
| `groundRules` | `groundRulesFile` | Rules appended to every prompt |

Paths are relative to the JSON file and must stay inside its folder. The build reads the files in, so the page it writes is still a single file. A typical workshop folder:

```
docs/workshop-me/insights-page/
  workshop.json
  shared.css          tokens and app shell for every mockup
  1.html  2.html  3.html
  1.prompt.txt  2.prompt.txt  3.prompt.txt
  ground-rules.txt
  workshop.html       built
```

## Inline formatting

Strings marked *rich* below accept two marks and nothing else:

- `**bold**` for the lead words of a bullet
- `` `code` `` for file names, functions and values

Everything else is shown as plain text. There is no HTML and no other Markdown. (Mockup files are HTML, of course; this is about the page's own text.)

## Top level

| Field | Required | What it is |
|---|---|---|
| `project` | yes | The host project's name. Shown as the wordmark. |
| `title` | yes | The page name for the browser tab: a short noun phrase, such as "Fieldnote Insights Workshop". |
| `headline` | yes | The decision, as the big heading: "Three ways to build Fieldnote's Insights page". |
| `eyebrow` | no | Small line above the headline: kind of page, date, number of variations. |
| `intro` | no | *Rich.* One or two sentences under the headline. |
| `aura` | no | Hero glow. One of `violet` (default), `graphite`, `ember`, `moss`, `amber`, `azure`, `flame`. See `design.md`. |
| `axis` | recommended | *Rich.* One sentence on what the variations differ on. Shown above the comparison after the words "What differs:". |
| `brief` | yes | `{ "blocks": [ ... ] }`, see below. What was asked, what exists, what you assumed. |
| `criteria` | recommended | Columns of the comparison table: a list of `{ "id", "label" }`. Two to four. |
| `recommended` | recommended | `{ "id": "<variation id>", "why": "..." }`. `why` is *rich*. |
| `picked` | no | `{ "id": "<variation id>", "note": "..." }`. Set after the user chooses and it is built; the page then shows the pick and dims the rest. `note` is *rich*. |
| `rounds` | no | Groups of variations, oldest first: a list of `{ "id", "label", "note" }`. Add when a second round is made. |
| `variations` | yes | Two or more. See below. |
| `previewCss` | recommended | CSS added to every `html` preview: the host project's tokens, fonts and app shell. |
| `groundRules` | recommended | Plain text appended to every prompt. See `writing-prompts.md`. |
| `appendMockup` | no | `false` stops the page adding the mockup's source to the copied prompt. Leave it on unless the mockups are very large. |
| `variationsNote` | no | Replaces the sentence under "Variations". |
| `footer` | no | *Rich.* What you read to make the page. |
| `lang`, `dir` | no | Page language code and `"ltr"` or `"rtl"`. Layout mirrors for right-to-left, and mockup fragments are wrapped with the same values. |
| `labels` | no | Overrides for the page's fixed strings. See the end of this file. |

## Brief blocks

`brief.blocks` is a list. Blocks sit in a two-column grid; `"wide": true` makes one span both columns.

| Field | Required | What it is |
|---|---|---|
| `title` | yes | Block heading. |
| `wide` | no | `true` to span the full width. |
| `text` | no | *Rich.* A short muted line above the bullets or table. |
| `bullets` | one of these | List of *rich* strings. |
| `table` | one of these | `{ "columns": [...], "rows": [[...], ...] }`. Each row has one cell per column. |
| `note` | no | *Rich.* A muted line under the block. |

A table cell is either a string or `{ "text": "...", "tone": "..." }`. Tones: `num` (dot-matrix figure), `good` (green), `bad` (red), `warn` (amber), `muted`.

## Variations

| Field | Required | What it is |
|---|---|---|
| `id` | yes | What the user says in the chat: `"1"`, `"2"`, `"3"`. A string of one to four letters or digits, unique across all rounds. |
| `name` | yes | Two or three words a person can say: "Dashboard grid". |
| `description` | yes | *Rich.* One or two sentences on the idea. |
| `preview` | yes | What the user looks at. See below. |
| `prompt` | yes | Plain text. The full brief that builds this variation. |
| `bestFor` | recommended | List of *rich* bullets: when this is the right pick. |
| `tradeoffs` | recommended | List of *rich* bullets: what it costs. |
| `scores` | recommended | An object keyed by criterion id. Each value is a string or `{ "text", "tone" }`, a few plain words. |
| `landsIn` | recommended | List of file or folder paths in the host project. |
| `size` | no | `"S"`, `"M"` or `"L"`: effort in working sessions with a coding agent. Leave out when nothing is being built (wording choices, for example). |
| `round` | when `rounds` exist | One of the round ids. List variations round by round. |
| `basedOn` | no | List of earlier variation ids this one grew out of. |

### Preview

`type` decides the rest.

| `type` | Content | Options |
|---|---|---|
| `html` | `html` or `file`: a mockup. Normally a fragment (a `<style>` block and markup), which the page wraps in a document together with `previewCss`. A complete document (starting with `<!doctype html>` or `<html>`) is used as it is and gets no shared styles. | `width` (default 1280) and `height` (default 800): the desktop frame in pixels. `phoneHeight` (default 760): the phone frame's height; its width is 390. `label`: replaces "Preview". |
| `code` | `code` or `file`: shown in a code block, not wrapped. | `language` or `label`: the heading of the block. |
| `text` | `text` or `file`: shown large, with line breaks kept. *Rich.* | `label`. |

Mockups run in a sandboxed frame: no scripts, no forms, no access to the page. The rules for writing them are in `variations.md`.

## What a copied prompt contains

In this order, as one block:

1. the variation's `prompt`;
2. `groundRules`;
3. for `html` previews, a short heading followed by the mockup's source (`previewCss`, then the fragment), unless `appendMockup` is `false`.

What the user sees when they unfold a prompt is exactly what the copy button copies.

## Rounds

Leave `rounds` out for a first page. When the user asks for another round, add it:

```json
"rounds": [
  { "id": "r1", "label": "Round 1" },
  { "id": "r2", "label": "Round 2", "note": "More like 2, with less on screen" }
],
```

Give every variation a `round`, add the new ones after the old with new ids and `basedOn`, and update `recommended`. The page then shows a chip per round and opens on the newest.

## Labels

Every fixed string on the page can be replaced through `labels`, which is how a page is written in another language. Unlisted keys keep their defaults.

| Key | Default |
|---|---|
| `navBrief`, `navCompare`, `navVariations` | Brief, Compare, Variations |
| `briefEyebrow`, `briefTitle` | Part 1 · what this is built on, The brief |
| `compareEyebrow`, `compareTitle`, `axis` | Part 2 · side by side, Compare, What differs |
| `variationsEyebrow`, `variationsTitle`, `variationsLede` | Part 3 · pick one, Variations, the explainer sentence |
| `recommended`, `picked` | Recommended, Picked |
| `bestFor`, `tradeoffs`, `lands`, `basedOn` | Best when, Trade-offs, Lands in, Builds on |
| `preview`, `previewTitle` | Preview, `Preview of variation {id}: {name}` |
| `open`, `close`, `prev`, `next` | Open full size, Close, Previous, Next |
| `all`, `desktop`, `phone` | All, Desktop, Phone |
| `pick` | ``Say `variation {id}` in the chat to build it here, or copy the prompt into a new session.`` |
| `prompt`, `copy`, `copied`, `selected` | `Prompt · variation {id}`, Copy prompt, Copied, Selected · press copy |
| `mockupHead` | The heading placed before the mockup source in a copied prompt. `{id}` is filled in. |
| `colNo`, `colVariation`, `colSize` | #, Variation, Effort |
| `sizeS`, `sizeM`, `sizeL` | S · under half a session, M · one session, L · a full session or more |
| `steps` | A list of the four hero steps |

If you change `pick`, keep the phrase the user is told to say in step with what you will recognise in the chat.

## Minimal file

```json
{
  "project": "Fieldnote",
  "title": "Fieldnote Insights Workshop",
  "headline": "Two ways to build the Insights page",
  "axis": "what the page leads with: **one number** or **a grid**.",
  "brief": { "blocks": [ { "title": "Assumed, not asked", "bullets": ["**Words are the measure**, not notes."] } ] },
  "criteria": [ { "id": "glance", "label": "Answer at a glance" } ],
  "recommended": { "id": "1", "why": "It answers the question that was asked and costs the least." },
  "previewCssFile": "shared.css",
  "groundRulesFile": "ground-rules.txt",
  "variations": [
    {
      "id": "1", "name": "One number", "size": "S",
      "description": "A single figure and one sentence that reads it for you.",
      "preview": { "type": "html", "file": "1.html", "height": 680 },
      "bestFor": ["People open the page for reassurance."],
      "tradeoffs": ["No depth: nothing by tag or by day."],
      "scores": { "glance": { "text": "One second", "tone": "good" } },
      "landsIn": ["src/ui/screens/Insights.tsx"],
      "promptFile": "1.prompt.txt"
    },
    {
      "id": "2", "name": "Dashboard grid", "size": "M",
      "description": "Four tiles, a chart and a breakdown by tag.",
      "preview": { "type": "html", "file": "2.html" },
      "bestFor": ["People ask for several numbers."],
      "tradeoffs": ["Nothing leads."],
      "scores": { "glance": { "text": "Scan four tiles", "tone": "warn" } },
      "landsIn": ["src/ui/screens/Insights.tsx", "src/ui/components/StatTile.tsx"],
      "promptFile": "2.prompt.txt"
    }
  ]
}
```
