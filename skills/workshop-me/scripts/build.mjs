#!/usr/bin/env node
// Builds a workshop-me page: checks a workshop.json file, pulls in the files it points to (mockups, shared
// styles, prompts) and injects everything into assets/template.html. No dependencies. Needs Node 18 or newer.
//
//   node build.mjs workshop.json                 -> workshop.html next to the JSON (a complete HTML document)
//   node build.mjs workshop.json -o out.html     -> choose the output path
//   node build.mjs workshop.json --fragment      -> page without <html>/<head>/<body>, for hosts that add
//                                                   their own document shell (for example Claude's Artifact tool)
//   node build.mjs workshop.json --check         -> validate only, write nothing

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const outIndex = args.findIndex(a => a === '-o' || a === '--out');
const outArg = outIndex >= 0 ? args[outIndex + 1] : null;
const input = args.find((a, i) => !a.startsWith('-') && (outIndex < 0 || i !== outIndex + 1));

if (!input || flags.has('--help')) {
  console.log('Usage: node build.mjs <workshop.json> [-o out.html] [--fragment] [--check]');
  process.exit(input ? 0 : 1);
}

const here = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(here, '..', 'assets', 'template.html');
const base = dirname(resolve(input));

let data;
try {
  data = JSON.parse(readFileSync(resolve(input), 'utf8'));
} catch (e) {
  console.error(`Cannot read ${input}: ${e.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const isList = v => Array.isArray(v);
const isObj = v => !!v && typeof v === 'object' && !isList(v);
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const AURAS = ['violet', 'graphite', 'ember', 'moss', 'amber', 'azure', 'flame'];
const TONES = ['num', 'good', 'bad', 'warn', 'muted'];
const KINDS = { html: 'html', code: 'code', text: 'text' };

// Long strings may live in files next to the JSON. They are read here, so the built page is one file.
function load(at, owner, key, fileKey) {
  if (owner[fileKey] === undefined) return;
  if (owner[key] !== undefined) return errors.push(`${at}: give "${key}" or "${fileKey}", not both.`);
  if (!isStr(owner[fileKey])) return errors.push(`${at}: "${fileKey}" must be a file path, relative to the JSON file.`);
  const path = resolve(base, owner[fileKey]);
  const rel = relative(base, path);
  if (rel.startsWith('..') || isAbsolute(rel)) return errors.push(`${at}: "${owner[fileKey]}" is outside the workshop folder. Keep a workshop's files together, next to its JSON.`);
  try {
    owner[key] = readFileSync(path, 'utf8');
    delete owner[fileKey];
  } catch (e) {
    errors.push(`${at}: cannot read "${owner[fileKey]}" (${e.code || e.message}). Paths are relative to the JSON file.`);
  }
}

function checkBlocks(blocks, at) {
  let total = 0;
  blocks.forEach((b, i) => {
    const where = `${at}[${i}]`;
    if (!isObj(b)) return errors.push(`${where} must be an object.`);
    if (!isStr(b.title)) errors.push(`${where}: "title" is required.`);
    const hasBody = (isList(b.bullets) && b.bullets.length) || b.table || isStr(b.text);
    if (!hasBody) errors.push(`${where}: add "bullets", "table" or "text".`);
    if (b.bullets !== undefined && !(isList(b.bullets) && b.bullets.every(isStr))) errors.push(`${where}: "bullets" must be a list of strings.`);
    if (b.table) {
      const cols = b.table.columns, rows = b.table.rows;
      if (!isList(cols) || !cols.every(isStr)) errors.push(`${where}.table: "columns" must be a list of strings.`);
      if (!isList(rows) || rows.length === 0) errors.push(`${where}.table: "rows" must be a non-empty list.`);
      else rows.forEach((row, r) => {
        if (!isList(row)) return errors.push(`${where}.table.rows[${r}] must be a list of cells.`);
        if (isList(cols) && row.length !== cols.length) errors.push(`${where}.table.rows[${r}] has ${row.length} cells for ${cols.length} columns.`);
        row.forEach(cell => checkCell(cell, `${where}.table.rows[${r}]`));
      });
    }
    total += words(b.title) + words(b.text) + words(b.note) + (isList(b.bullets) ? b.bullets.reduce((n, x) => n + words(x), 0) : 0);
  });
  return total;
}
function checkCell(cell, at) {
  if (isObj(cell)) {
    if (typeof cell.text !== 'string') errors.push(`${at}: an object cell needs "text".`);
    if (cell.tone !== undefined && !TONES.includes(cell.tone)) errors.push(`${at}: "tone" must be one of ${TONES.join(', ')}.`);
  } else if (typeof cell !== 'string') errors.push(`${at}: cells are strings or {"text", "tone"} objects.`);
}

// Two mockups that are the same once colours and spacing are ignored are one design in two paints.
const skeleton = html => String(html)
  .replace(/#[0-9a-f]{3,8}\b|(?:rgb|hsl|oklch)a?\([^)]*\)/gi, '')
  .replace(/\s+/g, '');

const kinds = { html: 0, code: 0, text: 0 };
const promptWords = [];

if (!isObj(data)) {
  errors.push('The file must contain one JSON object.');
} else {
  for (const key of ['project', 'title', 'headline']) {
    if (!isStr(data[key])) errors.push(`"${key}" is required (a non-empty string).`);
  }
  if (isStr(data.title) && data.title.length > 60) warnings.push('"title" is the page name: keep it to a few words.');
  if (data.aura !== undefined && !AURAS.includes(data.aura)) errors.push(`"aura" must be one of: ${AURAS.join(', ')}.`);
  if (data.dir !== undefined && !['ltr', 'rtl'].includes(data.dir)) errors.push('"dir" must be "ltr" or "rtl".');
  if (data.labels !== undefined && !isObj(data.labels)) errors.push('"labels" must be an object.');
  if (!isStr(data.axis)) warnings.push('No "axis". Say in one sentence what the variations differ on; if you cannot, they may not differ enough.');

  load('top level', data, 'previewCss', 'previewCssFile');
  load('top level', data, 'groundRules', 'groundRulesFile');

  // Brief
  const blocks = data.brief && data.brief.blocks;
  if (!isList(blocks) || blocks.length === 0) {
    errors.push('"brief.blocks" needs at least one block. It is where the assumptions go, since the page was made without asking.');
  } else {
    const n = checkBlocks(blocks, 'brief.blocks');
    if (n > 420) warnings.push(`The brief is ${n} words. People come for the variations: aim for 150 to 300.`);
  }

  // Criteria and rounds
  const criteriaIds = [];
  if (data.criteria !== undefined) {
    if (!isList(data.criteria)) errors.push('"criteria" must be a list of {"id", "label"}.');
    else data.criteria.forEach((c, i) => {
      if (!isObj(c) || !isStr(c.id) || !isStr(c.label)) errors.push(`criteria[${i}] needs "id" and "label".`);
      else if (criteriaIds.includes(c.id)) errors.push(`criteria[${i}]: duplicate id "${c.id}".`);
      else criteriaIds.push(c.id);
    });
    if (criteriaIds.length > 5) warnings.push(`${criteriaIds.length} criteria. A comparison with more than five columns stops being read.`);
  } else {
    warnings.push('No "criteria". Two to four of them turn the comparison table into something the user can decide from.');
  }
  const roundIds = [];
  if (data.rounds !== undefined) {
    if (!isList(data.rounds) || data.rounds.length === 0) errors.push('"rounds" must be a non-empty list of {"id", "label"}, or left out.');
    else data.rounds.forEach((r, i) => {
      if (!isObj(r) || !isStr(r.id) || !isStr(r.label)) errors.push(`rounds[${i}] needs "id" and "label".`);
      else if (r.id === 'all') errors.push(`rounds[${i}]: "all" is reserved for the filter.`);
      else if (roundIds.includes(r.id)) errors.push(`rounds[${i}]: duplicate id "${r.id}".`);
      else roundIds.push(r.id);
    });
  }

  // Variations
  const seen = [];
  const skeletons = [];
  if (!isList(data.variations) || data.variations.length < 2) {
    errors.push('"variations" needs at least two. One option is not a choice.');
  } else {
    if (data.variations.length > 6 && roundIds.length < 2) warnings.push(`${data.variations.length} variations in one round. Past five, people stop comparing and start skimming.`);
    let lastRoundRank = -1;
    data.variations.forEach((v, i) => {
      if (!isObj(v)) return errors.push(`variations[${i}] must be an object.`);
      const at = `variations[${i}]${isStr(v.id) ? ` (${v.id})` : ''}`;
      if (!isStr(v.id)) errors.push(`${at}: "id" is required, as a string such as "1".`);
      else if (!/^[A-Za-z0-9]{1,4}$/.test(v.id)) errors.push(`${at}: the id is what the user says in the chat ("variation ${v.id}"). Use "1", "2", "3".`);
      else if (seen.includes(v.id)) errors.push(`${at}: duplicate id. Ids stay unique across rounds: keep counting up.`);

      load(at, v, 'prompt', 'promptFile');
      for (const key of ['name', 'description', 'prompt']) if (!isStr(v[key])) errors.push(`${at}: "${key}" is required.`);
      if (v.size !== undefined && !['S', 'M', 'L'].includes(v.size)) errors.push(`${at}: "size" must be "S", "M" or "L".`);
      for (const key of ['bestFor', 'tradeoffs', 'landsIn', 'basedOn']) {
        if (v[key] !== undefined && !(isList(v[key]) && v[key].every(isStr))) errors.push(`${at}: "${key}" must be a list of strings.`);
      }
      (isList(v.basedOn) ? v.basedOn : []).forEach(dep => {
        if (dep === v.id) errors.push(`${at}: lists itself in "basedOn".`);
        else if (!seen.includes(dep)) errors.push(`${at}: "basedOn" names "${dep}", which is not an earlier variation.`);
      });

      if (roundIds.length) {
        if (!roundIds.includes(v.round)) errors.push(`${at}: "round" must be one of the round ids (${roundIds.join(', ')}).`);
        else {
          const rank = roundIds.indexOf(v.round);
          if (rank < lastRoundRank) warnings.push(`${at}: list variations round by round, in the order the rounds are defined.`);
          lastRoundRank = Math.max(lastRoundRank, rank);
        }
      } else if (v.round !== undefined) errors.push(`${at}: has a "round" but no "rounds" are defined at the top level.`);

      // Preview
      const p = v.preview;
      if (!isObj(p) || !KINDS[p.type]) {
        errors.push(`${at}: "preview" is required, with "type" set to "html", "code" or "text". A variation the user cannot see is a description, not a choice.`);
      } else {
        const key = KINDS[p.type];
        load(`${at}.preview`, p, key, 'file');
        if (p.type === 'html') load(`${at}.preview`, p, 'css', 'cssFile');
        if (!isStr(p[key])) errors.push(`${at}.preview: needs "${key}" (or "file").`);
        else {
          kinds[p.type]++;
          if (p.type === 'html') checkMockup(p, at);
        }
        for (const dim of ['width', 'height', 'phoneHeight']) {
          if (p[dim] !== undefined && !(Number.isFinite(p[dim]) && p[dim] >= 200 && p[dim] <= 4000)) errors.push(`${at}.preview: "${dim}" must be a number of pixels between 200 and 4000.`);
        }
        if (p.type === 'html' && isStr(p.html)) {
          const sk = skeleton((p.css || '') + p.html);
          const twin = skeletons.find(s => s.sk === sk);
          if (twin) warnings.push(`${at}: its mockup matches variation ${twin.id} once colours and spacing are ignored. Variations should differ in structure or behaviour, not paint.`);
          skeletons.push({ id: v.id, sk });
        }
      }

      // Scores
      if (v.scores !== undefined) {
        if (!isObj(v.scores)) errors.push(`${at}: "scores" must be an object keyed by criterion id.`);
        else for (const [k, cell] of Object.entries(v.scores)) {
          if (!criteriaIds.includes(k)) errors.push(`${at}: "scores" has "${k}", which is not a criterion id (${criteriaIds.join(', ') || 'none defined'}).`);
          checkCell(cell, `${at}.scores.${k}`);
        }
      }
      const missing = criteriaIds.filter(k => !isObj(v.scores) || v.scores[k] === undefined);
      if (missing.length) warnings.push(`${at}: no score for ${missing.join(', ')}. An empty cell reads as "did not look".`);

      if (!(isList(v.tradeoffs) && v.tradeoffs.length)) warnings.push(`${at}: no "tradeoffs". Every option costs something; one with no cost is being sold, not compared.`);
      if (!(isList(v.bestFor) && v.bestFor.length)) warnings.push(`${at}: no "bestFor". Say when this is the right pick.`);
      if (!(isList(v.landsIn) && v.landsIn.length)) warnings.push(`${at}: no "landsIn" paths. A prompt that names no files usually means the project was not read.`);
      if (isStr(v.description) && words(v.description) > 60) warnings.push(`${at}: the description is ${words(v.description)} words. One or two sentences: the preview does the talking.`);
      if (isStr(v.prompt)) {
        const n = words(v.prompt);
        promptWords.push(n);
        if (n < 80) warnings.push(`${at}: the prompt is only ${n} words. It has to stand alone in a session that has seen nothing else.`);
        if (/\b(TODO|TBD|FIXME)\b|<[a-z_ -]*(path|file|name)[a-z_ -]*>|\bas (discussed|mentioned) (above|earlier)\b|\b(the )?other variations? (above|below)\b/i.test(v.prompt)) {
          warnings.push(`${at}: the prompt has a placeholder or refers to context the next session will not have.`);
        }
      }
      if (isStr(v.id)) seen.push(v.id);
    });
  }

  for (const [key, extra] of [['recommended', 'why'], ['picked', 'note']]) {
    const r = data[key];
    if (r === undefined) continue;
    if (!isObj(r) || !isStr(r.id)) errors.push(`"${key}" must be {"id": "<variation id>", "${extra}": "..."}.`);
    else if (!seen.includes(r.id)) errors.push(`"${key}.id" is "${r.id}", which is not a variation id.`);
    else if (key === 'recommended' && !isStr(r.why)) warnings.push('"recommended" has no "why". A pick without a reason cannot be argued with.');
  }
  if (!isStr(data.groundRules)) warnings.push('No "groundRules". Every prompt should end with the project\'s rules (layout, conventions, how to verify).');

  if (!errors.length) {
    const made = Object.entries(kinds).filter(([, n]) => n).map(([k, n]) => `${n} ${k === 'html' ? 'mockup' : k}${n === 1 ? '' : 's'}`).join(', ');
    console.log(`${data.variations.length} variations (${made})${roundIds.length > 1 ? ` in ${roundIds.length} rounds` : ''}; prompts ${Math.min(...promptWords)} to ${Math.max(...promptWords)} words before ground rules.`);
  }
}

function checkMockup(p, at) {
  const src = (p.css || '') + p.html;
  if (/<script\b/i.test(src)) warnings.push(`${at}: the mockup has a <script>. Previews run in a sandboxed frame where scripts do not execute: show states with CSS (:hover, :checked, <details>) or as separate regions.`);
  const hosts = new Set();
  const all = src + (data.previewCss || '');
  for (const m of all.matchAll(/(?:\bsrc\s*=\s*["']?|url\(\s*["']?|@import\s+["']|<link[^>]+href\s*=\s*["']?)(?:https?:)?\/\/([a-z0-9.-]+)/gi)) hosts.add(m[1].toLowerCase());
  const outside = [...hosts].filter(h => !/^fonts\.(googleapis|gstatic)\.com$/.test(h));
  if (outside.length) warnings.push(`${at}: the mockup loads from ${outside.join(', ')}. Hosts with a strict content policy block that: draw with inline SVG and CSS instead.`);
  if (!/@media|@container|auto-fi(t|ll)|flex-wrap|clamp\(|min\(|minmax\(/i.test(src)) warnings.push(`${at}: nothing in the mockup responds to width. Check it under the Phone toggle (390px) before delivering.`);
  if (/position\s*:\s*fixed/i.test(src)) warnings.push(`${at}: the mockup uses position: fixed, which pins to the scaled frame and usually looks wrong. Use sticky or normal flow.`);
  if (/lorem ipsum|dolor sit amet/i.test(src)) warnings.push(`${at}: the mockup has placeholder text. Write the real words: placeholder text hides whether a layout works.`);
  if (Buffer.byteLength(p.html) < 1200) warnings.push(`${at}: the mockup is very small. A sketch cannot be chosen between: design the screen (references/mockup-craft.md).`);
  if (!/font-family|font\s*:/i.test(all)) warnings.push(`${at}: no typeface is set anywhere, so the mockup falls back to the browser default. Choose type on purpose.`);
  if (!/--[a-z][\w-]*\s*:/i.test(all)) warnings.push(`${at}: no design tokens (CSS custom properties). Define colours, type and spacing once and build from them.`);
  const kb = Math.round(Buffer.byteLength(src) / 1024);
  if (kb > 40) warnings.push(`${at}: the mockup is ${kb} KB. It is copied into the prompt and loaded twice on the page: keep it to what the decision needs.`);
}

warnings.forEach(w => console.warn(`warning: ${w}`));
if (errors.length) {
  errors.forEach(e => console.error(`error: ${e}`));
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}. Nothing was written.`);
  process.exit(1);
}
if (flags.has('--check')) {
  console.log('OK.');
  process.exit(0);
}

const template = readFileSync(templatePath, 'utf8');
const [head, body] = template.split('<!--BODY-->');
if (body === undefined || !head.includes('__TITLE__') || !body.includes('__DATA__')) {
  console.error(`The template at ${templatePath} is missing its markers (<!--BODY-->, __TITLE__, __DATA__).`);
  process.exit(1);
}
const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "<" is escaped so no string in the data (the mockups are full of them) can close the script element that carries it.
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const headOut = head.replace('__TITLE__', () => escapeHtml(data.title));
const bodyOut = body.replace('__DATA__', () => json);

const lang = isStr(data.lang) ? data.lang : 'en';
const dir = data.dir === 'rtl' ? ' dir="rtl"' : '';
const page = flags.has('--fragment')
  ? headOut + bodyOut
  : `<!doctype html>\n<html lang="${escapeHtml(lang)}"${dir}>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${headOut}</head>\n<body>${bodyOut}</body>\n</html>\n`;

const suffix = flags.has('--fragment') ? '.fragment.html' : '.html';
const out = resolve(outArg || input.replace(/\.json$/i, '') + suffix);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`Wrote ${out} (${Math.round(page.length / 1024)} KB${flags.has('--fragment') ? ', fragment' : ''}).`);
