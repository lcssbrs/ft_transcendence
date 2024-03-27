function setupRanked() {

	var game;
	var canvas;
	var winner
	let gameEnd = false
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
					gameEnd = true;
					endGame();
				}
			} else {
				game.ball.speed.x *= -BALL_SPEED;
				if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
					game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
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
			canvas = document.getElementById('canvas3');
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

	const startButton = document.getElementById("start-ranked");
	const searchingMatch = document.getElementById("searching-match");
	const adversaireMatch = document.getElementById("adversaire-match");
	let socket = null;
	let gameStarted = false;


	function GetPlayerId(match_id) {
		fetch(`/api/match/${match_id}/`, {
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

	function endGameApi(match_id, score_01, score_02, winner) {
		const requestBody = {
			score_player1: score_01,
			score_player2: score_02,
			player_winner: winner,
			status: "end_game"
		};

		fetch(`/api/match/${match_id}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		})
		.then(response => {})
		.catch(error => console.error('Erreur lors de la connexion à la base de données :', error));
	}

	function quitGameApi(match_id, score_01, score_02) {
		const requestBody = {
			score_player1: score_01,
			score_player2: score_02,
			status: "cancel"
		};

		fetch(`/api/match/${match_id}/`, {
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

	startButton.addEventListener("click", function() {
		startButton.style.display = "none";
		searchingMatch.style.display = "block";

		fetch('/api/join-match/', {
		method: 'POST'
	})
	.then(response => response.json())
	.then(data => {
		var match_id = 0;
		if (data.match_exists) {
			console.log("Match trouvé [", data.match_data.id, "]");
			match_id = data.match_data.id;
			const player = 2;
			initializeWebSocket(match_id, player);
		} else {
			console.log("Nouvelle partie créée [", data.match_data.id, "]");
			match_id = data.match_data.id;
			const player = 1;
			initializeWebSocket(match_id, player);
		}
	})
		.catch(error => console.error('Erreur avec la connexion en base de données', error));
	});

    function initializeWebSocket(match_id, playerId) {
		socket = new WebSocket(`wss://root.alan-andrieux.fr/ws/match/${match_id}/`);

		socket.onopen = function() {
			ID_ranked = match_id;
			console.log("Websocket ouvert");
		};

		socket.onmessage = function(event) {
			const eventData = JSON.parse(event.data);
			if (eventData.type === 'game_start')
			{
				searchingMatch.style.display = "none";
				gameStarted = true;
				displayGame();
				GetPlayerId(match_id);
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
				updateBall(playerId, eventData.data.x, eventData.data.y);
			}
		};

		function updateBall(player, x, y) {
			if (gameStarted
				) {
					if (player !== playerId) {
						game.ball.x = x;
						game.ball.y = y;
					}
				}
			}

			function updateOpponentPad(direction) {
				if (direction === 'up') {
					game.challenger.y -= PLAYER_SPEED;
				} else if (direction === 'down') {
					game.challenger.y += PLAYER_SPEED;
				}
			}

			function displayGame() {
				const gameContainer = document.getElementById('game-container');
				gameContainer.style.display = 'block';
				launchGame();
			}

			function closeWebSocket() {
				if (!gameEnd && !disconnect_ennemy)
					quitGameApi(ID_ranked, playerScore, adverseScore);
				if (socket) {
					socket.close();
					socket = null;
				}
			}

			window.addEventListener('beforeunload', function(event) {
				if (socket) {
					socket.close();
					socket = null;
				}
			});
		}
	}

	setupRanked();
