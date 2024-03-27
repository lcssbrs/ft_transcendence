function setupEdit() {
	document.getElementById("editForm").addEventListener("submit", function(event) {
		event.preventDefault();
		const formData = new FormData(document.getElementById("editForm"));
		fetch('/edit/', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				loadView('/profile/?id=' + data.id);
			}
			else {
				loadView('/edit/', true);
			}
		})
		.catch(error => {
			console.error('Erreur lors de l\'envoi du formulaire:', error);
		});
	});
}
