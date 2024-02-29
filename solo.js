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
	game.computer.score = 0;
	game.ball.x = canvas.width / 2;
	game.ball.y = canvas.height / 2;
	game.ball.speed.x = 1;

	game.ball.speed.y = 1;

	displayWinner = false;

	document.addEventListener('keydown', playerMove);
	document.addEventListener('keydown', computerMove);

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
	context.fillText('Computer: ' + game.computer.score, canvas.width - 150, 40);
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
	context.fillRect(canvas.width - PLAYER_WIDTH, game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);
	context.beginPath();
	context.fillStyle = 'white';
	context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
	context.fill();
	drawScore();

	if (displayWinner) {
		context.fillStyle = 'red';
		context.font = 'bold 40px Arial';
		var winner = game.player.score === 3 ? "Joueur 1" : "Computer";
		context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2 - 250, canvas.height / 2 + 10);
	}
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

// IA ordi:
function computerMove() {
    // Calcul de la différence entre la position de l'ordinateur et celle de la balle
    var difference = game.ball.y - (game.computer.y + PLAYER_HEIGHT / 2);

    // Si la balle est au-dessus de la raquette de l'ordinateur, déplacer l'ordinateur vers le bas
    if (difference > 0) {
        game.computer.y += Math.min(PLAYER_SPEED, difference);
    }
    // Si la balle est en dessous de la raquette de l'ordinateur, déplacer l'ordinateur vers le haut
    else if (difference < 0) {
        game.computer.y -= Math.min(PLAYER_SPEED, Math.abs(difference));
    }

    // Limiter la position de l'ordinateur dans le terrain
    if (game.computer.y < 0) {
        game.computer.y = 0;
    } else if (game.computer.y > canvas.height - PLAYER_HEIGHT) {
        game.computer.y = canvas.height - PLAYER_HEIGHT;
    }

    // Simulation de l'ordinateur appuyant sur les touches
    // Pour que la vitesse de déplacement de l'ordinateur soit la même que celle du joueur,
    // nous ajustons la position de l'ordinateur selon la position actuelle de la balle
    var ballPosition = game.ball.y - (game.computer.y + PLAYER_HEIGHT / 2);
    if (ballPosition > 0) {
        game.computer.y += PLAYER_SPEED;
    } else if (ballPosition < 0) {
        game.computer.y -= PLAYER_SPEED;
    }
}


// Appel périodique de computerMove toutes les secondes
setInterval(computerMove, 1000);


//collisions
function collide(player) {
	if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
		game.ball.x = canvas.width / 2;
		game.ball.y = canvas.height / 2;
		game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		game.ball.speed.x = 2;
		if (player === game.player) {
			game.computer.score++;
			flashBorder(1000);
		} else {
			game.player.score++;
			flashBorder(1000);
		}
		updateScoreDisplay();
		if (game.player.score === 3 || game.computer.score === 3) {
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
	context.fillText('Computer: ' + game.computer.score, canvas.width - 150, 40);
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
// Fonction pour terminer la partie
function endGame() {
	gameStarted = false;
	var winner = game.player.score === 3 ? "Joueur 1" : "Computer";
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
	document.removeEventListener('keydown', computerMove);
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

// Event sur le bouton de démarrage de la partie
document.getElementById('start-game').addEventListener('click', function() {
	if (!gameStarted) {
		startGameWithCountdown();
	}
});
