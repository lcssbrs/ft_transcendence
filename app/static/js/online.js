function online() {
    if (document.getElementById('auth-data').getAttribute('data-authenticated') === 'False') {
        return;
    }

    let socket = null;
    let gameStarted = false;

    function initializeWebSocket(match_id, playerId) {
        if (socket !== null && socket.readyState === WebSocket.OPEN) {
            console.log("Connexion WebSocket déjà ouverte.");
            return;
        }

        socket = new WebSocket(`wss://root.alan-andrieux.fr:443/wss/match/${match_id}/`);

        socket.onopen = function() {
            ID_ranked = match_id;
            console.log("Websocket ouvert");
        };

        socket.onmessage = function(event) {
            const eventData = JSON.parse(event.data);
            if (eventData.type === 'game_start') {
                searchingMatch.style.display = "none";
                gameStarted = true;
                displayGame();
                GetPlayerId(match_id);
            }
            if (eventData.type === 'game_update') {
                const playerData = eventData.data;
                if (playerData.player !== playerId) {
                    updateOpponentPad(playerData.direction);
                }
            }
            if (eventData.type === 'disconnect_message') {
                disconnect_ennemy = true;
                closeWebSocket();
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

        // Autres fonctions et gestionnaires d'événements

        socket.onclose = function() {
            adversaireMatch.style.display = "block";
            if (gameStarted && disconnect_ennemy) {
                if (playerId === 1)
                    endGameApi(match_id, 4, adverseScore, playerId);
                else
                    endGameApi(match_id, playerScore, 4, playerId);
            }
            if (playerId === 1 && !disconnect_ennemy && !gameStarted) {
                quitGameApi(match_id, 0, 0);
            }
            gameStarted = false;
            console.log("WebSocket déconnecté");
        };

        // Autres fonctions et gestionnaires d'événements
    }

    const startButton = document.getElementById("start-ranked");
    const searchingMatch = document.getElementById("searching-match");
    const adversaireMatch = document.getElementById("adversaire-match");

    startButton.addEventListener("click", function() {
        startButton.style.display = "none";
        searchingMatch.style.display = "block";

        fetch('/api/join-match/', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            var match_id = 0;
            if (data.match_exists) {
                console.log("Match trouvé [", data.match_data.id, "]");
                match_id = data.match_data.id;
                const player = 2;
                initializeWebSocket(match_id, player);
            } else {
                console.log("Nouvelle partie créée [", data.match_data.id, "]");
                match_id = data.match_data.id;
                const player = 1;
                initializeWebSocket(match_id, player);
            }
        })
        .catch(error => console.error('Erreur avec la connexion en base de données', error));
    });
}
