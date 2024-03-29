function setupRanked() {
	var game;
	var socket;
	var winner;
	var playerName;
	var challengerName;
	var match_id;

	let gameStarted = false;
	let canvas;
	let context;
	let disconnect_ennemy = false;
	let displayWinner = false;
	let player;

	const PLAYER_HEIGHT = 100;
	const PLAYER_WIDTH = 5;
	const PLAYER_SPEED = 10;
	const BALL_SPEED = 1.2;
	const MAX_SPEED = 14;

	canvas = document.getElementById('canvas3');
	game = {
		player: {
			y: canvas.height / 2 - PLAYER_HEIGHT / 2,
			score: 0
		},
		challenger: {
			y: canvas.height / 2 - PLAYER_HEIGHT / 2,
			score: 0,
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

	function launchGame() {
		document.addEventListener('keydown', function(event) {
			if (gameStarted) {
				if (player == 1) {
					if (event.key === 'w' || event.key === 'W' || event.key === 'z' || event.key === 'Z') {
						game.player.y -= PLAYER_SPEED;
					} else if (event.key === 's' || event.key === 'S') {

						game.player.y += PLAYER_SPEED;
					}
					if (game.player.y < 0) {
						game.player.y = 0;
					} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
						game.player.y = canvas.height - PLAYER_HEIGHT;
					}
					sendGameMove(player, game.player.y);
				} else if (player == 2) {
					if (event.key === 'w' || event.key === 'W' || event.key === 'z' || event.key === 'Z') {
						game.challenger.y -= PLAYER_SPEED;
					} else if (event.key === 's' || event.key === 'S') {
						game.challenger.y += PLAYER_SPEED;
					}
					if (game.challenger.y < 0) {
						game.challenger.y = 0;
					} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
						game.challenger.y = canvas.height - PLAYER_HEIGHT;
					}
					sendGameMove(player, game.challenger.y);
				}
			}
		});

		startGameWithCountdown();

		function startGameWithCountdown() {
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
					clearInterval(countdownInterval);
					startGame();
				}
			}, 1000);
		}

		function startGame() {
			if (player == 1) {
				game.ball.speed.x = Math.random() < 0.5 ? 1 : -1;
				game.ball.speed.y = Math.random() < 0.5 ? 1 : -1;
			}
			drawScore();
			play();
		}

		function play() {
			draw();
			console.log('player:', player);
			if (player == 1) {
				ballMove();
			}
			else {
				if (game.ball.x > canvas.width - PLAYER_WIDTH) {
					checkScored(game.challenger);
				} else if (game.ball.x < PLAYER_WIDTH) {
					checkScored(game.player);
				}
			}
			requestAnimationFrame(play);
		}

		function checkScored(checkPlayer) {
			if (game.ball.y < checkPlayer.y || game.ball.y > checkPlayer.y + PLAYER_HEIGHT) {
                if (checkPlayer == game.player) {
                    game.challenger.score++;
                } else {
                    game.player.score++;
                }
                drawScore();
                if (game.player.score == 3 || game.challenger.score == 3) {
                    endGame();
                }
            }
		}

		function ballMove() {
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

            sendBallMove(game.ball.x, game.ball.y);
        }

		function collide(checkPlayer) {
            if (game.ball.y < checkPlayer.y || game.ball.y > checkPlayer.y + PLAYER_HEIGHT) {
                game.ball.x = canvas.width / 2;
                game.ball.y = canvas.height / 2;
                game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
                game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
                game.ball.speed.x = 2;
                if (checkPlayer === game.player) {
                    game.challenger.score++;
                } else {
                    game.player.score++;
                }
                drawScore();
                if (game.player.score === 3 || game.challenger.score === 3) {
                    endGame();
                }
            } else {
                game.ball.speed.x *= -BALL_SPEED;
                if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
                    game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
                }
            }
        }
	}

	function endGame() {
		gameStarted = false;
		winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
		if (game.player.score > game.challenger.score)
			endGameApi(match_id, game.player.score, game.challenger.score, 1);
		else
			endGameApi(match_id, game.player.score, game.challenger.score, 2);
		displayWinner = true;

		setTimeout(function() {
			displayWinner = false;
			loadView('/ranked/', true, false)
		}, 3000);

		game.ball.speed.x = 0;
		game.ball.speed.y = 0;
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
			winner = game.player.score === 3 ? playerName : challengerName;
			context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2, canvas.height / 2);
		}
	}

	function updateBall(x, y) {
		game.ball.x = x;
		game.ball.y = y;
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
		startButton.classList.add("d-none");
		searchingMatch.classList.remove("d-none");
		fetch('/api/join-match/', {
				method: 'POST'
			})
			.then(response => response.json())
			.then(data => {
				if (data.match_exists) {
					console.log("Match trouvé [", data.match_data.id, "]");
					match_id = data.match_data.id;
					player = 2;
					initializeWebSocket(match_id);
				} else {
					console.log("Nouvelle partie créée [", data.match_data.id, "]");
					match_id = data.match_data.id;
					player = 1;
					initializeWebSocket(match_id);
				}
			})
			.catch(error => console.error('Erreur avec la connexion en base de données', error));
	});

	function initializeWebSocket(match_id) {
		socket = new WebSocket(`ws://localhost:8000/ws/match/${match_id}/`);
		socket.onopen = function() {
			console.log("Websocket ouvert");
		};

		socket.onmessage = function(event) {
			const eventData = JSON.parse(event.data);
			if (eventData.type == 'game_move') {
				const playerData = eventData.data;
				if (playerData.player != player) {
					updateOpponentPad(playerData.y);
				}
			}
			if (eventData.type == 'ball_move') {
				updateBall(eventData.x, eventData.y);
			}
			if (eventData.type == 'game_start' && gameStarted == false) {
				searchingMatch.classList.add("d-none");
				gameStarted = true;
				launchGame();
			}

			if (eventData.type === 'disconnect_message') {
				disconnect_ennemy = true;
				closeWebSocket();
			}
		}
	};

	function sendBallMove(x, y) {
		if (gameStarted) {
			const moveData = {
				type: 'ball_move',
				x: x,
				y: y
			};
			socket.send(JSON.stringify(moveData));
		}
	}

	function sendGameMove(FromPlayer, y) {
		if (gameStarted) {
			const moveData = {
				type: 'game_move',
				player: FromPlayer,
				y: y
			};
			socket.send(JSON.stringify(moveData));
		}
	}

	function updateOpponentPad(y) {
		if (player === 1) {
			game.challenger.y = y;
		} else {
			game.player.y = y;
		}
	}

	function closeWebSocket() {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({
				type: 'disconnect_message',
				message: 'Disconnecting now...',
			}));
		}
	}
}
