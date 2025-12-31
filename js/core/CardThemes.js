/**
 * CardThemes - Manages different card themes/icon sets
 * Provides emoji-based themes for the memory game
 */
class CardThemes {
    constructor() {
        this.themes = {
            emoji: {
                name: '表情',
                icons: [
                    '😀', '😎', '🥳', '😍', '🤩', '😇', '🤗', '🤔',
                    '😴', '🤯', '🥸', '🤠', '😈', '👻', '🤖', '👽',
                    '💀', '🎃', '👹', '🦄', '🐲', '🌈', '⭐', '🔥',
                    '💎', '🎮', '🎯', '🎪', '🎭', '🎨', '🎬', '🎤',
                    '🎸', '🎹', '🎺', '🥁'
                ]
            },
            animals: {
                name: '动物',
                icons: [
                    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
                    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
                    '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
                    '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
                    '🐜', '🦟', '🦗', '🐢'
                ]
            },
            food: {
                name: '食物',
                icons: [
                    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
                    '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
                    '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑',
                    '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍕',
                    '🍔', '🍟', '🌭', '🍿'
                ]
            },
            space: {
                name: '太空',
                icons: [
                    '🚀', '🛸', '🌙', '⭐', '🌟', '✨', '💫', '☄️',
                    '🌍', '🌎', '🌏', '🪐', '🌑', '🌒', '🌓', '🌔',
                    '🌕', '🌖', '🌗', '🌘', '🌚', '🌝', '🌛', '🌜',
                    '☀️', '🌤️', '⛅', '🌈', '🔭', '🛰️', '👨‍🚀', '👩‍🚀',
                    '🌌', '🎆', '🎇', '🌠'
                ]
            },
            sports: {
                name: '运动',
                icons: [
                    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
                    '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍',
                    '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿',
                    '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌',
                    '🎿', '⛷️', '🏂', '🏋️'
                ]
            },
            nature: {
                name: '自然',
                icons: [
                    '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼',
                    '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾',
                    '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰',
                    '🦔', '🐿️', '🦫', '🦦', '🦥', '🐾', '🦜', '🦩',
                    '🦚', '🦢', '🪷', '🪻'
                ]
            }
        };
        
        this.currentTheme = 'emoji';
    }

    /**
     * Get all available theme names
     * @returns {Array<string>}
     */
    getThemeNames() {
        return Object.keys(this.themes);
    }

    /**
     * Get theme display info
     * @param {string} themeName - Theme key
     * @returns {Object}
     */
    getThemeInfo(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return null;
        return {
            name: theme.name,
            preview: theme.icons.slice(0, 3)
        };
    }

    /**
     * Set the current theme
     * @param {string} themeName - Theme to set
     * @returns {boolean} Success
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            return true;
        }
        return false;
    }

    /**
     * Get current theme name
     * @returns {string}
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get icons for the current theme
     * @param {number} count - Number of unique icons needed
     * @returns {Array<string>} Array of icon strings
     */
    getIcons(count) {
        const theme = this.themes[this.currentTheme];
        if (!theme || count > theme.icons.length) {
            console.warn(`Not enough icons in theme. Requested: ${count}, Available: ${theme?.icons.length}`);
            count = Math.min(count, theme?.icons.length || 0);
        }
        
        // Shuffle and pick required number of icons
        const shuffled = [...theme.icons].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Get card pairs for the game
     * @param {number} pairCount - Number of pairs needed
     * @returns {Array<Object>} Array of card data objects with id and icon
     */
    getCardPairs(pairCount) {
        const icons = this.getIcons(pairCount);
        const cards = [];
        
        icons.forEach((icon, index) => {
            // Create two cards for each icon (a pair)
            cards.push({
                id: index * 2,
                pairId: index,
                icon: icon
            });
            cards.push({
                id: index * 2 + 1,
                pairId: index,
                icon: icon
            });
        });
        
        // Shuffle the cards
        return this.shuffle(cards);
    }

    /**
     * Fisher-Yates shuffle algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Get theme CSS class
     * @returns {string}
     */
    getThemeClass() {
        return `card-theme-${this.currentTheme}`;
    }
}

// Export singleton instance
window.CardThemes = new CardThemes();
