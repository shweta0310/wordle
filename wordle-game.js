const letters = document.querySelectorAll('.cell');
let currentGuessedWord = '';
let currentRow = 0;
const ANSWER_LENGTH = 5;
const ROUNDS = 6;
let wordOfTheDay;
let map;

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function addLetterToGrid(letter) {
    if (currentGuessedWord.length < ANSWER_LENGTH) currentGuessedWord += letter;
    else currentGuessedWord = currentGuessedWord.substring(0, currentGuessedWord.length - 1) + letter;

    letters[currentRow * ANSWER_LENGTH + currentGuessedWord.length - 1].innerText = letter;
}

function undo() {
    if (currentGuessedWord.length === 0) {
        // do nothing
    } else {
        letters[currentRow * ANSWER_LENGTH + currentGuessedWord.length - 1].innerText = null;
        currentGuessedWord = currentGuessedWord.substring(0, currentGuessedWord.length - 1);
    }
}

async function guessWord() {
    if (currentGuessedWord.length < ANSWER_LENGTH) {
        return;
    }

    // validate word
    const isvalidWord = await isWordValid(currentGuessedWord);
    if (!isvalidWord) {
        markWordAsInvalid();
        return;
    }

    // mark the correct guesses
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (currentGuessedWord[i] === wordOfTheDay[i]) {
            letters[currentRow * ANSWER_LENGTH + i].classList.add('correct-letter');
            map[currentGuessedWord[i]]--;
        }
    }
    // mark the incorrect letter guesses
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (currentGuessedWord[i] === wordOfTheDay[i]) {
            // do nothing
        } else if (wordOfTheDay.includes(currentGuessedWord[i]) && map[currentGuessedWord[i]] > 0) {
            letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong-placed-letter');
            map[currentGuessedWord[i]]--;
        } else {
            letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong-letter');
        }
    }
    currentRow++;

    // Check win or lose
    if (currentGuessedWord === wordOfTheDay) {
        alert('You Win!');
    } else if (currentRow === ROUNDS) {
        alert(`Game Over! The word of the is ${wordOfTheDay}`);
    }
    currentGuessedWord = '';
    return;
}

function makeMap(array) {
    let map = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (map[letter]) map[letter]++;
        else map[letter] = 1;
    }
    return map;
}

async function getWordOfTheday() {
    const response = await fetch('https://words.dev-apis.com/word-of-the-day');
    const jsonResponse = await response.json();
    const wordOfTheDay = jsonResponse.word;
    return wordOfTheDay.toUpperCase();
}

async function isWordValid(word) {
    const response = await fetch('https://words.dev-apis.com/validate-word', {
        method: 'POST',
        body: JSON.stringify({ word: word }),
    });
    const jsonResponse = await response.json();
    return jsonResponse.validWord;
}

function markWordAsInvalid() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
    }
    currentRow++;
    currentGuessedWord = '';
}

async function init() {
    wordOfTheDay = await getWordOfTheday();
    map = makeMap(wordOfTheDay);
    document.addEventListener('keydown', function handleKeyPress(event) {
        const action = event.key;
        if (action === 'Enter') {
            guessWord();
        } else if (action === 'Backspace') {
            undo();
        } else if (isLetter(action)) {
            addLetterToGrid(action.toUpperCase());
        } else {
            console.log('Invalid symbol selected', action);
        }
    });
}

init();
