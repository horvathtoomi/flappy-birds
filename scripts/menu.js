class GameMenu {
    constructor() {
        // Get all screen elements
        this.mainMenu = document.getElementById('mainMenu');
        this.gameContainer = document.getElementById('gameContainer');
        this.leaderboardScreen = document.getElementById('leaderboardScreen');
        this.settingsScreen = document.getElementById('settingsScreen');
        
        // Initialize button listeners
        this.initializeEventListeners();
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
                        ${index + 1}. ${score.name || 'Anonymous'}: ${score.score}
                    </div>
                `).join('');
        }
    }

    saveScore(score) {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        const playerName = prompt('Enter your name for the leaderboard:') || 'Anonymous';
        leaderboard.push({ name: playerName, score: score });
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }
}

// Create instance of GameMenu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameMenu = new GameMenu();
}); 