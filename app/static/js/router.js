document.addEventListener("DOMContentLoaded", function() {
	const navLinks = document.querySelectorAll('.redir');

	navLinks.forEach(link => {
		link.addEventListener('click', function(event) {
			event.preventDefault(); // Empêcher le comportement de lien par défaut

			// Récupérez l'URL de la vue à charger depuis l'attribut href du lien
			const url = link.getAttribute('href');
			loadView(url);
			history.pushState(null, null, url);
		});
	});

	window.addEventListener('popstate', function(event) {
		let url = location.pathname;
		url = url.substring(1);
		if (url === '') {
			url = 'nothing';
		}
		if (event.state === null) {
			loadView('');
			loadView(url);
		}
		else {
			loadView(url);
		}
	});

	function loadView(url) {
		fetch(url)
			.then(response => response.text())
			.then(html => {
				document.getElementById('content').innerHTML = html;
				if (url == 'solo')
					setupSolo();
				else if (url == 'local')
					setupLocal();
				else if (url == 'login')
					setupLogin();
				else if (url == 'ranked')
					setupRanked();
			})
			.catch(error => {
				console.error('Erreur lors du chargement de la vue:', error);
			});
	}
});
