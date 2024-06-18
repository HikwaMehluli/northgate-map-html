import tippy from 'tippy.js';
import MicroModal from 'micromodal';
import svgPanZoom from './svg-pan-zoom.min.js';
import './hammer.js';

window.addEventListener('load', function () {
	console.log('%c Made by Digital Afros', 'font-size: 12px;');



	// 
	// Detect Mobile Device. This function has been used inside TippyJS & svgPanZoomJS
	//
	function isMobileDevice() {
		return /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);
	}



	// 
	// MicroModal - https://micromodal.vercel.app/#usage
	// &
	// TippyJS, Tooltip Options - https://atomiks.github.io/tippyjs/v6/customization/
	//

	// Get API endpoint
	const apiEndpoint = './api/stands.json';

	// Fetch modal data from apiEndpoint
	async function fetchModalData() {
		try {
			const response = await fetch(apiEndpoint);
			const data = await response.json();
			return data;
		} catch (error) {
			console.log('Error fetching modal data Mr Hikwa:', error);
			return [];
		}
	}

	// Generate Modal HTML Structure
	function createModal(modal) {
		return `
		<div class="modal micromodal-slide" id="${modal.ID}" aria-hidden="true">
			<div class="modal__overlay" tabindex="-${modal.ID}" data-micromodal-close>
				<div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="${modal.ID}-title">
					<header class="modal__header">
						<h2 class="modal__title ${modal.availability}" id="${modal.ID}-title">
							Stand Number: ${modal.ID}
						</h2>
						<h3 class="modal__sqm">
							Stand size: ${modal.sqm}sqm
						</h3>
						<button aria-label="Close Modal" class="modal__close" data-micromodal-close></button>
					</header>
					<main class="modal__content">
						<h3 class="modal__price">
							USD${modal.price.toLocaleString('en-US', { //  converts a number into a string using a specific locale
			style: 'currency', // Specifies that the number should be formatted as currency.
			currency: 'USD', // Specifies the currency to be USD (US Dollar).
			minimumFractionDigits: 2, // Ensures that at least 2 decimal places are displayed.
			maximumFractionDigits: 2, // Ensures that at most 2 decimal places are displayed.
		})}
						</h3>
						<p>${modal.description}</p>
					</main>
					<footer class="modal__footer">
						<a class="modal__btn" href="https://staging.northgate.co.zw">Buy Stand</a>
						<a class="modal__btn" data-micromodal-close>Close</a>
					</footer>
				</div>
			</div>
		</div>`;
	}

	// Append Modals to the DOM
	async function loadModals() {
		const modalContainer = document.getElementById('modal-container');
		const modals = await fetchModalData();

		modals.forEach(modal => {
			modalContainer.insertAdjacentHTML('beforeend', createModal(modal));
		});

		// Initialize MicroModal
		MicroModal.init();
	}
	// Call the function to load modals on page load
	loadModals();



	// 
	// Function to update HTML elements on SVG's
	// 
	async function updateElements() {
		const svgData = await fetchModalData();

		svgData.forEach(item => {
			// Select the corresponding <g> element
			const gElement = document.getElementById(`_${item.ID}`);

			if (gElement) {
				// Update data-micromodal-trigger attribute
				gElement.setAttribute('data-micromodal-trigger', item.ID);

				// Update the class of the polygon element for availability status
				const polygon = gElement.querySelector('polygon');
				if (polygon) {
					// polygon.className.baseVal = item.availability;
					polygon.setAttribute('class', item.availability);
				}

				// Update the text content
				const textElement = gElement.querySelector('text');
				if (textElement) {
					textElement.textContent = item.ID; // Set text to ID
				}

				// Update data-tippy-content attribute
				gElement.setAttribute('data-tippy-content', `<h3>Stand No.${item.ID}</h3>`);
			}

			// Initialize Tippy.js and remove on mobile devices
			if (!isMobileDevice()) {
				tippy('[data-tippy-content]', {
					arrow: true,
					allowHTML: true,
					delay: [100, 100],
				});
			}
		});
	}
	// Call the function to update elements
	updateElements();



	//
	// SVG Pan Zoom - https://github.com/bumbu/svg-pan-zoom
	//
	const svgElement = document.querySelector('svg');
	svgPanZoom(svgElement, {
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

				// 
				// Variables
				// 
				var instance = options.instance,
					initialScale = 3, // Initial zoom level = 2
					pannedX = 0,
					pannedY = 0

				// Set initial zoom level
				instance.zoom(initialScale);

				// Set initial pan
				if (!isMobileDevice()) {
					instance.pan({ x: 200, y: -1765 });
				}


				// 
				// Add Custom Controls
				// 
				document.getElementById('pan-up').addEventListener('click', function () {
					instance.panBy({ x: 0, y: 100 });
				});

				document.getElementById('pan-right').addEventListener('click', function () {
					instance.panBy({ x: -100, y: 0 });
				});

				document.getElementById('pan-down').addEventListener('click', function () {
					instance.panBy({ x: 0, y: -100 });
				});

				document.getElementById('pan-left').addEventListener('click', function () {
					instance.panBy({ x: 100, y: 0 });
				});

				document.getElementById('zoom-in').addEventListener('click', function () {
					instance.zoomIn();
				});

				document.getElementById('zoom-out').addEventListener('click', function () {
					instance.zoomOut();
				});


				// 
				// Init Hammer for Touch Controls
				// 
				// Listen only for pointer and touch events
				this.hammer = Hammer(options.svgElement, {
					inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
				})

				// Handle pan
				this.hammer.on('panstart panmove', function (ev) {
					// On pan start reset panned variables
					if (ev.type === 'panstart') {
						pannedX = 0
						pannedY = 0
					}

					// Pan only the difference
					instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY })
					pannedX = ev.deltaX
					pannedY = ev.deltaY
				})

				// Enable pinch
				this.hammer.get('pinch').set({ enable: true })

				// Handle pinch
				this.hammer.on('pinchstart pinchmove', function (ev) {
					// On pinch start remember initial zoom
					if (ev.type === 'pinchstart') {
						initialScale = instance.getZoom()
						instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y })
					}
					instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y })
				})

				// Prevent moving the page on some devices when panning over SVG
				options.svgElement.addEventListener('touchmove', function (e) { e.preventDefault(); });
			},

			// destroy custom events handler
			destroy: function () {
				this.hammer.destroy()
			},

			click: function (event, instance) {
				// Prevent default click behavior if panning or zooming
				if (instance.getZoom() !== 1 || instance.getPan().x !== 0 || instance.getPan().y !== 0) {
					event.preventDefault();
				}
			}
		}
	});
});