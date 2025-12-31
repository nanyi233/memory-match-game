/**
 * StorageManager - Handles persistent data storage using localStorage
 * Manages leaderboard scores and game settings
 */
class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            LEADERBOARD: 'memoryGame_leaderboard',
            SETTINGS: 'memoryGame_settings'
        };
        this.MAX_SCORES_PER_DIFFICULTY = 10;
    }

    /**
     * Get all leaderboard scores
     * @returns {Object} Scores organized by difficulty
     */
    getLeaderboard() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.LEADERBOARD);
            return data ? JSON.parse(data) : this.getDefaultLeaderboard();
        } catch (error) {
            console.error('Error reading leaderboard:', error);
            return this.getDefaultLeaderboard();
        }
    }

    /**
     * Get default empty leaderboard structure
     * @returns {Object}
     */
    getDefaultLeaderboard() {
        return {
            easy: [],
            medium: [],
            hard: [],
            expert: []
        };
    }

    /**
     * Get scores for a specific difficulty
     * @param {string} difficulty - Difficulty level
     * @returns {Array} Array of score objects
     */
    getScores(difficulty) {
        const leaderboard = this.getLeaderboard();
        return leaderboard[difficulty] || [];
    }

    /**
     * Save a new score to the leaderboard
     * @param {string} difficulty - Difficulty level
     * @param {Object} scoreData - Score data object
     * @returns {number} Rank position (1-based), or -1 if not in top scores
     */
    saveScore(difficulty, scoreData) {
        try {
            const leaderboard = this.getLeaderboard();
            
            if (!leaderboard[difficulty]) {
                leaderboard[difficulty] = [];
            }
            
            // Add timestamp
            scoreData.timestamp = Date.now();
            scoreData.date = new Date().toLocaleDateString('zh-CN');
            
            // Add new score
            leaderboard[difficulty].push(scoreData);
            
            // Sort by score (highest first), then by time (lowest first)
            leaderboard[difficulty].sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.time - b.time;
            });
            
            // Find rank before trimming
            const rank = leaderboard[difficulty].findIndex(
                s => s.timestamp === scoreData.timestamp
            ) + 1;
            
            // Keep only top scores
            leaderboard[difficulty] = leaderboard[difficulty].slice(
                0, this.MAX_SCORES_PER_DIFFICULTY
            );
            
            // Save
            localStorage.setItem(
                this.STORAGE_KEYS.LEADERBOARD,
                JSON.stringify(leaderboard)
            );
            
            // Return rank if in top scores, -1 otherwise
            return rank <= this.MAX_SCORES_PER_DIFFICULTY ? rank : -1;
        } catch (error) {
            console.error('Error saving score:', error);
            return -1;
        }
    }

    /**
     * Check if a score would make the leaderboard
     * @param {string} difficulty - Difficulty level
     * @param {number} score - Score to check
     * @returns {boolean}
     */
    isHighScore(difficulty, score) {
        const scores = this.getScores(difficulty);
        if (scores.length < this.MAX_SCORES_PER_DIFFICULTY) return true;
        return score > scores[scores.length - 1].score;
    }

    /**
     * Clear all scores for a difficulty level
     * @param {string} difficulty - Difficulty level (optional, clears all if not specified)
     */
    clearScores(difficulty = null) {
        try {
            if (difficulty) {
                const leaderboard = this.getLeaderboard();
                leaderboard[difficulty] = [];
                localStorage.setItem(
                    this.STORAGE_KEYS.LEADERBOARD,
                    JSON.stringify(leaderboard)
                );
            } else {
                localStorage.setItem(
                    this.STORAGE_KEYS.LEADERBOARD,
                    JSON.stringify(this.getDefaultLeaderboard())
                );
            }
        } catch (error) {
            console.error('Error clearing scores:', error);
        }
    }

    /**
     * Get game settings
     * @returns {Object} Settings object
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error reading settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Get default settings
     * @returns {Object}
     */
    getDefaultSettings() {
        return {
            theme: 'emoji',
            colorTheme: 'default',
            soundEnabled: true,
            volume: 70,
            keyboardNav: true,
            highContrast: false,
            reducedMotion: false
        };
    }

    /**
     * Save game settings
     * @param {Object} settings - Settings object
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(
                this.STORAGE_KEYS.SETTINGS,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    /**
     * Update a single setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    }

    /**
     * Reset all settings to default
     */
    resetSettings() {
        this.saveSettings(this.getDefaultSettings());
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get storage usage info
     * @returns {Object}
     */
    getStorageInfo() {
        try {
            const leaderboard = JSON.stringify(this.getLeaderboard());
            const settings = JSON.stringify(this.getSettings());
            return {
                leaderboardSize: new Blob([leaderboard]).size,
                settingsSize: new Blob([settings]).size,
                totalSize: new Blob([leaderboard, settings]).size
            };
        } catch (error) {
            return { leaderboardSize: 0, settingsSize: 0, totalSize: 0 };
        }
    }
}

// Export singleton instance
window.StorageManager = new StorageManager();
