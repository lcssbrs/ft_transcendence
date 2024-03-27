function extractViewContent(html) {
	const tempElement = document.createElement('div');
	tempElement.innerHTML = html;
	const viewContent = tempElement.querySelector('#content').innerHTML;
	return viewContent;
}

function loadView(url, addHistory, force) {
	let actual = location.pathname;
	if (actual == url && force == false)
		return ;
	var isAuthenticated = document.getElementById('auth-data').getAttribute('data-authenticated') === 'True';
	if ((!isAuthenticated && (url == '/login/' || url == '/register/' || url == '/')) || isAuthenticated) {
		fetch(url)
		.then(response => response.text())
		.then(html => {
			if (addHistory == true)
			history.pushState(null, null, url);
		document.querySelector('#content').innerHTML = extractViewContent(html);
		if (url == '/local/')
			setupLocal();
		else if (url == '/solo/')
			setupSolo();
		else if (url == '/ranked/')
			setupRanked();
		else if (url == '/login/')
			setupLogin();
		else if (url == '/register/')
			setupRegister();
		else if (url == '/edit/')
			setupEdit();
		attachEventListeners();
		})
		.catch(error => {
			console.error('Erreur lors du chargement de la vue:', error);
		});
	}
	else {
		if (actual != '/login/')
			loadView('/login/', true);
	}
}

function attachEventListeners() {
	const navLinks = document.querySelectorAll('.redir');

	function attachClickEvent(link) {
		link.addEventListener('click', function(event) {
			event.preventDefault();
			const url = link.getAttribute('href');
			loadView(url, true);
		});
	}

	navLinks.forEach(link => {
		if (!link.hasAttribute('data-click-event-attached')) {
			attachClickEvent(link);
			link.setAttribute('data-click-event-attached', true);
		}
	});
}

function checkLogged()
{
	var isAuthenticated = document.getElementById('auth-data').getAttribute('data-authenticated') === 'True';
	if (isAuthenticated) {
		document.querySelector('#logbutton').classList.add('d-none');
		document.querySelector('#profilebar').classList.remove('d-none');
		document.querySelector('#friend-list').classList.remove('d-none');
		document.querySelector('#friend-request').classList.remove('d-none');
		document.querySelector('#add-friend').classList.remove('d-none');
		document.querySelector('#logrequire').classList.add('d-none');
	} else {
		document.querySelector('#logbutton').classList.remove('d-none');
		document.querySelector('#profilebar').classList.add('d-none');
		document.querySelector('#friend-list').classList.add('d-none');
		document.querySelector('#friend-request').classList.add('d-none');
		document.querySelector('#add-friend').classList.add('d-none');
		document.querySelector('#logrequire').classList.remove('d-none');
		let url = location.pathname;
		if (url != '/login/' && url != '/register/' && url != '/')
			loadView('/', true);
	}
}

document.addEventListener("DOMContentLoaded", function() {
	checkLogged();
	online();
	attachEventListeners();
	let url = location.pathname;
	history.pushState(null, null, url);
	if (url == 'local/')
		setupLocal();
		if (url == '/local/')
		setupLocal();
	else if (url == '/solo/')
		setupSolo();
	else if (url == '/ranked/')
		setupRanked();
	else if (url == '/login/')
		setupLogin();
	else if (url == '/register/')
		setupRegister();
	else if (url == '/edit/')
		setupEdit();

	window.addEventListener('popstate', function(event) {
		let url = location.pathname;
		loadView(url, false, true);
	});
});
