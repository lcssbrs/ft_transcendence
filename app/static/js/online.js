$(document).ready(function online() {
	if (document.getElementById('auth-data').getAttribute('data-authenticated') === 'False')
		return ;

	let socket = null;

	var ws_scheme = window.location.protocol === "https:" ? "wss" : "ws";
	var ws_path = ws_scheme + '://' + `localhost:8000/ws/chat/`;

	socket = new WebSocket(ws_path);

	socket.onopen = function() {
		// console.log("WebSocket connecté");
	};

	socket.onmessage = function(event) {

	};

	socket.onclose = function() {
		// console.log("WebSocket déconnecté");
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

	window.addEventListener('popstate', function(event)
	{
		if (window.location.pathname !== "/ranked" && window.location.pathname !== "/tournament") {
			message.status = 'in_game';
		}
		socket.send(JSON.stringify(message));
	});

	window.addEventListener('hashchange', function(event)
	{
		console.log(window.location.pathname);
		if (window.location.pathname !== "/ranked" && window.location.pathname !== "/ranked" && window.location.pathname !== "/tournament") {
			message.status = 'in_game';
		}
		socket.send(JSON.stringify(message));
	});
})
