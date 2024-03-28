function SetupTournament() {

	// TODO MODIFIER LA BASE DE DONNEES POUR EVITER LES ERREURS DE TOURNOI

	let socket = null;

	var ID_Player1;
	var ID_Player2;
	var ID_Player3;
	var ID_Player4;
	var ID_players;

	var PlayerNames;

	var PlayerScoreMatch1P1;
	var PlayerScoreMatch1P2;

	var PlayerScoreMatch2P1;
	var PlayerScoreMatch2P2;

	var PlayerScoreFinalP1;
	var PlayerScoreFinalP2;

	var	my_id;
	var playerMatchId;

	var my_match_id;
	var tournament_id;

	let TournamentStart = false;

	//-----------------------------------------\/
	//-----------------ELEMENTS----------------\/
	//-----------------------------------------\/

	const startButton = document.getElementById("start-tournament");
	const searchingMatch = document.getElementById("searching-match");

	// Match
	const match1P1 = document.getElementById("d1");
	const match1P2 = document.getElementById("d2");
	const match2P1 = document.getElementById("d3");
	const match2P2 = document.getElementById("d4");

	const final1 = document.getElementById("f1");
	const final2 = document.getElementById("f2");

	// Score
	const scoreM1P1 = document.getElementById("s1");
	const scoreM1P2 = document.getElementById("s2");
	const scoreM2P1 = document.getElementById("s3");
	const scoreM2P2 = document.getElementById("s4");

	const scoreF1 = document.getElementById("sf1");
	const scoreF2 = document.getElementById("sf2");

	startButton.addEventListener("click", function() {
		startButton.style.display = "none";
		searchingMatch.style.display = "block";

		getTournamentId();
	});

	//-----------------------------------------\/
	//-------------------API-------------------\/
	//-----------------------------------------\/

	function getTournamentId() {
		fetch(`/api/create-tournament/`, {
			method: 'POST'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				tournament_id = data.id;
				console.log("Tournoi ID [", data.id, "]");
				getMyId();
			}
			else {
				console.log("Tournoi non trouvé");
			}
		})
	}

	function getMyId() {
		fetch(`/api/get_user/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				my_id = data.id;
			}
			else {
				console.log("Tournoi non trouvé");
			}
		})
	}

	async function getPlayerNames(playerIds) {
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
		const resolvedUsernames = await Promise.all(requests);

		PlayerNames = resolvedUsernames.filter(username => username !== null);
		return Promise.all(requests);
	}

	function getTournamentInfo() {
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				if (!ID_Player1)
					ID_Player1 = data.player01;
				if (!ID_Player2)
					ID_Player2 = data.player02;
				if (!ID_Player3)
					ID_Player3 = data.player03;
				if (!ID_Player4)
					ID_Player4 = data.player04;
				ID_players = [ID_Player1, ID_Player2, ID_Player3, ID_Player4];
				getPlayerNames(ID_players);
			}
			else {
				console.log("Erreur de connexion avec la base de données")
			}
			printNames();
		})
	}

	function getMyMatchId() {
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(response => response.json())
		.then(data => {
			if (data) {
				if (data.player01 === my_id || data.player02 === my_id)
				{
					my_match_id = data.match1_id;
				}
				else if (data.player03 === my_id || data.player04 === my_id) {
					my_match_id = data.match2_id;
				}
				if (data.player01 === my_id)
					playerMatchId = 1;
				else if (data.player02 === my_id)
					playerMatchId = 2;
				else if (data.player03 === my_id)
					playerMatchId = 1;
				else if (data.player04 === my_id)
					playerMatchId = 2;
			} else {
				console.log("Erreur de connexion avec la base de données");
			}
			initialGame();
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}

	function printNames() {
		if (PlayerNames)
		{
			if (PlayerNames[0])
				match1P1.textContent = PlayerNames[0];
			if (PlayerNames[1])
				match1P2.textContent = PlayerNames[1];
			if (PlayerNames[2])
				match2P1.textContent = PlayerNames[2];
			if (PlayerNames[3])
			{
				match2P2.textContent = PlayerNames[3];
				searchingMatch.style.display = "none";
				TournamentStart = true;
				getMyMatchId();
			}
		}
	}

	setInterval(function() {
		if (tournament_id && TournamentStart === false) {
			getTournamentInfo();
		}
	}, 600);

	function initialGame()
	{
		document.querySelector('#bracket').classList.add("d-none");
		document.querySelector('#canvas4').classList.remove("d-none");
		document.querySelector('#start-tournament').classList.add("d-none");
		document.querySelector('#start-match').classList.remove("d-none");
		console.log("Match ID [", my_match_id, "]");
		setupRanked(my_match_id, playerMatchId);
	}

	function waitingSecondGame()
	{
		document.querySelector('#bracket').classList.remove("d-none");
		document.querySelector('#canvas4').classList.add("d-none");
		document.querySelector('#start-tournament').classList.remove("d-none");
		document.querySelector('#start-match').classList.add("d-none");

		if (socket)
		{
			socket.close();
			socket = null;
		}

		setInterval(function() {
			if (!PlayerScoreMatch1P1 && !PlayerScoreMatch2P2) {
				getScore();
			}
		}, 1000);
	}

	function getMatchInfo(id, nb) {
		fetch(`/api/match/${id}/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				if (nb === 1)
				{
					PlayerScoreMatch1P1 = data.score_player1;
					PlayerScoreMatch1P2 = data.score_player2;
					scoreM1P1.textContent = PlayerScoreMatch1P1;
					scoreM1P2.textContent = PlayerScoreMatch1P2;
				}
				else {
					PlayerScoreMatch2P1 = data.score_player1;
					PlayerScoreMatch2P2 = data.score_player2;
					scoreM2P1.textContent = PlayerScoreMatch2P1;
					scoreM2P2.textContent = PlayerScoreMatch2P2;
				}
			}
			else {
				console.log("Erreur de connexion avec la base de données");
			}
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}

	function getScore() {
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(response => response.json())
		.then(data => {
			if (data) {
				getMatchInfo(data.match1_id, 1);
				getMatchInfo(data.match2_id, 2);
			} else {
				console.log("Erreur de connexion avec la base de données");
			}
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}

	//-----------------------------------------\/
	//------------------PONG-------------------\/
	//-----------------------------------------\/

	function setupRanked(match_id, playerMatchId) {

		var game;
		var canvas;
		var winner
		let gameOwnerId;
		var ID_ranked;
		var playerName;
		var adverseName;
		var playerScore = 0;
		var adverseScore = 0;
		let disconnect_ennemy = false
		function launchGame() {

			var gameStarted = false;
			const PLAYER_HEIGHT = 100;
			const PLAYER_WIDTH = 5;
			const PLAYER_SPEED = 10;
			const BALL_SPEED = 1.2;
			const MAX_SPEED = 14;
			let displayWinner = false;
			let borderFlashTime = 0;
			let borderFlashInterval = null;

			setupStart();
			startGameWithCountdown();

			// clignotement lors d'un but
			function flashBorder(duration) {
				let startTime = Date.now();
				borderFlashInterval = setInterval(function() {
					borderFlashTime = Date.now() - startTime;
					if (borderFlashTime < duration) {
						canvas.style.border = (canvas.style.border === '2px solid white') ? '2px solid red' : '2px solid white';
					} else {
						clearInterval(borderFlashInterval);
						canvas.style.border = '2px solid white';
					}
				}, 50);
			}

			// Fonction pour lancer la partie après un compte à rebours
			function startGameWithCountdown() {
				gameStarted = true;

				game.player.score = 0;
				game.challenger.score = 0;
				game.ball.x = canvas.width / 2;
				game.ball.y = canvas.height / 2;
				game.ball.speed.x = 1;

				game.ball.speed.y = 1;

				displayWinner = false;

				document.addEventListener('keydown', playerMove);
				document.addEventListener('keydown', challengerMove);

				var countdown = 3;
				var countdownInterval = setInterval(function() {
					var context = canvas.getContext('2d');
					context.clearRect(0, 0, canvas.width, canvas.height);
					draw();
					context.fillStyle = '#F4ACBC';
					context.font = canvas.width / 2 + 'px Anta';
					context.textAlign = 'center';
					context.textBaseline = 'middle';
					context.fillText(countdown, canvas.width / 2, canvas.height / 2);
					countdown--;
					if (countdown < 0) {
						clearInterval(countdownInterval);
						startGame();
					}
				}, 1000);
			}

			function drawScore() {
				var context = canvas.getContext('2d');
				context.fillStyle = 'white';
				context.font = canvas.width / 20 + 'px Anta';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText(game.player.score, canvas.width / 4, canvas.height / 6);
				context.fillText(game.challenger.score, canvas.width - canvas.width / 4, canvas.height / 6);
			}

			//Mise en place du terrain :
			function draw() {
				var context = canvas.getContext('2d');
				context.fillStyle = '#0D6EFD';
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.strokeStyle = 'white';
				context.beginPath();
				context.moveTo(canvas.width / 2, 0);
				context.lineTo(canvas.width / 2, canvas.height);
				context.stroke();
				context.strokeStyle = 'white';
				context.lineWidth = 2;
				context.strokeRect(0, 0, canvas.width, canvas.height);
				context.fillStyle = '#F4ACBC';
				context.fillRect(0, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
				context.fillRect(canvas.width - PLAYER_WIDTH, game.challenger.y, PLAYER_WIDTH, PLAYER_HEIGHT);
				context.beginPath();
				context.fillStyle = 'white';
				context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
				context.fill();
				drawScore();

				if (displayWinner) {
					context.fillStyle = '#F4ACBC';
					context.font = canvas.width / 15 + 'px Anta';
					context.textAlign = 'center';
					context.textBaseline = 'middle';
					playerScore = game.player.score;
					adverseScore = game.challenger.score;
					winner = game.player.score === 3 ? playerName : adverseName;
					context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2, canvas.height / 2);
				}
			}

			//mouvements de la balle :
			function play() {
				draw();
				ballMove();
				requestAnimationFrame(play);
			}

			function ballMove() {
				// Rebonds sur le haut et bas
				if (game.ball.y > canvas.height || game.ball.y < 0) {
					game.ball.speed.y *= -1;
				}
				if (game.ball.x > canvas.width - PLAYER_WIDTH) {
					collide(game.challenger);
				} else if (game.ball.x < PLAYER_WIDTH) {
					collide(game.player);
				}
				game.ball.x += game.ball.speed.x;
				game.ball.y += game.ball.speed.y;
			}

			function playerMove(event) {
				if (game.player.y < 0) {
					game.player.y = 0;
				} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
					game.player.y = canvas.height - PLAYER_HEIGHT;
				}
			}

			function challengerMove(event) {
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
					game.challenger.y = canvas.height - PLAYER_HEIGHT;
				}
			}

			//collisions
			function collide(player) {
				if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
					game.ball.x = canvas.width / 2;
					game.ball.y = canvas.height / 2;
					game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
					game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
					game.ball.speed.x = 2;
					if (player === game.player) {
						game.challenger.score++;
						adverseScore = game.challenger.score;
						flashBorder(1000);
					} else {
						game.player.score++;
						playerScore = game.player.score;
						flashBorder(1000);
					}
					updateScoreDisplay();
					if (game.player.score === 3 || game.challenger.score === 3) {
						gameStarted = false;
						endGame();
					}
				} else {
					if (gameOwnerId == 1)
					{
						game.ball.speed.x *= -BALL_SPEED;
						if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
							game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
						}
					}
				}
			}

			// scorboard update
			function updateScoreDisplay() {
				var context = canvas.getContext('2d');
				context.fillStyle = 'white';
				context.font = canvas.width / 20 + 'px Anta';
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillText(game.player.score, canvas.width / 4, canvas.height / 6);
				context.fillText(game.challenger.score, canvas.width - canvas.width / 4, canvas.height / 6);
			}

			// lancer une game
			function startGame() {
				game.player.score = 0;
				game.challenger.score = 0;
				updateScoreDisplay();
				play();
			}

			// Fonction pour terminer la partie
			function endGame() {
				gameStarted = false;
				winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
				if (playerScore > adverseScore)
					endGameApi(ID_ranked, playerScore, adverseScore, 1);
				else
					endGameApi(ID_ranked, playerScore, adverseScore, 2);
				displayWinner = true;
				endGame = true;

				setTimeout(function() {
					displayWinner = false;
					waitingSecondGame();
				}, 3000);

				removeKeyListeners();

				game.ball.speed.x = 0;
				game.ball.speed.y = 0;
			}

			function removeKeyListeners() {
				document.removeEventListener('keydown', playerMove);
				document.removeEventListener('keydown', challengerMove);
			}

			//----------------EVENTS LISTENERS--------

			// Dessins et animations
			function setupStart() {
				canvas = document.getElementById('canvas4');
				game = {
					player: {
						y: canvas.height / 2 - PLAYER_HEIGHT / 2,
						score: 0
					},
					challenger: {
						y: canvas.height / 2 - PLAYER_HEIGHT / 2,
						score: 0
					},
					ball: {
						x: canvas.width / 2,
						y: canvas.height / 2,
						r: 5,
						speed: {
							x: 1,
							y: 1
						}
					}
				}
				draw();
			}

			// Event sur le clavier
			document.addEventListener('keydown', playerMove);
			document.addEventListener('keydown', challengerMove);
		}

			//-----------------------------------------\/
			//----------------WEBSOCKET----------------\/
			//-----------------------------------------\/

		const startMatch = document.getElementById("start-match");
		// const waitingMatch = document.getElementById("waiting-match");
		const adversaireMatch = document.getElementById("adversaire-match");
		let gameStarted = false;


		function GetPlayerId(my_match_id) {
			fetch(`/api/match/${my_match_id}/`, {
				method: 'GET'
			})
			.then(response => response.json())
			.then(data => {
				if (data) {
					playerId1 = data.player1;
					playerId2 = data.player2;
					getPlayerNames(playerId1, playerId2);
				} else {
					console.log('Match non trouvé');
				}
			})
			.catch(error => console.error('Erreur avec la connexion en base de données', error));
		};

		function endGameApi(my_match_id, score_01, score_02, winner) {
			const requestBody = {
				score_player1: score_01,
				score_player2: score_02,
				player_winner: winner,
				status: "end_game"
			};

			fetch(`/api/match/${my_match_id}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			})
			.then(response => {})
			.catch(error => console.error('Erreur lors de la connexion à la base de données :', error));
		}

		function quitGameApi(my_match_id, score_01, score_02) {
			const requestBody = {
				score_player1: score_01,
				score_player2: score_02,
				status: "cancel"
			};

			fetch(`/api/match/${my_match_id}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			})
			.then(response => {})
			.catch(error => console.error('Erreur lors de la connexion à la base de données :', error));
		}

		function getPlayerNames(player1, player2) {
			const request1 = fetch(`/api/users/${player1}`);
			const request2 = fetch(`/api/users/${player2}`);

			Promise.all([request1, request2])
				.then(responses => {
					const promises = responses.map(response => response.json());
					Promise.all(promises)
						.then(data => {
							playerName = data[0].username;
							adverseName = data[1].username;
						})
						.catch(error => console.error("Erreur lors de la récupération des données :", error));
				})
				.catch(error => console.error("Erreur lors de la requête API :", error));
		}

		startMatch.addEventListener("click", function() {
			startMatch.style.display = "none";
			// waitingMatch.style.display = "block";

			if (playerMatchId == 1)
				initializeWebSocket(1);
			else
				initializeWebSocket(2);
		});

		function initializeWebSocket(playerId) {
			gameOwnerId = playerId;
			socket = new WebSocket(`ws://localhost:8000/ws/match/${my_match_id}/`);

			socket.onopen = function() {
				ID_ranked = my_match_id;
				console.log("Websocket ouvert");
			};

			socket.onmessage = function(event) {
				const eventData = JSON.parse(event.data);
				if (eventData.type === 'game_start')
				{
					// waitingMatch.style.display = "none";
					gameStarted = true;
					displayGame();
					GetPlayerId(my_match_id);
				}
				if (eventData.type === 'game_update')
				{
					const playerData = eventData.data;
					if (playerData.player !== playerId) {
						updateOpponentPad(playerData.direction);
					}
				}
				if (eventData.type === 'disconnect_message')
				{
					disconnect_ennemy = true;
					closeWebSocket();
				}
				if (eventData.type === 'ball_move')
				{
					updateBall(playerId, eventData.data.x, eventData.data.y, eventData.data.score01, eventData.data.score02, eventData.data.status, eventData.data.vx, eventData.data.vy);
				}
			};

			function updateBall(player, x, y, score01, score02, status, vx, vy) {
				if (gameStarted && player == 2) {
					game.ball.x = x;
					game.ball.y = y;
					game.player.score = score01,
					game.challenger.score = score02
					gameStarted = status
					game.ball.speed.x = vx,
					game.ball.speed.y = vy
				}
			}

			function sendGameMove(player, direction) {
				if (gameStarted) {
					const moveData = {
						type: 'game_move',
						player: player,
						direction: direction
					};
					socket.send(JSON.stringify(moveData));
				}
			}

			function sendGameBall(player) {
				if (gameStarted == true && player == 1 && disconnect_ennemy == false && socket) {
					const moveData = {
						type: 'ball_move',
						x: game.ball.x,
						y: game.ball.y,
						score01: game.player.score,
						score02: game.challenger.score,
						status: gameStarted,
						vx: game.ball.speed.x,
						vy: game.ball.speed.y,
					};
					socket.send(JSON.stringify(moveData));
				}
			}

			setInterval(function() {
				sendGameBall(playerId);
			}, 25);

			function updatePad(direction) {
				if (playerId === 2)
				{
					if (direction === 'up')
						game.challenger.y -= 10;
					if (direction === 'down')
						game.challenger.y += 10;
					if (game.challenger.y < 0) {
						game.challenger.y = 0;
					} else if (game.challenger.y > canvas.height - 100) {
						game.challenger.y = canvas.height - 100;
					}
				}
				else
				{
					if (direction === 'up')
						game.player.y -= 10;
					if (direction === 'down')
						game.player.y += 10;
					if (game.player.y < 0) {
						game.player.y = 0;
					} else if (game.player.y > canvas.height - 100) {
						game.player.y = canvas.height - 100;
					}
				}
			}

			function updateOpponentPad(direction) {
				if (playerId === 1)
				{
					if (direction === 'up')
						game.challenger.y -= 10;
					if (direction === 'down')
						game.challenger.y += 10;
					if (game.challenger.y < 0) {
						game.challenger.y = 0;
					} else if (game.challenger.y > canvas.height - 100) {
						game.challenger.y = canvas.height - 100;
					}
				}
				else
				{
					if (direction === 'up')
						game.player.y -= 10;
					if (direction === 'down')
						game.player.y += 10;
					if (game.player.y < 0) {
						game.player.y = 0;
					} else if (game.player.y > canvas.height - 100) {
						game.player.y = canvas.height - 100;
					}
				}
			}

			document.addEventListener('keydown', function(event) {
				if (gameStarted) {
					if (event.key === 'w' || event.key === 'W' || event.key === 'z' || event.key === 'Z') {
						updatePad('up')
						sendGameMove(playerId, 'up');
					} else if (event.key === 's' || event.key === 'S') {
						updatePad('down')
						sendGameMove(playerId, 'down');
					}
				}
			});

			socket.onclose = function() {
				if (gameStarted == true && disconnect_ennemy == true)
				{
					if (playerId === 1)
						endGameApi(match_id, 4, adverseScore, playerId);
					else
						endGameApi(match_id, playerScore, 4, playerId);
				}
				if (playerId == 1 && disconnect_ennemy == false && gameStarted == false)
				{
					quitGameApi(match_id, 0, 0);
				}
				gameStarted = false;
				console.log("WebSocket déconnecté");
			};

			function displayGame() {
				launchGame();
			}

			function closeWebSocket() {
				if (socket) {
					socket.close();
					console.log("Connexion WebSocket fermée");
					socket = null;
				}
			}

			document.addEventListener('click', function(event) {
				if (event.target.tagName === 'A') {
					closeWebSocket();
				}
			});

			window.addEventListener('popstate', function(event) {
				if (window.location.pathname !== "/tournament") {
					closeWebSocket();
				}
			});

			window.addEventListener('hashchange', function(event) {
				console.log(window.location.pathname);
				if (window.location.pathname !== "/tournament") {
					closeWebSocket();
				}
			});
		}
	}
}
