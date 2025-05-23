const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const gameOverDiv = document.getElementById("gameOver");
const finalScoreElement = document.getElementById("finalScore");
const difficultySelect = document.getElementById("difficulty");
const scoresList = document.getElementById("scoresList");
const resetScoresBtn = document.getElementById("resetScoresBtn");
const resetWarning = document.getElementById("resetWarning");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");

const gridSize = 18;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let isGameRunning = false;
let highScores = {
  easy: JSON.parse(localStorage.getItem("snakeHighScoresEasy")) || [],
  medium: JSON.parse(localStorage.getItem("snakeHighScoresMedium")) || [],
  hard: JSON.parse(localStorage.getItem("snakeHighScoresHard")) || [],
};

const eatSound = new Audio("sounds/zaki-go3ra.mp3");
const gameOverSound = new Audio("sounds/hawik.mp3");
const highScoreSound = new Audio("sounds/fakhr.mp3");

function stopAllSounds() {
  eatSound.pause();
  eatSound.currentTime = 0;
  gameOverSound.pause();
  gameOverSound.currentTime = 0;
  highScoreSound.pause();
  highScoreSound.currentTime = 0;
}

const algerianFlag = new Image();
algerianFlag.src =
  "https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Algeria.svg";

function initGame() {
  snake = [{ x: 10, y: 10 }];
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
  dx = 0;
  dy = 0;
  score = 0;
  scoreElement.textContent = `Score: ${score}`;
  gameOverDiv.style.display = "none";
  isGameRunning = true;
  canvas.style.cursor = "none";
}

function startGame() {
  if (isGameRunning) return;
  initGame();
  const speed = parseInt(difficultySelect.value);
  gameInterval = setInterval(drawGame, speed);
}

function stopGame() {
  clearInterval(gameInterval);
  isGameRunning = false;
}

document.addEventListener("keydown", (event) => {
  if (!isGameRunning) {
    event.preventDefault();
    return;
  }

  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  const keyPressed = event.keyCode;
  const goingUp = dy === -1;
  const goingDown = dy === 1;
  const goingRight = dx === 1;
  const goingLeft = dx === -1;

  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -1;
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -1;
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 1;
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 1;
  }
});

function drawGame() {
  if (!isGameRunning) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = `Score: ${score}`;
    stopAllSounds();
    eatSound.play();
    generateFood();
  } else {
    snake.pop();
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#333";
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }

  snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(
      segment.x * gridSize,
      segment.y * gridSize,
      (segment.x + 1) * gridSize,
      (segment.y + 1) * gridSize
    );
    gradient.addColorStop(0, "#4CAF50");
    gradient.addColorStop(1, "#45a049");
    ctx.fillStyle = gradient;
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });

  const foodX = food.x * gridSize;
  const foodY = food.y * gridSize;
  const flagSize = gridSize - 2;

  ctx.drawImage(algerianFlag, foodX + 1, foodY + 1, flagSize, flagSize);

  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount ||
    checkCollision()
  ) {
    gameOver();
  }
}

function generateFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );
  food = newFood;
}

function checkCollision() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      return true;
    }
  }
  return false;
}

function gameOver() {
  stopGame();
  finalScoreElement.textContent = `Final Score: ${score}`;
  gameOverDiv.style.display = "block";
  canvas.style.cursor = "default";

  const difficulty = difficultySelect.value;
  let difficultyKey;
  switch (difficulty) {
    case "200":
      difficultyKey = "easy";
      break;
    case "100":
      difficultyKey = "medium";
      break;
    case "50":
      difficultyKey = "hard";
      break;
  }

  stopAllSounds();

  const isInTop7 =
    highScores[difficultyKey].length < 7 ||
    score >= highScores[difficultyKey][highScores[difficultyKey].length - 1];
  const scoreExists = highScores[difficultyKey].includes(score);

  if (isInTop7) {
    if (!scoreExists) {
      highScores[difficultyKey].push(score);
      highScores[difficultyKey].sort((a, b) => b - a);
      highScores[difficultyKey] = highScores[difficultyKey].slice(0, 7);
    }
    highScoreSound.play();
  } else {
    gameOverSound.play();
  }

  localStorage.setItem(
    `snakeHighScores${
      difficultyKey.charAt(0).toUpperCase() + difficultyKey.slice(1)
    }`,
    JSON.stringify(highScores[difficultyKey])
  );

  updateHighScores();
}

function updateHighScores() {
  const difficulty = difficultySelect.value;
  let difficultyKey;
  switch (difficulty) {
    case "200":
      difficultyKey = "easy";
      break;
    case "100":
      difficultyKey = "medium";
      break;
    case "50":
      difficultyKey = "hard";
      break;
  }

  const newScore = score;

  scoresList.innerHTML = "";
  highScores[difficultyKey].forEach((scoreValue, index) => {
    const li = document.createElement("li");

    if (scoreValue === newScore) {
      setTimeout(() => {
        if (
          highScores[difficultyKey].filter((s) => s === newScore).length > 1
        ) {
          li.classList.add("duplicate-score");
        } else {
          li.classList.add("new-score");
        }
      }, 50);
    }

    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏆";
    li.innerHTML = `<span>${
      index + 1
    }</span><span>${medal}</span><span>${scoreValue}</span>`;
    scoresList.appendChild(li);
  });
}

function resetHighScores() {
  resetWarning.style.display = "flex";
}

function handleReset() {
  highScores = {
    easy: [],
    medium: [],
    hard: [],
  };

  localStorage.removeItem("snakeHighScoresEasy");
  localStorage.removeItem("snakeHighScoresMedium");
  localStorage.removeItem("snakeHighScoresHard");

  updateHighScores();
  resetWarning.style.display = "none";
}

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", () => {
  difficultySelect.blur();
  updateHighScores();
  if (isGameRunning) {
    stopGame();
    startGame();
  }
});

resetScoresBtn.addEventListener("click", resetHighScores);
confirmReset.addEventListener("click", handleReset);
cancelReset.addEventListener("click", () => {
  resetWarning.style.display = "none";
});

updateHighScores();
