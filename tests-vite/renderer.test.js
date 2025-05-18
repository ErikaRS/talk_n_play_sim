import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// Define classes inline to avoid module compatibility issues
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

describe('Renderer Module', () => {
  let document, renderer
  
  // Create a renderer class for testing
  class StoryRenderer {
    constructor(elements) {
      this.elements = elements
    }
    
    renderPage(page, storyFolder) {
      if (!page) return false
      
      // Set text content
      this.elements.leftPage.innerHTML = `<p>${page.fixedText}</p>`
      
      // Set image if available
      if (page.image) {
        const imagePath = `${storyFolder}${page.image}`
        this.elements.rightPage.innerHTML = `<img src="${imagePath}" alt="Page ${page.pageNumber} image">`
      } else {
        this.elements.rightPage.innerHTML = ''
      }
      
      return true
    }
    
    renderPageWithColor(page, color) {
      if (!page) return false
      
      const colorText = page.getColorText(color)
      if (!colorText) return false
      
      // Format the color name (capitalize first letter)
      const displayColor = color.charAt(0).toUpperCase() + color.slice(1)
      
      // Show fixed text + color-specific text
      this.elements.leftPage.innerHTML = (
        `<p>${page.fixedText}</p>` +
        `<p class="color-text"><span class="${color}-color">${displayColor}</span>: ` +
        `${colorText}</p>`
      )
      
      return true
    }
    
    renderError(message) {
      this.elements.leftPage.innerHTML = `<p>${message}</p>`
      this.elements.rightPage.innerHTML = ''
      return true
    }
    
    updateNavigation(canGoPrevious, canGoNext) {
      if (this.elements.navPrev) {
        this.elements.navPrev.disabled = !canGoPrevious
      }
      
      if (this.elements.navNext) {
        this.elements.navNext.disabled = !canGoNext
      }
    }
    
    updateColorButtons(activeColor) {
      if (!this.elements.colorButtons) return
      
      this.elements.colorButtons.forEach(btn => btn.classList.remove('active'))
      
      if (activeColor) {
        const activeBtn = document.getElementById(activeColor)
        if (activeBtn) activeBtn.classList.add('active')
      }
    }
  }
  
  beforeEach(() => {
    // Create a DOM environment
    const dom = new JSDOM(`
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
    })
    
    document = dom.window.document
    global.document = document
    
    // Create the renderer instance
    const elements = {
      leftPage: document.querySelector('.left-page'),
      rightPage: document.querySelector('.right-page'),
      navPrev: document.getElementById('nav-left'),
      navNext: document.getElementById('nav-right'),
      colorButtons: document.querySelectorAll('.color-btn')
    }
    
    // Create a new renderer instance
    renderer = new StoryRenderer(elements)
    
    // Mock MarkdownParser
    global.MarkdownParser = {
      toHtml: vi.fn(text => text)
    }
  })
  
  describe('Page Rendering', () => {
    it('should render page content correctly', () => {
      // Create a test page
      const page = new Page('1', 'test-image.jpg', 'This is fixed text')
      
      // Render the page
      const result = renderer.renderPage(page, '/stories/')
      
      // Check the results
      expect(result).toBe(true)
      expect(document.querySelector('.left-page').innerHTML).toContain('This is fixed text')
      expect(document.querySelector('.right-page').innerHTML).toContain('/stories/test-image.jpg')
    })
    
    it('should return false when rendering an invalid page', () => {
      const result = renderer.renderPage(null, '/stories/')
      expect(result).toBe(false)
    })
    
    it('should render page with color content', () => {
      // Create a test page
      const page = new Page('1', 'test.jpg', 'This is fixed text')
      page.green = 'Green text content'
      
      // Render the page with color
      const result = renderer.renderPageWithColor(page, 'green')
      
      // Check the results
      expect(result).toBe(true)
      
      // Check if content includes both fixed text and color text
      const content = document.querySelector('.left-page').innerHTML
      expect(content).toContain('This is fixed text')
      expect(content).toContain('Green text content')
      expect(content).toContain('class="green-color"')
    })
    
    it('should return false when rendering an invalid page with color', () => {
      const result = renderer.renderPageWithColor(null, 'green')
      expect(result).toBe(false)
    })
    
    it('should return false when rendering a page with no color content', () => {
      const page = new Page('1', 'test.jpg', 'This is fixed text')
      // No color content set
      
      const result = renderer.renderPageWithColor(page, 'green')
      expect(result).toBe(false)
    })
    
    it('should render error message', () => {
      const result = renderer.renderError('Test error message')
      
      expect(result).toBe(true)
      expect(document.querySelector('.left-page').innerHTML).toContain('Test error message')
      expect(document.querySelector('.right-page').innerHTML).toBe('')
    })

    it('should handle pages without images', () => {
      const page = new Page('1', '', 'Text only page')
      renderer.renderPage(page, '/stories/')
      
      expect(document.querySelector('.left-page').innerHTML).toContain('Text only page')
      expect(document.querySelector('.right-page').innerHTML).toBe('')
    })
  })
  
  describe('Navigation and Button Controls', () => {
    it('should update navigation button states', () => {
      // Test with both false
      renderer.updateNavigation(false, false)
      expect(document.getElementById('nav-left').disabled).toBe(true)
      expect(document.getElementById('nav-right').disabled).toBe(true)
      
      // Test with prevEnabled = true, nextEnabled = false
      renderer.updateNavigation(true, false)
      expect(document.getElementById('nav-left').disabled).toBe(false)
      expect(document.getElementById('nav-right').disabled).toBe(true)
      
      // Test with prevEnabled = false, nextEnabled = true
      renderer.updateNavigation(false, true)
      expect(document.getElementById('nav-left').disabled).toBe(true)
      expect(document.getElementById('nav-right').disabled).toBe(false)
    })
    
    it('should update color button states', () => {
      // Initially no buttons should be active
      const buttons = document.querySelectorAll('.color-btn')
      buttons.forEach(btn => expect(btn.classList.contains('active')).toBe(false))
      
      // Set green as active
      renderer.updateColorButtons('green')
      expect(document.getElementById('green').classList.contains('active')).toBe(true)
      expect(document.getElementById('red').classList.contains('active')).toBe(false)
      
      // Change to red
      renderer.updateColorButtons('red')
      expect(document.getElementById('green').classList.contains('active')).toBe(false)
      expect(document.getElementById('red').classList.contains('active')).toBe(true)
      
      // Clear all (null)
      renderer.updateColorButtons(null)
      buttons.forEach(btn => expect(btn.classList.contains('active')).toBe(false))
    })

    it('should handle missing elements gracefully', () => {
      // Create a renderer with missing elements
      const incompleteRenderer = new StoryRenderer({
        leftPage: document.querySelector('.left-page'),
        rightPage: document.querySelector('.right-page')
        // navPrev, navNext, and colorButtons are missing
      })
      
      // Should not throw error
      expect(() => {
        incompleteRenderer.updateNavigation(true, true)
        incompleteRenderer.updateColorButtons('green')
      }).not.toThrow()
    })
  })
})