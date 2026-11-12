// Builds src/page.html (artifact fragment) and index.html (standalone site) from src/template.html.
// Placeholders: {{svg:slug}} inlines a simple-icons path as currentColor; {{img:file}} embeds assets-raw/file as a data URI.
const fs = require("fs");
const path = require("path");
const root = __dirname;
const raw = path.join(root, "assets-raw");
const tpl = fs.readFileSync(path.join(root, "src", "template.html"), "utf8");

function svgInline(slug, cls) {
  const f = path.join(raw, `si-${slug}.svg`);
  const s = fs.readFileSync(f, "utf8");
  const d = (s.match(/<path d="([^"]+)"/) || [])[1];
  if (!d) throw new Error("no path in " + f);
  return `<svg class="${cls || "ico"}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg>`;
}
function dataUri(file) {
  const f = path.join(raw, file);
  const buf = fs.readFileSync(f);
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : "application/octet-stream";
  return `data:${mime};base64,${buf.toString("base64")}`;
}
// A simple-icons glyph as a white-on-transparent SVG data URI, for Canvas drawImage.
function glyphUri(slug, color) {
  const s = fs.readFileSync(path.join(raw, `si-${slug}.svg`), "utf8");
  const d = (s.match(/<path d="([^"]+)"/) || [])[1];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${d}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function pathOnly(slug) {
  const s = fs.readFileSync(path.join(raw, `si-${slug}.svg`), "utf8");
  return (s.match(/<path d="([^"]+)"/) || [])[1];
}
// GitHub contribution calendar as inline SVG, from assets-raw/contrib.json (gh api graphql; see DEPLOY.md).
function contribSvg() {
  const c = JSON.parse(fs.readFileSync(path.join(raw, "contrib.json"), "utf8")).data.user.contributionsCollection;
  const weeks = c.contributionCalendar.weeks;
  const cell = 11, gap = 3, step = cell + gap, left = 28, top = 18;
  const w = left + weeks.length * step, h = top + 7 * step;
  const max = Math.max(1, ...weeks.flatMap(wk => wk.contributionDays.map(d => d.contributionCount)));
  const lvl = n => n === 0 ? 0 : n <= max * 0.25 ? 1 : n <= max * 0.5 ? 2 : n <= max * 0.75 ? 3 : 4;
  let rects = "", months = "", lastMonth = -1;
  weeks.forEach((wk, x) => {
    wk.contributionDays.forEach(d => {
      const dt = new Date(d.date + "T00:00:00Z"), y = dt.getUTCDay();
      if (y === 0 || x === 0) { const m = dt.getUTCMonth(); if (m !== lastMonth && x < weeks.length - 2) { months += `<text x="${left + x * step}" y="11">${dt.toLocaleString("en", { month: "short", timeZone: "UTC" })}</text>`; lastMonth = m; } }
      rects += `<rect x="${left + x * step}" y="${top + y * step}" width="${cell}" height="${cell}" rx="2" class="l${lvl(d.contributionCount)}"><title>${d.date}: ${d.contributionCount} contribution${d.contributionCount === 1 ? "" : "s"}</title></rect>`;
    });
  });
  const days = ["", "Mon", "", "Wed", "", "Fri", ""].map((t, i) => t ? `<text x="0" y="${top + i * step + 9}">${t}</text>` : "").join("");
  return { total: c.contributionCalendar.totalContributions, svg: `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${c.contributionCalendar.totalContributions} GitHub contributions in the last year">${months}${days}${rects}</svg>` };
}
const contrib = contribSvg();

let out = tpl
  .replace(/\{\{contrib:svg\}\}/g, () => contrib.svg)
  .replace(/\{\{contrib:total\}\}/g, () => String(contrib.total))
  .replace(/\{\{svg:([a-z0-9-]+)(?::([a-z0-9 -]+))?\}\}/g, (_, slug, cls) => svgInline(slug, cls))
  .replace(/\{\{path:([a-z0-9-]+)\}\}/g, (_, slug) => pathOnly(slug))
  .replace(/\{\{glyph:([a-z0-9-]+):([#a-zA-Z0-9]+)\}\}/g, (_, slug, color) => glyphUri(slug, color))
  .replace(/\{\{img:([a-zA-Z0-9_.-]+)\}\}/g, (_, file) => dataUri(file));

fs.writeFileSync(path.join(root, "src", "page.html"), out);

const i = out.indexOf("<nav");
const head = out.slice(0, i).replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n?/, "");
const body = out.slice(i);
const site = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta property="og:title" content="Ronell Shivuri">
<meta property="og:description" content="Senior Dynamics 365 and Power Platform engineer, C# .NET backend developer, PL-600 Solution Architect Expert. Johannesburg.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://rshivuri.github.io/">
<meta property="og:image" content="https://rshivuri.github.io/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Ronell Shivuri">
<meta name="twitter:image" content="https://rshivuri.github.io/og-image.png">
<link rel="icon" type="image/png" href="assets-raw/ronell.png">
<style>img{max-width:100%}[hidden]{display:none!important}</style>
${head}</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), site);
console.log("page.html", out.length, "bytes; index.html", site.length, "bytes");
