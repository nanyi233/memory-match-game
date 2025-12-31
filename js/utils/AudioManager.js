/**
 * AudioManager - Handles all game audio including sound effects
 * Uses Web Audio API for better performance and control
 */
class AudioManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.7;
        this.audioContext = null;
        this.sounds = {};
        this.initialized = false;
    }

    /**
     * Initialize the audio context (must be called after user interaction)
     */
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.generateSounds();
            this.initialized = true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.enabled = false;
        }
    }

    /**
     * Generate all sound effects using Web Audio API synthesis
     */
    async generateSounds() {
        // Card flip sound - short click
        this.sounds.flip = () => this.playTone(800, 0.05, 'square', 0.3);
        
        // Match success sound - ascending notes
        this.sounds.match = () => {
            this.playTone(523, 0.1, 'sine', 0.4); // C5
            setTimeout(() => this.playTone(659, 0.1, 'sine', 0.4), 100); // E5
            setTimeout(() => this.playTone(784, 0.15, 'sine', 0.4), 200); // G5
        };
        
        // No match sound - descending tone
        this.sounds.noMatch = () => {
            this.playTone(400, 0.1, 'sawtooth', 0.2);
            setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.2), 100);
        };
        
        // Combo sound - exciting ascending
        this.sounds.combo = () => {
            this.playTone(440, 0.08, 'sine', 0.3);
            setTimeout(() => this.playTone(554, 0.08, 'sine', 0.3), 80);
            setTimeout(() => this.playTone(659, 0.08, 'sine', 0.3), 160);
            setTimeout(() => this.playTone(880, 0.12, 'sine', 0.4), 240);
        };
        
        // Victory sound - fanfare
        this.sounds.victory = () => {
            const notes = [523, 659, 784, 1047, 784, 1047];
            const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
            let delay = 0;
            notes.forEach((note, i) => {
                setTimeout(() => this.playTone(note, durations[i], 'sine', 0.4), delay);
                delay += durations[i] * 800;
            });
        };
        
        // Button click sound
        this.sounds.click = () => this.playTone(600, 0.03, 'square', 0.2);
        
        // Turn change sound (multiplayer)
        this.sounds.turnChange = () => this.playTone(440, 0.1, 'triangle', 0.3);
        
        // Timer warning sound
        this.sounds.warning = () => this.playTone(880, 0.1, 'square', 0.2);
    }

    /**
     * Play a synthesized tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in seconds
     * @param {string} type - Oscillator type (sine, square, sawtooth, triangle)
     * @param {number} gainValue - Volume (0-1)
     */
    playTone(frequency, duration, type = 'sine', gainValue = 0.5) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(gainValue * this.volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + duration
            );
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error playing tone:', error);
        }
    }

    /**
     * Play a specific sound effect
     * @param {string} soundName - Name of the sound to play
     */
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        // Ensure audio context is running
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.sounds[soundName]();
    }

    /**
     * Set the volume level
     * @param {number} level - Volume level (0-1)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }

    /**
     * Toggle audio on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Enable audio
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable audio
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Check if audio is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
}

// Export singleton instance
window.AudioManager = new AudioManager();
