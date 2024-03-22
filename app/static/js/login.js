function setupLogin() {
	document.getElementById("loginForm").addEventListener("submit", function(event) {
		event.preventDefault();
		const formData = new FormData(document.getElementById("loginForm"));
		fetch('/login/', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				loadView('/two-factor-login/');
			}
			else {
				loadView('/login/');
			}
		})
		.catch(error => {
			// console.error('Erreur lors de l\'envoi du formulaire:', error);
		});
	});
}
