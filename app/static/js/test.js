function setupRanked() {
	var game;
	var winner;
	var ID_ranked;
	var playerName;
	var challengerName;
	var playerScore = 0;
	var challengerScore = 0;
	var gameStarted = false;

	let canvas;
	let context;
	let gameStarted = false;
	let gameEnd = false;
	let disconnect_ennemy = false;
	let displayWinner = false;


	const PLAYER_HEIGHT = 100;
	const PLAYER_WIDTH = 5;
	const PLAYER_SPEED = 10;
	const BALL_SPEED = 1.2;
	const MAX_SPEED = 14;


	function launchGame() {
		if (playerId1 = data.player1)
		{
			setupPlayer();
		}
		else
		{
			setupChallenger();
		}
	}

	//-------------PARTIE JOUEUR 1-----------------
	function setupPlayer() {
		document.addEventListener('keydown', playerMove);
		setupStart();
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

		startGameWithCountdown();
		function startGameWithCountdown() {
			gameStarted = true;
			game.player.score = 0;
			game.challenger.score = 0;
			game.ball.x = canvas.width / 2;
			game.ball.y = canvas.height / 2;
			game.ball.speed.x = 1;
			game.ball.speed.y = 1;
			displayWinner = false;

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
					document.addEventListener('keydown', playerMove);
					document.addEventListener('keydown', challengerMove);
					clearInterval(countdownInterval);
					startGame();
				}
			}, 1000);
		}

		function startGame() {
			game.player.score = 0;
			game.challenger.score = 0;
			drawScore();
			play();
		}

		function draw() {
			context = canvas.getContext('2d');
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
				challengerScore = game.challenger.score;
				winner = game.player.score === 3 ? playerName : challengerName;
				context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2, canvas.height / 2);
			}
		}

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

		function collide(player) {
			if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
				game.ball.x = canvas.width / 2;
				game.ball.y = canvas.height / 2;
				game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
				game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
				game.ball.speed.x = 2;
				if (player === game.player) {
					game.challenger.score++;
					challengerScore = game.challenger.score;
				} else {
					game.player.score++;
					playerScore = game.player.score;
				}
				drawScore();
				if (game.player.score === 3 || game.challenger.score === 3) {
					var gameEnd = true;
					endGame();
				}
			} else {
				game.ball.speed.x *= -BALL_SPEED;
				if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
					game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
				}
			}
		}

		function endGame() {
			gameStarted = false;
			winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
			if (playerScore > challengerScore)
				endGameApi(ID_ranked, playerScore, challengerScore, 1);
			else
				endGameApi(ID_ranked, playerScore, challengerScore, 2);
			displayWinner = true;
			endGame = true;

			setTimeout(function() {
				displayWinner = false;
				loadView('/ranked/', true, false)
			}, 3000);

			document.removeEventListener('keydown', playerMove);


			game.ball.speed.x = 0;
			game.ball.speed.y = 0;
		}

		function playerMove(event) {
			if (game.player.y < 0) {
				game.player.y = 0;
			} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
				game.player.y = canvas.height - PLAYER_HEIGHT;
			}
		}
	}

	//-------------PARTIE JOUEUR 2-----------------
	function setupChallenger() {
		document.addEventListener('keydown', challengerMove);
		setupStart()
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
				}
			}
			draw();
		}

		startGameWithCountdown();
		function startGameWithCountdown() {
			gameStarted = true;
			game.player.score = 0;
			game.challenger.score = 0;
			displayWinner = false;

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
				if (countdown <= 0) {
					document.addEventListener('keydown', playerMove);
					document.addEventListener('keydown', challengerMove);
					clearInterval(countdownInterval);
					startGame();
				}
			}, 1000);
		}

		function startGame() {
			game.player.score = 0;
			game.challenger.score = 0;
			drawScore();
			play();
		}

		function draw() {
			context = canvas.getContext('2d');
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
				challengerScore = game.challenger.score;
				winner = game.player.score === 3 ? playerName : challengerName;
				context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2, canvas.height / 2);
			}
		}

		function play() {
			draw();
		}

		function challengerMove(event) {
			if (game.challenger.y < 0) {
				game.challenger.y = 0;
			} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
				game.challenger.y = canvas.height - PLAYER_HEIGHT;
			}
		}
	}


	function drawScore() {
		context = canvas.getContext('2d');
		context.fillStyle = 'white';
		context.font = canvas.width / 20 + 'px Anta';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(game.player.score, canvas.width / 4, canvas.height / 6);
		context.fillText(game.challenger.score, canvas.width - canvas.width / 4, canvas.height / 6);
	}
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
						challengerName = data[1].username;
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
		socket = new WebSocket(`ws://localhost:8000/ws/match/${match_id}/`);

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
		};

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

		function updatePad(direction) {
			if (playerId === 2)
			{
				if (direction === 'up')
					game.challenger.y -= PLAYER_SPEED;
				if (direction === 'down')
					game.challenger.y += PLAYER_SPEED;
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - 100) {
					game.challenger.y = canvas.height - 100;
				}
			}
			else
			{
				if (direction === 'up')
					game.player.y -= PLAYER_SPEED;
				if (direction === 'down')
					game.player.y += PLAYER_SPEED;
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
					game.challenger.y -= PLAYER_SPEED;
				if (direction === 'down')
					game.challenger.y += PLAYER_SPEED;
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - 100) {
					game.challenger.y = canvas.height - 100;
				}
			}
			else
			{
				if (direction === 'up')
					game.player.y -= PLAYER_SPEED;
				if (direction === 'down')
					game.player.y += PLAYER_SPEED;
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
			adversaireMatch.style.display = "block";
			if (gameStarted == true && disconnect_ennemy == true)
			{
				if (playerId === 1)
					endGameApi(match_id, 4, challengerScore, playerId);
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
			if (window.location.pathname !== "/ranked") {
				closeWebSocket();
			}
		});

		window.addEventListener('hashchange', function(event) {
			console.log(window.location.pathname);
			if (window.location.pathname !== "/ranked") {
				closeWebSocket();
			}
		});
	}
