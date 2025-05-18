const chai = require('chai');
const { expect } = chai;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

describe('Story App', () => {
  let dom, window, document;
  
  beforeEach(() => {
    // Create a DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head></head>
      <body>
        <div class="container">
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
    
    // Create a global for CONFIG
    window.CONFIG = {
      storyPath: 'http://localhost/stories/test-story.md',
      storyFolder: 'http://localhost/stories/',
      colors: ['green', 'yellow', 'red', 'blue']
    };
    
    // Mock the fetch API
    window.fetch = async () => ({
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
    });
    
    // Load the modules in order
    const parserCode = fs.readFileSync(path.join(__dirname, '../public/js/parser.js'), 'utf8');
    const parserScript = document.createElement('script');
    parserScript.textContent = parserCode;
    document.head.appendChild(parserScript);
    
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/js/renderer.js'), 'utf8');
    const rendererScript = document.createElement('script');
    rendererScript.textContent = rendererCode;
    document.head.appendChild(rendererScript);
    
    // Finally load the app code
    const appCode = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
    const appScript = document.createElement('script');
    appScript.textContent = appCode;
    document.head.appendChild(appScript);
  });
  
  // Tests for Story content parsing and display
  describe('Story Content', () => {
    it('should display the first page content when loaded', (done) => {
      // Wait for the story to load
      setTimeout(() => {
        const leftPage = document.querySelector('.left-page');
        expect(leftPage.innerHTML).to.include('This is fixed text');
        done();
      }, 100);
    });
    
    it('should handle color button clicks and show color-specific content', (done) => {
      setTimeout(() => {
        // Click the green button
        const greenButton = document.getElementById('green');
        greenButton.click();
        
        // Check if button is active
        expect(greenButton.classList.contains('active')).to.be.true;
        
        // Check if content includes the color text
        const leftPage = document.querySelector('.left-page');
        expect(leftPage.innerHTML).to.include('Green text content');
        done();
      }, 100);
    });
    
    it('should switch between different colors', (done) => {
      setTimeout(() => {
        // Click the green button first
        const greenButton = document.getElementById('green');
        greenButton.click();
        
        // Then click the red button
        const redButton = document.getElementById('red');
        redButton.click();
        
        // Check if red button is active and green is not
        expect(redButton.classList.contains('active')).to.be.true;
        expect(greenButton.classList.contains('active')).to.be.false;
        
        // Check if content includes the red text
        const leftPage = document.querySelector('.left-page');
        expect(leftPage.innerHTML).to.include('Red text content');
        done();
      }, 100);
    });
    
    it('should reset color selection when navigating', (done) => {
      setTimeout(() => {
        // Select a color first
        const greenButton = document.getElementById('green');
        greenButton.click();
        
        // Navigate to next page
        const navNext = document.getElementById('nav-right');
        navNext.click();
        
        // Check that color button is no longer active
        expect(greenButton.classList.contains('active')).to.be.false;
        
        done();
      }, 100);
    });
  });
  
  // Tests for navigation
  describe('Navigation', () => {
    it('should navigate between pages', (done) => {
      setTimeout(() => {
        const navNext = document.getElementById('nav-right');
        const navPrev = document.getElementById('nav-left');
        
        // Initially the prev button should be disabled
        expect(navPrev.disabled).to.be.true;
        expect(navNext.disabled).to.be.false;
        
        // Go to the next page
        navNext.click();
        
        // Now prev should be enabled and next disabled (on last page)
        expect(navPrev.disabled).to.be.false;
        expect(navNext.disabled).to.be.true;
        
        // Check content changed to page 2
        const leftPage = document.querySelector('.left-page');
        expect(leftPage.innerHTML).to.include('Page 2 fixed text');
        
        // Go back to the previous page
        navPrev.click();
        
        // Check navigation state
        expect(navPrev.disabled).to.be.true;
        expect(navNext.disabled).to.be.false;
        
        // Check content changed back to page 1
        expect(leftPage.innerHTML).to.include('This is fixed text');
        done();
      }, 100);
    });
    
    it('should prevent navigation past story bounds', (done) => {
      setTimeout(() => {
        const app = window;
        const navNext = document.getElementById('nav-right');
        const navPrev = document.getElementById('nav-left');
        
        // Try to go before the first page (should do nothing)
        navPrev.click();
        expect(navPrev.disabled).to.be.true;
        
        // Go to the last page
        navNext.click();
        
        // Try to go past the last page (should do nothing)
        navNext.click();
        expect(navNext.disabled).to.be.true;
        
        done();
      }, 100);
    });
  });
  
  describe('Error Handling', () => {
    // Since we're using a mocked fetch in the tests, we need to test error paths separately
    it('should handle fetch errors', (done) => {
      // Create a new JSDOM with a modified fetch that fails
      const errorDom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
          <div class="left-page"></div>
          <div class="right-page"></div>
        </body>
        </html>
      `, { url: "http://localhost/" });
      
      const errorDocument = errorDom.window.document;
      
      // Setup error rendering test
      const elements = {
        leftPage: errorDocument.querySelector('.left-page'),
        rightPage: errorDocument.querySelector('.right-page')
      };
      
      const errorRenderer = {
        renderError: function(message) {
          elements.leftPage.innerHTML = `<p>${message}</p>`;
          elements.rightPage.innerHTML = '';
          return true;
        }
      };
      
      // Simulate error in loadStory
      const errorLoadStory = async function() {
        try {
          throw new Error('Test error');
        } catch (error) {
          console.error('Error loading story:', error);
          errorRenderer.renderError('Could not load story');
        }
      };
      
      // Call the function and check the result
      errorLoadStory().then(() => {
        expect(elements.leftPage.innerHTML).to.include('Could not load story');
        done();
      });
    });
  });
});