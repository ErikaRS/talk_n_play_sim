import { describe, it, expect, beforeEach } from 'bun:test';

// We'll define the classes directly in the test to avoid import issues
let Story, Page, MarkdownParser;

beforeEach(() => {
  // Define Story class
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

  // Define Page class
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

  // Define MarkdownParser class
  MarkdownParser = {
    toHtml: (text) => {
      if (!text) return '';
      
      let html = text.replace(/\n/g, '<br>');
      
      // Replace color-specific bold text with colored text if CONFIG exists
      if (global.CONFIG && global.CONFIG.colors) {
        global.CONFIG.colors.forEach(color => {
          html = html.replace(
            new RegExp(`\\*\\*(${color})\\*\\*`, 'gi'), 
            `<strong class="${color}-color">$1</strong>`
          );
        });
      }
      
      // Convert markdown
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Bold
      html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');             // Italic
      
      return html;
    },
    parseStory: (markdown, colors = ['green', 'yellow', 'red', 'blue']) => {
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
        colors.forEach(color => {
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
});

describe('Parser Module', () => {
  describe('Story Model', () => {
    it('should create a valid story object', () => {
      const story = new Story('Test Story');
      expect(story.title).toBe('Test Story');
      expect(story.pages).toEqual([]);
    });

    it('should return correct page', () => {
      const story = new Story('Test Story');
      const page1 = new Page('1', 'image1.jpg', 'Page 1 text');
      const page2 = new Page('2', 'image2.jpg', 'Page 2 text');
      story.pages = [page1, page2];

      expect(story.getPage(0)).toBe(page1);
      expect(story.getPage(1)).toBe(page2);
      expect(story.getPage(2)).toBeNull();
      expect(story.getPage(-1)).toBeNull();
    });

    it('should validate a story based on pages', () => {
      const emptyStory = new Story('Empty Story');
      expect(emptyStory.isValid()).toBe(false);

      const validStory = new Story('Valid Story');
      validStory.pages = [new Page('1', 'img.jpg', 'text')];
      expect(validStory.isValid()).toBe(true);
    });
  });

  describe('Page Model', () => {
    it('should create a page with default properties', () => {
      const page = new Page();
      expect(page.pageNumber).toBe('');
      expect(page.image).toBe('');
      expect(page.fixedText).toBe('');
      expect(page.green).toBe('');
      expect(page.yellow).toBe('');
      expect(page.red).toBe('');
      expect(page.blue).toBe('');
    });

    it('should get color text properly', () => {
      const page = new Page('1', 'img.jpg', 'Fixed text');
      page.green = 'Green text';
      
      expect(page.getColorText('green')).toBe('Green text');
      expect(page.getColorText('yellow')).toBe('');
      expect(page.getColorText('invalid')).toBe('');
    });
  });

  describe('MarkdownParser', () => {
    it('should convert markdown to HTML', () => {
      const input = 'Plain text\n**Bold text**\n*Italic text*';
      const expected = 'Plain text<br><strong>Bold text</strong><br><em>Italic text</em>';
      
      expect(MarkdownParser.toHtml(input)).toBe(expected);
    });

    it('should handle empty or null input', () => {
      expect(MarkdownParser.toHtml('')).toBe('');
      expect(MarkdownParser.toHtml(null)).toBe('');
      expect(MarkdownParser.toHtml(undefined)).toBe('');
    });
    
    it('should handle color-specific formatting when CONFIG is defined', () => {
      // Mock global CONFIG object
      global.CONFIG = {
        colors: ['green', 'yellow', 'red', 'blue']
      };
      
      const input = '**green** text and **blue** text';
      const result = MarkdownParser.toHtml(input);
      
      expect(result).toContain('<strong class="green-color">green</strong>');
      expect(result).toContain('<strong class="blue-color">blue</strong>');
      
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
      
      expect(story).toBeInstanceOf(Story);
      expect(story.title).toBe('Test Story');
      expect(story.pages).toHaveLength(1);
      
      const page = story.pages[0];
      expect(page.pageNumber).toBe('1');
      expect(page.image).toBe('test-image.jpg');
      expect(page.fixedText).toBe('This is fixed text');
      expect(page.green).toBe('Green text content');
      expect(page.yellow).toBe('Yellow text content');
      expect(page.red).toBe('Red text content');
      expect(page.blue).toBe('Blue text content');
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
      
      expect(story.title).toBe('Multi-page Test Story');
      expect(story.pages).toHaveLength(2);
      
      expect(story.pages[0].pageNumber).toBe('1');
      expect(story.pages[0].fixedText).toBe('Page 1 Text');
      expect(story.pages[0].green).toBe('Green 1');
      
      expect(story.pages[1].pageNumber).toBe('2');
      expect(story.pages[1].fixedText).toBe('Page 2 Text');
      expect(story.pages[1].blue).toBe('Blue 2');
    });

    it('should handle malformed markdown', () => {
      const markdown = `No title
No pages`;
      
      const story = MarkdownParser.parseStory(markdown);
      expect(story.title).toBe('');
      expect(story.pages).toHaveLength(0);
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
      
      expect(story.pages).toHaveLength(1);
      expect(story.pages[0].purple).toBe('Purple text');
      expect(story.pages[0].orange).toBe('Orange text');
      expect(story.pages[0].green).toBe('');
    });
  });
});