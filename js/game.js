let words = [];
let gameState = {
  selectedWord: '',
  hint: '',
  guessedLetters: new Set(),
  incorrectGuesses: 0,
  gameStatus: 'playing' // 'playing', 'won', or 'lost'
};

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const errorScreen = document.getElementById('error-screen');
const hangmanDisplay = document.querySelector('.hangman-display');
const pacManImage = document.getElementById('pac-man');
const targetImage = document.getElementById('target-image');
const guessesRemainingText = document.getElementById('guesses-remaining');
const hintText = document.getElementById('hint-text');
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const gameOverModal = document.getElementById('game-over-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const wordReveal = document.getElementById('word-reveal');
const playAgainBtn = document.getElementById('play-again-btn');
const reloadBtn = document.getElementById('reload-btn');

// Constants
const MAX_INCORRECT_GUESSES = 6;
const GAME_AREA_WIDTH = 100; // percentage width

// Initialize the game
async function initGame() {
  try {
    // Fetch words from JSON file
    const response = await fetch('data/words.json');
    if (!response.ok) {
      throw new Error('Failed to fetch words');
    }
    
    words = await response.json();
    
    if (words.length === 0) {
      throw new Error('No words available');
    }
    
    // Start a new game
    startNewGame();
    
    // Hide loading screen
    fadeOut(loadingScreen);
    
    // Show hangman display with animation
    setTimeout(() => {
      hangmanDisplay.style.opacity = 1;
    }, 500);
    
  } catch (error) {
    console.error('Error initializing game:', error);
    showError(error.message || 'Failed to initialize game');
  }
}

// Show error screen
function showError(message) {
  const errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = message;
  
  fadeOut(loadingScreen).then(() => {
    errorScreen.classList.remove('hidden');
    fadeIn(errorScreen);
  });
}

// Start a new game
function startNewGame() {
  // Select a random word
  const randomIndex = Math.floor(Math.random() * words.length);
  const selectedWord = words[randomIndex];
  
  // Initialize game state
  gameState = {
    selectedWord: selectedWord.word.toLowerCase(),
    hint: selectedWord.hint,
    guessedLetters: new Set(),
    incorrectGuesses: 0,
    gameStatus: 'playing'
  };
  
  // Reset Pac-Man position and target image
  resetPacManGame();
  
  // Update UI
  updateGuessesRemaining();
  updateHintText();
  updateWordDisplay();
  createKeyboard();
}

// Reset Pac-Man game visuals
function resetPacManGame() {
  pacManImage.style.left = '10%';
  targetImage.src = 'images/normal.png';
  targetImage.alt = 'Target';
  targetImage.classList.remove('shake');
}

function updatePacManPosition() {
  const startPosition = 10;
  const maxPosition = 65;
  const progressPercentage = startPosition + (gameState.incorrectGuesses / MAX_INCORRECT_GUESSES) * (maxPosition - startPosition);
  
  const guessesRemaining = MAX_INCORRECT_GUESSES - gameState.incorrectGuesses;
  
  if (gameState.gameStatus === 'lost') {
    targetImage.src = 'images/lost.png';
    targetImage.alt = 'You lost';
    
    pacManImage.style.left = '55%';
    
    targetImage.classList.remove('shake');
  } else if (gameState.gameStatus === 'won') {
    targetImage.src = 'images/win.png';
    targetImage.alt = 'You won';
    targetImage.classList.remove('shake');
    pacManImage.style.left = `${progressPercentage}%`;
  } else if (guessesRemaining === 1) {
    targetImage.src = 'images/scared.png';
    targetImage.alt = 'Scared Ghost';
    targetImage.classList.add('shake');
    pacManImage.style.left = '45%';
  } else {
    // Normal gameplay
    targetImage.src = 'images/normal.png';
    targetImage.alt = 'Target';
    targetImage.classList.remove('shake');
    pacManImage.style.left = `${progressPercentage}%`;
  }
}

function updateGuessesRemaining() {
  const remaining = MAX_INCORRECT_GUESSES - gameState.incorrectGuesses;
  guessesRemainingText.textContent = `${remaining} guesses remaining`;
}

function updateHintText() {
  hintText.textContent = gameState.hint;
}

function updateWordDisplay() {
  wordDisplay.innerHTML = '';
  
  const wordArray = gameState.selectedWord.split('');
  
  wordArray.forEach((letter, index) => {
    const letterElement = document.createElement('div');
    
    if (letter === ' ') {
      letterElement.className = 'letter-box letter-space';
      letterElement.textContent = ' ';
    } else {
      letterElement.className = 'letter-box';
      
      if (gameState.guessedLetters.has(letter) || gameState.gameStatus !== 'playing') {
        letterElement.textContent = letter.toUpperCase();
      }
    }
    
    wordDisplay.appendChild(letterElement);
  });
}

// Create the keyboard
function createKeyboard() {
  keyboard.innerHTML = '';
  
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];
  
  rows.forEach(row => {
    const rowElement = document.createElement('div');
    rowElement.className = 'keyboard-row';
    
    row.forEach(letter => {
      const keyElement = document.createElement('button');
      keyElement.className = 'keyboard-key';
      keyElement.textContent = letter;
      
      // Disable if already guessed or game is over
      if (gameState.guessedLetters.has(letter) || gameState.gameStatus !== 'playing') {
        keyElement.disabled = true;
      }
      
      keyElement.addEventListener('click', () => handleLetterGuess(letter));
      
      rowElement.appendChild(keyElement);
    });
    
    keyboard.appendChild(rowElement);
  });
}

function handleLetterGuess(letter) {
  if (gameState.gameStatus !== 'playing' || gameState.guessedLetters.has(letter)) {
    return;
  }
  
  gameState.guessedLetters.add(letter);
  
  if (!gameState.selectedWord.includes(letter)) {
    gameState.incorrectGuesses++;
    
    if (gameState.incorrectGuesses >= MAX_INCORRECT_GUESSES) {
      gameState.gameStatus = 'lost';
    }
    
    updatePacManPosition();
    updateGuessesRemaining();
  } else {
    const hasWon = [...gameState.selectedWord].every(letter => 
      gameState.guessedLetters.has(letter) || letter === ' '
    );
    
    if (hasWon) {
      gameState.gameStatus = 'won';
      updatePacManPosition();
    }
  }
  
  // Update UI
  updateWordDisplay();
  createKeyboard();
  
  if (gameState.gameStatus !== 'playing') {
    setTimeout(() => {
      showGameOverModal();
    }, 1000); 
  }
}

function showGameOverModal() {
  const isWon = gameState.gameStatus === 'won';
  
  resultTitle.textContent = isWon ? 'Congratulations!' : 'Game Over';
  resultTitle.className = isWon ? 'success-text' : 'error-text';
  
  resultMessage.textContent = isWon 
    ? 'You correctly guessed the word!' 
    : 'You ran out of guesses.';
  
  wordReveal.innerHTML = `The word was: <span>${gameState.selectedWord}</span>`;
  
  gameOverModal.classList.remove('hidden');
  setTimeout(() => {
    gameOverModal.classList.add('visible');
  }, 10);
}

function hideGameOverModal() {
  gameOverModal.classList.remove('visible');
  setTimeout(() => {
    gameOverModal.classList.add('hidden');
  }, 300);
}

document.addEventListener('DOMContentLoaded', initGame);

playAgainBtn.addEventListener('click', () => {
  hideGameOverModal();
  startNewGame();
});

reloadBtn.addEventListener('click', () => {
  window.location.reload();
});

document.addEventListener('keydown', (event) => {
  if (gameState.gameStatus !== 'playing') return;
  
  const key = event.key.toLowerCase();
  
  // Check if the key is a letter
  if (/^[a-z]$/.test(key) && !gameState.guessedLetters.has(key)) {
    handleLetterGuess(key);
  }
}); 