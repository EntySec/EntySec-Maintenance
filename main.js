function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gameSelect = document.getElementById("gameSelect");

function showMessage(message) {
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

// Shared state
let animationId;
let currentGame = 'dino';

// ------------------ DINO GAME ------------------
const dinoImg = new Image();
dinoImg.src = "dino.png";

const cactusImg = new Image();
cactusImg.src = "tower.png";

let dino, obstacles, score, gameSpeed, gravity, frame, dinoGameOver;

function resetDinoGame() {
    dino = {
        x: 50,
        y: 100,
        width: 40,
        height: 40,
        vy: 0,
        jumpForce: 10,
        grounded: false
    };
    gravity = 0.6;
    obstacles = [];
    score = 0;
    gameSpeed = 4;
    frame = 0;
    dinoGameOver = false;
    runDinoGame();
}

function runDinoGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dino
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    // Update dino
    dino.y += dino.vy;
    if (!dino.grounded) dino.vy += gravity;
    if (dino.y + dino.height >= canvas.height) {
        dino.y = canvas.height - dino.height;
        dino.vy = 0;
        dino.grounded = true;
    }

    // Obstacles
    if (frame % 90 === 0) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 40,
            width: 25,
            height: 40
        });
    }

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;
        ctx.drawImage(cactusImg, obs.x, obs.y, obs.width, obs.height);

        if (
            dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y
        ) {
            dinoGameOver = true;
        }
    }

    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
    ctx.fillStyle = "#888";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 400, 20);

    if (dinoGameOver) {
        showMessage("Game Over – Press Space", )
        //ctx.fillText("Game Over – Press Space", 140, 80);
        return;
    }

    score++;
    frame++;
    animationId = requestAnimationFrame(runDinoGame);
}

function jumpDino() {
    if (dinoGameOver) {
        cancelAnimationFrame(animationId);
        resetDinoGame();
    } else if (dino.grounded) {
        dino.vy = -dino.jumpForce;
        dino.grounded = false;
    }
}

// ------------------ SNAKE ------------------
let snake, food, snakeDirection, snakeScore, snakeGameOver;

function resetSnakeGame() {
    snake = [{
            x: 5,
            y: 5
        },
        {
            x: 4,
            y: 5
        },
        {
            x: 3,
            y: 5
        }
    ];
    food = generateFood();
    snakeDirection = "right";
    snakeScore = 0;
    snakeGameOver = false;

    runSnakeGame();
}

function generateFood() {
    const gridSize = 20;
    const maxX = Math.floor(canvas.width / gridSize);
    const maxY = Math.floor(canvas.height / gridSize);
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y)); // retry if overlaps

    return newFood;
}


function runSnakeGame() {
    if (snakeGameOver) {
        // Clear frame, draw Game Over screen
        showMessage("Game Over - Press Space")
        return; // Stop loop
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gridSize = 20;

    // Move snake
    const head = {
        ...snake[0]
    };

    switch (snakeDirection) {
        case "right":
            head.x += 1;
            break;
        case "left":
            head.x -= 1;
            break;
        case "up":
            head.y -= 1;
            break;
        case "down":
            head.y += 1;
            break;
    }

    // Check collisions
    if (
        head.x < 0 || head.y < 0 ||
        head.x >= canvas.width / gridSize ||
        head.y >= canvas.height / gridSize ||
        snake.some(s => s.x === head.x && s.y === head.y)
    ) {
        snakeGameOver = true;
        runSnakeGame(); // Redraw game over frame
        return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
        snakeScore++;
    } else {
        snake.pop(); // move forward
    }

    // Draw food
    ctx.fillStyle = "#f55";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Draw snake
    ctx.fillStyle = "#333";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Score
    ctx.fillStyle = "#888";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + snakeScore, 400, 20);

    animationId = setTimeout(runSnakeGame, 150); // ⏱️ Slowed down here
}


function controlSnake(e) {
    if (snakeGameOver) {
        resetSnakeGame();
        return;
    }

    switch (e.code) {
        case "ArrowUp":
            if (snakeDirection !== "down") snakeDirection = "up";
            break;
        case "ArrowDown":
            if (snakeDirection !== "up") snakeDirection = "down";
            break;
        case "ArrowLeft":
            if (snakeDirection !== "right") snakeDirection = "left";
            break;
        case "ArrowRight":
            if (snakeDirection !== "left") snakeDirection = "right";
            break;
    }
}

// ------------------ HANDLERS ------------------
document.addEventListener("keydown", (e) => {
    // Prevent spacebar from triggering tab click again
    if (
        (e.code === "Space" || e.code === "ArrowUp") &&
        document.activeElement.classList.contains("tab")
    ) {
        e.preventDefault(); // Prevent re-click
    }

    if (currentGame === "snake") {
        controlSnake(e);
    }

    // Now run the intended game input
    if (e.code === "Space" || e.code === "ArrowUp") {
        if (currentGame === "dino") {
            jumpDino();
        }
    }
});


const snakeTab = document.getElementById("snakeTab");
const dinoTab = document.getElementById("dinoTab");
const slider = document.querySelector(".tab-slider");

function moveSliderTo(tab) {
    const parent = tab.parentElement;
    const tabOffset = tab.offsetLeft;
    const tabWidth = tab.offsetWidth;

    slider.style.left = `${tabOffset}px`;
    slider.style.width = `${tabWidth}px`;
}


function switchGame(game) {
    cancelAnimationFrame(animationId);
    clearTimeout(animationId); // for Snake
    frame = 0;
    currentGame = game;

    if (game === "dino") {
        dinoTab.classList.add("active");
        snakeTab.classList.remove("active");
        moveSliderTo(dinoTab);
        if (isMobile()) {
            return;
        }

        resetDinoGame();
    } else {
        snakeTab.classList.add("active");
        dinoTab.classList.remove("active");
        moveSliderTo(snakeTab);
        if (isMobile()) {
            return;
        }

        resetSnakeGame();
    }
}

snakeTab.addEventListener("click", () => switchGame("snake"));
dinoTab.addEventListener("click", () => switchGame("dino"));

window.addEventListener('resize', () => {
    const activeTab = currentGame === "dino" ? dinoTab : snakeTab;
    moveSliderTo(activeTab);
});


// Start initial game
window.onload = () => {
    switchGame("dino");
    if (isMobile()) {
        showMessage("Please use a PC to play this game");
    }
};