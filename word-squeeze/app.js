
// game state
var state;

// one local storage entry per day
let localStorageKey = 'word-squeeze-' + (new Date()).getFullYear() + '-' + dayOfYear();

async function lookupWord(file) {
    let response = await fetch(file);

    if (response.status == 200) {

        state.score++;

        if (state.guess < state.target) {
            state.hiword = state.guess;
        }
        else {
            state.loword = state.guess;
        }

        state.guess = '';
    }
    else {
        state.badguess = true;
    }

    update();
}

function dayOfYear() {
    const today = new Date();
    const jan1 = new Date(today.getFullYear(), 0, 0);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor((today - jan1) / oneDay);
}

function update() {

    // save state
    localStorage.setItem(localStorageKey, JSON.stringify(state));

    // update UI
    const dt = (new Date()).toLocaleString(undefined, {month: 'short', day: 'numeric'});
    document.querySelector('#date').innerText = dt;

    document.querySelector('#hiword').value = state.hiword;
    document.querySelector('#guess').value = state.guess;
    document.querySelector('#loword').value = state.loword;

    document.querySelector('#score').innerText = state.score;

    if (!state.showhelp) {
        document.querySelector('#help').remove();
    }

    if (state.badguess) {
        document.querySelector('#guess').classList.add('jiggle');
        state.badguess = false;
        setTimeout(function () {
            document.querySelector('#guess').classList.remove('jiggle');
        }, 700)
    }

    if (state.gameover) {
        const input = document.querySelector('#guess');
        input.readOnly = true;
        input.classList.add('gameover');
        input.classList.add('throb');
    }
}

const form = document.querySelector('form');

form.addEventListener('submit', function (ev) {

    state.guess = document.querySelector('input#guess').value;

    // is guess correct?
    if (state.guess == state.target) {
        state.score++;
        state.gameover = true;
        update();
        ev.preventDefault();
        return;
    }

    // is guess between hi/lo words?
    if (state.guess <= state.hiword || state.guess >= state.loword) {
        state.badguess = true;
        update();
        ev.preventDefault();
        return;
    }

    // is guess in word list?
    const hash = CryptoJS.MD5(state.guess).toString();
    const url = 'hash/' + hash.substring(0, 2) + '/' + hash;
    lookupWord(url);

    ev.preventDefault();
});

// force guess to lower case alphabet
document.querySelector('#guess').addEventListener('input', function (ev) {
    ev.target.value = ev.target.value.toLowerCase();
    ev.target.value = ev.target.value.replace(/[^a-z]/g, '');
});

async function loadTarget() {
    let response = await fetch('targets.json');
    let targets = await response.json();
    state.target = targets[dayOfYear()];
}

document.querySelector('#help button').addEventListener('click', function (ev) {
    state.showhelp = false;
    update();
});

document.addEventListener("DOMContentLoaded", function() {

    // load state from local storage if present, otherwise initialise
    try {
        state = JSON.parse(localStorage.getItem(localStorageKey));
        if (state == null) {
            throw new Error();
        }
    }
    catch (error) {
        state = {
            score: 0,
            target: '',
            guess: '',
            hiword: 'aardvark',
            loword: 'zygote',
            badguess: false,
            gameover: false,
            showhelp: true
        };
    }

    loadTarget();
    update();
});
