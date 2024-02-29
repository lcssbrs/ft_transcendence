'use strict';

var canvas;
var game;
// var gameStarted = false;
const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
const PLAYER_SPEED = 10;
const BALL_SPEED = 14;
const MAX_SPEED = 14;

//Mise en place du terrain :
function draw() {
	var context = canvas.getContext('2d');
	// Dessin terrain:
	context.fillStyle = 'blue';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Dessin ligne mediane:
	context.strokeStyle = 'white';
	context.beginPath();
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height);
	context.stroke();

	// Dessin contour terrain
	context.strokeStyle = 'white';
	context.lineWidth = 2; // Adjust line width as needed
	context.strokeRect(0, 0, canvas.width, canvas.height);

	// Dessin joueurs
	context.fillStyle = 'red';
	context.fillRect(0, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
	context.fillRect(canvas.width - PLAYER_WIDTH, game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);

	// Dessin ballon
	context.beginPath();
	context.fillStyle = 'white';
	context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
	context.fill();
}

//mouvements de la balle :
function play() {
	draw();
	computerMove();
	ballMove();

	requestAnimationFrame(play);
}

function ballMove() {
	// Rebonds sur le haut et bas
	if (game.ball.y > canvas.height || game.ball.y < 0) {
		game.ball.speed.y *= -1;
	}
	if (game.ball.x > canvas.width - PLAYER_WIDTH) {
		collide(game.computer);
	} else if (game.ball.x < PLAYER_WIDTH) {
		collide(game.player);
	}
	game.ball.x += game.ball.speed.x;
	game.ball.y += game.ball.speed.y;
}

// deplacement joueur
function playerMove(event) {
	if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S')
	{
		var newPlayerY = game.player.y;
		if (event.key === 'w' || event.key === 'W') {
			newPlayerY -= PLAYER_SPEED;
		} else if (event.key === 's' || event.key === 'S') {
			newPlayerY += PLAYER_SPEED;
		}
		// Vérifier si la nouvelle position dépasse les limites du canvas
		if (newPlayerY < 0) {
			game.player.y = 0;
		} else if (newPlayerY > canvas.height - PLAYER_HEIGHT) {
			game.player.y = canvas.height - PLAYER_HEIGHT;
		} else {
			game.player.y = newPlayerY;
		}
	}
}

// IA ordi:
function computerMove() {
	// Calcul de la différence entre la position de l'ordinateur et celle de la balle
	var difference = game.ball.y - game.computer.y - PLAYER_HEIGHT / 2;

	if (difference > 0) {
		game.computer.y += Math.min(PLAYER_SPEED, difference);
	} else if (difference < 0) {
		game.computer.y -= Math.min(PLAYER_SPEED, Math.abs(difference));
	}

	if (game.computer.y < 0) {
		game.computer.y = 0;
	} else if (game.computer.y > canvas.height - PLAYER_HEIGHT) {
		game.computer.y = canvas.height - PLAYER_HEIGHT;
	}
}

//collisions
function collide(player) {
	// joueur rate la balle
	if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT)
	{
		game.ball.x = canvas.width / 2;
		game.ball.y = canvas.height / 2;
		game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		game.ball.speed.x = 2;
		game.computer.score++;
		updateScoreDisplay();
		// Vérifier si l'un des joueurs a atteint un score de 3
		if (game.player.score === 3 || game.computer.score === 3)
			endGame();
	} else {
		// vitesse augmente et rebond
		game.ball.speed.x *= -BALL_SPEED;
		// Limiter la vitesse max de la balle
		if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
			game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
		}
	}
}

// scorboard update
function updateScoreDisplay() {
	document.getElementById('player1-score').textContent = game.player.score;
	document.getElementById('player2-score').textContent = game.computer.score;
}

// lancer une game
function startGame() {
	// gameStarted = true;
	game.player.score = 0;
	game.computer.score = 0;
	updateScoreDisplay();
	play();
}


// Fonction pour terminer la partie
function endGame() {
    gameStarted = false;
    var winner = game.player.score === 3 ? "Joueur 1" : "Joueur 2";
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = 'bold 40px Arial';
    context.fillText('Le gagnant est ' + winner + '!', canvas.width / 2 - 200, canvas.height / 2);

    // Attendre que la partie soit redémarrée pour réinitialiser les éléments
    document.getElementById('start-game').addEventListener('click', function() {
        if (!gameStarted) {
            game.ball.x = canvas.width / 2;
            game.ball.y = canvas.height / 2;
            game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
            game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
            game.ball.speed.x = 2;
            game.player.score = 0;
            game.computer.score = 0;
            updateScoreDisplay();
            play();
        }
    });
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
		computer: {
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

// event start button
document.getElementById('start-game').addEventListener('click', startGame);
