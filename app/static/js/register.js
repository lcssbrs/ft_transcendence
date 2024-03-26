function setupRegister() {
	document.getElementById("registerForm").addEventListener("submit", function(event) {
		event.preventDefault();
		const formData = new FormData(document.getElementById("registerForm"));
		console.log(formData);
		fetch('/register/', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				document.getElementById('auth-data').setAttribute('data-authenticated', 'True');
				$.ajax({
					url: '/api/get_user/',
					type: 'GET',
					success: function(response) {
						document.querySelector('#userAvatar').src = response.profile_picture;
						document.querySelector('#linkProfile').href = '/profile/?id=' + response.id;
					}
				})
				checkLogged();
				online();
				loadView('/qrcode/');
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
