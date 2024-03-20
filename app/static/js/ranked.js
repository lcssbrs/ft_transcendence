function setupRanked() {

	document.getElementById("find-ranked").addEventListener("click", function() {
	    // Établir une connexion WebSocket
	    var ws = new WebSocket("ws://localhost/ranked/");

	    // Réagir lorsque la connexion est ouverte
	    ws.onopen = function(event) {
	        console.log("Connexion WebSocket établie avec succès !");
	        // Fermer la connexion une fois la vérification effectuée
	        ws.close();
	    };

	    // Réagir en cas d'erreur de connexion WebSocket
	    ws.onerror = function(event) {
	        console.error("Erreur de connexion WebSocket:", event);
	        // Afficher un message d'erreur à l'utilisateur, etc.
	    };
	});

}
