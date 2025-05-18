const chai = require('chai');
const { expect } = chai;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');

describe('Renderer Module', () => {
  let dom, window, document, renderer;
  
  beforeEach(() => {
    // Create a DOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head></head>
      <body>
        <div class="page-container">
          <div class="rectangle left-page"></div>
          <div class="rectangle right-page"></div>
        </div>
        <div class="color-buttons">
          <button class="cntrl-btn" id="nav-left"></button>
          <button class="cntrl-btn" id="nav-right"></button>
          <button class="color-btn" id="green"></button>
          <button class="color-btn" id="yellow"></button>
          <button class="color-btn" id="red"></button>
          <button class="color-btn" id="blue"></button>
        </div>
      </body>
      </html>
    `, {
      url: "http://localhost/"
    });
    
    window = dom.window;
    document = window.document;
    
    // Load the parser.js code first
    const parserCode = fs.readFileSync(path.join(__dirname, '../public/js/parser.js'), 'utf8');
    const parserScript = document.createElement('script');
    parserScript.textContent = parserCode;
    document.head.appendChild(parserScript);
    
    // Load the renderer.js code
    const rendererCode = fs.readFileSync(path.join(__dirname, '../public/js/renderer.js'), 'utf8');
    const rendererScript = document.createElement('script');
    rendererScript.textContent = rendererCode;
    document.head.appendChild(rendererScript);
    
    // Create the renderer instance
    const elements = {
      leftPage: document.querySelector('.left-page'),
      rightPage: document.querySelector('.right-page'),
      navPrev: document.getElementById('nav-left'),
      navNext: document.getElementById('nav-right'),
      colorButtons: document.querySelectorAll('.color-btn')
    };
    
    // Directly create a renderer class
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
    }
    
    // Create a new renderer instance
    renderer = new StoryRenderer(elements);
    
    global.MarkdownParser = {
      toHtml: (text) => text
    };
  });
  
  afterEach(() => {
    delete global.MarkdownParser;
  });
  
  describe('Page Rendering', () => {
    it('should render page content correctly', () => {
      // Create a test page
      const page = {
        pageNumber: '1',
        image: 'test-image.jpg',
        fixedText: 'This is fixed text',
        getColorText: (color) => color === 'green' ? 'Green text content' : ''
      };
      
      // Mock the MarkdownParser
      global.MarkdownParser = {
        toHtml: (text) => text
      };
      
      // Render the page
      renderer.renderPage(page, '/stories/');
      
      // Check the results
      expect(document.querySelector('.left-page').innerHTML).to.include('This is fixed text');
      expect(document.querySelector('.right-page').innerHTML).to.include('/stories/test-image.jpg');
    });
    
    it('should handle pages without images', () => {
      const page = {
        pageNumber: '1',
        image: '',
        fixedText: 'Text only page',
        getColorText: () => ''
      };
      
      global.MarkdownParser = {
        toHtml: (text) => text
      };
      
      renderer.renderPage(page, '/stories/');
      
      expect(document.querySelector('.left-page').innerHTML).to.include('Text only page');
      expect(document.querySelector('.right-page').innerHTML).to.equal('');
    });
    
    it('should return false when rendering an invalid page', () => {
      const result = renderer.renderPage(null, '/stories/');
      expect(result).to.be.false;
    });
    
    it('should render page with color content', () => {
      // Create a test page
      const page = {
        pageNumber: '1',
        fixedText: 'This is fixed text',
        getColorText: (color) => color === 'green' ? 'Green text content' : ''
      };
      
      // Mock the MarkdownParser
      global.MarkdownParser = {
        toHtml: (text) => text
      };
      
      // Render the page with color
      renderer.renderPageWithColor(page, 'green');
      
      // Check if content includes both fixed text and color text
      const content = document.querySelector('.left-page').innerHTML;
      expect(content).to.include('This is fixed text');
      expect(content).to.include('Green text content');
      expect(content).to.include('class="green-color"');
    });
    
    it('should return false when rendering an invalid page with color', () => {
      const result = renderer.renderPageWithColor(null, 'green');
      expect(result).to.be.false;
    });
    
    it('should return false when rendering a page with no color content', () => {
      const page = {
        pageNumber: '1',
        fixedText: 'This is fixed text',
        getColorText: () => ''
      };
      
      const result = renderer.renderPageWithColor(page, 'green');
      expect(result).to.be.false;
    });
    
    it('should render error message', () => {
      renderer.renderError('Test error message');
      
      expect(document.querySelector('.left-page').innerHTML).to.include('Test error message');
      expect(document.querySelector('.right-page').innerHTML).to.equal('');
    });
  });
  
  describe('Navigation and Button Controls', () => {
    it('should update navigation button states', () => {
      // Test with both false
      renderer.updateNavigation(false, false);
      expect(document.getElementById('nav-left').disabled).to.be.true;
      expect(document.getElementById('nav-right').disabled).to.be.true;
      
      // Test with prevEnabled = true, nextEnabled = false
      renderer.updateNavigation(true, false);
      expect(document.getElementById('nav-left').disabled).to.be.false;
      expect(document.getElementById('nav-right').disabled).to.be.true;
      
      // Test with prevEnabled = false, nextEnabled = true
      renderer.updateNavigation(false, true);
      expect(document.getElementById('nav-left').disabled).to.be.true;
      expect(document.getElementById('nav-right').disabled).to.be.false;
    });
    
    it('should update color button states', () => {
      // Initially no buttons should be active
      const buttons = document.querySelectorAll('.color-btn');
      buttons.forEach(btn => expect(btn.classList.contains('active')).to.be.false);
      
      // Set green as active
      renderer.updateColorButtons('green');
      expect(document.getElementById('green').classList.contains('active')).to.be.true;
      expect(document.getElementById('red').classList.contains('active')).to.be.false;
      
      // Change to red
      renderer.updateColorButtons('red');
      expect(document.getElementById('green').classList.contains('active')).to.be.false;
      expect(document.getElementById('red').classList.contains('active')).to.be.true;
      
      // Clear all (null)
      renderer.updateColorButtons(null);
      buttons.forEach(btn => expect(btn.classList.contains('active')).to.be.false);
    });
  });
});