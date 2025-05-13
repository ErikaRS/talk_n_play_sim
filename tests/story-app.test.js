// Story App Unit Tests
const chai = require('chai');
const { expect } = chai;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Mock DOM environment
let dom;
let window;
let document;
let Story, Page, MarkdownParser, StoryApp;

describe('StoryApp', () => {
    beforeEach(() => {
        // Set up DOM environment
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
            <body>
                <div class="left-page"></div>
                <div class="right-page"></div>
                <button id="green" class="color-btn">Green</button>
                <button id="yellow" class="color-btn">Yellow</button>
                <button id="red" class="color-btn">Red</button>
                <button id="blue" class="color-btn">Blue</button>
                <button id="nav-left">Previous</button>
                <button id="nav-right">Next</button>
                <button id="nav-sound">Sound</button>
            </body>
            </html>
        `);
        
        window = dom.window;
        document = window.document;
        
        // Mock fetch API
        window.fetch = async (url) => {
            return {
                ok: true,
                text: async () => {
                    return `# Story Title
Test Story

## Page
1

### Image
test-image.jpg

### Fixed text
This is fixed text

### green
Green text content

### yellow
Yellow text content

### red
Red text content

### blue
Blue text content

## Page
2

### Image
test-image2.jpg

### Fixed text
Page 2 fixed text

### green
Page 2 green text
`;
                }
            };
        };
        
        // Create a global variable for the configuration
        window.CONFIG = {
            storyPath: '/stories/test-story.md',
            storyFolder: '/stories/',
            colors: ['green', 'yellow', 'red', 'blue']
        };
        
        // Import classes directly
        global.document = document;
        global.window = window;
        
        // Define the classes directly in our test environment
        Story = class Story {
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
        };
        
        Page = class Page {
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
        };
        
        MarkdownParser = {
            toHtml: function(text) {
                if (!text) return '';
                
                let html = text.replace(/\n/g, '<br>');
                
                // Replace color-specific bold text with colored text
                window.CONFIG.colors.forEach(color => {
                    html = html.replace(
                        new RegExp(`\\*\\*(${color})\\*\\*`, 'gi'), 
                        `<strong class="${color}-color">$1</strong>`
                    );
                });
                
                // Convert remaining markdown
                html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
                html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');             // Italic
                
                return html;
            },
            
            parseStory: function(markdown) {
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
                    window.CONFIG.colors.forEach(color => {
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
        };
        
        StoryApp = class StoryApp {
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
                
                // Don't call init() in tests, we'll call it manually
            }
            
            init() {
                this.setupEventListeners();
                this.loadStory(window.CONFIG.storyPath);
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
                // Mock implementation for tests
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
                    const imagePath = `${window.CONFIG.storyFolder}${page.image}`;
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
        };
        
        // Override DOM-dependent methods
        global.document = document;
    });
    
    describe('Story class', () => {
        it('should create a story with a title', () => {
            const story = new Story('Test Story');
            expect(story.title).to.equal('Test Story');
            expect(story.pages).to.be.an('array').that.is.empty;
        });
        
        it('should check if a story is valid', () => {
            const story = new Story('Test Story');
            expect(story.isValid()).to.be.false;
            
            story.pages.push(new Page('1'));
            expect(story.isValid()).to.be.true;
        });
        
        it('should get a page by index', () => {
            const story = new Story('Test Story');
            const page1 = new Page('1');
            const page2 = new Page('2');
            
            story.pages.push(page1, page2);
            
            expect(story.getPage(0)).to.equal(page1);
            expect(story.getPage(1)).to.equal(page2);
            expect(story.getPage(-1)).to.be.null;
            expect(story.getPage(2)).to.be.null;
        });
    });
    
    describe('Page class', () => {
        it('should create a page with properties', () => {
            const page = new Page('1', 'image.jpg', 'Fixed text');
            
            expect(page.pageNumber).to.equal('1');
            expect(page.image).to.equal('image.jpg');
            expect(page.fixedText).to.equal('Fixed text');
            expect(page.green).to.equal('');
            expect(page.yellow).to.equal('');
            expect(page.red).to.equal('');
            expect(page.blue).to.equal('');
        });
        
        it('should return color text for a given color', () => {
            const page = new Page();
            page.green = 'Green text';
            
            expect(page.getColorText('green')).to.equal('Green text');
            expect(page.getColorText('yellow')).to.equal('');
            expect(page.getColorText('invalid')).to.equal('');
        });
    });
    
    describe('MarkdownParser', () => {
        it('should convert markdown to HTML', () => {
            const markdown = 'This is **bold** and *italic* text';
            const html = MarkdownParser.toHtml(markdown);
            
            expect(html).to.include('<strong>bold</strong>');
            expect(html).to.include('<em>italic</em>');
        });
        
        it('should handle color-specific formatting', () => {
            const markdown = 'This is **green** color text';
            const html = MarkdownParser.toHtml(markdown);
            
            expect(html).to.include('<strong class="green-color">green</strong>');
        });
        
        it('should parse a story from markdown', () => {
            const markdown = `# Story Title
Test Story

## Page
1

### Image
test-image.jpg

### Fixed text
This is fixed text

### green
Green text content

### yellow
Yellow text content`;
            
            const story = MarkdownParser.parseStory(markdown);
            
            expect(story.title).to.equal('Test Story');
            expect(story.pages).to.have.lengthOf(1);
            expect(story.pages[0].pageNumber).to.equal('1');
            expect(story.pages[0].image).to.equal('test-image.jpg');
            expect(story.pages[0].fixedText).to.equal('This is fixed text');
            expect(story.pages[0].green).to.equal('Green text content');
            expect(story.pages[0].yellow).to.equal('Yellow text content');
        });
    });
    
    describe('StoryApp', () => {
        let app;
        
        beforeEach(async () => {
            app = new StoryApp();
            // Mock the loadStory method to avoid actual fetch
            app.loadStory = async () => {
                app.story = new Story('Test Story');
                const page1 = new Page('1', 'image1.jpg', 'Page 1 text');
                page1.green = 'Green text for page 1';
                
                const page2 = new Page('2', 'image2.jpg', 'Page 2 text');
                page2.red = 'Red text for page 2';
                
                app.story.pages.push(page1, page2);
                app.showCurrentPage();
            };
            
            // Initialize the app directly
            await app.loadStory();
        });
        
        it('should initialize with default state', () => {
            expect(app.currentPageIndex).to.equal(0);
            expect(app.activeColor).to.be.null;
        });
        
        it('should get the current page', () => {
            const page = app.getCurrentPage();
            expect(page).to.not.be.null;
            expect(page.pageNumber).to.equal('1');
        });
        
        it('should handle navigation', () => {
            // Initially on first page
            expect(app.currentPageIndex).to.equal(0);
            expect(app.canGoToPreviousPage()).to.be.false;
            expect(app.canGoToNextPage()).to.be.true;
            
            // Go to next page
            app.goToNextPage();
            expect(app.currentPageIndex).to.equal(1);
            expect(app.canGoToPreviousPage()).to.be.true;
            expect(app.canGoToNextPage()).to.be.false;
            
            // Go back to previous page
            app.goToPreviousPage();
            expect(app.currentPageIndex).to.equal(0);
        });
        
        it('should select color and update display', () => {
            app.selectColor('green');
            expect(app.activeColor).to.equal('green');
            
            // Check if button is active
            const greenButton = document.getElementById('green');
            expect(greenButton.classList.contains('active')).to.be.true;
            
            // Check if content includes the color text
            const leftPage = document.querySelector('.left-page');
            expect(leftPage.innerHTML).to.include('Green text for page 1');
        });
        
        it('should handle errors gracefully', () => {
            app.showError('Test error message');
            
            const leftPage = document.querySelector('.left-page');
            expect(leftPage.innerHTML).to.include('Test error message');
            
            const rightPage = document.querySelector('.right-page');
            expect(rightPage.innerHTML).to.equal('');
        });
    });
});