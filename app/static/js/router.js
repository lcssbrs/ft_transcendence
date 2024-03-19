document.addEventListener("DOMContentLoaded", function() {
	const navLinks = document.querySelectorAll('.redir');

	navLinks.forEach(link => {
		link.addEventListener('click', function(event) {
			event.preventDefault();
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
		loadView(url);
	});

	function loadView(url) {

		fetch(url)
			.then(response => response.text())
			.then(html => {
				if (url == 'register' || url == 'login') {
					var content = document.getElementById('logcontent');
					if (url == 'register') {
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
