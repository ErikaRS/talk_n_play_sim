const chai = require('chai');
const { expect } = chai;
const fs = require('fs');
const path = require('path');

// Import the Parser module
const { Story, Page, MarkdownParser } = require('../public/js/parser');

describe('Parser Module', () => {
  describe('Story Model', () => {
    it('should create a valid story object', () => {
      const story = new Story('Test Story');
      expect(story.title).to.equal('Test Story');
      expect(story.pages).to.be.an('array').that.is.empty;
    });

    it('should return correct page', () => {
      const story = new Story('Test Story');
      const page1 = new Page('1', 'image1.jpg', 'Page 1 text');
      const page2 = new Page('2', 'image2.jpg', 'Page 2 text');
      story.pages = [page1, page2];

      expect(story.getPage(0)).to.equal(page1);
      expect(story.getPage(1)).to.equal(page2);
      expect(story.getPage(2)).to.be.null;
      expect(story.getPage(-1)).to.be.null;
    });

    it('should validate a story based on pages', () => {
      const emptyStory = new Story('Empty Story');
      expect(emptyStory.isValid()).to.be.false;

      const validStory = new Story('Valid Story');
      validStory.pages = [new Page('1', 'img.jpg', 'text')];
      expect(validStory.isValid()).to.be.true;
    });
  });

  describe('Page Model', () => {
    it('should create a page with default properties', () => {
      const page = new Page();
      expect(page.pageNumber).to.equal('');
      expect(page.image).to.equal('');
      expect(page.fixedText).to.equal('');
      expect(page.green).to.equal('');
      expect(page.yellow).to.equal('');
      expect(page.red).to.equal('');
      expect(page.blue).to.equal('');
    });

    it('should get color text properly', () => {
      const page = new Page('1', 'img.jpg', 'Fixed text');
      page.green = 'Green text';
      
      expect(page.getColorText('green')).to.equal('Green text');
      expect(page.getColorText('yellow')).to.equal('');
      expect(page.getColorText('invalid')).to.equal('');
    });
  });

  describe('MarkdownParser', () => {
    it('should convert markdown to HTML', () => {
      const input = 'Plain text\n**Bold text**\n*Italic text*';
      const expected = 'Plain text<br><strong>Bold text</strong><br><em>Italic text</em>';
      
      expect(MarkdownParser.toHtml(input)).to.equal(expected);
    });

    it('should handle empty or null input', () => {
      expect(MarkdownParser.toHtml('')).to.equal('');
      expect(MarkdownParser.toHtml(null)).to.equal('');
      expect(MarkdownParser.toHtml(undefined)).to.equal('');
    });

    it('should handle color-specific formatting when CONFIG is defined', () => {
      // Set up a mock CONFIG object
      global.CONFIG = {
        colors: ['green', 'yellow', 'red', 'blue']
      };
      
      const input = '**green** text and **blue** text';
      const result = MarkdownParser.toHtml(input);
      
      expect(result).to.include('<strong class="green-color">green</strong>');
      expect(result).to.include('<strong class="blue-color">blue</strong>');
      
      // Clean up
      delete global.CONFIG;
    });

    it('should parse story markdown into a Story object', () => {
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
Yellow text content

### red
Red text content

### blue
Blue text content`;

      const story = MarkdownParser.parseStory(markdown);
      
      expect(story).to.be.instanceOf(Story);
      expect(story.title).to.equal('Test Story');
      expect(story.pages).to.have.lengthOf(1);
      
      const page = story.pages[0];
      expect(page.pageNumber).to.equal('1');
      expect(page.image).to.equal('test-image.jpg');
      expect(page.fixedText).to.equal('This is fixed text');
      expect(page.green).to.equal('Green text content');
      expect(page.yellow).to.equal('Yellow text content');
      expect(page.red).to.equal('Red text content');
      expect(page.blue).to.equal('Blue text content');
    });
    
    it('should handle stories with multiple pages', () => {
      const markdown = `# Story Title
Multi-page Test Story

## Page
1

### Image
page1.jpg

### Fixed text
Page 1 Text

### green
Green 1

## Page
2

### Image
page2.jpg

### Fixed text
Page 2 Text

### blue
Blue 2`;

      const story = MarkdownParser.parseStory(markdown);
      
      expect(story.title).to.equal('Multi-page Test Story');
      expect(story.pages).to.have.lengthOf(2);
      
      expect(story.pages[0].pageNumber).to.equal('1');
      expect(story.pages[0].fixedText).to.equal('Page 1 Text');
      expect(story.pages[0].green).to.equal('Green 1');
      
      expect(story.pages[1].pageNumber).to.equal('2');
      expect(story.pages[1].fixedText).to.equal('Page 2 Text');
      expect(story.pages[1].blue).to.equal('Blue 2');
    });
    
    it('should handle malformed markdown', () => {
      const markdown = `No title
No pages`;
      
      const story = MarkdownParser.parseStory(markdown);
      expect(story.title).to.equal('');
      expect(story.pages).to.have.lengthOf(0);
    });
    
    it('should allow custom colors array in parseStory', () => {
      const markdown = `# Story Title
Custom Colors Test

## Page
1

### Image
page1.jpg

### Fixed text
Fixed text

### purple
Purple text

### orange
Orange text`;

      const story = MarkdownParser.parseStory(markdown, ['purple', 'orange']);
      
      expect(story.pages).to.have.lengthOf(1);
      expect(story.pages[0].purple).to.equal('Purple text');
      expect(story.pages[0].orange).to.equal('Orange text');
      expect(story.pages[0].green).to.equal('');
    });
  });
});