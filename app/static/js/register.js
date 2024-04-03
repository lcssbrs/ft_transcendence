function setupRegister() {
    document.getElementById("registerForm").addEventListener("submit", function(event) {
        event.preventDefault();

        var isValid = true;
        const formFirstName = document.getElementById("id_first_name").value;
        const formLastName = document.getElementById("id_last_name").value;
        const formUsername = document.getElementById("id_username").value;
        const formPassword = document.getElementById("id_password").value;
        const formEmail = document.getElementById("id_email").value;

        const idFirstName = document.getElementById("firstMissing");
        const idLastName = document.getElementById("lastMissing");
        const idUsernameReg = document.getElementById("usernameMissingReg");
        const idPasswordReg = document.getElementById("passwordMissingReg");
        const idEmail = document.getElementById("emailMissing");

        const emailFormat = document.getElementById("emailFormat");
        const idError = document.getElementById("errorInfo");
        const lenPassword = document.getElementById("passwordLenght");



        if (formFirstName == "") {
            isValid = false;
            idFirstName.classList.remove("d-none");
        } else {
            idFirstName.classList.add("d-none");
        }

        if (formLastName == "") {
            isValid = false;
            idLastName.classList.remove("d-none");
        } else {
            idLastName.classList.add("d-none");
        }

        if (formUsername == "") {
            isValid = false;
            idUsernameReg.classList.remove("d-none");
        } else {
            idUsernameReg.classList.add("d-none");
        }

        if (formPassword == "") {
            isValid = false;
            idPasswordReg.classList.remove("d-none");
        } else {
			if (formPassword.length < 8) {
				isValid = false;
				lenPassword.classList.remove("d-none");
			} else {
				lenPassword.classList.add("d-none");
			}
			idPasswordReg.classList.add("d-none");
        }

        if (formEmail == "") {
            isValid = false;
            idEmail.classList.remove("d-none");
        } else {
			// Vérifier le format de l'email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(formEmail)) {
                isValid = false;
                emailFormat.classList.remove("d-none");
            } else {
                emailFormat.classList.add("d-none");
            }
            idEmail.classList.add("d-none");
        }

        if (isValid) {
            const formData = new FormData(document.getElementById("registerForm"));

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
                    });
                    checkLogged();
                    online();
                    loadView('/qrcode/', true);
                } else {
                    document.getElementById("id_username").value = "";
                    document.getElementById("id_email").value = "";
                    document.getElementById("usernameMissingReg").classList.remove("d-none");
                    document.getElementById("emailMissing").classList.remove("d-none");
					idError.classList.remove("d-none");

                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi du formulaire:', error);
            });
        }
    });
}
