function setupRanked() {

	document.getElementById("find-ranked").addEventListener("click", function() {
	    // Établir une connexion WebSocket
	   // Création de la connexion WebSocket en spécifiant l'URL du serveur WebSocket

	   const socket = new WebSocket("ws://localhost:8000/ws/ranked");

	   socket.onopen = function(event) {
		   console.log("WebSocket connected");
		   // Vous pouvez envoyer des données au serveur une fois la connexion établie
		   socket.send("ping");
		   console.log("message envoye");
	   };

	   socket.onmessage = function(event) {
		   console.log("Received message from server:", event.data);
		   // Traitez les messages reçus du serveur ici
	   };

	   socket.onclose = function(event) {
		   console.log("WebSocket disconnected");
	   };

	});

}
