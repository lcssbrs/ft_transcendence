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
const logscreen = document.querySelector('#loginForm')
const validlogbutton = document.querySelector('#validlogbutton')
const registerscreen = document.querySelector('#registerForm')

function validlog()
{
	profilebar.classList.remove('d-none');
	logbutton.classList.add('d-none');
	logscreen.classList.add('d-none');
	registerscreen.classList.add('d-none');
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
	var usernameInput = document.getElementById("usernameInput");
	var usernameError = document.getElementById("usernameMissing");

	var passwordInput = document.getElementById("passwordInput");
	var passwordError = document.getElementById("passwordMissing");
	var isValid = true;

	if (usernameInput.value === "") {
		usernameError.classList.remove("d-none");
		isValid = false;
	} else {
		usernameError.classList.add("d-none");
	}
	if (passwordInput.value === "") {
		passwordError.classList.remove("d-none");
		isValid = false;
	} else {
		passwordError.classList.add("d-none");
	}
	if (!isValid) {
		event.preventDefault();
	}
});

// document.getElementById("registerForm").addEventListener("submit", function(event) {
// 	var usernameInput = document.getElementById("usernameRegister");
// 	var usernameError = document.getElementById("usernameMissingReg");

// 	var firstInput = document.getElementById("firstRegister");
// 	var firstError = document.getElementById("firstMissing");

// 	var lastInput = document.getElementById("lastRegister");
// 	var lastError = document.getElementById("lastMissing");

// 	var passwordInput = document.getElementById("passwordRegister");
// 	var passwordError = document.getElementById("passwordMissingReg");

// 	var emailInput = document.getElementById("emailRegister");
// 	var emailError = document.getElementById("emailError");
// 	var isValid = true;

// 	if (usernameInput.value === "") {
// 		usernameError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		usernameError.classList.add("d-none");
// 	}
// 	if (firstInput.value === "") {
// 		firstError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		firstError.classList.add("d-none");
// 	}
// 	if (lastInput.value === "") {
// 		lastError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		lastError.classList.add("d-none");
// 	}
// 	if (passwordInput.value === "") {
// 		passwordError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		passwordError.classList.add("d-none");
// 	}
// 	if (emailInput.value === "") {
// 		emailError.classList.remove("d-none");
// 		isValid = false;
// 	} else {
// 		emailError.classList.add("d-none");
// 	}
// 	if (!isValid) {
// 		event.preventDefault();
// 	}
// });

function Profile()
{
	friend.classList.add('d-none');
	profile.classList.remove('d-none');
}

function log()
{
	logrequire.classList.add('d-none');
	logscreen.classList.remove('d-none');
	registerscreen.classList.add('d-none');
}

function register()
{
	logscreen.classList.add('d-none');
	registerscreen.classList.remove('d-none');
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
