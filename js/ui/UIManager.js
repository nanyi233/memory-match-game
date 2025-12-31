/**
 * UIManager - Manages UI screens and interactions
 * Handles screen transitions, settings, and leaderboard display
 */
class UIManager {
    constructor() {
        this.currentScreen = 'main-menu';
        this.screens = [
            'main-menu', 'difficulty-screen', 'multiplayer-screen',
            'game-screen', 'leaderboard-screen', 'settings-screen',
            'how-to-play-screen'
        ];
        
        this.gameController = null;
    }

    /**
     * Initialize UI manager
     * @param {GameController} gameController - Game controller instance
     */
    init(gameController) {
        this.gameController = gameController;
        this.setupEventListeners();
        this.loadSettings();
        this.showScreen('main-menu');
    }

    /**
     * Setup all UI event listeners
     */
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('single-player-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('difficulty-screen');
        });
        
        document.getElementById('multi-player-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('multiplayer-screen');
        });
        
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('leaderboard-screen');
            this.loadLeaderboard('easy');
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('settings-screen');
        });
        
        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.showScreen('how-to-play-screen');
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playButtonSound();
                this.showScreen('main-menu');
            });
        });

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playButtonSound();
                const difficulty = btn.dataset.difficulty;
                this.startSinglePlayerGame(difficulty);
            });
        });

        // Multiplayer setup
        this.setupMultiplayerListeners();

        // Game controls
        this.setupGameControls();

        // Settings
        this.setupSettingsListeners();

        // Leaderboard
        this.setupLeaderboardListeners();

        // Game over
        this.setupGameOverListeners();
    }

    /**
     * Setup multiplayer screen listeners
     */
    setupMultiplayerListeners() {
        const playerCountSelect = document.getElementById('player-count');
        
        playerCountSelect.addEventListener('change', () => {
            this.updatePlayerInputs(parseInt(playerCountSelect.value));
        });
        
        document.getElementById('start-multiplayer').addEventListener('click', () => {
            this.playButtonSound();
            this.startMultiplayerGame();
        });
    }

    /**
     * Update player name inputs based on count
     * @param {number} count - Number of players
     */
    updatePlayerInputs(count) {
        const container = document.getElementById('player-names');
        container.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const div = document.createElement('div');
            div.className = 'player-input';
            div.innerHTML = `
                <label for="player${i}-name">玩家 ${i}：</label>
                <input type="text" id="player${i}-name" placeholder="输入名字" maxlength="10">
            `;
            container.appendChild(div);
        }
    }

    /**
     * Setup game control listeners
     */
    setupGameControls() {
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.gameController.pauseGame();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.gameController.toggleSound();
        });

        // Pause menu buttons
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.gameController.resumeGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.gameController.restartGame();
        });

        document.getElementById('quit-btn').addEventListener('click', () => {
            this.playButtonSound();
            this.gameController.quitGame();
            this.showScreen('main-menu');
        });
    }

    /**
     * Setup settings listeners
     */
    setupSettingsListeners() {
        // Theme selection
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playButtonSound();
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const theme = btn.dataset.theme;
                window.CardThemes.setTheme(theme);
                window.StorageManager.updateSetting('theme', theme);
            });
        });

        // Color theme selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playButtonSound();
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const color = btn.dataset.color;
                this.gameController.applyColorTheme(color);
                window.StorageManager.updateSetting('colorTheme', color);
            });
        });

        // Sound enabled toggle
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            const enabled = e.target.checked;
            if (enabled) {
                window.AudioManager.enable();
            } else {
                window.AudioManager.disable();
            }
            window.StorageManager.updateSetting('soundEnabled', enabled);
        });

        // Volume slider
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            window.AudioManager.setVolume(volume / 100);
            window.StorageManager.updateSetting('volume', volume);
        });

        // Keyboard navigation toggle
        document.getElementById('keyboard-nav').addEventListener('change', (e) => {
            this.gameController.keyboardNavEnabled = e.target.checked;
            window.StorageManager.updateSetting('keyboardNav', e.target.checked);
        });

        // High contrast toggle
        document.getElementById('high-contrast').addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.target.checked);
            window.StorageManager.updateSetting('highContrast', e.target.checked);
        });

        // Reduced motion toggle
        document.getElementById('reduced-motion').addEventListener('change', (e) => {
            document.body.classList.toggle('reduced-motion', e.target.checked);
            window.StorageManager.updateSetting('reducedMotion', e.target.checked);
        });
    }

    /**
     * Setup leaderboard listeners
     */
    setupLeaderboardListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playButtonSound();
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadLeaderboard(btn.dataset.tab);
            });
        });

        // Clear scores button
        document.getElementById('clear-scores-btn').addEventListener('click', () => {
            if (confirm('确定要清除所有排行榜记录吗？')) {
                window.StorageManager.clearScores();
                const activeTab = document.querySelector('.tab-btn.active');
                this.loadLeaderboard(activeTab?.dataset.tab || 'easy');
                this.showToast('排行榜已清除');
            }
        });
    }

    /**
     * Setup game over listeners
     */
    setupGameOverListeners() {
        document.getElementById('save-score-btn').addEventListener('click', () => {
            this.playButtonSound();
            const nameInput = document.getElementById('player-name-input');
            const name = nameInput.value.trim();
            this.gameController.saveScore(name);
            document.getElementById('game-over').classList.add('hidden');
            this.showScreen('main-menu');
        });

        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.playButtonSound();
            document.getElementById('game-over').classList.add('hidden');
            this.gameController.restartGame();
        });

        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.playButtonSound();
            document.getElementById('game-over').classList.add('hidden');
            this.gameController.quitGame();
            this.showScreen('main-menu');
        });
    }

    /**
     * Load settings into UI
     */
    loadSettings() {
        const settings = window.StorageManager.getSettings();

        // Set theme button active
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === settings.theme);
        });

        // Set color button active
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === settings.colorTheme);
        });

        // Set checkboxes
        document.getElementById('sound-enabled').checked = settings.soundEnabled;
        document.getElementById('volume-slider').value = settings.volume;
        document.getElementById('keyboard-nav').checked = settings.keyboardNav;
        document.getElementById('high-contrast').checked = settings.highContrast;
        document.getElementById('reduced-motion').checked = settings.reducedMotion;

        // Update sound toggle button
        document.getElementById('sound-toggle').textContent = settings.soundEnabled ? '🔊' : '🔇';
    }

    /**
     * Show a specific screen
     * @param {string} screenId - Screen ID to show
     */
    showScreen(screenId) {
        // Hide all screens
        this.screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Hide multiplayer bar when not in game
        if (screenId !== 'game-screen') {
            document.getElementById('multiplayer-bar').classList.add('hidden');
        }
    }

    /**
     * Start single player game
     * @param {string} difficulty - Difficulty level
     */
    startSinglePlayerGame(difficulty) {
        this.showScreen('game-screen');
        this.gameController.startSinglePlayerGame(difficulty);
    }

    /**
     * Start multiplayer game
     */
    startMultiplayerGame() {
        const playerCount = parseInt(document.getElementById('player-count').value);
        const difficulty = document.getElementById('mp-difficulty').value;
        
        const playerNames = [];
        for (let i = 1; i <= playerCount; i++) {
            const input = document.getElementById(`player${i}-name`);
            playerNames.push(input?.value || `玩家 ${i}`);
        }
        
        this.showScreen('game-screen');
        this.gameController.startMultiplayerGame(playerNames, difficulty);
    }

    /**
     * Load and display leaderboard
     * @param {string} difficulty - Difficulty tab
     */
    loadLeaderboard(difficulty) {
        const scores = window.StorageManager.getScores(difficulty);
        const tbody = document.getElementById('leaderboard-body');
        const noScores = document.getElementById('no-scores');

        if (scores.length === 0) {
            tbody.innerHTML = '';
            noScores.classList.remove('hidden');
            return;
        }

        noScores.classList.add('hidden');
        
        tbody.innerHTML = scores.map((score, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
            
            return `
                <tr class="${rankClass}">
                    <td>${rankEmoji}</td>
                    <td>${this.escapeHtml(score.name)}</td>
                    <td>${score.score}</td>
                    <td>${this.formatTime(score.time)}</td>
                    <td>${score.moves}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Format time as MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string}
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {number} duration - Duration in ms
     */
    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }

    /**
     * Play button click sound
     */
    playButtonSound() {
        window.AudioManager.play('click');
    }

    /**
     * Show loading screen
     */
    showLoading() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

// Export singleton
window.UIManager = new UIManager();
