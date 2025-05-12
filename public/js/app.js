// Talk 'n Play Story Simulator
document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const STORY_PATH = '/stories/The_Great_Playground_Mystery/The_Great_Playground_Mystery.md';
    
    // DOM elements
    const elements = {
        colorButtons: document.querySelectorAll('.color-btn'),
        leftPage: document.querySelector('.left-page'),
        rightPage: document.querySelector('.right-page'),
        navPrev: document.getElementById('nav-left'),
        navNext: document.getElementById('nav-right'),
        navSound: document.getElementById('nav-sound')
    };
    
    // Story state
    const state = {
        story: null,
        currentPageIndex: 0,
        activeColor: null
    };
    
    // Initialize the application
    init();
    
    function init() {
        loadStory(STORY_PATH);
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Color button listeners
        elements.colorButtons.forEach(button => {
            button.addEventListener('click', () => handleColorButtonClick(button));
        });
        
        // Navigation button listeners
        elements.navPrev.addEventListener('click', () => {
            // Will be implemented later
        });
        
        elements.navNext.addEventListener('click', () => {
            // Will be implemented later
        });
    }
    
    function handleColorButtonClick(button) {
        // Update button states
        elements.colorButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Get the color from the button id
        const color = button.id;
        state.activeColor = color;
        
        // Update the page content with the selected color's text
        if (hasValidStory()) {
            const currentPage = state.story.pages[state.currentPageIndex];
            renderPageWithColoredText(currentPage, color);
        }
    }
    
    async function loadStory(storyPath) {
        try {
            const response = await fetch(storyPath);
            if (!response.ok) {
                throw new Error(`Failed to load story: ${response.status}`);
            }
            
            const markdown = await response.text();
            state.story = parseMarkdownToStory(markdown);
            
            renderCurrentPage();
        } catch (error) {
            console.error('Error loading story:', error);
            showErrorMessage('Failed to load story content');
        }
    }
    
    function renderCurrentPage() {
        if (!hasValidStory()) {
            showErrorMessage('Story content could not be loaded');
            return;
        }
        
        const pageIndex = state.currentPageIndex;
        if (pageIndex < 0 || pageIndex >= state.story.pages.length) {
            console.error('Invalid page index:', pageIndex);
            return;
        }
        
        const currentPage = state.story.pages[pageIndex];
        renderPageContent(currentPage);
        updateNavigationState();
    }
    
    function renderPageContent(page) {
        // Render text content
        elements.leftPage.innerHTML = `<p>${page.fixedText}</p>`;
        
        // Render image if available
        if (page.image) {
            const imagePath = `/stories/The_Great_Playground_Mystery/${page.image}`;
            elements.rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`;
        } else {
            elements.rightPage.innerHTML = '';
        }
        
        // Reset active color when changing pages
        state.activeColor = null;
        elements.colorButtons.forEach(btn => btn.classList.remove('active'));
    }
    
    function renderPageWithColoredText(page, color) {
        if (!page || !color) return;
        
        // Get the colored text content
        const coloredText = page[color];
        
        // If there's no text for this color, do nothing
        if (!coloredText) return;
        
        // Format the color name for display (capitalize first letter)
        const displayColorName = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Replace any existing text with fixed text + colored text with colored name prefix
        elements.leftPage.innerHTML = `<p>${page.fixedText}</p><p class="color-text"><span class="${color}-color">${displayColorName}</span>: ${coloredText}</p>`;
    }
    
    function updateNavigationState() {
        const { currentPageIndex } = state;
        const pageCount = state.story?.pages?.length || 0;
        
        elements.navPrev.disabled = currentPageIndex <= 0;
        elements.navNext.disabled = currentPageIndex >= pageCount - 1;
    }
    
    function hasValidStory() {
        return state.story && Array.isArray(state.story.pages) && state.story.pages.length > 0;
    }
    
    function showErrorMessage(message) {
        elements.leftPage.innerHTML = `<p>${message}</p>`;
        elements.rightPage.innerHTML = '';
    }
    
    // Parse markdown story file into structured object
    function parseMarkdownToStory(markdown) {
        const storyStructure = {
            title: '',
            pages: []
        };
        
        // Extract story title
        const titleMatch = markdown.match(/# Story Title\s*\n([^\n]+)/i);
        if (titleMatch && titleMatch[1]) {
            storyStructure.title = titleMatch[1].trim();
        }
        
        // Split by page sections
        const pageSections = markdown.split(/## Page\s*\n/);
        
        // Skip the first section (it contains the title)
        for (let i = 1; i < pageSections.length; i++) {
            const pageSection = pageSections[i];
            const page = {
                pageNumber: '',
                image: '',
                fixedText: '',
                green: '',
                yellow: '',
                red: '',
                blue: ''
            };
            
            // Extract page number
            const pageNumberMatch = pageSection.match(/^([^\n]+)/i);
            if (pageNumberMatch && pageNumberMatch[1]) {
                page.pageNumber = pageNumberMatch[1].trim();
            }
            
            // Extract image
            const imageMatch = pageSection.match(/### Image\s*\n([^\n]+)/i);
            if (imageMatch && imageMatch[1]) {
                page.image = imageMatch[1].trim();
            }
            
            // Extract fixed text
            const fixedTextMatch = pageSection.match(/### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (fixedTextMatch && fixedTextMatch[1]) {
                page.fixedText = fixedTextMatch[1].trim();
            }
            
            // Extract green option
            const greenMatch = pageSection.match(/### Green\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (greenMatch && greenMatch[1]) {
                page.green = greenMatch[1].trim();
            }
            
            // Extract yellow option
            const yellowMatch = pageSection.match(/### Yellow\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (yellowMatch && yellowMatch[1]) {
                page.yellow = yellowMatch[1].trim();
            }
            
            // Extract red option
            const redMatch = pageSection.match(/### Red\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (redMatch && redMatch[1]) {
                page.red = redMatch[1].trim();
            }
            
            // Extract blue option
            const blueMatch = pageSection.match(/### Blue\s*\n([\s\S]*?)(?=\n###|\n---|$)/i);
            if (blueMatch && blueMatch[1]) {
                page.blue = blueMatch[1].trim();
            }
            
            storyStructure.pages.push(page);
        }
        
        return storyStructure;
    }
});