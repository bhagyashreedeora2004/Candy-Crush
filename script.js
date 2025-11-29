const size = 8;
const symbols = ["🕷","🎃","💀","👁","🩸","🕯"];

let board = [];
let selectedTile = null;
let score = 0;
let level = 1;
let moves = 30;

const boardEl = document.getElementById("gameBoard");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("movesLeft");
const levelEl = document.getElementById("levelNumber");
const levelPopup = document.getElementById("levelComplete");
const nextLevelBtn = document.getElementById("nextLevelBtn");

// ⭐ Music Controls
const musicBtn = document.getElementById("musicBtn");
const bgMusic = document.getElementById("bgMusic");
let musicPlaying = false;

musicBtn.addEventListener("click", () => {
  if (!musicPlaying) {
    bgMusic.pause();
    musicPlaying = true;
    musicBtn.textContent = "🔇 Mute";
  } else {
    bgMusic.play();
    musicPlaying = false;
    musicBtn.textContent = "🎵 Music";
  }
});

function createBoard() {
  board = [];
  boardEl.innerHTML = "";

  for (let i = 0; i < size * size; i++) {
    let tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.index = i;
    tile.textContent = randomCandy();
    tile.addEventListener("click", () => selectTile(i));
    board.push(tile);
    boardEl.appendChild(tile);
  }

  removeInitialMatches();
  ensureValidMoves();
}

function randomCandy() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function getTile(i) {
  return board[i];
}

function swap(i1, i2) {
  const temp = board[i1].textContent;
  board[i1].textContent = board[i2].textContent;
  board[i2].textContent = temp;
}

function selectTile(index) {
  if (!selectedTile) {
    selectedTile = index;
    board[index].style.transform = "scale(1.2)";
  } else {
    board[selectedTile].style.transform = "scale(1)";
    if (isAdjacent(selectedTile, index)) {
      swap(selectedTile, index);
      if (!findMatches()) {
        swap(selectedTile, index); 
      } else {
        moves--;
        movesEl.innerText = moves;
        resolveMatches();
        checkLevelComplete();
      }
    }
    selectedTile = null;
  }
}

function isAdjacent(a, b) {
  const rowA = Math.floor(a / size);
  const colA = a % size;
  const rowB = Math.floor(b / size);
  const colB = b % size;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
}

function findMatches() {
  let found = false;

  for (let i = 0; i < board.length; i++) {
    if (i % size < size - 2) {
      if (getTile(i).textContent === getTile(i+1).textContent &&
          getTile(i).textContent === getTile(i+2).textContent) {
        found = true;
      }
    }
    if (i < size * (size - 2)) {
      if (getTile(i).textContent === getTile(i+size).textContent &&
          getTile(i).textContent === getTile(i+size*2).textContent) {
        found = true;
      }
    }
  }
  return found;
}

function removeMatches() {
  for (let i = 0; i < board.length; i++) {
    if (i % size < size - 2 &&
      getTile(i).textContent === getTile(i+1).textContent &&
      getTile(i).textContent === getTile(i+2).textContent) {
      mark(i, i+1, i+2);
    }
    if (i < size * (size - 2) &&
      getTile(i).textContent === getTile(i+size).textContent &&
      getTile(i).textContent === getTile(i+size*2).textContent) {
      mark(i, i+size, i+size*2);
    }
  }
}

function mark(...indexes) {
  indexes.forEach(i => {
    getTile(i).textContent = "💥";
    score += 20;
    scoreEl.innerText = score;
  });
}

function collapse() {
  for (let col = 0; col < size; col++) {
    let empty = [];
    for (let row = size - 1; row >= 0; row--) {
      let i = row * size + col;
      if (getTile(i).textContent === "💥") empty.push(i);
      else if (empty.length) {
        let swapIndex = empty.shift();
        swap(i, swapIndex);
        empty.push(i);
      }
    }
    empty.forEach(i => (getTile(i).textContent = randomCandy()));
  }
}

function resolveMatches() {
  setTimeout(() => {
    if (!findMatches()) return;
    removeMatches();
    setTimeout(() => {
      collapse();
      resolveMatches();
    }, 300);
  }, 200);
}

function removeInitialMatches() {
  while (findMatches()) {
    removeMatches();
    collapse();
  }
}

function hasValidMove() {
  for (let i = 0; i < board.length; i++) {
    const neighbors = [i+1, i-1, i+size, i-size];
    for (let n of neighbors) {
      if (n >= 0 && n < board.length) {
        swap(i, n);
        if (findMatches()) {
          swap(i, n);
          return true;
        }
        swap(i, n);
      }
    }
  }
  return false;
}

function ensureValidMoves() {
  while (!hasValidMove()) {
    createBoard();
  }
}

function checkLevelComplete() {
  if (score >= level * 300) {
    levelPopup.classList.remove("hidden");
  }
}

nextLevelBtn.addEventListener("click", () => {
  level++;
  score = 0;
  moves = 30;
  levelEl.innerText = level;
  scoreEl.innerText = score;
  movesEl.innerText = moves;
  levelPopup.classList.add("hidden");
  createBoard();
});

createBoard();
