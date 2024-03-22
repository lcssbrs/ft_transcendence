function setupProfile() {
	var url = window.location.href;
	var id = url.substring(url.indexOf('=') + 1);
	$.ajax({
		url: '/api/users/' + id + '/',
		type: 'GET',
		success: function(response) {
			console.log(response);
			document.querySelector('#user-picture').src = response.profile_picture;
			if (response.games_rank <= 30)
			{
				document.querySelector('#rank').innerHTML = 'Gold' + ' - ' + response.games_rank + ' LP';
				document.querySelector('#rank-picture').src = '/static/images/gold.png';
			}
			else if (response.games_rank <= 60)
			{
				document.querySelector('#rank').innerHTML = 'Emeraude' + ' - ' + response.games_rank + ' LP';
				document.querySelector('#rank-picture').src = '/static/images/emerald.png';
			}
			else if (response.games_rank <= 90)
			{
				document.querySelector('#rank').innerHTML = 'Master' + ' - ' + response.games_rank + ' LP';
				document.querySelector('#rank-picture').src = '/static/images/master.png';
			}
			else if (response.games_rank <= 120)
			{
				document.querySelector('#rank').innerHTML = 'Challenger' + ' - ' + response.games_rank + ' LP';
				document.querySelector('#rank-picture').src = '/static/images/challenger.png';
			}
			document.querySelector('#name').innerHTML = response.first_name + ' ' + response.last_name;
			document.querySelector('#username').innerHTML = response.username;
			document.querySelector('#played').innerHTML = response.games_played;
			document.querySelector('#victory').innerHTML = response.games_win;
			document.querySelector('#defeat').innerHTML = response.games_loose;
		}
	})
}
