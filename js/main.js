/**
 * Memory Match Game - Main Entry Point
 * Initializes and starts the game application
 */

(function() {
    'use strict';

    /**
     * Application initialization
     */
    function initApp() {
        // Check for required browser features
        if (!checkBrowserSupport()) {
            showBrowserWarning();
            return;
        }

        // Create game controller
        const gameController = new GameController();

        // Initialize UI manager
        window.UIManager.init(gameController);

        // Hide loading screen
        window.UIManager.hideLoading();

        // Log initialization
        console.log('🃏 Memory Match Game initialized successfully!');
        console.log('Version: 1.0.0');
        console.log('Author: Memory Match Team');
    }

    /**
     * Check if browser supports required features
     * @returns {boolean}
     */
    function checkBrowserSupport() {
        const features = [
            'localStorage' in window,
            'querySelector' in document,
            'classList' in document.createElement('div'),
            'addEventListener' in window
        ];

        return features.every(feature => feature);
    }

    /**
     * Show browser compatibility warning
     */
    function showBrowserWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
            z-index: 10000;
        `;
        warning.innerHTML = `
            <div>
                <h1>😔 浏览器不兼容</h1>
                <p>您的浏览器不支持此游戏所需的功能。</p>
                <p>请使用最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器。</p>
            </div>
        `;
        document.body.appendChild(warning);
    }

    /**
     * Handle visibility change (pause when tab hidden)
     */
    function setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const gameController = window.gameController;
                if (gameController && gameController.gameState === 'playing') {
                    gameController.pauseGame();
                }
            }
        });
    }

    /**
     * Setup service worker for offline support (optional)
     */
    function setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Service worker registration can be added here for PWA support
            // navigator.serviceWorker.register('/sw.js');
        }
    }

    /**
     * Handle window resize for responsive adjustments
     */
    function setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Trigger any resize-related updates
                document.body.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            }, 100);
        });

        // Initial set
        document.body.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }

    /**
     * Handle touch events for mobile
     */
    function setupTouchHandler() {
        // Prevent double-tap zoom on game elements
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.card') || e.target.closest('.menu-btn')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent pull-to-refresh
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('#card-grid')) {
                // Allow scrolling within game area if needed
            }
        }, { passive: true });
    }

    /**
     * Preload any required assets
     * @returns {Promise}
     */
    async function preloadAssets() {
        // Currently using emoji, no external assets to preload
        // This function can be extended for image-based themes
        return Promise.resolve();
    }

    /**
     * Main startup sequence
     */
    async function main() {
        try {
            // Show loading
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
            }

            // Setup handlers
            setupVisibilityHandler();
            setupResizeHandler();
            setupTouchHandler();
            setupServiceWorker();

            // Preload assets
            await preloadAssets();

            // Initialize app
            initApp();

        } catch (error) {
            console.error('Failed to initialize game:', error);
            alert('游戏加载失败，请刷新页面重试。');
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }

})();
