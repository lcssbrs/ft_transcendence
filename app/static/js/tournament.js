function tournament() {
	let socket = null;
	var ID_Player1;
	var ID_Player2;
	var ID_Player3;
	var ID_Player4;


	// Boutons
	const startButton = document.getElementById("start-tournament");
	const searchingMatch = document.getElementById("searching-tournament");

	startButton.addEventListener("click", function() {
		startButton.style.display = "none";
		searchingMatch.style.display = "block";

		// Faire endpoint Tournoi
		fetch('api/create-tournament/', {
		method: 'POST'
	})
	.then(response => response.json())
	.then(data => {
		// gérer les réponses de tournoi
	})
		.catch(error => console.error('Erreur avec la connexion en base de données', error));
	});

	//-----------------------------------------\/
	//-------------------API-------------------\/
	//-----------------------------------------\/

	function getPlayerId(tournament_id) {
		fetch(`api/match/${tournament_id}`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				ID_Player1 = data.player01;
				ID_Player2 = data.player02;
				ID_Player3 = data.player03;
				ID_Player4 = data.player04;
				const ID_players = [ID_Player1, ID_Player2, ID_Player3, ID_Player4];

				getPlayerNames(ID_players)
					.then(playerNames => {
						console.log("Noms des joueurs", playerNames)
				});

			}
			else {
				console.log("Tournoi non trouvé");
			}
		})
		.catch(error => console.error('Erreur avec la connexion en base de données', error))
	};

	function getPlayerNames(playerIds) {
		const requests = [];
		playerIds.forEach(playerId => {
			if (playerId) {
				requests.push(
					fetch(`/api/users/${playerId}`)
					.then(response => response.json())
					.then(data => {
						return data.username;
					})
					.catch(error => {
						console.error("Erreur lors de la récupération du nom du joueur :", error);
						return null;
					})
				);
			}
		});

		return Promise.all(requests);
	}

	//-----------------------------------------\/
	//----------------WEBSOCKET----------------\/
	//-----------------------------------------\/

	var ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";


	// Faire api/endpoint pour rejoindre/créer un tournoi existant
	// Récupérer match_id

	var ws_path = ws_scheme + '://' + `localhost:8000/ws/match/${match_id}/`
	socket = new WebSocket(ws_path);
}
