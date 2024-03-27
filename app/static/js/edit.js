function setupEdit() {
    document.getElementById("editForm").addEventListener("submit", function(event) {
        event.preventDefault();

        var isValid = true;
        const formFirstName = document.getElementById("id_first_name").value;
        const formLastName = document.getElementById("id_last_name").value;
        const idFirstMissing = document.getElementById("firstMissing");
        const idLastMissing = document.getElementById("lastMissing");

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
                // Afficher un message d'erreur pour le type de fichier non autorisé
                alert("Veuillez sélectionner une image au format JPG, JPEG ou PNG.");
            }

            if (profilePictureFile.size > maxSize) {
                isValid = false;
                // Afficher un message d'erreur pour la taille du fichier dépassant la limite
                alert("La taille du fichier dépasse la limite autorisée de 1 Mo.");
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
                    document.querySelector('#userAvatar').src = data.profile_picture;
                    loadView('/profile/?id=' + data.id, true, false);
                } else {
                    loadView('/edit/', true, false);
                }
            })
            .catch(error => {
                console.error('Erreur lors de l\'envoi du formulaire:', error);
            });
        }
    });
}
