class Settings {
    constructor() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Get DOM elements
        this.settingsToggle = document.querySelector('.settings-toggle');
        this.settingsPanel = document.querySelector('.settings-panel');
        this.closeSettings = document.querySelector('.close-settings');
        this.clickEffectsToggle = document.getElementById('click-effects-toggle');
        this.mouseTrailToggle = document.getElementById('mouse-trail-toggle');
        
        // Load saved settings first
        this.initializeSettings();
        
        // Initialize star effect with current settings
        window.starEffect = new StarEffect();
        
        // Apply initial state if disabled
        if (!CONFIG.EFFECTS.MOUSE_STARS.ENABLED) {
            window.starEffect.disable();
        }
        
        // Setup event listeners last
        this.setupEventListeners();
    }

    initializeSettings() {
        // Load settings from localStorage or use defaults
        const savedSettings = JSON.parse(localStorage.getItem('pageSettings')) || {};
        
        // Click effects
        const clickEffectsEnabled = savedSettings.clickEffects !== undefined 
            ? savedSettings.clickEffects 
            : CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES;
        this.clickEffectsToggle.checked = clickEffectsEnabled;
        CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES = clickEffectsEnabled;

        // Mouse trail
        const mouseTrailEnabled = savedSettings.mouseTrail !== undefined 
            ? savedSettings.mouseTrail 
            : CONFIG.EFFECTS.MOUSE_STARS.ENABLED;
        this.mouseTrailToggle.checked = mouseTrailEnabled;
        CONFIG.EFFECTS.MOUSE_STARS.ENABLED = mouseTrailEnabled;
    }

    setupEventListeners() {
        // Toggle settings panel
        this.settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.settingsPanel.classList.toggle('show');
        });

        // Close settings panel
        this.closeSettings.addEventListener('click', () => {
            this.settingsPanel.classList.remove('show');
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && 
                !this.settingsToggle.contains(e.target) && 
                this.settingsPanel.classList.contains('show')) {
                this.settingsPanel.classList.remove('show');
            }
        });

        // Handle click effects toggle
        this.clickEffectsToggle.addEventListener('change', (e) => {
            CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES = e.target.checked;
            this.saveSettings();
        });

        // Handle mouse trail toggle
        this.mouseTrailToggle.addEventListener('change', (e) => {
            CONFIG.EFFECTS.MOUSE_STARS.ENABLED = e.target.checked;
            if (window.starEffect) {
                if (e.target.checked) {
                    window.starEffect.enable();
                } else {
                    window.starEffect.disable();
                }
            }
            this.saveSettings();
        });
    }

    saveSettings() {
        const settings = {
            clickEffects: CONFIG.EFFECTS.CLICK_EFFECTS.PARTICLES,
            mouseTrail: CONFIG.EFFECTS.MOUSE_STARS.ENABLED
        };
        localStorage.setItem('pageSettings', JSON.stringify(settings));
    }
}

// Create settings instance
window.pageSettings = new Settings(); 