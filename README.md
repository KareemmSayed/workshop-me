# workshop-me

An agent skill that answers "build me X" with "here are three real versions of X: which one?", before any of them costs a session to build.

People are better at choosing than at specifying. Say what you want to build; your coding agent reads your project and produces one designed HTML page with:

- **Variations you can see**: 2 to 5 real alternatives. Live HTML mockups in your project's own colours and type for anything visual; code or text samples for an API shape, a data model, naming or copy.
- **An honest comparison**: what the variations differ on, a table scored against criteria that matter for this decision, a recommendation, and the assumptions that were made without asking.
- **One prompt per variation**: self-contained and copy-ready, with the mockup attached. Paste it into a fresh session and that session can build it without any of the original conversation.

Then pick, either way:

- say **`variation 2`** in the chat, and the agent builds it right there, or
- unfold the prompt under a variation, copy it, refine it, and run it wherever you like.

You can also mix them ("2 with the header from 3") or ask for another round ("more like 2").

Open [`examples/fieldnote.html`](examples/fieldnote.html) in a browser to see a page (a made-up project, built from [`assets/example/`](skills/workshop-me/assets/example)).

## Install

With the [skills CLI](https://github.com/vercel-labs/skills), which installs into Claude Code, Cursor, Antigravity, Codex, Gemini CLI and many other agents:

```bash
npx skills add KareemmSayed/workshop-me
```

Pick agents explicitly, or install for your user account instead of the current project:

```bash
npx skills add KareemmSayed/workshop-me -a claude-code -a cursor -a antigravity
npx skills add KareemmSayed/workshop-me -g
```

**By hand.** Copy the `skills/workshop-me` folder into your tool's skills directory. For Claude Code that is `~/.claude/skills/` (all projects) or `.claude/skills/` (one project).

**Claude desktop and claude.ai.** Zip the skill folder and upload the zip where the app manages skills:

```bash
cd skills && zip -r ../workshop-me.zip workshop-me
```

## Use

Invoke it by name, with the decision:

```
/workshop-me the analytics page: show people how much they write
```

```
/workshop-me 4 how onboarding should work for a first-time user
```

Or just ask:

> I can't decide how the settings screen should be laid out. Show me a few options.

> Give me three shapes for the retry API before I commit to one.

The agent saves the workshop (the data, the mockups and the built page) in your project under `docs/workshop-me/<name>/`, and shows or publishes the page if its environment can. Then answer in the chat:

| You say | The agent |
|---|---|
| `variation 2` | builds variation 2 in the current session |
| `2 with the header from 3` | builds the mix, or draws it first if the pieces do not simply fit |
| `more like 2` | adds a second round of variations around 2, on the same page |
| `none of these` | asks what they all missed, then tries a different angle |

## How it works

The agent writes content only: a `workshop.json` file, one small HTML fragment per mockup, and a text file per prompt. A bundled script validates them and renders them into a fixed template, so every page looks the same and the page itself is never hand-written.

```bash
node skills/workshop-me/scripts/build.mjs docs/workshop-me/insights/workshop.json
```

| Option | Does |
|---|---|
| `-o <file>` | Output path. Default: next to the JSON. |
| `--check` | Validate only. |
| `--fragment` | Omit the document shell, for hosts that add their own (such as Claude's Artifact tool). |

The script needs Node 18 or newer and has no dependencies. It refuses to build when the data would produce a bad page (one variation, a variation with nothing to look at, a recommendation that points nowhere) and warns about habits that weaken one (an option with no trade-offs, mockups that differ only in colour, a prompt that leans on the conversation, a mockup that loads from the network).

What is in the skill:

```
skills/workshop-me/
  SKILL.md                      the process the agent follows
  assets/template.html          the page design and behaviour
  assets/example/               a complete workshop to copy from
  scripts/build.mjs             validate and build
  references/variations.md      how to make variations worth choosing between
  references/mockup-craft.md    how to design mockups that look made, not generated
  references/writing-prompts.md how to write prompts that stand alone
  references/data-format.md     every field of workshop.json
  references/design.md          fonts, colour tokens and the rules behind them
```

## The page

- A single self-contained file. The only network requests are for Google Fonts, with system fallbacks.
- Each mockup is laid out at its real width in a sandboxed frame and scaled to fit, so you see the true layout. Switch every preview between Desktop and Phone, or open one full size and step through the others.
- Dark and light, following the system or the host's theme. Phone-width friendly. Right-to-left ready.
- Later rounds are added to the same page; earlier ones stay one tap away. Once something is built, the page records which variation was picked.
- Every fixed string can be replaced through `labels`, so a page can be written in any language.

## Design

The page's look is fixed on purpose and documented in [`references/design.md`](skills/workshop-me/references/design.md): monochrome ink on black or warm off-white, a faint dot field, the Doto dot-matrix face for headings and numbers, hairlines in place of shadows, and colour only where it means something. It shares this base with [featspiration](https://github.com/KareemmSayed/featspiration).

That is only the frame. The variations inside it are not styled by the template at all. Their look comes from what you ask for in the prompt, then from your project's own design if it has one, and otherwise from the agent, which is instructed to work as a product designer: pick a direction that fits the subject, commit to it, and avoid the usual generated look.

## Licence

MIT. See [LICENSE](LICENSE). Fonts are loaded from Google Fonts under their own licences (Doto and Inter Tight are both SIL Open Font License).
