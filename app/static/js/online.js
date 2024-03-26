let disconnect_ennemy = false;

function online() {
    if (document.getElementById('auth-data').getAttribute('data-authenticated') === 'False') {
        return ;
    }

    let socket = null;

    var ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + 'root.alan-andrieux.fr/wss/chat/';

    socket = new WebSocket(ws_path);

    socket.onopen = function() {
        console.log("WebSocket connecté");
        // Vous pouvez envoyer des données ici une fois que la connexion est ouverte
        let message = {};
        if (window.location.pathname.includes("/ranked/") || window.location.pathname.includes("/tournament/")) {
            message.status = 'in_game';
        } else {
            message.status = 'out';
        }
        socket.send(JSON.stringify(message));
    };

    socket.onmessage = function(event) {
        // Gérer les messages reçus ici
    };

    socket.onclose = function() {
        console.log("WebSocket déconnecté");
    }

    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {
            let message = {};
            if (event.target.href.includes("/ranked/") || event.target.href.includes("/tournament/")) {
                message.status = 'in_game';
            } else {
                message.status = 'out';
            }

            socket.send(JSON.stringify(message));
        }
    });

    window.addEventListener('popstate', function(event) {
        if (window.location.pathname !== "/ranked" && window.location.pathname !== "/tournament") {
            let message = {};
            message.status = 'in_game';
            socket.send(JSON.stringify(message));
        }
    });

    window.addEventListener('hashchange', function(event) {
        if (window.location.pathname !== "/ranked" && window.location.pathname !== "/ranked" && window.location.pathname !== "/tournament") {
            let message = {};
            message.status = 'in_game';
            socket.send(JSON.stringify(message));
        }
    });
}

// Appeler la fonction online au chargement de la page
online();
