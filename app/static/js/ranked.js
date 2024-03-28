function setupRanked() {
	var game;
	var socket;
	var winner;
	var ID_ranked;
	var playerName;
	var challengerName;
	var playerScore = 0;
	var challengerScore = 0;
	var gameStarted = false;
	var match_id = 0;

	let canvas;
	let context;
	let disconnect_ennemy = false;
	let displayWinner = false;

	const PLAYER_HEIGHT = 100;
	const PLAYER_WIDTH = 5;
	const PLAYER_SPEED = 10;
	const BALL_SPEED = 1.2;
	const MAX_SPEED = 14;

	//-------------PARTIE JOUEUR 1-----------------
	function setupPlayer() {
		socket = new WebSocket(`ws://localhost:8000/ws/match/${match_id}/`);

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
			ball_move(game.ball.x, game.ball.y, game.player.score, game.challenger.score);
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
					ball_move();
					endGame();
				}
			} else {
				game.ball.speed.x *= -BALL_SPEED;
				if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
					game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
				}
			}
		}

		function ball_move() {
			if (gameStarted && socket != null) {
				const moveData = {
					type: 'ball_move',
					x: game.ball.x,
					y: game.ball.y,
					s1: game.player.score,
					s2: game.challenger.score
				};
				socket.send(JSON.stringify(moveData));
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
		socket = new WebSocket(`ws://localhost:8000/ws/match/${match_id}/`);

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
					score: 0,
					ball: {
						x: canvas.width / 2,
						y: canvas.height / 2,
						r: 5
					}
				},
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
				if (countdown > 0) {
					countdown -= 1;
					if (countdown == 0) {
						countdown = '';
					}
				}
			}, 1000);
			document.addEventListener('keydown', challengerMove);
			if (countdown <= 0) {
				clearInterval(countdownInterval);
				startGame();
			}
		}

		function startGame() {
			game.player.score = 0;
			game.challenger.score = 0;
			drawScore();
			draw();
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
			context.arc(game.challenger.ball.x, game.challenger.ball.y, game.challenger.ball.r, 0, Math.PI * 2, false);
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

		function updateBall(x, y, s1, s2) {
			game.challenger.ball.x = x;
			game.challenger.ball.y = y;
			if(game.player.score != s1 || game.challenger.score != s2)
			{
				game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
				game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
			}
			game.player.score = s1;
			game.challenger.score = s2;
			draw();
			if (s1 === 3 || s2 === 3)
			{
				endGame();
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
			// document.removeEventListener('keydown', playerMove);
			// game.ball.speed.x = 0;
			// game.ball.speed.y = 0;
		}

		socket.onmessage = function(event) {
			const eventData = JSON.parse(event.data);
			if (eventData.type === 'ball_move')
			{
				updateBall(eventData.x, eventData.y, eventData.s1, eventData.s2);
			}
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

	//-----------------------------------------\/
	//----------------WEBSOCKET----------------\/
	//-----------------------------------------\/

	const startButton = document.getElementById("start-ranked");
	const searchingMatch = document.getElementById("searching-match");
	const adversaireMatch = document.getElementById("adversaire-match");
	socket = null;

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
		.then(response => {
			closeWebSocket();
		})
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
		.then(response => {
			closeWebSocket();
		})
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
			if (eventData.type === 'game_start' && gameStarted == false)
			{
				searchingMatch.style.display = "none";
				gameStarted = true;
				displayGame(playerId);
				GetPlayerId(match_id);
			}
			if (eventData.type === 'game_move')
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
			if (gameStarted && socket != null) {
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
				game.challenger.y = direction;
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
					game.challenger.y = canvas.height - PLAYER_HEIGHT;
				}
			}
			else
			{
				game.player.y = direction;
				if (game.player.y < 0) {
					game.player.y = 0;
				} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
					game.player.y = canvas.height - PLAYER_HEIGHT;
				}
			}
		}

		function updateOpponentPad (direction) {
			if (playerId === 1)
			{
				game.challenger.y = direction;
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
					game.challenger.y = canvas.height - PLAYER_HEIGHT;
				}
			}
			else
			{
				game.player.y = direction;
				if (game.player.y < 0) {
					game.player.y = 0;
				} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
					game.player.y = canvas.height - PLAYER_HEIGHT;
				}
			}
		}

		document.addEventListener('keydown', function(event) {
			if (gameStarted) {
				if (playerId === 1)
					var posY = game.player.y
				else
					var posY = game.challenger.y
				if (event.key === 'w' || event.key === 'W' || event.key === 'z' || event.key === 'Z') {
					posY += -10;
					updatePad(posY)
					sendGameMove(playerId, posY);
				} else if (event.key === 's' || event.key === 'S') {
					posY += 10;
					updatePad(posY)
					sendGameMove(playerId, posY);
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

		function displayGame(playerId) {
			if (playerId == 1)
			{
				setupPlayer();
			}
			else
			{
				setupChallenger();
			}
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
				console.log("chibre");
				closeWebSocket();
			}
		});

		window.addEventListener('popstate', function(event) {
			if (window.location.pathname !== "/ranked") {
				console.log("ok");
				closeWebSocket();
			}
		});

		window.addEventListener('hashchange', function(event) {
			console.log(window.location.pathname);
			if (window.location.pathname !== "/ranked") {
				console.log("poivre");
				closeWebSocket();
			}
		});

	}

}
