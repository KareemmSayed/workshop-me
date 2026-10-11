---
name: workshop-me
description: Turn a decision into variations the user can see and pick from. Produces one designed HTML page with 2 to 5 real alternatives for what they asked for - live HTML mockups for a page, screen, component or flow; code or text samples for an API shape, data model, naming or copy - each with when it is the right choice, what it costs, and a self-contained, copy-ready prompt that builds exactly that variation. Use this whenever the user says "workshop me", "workshop this" or /workshop-me; asks for options, variations, alternatives, directions, mockups or "a few ways" to design or build something; says "show me what it could look like" or "I can't decide how to..."; or is about to build UI that has more than one sensible shape and has not chosen one. Also use it for the reply to a workshop page - "variation 2", "go with 3", "2 with the header from 3", "more like 2", "none of these" - to build the pick, mix variations, or add another round.
license: MIT
metadata:
  author: Kareem Sayed
  version: "1.0.0"
---

# Workshop me

Turn "build me X" into "here are three real versions of X: which one?", before any of them costs a session to build.

People are much better at choosing than at specifying. Asked to describe the analytics page they want, most people cannot; shown three, they know in seconds. This skill makes the three, makes them honest, and makes picking one cost a single short message.

The page has two readers. The **human** looks at the previews, reads a few bullets and picks. A **coding-agent session** then builds the pick: this session if they answer "variation 2" in the chat, or a fresh one with no memory of this conversation if they copy the prompt. Because of the second case, every prompt has to stand completely on its own.

You write the content as a `workshop.json` file plus one small file per mockup. A bundled script checks them and renders them into a fixed, designed template, so every page looks the same and you never hand-write the page.

## What you need from the user

- **The decision**: whatever followed the command. "The analytics page", "how onboarding should work", "the shape of the retry API".
- **The host project**: the current working directory, unless they say otherwise.
- **How many**, if they say ("workshop me 5 ..."). Otherwise three.

Do not interview them first. The point of the skill is that they did not have to specify; variations are how the questions get asked. Make sensible assumptions, state them in the brief, and let "that assumption is wrong" be one of the things they can answer. Ask one question up front only when a single fact would change every variation and you cannot find it in the project (for example, which of two apps in the repo this is for).

## Process

Work through these in order. The quality of the page comes from steps 1 to 3, not from the HTML.

1. **Read the host project.** Its README and agent instruction files (AGENTS.md, CLAUDE.md, .cursor rules), its layout, how it tests and lints, and then the three things this skill depends on:
   - **the look**: design tokens, theme files, fonts, the component library, one or two existing screens similar to what is being asked for;
   - **the data**: what the feature would actually have to show or accept, where it comes from, and what looks available but is not;
   - **the parts**: components, routes and helpers a build would reuse.

   This decides where the look of the mockups comes from: what the user asked for comes first, then what the project already has, and if there is neither, the look is yours to design. Content the project's data can really supply is what makes the choice trustworthy; a generic mockup gets a generic "they all look fine".

2. **Choose the axis.** Write one sentence saying what the variations differ on: what the page leads with, where a setting lives, how much is shown at once, who the screen is for. If the only honest answer is "the colours" or "the spacing", you do not have variations yet. Read `references/variations.md` now: it covers choosing the axis, spreading the variations along it, and keeping everything else constant.

3. **Decide the variations.** Each one has to be something you could recommend with a straight face to some version of this user. No strawmen put there to make the favourite look good, and no two that a tired person would call the same. Give each a short name people can say out loud ("One number", "Dashboard grid").

4. **Design the previews.** One file per variation, in a folder for this workshop (see "Delivery").
   - **Something visual**: read `references/mockup-craft.md` first, every time. This is the step the user judges the skill by, and it is design work: you are the senior product designer on their product, not a wireframe generator. Each variation is a static HTML and CSS mockup in its own fragment file (`1.html`, `2.html`), with whatever all of them share (tokens, fonts, the app shell) in one `shared.css`. Same content and same sample data in every variation. The mechanical rules that keep mockups working inside the page (no scripts, no network images, responsive to 390px) are in `references/variations.md`.
   - **Something not visual**: a `code` preview showing how each option reads where it is used (the call site, not the implementation), or a `text` preview for wording.

5. **Write `workshop.json`.** Copy `assets/example/workshop.json` as a starting shape and read `references/data-format.md` for every field. Read `references/writing-prompts.md` before writing the prompts and ground rules: they are what actually gets built.

6. **Build.** Run the bundled script (paths are relative to this skill's folder):

   ```bash
   node scripts/build.mjs path/to/workshop.json
   ```

   Fix every error. Read the warnings: each one names a habit that makes pages worse (a variation with no trade-offs, mockups that differ only in paint, a prompt that leans on this conversation). If Node is not available, see "Building by hand".

7. **Look, then deliver.** See "Delivery".

8. **Handle the answer.** See "After they answer". The skill is not finished when the page is delivered; it is finished when something is picked.

## What goes on the page

**Hero.** The decision as a headline ("Three ways to build Fieldnote's Insights page") and one or two sentences on how to use the page.

**The brief.** Bullets only, 150 to 300 words. What they asked for in their words, what the project already has that bears on it, where the look of the mockups came from (their words, the project's own design, or a direction you chose), and, most important, **what you assumed without asking**. People skim this; write it so that a wrong assumption jumps out.

**Compare.** Generated: a small live thumbnail of every variation, then a table scoring each one against two to four `criteria` you choose. Pick criteria the user would decide by ("answer at a glance", "works with little data", "new parts to build"), and fill the cells with a few plain words, toned good, warn or bad. Then your **recommendation** and the reason for it. Recommend honestly, including when the cheapest one is the right one. If it truly depends on something only they know, say what it depends on instead.

**Variation cards.** One per variation:
- `name` and a one or two sentence `description` of the idea;
- the `preview`, live, with a Desktop and Phone switch and a full-size view that steps between variations;
- `bestFor`: when this is the right pick;
- `tradeoffs`: what it costs. Every variation has some;
- `landsIn`: the real files it would touch;
- `size`: S, M or L in working sessions with a coding agent;
- the `prompt`, folded away, with a copy button.

**Ground rules.** Written once in `groundRules`. The page appends them to every prompt, followed by that variation's mockup source, so each copied block is complete.

## Design

There are two designs here and they have nothing to do with each other. Keep them apart.

**The frame: fixed.** The page that holds the variations (the bar, hero, brief, comparison table, cards, prompt blocks) has one look, in `assets/template.html`: a near-black or warm off-white ground with a faint dot field, hairline surfaces, a dot-matrix display face, one glowing hero. It is shared with the other skills in this family so that every page is recognisable. You never design it, never edit its CSS or script for one page, and never restyle it through the data. `references/design.md` documents it.

**The variations: free.** What is inside each preview frame is the actual work, and the template says nothing about it. Its look comes from, in order:

1. **what the user asked for**: a style, a mood, a reference, a brand;
2. **what the project already has**: its tokens, fonts and components, used faithfully;
3. **your own design**, when neither exists. Then be the designer: choose a direction that comes from the subject and commit to it. Do not fall back on a safe, neutral default, and when the thing has no look yet, let the variations be different concepts, each with its own visual direction.

A mockup that borrows the frame's look (dots, dot-matrix headings, black and off-white) is the template leaking into the content, and it is always wrong. `references/mockup-craft.md` is the guide for this part.

## Writing

- Plain words and short sentences. Names a person can say in a chat message.
- Describe each variation by what the user of the product gets, not by its layout technique.
- Be even-handed in the cards. The recommendation is the place for your opinion.
- No hype and no filler.

## Delivery

1. Keep a workshop's files together inside the host project, in `docs/workshop-me/<short-slug>/` unless the project keeps documents elsewhere: `workshop.json`, `shared.css`, the mockups, and the built `workshop.html`. The JSON is what "variation 2" is resolved against later, so it has to be saved, not just built.
2. If your environment can show or publish HTML, do that too:
   - **Claude with the Artifact tool**: build a second copy with `--fragment` (the tool adds its own document shell) and publish that file.
   - **A preview pane or browser tool**: open the built file.
   - **Otherwise**: tell the user the path and that it opens in any browser.
3. Look at the rendered page once if you can, in both Desktop and Phone, before saying it is ready. Mockups break in ways the build cannot see. If you could not look, say so.
4. Reply in chat with the link or path and at most five lines: the axis, your recommendation and why, any assumption they should check, and how to answer: say "variation N", mix two, or ask for another round.

## After they answer

**They pick one** ("variation 2", "go with the second", "the grid one"). Build it in this session: do not make them copy anything. Take that variation's prompt and the ground rules as your brief and its mockup as the picture of the result, re-read the files the prompt names, and implement. In a later session with no memory of the workshop, find it in `docs/workshop-me/`; if more than one workshop could be meant, ask which. When it is built and checked, set `picked` in `workshop.json` and rebuild, so the page becomes the record of what was chosen.

**They mix** ("2, but with the header from 3"). If the pieces fit together without changing either one's structure, say in two or three lines what you are taking from each and build it. If combining them forces a real design decision, such as two layouts competing for the same region, add the mix as a new variation in a new round, so they see it before any code is written.

**They want another round** ("more like 2", "none of these", "what if it were denser"). Add a round to the same `workshop.json`: keep the earlier variations, keep counting ids upward, set `basedOn`, and rebuild to the same path and the same published page so their link still works. "More like 2" means explore a second axis inside variation 2's territory. "None of these" means the axis was wrong: this is the one moment to ask a question, about what all of them missed, before choosing a new axis.

**They paste back an edited prompt.** Their edit wins over the page.

## Building by hand

If you cannot run Node: copy `assets/template.html`, replace `__TITLE__` with the page title, and replace `__DATA__` with the contents of `workshop.json`, in which every file reference has been replaced by the file's text (`preview.file` by `preview.html`, `promptFile` by `prompt`, and so on) and every `<` is written as `<`. Wrap the result in a normal HTML document (`<!doctype html>`, `<head>` with a UTF-8 charset and a viewport meta, `<body>`), moving everything above the `<!--BODY-->` marker into the head. Check the fields against `references/data-format.md` yourself, since the script's checks did not run.
