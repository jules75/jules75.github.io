let state = {
    score: 0,
    target: 'fishing',
    guess: '',
    hiword: 'aardvark',
    loword: 'zygote',
    badguess: false
};

async function foo(file) {
    let x = await fetch(file);

    if (x.status == 200) {

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

    renderState();
}

function dayOfYear() {
    const today = new Date();
    const jan1 = new Date(today.getFullYear(), 0, 0);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor((today - jan1) / oneDay);
}

function renderState() {
    document.querySelector('#hiword').value = state.hiword;
    document.querySelector('#guess').value = state.guess;
    document.querySelector('#loword').value = state.loword;

    document.querySelector('#score').innerText = state.score; 

    if (state.badguess) {
        document.querySelector('#guess').classList.add('jiggle');
        state.badguess = false;
        setTimeout(function () {
            document.querySelector('#guess').classList.remove('jiggle');
        }, 700)
    }
}

const form = document.querySelector('form');

form.addEventListener('submit', function (ev) {

    state.guess = document.querySelector('input#guess').value;

    // is guess correct?
    if (state.guess == state.target) {
        alert('You won!');
        ev.preventDefault();
        return;
    }

    // is guess between hi/lo words?
    if (state.guess <= state.hiword || state.guess >= state.loword) {
        state.badguess = true;
        renderState();
        ev.preventDefault();
        return;
    }

    // is guess in word list?
    const hash = CryptoJS.MD5(state.guess).toString();
    const url = 'hash/' + hash.substring(0, 2) + '/' + hash;
    foo(url);

    ev.preventDefault();
});

async function loadTarget() {
    let x = await fetch('targets.json');
    let y = await x.json();
    state.target = y[dayOfYear()];
}

loadTarget();
renderState();