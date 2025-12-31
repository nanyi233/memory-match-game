/**
 * GameBoard - Manages the game board and card grid
 * Handles card layout, interactions, and game state
 */
class GameBoard {
    /**
     * Create a new game board
     * @param {string} difficulty - Difficulty level
     */
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.isLocked = false;
        
        this.gridElement = document.getElementById('card-grid');
        this.config = this.getDifficultyConfig(difficulty);
    }

    /**
     * Get configuration for a difficulty level
     * @param {string} difficulty - Difficulty level
     * @returns {Object} Configuration object
     */
    getDifficultyConfig(difficulty) {
        const configs = {
            easy: { cols: 4, rows: 3, pairs: 6 },
            medium: { cols: 4, rows: 4, pairs: 8 },
            hard: { cols: 6, rows: 4, pairs: 12 },
            expert: { cols: 6, rows: 6, pairs: 18 }
        };
        return configs[difficulty] || configs.medium;
    }

    /**
     * Initialize the game board with cards
     */
    init() {
        this.clear();
        this.totalPairs = this.config.pairs;
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isLocked = false;
        
        // Set grid layout
        this.gridElement.setAttribute('data-difficulty', this.difficulty);
        this.gridElement.style.gridTemplateColumns = `repeat(${this.config.cols}, 1fr)`;
        
        // Get card data from theme
        const cardData = window.CardThemes.getCardPairs(this.config.pairs);
        
        // Create card instances
        this.cards = cardData.map((data, index) => new Card(data, index));
        
        // Add cards to grid with dealing animation
        this.cards.forEach((card, index) => {
            this.gridElement.appendChild(card.element);
            card.animateDeal(index * 50);
        });
        
        // Add theme class
        this.gridElement.classList.add(window.CardThemes.getThemeClass());
    }

    /**
     * Clear the game board
     */
    clear() {
        this.gridElement.innerHTML = '';
        this.cards = [];
        this.flippedCards = [];
        
        // Remove theme classes
        this.gridElement.className = 'card-grid';
    }

    /**
     * Handle card click/selection
     * @param {Card} card - Card that was clicked
     * @returns {Promise<Object>} Result of the card flip
     */
    async selectCard(card) {
        // Ignore if locked, already flipped, or matched
        if (this.isLocked || card.isFlipped || card.isMatched) {
            return { action: 'ignored' };
        }
        
        // Flip the card
        await card.flip();
        this.flippedCards.push(card);
        
        // Play flip sound
        window.AudioManager.play('flip');
        
        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            return this.checkMatch();
        }
        
        return { action: 'flipped', card };
    }

    /**
     * Check if the two flipped cards match
     * @returns {Promise<Object>} Match result
     */
    async checkMatch() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;
        
        // Small delay before checking
        await this.delay(500);
        
        if (card1.matches(card2)) {
            // Match found!
            card1.setMatched();
            card2.setMatched();
            this.matchedPairs++;
            this.flippedCards = [];
            this.isLocked = false;
            
            // Play match sound
            window.AudioManager.play('match');
            
            // Check for game completion
            if (this.matchedPairs === this.totalPairs) {
                return { action: 'complete', isMatch: true };
            }
            
            return { action: 'match', isMatch: true, card1, card2 };
        } else {
            // No match - flip cards back
            await Promise.all([card1.unflip(), card2.unflip()]);
            this.flippedCards = [];
            this.isLocked = false;
            
            // Play no match sound
            window.AudioManager.play('noMatch');
            
            return { action: 'noMatch', isMatch: false, card1, card2 };
        }
    }

    /**
     * Get card at a specific index
     * @param {number} index - Card index
     * @returns {Card|null}
     */
    getCardAtIndex(index) {
        return this.cards[index] || null;
    }

    /**
     * Get card by DOM element
     * @param {HTMLElement} element - Card element
     * @returns {Card|null}
     */
    getCardByElement(element) {
        const index = parseInt(element.dataset.index);
        return this.cards[index] || null;
    }

    /**
     * Get all unmatched card indices
     * @returns {Array<number>}
     */
    getUnmatchedIndices() {
        return this.cards
            .filter(card => !card.isMatched)
            .map(card => card.index);
    }

    /**
     * Enable all cards
     */
    enableAllCards() {
        this.cards.forEach(card => card.enable());
        this.isLocked = false;
    }

    /**
     * Disable all cards
     */
    disableAllCards() {
        this.cards.forEach(card => card.disable());
        this.isLocked = true;
    }

    /**
     * Get game progress
     * @returns {Object}
     */
    getProgress() {
        return {
            matched: this.matchedPairs,
            total: this.totalPairs,
            percentage: (this.matchedPairs / this.totalPairs) * 100
        };
    }

    /**
     * Check if game is complete
     * @returns {boolean}
     */
    isComplete() {
        return this.matchedPairs === this.totalPairs;
    }

    /**
     * Reset the game board for a new game
     */
    reset() {
        this.init();
    }

    /**
     * Change difficulty level
     * @param {string} difficulty - New difficulty
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.config = this.getDifficultyConfig(difficulty);
    }

    /**
     * Get grid dimensions
     * @returns {Object}
     */
    getGridSize() {
        return {
            cols: this.config.cols,
            rows: this.config.rows,
            total: this.cards.length
        };
    }

    /**
     * Utility function for delays
     * @param {number} ms - Milliseconds
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Reveal all cards briefly (for hint or preview)
     * @param {number} duration - Duration in ms
     */
    async peekAllCards(duration = 2000) {
        this.isLocked = true;
        
        // Flip all cards
        this.cards.forEach(card => {
            if (!card.isMatched) {
                card.element.classList.add('flipped');
            }
        });
        
        await this.delay(duration);
        
        // Unflip all cards
        this.cards.forEach(card => {
            if (!card.isMatched) {
                card.element.classList.remove('flipped');
            }
        });
        
        this.isLocked = false;
    }

    /**
     * Serialize board state
     * @returns {Object}
     */
    serialize() {
        return {
            difficulty: this.difficulty,
            matchedPairs: this.matchedPairs,
            totalPairs: this.totalPairs,
            cards: this.cards.map(card => card.getData())
        };
    }
}

// Export GameBoard class
window.GameBoard = GameBoard;
