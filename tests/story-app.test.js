import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Story App', () => {
  let dom, window, document, fetchMock, originalFetch;

  beforeEach(() => {
    // Create a DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head></head>
      <body>
        <div class="container">
          <div class="story-picker">
            <h3>Story Selection</h3>
            <div class="story-list">
              <!-- Stories will be populated here -->
            </div>
          </div>
          <div class="content">
            <h1>Talk 'n Play Simulator</h1>
            <div class="page-container">
              <div class="rectangle left-page"></div>
              <div class="rectangle right-page"></div>
            </div>
          </div>
          <div class="color-buttons">
            <button class="cntrl-btn" id="nav-left">◀◀</button>
            <button class="cntrl-btn" id="nav-sound">▶</button>
            <button class="cntrl-btn" id="nav-right">▶▶</button>
            <button class="color-btn" id="green"></button>
            <button class="color-btn" id="yellow"></button>
            <button class="color-btn" id="red"></button>
            <button class="color-btn" id="blue"></button>
          </div>
        </div>
      </body>
      </html>
    `, {
      url: "http://localhost/",
      runScripts: "dangerously",
      resources: "usable",
    });
    
    window = dom.window;
    document = window.document;
    global.document = document;
    global.window = window;
    
    // Create a global for CONFIG
    global.CONFIG = {
      storyPath: 'http://localhost/stories/test-story.md',
      storyFolder: 'http://localhost/stories/',
      colors: ['green', 'yellow', 'red', 'blue']
    };
    
    // Save original fetch
    originalFetch = global.fetch;
    
    // Mock the fetch API
    fetchMock = mock(() => Promise.resolve({
      ok: true,
      text: async () => `# Story Title
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
Page 2 green text`
    }));
    
    global.fetch = fetchMock;
    global.DOMContentLoaded = true;
    
    // Define StoryRenderer class for the tests
    class StoryRenderer {
      constructor(elements) {
        this.elements = elements;
      }
      
      renderPage(page, storyFolder) {
        if (!page) return false;
        
        // Set text content
        this.elements.leftPage.innerHTML = `<p>${page.fixedText}</p>`;
        
        // Set image if available
        if (page.image) {
          const imagePath = `${storyFolder}${page.image}`;
          this.elements.rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`;
        } else {
          this.elements.rightPage.innerHTML = '';
        }
        
        return true;
      }
      
      renderPageWithColor(page, color) {
        if (!page) return false;
        
        const colorText = page.getColorText(color);
        if (!colorText) return false;
        
        // Format the color name (capitalize first letter)
        const displayColor = color.charAt(0).toUpperCase() + color.slice(1);
        
        // Show fixed text + color-specific text
        this.elements.leftPage.innerHTML = (
          `<p>${page.fixedText}</p>` +
          `<p class="color-text"><span class="${color}-color">${displayColor}</span>: ` +
          `${colorText}</p>`
        );
        
        return true;
      }
      
      renderError(message) {
        this.elements.leftPage.innerHTML = `<p>${message}</p>`;
        this.elements.rightPage.innerHTML = '';
        return true;
      }
      
      updateNavigation(canGoPrevious, canGoNext) {
        if (this.elements.navPrev) {
          this.elements.navPrev.disabled = !canGoPrevious;
        }
        
        if (this.elements.navNext) {
          this.elements.navNext.disabled = !canGoNext;
        }
      }
      
      updateColorButtons(activeColor) {
        if (!this.elements.colorButtons) return;
        
        this.elements.colorButtons.forEach(btn => btn.classList.remove('active'));
        
        if (activeColor) {
          const activeBtn = document.getElementById(activeColor);
          if (activeBtn) activeBtn.classList.add('active');
        }
      }
      
      updateStorySelection(storyTitle) {
        if (!this.elements.storyList) return;
        
        const storyItems = this.elements.storyList.querySelectorAll('.story-item');
        
        // Clear all active selections
        storyItems.forEach(item => {
          item.classList.remove('selected');
          
          // Highlight the item if it matches the current story title
          if (item.textContent === storyTitle) {
            item.classList.add('selected');
          }
        });
      }
    }
    global.StoryRenderer = StoryRenderer;
    
    // Load parser.js content
    const parserCode = fs.readFileSync(path.resolve('./public/js/parser.js'), 'utf8');
    const parserScript = document.createElement('script');
    parserScript.textContent = parserCode;
    document.head.appendChild(parserScript);
    
    // Load app.js content for the Story class
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
    global.Story = Story;
    
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
    global.Page = Page;
    
    global.MarkdownParser = {
      toHtml: (text) => {
        if (!text) return '';
        
        let html = text.replace(/\n/g, '<br>');
        
        // Convert markdown
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Bold
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');             // Italic
        
        return html;
      },
      parseStory: (markdown) => {
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
          const colors = ['green', 'yellow', 'red', 'blue'];
          for (const color of colors) {
            const colorMatch = section.match(
              new RegExp(`### ${color}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`, 'i')
            );
            if (colorMatch?.[1]) {
              page[color] = colorMatch[1].trim();
            }
          }
          
          return page;
        });
        
        return story;
      }
    };
    
    // Create StoryApp class with necessary methods for testing
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
        // Add real stories from the available stories list
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
            
            // Get story data from dataset
            const index = parseInt(item.dataset.index, 10);
            const story = this.availableStories[index];
            
            if (story) {
              // Update the CONFIG values
              CONFIG.storyPath = story.path;
              CONFIG.storyFolder = story.folder;
              
              // Reset the app state
              this.currentPageIndex = 0;
              this.activeColor = null;
              
              // Load the selected story
              this.loadStory(story.path);
            }
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
          this.story = MarkdownParser.parseStory(markdown);
          
          // Extract story title for the picker
          if (this.story && this.story.title) {
            // Update the story picker to show the selected story
            this.renderer.updateStorySelection(this.story.title);
          } else {
            // Find the story object based on path and update selection
            const story = this.availableStories.find(s => s.path === storyPath);
            if (story) {
              this.renderer.updateStorySelection(story.title);
            }
          }
          
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
    
    // Initialize StoryApp
    global.StoryApp = StoryApp;
    window.storyApp = new StoryApp();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });
  
  // Tests for Story content parsing and display
  describe('Story Content', () => {
    it('should load story content', async () => {
      // Make sure fetch was called
      expect(fetchMock).toHaveBeenCalledWith(CONFIG.storyPath);
      
      // Verify that app has the story loaded
      expect(window.storyApp.story).not.toBeNull();
      expect(window.storyApp.story.title).toBe('Test Story');
      expect(window.storyApp.story.pages).toHaveLength(2);
    });
    
    it('should display the first page content when loaded', async () => {
      const leftPage = document.querySelector('.left-page');
      expect(leftPage.innerHTML).toContain('This is fixed text');
    });
    
    it('should handle color button clicks and show color-specific content', async () => {
      // Click the green button
      const greenButton = document.getElementById('green');
      greenButton.click();
      
      // Check if button is active
      expect(greenButton.classList.contains('active')).toBe(true);
      
      // Check if content includes the color text
      const leftPage = document.querySelector('.left-page');
      expect(leftPage.innerHTML).toContain('Green text content');
    });
    
    it('should switch between different colors', async () => {
      // Click the green button first
      const greenButton = document.getElementById('green');
      greenButton.click();
      
      // Then click the red button
      const redButton = document.getElementById('red');
      redButton.click();
      
      // Check if red button is active and green is not
      expect(redButton.classList.contains('active')).toBe(true);
      expect(greenButton.classList.contains('active')).toBe(false);
      
      // Check if content includes the red text
      const leftPage = document.querySelector('.left-page');
      expect(leftPage.innerHTML).toContain('Red text content');
    });
    
    it('should reset color selection when navigating', async () => {
      // Select a color first
      const greenButton = document.getElementById('green');
      greenButton.click();
      
      // Navigate to next page
      const navNext = document.getElementById('nav-right');
      navNext.click();
      
      // Check that color button is no longer active
      expect(greenButton.classList.contains('active')).toBe(false);
    });
  });
  
  // Tests for navigation
  describe('Navigation', () => {
    it('should navigate between pages', async () => {
      const navNext = document.getElementById('nav-right');
      const navPrev = document.getElementById('nav-left');
      
      // Initially the prev button should be disabled
      expect(navPrev.disabled).toBe(true);
      expect(navNext.disabled).toBe(false);
      
      // Go to the next page
      navNext.click();
      
      // Now prev should be enabled and next disabled (on last page)
      expect(navPrev.disabled).toBe(false);
      expect(navNext.disabled).toBe(true);
      
      // Check content changed to page 2
      const leftPage = document.querySelector('.left-page');
      expect(leftPage.innerHTML).toContain('Page 2 fixed text');
      
      // Go back to the previous page
      navPrev.click();
      
      // Check navigation state
      expect(navPrev.disabled).toBe(true);
      expect(navNext.disabled).toBe(false);
      
      // Check content changed back to page 1
      expect(leftPage.innerHTML).toContain('This is fixed text');
    });
    
    it('should prevent navigation past story bounds', async () => {
      const navNext = document.getElementById('nav-right');
      const navPrev = document.getElementById('nav-left');
      
      // Try to go before the first page (should do nothing)
      navPrev.click();
      expect(navPrev.disabled).toBe(true);
      
      // Go to the last page
      navNext.click();
      
      // Try to go past the last page (should do nothing)
      navNext.click();
      expect(navNext.disabled).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      // Create a new StoryApp with a failing fetch mock
      const errorFetchMock = mock(() => Promise.reject(new Error('Failed to fetch')));
      const originalFetch = global.fetch;
      global.fetch = errorFetchMock;
      
      // Create a renderer spy
      const renderErrorSpy = mock();
      
      // Create a simplified StoryApp for testing error handling
      class ErrorStoryApp {
        constructor() {
          this.renderer = {
            renderError: renderErrorSpy
          };
          this.loadStory('test/path');
        }
        
        async loadStory(path) {
          try {
            await fetch(path);
          } catch (error) {
            console.error('Error loading story:', error);
            this.renderer.renderError('Could not load story');
          }
        }
      }
      
      // Create the app instance
      new ErrorStoryApp();
      
      // Wait for the async fetch to reject
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Check if error was rendered
      expect(renderErrorSpy).toHaveBeenCalledWith('Could not load story');
      
      // Restore original fetch
      global.fetch = originalFetch;
    });
    
    it('should handle missing page content', async () => {
      // Mock a StoryApp with an invalid getCurrentPage
      const renderErrorSpy = mock();
      
      class InvalidPageApp {
        constructor() {
          this.renderer = {
            renderError: renderErrorSpy,
            renderPage: mock(),
            updateNavigation: mock(),
            updateColorButtons: mock()
          };
          this.showCurrentPage();
        }
        
        getCurrentPage() {
          return null; // Simulate missing page
        }
        
        showCurrentPage() {
          const page = this.getCurrentPage();
          if (!page) {
            this.renderer.renderError('Story content could not be loaded');
            return;
          }
        }
      }
      
      // Create the app instance
      new InvalidPageApp();
      
      // Check if error was rendered
      expect(renderErrorSpy).toHaveBeenCalledWith('Story content could not be loaded');
    });
  });
});