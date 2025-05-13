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
    
    // Load the app code
    const appCode = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
    const script = document.createElement('script');
    script.textContent = appCode;
    document.head.appendChild(script);
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
  });
});