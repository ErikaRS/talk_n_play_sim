// Talk 'n Play Story Simulator

// Core configuration
const CONFIG = {
    storyPath: '/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md',
    storyFolder: '/stories/The_Great_Playground_Mystery/',
    colors: ['green', 'yellow', 'red', 'blue']
};

/**
 * Main application controller that handles UI interactions and rendering
 */
class StoryApp {
    constructor() {
        // DOM elements
        this.elements = {
            colorButtons: document.querySelectorAll('.color-btn'),
            leftPage: document.querySelector('.left-page'),
            rightPage: document.querySelector('.right-page'),
            navPrev: document.getElementById('nav-left'),
            navNext: document.getElementById('nav-right'),
            navSound: document.getElementById('nav-sound'),
            storyList: document.querySelector('.story-list')
        };
        
        // App state
        this.story = null;
        this.currentPageIndex = 0;
        this.activeColor = null;
        
        // Create renderer
        this.renderer = new StoryRenderer(this.elements);
        
        // Available stories
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
        
        this.init();
    }
    
    init() {
        this.populateStoryPicker();
        this.setupEventListeners();
        this.loadStory(CONFIG.storyPath);
    }
    
    populateStoryPicker() {
        // Add test stories for demonstration
        for (let i = 1; i <= 20; i++) {
            const storyItem = document.createElement('div');
            storyItem.className = 'story-item';
            storyItem.textContent = `Test ${i}`;
            storyItem.dataset.index = i;
            
            this.elements.storyList.appendChild(storyItem);
        }
        
        // Add real stories at the end of the list
        this.availableStories.forEach((story, index) => {
            const storyItem = document.createElement('div');
            storyItem.className = 'story-item real-story';
            storyItem.textContent = story.title;
            storyItem.dataset.index = index;
            
            this.elements.storyList.appendChild(storyItem);
        });
    }
    
    setupEventListeners() {
        // Set up color buttons
        this.elements.colorButtons.forEach(button => {
            button.addEventListener('click', () => this.selectColor(button.id));
        });
        
        // Set up navigation
        this.elements.navPrev.addEventListener('click', () => this.goToPreviousPage());
        this.elements.navNext.addEventListener('click', () => this.goToNextPage());
        
        // Set up story picker items
        const storyItems = document.querySelectorAll('.story-item');
        storyItems.forEach(item => {
            item.addEventListener('click', () => {
                // Highlight selected item
                document.querySelectorAll('.story-item.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                item.classList.add('selected');
                
                // In a real implementation, we would load the selected story here
                // For now, we're just showing the selection without loading
                console.log(`Selected: ${item.textContent}`);
            });
        });
    }
    
    // Helper methods
    getCurrentPage() {
        if (!this.story?.isValid()) return null;
        return this.story.getPage(this.currentPageIndex);
    }
    
    canGoToPreviousPage() {
        return this.currentPageIndex > 0;
    }
    
    canGoToNextPage() {
        return this.story?.isValid() && this.currentPageIndex < this.story.pages.length - 1;
    }
    
    // Navigation
    goToPreviousPage() {
        if (this.canGoToPreviousPage()) {
            this.currentPageIndex--;
            this.showCurrentPage();
        }
    }
    
    goToNextPage() {
        if (this.canGoToNextPage()) {
            this.currentPageIndex++;
            this.showCurrentPage();
        }
    }
    
    // Color selection
    selectColor(color) {
        this.activeColor = color;
        
        // Update button states
        this.renderer.updateColorButtons(color);
        
        const page = this.getCurrentPage();
        if (page) this.renderer.renderPageWithColor(page, color);
    }
    
    // Content loading and rendering
    async loadStory(storyPath) {
        try {
            const response = await fetch(storyPath);
            if (!response.ok) throw new Error(`Failed to load story: ${response.status}`);
            
            const markdown = await response.text();
            this.story = MarkdownParser.parseStory(markdown, CONFIG.colors);
            this.showCurrentPage();
        } catch (error) {
            console.error('Error loading story:', error);
            this.renderer.renderError('Could not load story');
        }
    }
    
    showCurrentPage() {
        const page = this.getCurrentPage();
        if (!page) {
            this.renderer.renderError('Story content could not be loaded');
            return;
        }
        
        this.renderer.renderPage(page, CONFIG.storyFolder);
        this.renderer.updateNavigation(this.canGoToPreviousPage(), this.canGoToNextPage());
        
        // Reset color selection when changing pages
        this.activeColor = null;
        this.renderer.updateColorButtons(null);
    }
}

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => new StoryApp());