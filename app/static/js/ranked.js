function setupRanked() {
    const startButton = document.getElementById("start-ranked");
    const stopButton = document.getElementById("stop-ranked");
    let socket = null;

    startButton.addEventListener("click", function() {
        if (socket !== null && socket.readyState === WebSocket.OPEN) {
            console.log("WebSocket already connected");
            return;
        }

        // Établir une connexion WebSocket
        socket = new WebSocket("ws://localhost:8000/ws/ranked");

        socket.onopen = function(event) {
            console.log("WebSocket connected");
            // Vous pouvez envoyer des données au serveur une fois la connexion établie
            socket.send("ping");
            console.log("message envoye");
        };

        socket.onmessage = function(event) {
            console.log("Received message from server:", event.data);
            // Traitez les messages reçus du serveur ici
        };

        socket.onclose = function(event) {
            console.log("WebSocket disconnected");
        };
    });

    stopButton.addEventListener("click", function() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
            console.log("WebSocket disconnected");
        }
    });
}
