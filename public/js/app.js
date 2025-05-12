// Talk 'n Play Story Simulator

// Core configuration
const CONFIG = {
    storyPath: '/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md',
    storyFolder: '/stories/The_Great_Playground_Mystery/',
    colors: ['green', 'yellow', 'red', 'blue']
};

/**
 * Story model that holds all pages and provides access to them
 */
class Story {
    constructor(title = '') {
        this.title = title;
        this.pages = [];
    }
    
    isValid() {
        return this.pages.length > 0;
    }
    
    getPage(index) {
        if (index < 0 || index >= this.pages.length) return null;
        return this.pages[index];
    }
}

/**
 * Page model representing a single page in the story
 */
class Page {
    constructor(pageNumber, image, fixedText) {
        this.pageNumber = pageNumber || '';
        this.image = image || '';
        this.fixedText = fixedText || '';
        this.green = '';
        this.yellow = '';
        this.red = '';
        this.blue = '';
    }
    
    getColorText(color) {
        return this[color] || '';
    }
}

/**
 * Parse and format markdown text
 */
class MarkdownParser {
    static toHtml(text) {
        if (!text) return '';
        
        let html = text.replace(/\n/g, '<br>');
        
        // Replace color-specific bold text with colored text
        CONFIG.colors.forEach(color => {
            html = html.replace(
                new RegExp(`\\*\\*(${color})\\*\\*`, 'gi'), 
                `<strong class="${color}-color">$1</strong>`
            );
        });
        
        // Convert remaining markdown
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');             // Italic
        
        return html;
    }
    
    static parseStory(markdown) {
        if (!markdown) return new Story();
        
        // Extract title
        const titleMatch = markdown.match(/# Story Title\s*\n([^\n]+)/i);
        const story = new Story(titleMatch?.[1]?.trim());
        
        // Split into page sections and parse each one
        const pageSections = markdown.split(/## Page\s*\n/).slice(1);
        
        story.pages = pageSections.map(section => {
            // Extract basic page info
            const pageNumberMatch = section.match(/^([^\n]+)/i);
            const imageMatch = section.match(/### Image\s*\n([^\n]+)/i);
            const fixedTextMatch = section.match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            
            const page = new Page(
                pageNumberMatch?.[1]?.trim(),
                imageMatch?.[1]?.trim(),
                fixedTextMatch?.[1]?.trim()
            );
            
            // Extract color-specific text
            CONFIG.colors.forEach(color => {
                const colorMatch = section.match(
                    new RegExp(`### ${color}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`, 'i')
                );
                if (colorMatch?.[1]) {
                    page[color] = colorMatch[1].trim();
                }
            });
            
            return page;
        });
        
        return story;
    }
}

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
            navSound: document.getElementById('nav-sound')
        };
        
        // App state
        this.story = null;
        this.currentPageIndex = 0;
        this.activeColor = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadStory(CONFIG.storyPath);
    }
    
    setupEventListeners() {
        // Set up color buttons
        this.elements.colorButtons.forEach(button => {
            button.addEventListener('click', () => this.selectColor(button.id));
        });
        
        // Set up navigation
        this.elements.navPrev.addEventListener('click', () => this.goToPreviousPage());
        this.elements.navNext.addEventListener('click', () => this.goToNextPage());
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
    
    // UI update methods
    updateNavButtons() {
        this.elements.navPrev.disabled = !this.canGoToPreviousPage();
        this.elements.navNext.disabled = !this.canGoToNextPage();
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
        // Update button states
        this.elements.colorButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(color)?.classList.add('active');
        
        this.activeColor = color;
        
        const page = this.getCurrentPage();
        if (page) this.showPageWithColor(page, color);
    }
    
    // Content loading and rendering
    async loadStory(storyPath) {
        try {
            const response = await fetch(storyPath);
            if (!response.ok) throw new Error(`Failed to load story: ${response.status}`);
            
            const markdown = await response.text();
            this.story = MarkdownParser.parseStory(markdown);
            this.showCurrentPage();
        } catch (error) {
            console.error('Error loading story:', error);
            this.showError('Could not load story');
        }
    }
    
    showCurrentPage() {
        const page = this.getCurrentPage();
        if (!page) {
            this.showError('Story content could not be loaded');
            return;
        }
        
        this.showPageContent(page);
        this.updateNavButtons();
        
        // Reset color selection when changing pages
        this.activeColor = null;
        this.elements.colorButtons.forEach(btn => btn.classList.remove('active'));
    }
    
    showPageContent(page) {
        // Set text content
        this.elements.leftPage.innerHTML = `<p>${MarkdownParser.toHtml(page.fixedText)}</p>`;
        
        // Set image if available
        if (page.image) {
            const imagePath = `${CONFIG.storyFolder}${page.image}`;
            this.elements.rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`;
        } else {
            this.elements.rightPage.innerHTML = '';
        }
    }
    
    showPageWithColor(page, color) {
        const colorText = page.getColorText(color);
        if (!colorText) return;
        
        // Format the color name (capitalize first letter)
        const displayColor = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Show fixed text + color-specific text
        this.elements.leftPage.innerHTML = (
            `<p>${MarkdownParser.toHtml(page.fixedText)}</p>` +
            `<p class="color-text"><span class="${color}-color">${displayColor}</span>: ` +
            `${MarkdownParser.toHtml(colorText)}</p>`
        );
    }
    
    showError(message) {
        this.elements.leftPage.innerHTML = `<p>${message}</p>`;
        this.elements.rightPage.innerHTML = '';
    }
}

// Start the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => new StoryApp());