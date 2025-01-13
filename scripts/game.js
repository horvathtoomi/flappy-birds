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

// Alapvető játék változók
const gravity = 0.5;
const jumpForce = -8;

// Madár objektum
const bird = {
    x: GAME_WIDTH / 4,  // Position bird at 1/4 of screen width
    y: GAME_HEIGHT / 2,
    velocity: 0,
    width: 68,    // Double the size for larger resolution
    height: 48    // Double the size for larger resolution
};

// Cső beállítások
const PIPE_SPACING = 600;    // Increased spacing between pipes
const PIPE_GAP = 300;       // Increased vertical gap
const PIPE_WIDTH = 104;     // Double the pipe width
const PIPE_SPEED = 4;       // Slightly faster speed for larger screen

// Csövek tömbje és pontszám
let pipes = [];
let score = 0;

// Add near the top with other constants
const birdSprite = new Image();
birdSprite.src = 'assets/images/bird.png';
const pipeSprite = new Image();
pipeSprite.src = 'assets/images/pipe.png';
const backgroundSprite = new Image();
backgroundSprite.src = 'assets/images/background.png';
let backgroundX = 0;

// Add this function to handle resizing
function resizeCanvas() {
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
}

// Játék inicializálása
function init() {
    // Set initial canvas size
    resizeCanvas();
    
    // Add resize event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Wait for images to load before starting
    Promise.all([
        new Promise(resolve => birdSprite.onload = resolve),
        new Promise(resolve => pipeSprite.onload = resolve),
        new Promise(resolve => backgroundSprite.onload = resolve)
    ]).then(() => {
        // Add event listeners
        document.addEventListener('keydown', handleJump);
        document.addEventListener('click', handleJump);
        
        // Start game loop
        gameLoop();
    }).catch(error => {
        console.error('Error loading game assets:', error);
    });
}

// Ugrás kezelése
function handleJump(event) {
    if (event.type === 'click') {
        // Get canvas bounds
        const rect = canvas.getBoundingClientRect();
        // Check if click is within scaled canvas bounds
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
    // Új cső hozzáadása, ha szükséges
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING) {
        pipes.push(createPipe());
    }

    // Csövek mozgatása és törlése
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;

        // Pontszám növelése, ha a madár átment a csövön
        if (!pipes[i].passed && bird.x > pipes[i].x + PIPE_WIDTH) {
            pipes[i].passed = true;
            score++;
            document.getElementById('score').textContent = `Pontszám: ${score}`;
        }

        // Cső törlése, ha kiért a képernyőből
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Ütközés ellenőrzése
function checkCollision() {
    // Ütközés a földdel vagy a plafonnal
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        return true;
    }

    // Ütközés a csövekkel
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
        // Upper pipe (flipped)
        ctx.save();
        ctx.translate(pipe.x, pipe.gapStart);
        ctx.scale(1, -1);  // Flip the image vertically
        ctx.drawImage(pipeSprite, 0, 0, PIPE_WIDTH, pipe.gapStart);
        ctx.restore();
        
        // Lower pipe
        ctx.drawImage(
            pipeSprite,
            pipe.x,
            pipe.gapEnd,
            PIPE_WIDTH,
            canvas.height - pipe.gapEnd
        );
    }
}

// Játék újraindítása
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameStarted = false;
    gameOver = false;
    document.getElementById('score').textContent = `Pontszám: ${score}`;
}

// Madár rajzolása
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    
    // Add rotation based on velocity (makes bird tilt up/down)
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.rotate(rotation);
    
    // Draw the bird sprite instead of a rectangle
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
    ctx.fillText('Kattints az újraindításhoz', canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText(`Végső pontszám: ${score}`, canvas.width / 2, canvas.height / 2 + 80);
}

// Kezdőképernyő rajzolása
function drawStartScreen() {
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Kattints a kezdéshez!', canvas.width / 2, canvas.height / 2);
}

// Add new function to draw the scrolling background
function drawBackground() {
    // Draw two copies of the background side by side
    ctx.drawImage(backgroundSprite, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundSprite, backgroundX + canvas.width, 0, canvas.width, canvas.height);
    
    // Move the background to create scrolling effect
    if (gameStarted && !gameOver) {
        backgroundX -= 2; // Adjust speed as needed
        // Reset position when first image moves completely off screen
        if (backgroundX <= -canvas.width) {
            backgroundX = 0;
        }
    }
}

// Játék loop
function gameLoop() {
    // Képernyő tisztítása
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background first
    drawBackground();

    if (gameStarted && !gameOver) {
        // Madár mozgatása
        bird.velocity += gravity;
        bird.y += bird.velocity;

        // Csövek frissítése
        updatePipes();

        // Ütközés ellenőrzése
        if (checkCollision()) {
            gameOver = true;
        }
    }

    // Játékelemek rajzolása
    drawPipes();
    drawBird();

    // Kezdőképernyő vagy játék vége képernyő megjelenítése
    if (!gameStarted) {
        drawStartScreen();
    } else if (gameOver) {
        drawGameOver();
    }

    // Következő frame kérése
    requestAnimationFrame(gameLoop);
}

// Játék indítása
init();