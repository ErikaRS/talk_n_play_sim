// Talk 'n Play Story Simulator

/**
 * Main application controller that handles UI interactions and rendering
 * Implements the Talk 'n Play interaction model with four character tracks
 */
class StoryApp {
    constructor() {
        // Core configuration
        this.config = {
            storyPath: '/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md',
            storyFolder: '/stories/The_Great_Playground_Mystery/',
            colors: ['green', 'yellow', 'red', 'blue']
        };
        
        // Cache DOM elements for better performance
        this.elements = {
            colorButtons: document.querySelectorAll('.color-btn'),
            leftPage: document.querySelector('.left-page'),
            rightPage: document.querySelector('.right-page'),
            navPrev: document.getElementById('nav-left'),
            navNext: document.getElementById('nav-right'),
            navSound: document.getElementById('nav-sound'),
            storyList: document.querySelector('.story-list')
        };
        
        // Application state
        this.story = null;
        this.currentPageIndex = 0;
        this.activeColor = null;
        
        // Create renderer for handling UI updates
        this.renderer = new StoryRenderer(this.elements);
        
        // Available stories catalog
        this.availableStories = [
            {
                title: 'The Great Playground Mystery',
                path: '/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md',
                folder: '/stories/The_Great_Playground_Mystery/'
            },
            {
                title: 'The Quest for the Rainbow Gem',
                path: '/stories/The_Quest_for_the_Rainbow_Gem/The_Quest_for_the_Rainbow_Gem.md',
                folder: '/stories/The_Quest_for_the_Rainbow_Gem/'
            }
        ];
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.populateStoryPicker();
        this.setupEventListeners();
        this.loadStory(this.config.storyPath);
    }
    
    /**
     * Populates the story picker with available stories
     */
    populateStoryPicker() {
        this.availableStories.forEach((story, index) => {
            const storyItem = document.createElement('div');
            storyItem.className = 'story-item';
            storyItem.textContent = story.title;
            storyItem.dataset.index = index;
            storyItem.dataset.path = story.path;
            storyItem.dataset.folder = story.folder;
            
            this.elements.storyList.appendChild(storyItem);
        });
    }
    
    /**
     * Sets up all event listeners for user interactions
     */
    setupEventListeners() {
        this.setupColorButtonListeners();
        this.setupNavigationListeners();
        this.setupStoryPickerListeners();
    }
    
    /**
     * Sets up color selection button listeners
     */
    setupColorButtonListeners() {
        this.elements.colorButtons.forEach(button => {
            button.addEventListener('click', () => this.selectColor(button.id));
        });
    }
    
    /**
     * Sets up navigation button listeners
     */
    setupNavigationListeners() {
        this.elements.navPrev.addEventListener('click', () => this.goToPreviousPage());
        this.elements.navNext.addEventListener('click', () => this.goToNextPage());
    }
    
    /**
     * Sets up story picker item listeners
     */
    setupStoryPickerListeners() {
        const storyItems = document.querySelectorAll('.story-item');
        
        storyItems.forEach(item => {
            item.addEventListener('click', () => {
                // Get story data from dataset
                const index = parseInt(item.dataset.index, 10);
                const selectedStory = this.availableStories[index];
                
                if (!selectedStory) {
                    return;
                }
                
                // Update the configuration values
                this.config.storyPath = selectedStory.path;
                this.config.storyFolder = selectedStory.folder;
                
                // Reset the app state
                this.currentPageIndex = 0;
                this.activeColor = null;
                
                // Load the selected story
                this.loadStory(selectedStory.path);
            });
        });
    }
    
    /**
     * Retrieves the current page based on page index
     * @returns {Page|null} The current page or null if not available
     */
    getCurrentStoryPage() {
        if (!this.story?.hasPages()) {
            return null;
        }
        return this.story.getPage(this.currentPageIndex);
    }
    
    /**
     * Checks if navigation to previous page is possible
     * @returns {boolean} True if can navigate to previous page
     */
    canGoToPreviousPage() {
        return this.currentPageIndex > 0;
    }
    
    /**
     * Checks if navigation to next page is possible
     * @returns {boolean} True if can navigate to next page
     */
    canGoToNextPage() {
        if (!this.story?.hasPages()) {
            return false;
        }
        
        const isNotLastPage = this.currentPageIndex < this.story.pages.length - 1;
        return isNotLastPage;
    }
    
    /**
     * Navigates to the previous page if possible
     */
    goToPreviousPage() {
        if (this.canGoToPreviousPage()) {
            this.currentPageIndex--;
            this.showCurrentPage();
        }
    }
    
    /**
     * Navigates to the next page if possible
     */
    goToNextPage() {
        if (this.canGoToNextPage()) {
            this.currentPageIndex++;
            this.showCurrentPage();
        }
    }
    
    /**
     * Selects a color/character track and updates the UI
     * @param {string} color - The color to select (green, yellow, red, blue)
     */
    selectColor(color) {
        this.activeColor = color;
        
        // Update button states
        this.renderer.updateColorButtons(color);
        
        // Get current page and render with selected color
        const currentPage = this.getCurrentStoryPage();
        if (currentPage) {
            this.renderer.renderPageWithColor(currentPage, color);
        }
    }
    
    /**
     * Loads a story from the specified path
     * @param {string} storyPath - Path to the story markdown file
     */
    async loadStory(storyPath) {
        try {
            // Fetch the story content
            const response = await fetch(storyPath);
            
            if (!response.ok) {
                throw new Error(`Failed to load story: ${response.status}`);
            }
            
            // Parse the markdown content
            const markdown = await response.text();
            this.story = MarkdownParser.parseStory(markdown, this.config.colors);
            
            this.updateStorySelectionState(storyPath);
            this.showCurrentPage();
            
        } catch (error) {
            console.error('Error loading story:', error);
            this.renderer.renderError('Could not load story. Please try again.');
        }
    }
    
    /**
     * Updates the story selection UI based on the loaded story
     * @param {string} storyPath - Path of the currently loaded story
     */
    updateStorySelectionState(storyPath) {
        // Try to use the story title from parsed content
        if (this.story && this.story.title) {
            this.renderer.updateStorySelection(this.story.title);
            return;
        }
        
        // Fallback to finding story by path
        const selectedStory = this.availableStories.find(s => s.path === storyPath);
        if (selectedStory) {
            this.renderer.updateStorySelection(selectedStory.title);
        }
    }
    
    /**
     * Displays the current page content
     */
    showCurrentPage() {
        const currentPage = this.getCurrentStoryPage();
        
        if (!currentPage) {
            this.renderer.renderError('Story content could not be loaded');
            return;
        }
        
        // Render the page content
        this.renderer.renderPage(currentPage, this.config.storyFolder);
        
        // Update navigation button states
        const canGoPrevious = this.canGoToPreviousPage();
        const canGoNext = this.canGoToNextPage();
        this.renderer.updateNavigation(canGoPrevious, canGoNext);
        
        // Reset color selection when changing pages
        this.activeColor = null;
        this.renderer.updateColorButtons(null);
    }
}

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => new StoryApp());