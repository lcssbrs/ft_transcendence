function setupLogin() {
    document.getElementById("loginForm").addEventListener("submit", function(event) {
		event.preventDefault();

		var	isValid = true;
        const formUsername = document.getElementById("usernameInput").value;
        const formPassword = document.getElementById("passwordInput").value;
        const formToken = document.getElementById("tokenInput").value;
		const idUsername = document.getElementById("usernameMissing");
        const idPassword = document.getElementById("passwordMissing");
        const idToken = document.getElementById("tokenMissing");
        const idError = document.getElementById("errorInfo");

		if (formUsername == "") {
            isValid = false;
            idUsername.classList.remove("d-none");
        } else {
            idUsername.classList.add("d-none");
        }

        if (formPassword == "") {
            isValid = false;
            idPassword.classList.remove("d-none");
        } else {
            idPassword.classList.add("d-none");
        }

        if (formToken == "") {
            isValid = false;
            idToken.classList.remove("d-none");
        } else {
            idToken.classList.add("d-none");
        }

        if (isValid == true) {
            const formData = new FormData(document.getElementById("loginForm"));

            fetch('/login/', {
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
                    loadView('/', true);
                } else {
                    document.getElementById("usernameInput").value = "";
    				document.getElementById("passwordInput").value = "";
    				document.getElementById("tokenInput").value = "";
					idError.classList.remove("d-none");
                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi du formulaire:', error);
            });
        }
    });
}
