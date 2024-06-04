// Sample API endpoint returning an array of modal data
const apiEndpoint = './api/stands.json';

// Fetch modal data from apiEndpoint
async function fetchModalData() {
	try {
		const response = await fetch(apiEndpoint);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log('Error fetching modal data Mr Hikwa:', error);
		return[];
	}
}

// Generate modal HTML structure
function createModal(modal) {
	return`
	<div class="modal micromodal-slide" id="${modal.ID}">
		<div class="modal__overlay" tabindex="-${modal.ID}" data-micromodal-close>
			<div class="modal__container" role="dialog">
				<header class="modal__header">
					<h2 class="modal__title ${modal.availability}">Stand No. ${modal.ID}</h2>
					<button class="modal__close" data-micromodal-close></button>
				</header>
				<main class="modal__content">
					<h4>Stand Size: ${modal.sqm}</h4>
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

// Append modals to the DOM
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