/**
 * ScoreSystem - Handles scoring, timing, and statistics
 * Implements progressive scoring with combo bonuses
 */
class ScoreSystem {
    constructor() {
        this.reset();
        
        // Scoring configuration
        this.config = {
            baseMatchScore: 100,
            comboMultiplier: 0.5,
            maxComboMultiplier: 5,
            timeBonusBase: 1000,
            timePenaltyPerSecond: 2,
            movePenalty: 5,
            perfectBonusMultiplier: 2
        };
        
        // Difficulty multipliers
        this.difficultyMultipliers = {
            easy: 1,
            medium: 1.5,
            hard: 2,
            expert: 3
        };
    }

    /**
     * Reset all stats
     */
    reset() {
        this.score = 0;
        this.moves = 0;
        this.matches = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.time = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isPaused = false;
        this.pausedTime = 0;
        this.difficulty = 'medium';
    }

    /**
     * Set the difficulty level
     * @param {string} difficulty - Difficulty level
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    /**
     * Start the game timer
     */
    startTimer() {
        this.startTime = Date.now() - this.pausedTime;
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.time = Math.floor((Date.now() - this.startTime) / 1000);
                this.onTimeUpdate(this.time);
            }
        }, 1000);
    }

    /**
     * Stop the game timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Pause the timer
     */
    pauseTimer() {
        this.isPaused = true;
        this.pausedTime = Date.now() - this.startTime;
    }

    /**
     * Resume the timer
     */
    resumeTimer() {
        this.isPaused = false;
        this.startTime = Date.now() - this.pausedTime;
    }

    /**
     * Record a move (card flip attempt)
     */
    recordMove() {
        this.moves++;
        this.onMovesUpdate(this.moves);
    }

    /**
     * Record a successful match
     * @returns {Object} Score breakdown
     */
    recordMatch() {
        this.matches++;
        this.combo++;
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Calculate score
        const scoreBreakdown = this.calculateMatchScore();
        this.score += scoreBreakdown.total;
        
        this.onMatchUpdate(this.matches, scoreBreakdown);
        
        // Play combo sound if applicable
        if (this.combo >= 2) {
            window.AudioManager.play('combo');
        }
        
        return scoreBreakdown;
    }

    /**
     * Record a failed match attempt
     */
    recordMiss() {
        this.combo = 0;
    }

    /**
     * Calculate score for a match
     * @returns {Object} Score breakdown
     */
    calculateMatchScore() {
        const diffMultiplier = this.difficultyMultipliers[this.difficulty] || 1;
        const baseScore = this.config.baseMatchScore;
        
        // Combo bonus
        const comboBonus = Math.min(
            this.combo * this.config.comboMultiplier,
            this.config.maxComboMultiplier
        );
        
        const matchScore = Math.round(baseScore * (1 + comboBonus) * diffMultiplier);
        
        return {
            base: baseScore,
            comboBonus: Math.round(baseScore * comboBonus * diffMultiplier),
            comboLevel: this.combo,
            total: matchScore
        };
    }

    /**
     * Calculate final game score
     * @param {number} totalPairs - Total pairs in the game
     * @returns {Object} Final score breakdown
     */
    calculateFinalScore(totalPairs) {
        const diffMultiplier = this.difficultyMultipliers[this.difficulty] || 1;
        
        // Time bonus (diminishes over time)
        const expectedTime = totalPairs * 10; // 10 seconds per pair expected
        const timeBonus = Math.max(
            0,
            Math.round((expectedTime - this.time) * 10 * diffMultiplier)
        );
        
        // Efficiency bonus (fewer moves = higher bonus)
        const perfectMoves = totalPairs * 2; // Minimum possible moves
        const moveEfficiency = perfectMoves / this.moves;
        const efficiencyBonus = Math.round(
            this.config.timeBonusBase * moveEfficiency * diffMultiplier
        );
        
        // Perfect game bonus
        const isPerfect = this.moves === perfectMoves;
        const perfectBonus = isPerfect ? 
            Math.round(this.score * (this.config.perfectBonusMultiplier - 1)) : 0;
        
        // Max combo bonus
        const comboBonus = Math.round(this.maxCombo * 50 * diffMultiplier);
        
        const totalScore = this.score + timeBonus + efficiencyBonus + perfectBonus + comboBonus;
        
        return {
            matchScore: this.score,
            timeBonus,
            efficiencyBonus,
            perfectBonus,
            comboBonus,
            maxCombo: this.maxCombo,
            total: totalScore,
            moves: this.moves,
            time: this.time,
            isPerfect,
            stars: this.calculateStars(totalScore, totalPairs)
        };
    }

    /**
     * Calculate star rating
     * @param {number} score - Total score
     * @param {number} totalPairs - Total pairs
     * @returns {number} Stars (1-3)
     */
    calculateStars(score, totalPairs) {
        const diffMultiplier = this.difficultyMultipliers[this.difficulty] || 1;
        const threeStarThreshold = totalPairs * 200 * diffMultiplier;
        const twoStarThreshold = totalPairs * 100 * diffMultiplier;
        
        if (score >= threeStarThreshold) return 3;
        if (score >= twoStarThreshold) return 2;
        return 1;
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
     * Get current stats
     * @returns {Object}
     */
    getStats() {
        return {
            score: this.score,
            moves: this.moves,
            matches: this.matches,
            combo: this.combo,
            maxCombo: this.maxCombo,
            time: this.time,
            formattedTime: this.formatTime(this.time)
        };
    }

    /**
     * Callback for time updates (override in game controller)
     * @param {number} time - Current time in seconds
     */
    onTimeUpdate(time) {
        // Override this method
    }

    /**
     * Callback for moves updates (override in game controller)
     * @param {number} moves - Current move count
     */
    onMovesUpdate(moves) {
        // Override this method
    }

    /**
     * Callback for match updates (override in game controller)
     * @param {number} matches - Current match count
     * @param {Object} scoreBreakdown - Score details
     */
    onMatchUpdate(matches, scoreBreakdown) {
        // Override this method
    }
}

// Export singleton instance
window.ScoreSystem = new ScoreSystem();
