function setupRanked() {
	var game;
	var canvas;
	var winner;
	let gameEnd = false;
	let gameOwnerId;
	var ID_ranked;
	var playerName;
	var adverseName;
	var playerScore = 0;
	var adverseScore = 0;
	let disconnect_ennemy = false;

	function launchPlayerGame() {

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
				game.ball.speed.x *= -1;
				if (player === game.player) {
					game.ball.speed.y += (game.ball.y - player.y) / PLAYER_HEIGHT / 2;
				} else {
					game.ball.speed.y += (game.ball.y - player.y) / PLAYER_HEIGHT / 2;
				}
				game.ball.speed.y = Math.min(game.ball.speed.y, MAX_SPEED);
			}
		}

		function updateScoreDisplay() {
			let scorePlayerElement = document.getElementById('score-player');
			let scoreChallengerElement = document.getElementById('score-challenger');
			scorePlayerElement.textContent = playerScore;
			scoreChallengerElement.textContent = adverseScore;
		}

		function endGame() {
			displayWinner = true;
			if (game.player.score === 3) {
				socket.send(JSON.stringify({ 'type': 'game_end', 'winner': playerName }));
			} else {
				socket.send(JSON.stringify({ 'type': 'game_end', 'winner': adverseName }));
			}
			document.removeEventListener('keydown', playerMove);
			document.removeEventListener('keydown', challengerMove);
			setTimeout(function() {
				window.location.href = '/game/ranked';
			}, 3000);
		}

		function setupStart() {
			canvas = document.getElementById('canvas');
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			game = new Game();
			game.player = new Player();
			game.challenger = new Player();
			game.ball = new Ball();

			game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
			game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		}

		setupStart();
		play();
	}

	function launchChallengerGame() {

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
				winner = game.challenger.score === 3 ? adverseName : playerName;
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
			if (game.ball.x > canvas.width) {
				collide(game.player);
			} else if (game.ball.x < PLAYER_WIDTH) {
				collide(game.challenger);
			}
			game.ball.x += game.ball.speed.x;
			game.ball.y += game.ball.speed.y;
		}

		function playerMove(event) {
			if (game.challenger.y < 0) {
				game.challenger.y = 0;
			} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
				game.challenger.y = canvas.height - PLAYER_HEIGHT;
			}
		}

		function challengerMove(event) {
			if (event.key === 'ArrowUp') {
				game.challenger.y -= PLAYER_SPEED;
			} else if (event.key === 'ArrowDown') {
				game.challenger.y += PLAYER_SPEED;
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
				game.ball.speed.x *= -1;
				if (player === game.player) {
					game.ball.speed.y += (game.ball.y - player.y) / PLAYER_HEIGHT / 2;
				} else {
					game.ball.speed.y += (game.ball.y - player.y) / PLAYER_HEIGHT / 2;
				}
				game.ball.speed.y = Math.min(game.ball.speed.y, MAX_SPEED);
			}
		}

		function updateScoreDisplay() {
			let scorePlayerElement = document.getElementById('score-player');
			let scoreChallengerElement = document.getElementById('score-challenger');
			scorePlayerElement.textContent = playerScore;
			scoreChallengerElement.textContent = adverseScore;
		}

		function endGame() {
			displayWinner = true;
			if (game.challenger.score === 3) {
				socket.send(JSON.stringify({ 'type': 'game_end', 'winner': adverseName }));
			} else {
				socket.send(JSON.stringify({ 'type': 'game_end', 'winner': playerName }));
			}
			document.removeEventListener('keydown', playerMove);
			document.removeEventListener('keydown', challengerMove);
			setTimeout(function() {
				window.location.href = '/game/ranked';
			}, 3000);
		}

		function setupStart() {
			canvas = document.getElementById('canvas');
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			game = new Game();
			game.player = new Player();
			game.challenger = new Player();
			game.ball = new Ball();

			game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
			game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		}

		setupStart();
		play();
	}
	function initializeWebSocket(match_id, playerId) {
		gameOwnerId = playerId;
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
				updateBall(playerId, eventData.data.x, eventData.data.y, eventData.data.score01, eventData.data.score02, eventData.data.status);
			}
		};

		function updateBall(player, x, y, score01, score02, status) {
			if (gameStarted && player == 2) {
				game.ball.x = x;
				game.ball.y = y;
				game.player.score = score01,
				game.challenger.score = score02
				gameStarted = status
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
			adversaireMatch.style.display = "block";
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
}
