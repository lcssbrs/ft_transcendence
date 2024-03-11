'use strict';

var canvas;
var game;
var gameStarted = false;
const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
const PLAYER_SPEED = 10;
const BALL_SPEED = 1.2;
const MAX_SPEED = 14;
let displayWinner = false;
let borderFlashTime = 0;
let borderFlashInterval = null;

// //websockets

// const socket = new WebSocket('wss://http://localhost:5500/pong.html'); // Remplacez l'URL par l'adresse de votre serveur WebSocket

// // Gérer l'ouverture de la connexion
// socket.addEventListener('open', function (event) {
// 	console.log('Connexion établie');
// });

// // Gérer les messages entrants du serveur
// socket.addEventListener('message', function (event) {
// 	console.log('Message du serveur : ', event.data);
// });

// // Gérer les erreurs de connexion
// socket.addEventListener('error', function (event) {
// 	console.error('Erreur de connexion : ', event);
// });

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

socket.send('Position du joueur : (game.player.y)');
socket.send('Position de la balle : (game.ball.x, game.ball.y)');
socket.send('Vitesse de la balle : (BALL_SPEED)');

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
		context.fillStyle = 'orange';
		context.font = 'bold 300px Arial';
		context.fillText(countdown, canvas.width / 2 - 80, canvas.height / 2 + 105);
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
	context.font = 'bold 20px Arial';
	context.fillText('Joueur 1: ' + game.player.score, 20, 40);
	context.fillText('Joueur 2: ' + game.challenger.score, canvas.width - 150, 40);
}

//Mise en place du terrain :
function draw() {
	var context = canvas.getContext('2d');
	context.fillStyle = 'blue';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.strokeStyle = 'white';
	context.beginPath();
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height);
	context.stroke();
	context.strokeStyle = 'white';
	context.lineWidth = 2;
	context.strokeRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = 'red';
	context.fillRect(0, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
	context.fillRect(canvas.width - PLAYER_WIDTH, game.challenger.y, PLAYER_WIDTH, PLAYER_HEIGHT);
	context.beginPath();
	context.fillStyle = 'white';
	context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
	context.fill();
	drawScore();

	if (displayWinner) {
		context.fillStyle = 'red';
		context.font = 'bold 40px Arial';
		var winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
		context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2 - 250, canvas.height / 2 + 10);
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

// deplacement joueur 1 (W et S)
function playerMove(event) {
	if (event.key === 'w' || event.key === 'W') {
		game.player.y -= PLAYER_SPEED;
	} else if (event.key === 's' || event.key === 'S') {
		game.player.y += PLAYER_SPEED;
	}
	if (game.player.y < 0) {
		game.player.y = 0;
	} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
		game.player.y = canvas.height - PLAYER_HEIGHT;
	}
}

// deplacement joueur 2 (Flèches haut et bas)
function challengerMove(event) {
	if (event.key === 'ArrowUp') {
		game.challenger.y -= PLAYER_SPEED;
	} else if (event.key === 'ArrowDown') {
		game.challenger.y += PLAYER_SPEED;
	}
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
	context.clearRect(0, 0, canvas.width, 50);
	context.fillStyle = 'white';
	context.font = 'bold 20px Arial';
	context.fillText('Joueur 1: ' + game.player.score, 20, 40);
	context.fillText('Joueur 2: ' + game.challenger.score, canvas.width - 150, 40);
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
	var winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
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
document.addEventListener('DOMContentLoaded', function () {
	canvas = document.getElementById('canvas');
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
});

// Event sur le clavier
document.addEventListener('keydown', playerMove);
document.addEventListener('keydown', challengerMove);

// Event sur le bouton de démarrage de la partie
document.getElementById('start-game').addEventListener('click', function() {
	if (!gameStarted) {
		startGameWithCountdown();
	}
});
