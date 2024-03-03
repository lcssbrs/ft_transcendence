const solo = document.querySelector('#solo');
const local = document.querySelector('#local');
const ranked = document.querySelector('#ranked');
const tournoi = document.querySelector('#tournoi');
const classement = document.querySelector('#classement');
const logbutton = document.querySelector('#logbutton');
const logrequire = document.querySelector('#logrequire');
const profilebar = document.querySelector('#profilebar');
const friend = document.querySelector('#friend');
const profile = document.querySelector('#profile');

function Profile()
{
	friend.classList.add('d-none');
	profile.classList.remove('d-none');
}
function log()
{
	logbutton.classList.add('d-none');
	// logrequire.classList.add('d-none');
	profilebar.classList.remove('d-none');
}

function Page2()
{
	history.pushState({affichage: 'solo'}, null, null);
	solo.classList.remove('d-none');
	local.classList.add('d-none');
	ranked.classList.add('d-none');
	tournoi.classList.add('d-none');
	classement.classList.add('d-none');
}

function Page3()
{
	history.pushState({affichage: 'local'}, null, null);
	local.classList.remove('d-none');
	solo.classList.add('d-none');
	ranked.classList.add('d-none');
	tournoi.classList.add('d-none');
	classement.classList.add('d-none');
}

function Page4()
{
	history.pushState({affichage: 'ranked'}, null, null);
	ranked.classList.remove('d-none');
	local.classList.add('d-none');
	solo.classList.add('d-none');
	tournoi.classList.add('d-none');
	classement.classList.add('d-none');
}

function Page5()
{
	history.pushState({affichage: 'tournoi'}, null, null);
	tournoi.classList.remove('d-none');
	local.classList.add('d-none');
	ranked.classList.add('d-none');
	solo.classList.add('d-none');
	classement.classList.add('d-none');
}

function Page6()
{
	history.pushState({affichage: 'classement'}, null, null);
	classement.classList.remove('d-none');
	local.classList.add('d-none');
	ranked.classList.add('d-none');
	tournoi.classList.add('d-none');
	solo.classList.add('d-none');
}

window.addEventListener('popstate', function(event) {
	var state = event.state;
	if (!state)
		return ;
	else if (state.affichage == 'solo')
		Page2();
	else if (state.affichage == 'local')
		Page3();
	else if (state.affichage == 'ranked')
		Page4();
	else if (state.affichage == 'tournoi')
		Page5();
	else if (state.affichage == 'classement')
		Page6();
});
