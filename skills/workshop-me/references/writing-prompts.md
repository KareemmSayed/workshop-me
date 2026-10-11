# Writing the variation prompts and ground rules

Each variation's `prompt` is the brief that builds it. It is used in one of two ways: you follow it yourself when the user says "variation 2", or the user pastes it into a new coding-agent session that has never seen this conversation, the page, or the other variations. Write for the second case. Whatever is not in the prompt does not exist for that session.

The page adds two things after your prompt when it is copied: the ground rules, then the mockup's HTML and CSS. So the session will have the picture. What it will not have is everything the picture cannot show: why this direction was chosen, which real files and components to use, where the numbers come from, and what happens when the data is thin.

## Anatomy of a prompt

Use this order. Plain text only (the prompt is shown in a code block and copied as it is), so no Markdown headings or backticks.

1. **Opening line.** What to build and in which direction, in one sentence: "Build the Insights page as a single-figure layout: one large number, one sentence that interprets it, a twelve-week trend, and three quiet facts."

2. **Why this direction.** Two or three sentences on what this variation is for and what it was chosen over. This is the part most worth getting right. The session will make dozens of small decisions the mockup does not settle, and it makes them well only if it knows the intent: "prefer fewer elements and a clearer sentence over more data".

3. **What exists.** The real files, components, tokens and data by path and name. Say what the mockup's parts correspond to in the codebase ("the tile is the existing StatCard in src/ui/StatCard.tsx") and what does not exist yet. Include anything that looks available and is not.

4. **Build.** A numbered list. For each step, say where the code goes and give the exact logic: formulas written out, thresholds with their values, units, ordering and tie-break rules. Give check values the session can turn into tests ("4,820 against 4,080 gives 0.18"). Mark tuning choices: "that 3 percent is a heuristic: name it as a constant". Describe the layout region by region, top to bottom, in words, so the prompt still makes sense to someone who cannot open the mockup.

5. **States the mockup does not show.** The mockup is one good day. Say what the screen does with no data, too little data, an error, a very long value, a narrow screen, and anything else this design is weak at. This section is where variations really differ in cost, and it is the one a session will skip if you leave it out.

6. **Out of scope.** The neighbouring work this prompt must not start, including the ideas from the other variations. Without it, an eager session blends all three.

The page appends `groundRules` after this, so do not repeat repo-wide rules in each prompt.

For a variation that is not visual (an API shape, a data model), the same order holds: the decision in one line, why this option, what exists, the steps with exact signatures and check values, the edge cases and any migration, and what is out of scope.

## What makes a prompt fail

- **It leans on context.** "As discussed", "the second option", "unlike variation 1". The next session has never seen variation 1. Describe this variation in its own terms.
- **It describes the picture and nothing else.** If the prompt only restates what the mockup shows, the session builds a static copy with invented data. The prompt's job is the half the mockup cannot carry.
- **It names no files.** Usually a sign the host project was not read.
- **It treats sample data as real.** Say where each number comes from. The session cannot tell "23 notes" from a requirement.
- **It gives a rule without numbers to check.** Give two or three inputs and outputs.
- **It hides uncertainty.** If you did not confirm that a component or a field exists, say "confirm this exists before relying on it".
- **It is too big for one session.** Size honestly. A variation that needs three new components and a data migration is an L, and saying so is part of the comparison.
- **It tells without explaining.** A rule with its reason ("a day with no writing uses the quiet fill, not a faint accent, so that nothing never looks like a little") is followed more reliably, and applied to cases you did not foresee, than a bare command.

Length: most good prompts land between 300 and 600 words before the ground rules. Shorter usually means the states are missing. Longer usually means it is building more than the variation.

Write all the prompts to the same standard. A thin prompt on the variation you did not favour makes it worse than it is the moment someone picks it.

## Ground rules

`groundRules` is one block of plain text added to the end of every prompt. Write it from what you learned reading the host project. Cover:

- **Layout**: what lives where (screens, components, logic, tokens, tests, strings), in two or three sentences.
- **Read first**: tell the session to read the files named in the prompt before designing, and that when the prompt and the code disagree the code wins and it should say what differed.
- **How to treat the mockup**: it is a picture of the intended result drawn with sample data. Rebuild it with the project's own components and tokens; do not paste its markup. Where the mockup and the prompt disagree, the prompt wins.
- **Conventions** new code must follow (pure functions, named constants, error handling, how strings are translated).
- **Honesty in the product**: for example, show nothing instead of a made-up number when data is thin.
- **Standing constraints**: accessibility, offline support, privacy, supported languages and platforms, no new dependencies without a reason.
- **Style**: match surrounding code.
- **How to finish**: the exact checks to run, and for anything visible, to open it at desktop and phone width and say what was seen.
- **Scope**: stay inside it and list follow-ups instead of building them.

Start it with a heading line such as "Ground rules for this repo" so it reads as a separate section when pasted.

## A complete example

This is variation 1 from `assets/example/` (a fictional project), shortened; the full text is in `assets/example/1.prompt.txt`. Note the reason for the direction, the check value, and the section on states.

```
Build the Insights page for Fieldnote as a single-figure layout: one large number for the words written this week, one sentence that interprets it, a twelve-week bar trend, and three quiet facts.

Why this direction: the page should answer one question in a second, "am I writing more or less than usual?", and stop. It was chosen over a grid of charts because most people open a page like this for reassurance, not analysis. When a small decision comes up, prefer fewer elements and a clearer sentence over more data.

What exists:
- src/store/notes.ts exports listNotes({ from, to }), which returns notes with id, createdAt, body and tags. Nothing stores a word count, a streak or a per-day total: all of it has to be derived.
- src/ui/routes.ts registers screens and src/ui/Sidebar.tsx lists them. Screens live in src/ui/screens.
- src/ui/theme.css holds the tokens the mockup uses. Use the tokens, never literal values.

Build:
1. src/insights/stats.ts, as pure functions with tests:
   - weeklyWords(notes, now, weeks = 12): totals per calendar week, Monday to Sunday in the user's local time zone, oldest first, with empty weeks as 0.
   - changeVsLastWeek(weekly): (this - last) / last, or null when last week is 0. Check value: 4,820 against 4,080 gives 0.18.
2. src/ui/screens/Insights.tsx, top to bottom: a small uppercase label; the figure, very large in the serif face; one sentence built from the data; the twelve-week bars with the current week in the accent colour; under a hairline, three facts.
3. Register the route and add it to the sidebar after Search.

States the mockup does not show:
- No notes at all: one line and a link to a new note, in place of the page.
- Fewer than two weeks of history: leave out the comparison and the bars instead of drawing a single bar.
- Last week was 0: say "You wrote nothing last week" in place of a percentage.

Out of scope: switching the date range, per-tag breakdowns, a day-by-day view, and any chart beyond the weekly bars.
```
