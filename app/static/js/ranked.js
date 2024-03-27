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
                    if (adverseScore < 3 && playerScore < 3) {
                        flashBorder(500);
                    }
                } else {
                    game.player.score++;
                    playerScore = game.player.score;
                    if (adverseScore < 3 && playerScore < 3) {
                        flashBorder(500);
                    }
                }

                if (game.player.score >= 3 || game.challenger.score >= 3) {
                    displayWinner = true;
                    draw();
                    gameEnd = true;
                    gameStarted = false;
                    clearInterval(borderFlashInterval);
                    document.removeEventListener('keydown', playerMove);
                    document.removeEventListener('keydown', challengerMove);
                    setTimeout(endGame, 3000);
                }
            } else {
                game.ball.speed.x *= -1;
                // Augmenter la vitesse de la balle à chaque rebond avec une limite de MAX_SPEED
                if (Math.abs(game.ball.speed.x) < MAX_SPEED) {
                    game.ball.speed.x *= BALL_SPEED;
                }
            }
        }

        function endGame() {
            // Informer l'utilisateur que la partie est terminée et afficher le bouton pour rejouer
            alert('La partie est terminée! Le gagnant est ' + winner);
            var replay = confirm('Voulez-vous rejouer?');
            if (replay) {
                resetGame();
            } else {
                // Gérer la déconnexion ou d'autres actions nécessaires à la fin du jeu
                if (gameOwnerId === ID_ranked) {
                    // Si c'est le propriétaire du jeu qui a décidé de ne pas rejouer, fermer la salle
                    // ou effectuer d'autres actions selon les besoins
                    // Par exemple, ici, j'utilise une variable `disconnect_ennemy` pour informer le backend
                    // que l'adversaire a été déconnecté, afin que des actions appropriées puissent être prises.
                    disconnect_ennemy = true;
                }
                // Fermer la connexion WebSocket
                game.close();
                // Rediriger ou effectuer d'autres actions nécessaires après la fin du jeu
                // Par exemple :
                // window.location.href = '/'; // Rediriger vers la page d'accueil
            }
        }

        function resetGame() {
            // Réinitialiser les scores et relancer le jeu
            game.player.score = 0;
            game.challenger.score = 0;
            startGameWithCountdown();
        }

        function setupStart() {
            canvas = document.getElementById('pong');
            canvas.width = window.innerWidth / 2;
            canvas.height = window.innerHeight / 1.5;
            game = {
                player: {
                    y: canvas.height / 2 - PLAYER_HEIGHT / 2,
                    score: 0,
                },
                challenger: {
                    y: canvas.height / 2 - PLAYER_HEIGHT / 2,
                    score: 0,
                },
                ball: {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    r: 10,
                    speed: {
                        x: 1,
                        y: 1
                    },
                }
            };
        }

        // Fonction pour lancer le jeu
        function startGame() {
            play();
        }

        // Envoi de mouvements au serveur WebSocket
        function sendMove(direction) {
            game.send(JSON.stringify({
                'type': 'game_move',
                'direction': direction
            }));
        }

        // Événements de mouvement des joueurs
        document.addEventListener('keydown', function(event) {
            if (event.key === 'ArrowUp') {
                sendMove('up');
            } else if (event.key === 'ArrowDown') {
                sendMove('down');
            }
        });
    }

    function connectToGame() {
        // Connexion au serveur WebSocket
        var wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        var endpoint = wsProtocol + window.location.host + '/ws/ranked/pong/' + ID_ranked + '/';
        game = new WebSocket(endpoint);

        // Gestion des événements WebSocket
        game.onopen = function() {
            console.log('WebSocket connected.');
        };

        game.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var messageType = data.type;

            if (messageType === 'ball_move') {
                // Mise à jour de la position de la balle
                var ballData = data.data;
                game.ball.x = ballData.x;
                game.ball.y = ballData.y;
            } else if (messageType === 'game_update') {
                // Mise à jour de la position du joueur adverse
                var playerData = data.data;
                game.challenger.y = playerData.direction === 'up' ? game.challenger.y - 20 : game.challenger.y + 20;
            } else if (messageType === 'game_start') {
                // Démarrage du jeu
                launchGame();
            } else if (messageType === 'disconnect_message') {
                // Message de déconnexion de l'adversaire
                // Gérer la déconnexion de l'adversaire
                disconnect_ennemy = true;
            }
        };

        game.onclose = function() {
            console.log('WebSocket closed.');
            // Gérer la fermeture de la connexion WebSocket
            // Par exemple, rediriger l'utilisateur ou effectuer d'autres actions nécessaires
            // Si l'adversaire n'est pas déjà déconnecté, alors il a fermé la connexion
            if (!disconnect_ennemy) {
                // Rediriger l'utilisateur ou afficher un message indiquant la fin de la partie
            }
        };
    }

    // Début du script
    ID_ranked = parseInt(document.getElementById('id_ranked').textContent);
    playerName = document.getElementById('player_name').textContent;
    adverseName = document.getElementById('adverse_name').textContent;

    connectToGame();
}
