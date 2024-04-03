function setupEdit() {
	document.getElementById("editForm").addEventListener("submit", function(event) {
		event.preventDefault();

		var isValid = true;
		const formFirstName = document.getElementById("id_first_name").value;
		const formLastName = document.getElementById("id_last_name").value;
		const idFirstMissing = document.getElementById("firstMissing");
		const idLastMissing = document.getElementById("lastMissing");
		const sizeId = document.getElementById("sizeError");
		const formatId = document.getElementById("formatError");

        if (formFirstName == "") {
            isValid = false;
            idFirstMissing.classList.remove("d-none");
        } else {
            idFirstMissing.classList.add("d-none");
        }

        if (formLastName == "") {
            isValid = false;
            idLastMissing.classList.remove("d-none");
        } else {
            idLastMissing.classList.add("d-none");
        }

        const profilePictureInput = document.getElementById("id_profile_picture");
        const profilePictureFile = profilePictureInput.files[0];
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        const maxSize = 1024 * 1024; // 1 Mo

        if (profilePictureFile) {
            if (!allowedTypes.includes(profilePictureFile.type)) {
                isValid = false;
				formatId.classList.remove("d-none");

            }

            if (profilePictureFile.size > maxSize) {
                isValid = false;
				sizeId.classList.remove("d-none");

            }
        }

        if (isValid) {
            const formData = new FormData(document.getElementById("editForm"));
            fetch('/edit/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $.ajax({
						url: '/api/get_user/',
						type: 'GET',
						success: function(response) {
							document.querySelector('#userAvatar').src = response.profile_picture;
						}
					})
					loadView('/profile/?id=' + data.id, true);
                } else {
                    loadView('/edit/', true);
                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi du formulaire:', error);
            });
        }
    });
}
