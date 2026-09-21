// Site navigation: a drawer that slides in from the right with a
// one-level nested menu for the Phase One pages.
export default function initNavigation() {
	const menuBtn = document.getElementById('menu-btn');
	const drawer = document.getElementById('navigation-drawer');
	const closeBtn = document.getElementById('drawer-close');
	const phaseOneBtn = document.getElementById('nav-phase-one');
	const subDrawer = document.getElementById('sub-phase-one');
	const subBack = document.getElementById('sub-phase-one-back');

	// Pages without the navigation (e.g. login.html) simply skip.
	if (!menuBtn || !drawer) return;

	function open() {
		drawer.classList.add('drawer--open');
	}

	function close() {
		drawer.classList.remove('drawer--open');
		drawer.classList.remove('drawer--sub-open');
		if (subDrawer) subDrawer.classList.remove('drawer__sub--open');
	}

	menuBtn.addEventListener('click', open);
	closeBtn.addEventListener('click', close);

	// Escape key closes the drawer.
	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') close();
	});

	// Nested sub-menu (Phase One pages) with a back button.
	if (phaseOneBtn && subDrawer) {
		phaseOneBtn.addEventListener('click', function () {
			drawer.classList.add('drawer--sub-open');
			subDrawer.classList.add('drawer__sub--open');
		});

		subBack.addEventListener('click', function () {
			drawer.classList.remove('drawer--sub-open');
			subDrawer.classList.remove('drawer__sub--open');
		});
	}
}