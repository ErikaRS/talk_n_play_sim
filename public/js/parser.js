// Story Data Models and Parser

/**
 * Story model that holds all pages and provides access to them
 * Represents a complete interactive story with title and multiple pages
 */
class Story {
    constructor(title = '') {
        this.title = title;
        this.pages = [];
    }
    
    /**
     * Checks if the story has at least one page
     * @returns {boolean} True if story has pages, false otherwise
     */
    hasPages() {
        return this.pages.length > 0;
    }
    
    /**
     * Retrieves a page by its index
     * @param {number} index - The zero-based index of the page
     * @returns {Page|null} The page at the specified index or null if out of bounds
     */
    getPage(index) {
        if (index < 0 || index >= this.pages.length) {
            return null;
        }
        return this.pages[index];
    }
}

/**
 * Page model representing a single page in the story
 * Contains fixed text content and color-specific text for different character paths
 */
class Page {
    constructor(pageNumber, image, fixedText) {
        this.pageNumber = pageNumber || '';
        this.image = image || '';
        this.fixedText = fixedText || '';
        
        // Color-specific text segments for different character paths
        this.green = '';
        this.yellow = '';
        this.red = '';
        this.blue = '';
    }
    
    /**
     * Retrieves text content for a specific character color
     * @param {string} color - The color identifier (green, yellow, red, blue)
     * @returns {string} The text for the specified color or empty string if not found
     */
    getColorText(color) {
        return this[color] || '';
    }
}

/**
 * Parse and format markdown text for story content
 * Provides utilities for converting markdown to HTML and parsing story structures
 */
class MarkdownParser {
    /**
     * Converts markdown text to HTML, handling special formatting
     * @param {string} text - The markdown text to convert
     * @returns {string} The HTML representation of the markdown text
     */
    static toHtml(text) {
        if (!text) {
            return '';
        }
        
        // Replace newlines with HTML line breaks
        let html = text.replace(/\n/g, '<br>');
        
        // Replace color-specific bold text with colored text
        const availableColors = typeof CONFIG !== 'undefined' && CONFIG.colors;
        if (availableColors) {
            CONFIG.colors.forEach(color => {
                const colorPattern = new RegExp(`\\*\\*(${color})\\*\\*`, 'gi');
                const colorReplacement = `<strong class="${color}-color">$1</strong>`;
                html = html.replace(colorPattern, colorReplacement);
            });
        }
        
        // Convert remaining markdown
        const boldPattern = /\*\*(.+?)\*\*/g;
        const italicPattern = /\*(.+?)\*/g;
        
        html = html.replace(boldPattern, '<strong>$1</strong>'); // Bold
        html = html.replace(italicPattern, '<em>$1</em>');       // Italic
        
        return html;
    }

    /**
     * Parses a complete story from markdown text
     * @param {string} markdown - The markdown content to parse
     * @param {Array<string>} colors - Array of color identifiers to extract
     * @returns {Story} A fully constructed Story object with pages
     */
    static parseStory(markdown, colors = ['green', 'yellow', 'red', 'blue']) {
        if (!markdown) {
            return new Story();
        }
        
        // Extract story title from markdown
        const titlePattern = /# Story Title\s*\n([^\n]+)/i;
        const titleMatch = markdown.match(titlePattern);
        const storyTitle = titleMatch?.[1]?.trim() || '';
        const story = new Story(storyTitle);
        
        // Split markdown into individual page sections
        const pageSplitPattern = /## Page\s*\n/;
        const pageSections = markdown.split(pageSplitPattern).slice(1);
        
        // Process each page section and create Page objects
        story.pages = pageSections.map(section => {
            // Extract page metadata using regex patterns
            const pageNumberPattern = /^([^\n]+)/i;
            const imagePattern = /### Image\s*\n([^\n]+)/i;
            const fixedTextPattern = /### Fixed text\s*\n([\s\S]*?)(?=\n###|\n---|$)/i;
            
            const pageNumberMatch = section.match(pageNumberPattern);
            const imageMatch = section.match(imagePattern);
            const fixedTextMatch = section.match(fixedTextPattern);
            
            // Create a new page with extracted basic information
            const page = new Page(
                pageNumberMatch?.[1]?.trim(),
                imageMatch?.[1]?.trim(),
                fixedTextMatch?.[1]?.trim()
            );
            
            // Extract color-specific content for each color
            colors.forEach(color => {
                const colorPattern = new RegExp(
                    `### ${color}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`, 'i'
                );
                const colorMatch = section.match(colorPattern);
                
                if (colorMatch?.[1]) {
                    page[color] = colorMatch[1].trim();
                }
            });
            
            return page;
        });
        
        return story;
    }
}

// Export models for environments with module support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { Story, Page, MarkdownParser };
}