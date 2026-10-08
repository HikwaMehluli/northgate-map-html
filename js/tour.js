import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// ------------------------------------------------------------
// Guided tour (driver.js)
// - Core 4 steps: map canvas, a stand, the legend, the controls.
//   Steps whose element is missing on the current page are dropped.
// - Auto-runs for new visitors until the localStorage counter
//   reaches MAX_AUTO_RUNS, then never again (manual replay only).
// - The "Tour" button (created here, so no HTML edits) replays it.
// ------------------------------------------------------------

const STORAGE_KEY = 'northgate-tour-runs';
const MAX_AUTO_RUNS = 2;
const AUTO_TOUR_DELAY = 800; // let stands/legend settle after load

let tourDriver = null;
// True when the legend panel was hidden before the tour revealed it,
// so we can put it back the way we found it (mobile hides it by default).
let legendWasHiddenBeforeTour = false;

function readRunCount() {
	try {
		return parseInt(window.localStorage.getItem(STORAGE_KEY), 10) || 0;
	} catch (e) {
		return 0;
	}
}

function incrementRunCount() {
	try {
		window.localStorage.setItem(STORAGE_KEY, String(readRunCount() + 1));
	} catch (e) {
		// Storage unavailable (private mode etc.) — tour still works manually.
	}
}

// First stand on this page: prefer one already wired with its modal,
// otherwise fall back to a static stand group from the SVG markup.
function findStandElement() {
	return (
		document.querySelector('#residential g[data-micromodal-trigger]') ||
		document.querySelector('g[data-micromodal-trigger]') ||
		document.querySelector('#residential > g') ||
		document.querySelector('g[id^="res_"]')
	);
}

// The <g> svg-pan-zoom wraps around the map content at runtime.
// Its box = the drawing as it looks at the current pan/zoom, so
// driver.js highlights what you actually see (it re-measures the
// element itself on every resize/scroll, so nothing else to do).
function findMapViewport() {
	const svg = document.querySelector('.map-container > svg');
	if (!svg) return null;
	return (
		svg.querySelector('g[id^="viewport-"]') || // created by svg-pan-zoom
		svg.querySelector('.svg-pan-zoom_viewport') ||
		(svg.children.length === 1 && svg.firstElementChild.localName === 'g'
			? svg.firstElementChild
			: svg) // last resort: the <svg> box (full map area)
	);
}

function pageHasStands() {
	return Boolean(
		document.getElementById('residential') || document.querySelector('g[id^="res_"]')
	);
}

function restoreLegend() {
	const panel = document.getElementById('map-legend-panel');
	if (panel && legendWasHiddenBeforeTour) panel.classList.add('is-hidden');
	legendWasHiddenBeforeTour = false;
}

function buildSteps() {
	const steps = [
		{
			element: findMapViewport,
			popover: {
				title: 'Interactive Map',
				description:
					'Drag to pan, scroll to zoom, or use the controls in the bottom-right corner.',
				side: 'top',
			},
		},
	];

	if (pageHasStands()) {
		steps.push({
			element: findStandElement,
			popover: {
				title: 'Stands',
				description:
					'Each coloured shape is a stand. Click one to see its size, price and availability.',
				side: 'top',
			},
		});
	}

	steps.push({
		element: '#map-legend-panel',
		popover: {
			title: 'Map Legend',
			description:
				'Colours show stand availability. Use the info <span class="icon-info"></span> button in the controls to hide or show this panel.',
			side: 'top',
		},
		onHighlightStarted: function () {
			const panel = document.getElementById('map-legend-panel');
			if (!panel) return;
			// The panel is hidden by default on mobile — reveal it for the tour.
			legendWasHiddenBeforeTour = panel.classList.contains('is-hidden');
			panel.classList.remove('is-hidden');
		},
		onDeselected: restoreLegend,
	});

	steps.push({
		element: '.custom-controls',
		popover: {
			title: 'Map Controls',
			description: 'Pan, zoom in and out, and toggle the legend with these buttons.',
			side: 'left',
		},
	});

	return steps;
}

function startTour() {
	if (tourDriver && tourDriver.isActive()) return;

	restoreLegend();

	tourDriver = driver({
		showProgress: true,
		allowClose: true,
		overlayClickBehavior: 'close',
		skipMissingElement: true,
		nextBtnText: 'Next',
		prevBtnText: 'Back',
		doneBtnText: 'Done',
		steps: buildSteps(),
		// Safety net: the legend step's onDeselected already restores the
		// panel, but restore again in case destroy happens between steps.
		onDestroyed: restoreLegend,
	});

	tourDriver.drive();
}

function createTourButton() {
	if (document.getElementById('tour-btn')) return;

	const button = document.createElement('button');
	button.id = 'tour-btn';
	button.type = 'button';
	button.textContent = 'Tour';
	button.setAttribute('aria-label', 'Start the map tour');
	button.addEventListener('click', startTour);
	document.body.appendChild(button);
}

function initTour() {
	createTourButton();

	if (readRunCount() < MAX_AUTO_RUNS) {
		incrementRunCount();
		window.setTimeout(startTour, AUTO_TOUR_DELAY);
	}
}

export default initTour;
