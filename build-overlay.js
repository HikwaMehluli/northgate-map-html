// One-off build: combine phase-one.svg (stands) with phase-one-sections.svg
// (5 section overlays) into a single SVG + matching interactive HTML page.
// Run: node build-overlay.js
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, text) => fs.writeFileSync(path.join(root, p), text, 'utf8');

const SECTIONS = ['a', 'b', 'c', 'd', 'e'];

// Take the inner markup of an <svg> (everything between the first ">" and
// the final "</svg>").
function innerSvg(markup) {
	const start = markup.indexOf('>') + 1;
	const end = markup.lastIndexOf('</svg>');
	return markup.slice(start, end).trim();
}

// ------------------------------------------------------------
// 1. Build the combined SVG
// ------------------------------------------------------------
let stands = read('SVG/phase-one.svg');

// New root id, and stop script.js from treating this page as a stands page.
stands = stands.replace(
	'<svg id="northgate-map-phase-one"',
	'<svg id="northgate-map-phase-one-overlay"'
);
stands = stands.replace(
	'<g id="residential">',
	'<g id="stands-layer" class="stands-layer">'
);

// Section groups: add classes, links and tooltips; recolour the shape.
let sections = innerSvg(read('SVG/phase-one-sections.svg'));
sections = sections.replace(/id="bg" class="available"/g, 'class="section__shape"');
SECTIONS.forEach((s) => {
	const upper = s.toUpperCase();
	sections = sections.replace(
		`<g id="section-${s}">`,
		`<g id="section-${s}" class="section section--${s}" ` +
			`data-href="phase-one-section-${s}.html" data-tippy-content="View Section ${upper}">`
	);
});

// Lift the section name labels out into their own top layer, so they stay
// fully opaque above every (semi-transparent) section shape.
const labels = [];
sections = sections.replace(/[ \t]*<g id="text" class="text">[\s\S]*?<\/g>\n?/g, (block) => {
	labels.push(block.trim());
	return '';
});

const overlay = `\n    <g class="sections-overlay">\n${sections}\n    </g>\n`;
const labelLayer = `\n    <g class="sections-labels">\n${labels.join('\n')}\n    </g>\n`;

// Put the overlay + labels last so they paint on top of the stands.
const closeAt = stands.lastIndexOf('</svg>');
const combinedSvg =
	stands.slice(0, closeAt) + overlay + labelLayer + stands.slice(closeAt);

write('SVG/phase-one-sections-overlay.svg', combinedSvg);

// ------------------------------------------------------------
// 2. Build the HTML page from the sections-overview template
// ------------------------------------------------------------
let page = read('phase-one-sections.html');
page = page.replace(
	'<title>Northgate Phase One - Sections Overview</title>',
	'<title>Northgate Phase One - Sections & Stands Overlay</title>'
);

const svgStart = page.indexOf('<svg id="phase-one-sections"');
const svgEnd = page.indexOf('</svg>', svgStart) + '</svg>'.length;
page = page.slice(0, svgStart) + combinedSvg.trimEnd() + page.slice(svgEnd);

write('phase-one-overlay.html', page);

console.log('Wrote SVG/phase-one-sections-overlay.svg and phase-one-overlay.html');
