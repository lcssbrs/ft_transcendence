function setupRanked() {

	var game;
	var canvas;
	var winner
	let gameEnd = false
	var playerName;
	var adverseName;
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
				winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
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
					flashBorder(1000);
				} else {
					game.player.score++;
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
			displayWinner = true;

			setTimeout(function() {
				displayWinner = false;
				location.reload();
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
		let socket = null;
		let gameStarted = false;

		startButton.addEventListener("click", function() {
			startButton.style.display = "none";
			searchingMatch.style.display = "block";

			fetch('/api/join-match/', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.match_data);
            if (data.match_exists) {
                console.log("Match trouvé [", data.match_data.id, "]");
                const match_id = data.match_data.id;
                const playerId = 2;
                initializeWebSocket(match_id, playerId);
            } else {
                console.log("Nouvelle partie créée [", data.match_data.id, "]");
                const match_id = data.match_data.id;
                const playerId = 1;
                initializeWebSocket(match_id, playerId);
            }
        })
        .catch(error => console.error('Erreur avec la connexion en base de données', error));
    });

    function initializeWebSocket(match_id, playerId) {
		const socket = new WebSocket(`ws://localhost:8000/ws/match/${match_id}/`);

		socket.onopen = function() {
			console.log("Websocket ouvert");
		};

		socket.onmessage = function(event) {
			const eventData = JSON.parse(event.data);
			if (eventData.type === 'game_start')
			{
				gameStarted = true;
				displayGame();
			}
			if (eventData.type === 'game_update')
			{
				const playerData = eventData.data;
				if (playerData.player !== playerId) {
					updateOpponentPad(playerData.direction);
				}
			}
			if (gameEnd === true) {
				console.log("fin de jeu");
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

			console.log("WebSocket déconnecté");
		};

		function displayGame() {
			launchGame();
		}
	}
}

// TODO traiter la fin de jeu, nom d'affichage sur l'écran
// TODO base de données gérer les parties finies, points lors d'un but, ajout des stats, ect..
// TODO gérer les déconnexion en match
// TODO gérer si l'utilisateur crée un match et se déconnecte alors que personne à rejoint \
// TODO (next) TODO empêcher un joueur de pouvoir s'y connecter
