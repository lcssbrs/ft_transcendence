'use strict';

var canvas;
var game;
var gameStarted = false;
const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
const PLAYER_SPEED = 10;
const BALL_SPEED = 14;
const MAX_SPEED = 14;

// Variable pour suivre le temps écoulé depuis le début du clignotement
let borderFlashTime = 0;
let borderFlashInterval = null;

// Fonction pour faire clignoter la bordure du canvas en rouge pendant 'duration' millisecondes
function flashBorder(duration) {
    let startTime = Date.now();
    borderFlashInterval = setInterval(function() {
        borderFlashTime = Date.now() - startTime;
        if (borderFlashTime < duration) {
            // Alterner la couleur de la bordure entre blanc et rouge
            canvas.style.border = (canvas.style.border === '2px solid white') ? '2px solid red' : '2px solid white';
        } else {
            // Arrêter le clignotement lorsque la durée est écoulée
            clearInterval(borderFlashInterval);
            canvas.style.border = '2px solid white'; // Rétablir la bordure à la couleur blanche
        }
    }, 50); // Alterner toutes les 500 millisecondes (0.5 seconde)
}

// Fonction pour lancer la partie après un compte à rebours
function startGameWithCountdown() {
    // Afficher le compte à rebours
    var countdown = 3;
    var countdownInterval = setInterval(function() {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'white';
        context.font = 'bold 40px Arial';
        context.fillText(countdown, canvas.width / 2 - 20, canvas.height / 2);
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            // Démarrer la partie une fois le compte à rebours terminé
            gameStarted = true;
            startGame();
        }
    }, 1000); // Compte à rebours de 1 seconde
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
    drawScore(); // Appel de la fonction pour dessiner le score
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
		// Déplacer le joueur 1 vers le haut
		game.player.y -= PLAYER_SPEED;
	} else if (event.key === 's' || event.key === 'S') {
		// Déplacer le joueur 1 vers le bas
		game.player.y += PLAYER_SPEED;
	}
	// Assurez-vous que la nouvelle position du joueur 1 ne dépasse pas les limites du canvas
	if (game.player.y < 0) {
		game.player.y = 0;
	} else if (game.player.y > canvas.height - PLAYER_HEIGHT) {
		game.player.y = canvas.height - PLAYER_HEIGHT;
	}
}

// deplacement joueur 2 (Flèches haut et bas)
function challengerMove(event) {
	if (event.key === 'ArrowUp') {
		// Déplacer le joueur 2 vers le haut
		game.challenger.y -= PLAYER_SPEED;
	} else if (event.key === 'ArrowDown') {
		// Déplacer le joueur 2 vers le bas
		game.challenger.y += PLAYER_SPEED;
	}
	// Assurez-vous que la nouvelle position du joueur 2 ne dépasse pas les limites du canvas
	if (game.challenger.y < 0) {
		game.challenger.y = 0;
	} else if (game.challenger.y > canvas.height - PLAYER_HEIGHT) {
		game.challenger.y = canvas.height - PLAYER_HEIGHT;
	}
}

//collisions
function collide(player) {
    // Vérifier si le joueur a raté la balle
    if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
        // Réinitialiser la position de la balle au centre
        game.ball.x = canvas.width / 2;
        game.ball.y = canvas.height / 2;
        // Réinitialiser les positions des joueurs au centre
        game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
        game.challenger.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
        // Réinitialiser la vitesse de la balle
        game.ball.speed.x = 2;
        if (player === game.player) {
            game.challenger.score++;
            flashBorder(1000);
        } else {
            game.player.score++;
            flashBorder(1000);
        }
        // Mettre à jour l'affichage du score
        updateScoreDisplay();
        // Vérifier si l'un des joueurs a atteint un score de 3
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
    // Effacer les anciens scores
    context.clearRect(0, 0, canvas.width, 50);
    // Dessiner les nouveaux scores
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
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = 'bold 40px Arial';
    context.fillText('Le gagnant est ' + winner + '!', canvas.width / 2 - 200, canvas.height / 2);

    // Arrêter d'écouter les événements de mouvement des joueurs
    document.removeEventListener('keydown', playerMove);
    document.removeEventListener('keydown', challengerMove);
    // Arrêter la balle
    game.ball.speed.x = 0;
    game.ball.speed.y = 0;
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
document.addEventListener('keydown', challengerMove); // Ajout de l'écouteur pour les mouvements du joueur 2


// Event sur le bouton de démarrage de la partie
document.getElementById('start-game').addEventListener('click', function() {
    if (!gameStarted) {
        startGameWithCountdown();
        gameStarted = true ;
    }
});
