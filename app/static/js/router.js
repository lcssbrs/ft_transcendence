function loadView(url) {
	if (url == 'nothing')
	{
		document.getElementById('content').classList.add('d-none');
		document.getElementById('logcontent').classList.add('d-none');
		return ;
	}
	fetch(url)
		.then(response => response.text())
		.then(html => {
			if (url == '/register/' || url == '/login/') {
				var content = document.getElementById('logcontent');
				if (url == '/register/') {
					content.style.width = "35%";
					content.style.height = "75%";
				}
				else {
					content.style.width = "30%";
					content.style.height = "60%";
				}
				content.classList.remove('d-none');
				document.getElementById('content').classList.add('d-none');
				content.innerHTML = html;
			}
			else {
				var content = document.getElementById('content');
				content.classList.remove('d-none');
				document.getElementById('logcontent').classList.add('d-none');
				content.innerHTML = html;
			}
			if (url == '/solo/')
				setupSolo();
			else if (url == '/local/')
				setupLocal();
			else if (url == '/ranked/')
				setupRanked();
			else if (url == '/login/')
				setupLogin();
			attachEventListeners();
		})
		.catch(error => {
			console.error('Erreur lors du chargement de la vue:', error);
		});
}

function attachEventListeners() {
	const navLinks = document.querySelectorAll('.redir');
	navLinks.forEach(link => {
		if (!link.hasAttribute('data-event-added')) {
			link.addEventListener('click', function(event) {
				event.preventDefault();
				const url = link.getAttribute('href');
				loadView(url);
				history.pushState(null, null, url);
			});
			link.setAttribute('data-event-added', 'true');
		}
	});
}

document.addEventListener("DOMContentLoaded", function() {
	attachEventListeners();

	window.addEventListener('popstate', function(event) {
		let url = location.pathname;
		console.log(url);
		if (url === '/') {
			url = 'nothing';
		}
		loadView(url);
	});
});
