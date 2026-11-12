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
let out = tpl
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
<style>img{max-width:100%}[hidden]{display:none!important}</style>
${head}</head>
<body>
${body}
</body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), site);
console.log("page.html", out.length, "bytes; index.html", site.length, "bytes");
