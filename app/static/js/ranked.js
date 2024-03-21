function setupRanked() {
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

	setupStart();

	// Établir la connexion WebSocket
	const websocketURL = 'wss://localhost/ranked/'; // Remplacez YOUR_WEBSOCKET_URL par l'URL de votre serveur WebSocket
	const websocket = new WebSocket(websocketURL);

	// Gérer les événements WebSocket
	websocket.onopen = function() {
	  console.log('Connexion WebSocket établie.');
	  if (playerId === null) {
		playerId = 'left';
	  } else {
		playerId = 'right';
	  }
	};

	websocket.onclose = function(event) {
	  console.log('Connexion WebSocket fermée.');
	};

	websocket.onerror = function(error) {
	  console.error('Erreur WebSocket :', error);
	};

	websocket.onmessage = function(event) {
	  const message = JSON.parse(event.data);
	  if (message.type === 'game_update') {
		// Traitez les données de mise à jour du jeu
		const gameUpdate = message.data;
		// Mettez à jour l'état du jeu en fonction des données reçues
		game.ball.x = gameUpdate.ball_x;
		game.ball.y = gameUpdate.ball_y;
		game.player.y = gameUpdate.paddle1_y;
		game.opponent.y = gameUpdate.paddle2_y;
		game.player.score = gameUpdate.player1_score;
		game.opponent.score = gameUpdate.player2_score;
		// Redessinez le jeu avec les nouvelles données
		draw();
	  }
	};

	function getPlayerPalette() {
		if (playerId === 'left') {
		  return game.player; // Le premier joueur connecté contrôle la palette de gauche
		} else {
		  return game.opponent; // Le deuxième joueur connecté contrôle la palette de droite
		}
	  }

	// Envoyer les mouvements du joueur au serveur via WebSocket
	function sendPlayerMovement(y) {
		const movement = {
		  type: 'game_update',
		  data: {
			playerId: playerId, // Utilisez la variable playerId mise à jour
			paddle_y: y
		  }
		};
		websocket.send(JSON.stringify(movement));
	  }

	// Gérer les mouvements de l'adversaire reçus du serveur
	function handleOpponentMovement(movement) {
	  if (movement.playerId !== playerId) { // Vérifiez si le mouvement provient de l'adversaire
		game.opponent.y = movement.paddle_y;
	  }
	}

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
	  game.player.score = 0;
	  game.opponent.score = 0;
	  game.ball.x = canvas.width / 2;
	  game.ball.y = canvas.height / 2;
	  game.ball.speed.x = 1;
	  game.ball.speed.y = 1;
	  displayWinner = false;

	  document.addEventListener('keydown', playerMove);

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
		  gameStarted = true;
		  startGame();
		}
	  }, 1000);
	}

	// Dessiner le score
	function drawScore() {
	  var context = canvas.getContext('2d');
	  context.fillStyle = 'white';
	  context.font = canvas.width / 20 + 'px Anta';
	  context.textAlign = 'center';
	  context.textBaseline = 'middle';
	  context.fillText(game.player.score, canvas.width / 4, canvas.height / 6);
	  context.fillText(game.opponent.score, canvas.width - canvas.width / 4, canvas.height / 6);
	}

	// Dessin du terrain et des éléments du jeu
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
	  context.fillRect(canvas.width - PLAYER_WIDTH, game.opponent.y, PLAYER_WIDTH, PLAYER_HEIGHT);
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
		var winner = game.player.score === 3 ? "Joueur 1" : "opponent";
		context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2, canvas.height / 2);
	  }
	}

	// Fonction pour jouer le jeu (à appeler dans une boucle de jeu)
	function play() {
	  ballMove();
	  draw();
	  requestAnimationFrame(play);
	}

	// Gérer les mouvements de la balle
	function ballMove() {
	  // Rebonds sur le haut et bas
	  if (game.ball.y > canvas.height || game.ball.y < 0) {
		game.ball.speed.y *= -1;
	  }
	  if (game.ball.x > canvas.width - PLAYER_WIDTH) {
		collide(game.opponent);
	  } else if (game.ball.x < PLAYER_WIDTH) {
		collide(game.player);
	  }
	  game.ball.x += game.ball.speed.x;
	  game.ball.y += game.ball.speed.y;
	}

	// Mouvement du joueur
	function playerMove(event) {
	  const player = getPlayerPalette();

	  // Déterminer l'adversaire
	  const opponent = (player === game.player) ? game.opponent : game.player;

	  // Déplacer la palette du joueur avec les touches W et S
	  if (event.key === 'w' || event.key === 'W') {
		player.y -= PLAYER_SPEED;
	  } else if (event.key === 's' || event.key === 'S') {
		player.y += PLAYER_SPEED;
	  }

	  // Limiter le mouvement de la palette dans les limites du canvas
	  if (player.y < 0) {
		player.y = 0;
	  } else if (player.y > canvas.height - PLAYER_HEIGHT) {
		player.y = canvas.height - PLAYER_HEIGHT;
	  }

	  // Envoyer les informations de mouvement de la palette à l'adversaire via WebSocket
	  sendPlayerMovement(player.y);
	}

	// Gérer les collisions
	function collide(player) {
	  if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
		game.ball.x = canvas.width / 2;
		game.ball.y = canvas.height / 2;
		game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		game.opponent.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
		game.ball.speed.x = 2;
		if (player === game.player) {
		  game.opponent.score++;
		  flashBorder(1000);
		} else {
		  game.player.score++;
		  flashBorder(1000);
		}
		updateScoreDisplay();
		if (game.player.score === 3 || game.opponent.score === 3) {
		  endGame();
		}
	  } else {
		game.ball.speed.x *= -BALL_SPEED;
		if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
		  game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
		}
	  }
	}

	// Mettre à jour l'affichage du score
	function updateScoreDisplay() {
	  var context = canvas.getContext('2d');
	  context.fillStyle = 'white';
	  context.font = canvas.width / 20 + 'px Anta';
	  context.textAlign = 'center';
	  context.textBaseline = 'middle';
	  context.fillText(game.player.score, canvas.width / 4, canvas.height / 6);
	  context.fillText(game.opponent.score, canvas.width - canvas.width / 4, canvas.height / 6);
	}

	// Démarrer le jeu
	function startGame() {
	  // gameStarted = true;
	  game.player.score = 0;
	  game.opponent.score = 0;
	  updateScoreDisplay();
	  play();
	}

	// Terminer la partie
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

	// Supprimer les écouteurs d'événements clavier
	function removeKeyListeners() {
	  document.removeEventListener('keydown', playerMove);
	}

	// Dessins et animations
	function setupStart() {
	  canvas = document.getElementById('canvas1');
	  game = {
		player: {
		  y: canvas.height / 2 - PLAYER_HEIGHT / 2,
		  score: 0
		},
		opponent: {
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
	  };
	  draw();

	  fetch('/connected-users/')  // Assurez-vous d'utiliser le bon chemin d'accès pour votre application
	  .then(response => response.json())
	  .then(data => {
	    // Traitez les données renvoyées par le serveur
	    const connectedUsers = data.user_names;
	    // Vous pouvez maintenant utiliser les noms des utilisateurs connectés
	  })
	  .catch(error => {
	    console.error('Erreur lors de la récupération des utilisateurs connectés :', error);
	  });
	}

	// Écouter les événements sur le bouton de démarrage de la partie
	document.getElementById('start-ranked').addEventListener('click', function() {
	  if (!gameStarted) {
		startGameWithCountdown();
	  }
	});

	// Écouter les événements clavier pour le mouvement du joueur
	document.addEventListener('keydown', playerMove);

	// Gérer les mouvements de l'adversaire reçus du serveur
	websocket.onmessage = function(event) {
	  const message = JSON.parse(event.data);
	  if (message.type === 'game_update') {
		handleOpponentMovement(message.data);
	  }
	};
  }
