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
				document.querySelector('#userAvatar').src = response.profile_picture;
				loadView('/profile/?id=' + data.id, true, false);
			}
			else {
				loadView('/edit/', true, false);
			}
		})
		.catch(error => {
			console.error('Erreur lors de l\'envoi du formulaire:', error);
		});
	});
}
