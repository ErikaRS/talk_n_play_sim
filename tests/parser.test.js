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
  });
});