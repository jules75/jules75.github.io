import { Chess, WHITE, BLACK } from "./chess.js";

function randomFile() {
    const files = 'abcdefgh';
    const i = Math.floor(Math.random() * files.length);
    return files[i];
}

function randomRank() {
    return Math.floor(Math.random() * 8) + 1;
}

function randomPiece() {
    const pieces = 'kqpbrn';
    const i = Math.floor(Math.random() * pieces.length);
    return pieces[i];
}

/**
 * Place a random piece of given color somewhere on the board.
 * Returns piece (k, q, etc.) and square (e.g. a2, g7) array.
 */
function putRandomPiece(chess, color, forbidKing = false) {

    let piece, file, rank, square;

    while (true) {

        piece = randomPiece();
        file = randomFile();
        rank = randomRank();
        square = file + rank;

        // don't put a pawn on first or last rank
        if (piece == 'p' && (rank == 8 || rank == 1)) {
            continue;
        }

        // try again if square occupied
        if (chess.get(square) !== undefined) {
            continue;
        }

        // try again if king forbidden
        if (forbidKing && piece == 'k') {
            continue;
        }

        // all good, place piece and return
        chess.put({ type: piece, color: color }, square);
        return [piece, square];
    }
}

function q11() {

    let chess = new Chess();
    let piece, square;

    chess.clear();

    [piece, square] = putRandomPiece(chess, WHITE);

    return [
        `On an empty board, place a white ${pieces[piece]} on ${square}. How many possible moves can white make?`,
        chess.moves().length
    ];
}

function q12() {
    const file = randomFile();
    const rank = randomRank();
    let answer;

    if ('aceg'.includes(file) && ((rank % 2) == 0)) {
        answer = 'white';
    }

    else if ('bdfh'.includes(file) && ((rank % 2) == 1)) {
        answer = 'white';
    }

    else {
        answer = 'black';
    }

    return [
        `What colour is the ${file}${rank} square?`,
        answer
    ];
}

function _q21_q22(color) {

    let chess = new Chess();
    let moves, move;

    // make 2 random moves (per side)
    for (let i = 0; i < 4; i++) {
        moves = chess.moves();
        move = moves[Math.floor(Math.random() * moves.length)];
        chess.move(move);
    }

    // find an empty square that has attackers
    let rank, file, square, attackers;
    while (true) {
        rank = randomRank();
        file = randomFile();
        square = file + rank;
        attackers = chess.attackers(square, color);
        if (attackers.length > 0 && chess.get(square) == undefined) {
            break;
        }
    }

    // add numbers to move list
    let n = 1, movelist = "";
    const history = chess.history();
    for (let i = 0; i < history.length; i += 2) {
        movelist += `${n}. ${history[i]} ${history[i + 1]}, `;
        n++;
    }

    return [
        `After ${movelist} what ${color == WHITE ? 'white' : 'black'} pieces could attack ${square}?`,
        attackers.join(', ')
    ];
}

function q21() {
    return _q21_q22(WHITE);
}

function q22() {
   return _q21_q22(BLACK);
}

function q23() {

    let chess = new Chess();
    let moves, move;

    // make 1 random move (per side)
    for (let i = 0; i < 2; i++) {
        moves = chess.moves();
        move = moves[Math.floor(Math.random() * moves.length)];
        chess.move(move);
    }

    // add numbers to move list
    let n = 1, movestr = "";
    const history = chess.history();
    for (let i = 0; i < history.length; i += 2) {
        movestr += `${n}. ${history[i]} ${history[i + 1]}, `;
        n++;
    }

    // remove pawn moves from list
    let movelist = chess.moves();
    movelist = movelist.filter(e => !("abcdefgh".includes(e[0])));

    return [
        `After ${movestr} what piece (not pawn) moves could white make?`,
        movelist.sort().join(' ')
    ];
}

const pieces = {
    'k': 'king',
    'q': 'queen',
    'p': 'pawn',
    'r': 'rook',
    'b': 'bishop',
    'n': 'knight'
};

const questions = {
    1: [q11, q12],
    2: [q21, q22, q23]
};

function loadQuestion() {

    const level = document.querySelector('select').value;
    const i = Math.floor(Math.random() * questions[level].length);
    const [question, answer] = questions[level][i]();

    document.querySelector('#question').innerHTML = question;
    document.querySelector('#answer').innerText = answer;
}

loadQuestion();

document.querySelector('button').addEventListener('click', loadQuestion);
document.querySelector('select').addEventListener('change', loadQuestion);
