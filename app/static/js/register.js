function setupRegister() {
	document.getElementById("registerForm").addEventListener("submit", function(event) {
		event.preventDefault();
		const formData = new FormData(document.getElementById("registerForm"));
		fetch('/register/', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				loadView('/login/');
			}
			else {
				loadView('/register/');
			}
		})
		.catch(error => {
			console.error('Erreur lors de l\'envoi du formulaire:', error);
		});
	});
}
