// Talk 'n Play Story Simulator

// Configuration
const config = {
    storyPath: '/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md',
    storyFolder: '/stories/The_Great_Playground_Mystery/'
};

// Models - pure data structures
class StoryModel {
    constructor(title = '', pages = []) {
        this.title = title;
        this.pages = pages;
    }
    
    hasValidPages() {
        return Array.isArray(this.pages) && this.pages.length > 0;
    }
    
    getPage(index) {
        if (index < 0 || index >= this.pages.length) {
            throw new Error(`Invalid page index: ${index}`);
        }
        return this.pages[index];
    }
    
    getPageCount() {
        return this.pages.length;
    }
}

class PageModel {
    constructor(pageNumber = '', image = '', fixedText = '') {
        this.pageNumber = pageNumber;
        this.image = image;
        this.fixedText = fixedText;
        this.colorOptions = {
            green: '',
            yellow: '',
            red: '',
            blue: ''
        };
    }
    
    setColorOption(color, text) {
        if (Object.prototype.hasOwnProperty.call(this.colorOptions, color)) {
            this.colorOptions[color] = text;
        }
    }
    
    getColorOption(color) {
        return this.colorOptions[color] || '';
    }
}

// Application state
class AppState {
    constructor() {
        this.story = null;
        this.currentPageIndex = 0;
        this.activeColor = null;
    }
    
    hasValidStory() {
        return this.story && this.story.hasValidPages();
    }
    
    getCurrentPage() {
        if (!this.hasValidStory()) return null;
        return this.story.getPage(this.currentPageIndex);
    }
    
    canGoToPreviousPage() {
        return this.currentPageIndex > 0;
    }
    
    canGoToNextPage() {
        if (!this.hasValidStory()) return false;
        return this.currentPageIndex < this.story.getPageCount() - 1;
    }
}

// Service layer - Pure functions with no DOM dependencies
class StoryService {
    /**
     * Parse markdown text to HTML
     * @param {string} text - The markdown text to parse
     * @returns {string} - HTML formatted text
     */
    static parseMarkdown(text) {
        if (!text) return '';
        
        let html = text;
        
        // Replace newlines with <br>
        html = html.replace(/\n/g, '<br>');
        
        // Replace color-specific bold text with colored text
        html = html.replace(/\*\*(green)\*\*/gi, '<strong class="green-color">$1</strong>');
        html = html.replace(/\*\*(yellow)\*\*/gi, '<strong class="yellow-color">$1</strong>');
        html = html.replace(/\*\*(red)\*\*/gi, '<strong class="red-color">$1</strong>');
        html = html.replace(/\*\*(blue)\*\*/gi, '<strong class="blue-color">$1</strong>');
        
        // Replace remaining bold (**text**) with <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Replace italic (*text*) with <em>text</em>
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return html;
    }
    
    /**
     * Parse markdown story into a story model
     * @param {string} markdown - Raw markdown content
     * @returns {StoryModel} - The parsed story model
     */
    static parseMarkdownToStory(markdown) {
        if (!markdown) {
            return new StoryModel();
        }
        
        // Extract story title
        const titleMatch = markdown.match(/# Story Title\s*\n([^\n]+)/i);
        const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : '';
        
        // Create story model
        const story = new StoryModel(title);
        
        // Split by page sections
        const pageSections = markdown.split(/## Page\s*\n/);
        
        // Skip the first section (it contains the title)
        for (let i = 1; i < pageSections.length; i++) {
            const pageSection = pageSections[i];
            const page = this._parsePageSection(pageSection);
            story.pages.push(page);
        }
        
        return story;
    }
    
    /**
     * Parse a single page section from markdown
     * @private
     * @param {string} pageSection - Markdown section for a page
     * @returns {PageModel} - The parsed page model
     */
    static _parsePageSection(pageSection) {
        // Extract page number
        const pageNumberMatch = pageSection.match(/^([^\n]+)/i);
        const pageNumber = pageNumberMatch && pageNumberMatch[1] ? pageNumberMatch[1].trim() : '';
        
        // Extract image
        const imageMatch = pageSection.match(/### Image\s*\n([^\n]+)/i);
        const image = imageMatch && imageMatch[1] ? imageMatch[1].trim() : '';
        
        // Extract fixed text
        const fixedTextMatch = pageSection.match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
        const fixedText = fixedTextMatch && fixedTextMatch[1] ? fixedTextMatch[1].trim() : '';
        
        const page = new PageModel(pageNumber, image, fixedText);
        
        // Extract color options
        const colors = ['green', 'yellow', 'red', 'blue'];
        colors.forEach(color => {
            const colorMatch = pageSection.match(new RegExp(`### ${color}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`, 'i'));
            if (colorMatch && colorMatch[1]) {
                page.setColorOption(color, colorMatch[1].trim());
            }
        });
        
        return page;
    }
    
    /**
     * Format color name for display
     * @param {string} color - Color name
     * @returns {string} - Formatted color name
     */
    static formatColorName(color) {
        return color.charAt(0).toUpperCase() + color.slice(1);
    }
    
    /**
     * Get the image path for a page
     * @param {PageModel} page - The page model
     * @param {string} folderPath - Path to the story folder
     * @returns {string} - Full image path
     */
    static getImagePath(page, folderPath) {
        return page.image ? `${folderPath}${page.image}` : '';
    }
}

// UI Controller
class UIController {
    constructor(elements, state, config) {
        this.elements = elements;
        this.state = state;
        this.config = config;
    }
    
    /**
     * Initialize UI and event listeners
     */
    init() {
        this.setupEventListeners();
        this.loadStory(this.config.storyPath);
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Color button listeners
        this.elements.colorButtons.forEach(button => {
            button.addEventListener('click', () => this.handleColorButtonClick(button));
        });
        
        // Navigation button listeners
        this.elements.navPrev.addEventListener('click', () => this.navigateToPreviousPage());
        this.elements.navNext.addEventListener('click', () => this.navigateToNextPage());
    }
    
    /**
     * Handle color button click event
     * @param {HTMLElement} button - The clicked button
     */
    handleColorButtonClick(button) {
        // Update button states
        this.elements.colorButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Get the color from the button id
        const color = button.id;
        this.state.activeColor = color;
        
        // Update the page content with the selected color's text
        if (this.state.hasValidStory()) {
            const currentPage = this.state.getCurrentPage();
            this.renderPageWithColoredText(currentPage, color);
        }
    }
    
    /**
     * Navigate to the previous page
     */
    navigateToPreviousPage() {
        if (this.state.canGoToPreviousPage()) {
            this.state.currentPageIndex--;
            this.renderCurrentPage();
            this.updateNavigationState();
        }
    }
    
    /**
     * Navigate to the next page
     */
    navigateToNextPage() {
        if (this.state.canGoToNextPage()) {
            this.state.currentPageIndex++;
            this.renderCurrentPage();
            this.updateNavigationState();
        }
    }
    
    /**
     * Load a story from a path
     * @param {string} storyPath - Path to the story file
     */
    async loadStory(storyPath) {
        try {
            const response = await fetch(storyPath);
            if (!response.ok) {
                throw new Error(`Failed to load story: ${response.status}`);
            }
            
            const markdown = await response.text();
            this.state.story = StoryService.parseMarkdownToStory(markdown);
            
            this.renderCurrentPage();
        } catch (error) {
            console.error('Error loading story:', error);
            this.showErrorMessage('Failed to load story content');
        }
    }
    
    /**
     * Render the current page
     */
    renderCurrentPage() {
        if (!this.state.hasValidStory()) {
            this.showErrorMessage('Story content could not be loaded');
            return;
        }
        
        try {
            const currentPage = this.state.getCurrentPage();
            this.renderPageContent(currentPage);
            this.updateNavigationState();
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showErrorMessage('Error displaying page');
        }
    }
    
    /**
     * Render a page's content
     * @param {PageModel} page - The page to render
     */
    renderPageContent(page) {
        // Render text content with markdown formatting
        this.elements.leftPage.innerHTML = `<p>${StoryService.parseMarkdown(page.fixedText)}</p>`;
        
        // Render image if available
        if (page.image) {
            const imagePath = StoryService.getImagePath(page, this.config.storyFolder);
            this.elements.rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`;
        } else {
            this.elements.rightPage.innerHTML = '';
        }
        
        // Reset active color when changing pages
        this.state.activeColor = null;
        this.elements.colorButtons.forEach(btn => btn.classList.remove('active'));
    }
    
    /**
     * Render a page with colored text
     * @param {PageModel} page - The page to render
     * @param {string} color - The color to use
     */
    renderPageWithColoredText(page, color) {
        if (!page || !color) return;
        
        // Get the colored text content
        const coloredText = page.getColorOption(color);
        
        // If there's no text for this color, do nothing
        if (!coloredText) return;
        
        // Format the color name for display
        const displayColorName = StoryService.formatColorName(color);
        
        // Replace any existing text with fixed text + colored text with colored name prefix
        this.elements.leftPage.innerHTML = (
            `<p>${StoryService.parseMarkdown(page.fixedText)}</p>` +
            `<p class="color-text"><span class="${color}-color">${displayColorName}</span>: ` +
            `${StoryService.parseMarkdown(coloredText)}</p>`
        );
    }
    
    /**
     * Update navigation button states
     */
    updateNavigationState() {
        this.elements.navPrev.disabled = !this.state.canGoToPreviousPage();
        this.elements.navNext.disabled = !this.state.canGoToNextPage();
    }
    
    /**
     * Show an error message
     * @param {string} message - The error message to display
     */
    showErrorMessage(message) {
        this.elements.leftPage.innerHTML = `<p>${message}</p>`;
        this.elements.rightPage.innerHTML = '';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const elements = {
        colorButtons: document.querySelectorAll('.color-btn'),
        leftPage: document.querySelector('.left-page'),
        rightPage: document.querySelector('.right-page'),
        navPrev: document.getElementById('nav-left'),
        navNext: document.getElementById('nav-right'),
        navSound: document.getElementById('nav-sound')
    };
    
    // Create application state
    const state = new AppState();
    
    // Create UI controller
    const ui = new UIController(elements, state, config);
    
    // Initialize the application
    ui.init();
});