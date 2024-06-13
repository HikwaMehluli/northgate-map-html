import tippy from 'tippy.js';
import MicroModal from 'micromodal';
import svgPanZoom from'./svg-pan-zoom.min.js';
import './hammer.js';

window.addEventListener("load", function () {
// document.addEventListener("DOMContentLoaded", function () {
	// 
	// TippyJS, Tooltip Options - https://atomiks.github.io/tippyjs/v6/customization/
	// 
	// tippy('[data-tippy-content]', {
	// 	arrow: true,
	// 	delay: [100, 100],
	// });


	// 
	// MicroModal - https://micromodal.vercel.app/#usage
	//
	MicroModal.init();


	//
	// SVG Pan Zoom - https://github.com/bumbu/svg-pan-zoom
	//
	const svgElement = document.querySelector('svg');
	const svgPanZoomInstance = svgPanZoom(svgElement, {
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

				// set initial pan area
				instance.pan({x: 200, y: -1750});


				// 
				// Add Custom Controls
				// 
				// document.getElementById('pan-up').addEventListener('click', function () {
				// 	instance.panBy({x: 0, y: 100});
				// });

				// document.getElementById('pan-right').addEventListener('click', function () {
				// 	instance.panBy({x: -100, y: 0});
				// });

				// document.getElementById('pan-down').addEventListener('click', function () {
				// 	instance.panBy({x: 0, y: -100});
				// });

				// document.getElementById('pan-left').addEventListener('click', function () {
				// 	instance.panBy({x: 100, y: 0});
				// });

				// document.getElementById('reset').addEventListener('click', function () {
				// 	instance.reset();
				// });

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

				// Enable pinch
				this.hammer.get('pinch').set({ enable: true })

				// Handle double tap
				this.hammer.on('doubletap', function (ev) {
					instance.zoomIn()
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

			click: function(event, instance) {
				// Prevent default click behavior if panning or zooming
				if (instance.getZoom() !== 1 || instance.getPan().x !== 0 || instance.getPan().y !== 0) {
				event.preventDefault();
				}
			}
		}
	});
});
