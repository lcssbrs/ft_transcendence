// document.getElementById("loginForm").addEventListener("submit", function(event) {
// 	var usernameInput = document.getElementById("usernameInput");
// 	var usernameError = document.getElementById("usernameMissing");

// 	var passwordInput = document.getElementById("passwordInput");
// 	var passwordError = document.getElementById("passwordMissing");
// 	var isValid = true;

// 	if (usernameInput.value === "") {
// 		usernameError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		usernameError.classList.add("d-none");
// 	}
// 	if (passwordInput.value === "") {
// 		passwordError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		passwordError.classList.add("d-none");
// 	}
// 	if (!isValid) {
// 		event.preventDefault();
// 	}
// });

document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('.redir');

    // Ajoutez un gestionnaire d'événement de clic à chaque lien de navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Empêcher le comportement de lien par défaut

            // Récupérez l'URL de la vue à charger depuis l'attribut href du lien
            const url = link.getAttribute('href');

            // Chargez le contenu de la vue correspondante en appelant la fonction loadView
            loadView(url);

            // Modification de l'URL sans recharger la page
            history.pushState(null, null, url);
        });
    });

    // Fonction pour charger la vue correspondante
    function loadView(url) {
        // Effectuez une requête AJAX pour récupérer le contenu de la vue depuis le serveur
        fetch(url)
            .then(response => response.text())
            .then(html => {
                // Mettez à jour le contenu de la page avec le contenu de la vue chargée
                document.getElementById('main-content').innerHTML = html;
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la vue:', error);
            });
    }
});
