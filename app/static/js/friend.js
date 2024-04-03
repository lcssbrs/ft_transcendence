$(document).ready(function() {
    var friends = null;

    function loadFriends() {
        if (document.getElementById('auth-data').getAttribute('data-authenticated') === 'False')
            return ;
        url = location.pathname;
        if (url == '/ranked/' || url == '/tournament/')
            return ;
        $.ajax({
            url: '/api/get_friends/',
            type: 'GET',
            success: function(response) {
                var friendsList = response.friends;
                var $friendContainer = $('.friend-user');
                checkList = needReload(friendsList, $friendContainer);
                checkList.forEach(function(friend) {
                    var statusColor;
                    if (friend.status === 'online') {
                        statusColor = 'rgb(40, 167, 69)';
                    } else if (friend.status === 'offline') {
                        statusColor = 'rgb(204, 204, 204)';
                    } else if (friend.status === 'in_game') {
                        statusColor = 'rgb(13, 110, 253)';
                    }
                    var $statusIcon = $('<div id="' + friend.username + '-status" class="status-icon mr-2" style="width: 10px; height: 10px; border-radius: 50%; background-color: ' + statusColor + ';"></div>');

                    var $friendElement = $('<div id="' + friend.username + '" class="pt-1 mb-2 d-flex justify-content-between mr-3">' +
                    '<div class="d-flex align-items-center">' +
                    '<a href="/profile/?id=' + friend.id + '" class="text-white redir">' +
                    '<span>' + friend.username + '</span>' +
                    '</a>' +
                    '</div>' +
                    '<button class="btn-sm rounded-2 remove-button" style="background-color: #F4ACBC; color:white; border-color:#F4ACBC" data-friend-id="' + friend.id + '">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">' +
                    '<path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>' +
                    '</svg>' +
                    '</button>' +
                    '</div>');

                    $friendElement.find('.d-flex').prepend($statusIcon);
                    $friendContainer.append($friendElement);
                });
                attachEventListeners();
                friends = friendsList;

                $('.remove-button').on('click', function() {
                    var friendId = $(this).data('friend-id');
                    removeFriend(friendId);
                });
            },
        });
    }

    function needReload(friendsList, $friendContainer) {
        if (friends == null)
            return (friendsList);
        var newFriends = [];
        var status;
        for (let i = 0; i < friendsList.length; i++) {
            status = 1;
            for (let j = 0; j < friends.length; j++) {
                if (friends[j].username == friendsList[i].username) {
                    if (friends[j].status == friendsList[i].status) {
                        status = 0;
                    }
                    break ;
                }
            }
            if (status == 1) {
                newFriends.push(friendsList[i]);
                temp = document.querySelector('#' + friendsList[i].username);
                if (temp)
                    temp.remove();
            }
        }
        var checkDelete = $friendContainer[0].querySelectorAll("div");
        for (let i = 0; i < checkDelete.length; i += 3) {
            status = 1;
            for (let j = 0; j < friendsList.length; j++) {
                if (checkDelete[i].id == friendsList[j].username) {
                    status = 0;
                    break ;
                }
            }
            if (status == 1) {
                checkDelete[i].remove();
            }
        }
        return (newFriends);
    }

    function removeFriend(friendId) {
        $.ajax({
            url: '/api/remove_friend/',
            type: 'POST',
            data
			: {
                friend_id: friendId
            },
            success: function(response) {
                loadFriends();
            },
            error: function(xhr, status, error) {
                showNotification("Erreur lors de la suppression de l\'ami", "error");
                console.error('Erreur lors de la suppression de l\'ami :', error);
            }
        });
    }

    loadFriends();

    setInterval(function() {
        loadFriends();
    }, 3000);
});

$(document).ready(function() {
    var requests = null;

    function loadFriendRequests() {
        if (document.getElementById('auth-data').getAttribute('data-authenticated') === 'False')
            return ;
        url = location.pathname;
        if (url == '/ranked/' || url == '/tournament/')
            return ;
        $.ajax({
            url: '/api/get_friend_requests/',
            type: 'GET',
            success: function(response) {
                var requestsList = response.friend_requests;
                var $requestsContainer = $('.friend-scroll');
                checkList = needReload(requestsList, $requestsContainer);
                checkList.forEach(function(request) {
                    var $acceptButton = $('<button class="btn-sm rounded-2 mr-2 accept-button" style="background-color: #0D6EFD; color:white; border-color:#0D6EFD;">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">' +
                    '<path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>' +
                    '</svg>' +
                    '</button>').data('request-id', request.id);

                    var $rejectButton = $('<button class="btn-sm rounded-2 reject-button" style="background-color: #F4ACBC; color:white; border-color:#F4ACBC">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">' +
                    '<path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>' +
                    '</svg>' +
                    '</button>').data('request-id', request.id);

                    var $requestElement = $('<div id="' + request.from_user + '-request" class="pt-1 mb-2 d-flex justify-content-between mr-3">' +
                    '<a href="/profile/?id=' + request.id + '" class="text-white my-auto mr-auto redir">' +
                    '<span>' + request.from_user + '</span>' +
                    '</a>').append($acceptButton).append($rejectButton);

                    $requestsContainer.append($requestElement);
                });
                attachEventListeners();
                requests = requestsList;
            },
        });
    }

    function needReload(requestsList, $requestsContainer) {
        if (requests == null)
            return (requestsList);
        var newRequests = [];
        var status;
        for (let i = 0; i < requestsList.length; i++) {
            status = 1;
            for (let j = 0; j < requests.length; j++) {
                if (requests[j].from_user === requestsList[i].from_user) {
                    status = 0;
                    break ;
                }
            }
            if (status == 1) {
                newRequests.push(requestsList[i]);
            }
        }
        var checkDelete = $requestsContainer[0].querySelectorAll("div");
        for (let i = 0; i < checkDelete.length; i++) {
            status = 1;
            for (let j = 0; j < requestsList.length; j++) {
                if (checkDelete[i].id == requestsList[j].from_user + '-request') {
                    status = 0;
                    break ;
                }
            }
            if (status == 1) {
                checkDelete[i].remove();
            }
        }
        return (newRequests);
    }

    $(document).on('click', '.accept-button', function() {
        var $requestElement = $(this).closest('.d-flex');
        var requestId = $requestElement.find('.accept-button').data('request-id');
        fetch('/accept_friend/' + requestId + '/', {
			method: 'POST',
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
                loadFriendRequests();
			}
			else {
				console.log(data.message);
			}
		})
		.catch(error => {
			console.error('Erreur lors de l\'envoi de la requête', error);
		});
    });

    $(document).on('click', '.reject-button', function() {
        var $requestElement = $(this).closest('.d-flex');
        var requestId = $requestElement.find('.reject-button').data('request-id');
        $.post('/reject_friend/' + requestId + '/', {})
            .done(function(response) {
                loadFriendRequests();
            })
            .fail(function(xhr, status, error) {
                console.error('Erreur lors du rejet de la demande d\'ami :', error);
            });
    });

    loadFriendRequests();

    setInterval(function() {
        loadFriendRequests();
    }, 3000);
});

$(document).ready(function() {
    $('#add-friend-input').keypress(function(event) {
        if (event.which === 13) {
            event.preventDefault();
            var username = $(this).val().trim();
            if (username !== '') {
                addFriend(username);
                $(this).val('');
            }
        }
    });

    function addFriend(username) {
        $.ajax({
            url: '/add_friend_username/' + username + '/',
            type: 'POST',
            success: function(response) {
                var response = { success: true, message: "Demande d'ami envoyée avec succès." };
                showNotification(response.message, "success");
            },
            error: function(xhr, status, error) {
                var errorMessage;
                try {
                    var responseJson = JSON.parse(xhr.responseText);
                    errorMessage = responseJson.error || error;
                } catch (e) {
                    errorMessage = error;
                }
                showNotification(errorMessage, "error");
                console.error('Erreur lors de l\'ajout de l\'ami :', errorMessage);
            }
        });
    }
});


function showNotification(message, type) {
    var notification = $('#notification');
    notification.empty().removeClass().addClass('notification').addClass(type);
    var messageParagraph = $('<p></p>').text(message);
    var progressSpan = $('<span class="progress"></span>');
    notification.append(messageParagraph);
    notification.append(progressSpan);

    var notificationWidth = notification.width();
    notification.css('left', 'calc(50% - ' + (notificationWidth / 2) + 'px)');

    notification.css({ 'display': 'block' });
    setTimeout(function() {
        hideNotification();
    }, 2500);
}

function hideNotification() {
    var notification = $('#notification');
    notification.css({ 'display': 'none' });
}
