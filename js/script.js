import tippy from 'tippy.js';
import MicroModal from 'micromodal';
import svgPanZoom from './svg-pan-zoom.min.js';
import './hammer.js';
import initNavigation from './navigation.js';

// ------------------------------------------------------------
// Anti-inspection guard (deterrent only — never trust client-side
// protection to actually hide code from a determined user).
// ------------------------------------------------------------

// Block the right-click context menu.
document.addEventListener('contextmenu', function (e) {
	e.preventDefault();
});

// Block the common devtools / view-source shortcuts across browsers.
document.addEventListener('keydown', function (e) {
	if (e.key === 'F12') {
		e.preventDefault();
		return;
	}

	// Ctrl+U view source (Firefox/Chrome/Edge)
	if (e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === 'u') {
		e.preventDefault();
		return;
	}

	// Ctrl/Cmd+Shift+I/J/C/K — devtools, console, inspect element, web console
	if ((e.ctrlKey || e.metaKey) && e.shiftKey && /^[ijck]$/i.test(e.key)) {
		e.preventDefault();
	}
});

window.addEventListener('load', function () {

	// Detect touch devices: used to skip tooltips and map panning.
	function isMobileDevice() {
		return /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);
	}

	// ------------------------------------------------------------
	// Navigation drawer + clickable phase links on the hub page
	// ------------------------------------------------------------

	initNavigation();

	// Any element with data-href acts as a plain link (e.g. the
	// Phase One / Phase Two polygons on the hub page).
	document.querySelectorAll('[data-href]').forEach(function (el) {
		el.addEventListener('click', function () {
			window.location.href = el.getAttribute('data-href');
		});
	});

	// Tooltips for stands and phase links (uses data-tippy-content).
	function initTippy() {
		if (isMobileDevice()) return;
		tippy('[data-tippy-content]', {
			allowHTML: true,
			arrow: true,
			delay: [100, 100],
		});
	}

	// ------------------------------------------------------------
	// Stands
	// ------------------------------------------------------------

	// Each page uses one stand id scheme:
	//   Phase One pages: <g id="_2536"> inside <g id="residential">
	//   Phase Two pages: <g id="res_5278">
	// Pages with neither (e.g. the hub) have no interactive stands.
	function getStandPrefix() {
		if (document.getElementById('residential')) return '_';
		if (document.querySelector('g[id^="res_"]')) return 'res_';
		return null;
	}

	// Collect every stand id that actually exists on this page so we
	// only load matching modals and skip ids that are not shown.
	function getPageStandIds(prefix) {
		const ids = new Set();

		let groups;
		if (prefix === '_') {
			const residential = document.getElementById('residential');
			groups = residential ? residential.querySelectorAll('g[id^="_"]') : [];
		} else {
			groups = document.querySelectorAll('g[id^="res_"]');
		}

		groups.forEach(function (g) {
			ids.add(g.id.slice(prefix.length));
		});

		return ids;
	}

	// Pick the data file that belongs to the current page.
	function getApiEndpoint(prefix) {
		return prefix === 'res_' ? './api/phase-two.json' : './api/phase-one.json';
	}

	async function fetchStands(prefix) {
		try {
			const response = await fetch(getApiEndpoint(prefix));
			return await response.json();
		} catch (error) {
			console.log('Error fetching stand data:', error);
			return [];
		}
	}

	// Modal HTML for a single stand.
	function createModal(stand) {
		const price = stand.price.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		});

		return `
		<div class="modal micromodal-slide" id="${stand.ID}" aria-hidden="true">
			<div class="modal__overlay" tabindex="-${stand.ID}" data-micromodal-close>
				<div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="${stand.ID}-title">
					<header class="modal__header">
						<h2 class="modal__title ${stand.availability}" id="${stand.ID}-title">
							Stand Number: ${stand.ID}
						</h2>
						<h3 class="modal__sqm">
							Stand size: ${stand.sqm} sqm
						</h3>
						<button aria-label="Close Modal" class="modal__close" data-micromodal-close></button>
					</header>
					<main class="modal__content">
						<h3 class="modal__price">${price}</h3>
						<p>${stand.description}</p>
					</main>
					<footer class="modal__footer">
						<a class="modal__btn" href="login.html">Buy Stand</a>
						<a class="modal__btn" data-micromodal-close>Close</a>
					</footer>
				</div>
			</div>
		</div>`;
	}

	// Append one modal per stand into the shared container.
	function loadModals(stands) {
		const modalContainer = document.getElementById('modal-container');
		stands.forEach(function (stand) {
			modalContainer.insertAdjacentHTML('beforeend', createModal(stand));
		});
	}

	// Colour the stand shape and wire its trigger attributes.
	function colorStand(stand, prefix) {
		const gElement = document.getElementById(prefix + stand.ID);
		if (!gElement) return;

		gElement.setAttribute('data-micromodal-trigger', stand.ID);
		gElement.setAttribute('data-tippy-content', '<h3>Stand No.' + stand.ID + '</h3>');

		const shape = gElement.querySelector('[id="bg"], [id="amenity"], [id="reg_bg"], polygon');
		if (shape) shape.setAttribute('class', stand.availability);
	}

	// Centre piece: fetches the page's data once, loads only the
	// modals for stands shown here, colours them and re-inits libs.
	function wireStands() {
		const prefix = getStandPrefix();
		if (!prefix) {
			initTippy();
			return;
		}

		const pageStandIds = getPageStandIds(prefix);

		fetchStands(prefix).then(function (stands) {
			const onThisPage = stands.filter(function (stand) {
				return pageStandIds.has(String(stand.ID));
			});

			loadModals(onThisPage);
			onThisPage.forEach(function (stand) {
				colorStand(stand, prefix);
			});

			initTippy();
			MicroModal.init();
		});
	}

	wireStands();

	// ------------------------------------------------------------
	// SVG pan & zoom map
	// ------------------------------------------------------------

	const svgElement = document.querySelector('.map-container svg');

	// Pages without a map (e.g. login.html) stop here.
	if (!svgElement) return;

	// Optional initial view per page, keyed by <svg id>.
	// Empty = default fit/contain/center.
	const mapViewConfig = {
		'northgate-map-phase-one': {},
		'northgate-map-phase-two': {},
		'northgate-map-all': {},
		'phase-one-section-a': {},
		'phase-one-section-b': {},
		'phase-one-section-c': {},
		'phase-one-section-d': {},
		'phase-one-section-e': {},
		'phase-one-sections': {},
	};

	const panZoomInstance = svgPanZoom(svgElement, {
		viewportSelector: '.svg-pan-zoom_viewport',
		panEnabled: true,
		controlIconsEnabled: false,
		zoomEnabled: true,
		dblClickZoomEnabled: false,
		mouseWheelZoomEnabled: true,
		preventMouseEventsDefault: true,
		zoomScaleSensitivity: 0.5,
		minZoom: 0.5,
		maxZoom: 10,
		fit: true,
		contain: true,
		center: true,
		refreshRate: 'auto',
		customEventsHandler: {
			// Halt all touch events
			haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],

			// Init custom events handler
			init: function (options) {
				var instance = options.instance;

				// Apply per-page initial view (empty config = default fit/contain/center)
				var viewConfig = mapViewConfig[svgElement.id] || {};
				var initialScale = instance.getZoom();
				var pannedX = 0;
				var pannedY = 0;

				if (viewConfig.zoom) {
					instance.zoom(viewConfig.zoom);
				}

				if (viewConfig.pan && !isMobileDevice()) {
					instance.pan(viewConfig.pan);
				}

				// Init Hammer for Touch Controls
				this.hammer = Hammer(options.svgElement, {
					inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
				});

				// Handle pan
				this.hammer.on('panstart panmove', function (ev) {
					if (ev.type === 'panstart') {
						pannedX = 0;
						pannedY = 0;
					}

					// Pan only the difference
					instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
					pannedX = ev.deltaX;
					pannedY = ev.deltaY;
				});

				// Enable + handle pinch zoom
				this.hammer.get('pinch').set({ enable: true });

				this.hammer.on('pinchstart pinchmove', function (ev) {
					if (ev.type === 'pinchstart') {
						initialScale = instance.getZoom();
					}
					instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
				});

				// Prevent moving the page on some devices when panning over SVG
				options.svgElement.addEventListener('touchmove', function (e) {
					e.preventDefault();
				});
			},

			// Destroy custom events handler
			destroy: function () {
				this.hammer.destroy();
			},

			click: function (event, instance) {
				// Prevent default click behaviour if panning or zooming
				if (instance.getZoom() !== 1 || instance.getPan().x !== 0 || instance.getPan().y !== 0) {
					event.preventDefault();
				}
			}
		}
	});

	// ------------------------------------------------------------
	// Map controls: pan, zoom and the legend button.
	// ------------------------------------------------------------

	// Toggle the full-screen map legend on/off.
	function toggleLegend() {
		const legend = document.getElementById('map-legend');
		if (!legend) return;

		const isHidden = legend.style.display === 'none' || legend.style.display === '';
		legend.style.display = isHidden ? 'block' : 'none';
	}

	// Wire each on-screen control button to a pan-zoom action.
	// Every page uses the same button ids, so one map covers all.
	function bindMapControls(panZoom) {
		const actions = {
			'pan-up':    function () { panZoom.panBy({ x: 0, y: 100 }); },
			'pan-right': function () { panZoom.panBy({ x: -100, y: 0 }); },
			'pan-down':  function () { panZoom.panBy({ x: 0, y: -100 }); },
			'pan-left':  function () { panZoom.panBy({ x: 100, y: 0 }); },
			'zoom-in':   function () { panZoom.zoomIn(); },
			'zoom-out':  function () { panZoom.zoomOut(); },
		};

		Object.keys(actions).forEach(function (id) {
			const button = document.getElementById(id);
			if (button) button.addEventListener('click', actions[id]);
		});

		const infoButton = document.getElementById('info');
		if (infoButton) infoButton.addEventListener('click', toggleLegend);
	}

	bindMapControls(panZoomInstance);
});