function setupRanked() {
	const startButton = document.getElementById("start-ranked");
	const searchingMatch = document.getElementById("searching-match");
	let socket = null;

	startButton.addEventListener("click", function() {
		startButton.style.display = "none";
		searchingMatch.style.display = "block";

		socket = new WebSocket("ws://localhost:8000/ws/ranked")
		// Vérifier si un match existe
		fetch('/check-match/')
			.then(response => response.json())
			.then(data => {
				if (data.exists) {
					// Rejoindre le match en tant que joueur 2
					socket.onopen = function() {
						console.log("Match trouve, vous etes le joueur 2");
							try {
								const response =  fetch("/api/join-match/", {
									method: "POST",
								});
								const data =  response.json();
								console.log(data);
							} catch (error) {
								console.error("Une erreur s'est produite :", error);
							}
					};
				}
				else{
					// Créer un nouveau match et rejoindre en tant que joueur 1
					socket.onopen = function() {
						console.log("Creation d'un match, vous etes joueur 1");
							try {
								const response = fetch("/api/join-match/", {
									method: "POST",
								});
								const data =  response.json();
								console.log(data);
							} catch (error) {
								console.error("Une erreur s'est produite :", error);
							}
					};
				}
			})
			.catch(error => console.error('Erreur de recherche de match:', error));

		socket.onmessage = function() {
			//traiter ici les messages quon recoit du serv
		};

		socket.onclose = function() {
			console.log("WebSocket deconnecte");
		};
	});
}
