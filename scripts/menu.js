class GameMenu {
    constructor() {
        // Get all screen elements
        this.mainMenu = document.getElementById('mainMenu');
        this.gameContainer = document.getElementById('gameContainer');
        this.leaderboardScreen = document.getElementById('leaderboardScreen');
        this.settingsScreen = document.getElementById('settingsScreen');
        
        // Initialize game counter
        this.initializeGameCount();
        
        // Initialize button listeners
        this.initializeEventListeners();
    }

    initializeGameCount() {
        // Initialize games played counter if it doesn't exist
        if (!localStorage.getItem('gamesPlayed')) {
            localStorage.setItem('gamesPlayed', '0');
        }
        // Initialize default difficulty if it doesn't exist
        if (!localStorage.getItem('gameDifficulty')) {
            localStorage.setItem('gameDifficulty', 'normal');
        }
    }

    incrementGameCount() {
        const currentCount = parseInt(localStorage.getItem('gamesPlayed') || '0');
        const newCount = currentCount + 1;
        localStorage.setItem('gamesPlayed', newCount.toString());
        return newCount;
    }

    initializeEventListeners() {
        // Main menu buttons
        const playButton = document.getElementById('playButton');
        const leaderboardButton = document.getElementById('leaderboardButton');
        const settingsButton = document.getElementById('settingsButton');

        if (playButton) {
            playButton.addEventListener('click', () => {
                this.showScreen('game');
                // Először állítsuk be a canvas méretét
                resizeCanvas();
                // Aztán indítsuk újra a játékot
                resetGame();
            });
        }

        if (leaderboardButton) {
            leaderboardButton.addEventListener('click', () => {
                this.showScreen('leaderboard');
                this.updateLeaderboardDisplay();
            });
        }

        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.showScreen('settings');
            });
        }

        // Difficulty selector kezelése
        const difficultySelector = document.getElementById('difficulty');
        if (difficultySelector) {
            // Beállítjuk a korábban kiválasztott nehézségi szintet
            const savedDifficulty = localStorage.getItem('gameDifficulty') || 'normal';
            difficultySelector.value = savedDifficulty;

            // Figyeljük a változásokat
            difficultySelector.addEventListener('change', () => {
                const selectedDifficulty = difficultySelector.value;
                localStorage.setItem('gameDifficulty', selectedDifficulty);
                // Ha van aktív játék, újraindítjuk az új nehézségi szinttel
                if (window.resetGame) {
                    window.resetGame();
                }
            });
        }

        // Back buttons
        const backButtons = document.querySelectorAll('.back-button');
        backButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.showScreen('main');
            });
        });
    }

    showScreen(screenType) {
        // Hide all screens first
        this.mainMenu.style.display = 'none';
        this.gameContainer.style.display = 'none';
        this.leaderboardScreen.style.display = 'none';
        this.settingsScreen.style.display = 'none';

        // Show the requested screen
        switch(screenType) {
            case 'main':
                this.mainMenu.style.display = 'flex';
                break;
            case 'game':
                this.gameContainer.style.display = 'flex';
                break;
            case 'leaderboard':
                this.leaderboardScreen.style.display = 'flex';
                break;
            case 'settings':
                this.settingsScreen.style.display = 'flex';
                break;
        }
    }

    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboardList');
        const scores = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        
        if (scores.length === 0) {
            leaderboardList.innerHTML = '<p>No scores yet!</p>';
        } else {
            const sortedScores = scores.sort((a, b) => b.score - a.score);
            leaderboardList.innerHTML = sortedScores
                .slice(0, 10)
                .map((score, index) => `
                    <div class="score-entry">
                        ${index + 1}. ${score.name}: ${score.score} (${score.difficulty || 'normal'})
                    </div>
                `).join('');
        }
    }

    saveScore(score) {
        // Get and increment the game count
        const gameNumber = this.incrementGameCount();
        
        // Generate player name based on game number
        const playerName = `Player${gameNumber}`;
        
        // Get current difficulty
        const difficulty = localStorage.getItem('gameDifficulty') || 'normal';
        
        // Get existing leaderboard or create empty array if none exists
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        
        // Add new score with automatically generated name and difficulty
        leaderboard.push({
            name: playerName,
            score: score,
            gameNumber: gameNumber,
            difficulty: difficulty,
            date: new Date().toISOString()
        });
        
        // Save updated leaderboard back to localStorage
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        
        // Update the leaderboard display if it's visible
        this.updateLeaderboardDisplay();
    }
}

// Create instance of GameMenu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameMenu = new GameMenu();
});