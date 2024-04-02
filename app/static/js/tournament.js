function closeWebSocket(socket) {
	if (socket) {
		socket.close();
		console.log("Connexion WebSocket fermée");
		socket = null;
	}
}

var tournament_id;

//-----------------------------------------\/
//------------------PONG-------------------\/
//-----------------------------------------\/

var game;
var canvas;
canvas = document.getElementById('canvas4');

let gameStarted = false;

function setupMatch(match_id, playerMatchId, userPlayerId, adversePlayerId, socket, final, callback) {
	var winner
	let gameOwnerId;
	var ID_ranked;
	var playerName;
	var adverseName;
	var playerScore = 0;
	var adverseScore = 0;
	let disconnect_ennemy = false
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
				playerScore = game.player.score;
				adverseScore = game.challenger.score;
				winner = game.player.score === 3 ? playerName : adverseName;
				context.fillText('Le gagnant est ' + winner + ' !', canvas.width / 2, canvas.height / 2);
			}
		}

		//mouvements de la balle :
		function play() {
			if (gameStarted == false)
				return ;
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
					gameStarted = false;
					endGame();
				}
			} else {
				if (gameOwnerId == 1)
				{
					game.ball.speed.x *= -BALL_SPEED;
					if (Math.abs(game.ball.speed.x) > MAX_SPEED) {
						game.ball.speed.x = Math.sign(game.ball.speed.x) * MAX_SPEED;
					}
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
			if (playerMatchId === 1)
			{
				if (playerScore > adverseScore) {
					if (final)
						endTournamentApi(userPlayerId);
					endGameApi(ID_ranked, playerScore, adverseScore, userPlayerId);
				}
				else {
					if (final)
						endTournamentApi(adversePlayerId);
					endGameApi(ID_ranked, playerScore, adverseScore, adversePlayerId);
				}
				sendEndGame();
			}
			else
			{
				if (playerScore > adverseScore) {
					if (final)
						endTournamentApi(userPlayerId);
					endGameApi(ID_ranked, playerScore, adverseScore, adversePlayerId);
				}
				else {
					if (final)
						endTournamentApi(adversePlayerId);
					endGameApi(ID_ranked, playerScore, adverseScore, userPlayerId);
				}
			}
			displayWinner = true;


			setTimeout(function() {
				displayWinner = false;
				closeWebSocket(socket);
				console.log('wsh');
				if (final) {
					showFinalCard();
				}
				else if (callback && typeof callback === 'function') {
					callback();
				}
			}, 3000);

			removeKeyListeners();

			// AH

			game.ball.speed.x = 0;
			game.ball.speed.y = 0;
		}

		function removeKeyListeners() {
			document.removeEventListener('keydown', playerMove);
			document.removeEventListener('keydown', challengerMove);
		}

		//----------------EVENTS LISTENERS--------

		// Dessins et animations

		setupStart();

		function setupStart() {
			if (final)
				document.querySelector('#canvas4').classList.remove("d-none");
			game = {
				player: {
					y: canvas.height / 2 - 100 / 2,
					score: 0
				},
				challenger: {
					y: canvas.height / 2 - 100 / 2,
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

		document.addEventListener('keydown', playerMove);
		document.addEventListener('keydown', challengerMove);
	}

		//-----------------------------------------\/
		//----------------WEBSOCKET----------------\/
		//-----------------------------------------\/

	if (final)
		var startMatch = document.getElementById("start-finale");
	else
		var startMatch = document.getElementById("start-match");

	// const waitingMatch = document.getElementById("waiting-match");
	const adversaireMatch = document.getElementById("adversaire-match");

	function GetPlayerId(my_match_id) {
		fetch(`/api/match/${my_match_id}/`, {
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

	function endGameApi(my_match_id, score_01, score_02, winner) {
		const requestBody = {
			score_player1: score_01,
			score_player2: score_02,
			player_winner: winner,
			status: "end_game"
		};

		fetch(`/api/match/${my_match_id}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		})
		.then(response => {})
		.catch(error => console.error('Erreur lors de la connexion à la base de données :', error));
	}

	function endTournamentApi(winner) {
		console.log(tournament_id);
		console.log(winner);
		const requestBody = {
			player_winner: winner,
			status: "end_game"
		};

		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestBody)
		})
		.then(response => {})
		.catch(error => console.error('Erreur lors de la connexion à la base de données :', error));
	}

	function showFinalCard() {
		console.log('show final card');
		let winner = null;
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			console.log(data.player_winner);
			winner = data.player_winner;
			console.log(winner);
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
		if (winner == null)
			setTimeout(showFinalCard, 3000);
		else {
			console.log('hi !!!');
			document.querySelector('#canvas4').classList.add("d-none");
			document.querySelector('#winner').innerHTML = winner.username + '! 🏆';
			document.querySelector('#winner-profile-picture').src = winner.profile_picture.url;
			document.querySelector('#winnercard').classList.remove("d-none");
		}
	}

	function sendEndGame() {
		var segments = socket.url.split("/");
		var lastSegment = segments[segments.length - 2];
		if (lastSegment != match_id)
			return ;
		if (gameStarted) {
			const moveData = {
				type: 'end_game',
			};
			socket.send(JSON.stringify(moveData));
		}
	}

	function quitGameApi(my_match_id, score_01, score_02) {
		const requestBody = {
			score_player1: score_01,
			score_player2: score_02,
			status: "cancel"
		};

		fetch(`/api/match/${my_match_id}/`, {
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
						adverseName = data[1].username;
					})
					.catch(error => console.error("Erreur lors de la récupération des données :", error));
			})
			.catch(error => console.error("Erreur lors de la requête API :", error));
	}

	startMatch.addEventListener("click", function() {
		startMatch.classList.add("d-none");

		if (playerMatchId == 1)
			initializeWebSocket(1);
		else
			initializeWebSocket(2);
	});

	function initializeWebSocket(playerId) {
		gameOwnerId = playerId;
		socket = null;
		socket = new WebSocket(`ws://localhost:8000/ws/tournament/${match_id}/`);

		socket.onopen = function() {
			ID_ranked = match_id;
			console.log("Websocket ouvert");
		};

		socket.onmessage = function(event) {
			const eventData = JSON.parse(event.data);
			if (eventData.type === 'game_start')
			{
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
				closeWebSocket(socket);
			}
			if (eventData.type === 'ball_move')
			{
				updateBall(playerId, eventData.data.x, eventData.data.y, eventData.data.score01, eventData.data.score02, eventData.data.status, eventData.data.vx, eventData.data.vy);
			}
			if (eventData.type === 'end_game')
			{
				disconnect_ennemy = false;
				gameStarted = false;
				closeWebSocket(socket);
			}
		};

		function updateBall(player, x, y, score01, score02, status, vx, vy) {
			if (gameStarted && player == 2) {
				game.ball.x = x;
				game.ball.y = y;
				if (score01 != game.player.score || score02 != game.challenger.score)
					game.challenger.y = canvas.height / 2 - 100 / 2,
				game.player.score = score01,
				game.challenger.score = score02
				gameStarted = status
				game.ball.speed.x = vx,
				game.ball.speed.y = vy
				if (score01 == 3 || score02 == 3)
					gameStarted = false;
			}
		}

		function sendGameMove(player, direction) {
			var segments = socket.url.split("/");
			var lastSegment = segments[segments.length - 2];
			if (lastSegment != match_id)
				return ;
			if (gameStarted && socket)
			{
				const moveData = {
					type: 'game_move',
					player: player,
					direction: direction
				};
				socket.send(JSON.stringify(moveData));
			}
		}

		function sendGameBall(player) {
			var segments = socket.url.split("/");
			var lastSegment = segments[segments.length - 2];
			if (lastSegment != match_id)
				return ;
			if (gameStarted == true && player == 1 && disconnect_ennemy == false && socket)
			{
				const moveData = {
					type: 'ball_move',
					x: game.ball.x,
					y: game.ball.y,
					score01: game.player.score,
					score02: game.challenger.score,
					status: gameStarted,
					vx: game.ball.speed.x,
					vy: game.ball.speed.y,
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
				game.challenger.y = direction;
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - 100) {
					game.challenger.y = canvas.height - 100;
				}
			}
			else
			{
				game.player.y = direction;
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
				game.challenger.y = direction;
				if (game.challenger.y < 0) {
					game.challenger.y = 0;
				} else if (game.challenger.y > canvas.height - 100) {
					game.challenger.y = canvas.height - 100;
				}
			}
			else
			{
				game.player.y = direction;
				if (game.player.y < 0) {
					game.player.y = 0;
				} else if (game.player.y > canvas.height - 100) {
					game.player.y = canvas.height - 100;
				}
			}
		}

		function PadMoove(event) {
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
		}

		document.addEventListener('keydown', PadMoove);

		function removeKeyListeners() {
			document.removeEventListener('keydown', PadMoove);
		}

		socket.onclose = function() {
			if (gameStarted == true && disconnect_ennemy == true)
			{
				if (playerId === 1)
					endGameApi(match_id, 4, adverseScore, userPlayerId);
				else
					endGameApi(match_id, playerScore, 4, userPlayerId);
			}
			if (playerId == 1 && disconnect_ennemy == false && gameStarted == false)
			{
				quitGameApi(match_id, 0, 0);
			}
			gameStarted = false;
			match_id = null;
			removeKeyListeners();
			console.log("WebSocket déconnecté");
			if (callback && typeof callback === 'function') {
				callback();
			}
		};

		function displayGame() {
			console.log("Match ID [", match_id, "]");
			launchGame();
		}

		document.addEventListener('click', function(event) {
			if (event.target.tagName === 'A') {
				closeWebSocket(socket);
			}
		});

		window.addEventListener('popstate', function(event) {
			if (window.location.pathname !== "/tournament") {
				closeWebSocket(socket);
			}
		});

		window.addEventListener('hashchange', function(event) {
			if (window.location.pathname !== "/tournament") {
				closeWebSocket(socket);
			}
		});
	}
}



function SetupTournament() {

	// TODO endTournament
	// TODO spectFinale

	let socket = null;

	var ID_Player1;
	var ID_Player2;
	var ID_Player3;
	var ID_Player4;
	var ID_players;

	var PlayerNames;

	var PlayerScoreMatch1P1;
	var PlayerScoreMatch1P2;

	var PlayerScoreMatch2P1;
	var PlayerScoreMatch2P2;

	var PlayerScoreFinalP1;
	var PlayerScoreFinalP2;

	var	my_id;
	var playerMatchId;

	var my_match_id;

	var match_final_id;
	var player_final_id01;
	var player_final_id02;

	let TournamentStart = false;
	let TournamentWaitingFinal = 0;

	//-----------------------------------------\/
	//-----------------ELEMENTS----------------\/
	//-----------------------------------------\/

	const startButton = document.getElementById("start-tournament");
	const searchingMatch = document.getElementById("searching-match");

	// Match
	const match1P1 = document.getElementById("d1");
	const match1P2 = document.getElementById("d2");
	const match2P1 = document.getElementById("d3");
	const match2P2 = document.getElementById("d4");

	const final1 = document.getElementById("f1");
	const final2 = document.getElementById("f2");

	// Score
	const scoreM1P1 = document.getElementById("s1");
	const scoreM1P2 = document.getElementById("s2");
	const scoreM2P1 = document.getElementById("s3");
	const scoreM2P2 = document.getElementById("s4");

	const scoreF1 = document.getElementById("sf1");
	const scoreF2 = document.getElementById("sf2");

	startButton.addEventListener("click", function() {
		startButton.style.display = "none";
		searchingMatch.style.display = "block";

		getTournamentId();
	});

	//-----------------------------------------\/
	//-------------------API-------------------\/
	//-----------------------------------------\/

	function getTournamentId() {
		fetch(`/api/create-tournament/`, {
			method: 'POST'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				tournament_id = data.id;
				console.log("Tournoi ID [", data.id, "]");
				getMyId();
			}
			else {
				console.log("Tournoi non trouvé");
			}
		})
	}

	function getMyId() {
		fetch(`/api/get_user/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				my_id = data.id;
			}
			else {
				console.log("Tournoi non trouvé");
			}
		})
	}

	async function getPlayerNames(playerIds) {
		const requests = [];
		playerIds.forEach(playerId => {
			if (playerId) {
				requests.push(
					fetch(`/api/users/${playerId}`)
					.then(response => response.json())
					.then(data => {
						return data.username;
					})
					.catch(error => {
						console.error("Erreur lors de la récupération du nom du joueur :", error);
						return null;
					})
				);
			}
		});
		const resolvedUsernames = await Promise.all(requests);

		PlayerNames = resolvedUsernames.filter(username => username !== null);
		return Promise.all(requests);
	}

	function getTournamentInfo() {
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				if (!ID_Player1)
					ID_Player1 = data.player01;
				if (!ID_Player2)
					ID_Player2 = data.player02;
				if (!ID_Player3)
					ID_Player3 = data.player03;
				if (!ID_Player4)
					ID_Player4 = data.player04;
				ID_players = [ID_Player1, ID_Player2, ID_Player3, ID_Player4];
				getPlayerNames(ID_players);
				if (data.final_id)
				{
					match_final_id = data.final_id;
				}
			}
			else {
				console.log("Erreur de connexion avec la base de données")
			}
		})
	}

	function getMyMatchId() {
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(response => response.json())
		.then(data => {
			if (data) {
				if (data.player01 === my_id || data.player02 === my_id)
				{
					my_match_id = data.match1_id;
				}
				else if (data.player03 === my_id || data.player04 === my_id) {
					my_match_id = data.match2_id;
				}
				if (data.player01 === my_id)
					playerMatchId = 1;
				else if (data.player02 === my_id)
					playerMatchId = 2;
				else if (data.player03 === my_id)
					playerMatchId = 1;
				else if (data.player04 === my_id)
					playerMatchId = 2;
			} else {
				console.log("Erreur de connexion avec la base de données");
			}
			initialGame();
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}

	function printNames() {
		if (PlayerNames)
		{
			if (PlayerNames[0])
				match1P1.textContent = PlayerNames[0];
			if (PlayerNames[1])
				match1P2.textContent = PlayerNames[1];
			if (PlayerNames[2])
				match2P1.textContent = PlayerNames[2];
			if (PlayerNames[3])
			{
				match2P2.textContent = PlayerNames[3];
				searchingMatch.style.display = "none";
				TournamentStart = true;
				getMyMatchId();
			}
		}
	}

	setInterval(function() {
		if (tournament_id && TournamentStart === false) {
			getTournamentInfo();
			printNames();
		}
	}, 1200);

	function setupRankedAndWaitingSecondGame(match_id, playerMatchId, my_id, id_adverse, socket, final) {
		setupMatch(match_id, playerMatchId, my_id, id_adverse, socket, final, function() {
			waitingSecondGame();
		});
	}

	function initialGame()
	{
		document.querySelector('#bracket').classList.add("d-none");
		document.querySelector('#canvas4').classList.remove("d-none");
		document.querySelector('#start-match').classList.remove("d-none");
		document.querySelector('#start-tournament').classList.add("d-none");
		if (my_id === ID_Player1)
		{
			setupRankedAndWaitingSecondGame(my_match_id, playerMatchId, my_id, ID_Player2, socket, false);
		}
		else if (my_id === ID_Player2)
		{
			setupRankedAndWaitingSecondGame(my_match_id, playerMatchId, my_id, ID_Player1, socket, false);
		}
		else if (my_id === ID_Player3)
		{
			setupRankedAndWaitingSecondGame(my_match_id, playerMatchId, my_id, ID_Player4, socket, false);
		}
		else if (my_id === ID_Player4)
		{
			setupRankedAndWaitingSecondGame(my_match_id, playerMatchId, my_id, ID_Player3, socket, false);
		}
	}


	function setupStart() {
		canvas = document.getElementById('canvas4');
		game = {
			player: {
				y: canvas.height / 2 - 100 / 2,
				score: 0
			},
			challenger: {
				y: canvas.height / 2 - 100 / 2,
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
	}

	var interval;
	var final_start = false;
	var end_loop = false;

	function waitingSecondGame() {
		document.querySelector('#bracket').classList.remove("d-none");
		document.querySelector('#start-tournament').classList.remove("d-none");
		document.querySelector('#canvas4').classList.add("d-none");
		document.querySelector('#start-match').classList.add("d-none");

		setupStart();
		closeWebSocket();

		interval = setInterval(function() {
			if (end_loop == true)
				return ;
			if (TournamentWaitingFinal <= 1 && (PlayerScoreMatch1P1 !== 0 || PlayerScoreMatch1P2 !== 0) && (PlayerScoreMatch2P1 !== 0 || PlayerScoreMatch2P2 !== 0)) {
				getScore();
			}
			else if (!end_loop)
			{
				getTournamentInfo();
				if (match_final_id) {
					getMatchFinal(match_final_id);
					if (player_final_id01 && player_final_id02 && match_final_id)
						end_loop = true;
				} else {
					createFinalMatch(tournament_id);
				}
			}

			if (end_loop) {
				if (!final_start)
					WaitingFinalMatch();
				final_start = true;
			}
		}, 800);
	}


	function WaitingFinalMatch()
	{
		if (interval)
			clearInterval(interval);
		if (my_id === player_final_id01 || player_final_id02 === my_id)
		{
			my_match_id = match_final_id;
			lunchFinal();
		}
		else
			spectFinal();
	}

	var	endSpect = false;

	function spectFinal()
	{
		loop_spect = setInterval(function() {
			if (endSpect)
				return ;
			else {
				getScore(match_final_id, 0);
				console.log("spectFinal");
			}
		}, 1300);
	}

	function endTournament()
	{

		console.log("endTournament")
	}

	function createFinalMatch(tournamentId) {
		fetch(`/api/create-final-match/${tournamentId}/`, {
			method: 'POST'
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Erreur lors de la création du match final');
			}
			return response.json();
		})
		.then(data => {
			console.log('Match final créé avec succès:', data);
		})
		.catch(error => {
			console.error('Erreur lors de la création du match final:', error);
		});
	}

	var	final_game_start = false;

	function lunchFinal() {
		setupStart();

		if (!final_game_start)
		{
			if (player_final_id01 === my_id)
			{
				document.querySelector('#bracket').classList.add("d-none");
				document.querySelector('#start-tournament').classList.add("d-none");
				document.querySelector('#start-finale').classList.remove("d-none");
				setupMatch(match_final_id, 1, my_id, player_final_id02, socket, true, null);
			}
			else if (player_final_id02 === my_id)
			{
				document.querySelector('#bracket').classList.add("d-none");
				document.querySelector('#start-tournament').classList.add("d-none");
				document.querySelector('#start-finale').classList.remove("d-none");
				setupMatch(match_final_id, 2, my_id, player_final_id01, socket, true, null);
			}
			else
				return ;
			final_game_start = true;
		}
		else
			return ;
	}

	function getMatchFinal(id) {
		fetch(`/api/match/${id}/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				if (data.player1)
					player_final_id01 = data.player1;
				if (data.player2)
					player_final_id02 = data.player2;
				if (player_final_id01 === my_id || player_final_id02 === my_id)
				{
					match_final_id = data.id;
				}
			}
			else {
				console.log("Erreur de connexion avec la base de données");
			}
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}

	function getMatchInfo(id, nb) {
		fetch(`/api/match/${id}/`, {
			method: 'GET'
		})
		.then(reponse => reponse.json())
		.then(data => {
			if (data) {
				if (nb === 1 && (data.score_player1 || data.score_player2))
				{
					PlayerScoreMatch1P1 = data.score_player1;
					PlayerScoreMatch1P2 = data.score_player2;
					scoreM1P1.textContent = PlayerScoreMatch1P1;
					scoreM1P2.textContent = PlayerScoreMatch1P2;
					TournamentWaitingFinal++;
					if (data.score_player1 > data.score_player2)
						final1.textContent = PlayerNames[0];
					else
						final1.textContent = PlayerNames[1];
				}
				else {
					if (data.score_player1 || data.score_player2)
					{
						PlayerScoreMatch2P1 = data.score_player1;
						PlayerScoreMatch2P2 = data.score_player2;
						scoreM2P1.textContent = PlayerScoreMatch2P1;
						scoreM2P2.textContent = PlayerScoreMatch2P2;
						TournamentWaitingFinal++;
						if (data.score_player1 > data.score_player2)
							final2.textContent = PlayerNames[2];
						else
							final2.textContent = PlayerNames[3];
					}
				}
				if (id == match_final_id)
				{
					if (data.score_player1 > 0 || data.score_player2 > 0)
					{
						PlayerScoreFinalP1 = data.score01;
						PlayerScoreFinalP2 = data.score02;
						scoreF1.textContent = PlayerScoreFinalP1;
						scoreF2.textContent = PlayerScoreFinalP2;
						endSpect = true;
					}
				}
			}
			else {
				console.log("Erreur de connexion avec la base de données");
			}
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}

	function getScore() {
		fetch(`/api/tournaments/${tournament_id}/`, {
			method: 'GET'
		})
		.then(response => response.json())
		.then(data => {
			if (data) {
				getMatchInfo(data.match1_id, 1);
				getMatchInfo(data.match2_id, 2);
			} else {
				console.log("Erreur de connexion avec la base de données");
			}
		})
		.catch(error => {
			console.error("Erreur lors de la récupération des données du tournoi :", error);
		});
	}
}
