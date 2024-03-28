// Définition de la classe Game
class Game {
	constructor() {
		this.player = null;
		this.challenger = null;
		this.ball = null;
	}
}

// Définition de la classe Player
class Player {
	constructor() {
		this.y = 0;
		this.score = 0;
	}
}

// Définition de la classe Ball
class Ball {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.r = 10;
		this.speed = {
			x: 0,
			y: 0
		};
	}
}

// Fonction pour configurer et lancer une partie classée pour le joueur
function setupRanked() {
	let game;
	let canvas;
	let winner;
	let gameEnd = false;
	let gameOwnerId;
	let ID_ranked;
	let playerName;
	let adverseName;
	let playerScore = 0;
	let adverseScore = 0;
	let disconnect_ennemy = false;

	function launchPlayerGame() {
		let gameStarted = false;
		const PLAYER_HEIGHT = 100;
		const PLAYER_WIDTH = 5;
		const PLAYER_SPEED = 10;
		const BALL_SPEED = 1.2;
		const MAX_SPEED = 14;
		let displayWinner = false;
		let borderFlashTime = 0;
		let borderFlashInterval = null;

		// Fonction pour flasher la bordure du canvas lorsqu'un but est marqué
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

		// Fonction pour démarrer le jeu après un compte à rebours
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

			let countdown = 3;
			let countdownInterval = setInterval(function() {
				let context = canvas.getContext('2d');
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

		// Fonction pour dessiner les scores des joueurs
		function drawScore() {
			let context = canvas.getContext('2d');
			context.fillStyle = 'white';
			context.font = canvas.width / 20 + 'px Anta';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(game.player.score, canvas.width / 4, canvas.height / 6);
			context.fillText(game.challenger.score, canvas.width - canvas.width / 4, canvas.height / 6);
		}

		// Fonction pour dessiner les éléments du jeu (terrain, joueurs, balle, scores)
		function draw() {
			let context = canvas.getContext('2d');
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
		}

		// Fonction pour déplacer le joueur
		function playerMove(event) {
			if (event.key === 'ArrowDown' && game.player.y < canvas.height - PLAYER_HEIGHT) {
				game.player.y += PLAYER_SPEED;
			} else if (event.key === 'ArrowUp' && game.player.y > 0) {
				game.player.y -= PLAYER_SPEED;
			}
		}

		// Fonction pour déplacer le challenger (adverse)
		function challengerMove(event) {
			if (event.key === 's' && game.challenger.y < canvas.height - PLAYER_HEIGHT) {
				game.challenger.y += PLAYER_SPEED;
			} else if (event.key === 'w' && game.challenger.y > 0) {
				game.challenger.y -= PLAYER_SPEED;
			}
		}

		// Fonction pour détecter les collisions de la balle avec les joueurs et les bords du terrain
		function detectCollisions() {
			if (
				game.ball.x + game.ball.speed.x > canvas.width - PLAYER_WIDTH &&
				game.ball.y > game.challenger.y &&
				game.ball.y < game.challenger.y + PLAYER_HEIGHT
			) {
				game.ball.speed.x = -game.ball.speed.x * BALL_SPEED;
			} else if (
				game.ball.x + game.ball.speed.x < PLAYER_WIDTH &&
				game.ball.y > game.player.y &&
				game.ball.y < game.player.y + PLAYER_HEIGHT
			) {
				game.ball.speed.x = -game.ball.speed.x * BALL_SPEED;
			} else if (game.ball.y + game.ball.speed.y > canvas.height || game.ball.y + game.ball.speed.y < 0) {
				game.ball.speed.y = -game.ball.speed.y;
			}

			if (game.ball.x > canvas.width) {
				game.player.score++;
				if (game.player.score >= 10) {
					winner = game.player;
					gameEnd = true;
					displayWinner = true;
				} else {
					flashBorder(1000);
					startGameWithCountdown();
				}
			} else if (game.ball.x < 0) {
				game.challenger.score++;
				if (game.challenger.score >= 10) {
					winner = game.challenger;
					gameEnd = true;
					displayWinner = true;
				} else {
					flashBorder(1000);
					startGameWithCountdown();
				}
			}
		}

		// Fonction pour déplacer la balle
		function moveBall() {
			game.ball.x += game.ball.speed.x * BALL_SPEED;
			game.ball.y += game.ball.speed.y * BALL_SPEED;
		}

		// Fonction pour lancer le jeu
		function startGame() {
			let context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			draw();
			document.removeEventListener('keydown', playerMove);
			document.removeEventListener('keydown', challengerMove);
			requestAnimationFrame(gameLoop);
		}

		// Fonction pour boucler le jeu
		function gameLoop() {
			let context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			draw();
			moveBall();
			detectCollisions();
			if (!gameEnd) {
				requestAnimationFrame(gameLoop);
			} else {
				if (displayWinner) {
					alert(`Game Over! ${winner === game.player ? "You" : "Opponent"} win!`);
					gameEnd = false;
					displayWinner = false;
				}
			}
		}

		// Initialisation du jeu
		canvas = document.getElementById('gameCanvas');
		canvas.width = 800;
		canvas.height = 600;
		game = new Game();
		game.player = new Player();
		game.challenger = new Player();
		game.ball = new Ball();
		startGameWithCountdown();
	}

	launchPlayerGame();
}

// Lancement du jeu classé
setupRanked();
