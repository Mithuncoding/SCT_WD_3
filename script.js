// Selecting DOM elements
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const gameModeSelect = document.getElementById('gameMode');
const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');
const playerXWins = document.getElementById('playerXWins');
const playerOWins = document.getElementById('playerOWins');
const ties = document.getElementById('ties');

// Game variables
let gameActive = true;
let currentPlayer = 'X';
let gameMode = 'pvp'; // 'pvp' or 'pvc'
let gameState = ["", "", "", "", "", "", "", "", ""];
let scores = {
    X: 0,
    O: 0,
    Ties: 0
};

// Winning combinations
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Initialize Game
function initializeGame() {
    gameActive = true;
    currentPlayer = 'X';
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.innerText = `${getPlayerName(currentPlayer)}'s turn`;
    statusText.classList.remove('x-turn', 'o-turn');
    updateStatus();

    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('disabled', 'highlight', 'clicked');
        cell.addEventListener('click', handleCellClick);
    });

    // If computer starts first
    if (gameMode === 'pvc' && currentPlayer === 'O') {
        computerMove();
    }
}

// Get Player Name
function getPlayerName(player) {
    if (player === 'X') {
        return playerXInput.value.trim() !== "" ? playerXInput.value : 'Player X';
    } else {
        return gameMode === 'pvp' ? (playerOInput.value.trim() !== "" ? playerOInput.value : 'Player O') : 'Computer';
    }
}

// Handle Cell Click
function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[cellIndex] !== "" || !gameActive) {
        return;
    }

    updateCell(clickedCell, cellIndex);
    checkResult();

    if (gameActive && gameMode === 'pvc' && currentPlayer === 'X') {
        // Computer's turn
        setTimeout(computerMove, 500);
    }
}

// Update Cell
function updateCell(cell, index) {
    gameState[index] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.classList.add('disabled', 'clicked');
}

// Switch Player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
        computerMove();
    }
}

// Update Status
function updateStatus() {
    let playerName = getPlayerName(currentPlayer);
    statusText.innerText = `${playerName}'s turn`;
    statusText.classList.toggle('x-turn', currentPlayer === 'X');
    statusText.classList.toggle('o-turn', currentPlayer === 'O');
}

// Check Result
function checkResult() {
    let roundWon = false;
    let winningCombo = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningCombo = winCondition;
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `${getPlayerName(currentPlayer)} has won!`;
        updateScores(currentPlayer);
        highlightWinningCells(winningCombo);
        gameActive = false;
        return;
    }

    if (!gameState.includes("")) {
        statusText.innerText = `Game ended in a tie!`;
        updateScores('Tie');
        gameActive = false;
        return;
    }

    switchPlayer();
}

// Highlight Winning Cells
function highlightWinningCells(combo) {
    combo.forEach(index => {
        cells[index].classList.add('highlight');
    });
}

// Reset Game
resetBtn.addEventListener('click', initializeGame);

// Handle Game Mode Change
gameModeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    initializeGame();
});

// Handle Player Name Input
playerXInput.addEventListener('input', updateStatus);
playerOInput.addEventListener('input', updateStatus);

// Update Scores
function updateScores(winner) {
    if (winner === 'X') {
        scores.X += 1;
        playerXWins.innerText = scores.X;
    } else if (winner === 'O') {
        scores.O += 1;
        playerOWins.innerText = scores.O;
    } else if (winner === 'Tie') {
        scores.Ties += 1;
        ties.innerText = scores.Ties;
    }
}

// Computer Move using Minimax Algorithm
function computerMove() {
    if (!gameActive || currentPlayer !== 'O') return;

    // Implement Minimax algorithm for optimal move
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            gameState[i] = 'O';
            let score = minimax(gameState, 0, false);
            gameState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== undefined) {
        const cell = document.querySelector(`.cell[data-index='${move}']`);
        updateCell(cell, move);
        checkResult();
    }
}

// Minimax Algorithm
function minimax(newGameState, depth, isMaximizing) {
    if (checkWin(newGameState, 'O')) {
        return 1;
    }
    if (checkWin(newGameState, 'X')) {
        return -1;
    }
    if (!newGameState.includes("")) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newGameState.length; i++) {
            if (newGameState[i] === "") {
                newGameState[i] = 'O';
                let score = minimax(newGameState, depth + 1, false);
                newGameState[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newGameState.length; i++) {
            if (newGameState[i] === "") {
                newGameState[i] = 'X';
                let score = minimax(newGameState, depth + 1, true);
                newGameState[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check Win for Minimax
function checkWin(state, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = state[winCondition[0]];
        let b = state[winCondition[1]];
        let c = state[winCondition[2]];

        if (a === player && b === player && c === player) {
            return true;
        }
    }
    return false;
}

// Initialize the game on page load
initializeGame();