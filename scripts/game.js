// Canvas és context beállítása
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas méretének beállítása
const GAME_WIDTH = 1920;  // Full HD width
const GAME_HEIGHT = 1080; // Full HD height
let scale = 1;

// Játék állapot
let gameStarted = false;
let gameOver = false;
let gameLoopRunning = false;  // Új változó a játékciklus állapotához

// Alapvető játék változók
const gravity = 0.5;
const jumpForce = -8;

// Madár objektum
const bird = {
    x: GAME_WIDTH / 4,
    y: GAME_HEIGHT / 2,
    velocity: 0,
    width: 68,
    height: 48
};

// Cső beállítások
const PIPE_SPACING = 600;
const PIPE_GAP = 300;
const PIPE_WIDTH = 104;
const PIPE_SPEED = 4;

// Csövek tömbje és pontszám
let pipes = [];
let score = 0;

// Sprite-ok betöltése
const birdSprite = new Image();
birdSprite.src = 'assets/images/bird.png';
const pipeSprite = new Image();
pipeSprite.src = 'assets/images/pipe.png';
const backgroundSprite = new Image();
backgroundSprite.src = 'assets/images/background.png';
let backgroundX = 0;

// Canvas átméretezés kezelése
function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}

// Játék inicializálása
function init() {
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    
    Promise.all([
        new Promise(resolve => birdSprite.onload = resolve),
        new Promise(resolve => pipeSprite.onload = resolve),
        new Promise(resolve => backgroundSprite.onload = resolve)
    ]).then(() => {
        document.addEventListener('keydown', handleJump);
        document.addEventListener('click', handleJump);
        gameLoop();
    }).catch(error => {
        console.error('Error loading game assets:', error);
    });
}

// Ugrás kezelése
function handleJump(event) {
    if (event.type === 'click') {
        const rect = canvas.getBoundingClientRect();
        const clickX = (event.clientX - rect.left) / scale;
        const clickY = (event.clientY - rect.top) / scale;
        if (clickX < 0 || clickX > GAME_WIDTH || clickY < 0 || clickY > GAME_HEIGHT) {
            return;
        }
    }
    
    if ((event.type === 'keydown' && event.code === 'Space') || event.type === 'click') {
        if (gameOver) {
            resetGame();
        } else {
            if (!gameStarted) {
                gameStarted = true;
            }
            bird.velocity = jumpForce;
        }
    }
}

// Cső objektum létrehozása
function createPipe() {
    const gapStart = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    return {
        x: canvas.width,
        gapStart: gapStart,
        gapEnd: gapStart + PIPE_GAP,
        passed: false
    };
}

// Csövek frissítése
function updatePipes() {
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING) {
        pipes.push(createPipe());
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;

        if (!pipes[i].passed && bird.x > pipes[i].x + PIPE_WIDTH) {
            pipes[i].passed = true;
            score++;
            document.getElementById('score').textContent = `Pontszám: ${score}`;
        }

        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Ütközés ellenőrzése
function checkCollision() {
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        return true;
    }

    for (const pipe of pipes) {
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + PIPE_WIDTH) {
            if (bird.y < pipe.gapStart || bird.y + bird.height > pipe.gapEnd) {
                return true;
            }
        }
    }
    return false;
}

// Csövek rajzolása
function drawPipes() {
    for (const pipe of pipes) {
        ctx.save();
        ctx.translate(pipe.x, pipe.gapStart);
        ctx.scale(1, -1);
        ctx.drawImage(pipeSprite, 0, 0, PIPE_WIDTH, pipe.gapStart);
        ctx.restore();
        
        ctx.drawImage(
            pipeSprite,
            pipe.x,
            pipe.gapEnd,
            PIPE_WIDTH,
            canvas.height - pipe.gapEnd
        );
    }
}

// Madár rajzolása
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.rotate(rotation);
    ctx.drawImage(
        birdSprite,
        -bird.width/2,
        -bird.height/2,
        bird.width,
        bird.height
    );
    ctx.restore();
}

// Játék vége képernyő rajzolása
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Játék Vége!', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Végső pontszám: ${score}`, canvas.width / 2, canvas.height / 2 + 80);
}

// Háttér rajzolása
function drawBackground() {
    ctx.drawImage(backgroundSprite, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundSprite, backgroundX + canvas.width, 0, canvas.width, canvas.height);
    
    if (gameStarted && !gameOver) {
        backgroundX -= 2;
        if (backgroundX <= -canvas.width) {
            backgroundX = 0;
        }
    }
}

// Új függvény: Game Over gombok létrehozása
function createGameOverButtons() {
    const existingButtons = document.querySelector('.game-over-buttons');
    if (existingButtons) {
        existingButtons.remove();
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'game-over-buttons';

    const playAgainButton = document.createElement('button');
    playAgainButton.className = 'game-over-button';
    playAgainButton.textContent = 'Play Again';
    playAgainButton.onclick = () => {
        buttonContainer.remove();
        resetGame();
    };

    const leaderboardButton = document.createElement('button');
    leaderboardButton.className = 'game-over-button leaderboard';
    leaderboardButton.textContent = 'Leaderboard';
    leaderboardButton.onclick = () => {
        if (window.gameMenu) {
            window.gameMenu.saveScore(score);
            window.gameMenu.showScreen('leaderboard');
        }
    };

    buttonContainer.appendChild(playAgainButton);
    buttonContainer.appendChild(leaderboardButton);
    document.getElementById('gameContainer').appendChild(buttonContainer);
}

// Játék loop
function gameLoop() {
    if (!gameLoopRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (gameStarted) {
        updatePipes();
        updateBird();
        
        if (checkCollision()) {
            gameOver = true;
            gameLoopRunning = false;
            createGameOverButtons();  // Az új gombok létrehozása
            return;
        }
    }
    
    drawPipes();
    drawBird();
    
    requestAnimationFrame(gameLoop);
}

// Madár frissítése
function updateBird() {
    bird.velocity += gravity;
    bird.y += bird.velocity;
}

// Játék újraindítása
function resetGame() {
    const existingButtons = document.querySelector('.game-over-buttons');
    if (existingButtons) {
        existingButtons.remove();
    }
    
    gameOver = false;
    gameStarted = false;
    score = 0;
    gameLoopRunning = true;
    
    bird.x = GAME_WIDTH / 4;
    bird.y = GAME_HEIGHT / 2;
    bird.velocity = 0;
    
    pipes = [];
    
    document.getElementById('score').textContent = 'Pontszám: 0';
    
    backgroundX = 0;
    
    gameLoop();
}

// Játék indítása
init();