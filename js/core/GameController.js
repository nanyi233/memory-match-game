/**
 * GameController - Main game controller
 * Coordinates game flow, player turns, and UI updates
 */
class GameController {
    constructor() {
        this.gameBoard = null;
        this.scoreSystem = window.ScoreSystem;
        this.audioManager = window.AudioManager;
        this.storageManager = window.StorageManager;
        
        this.isMultiplayer = false;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.difficulty = 'medium';
        this.gameState = 'idle'; // idle, playing, paused, finished
        
        // Keyboard navigation
        this.selectedCardIndex = 0;
        this.keyboardNavEnabled = true;
        
        // Touch support
        this.touchStarted = false;
        
        this.init();
    }

    /**
     * Initialize the game controller
     */
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupScoreSystemCallbacks();
    }

    /**
     * Load saved settings
     */
    loadSettings() {
        const settings = this.storageManager.getSettings();
        
        window.CardThemes.setTheme(settings.theme || 'emoji');
        this.audioManager.setVolume((settings.volume || 70) / 100);
        
        if (!settings.soundEnabled) {
            this.audioManager.disable();
        }
        
        this.keyboardNavEnabled = settings.keyboardNav !== false;
        
        // Apply color theme
        this.applyColorTheme(settings.colorTheme || 'default');
        
        // Apply accessibility settings
        if (settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        if (settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    }

    /**
     * Apply color theme to body
     * @param {string} theme - Theme name
     */
    applyColorTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove(
            'theme-default', 'theme-ocean', 'theme-forest',
            'theme-sunset', 'theme-lavender', 'theme-dark'
        );
        
        if (theme !== 'default') {
            document.body.classList.add(`theme-${theme}`);
        }
    }

    /**
     * Setup score system callbacks
     */
    setupScoreSystemCallbacks() {
        this.scoreSystem.onTimeUpdate = (time) => {
            this.updateTimerDisplay(time);
        };
        
        this.scoreSystem.onMovesUpdate = (moves) => {
            this.updateMovesDisplay(moves);
        };
        
        this.scoreSystem.onMatchUpdate = (matches, breakdown) => {
            this.updateMatchesDisplay();
            if (breakdown.comboLevel >= 2) {
                this.showCombo(breakdown.comboLevel);
            }
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Card grid clicks
        const cardGrid = document.getElementById('card-grid');
        cardGrid.addEventListener('click', (e) => this.handleCardClick(e));
        
        // Touch support for mobile devices
        cardGrid.addEventListener('touchend', (e) => this.handleCardTouch(e));
        
        // Prevent default touch behaviors that might interfere
        cardGrid.addEventListener('touchstart', (e) => {
            // Mark that a touch is starting
            this.touchStarted = true;
        }, { passive: true });
    }

    /**
     * Handle card touch for mobile devices
     * @param {TouchEvent} e - Touch event
     */
    handleCardTouch(e) {
        // Only handle if touch was started on the grid
        if (!this.touchStarted) return;
        this.touchStarted = false;
        
        // Get the touched element from the last touch point
        const touch = e.changedTouches[0];
        const cardElement = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.card');
        
        if (!cardElement || this.gameState !== 'playing') return;
        
        // Prevent ghost click
        e.preventDefault();
        
        const card = this.gameBoard.getCardByElement(cardElement);
        if (card) {
            this.handleCardSelection(card);
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing' || !this.keyboardNavEnabled) return;
            
            const gridSize = this.gameBoard?.getGridSize();
            if (!gridSize) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.moveSelection(-gridSize.cols);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveSelection(gridSize.cols);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveSelection(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveSelection(1);
                    break;
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.selectCurrentCard();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.pauseGame();
                    break;
                case 'm':
                case 'M':
                    this.toggleSound();
                    break;
            }
        });
    }

    /**
     * Move keyboard selection
     * @param {number} delta - Direction to move
     */
    moveSelection(delta) {
        const unmatchedIndices = this.gameBoard.getUnmatchedIndices();
        if (unmatchedIndices.length === 0) return;
        
        // Clear current selection
        const currentCard = this.gameBoard.getCardAtIndex(this.selectedCardIndex);
        if (currentCard) currentCard.setSelected(false);
        
        // Find next valid index
        let newIndex = this.selectedCardIndex + delta;
        const gridSize = this.gameBoard.getGridSize();
        
        // Wrap around
        if (newIndex < 0) newIndex = gridSize.total + newIndex;
        if (newIndex >= gridSize.total) newIndex = newIndex % gridSize.total;
        
        // Find nearest unmatched card
        while (!unmatchedIndices.includes(newIndex)) {
            newIndex = (newIndex + Math.sign(delta) + gridSize.total) % gridSize.total;
            if (newIndex === this.selectedCardIndex) break;
        }
        
        this.selectedCardIndex = newIndex;
        const newCard = this.gameBoard.getCardAtIndex(this.selectedCardIndex);
        if (newCard) newCard.setSelected(true);
    }

    /**
     * Select current card with keyboard
     */
    selectCurrentCard() {
        const card = this.gameBoard.getCardAtIndex(this.selectedCardIndex);
        if (card) {
            this.handleCardSelection(card);
        }
    }

    /**
     * Handle card click
     * @param {Event} e - Click event
     */
    handleCardClick(e) {
        const cardElement = e.target.closest('.card');
        if (!cardElement || this.gameState !== 'playing') return;
        
        const card = this.gameBoard.getCardByElement(cardElement);
        if (card) {
            this.handleCardSelection(card);
        }
    }

    /**
     * Handle card selection (click or keyboard)
     * @param {Card} card - Selected card
     */
    async handleCardSelection(card) {
        // Initialize audio on first interaction
        if (!this.audioManager.initialized) {
            await this.audioManager.init();
        }
        
        // Record move when flipping second card
        if (this.gameBoard.flippedCards.length === 1) {
            this.scoreSystem.recordMove();
        }
        
        const result = await this.gameBoard.selectCard(card);
        
        switch (result.action) {
            case 'match':
                this.scoreSystem.recordMatch();
                if (this.isMultiplayer) {
                    this.addPlayerScore(this.currentPlayerIndex);
                    // Player gets another turn on match
                }
                break;
                
            case 'noMatch':
                this.scoreSystem.recordMiss();
                if (this.isMultiplayer) {
                    this.nextPlayer();
                }
                break;
                
            case 'complete':
                this.scoreSystem.recordMatch();
                if (this.isMultiplayer) {
                    this.addPlayerScore(this.currentPlayerIndex);
                }
                this.endGame();
                break;
        }
    }

    /**
     * Start a new single player game
     * @param {string} difficulty - Difficulty level
     */
    startSinglePlayerGame(difficulty) {
        this.isMultiplayer = false;
        this.difficulty = difficulty;
        this.players = [];
        
        this.startGame(difficulty);
    }

    /**
     * Start a new multiplayer game
     * @param {Array<string>} playerNames - Player names
     * @param {string} difficulty - Difficulty level
     */
    startMultiplayerGame(playerNames, difficulty) {
        this.isMultiplayer = true;
        this.difficulty = difficulty;
        this.currentPlayerIndex = 0;
        
        this.players = playerNames.map((name, index) => ({
            id: index,
            name: name || `玩家 ${index + 1}`,
            score: 0,
            matches: 0
        }));
        
        this.startGame(difficulty);
        this.updateMultiplayerUI();
    }

    /**
     * Start the game
     * @param {string} difficulty - Difficulty level
     */
    startGame(difficulty) {
        // Reset systems
        this.scoreSystem.reset();
        this.scoreSystem.setDifficulty(difficulty);
        
        // Create game board
        this.gameBoard = new GameBoard(difficulty);
        this.gameBoard.init();
        
        // Update displays
        this.updateMatchesDisplay();
        this.updateMovesDisplay(0);
        this.updateTimerDisplay(0);
        
        // Set game state
        this.gameState = 'playing';
        this.selectedCardIndex = 0;
        
        // Start timer after a brief delay
        setTimeout(() => {
            if (this.gameState === 'playing') {
                this.scoreSystem.startTimer();
            }
        }, 500);
        
        // Play click sound
        this.audioManager.play('click');
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        this.scoreSystem.pauseTimer();
        this.gameBoard.disableAllCards();
        
        // Show pause menu
        document.getElementById('pause-menu').classList.remove('hidden');
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.scoreSystem.resumeTimer();
        this.gameBoard.enableAllCards();
        
        // Hide pause menu
        document.getElementById('pause-menu').classList.add('hidden');
    }

    /**
     * Restart the current game
     */
    restartGame() {
        document.getElementById('pause-menu').classList.add('hidden');
        
        if (this.isMultiplayer) {
            const playerNames = this.players.map(p => p.name);
            this.startMultiplayerGame(playerNames, this.difficulty);
        } else {
            this.startSinglePlayerGame(this.difficulty);
        }
    }

    /**
     * End the game
     */
    endGame() {
        this.gameState = 'finished';
        this.scoreSystem.stopTimer();
        this.gameBoard.disableAllCards();
        
        // Play victory sound
        this.audioManager.play('victory');
        
        // Show confetti
        this.showConfetti();
        
        // Calculate final score
        const finalScore = this.scoreSystem.calculateFinalScore(this.gameBoard.totalPairs);
        
        // Show game over screen
        setTimeout(() => {
            this.showGameOver(finalScore);
        }, 1000);
    }

    /**
     * Quit current game
     */
    quitGame() {
        this.gameState = 'idle';
        this.scoreSystem.stopTimer();
        
        if (this.gameBoard) {
            this.gameBoard.clear();
        }
        
        document.getElementById('pause-menu').classList.add('hidden');
    }

    /**
     * Add score to a player in multiplayer
     * @param {number} playerIndex - Player index
     */
    addPlayerScore(playerIndex) {
        if (!this.players[playerIndex]) return;
        
        this.players[playerIndex].score++;
        this.players[playerIndex].matches++;
        this.updateMultiplayerUI();
    }

    /**
     * Switch to next player in multiplayer
     */
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateMultiplayerUI();
        this.audioManager.play('turnChange');
    }

    /**
     * Update multiplayer UI
     */
    updateMultiplayerUI() {
        const playersInfo = document.getElementById('players-info');
        playersInfo.innerHTML = this.players.map((player, index) => `
            <div class="player-card ${index === this.currentPlayerIndex ? 'active' : ''}">
                <span class="player-name">${player.name}</span>
                <span class="player-score">${player.score}</span>
            </div>
        `).join('');
        
        document.getElementById('multiplayer-bar').classList.remove('hidden');
    }

    /**
     * Update timer display
     * @param {number} time - Time in seconds
     */
    updateTimerDisplay(time) {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = this.scoreSystem.formatTime(time);
        
        // Warning animation at certain thresholds
        if (time > 0 && time % 60 === 0) {
            timerEl.classList.add('timer-warning');
            setTimeout(() => timerEl.classList.remove('timer-warning'), 1000);
        }
    }

    /**
     * Update moves display
     * @param {number} moves - Move count
     */
    updateMovesDisplay(moves) {
        document.getElementById('moves').textContent = moves;
    }

    /**
     * Update matches display
     */
    updateMatchesDisplay() {
        const progress = this.gameBoard.getProgress();
        document.getElementById('matches').textContent = 
            `${progress.matched}/${progress.total}`;
    }

    /**
     * Show combo notification
     * @param {number} comboLevel - Current combo level
     */
    showCombo(comboLevel) {
        const comboDisplay = document.getElementById('combo-display');
        const comboCount = document.getElementById('combo-count');
        
        comboCount.textContent = `x${comboLevel}`;
        comboDisplay.classList.remove('hidden');
        
        setTimeout(() => {
            comboDisplay.classList.add('hidden');
        }, 800);
    }

    /**
     * Show game over screen
     * @param {Object} finalScore - Final score breakdown
     */
    showGameOver(finalScore) {
        // Update score displays
        document.getElementById('final-time').textContent = 
            this.scoreSystem.formatTime(finalScore.time);
        document.getElementById('final-moves').textContent = finalScore.moves;
        document.getElementById('final-score').textContent = finalScore.total;
        
        // Star rating
        const stars = '⭐'.repeat(finalScore.stars) + '☆'.repeat(3 - finalScore.stars);
        document.getElementById('star-rating').textContent = stars;
        
        // Multiplayer results
        if (this.isMultiplayer) {
            this.showMultiplayerResults();
        } else {
            document.getElementById('mp-results').classList.add('hidden');
        }
        
        // Show/hide name input based on high score
        const isHighScore = this.storageManager.isHighScore(this.difficulty, finalScore.total);
        document.getElementById('name-input-section').style.display = 
            isHighScore && !this.isMultiplayer ? 'block' : 'none';
        
        // Store score data for saving
        this.lastScore = {
            score: finalScore.total,
            time: finalScore.time,
            moves: finalScore.moves,
            stars: finalScore.stars
        };
        
        // Show modal
        document.getElementById('game-over').classList.remove('hidden');
    }

    /**
     * Show multiplayer results
     */
    showMultiplayerResults() {
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        const rankingHtml = sortedPlayers.map((player, index) => `
            <div class="rank-item ${index === 0 ? 'winner' : ''}">
                <span class="rank">${index === 0 ? '🏆' : `#${index + 1}`}</span>
                <span class="name">${player.name}</span>
                <span class="score">${player.score} 对</span>
            </div>
        `).join('');
        
        document.getElementById('mp-ranking').innerHTML = rankingHtml;
        document.getElementById('mp-results').classList.remove('hidden');
        document.getElementById('name-input-section').style.display = 'none';
    }

    /**
     * Save score to leaderboard
     * @param {string} playerName - Player name
     */
    saveScore(playerName) {
        if (!this.lastScore || this.isMultiplayer) return;
        
        const rank = this.storageManager.saveScore(this.difficulty, {
            name: playerName || '匿名玩家',
            ...this.lastScore
        });
        
        if (rank > 0) {
            window.UIManager.showToast(`恭喜！你获得了第 ${rank} 名！`);
        }
    }

    /**
     * Toggle sound on/off
     */
    toggleSound() {
        const enabled = this.audioManager.toggle();
        const btn = document.getElementById('sound-toggle');
        btn.textContent = enabled ? '🔊' : '🔇';
        
        this.storageManager.updateSetting('soundEnabled', enabled);
    }

    /**
     * Show confetti animation
     */
    showConfetti() {
        const colors = ['#667eea', '#764ba2', '#48bb78', '#ed8936', '#f56565'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 50);
        }
    }

    /**
     * Get current game state
     * @returns {Object}
     */
    getState() {
        return {
            gameState: this.gameState,
            difficulty: this.difficulty,
            isMultiplayer: this.isMultiplayer,
            players: this.players,
            currentPlayer: this.players[this.currentPlayerIndex],
            stats: this.scoreSystem.getStats(),
            progress: this.gameBoard?.getProgress()
        };
    }
}

// Export GameController
window.GameController = GameController;
