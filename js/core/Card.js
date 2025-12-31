/**
 * Card - Represents a single card in the memory game
 * Handles card state and DOM element creation
 */
class Card {
    /**
     * Create a new card
     * @param {Object} data - Card data object
     * @param {number} data.id - Unique card ID
     * @param {number} data.pairId - Pair identifier
     * @param {string} data.icon - Icon to display
     * @param {number} index - Position index in the grid
     */
    constructor(data, index) {
        this.id = data.id;
        this.pairId = data.pairId;
        this.icon = data.icon;
        this.index = index;
        
        this.isFlipped = false;
        this.isMatched = false;
        this.isDisabled = false;
        
        this.element = this.createElement();
    }

    /**
     * Create the card DOM element
     * @returns {HTMLElement}
     */
    createElement() {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'gridcell');
        card.setAttribute('aria-label', `卡片 ${this.index + 1}`);
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-id', this.id);
        card.setAttribute('data-pair-id', this.pairId);
        card.setAttribute('data-index', this.index);
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front" aria-hidden="true">
                    <span class="card-icon">${this.icon}</span>
                </div>
                <div class="card-back" aria-hidden="false">
                    <span class="card-pattern"></span>
                </div>
            </div>
        `;
        
        return card;
    }

    /**
     * Flip the card to reveal the icon
     * @returns {Promise} Resolves when flip animation completes
     */
    flip() {
        if (this.isFlipped || this.isMatched || this.isDisabled) {
            return Promise.resolve(false);
        }
        
        this.isFlipped = true;
        this.element.classList.add('flipped');
        this.element.setAttribute('aria-label', `卡片 ${this.index + 1}: ${this.icon}`);
        this.element.querySelector('.card-front').setAttribute('aria-hidden', 'false');
        this.element.querySelector('.card-back').setAttribute('aria-hidden', 'true');
        
        return new Promise(resolve => {
            setTimeout(() => resolve(true), 300);
        });
    }

    /**
     * Unflip the card to hide the icon
     * @returns {Promise} Resolves when animation completes
     */
    unflip() {
        if (!this.isFlipped || this.isMatched) {
            return Promise.resolve(false);
        }
        
        this.isFlipped = false;
        this.element.classList.remove('flipped');
        this.element.classList.add('no-match');
        this.element.setAttribute('aria-label', `卡片 ${this.index + 1}`);
        this.element.querySelector('.card-front').setAttribute('aria-hidden', 'true');
        this.element.querySelector('.card-back').setAttribute('aria-hidden', 'false');
        
        return new Promise(resolve => {
            setTimeout(() => {
                this.element.classList.remove('no-match');
                resolve(true);
            }, 500);
        });
    }

    /**
     * Mark the card as matched
     */
    setMatched() {
        this.isMatched = true;
        this.isDisabled = true;
        this.element.classList.add('matched');
        this.element.setAttribute('aria-label', `已匹配: ${this.icon}`);
        this.element.removeAttribute('tabindex');
        
        // Show score popup
        this.showScorePopup();
    }

    /**
     * Show score popup animation
     */
    showScorePopup() {
        const popup = document.createElement('div');
        popup.className = 'score-pop';
        popup.textContent = '+10';
        this.element.appendChild(popup);
        
        setTimeout(() => popup.remove(), 1000);
    }

    /**
     * Enable the card for interaction
     */
    enable() {
        this.isDisabled = false;
        this.element.classList.remove('disabled');
        if (!this.isMatched) {
            this.element.setAttribute('tabindex', '0');
        }
    }

    /**
     * Disable the card from interaction
     */
    disable() {
        this.isDisabled = true;
        this.element.classList.add('disabled');
    }

    /**
     * Set keyboard selection state
     * @param {boolean} selected - Whether selected
     */
    setSelected(selected) {
        if (selected) {
            this.element.classList.add('selected');
            this.element.focus();
        } else {
            this.element.classList.remove('selected');
        }
    }

    /**
     * Add dealing animation
     * @param {number} delay - Animation delay in ms
     */
    animateDeal(delay) {
        this.element.classList.add('dealing');
        this.element.style.animationDelay = `${delay}ms`;
        
        setTimeout(() => {
            this.element.classList.remove('dealing');
            this.element.style.animationDelay = '';
        }, delay + 400);
    }

    /**
     * Check if this card matches another
     * @param {Card} otherCard - Card to compare
     * @returns {boolean}
     */
    matches(otherCard) {
        return this.pairId === otherCard.pairId && this.id !== otherCard.id;
    }

    /**
     * Reset the card to initial state
     */
    reset() {
        this.isFlipped = false;
        this.isMatched = false;
        this.isDisabled = false;
        this.element.classList.remove('flipped', 'matched', 'no-match', 'disabled', 'selected');
        this.element.setAttribute('aria-label', `卡片 ${this.index + 1}`);
        this.element.setAttribute('tabindex', '0');
        this.element.querySelector('.card-front').setAttribute('aria-hidden', 'true');
        this.element.querySelector('.card-back').setAttribute('aria-hidden', 'false');
    }

    /**
     * Get card data for serialization
     * @returns {Object}
     */
    getData() {
        return {
            id: this.id,
            pairId: this.pairId,
            icon: this.icon,
            index: this.index,
            isFlipped: this.isFlipped,
            isMatched: this.isMatched
        };
    }
}

// Export Card class
window.Card = Card;
